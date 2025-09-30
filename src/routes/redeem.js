const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const { getRedeemService } = require('../services/redeemService');
const { getSignerService } = require('../services/signerService');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/redeem
 * Redeem C12USD tokens for fiat currency
 */
router.post('/redeem', async (req, res) => {
  try {
    const {
      userWallet,
      usdAmount,
      chainId,
      payoutMethod,
      payoutDestination,
      expectedTokenAmount
    } = req.body;

    // Validate required fields
    if (!userWallet || !usdAmount || !chainId || !payoutMethod) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['userWallet', 'usdAmount', 'chainId', 'payoutMethod']
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address format'
      });
    }

    // Validate amount
    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount'
      });
    }

    // Validate chain ID
    const validChains = [56, 137]; // BSC and Polygon
    if (!validChains.includes(parseInt(chainId))) {
      return res.status(400).json({
        error: 'Unsupported chain ID',
        supportedChains: validChains
      });
    }

    // Validate payout method
    const validPayoutMethods = ['stripe', 'cashapp'];
    if (!validPayoutMethods.includes(payoutMethod.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid payout method',
        supportedMethods: validPayoutMethods
      });
    }

    logger.info('Redeem request received', {
      userWallet,
      usdAmount: amount,
      chainId: parseInt(chainId),
      payoutMethod
    });

    // Process the redemption
    const redeemService = getRedeemService();
    const result = await redeemService.processRedemption({
      userWallet: userWallet.toLowerCase(),
      usdAmount: amount,
      chainId: parseInt(chainId),
      payoutMethod: payoutMethod.toLowerCase(),
      payoutDestination,
      expectedTokenAmount
    });

    res.json({
      success: true,
      redemptionId: result.redemptionId,
      transactionHash: result.transactionHash,
      payoutId: result.payoutId,
      estimatedProcessingTime: result.estimatedProcessingTime,
      status: result.status
    });

  } catch (error) {
    logger.error('Redeem request failed', {
      error: error.message,
      userWallet: req.body.userWallet,
      usdAmount: req.body.usdAmount
    });

    // Handle specific error types
    if (error.message.includes('Insufficient token balance')) {
      return res.status(400).json({
        error: 'Insufficient token balance',
        message: error.message
      });
    }

    if (error.message.includes('Daily limit exceeded')) {
      return res.status(429).json({
        error: 'Daily limit exceeded',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Redemption failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/redeem/:redemptionId/status
 * Get redemption status
 */
router.get('/redeem/:redemptionId/status', async (req, res) => {
  try {
    const { redemptionId } = req.params;

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId }
    });

    if (!redemption) {
      return res.status(404).json({
        error: 'Redemption not found'
      });
    }

    res.json({
      redemptionId,
      status: redemption.status,
      userWallet: redemption.userWallet,
      usdAmount: redemption.usdAmount,
      chainId: redemption.chainId,
      txHash: redemption.txHash,
      payoutId: redemption.payoutId,
      payoutStatus: redemption.payoutStatus,
      createdAt: redemption.createdAt,
      completedAt: redemption.completedAt,
      errorMessage: redemption.errorMessage
    });

  } catch (error) {
    logger.error('Failed to get redemption status', {
      redemptionId: req.params.redemptionId,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to get redemption status'
    });
  }
});

/**
 * GET /api/redeem/history/:userWallet
 * Get redemption history for a user
 */
router.get('/redeem/history/:userWallet', async (req, res) => {
  try {
    const { userWallet } = req.params;
    const { limit = 10, offset = 0, status } = req.query;

    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address format'
      });
    }

    const where = {
      userWallet: userWallet.toLowerCase()
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    const [redemptions, total] = await Promise.all([
      prisma.redemption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit), 100),
        skip: parseInt(offset),
        select: {
          id: true,
          status: true,
          usdAmount: true,
          chainId: true,
          txHash: true,
          payoutMethod: true,
          payoutStatus: true,
          createdAt: true,
          completedAt: true
        }
      }),
      prisma.redemption.count({ where })
    ]);

    res.json({
      redemptions,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + redemptions.length
      }
    });

  } catch (error) {
    logger.error('Failed to get redemption history', {
      userWallet: req.params.userWallet,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to get redemption history'
    });
  }
});

/**
 * GET /api/redeem/limits/:userWallet
 * Get redemption limits for a user
 */
router.get('/redeem/limits/:userWallet', async (req, res) => {
  try {
    const { userWallet } = req.params;

    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
      return res.status(400).json({
        error: 'Invalid wallet address format'
      });
    }

    const signerService = getSignerService();
    const redeemService = getRedeemService();

    // Get daily usage for redemptions
    const dailyUsage = await redeemService.getDailyRedemptionUsage(userWallet);

    // Get current token balances
    const balances = await redeemService.getTokenBalances(userWallet);

    res.json({
      userWallet,
      dailyLimits: {
        current: dailyUsage.currentUsage,
        limit: dailyUsage.dailyLimit,
        remaining: dailyUsage.remainingLimit
      },
      tokenBalances: balances,
      pilotLimits: signerService.getStatus().pilotLimits
    });

  } catch (error) {
    logger.error('Failed to get redemption limits', {
      userWallet: req.params.userWallet,
      error: error.message
    });

    res.status(500).json({
      error: 'Failed to get redemption limits'
    });
  }
});

/**
 * POST /api/redeem/:redemptionId/cancel
 * Cancel a pending redemption (if possible)
 */
router.post('/redeem/:redemptionId/cancel', async (req, res) => {
  try {
    const { redemptionId } = req.params;

    const redeemService = getRedeemService();
    const result = await redeemService.cancelRedemption(redemptionId);

    res.json({
      success: true,
      redemptionId,
      status: result.status,
      message: result.message
    });

  } catch (error) {
    logger.error('Failed to cancel redemption', {
      redemptionId: req.params.redemptionId,
      error: error.message
    });

    if (error.message.includes('cannot be canceled')) {
      return res.status(400).json({
        error: 'Cannot cancel redemption',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to cancel redemption'
    });
  }
});

module.exports = router;