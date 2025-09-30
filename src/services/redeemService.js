const { ethers } = require('ethers');
const { PrismaClient } = require('../../generated/prisma');
const { getSignerService } = require('./signerService');
const { getMintService } = require('./mintService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Redeem Service
 *
 * Handles the process of burning tokens on-chain and initiating fiat payouts
 */
class RedeemService {
  constructor() {
    this.providers = new Map();
    this.gatewayContracts = new Map();
    this.tokenContracts = new Map();
    this.signerService = getSignerService();
    this.mintService = getMintService();

    // Initialize blockchain providers and contracts
    this.initializeContracts();

    // Pilot limits for redemptions
    this.pilotDailyRedeemLimit = parseFloat(process.env.PILOT_DAILY_MINT_LIMIT) || 10000; // Same as mint limit
    this.pilotPerTxRedeemLimit = parseFloat(process.env.PILOT_PER_TX_LIMIT) || 1000;
  }

  /**
   * Initialize blockchain contracts
   */
  initializeContracts() {
    // Reuse providers from mint service
    this.providers = this.mintService.providers;
    this.gatewayContracts = this.mintService.gatewayContracts;

    // Initialize token contracts for balance checking
    if (process.env.BSC_TOKEN_ADDRESS) {
      const tokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ];

      const bscProvider = this.providers.get(56);
      if (bscProvider) {
        const bscToken = new ethers.Contract(
          process.env.BSC_TOKEN_ADDRESS,
          tokenAbi,
          bscProvider
        );
        this.tokenContracts.set(56, bscToken);
      }
    }

    if (process.env.POLYGON_TOKEN_ADDRESS) {
      const tokenAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function transfer(address to, uint256 amount) returns (bool)',
        'event Transfer(address indexed from, address indexed to, uint256 value)'
      ];

      const polygonProvider = this.providers.get(137);
      if (polygonProvider) {
        const polygonToken = new ethers.Contract(
          process.env.POLYGON_TOKEN_ADDRESS,
          tokenAbi,
          polygonProvider
        );
        this.tokenContracts.set(137, polygonToken);
      }
    }
  }

  /**
   * Get token balance for a user on a specific chain
   */
  async getTokenBalance(userWallet, chainId) {
    const tokenContract = this.tokenContracts.get(chainId);
    if (!tokenContract) {
      throw new Error(`No token contract configured for chain ID: ${chainId}`);
    }

    const balance = await tokenContract.balanceOf(userWallet);
    return ethers.utils.formatEther(balance);
  }

  /**
   * Get token balances across all chains
   */
  async getTokenBalances(userWallet) {
    const balances = {};

    for (const [chainId, contract] of this.tokenContracts.entries()) {
      try {
        const balance = await contract.balanceOf(userWallet);
        balances[chainId] = {
          balance: ethers.utils.formatEther(balance),
          symbol: 'C12USD'
        };
      } catch (error) {
        logger.error(`Failed to get balance for chain ${chainId}`, {
          userWallet,
          error: error.message
        });
        balances[chainId] = {
          balance: '0',
          error: error.message
        };
      }
    }

    return balances;
  }

  /**
   * Check redemption limits for pilot phase
   */
  async checkRedemptionLimits(userWallet, usdAmount) {
    // Check per-transaction limit
    if (usdAmount > this.pilotPerTxRedeemLimit) {
      throw new Error(`Redemption amount $${usdAmount} exceeds per-transaction limit of $${this.pilotPerTxRedeemLimit}`);
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await prisma.redemption.aggregate({
      _sum: {
        usdAmount: true
      },
      where: {
        userWallet: userWallet.toLowerCase(),
        status: {
          in: ['PROCESSING', 'COMPLETED']
        },
        createdAt: {
          gte: today
        }
      }
    });

    const currentDailyUsage = dailyUsage._sum.usdAmount || 0;
    const newDailyUsage = currentDailyUsage + usdAmount;

    if (newDailyUsage > this.pilotDailyRedeemLimit) {
      throw new Error(
        `Daily redemption limit exceeded. Current usage: $${currentDailyUsage}, ` +
        `attempting to add: $${usdAmount}, daily limit: $${this.pilotDailyRedeemLimit}`
      );
    }

    return {
      currentDailyUsage,
      newDailyUsage,
      remainingDailyLimit: this.pilotDailyRedeemLimit - newDailyUsage
    };
  }

  /**
   * Process a redemption request
   */
  async processRedemption({
    userWallet,
    usdAmount,
    chainId,
    payoutMethod,
    payoutDestination,
    expectedTokenAmount
  }) {
    try {
      logger.info('Processing redemption request', {
        userWallet,
        usdAmount,
        chainId,
        payoutMethod
      });

      // Check redemption limits
      const limitCheck = await this.checkRedemptionLimits(userWallet, usdAmount);

      // Check user's token balance
      const tokenBalance = parseFloat(await this.getTokenBalance(userWallet, chainId));
      if (tokenBalance < usdAmount) {
        throw new Error(
          `Insufficient token balance. Required: ${usdAmount} C12USD, Available: ${tokenBalance} C12USD`
        );
      }

      // Create redemption record
      const redemption = await prisma.redemption.create({
        data: {
          userWallet: userWallet.toLowerCase(),
          usdAmount,
          chainId,
          payoutMethod: payoutMethod.toUpperCase(),
          payoutDestination,
          status: 'PENDING',
          expectedTokenAmount: expectedTokenAmount || ethers.utils.parseEther(usdAmount.toString()).toString()
        }
      });

      logger.info('Redemption record created', {
        redemptionId: redemption.id,
        userWallet,
        usdAmount
      });

      // Execute the redemption process
      const result = await this.executeRedemption(redemption.id);

      return {
        redemptionId: redemption.id,
        transactionHash: result.transactionHash,
        payoutId: result.payoutId,
        estimatedProcessingTime: '5-10 minutes',
        status: result.status,
        limitCheck
      };

    } catch (error) {
      logger.error('Redemption processing failed', {
        userWallet,
        usdAmount,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute the redemption (burn tokens and initiate payout)
   */
  async executeRedemption(redemptionId) {
    try {
      const redemption = await prisma.redemption.findUnique({
        where: { id: redemptionId }
      });

      if (!redemption) {
        throw new Error(`Redemption not found: ${redemptionId}`);
      }

      // Update status to processing
      await prisma.redemption.update({
        where: { id: redemptionId },
        data: { status: 'PROCESSING' }
      });

      // Step 1: Burn tokens on-chain
      const burnResult = await this.burnTokensOnChain(redemption);

      // Update with burn transaction details
      await prisma.redemption.update({
        where: { id: redemptionId },
        data: {
          txHash: burnResult.transactionHash,
          nonce: burnResult.nonce,
          signatureData: burnResult.signatureData
        }
      });

      // Step 2: Initiate fiat payout
      const payoutResult = await this.initiateFiatPayout(redemption);

      // Update with payout details
      await prisma.redemption.update({
        where: { id: redemptionId },
        data: {
          status: 'COMPLETED',
          payoutId: payoutResult.payoutId,
          payoutStatus: payoutResult.status,
          completedAt: new Date()
        }
      });

      logger.logTransaction('redeem_completed', {
        redemptionId,
        txHash: burnResult.transactionHash,
        payoutId: payoutResult.payoutId,
        userWallet: redemption.userWallet,
        usdAmount: redemption.usdAmount,
        chainId: redemption.chainId
      });

      return {
        transactionHash: burnResult.transactionHash,
        payoutId: payoutResult.payoutId,
        status: 'COMPLETED'
      };

    } catch (error) {
      logger.error('Redemption execution failed', {
        redemptionId,
        error: error.message
      });

      // Update redemption status to failed
      await prisma.redemption.update({
        where: { id: redemptionId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          failedAt: new Date()
        }
      }).catch(dbError => {
        logger.error('Failed to update redemption status', {
          redemptionId,
          dbError: dbError.message
        });
      });

      throw error;
    }
  }

  /**
   * Burn tokens on-chain
   */
  async burnTokensOnChain(redemption) {
    const gateway = this.mintService.getGateway(redemption.chainId);
    const provider = this.mintService.getProvider(redemption.chainId);

    // Generate nonce and expiry time
    const nonce = this.signerService.generateNonce();
    const expiryTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now

    // Sign the redeem operation
    const signatureData = await this.signerService.signRedeemOperation(
      redemption.chainId,
      gateway.address,
      redemption.userWallet,
      redemption.usdAmount,
      nonce,
      expiryTime
    );

    // Create wallet with provider for transaction signing
    const signerWallet = new ethers.Wallet(
      this.signerService.privateKey.startsWith('0x') ?
        this.signerService.privateKey :
        `0x${this.signerService.privateKey}`,
      provider
    );

    // Create gateway contract instance with signer
    const gatewayWithSigner = gateway.contract.connect(signerWallet);

    // Execute the redeem transaction
    const tx = await gatewayWithSigner.executeRedeem(
      redemption.userWallet,
      signatureData.tokenAmount,
      signatureData.nonce,
      signatureData.expiryTime,
      signatureData.redeemRef,
      signatureData.signature
    );

    logger.info('Redeem transaction submitted', {
      chainId: redemption.chainId,
      txHash: tx.hash,
      userWallet: redemption.userWallet
    });

    // Wait for confirmation
    const receipt = await tx.wait(1);

    logger.info('Redeem transaction confirmed', {
      chainId: redemption.chainId,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

    return {
      transactionHash: tx.hash,
      nonce,
      signatureData,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  /**
   * Initiate fiat payout via payment processor
   */
  async initiateFiatPayout(redemption) {
    const payoutMethod = redemption.payoutMethod.toLowerCase();

    switch (payoutMethod) {
      case 'stripe':
        return this.initiateStripePayout(redemption);
      case 'cashapp':
        return this.initiateCashAppPayout(redemption);
      default:
        throw new Error(`Unsupported payout method: ${payoutMethod}`);
    }
  }

  /**
   * Initiate Stripe payout (placeholder implementation)
   */
  async initiateStripePayout(redemption) {
    // This would integrate with Stripe's Connect platform or bank transfers
    // For now, return a mock response

    logger.info('Initiating Stripe payout', {
      redemptionId: redemption.id,
      usdAmount: redemption.usdAmount,
      destination: redemption.payoutDestination
    });

    // Mock Stripe payout ID
    const payoutId = `po_stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would:
    // 1. Create a Stripe transfer or payout
    // 2. Handle webhooks for payout status updates
    // 3. Update the redemption status accordingly

    return {
      payoutId,
      status: 'PROCESSING',
      estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
    };
  }

  /**
   * Initiate Cash App payout (placeholder implementation)
   */
  async initiateCashAppPayout(redemption) {
    logger.info('Initiating Cash App payout', {
      redemptionId: redemption.id,
      usdAmount: redemption.usdAmount,
      destination: redemption.payoutDestination
    });

    // Mock Cash App payout ID
    const payoutId = `ca_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // In a real implementation, you would integrate with Cash App's API

    return {
      payoutId,
      status: 'PROCESSING',
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
    };
  }

  /**
   * Get daily redemption usage for a user
   */
  async getDailyRedemptionUsage(userWallet) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await prisma.redemption.aggregate({
      _sum: {
        usdAmount: true
      },
      where: {
        userWallet: userWallet.toLowerCase(),
        status: {
          in: ['PROCESSING', 'COMPLETED']
        },
        createdAt: {
          gte: today
        }
      }
    });

    const currentUsage = dailyUsage._sum.usdAmount || 0;

    return {
      currentUsage,
      dailyLimit: this.pilotDailyRedeemLimit,
      remainingLimit: this.pilotDailyRedeemLimit - currentUsage,
      date: today.toISOString().split('T')[0]
    };
  }

  /**
   * Cancel a redemption (if possible)
   */
  async cancelRedemption(redemptionId) {
    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId }
    });

    if (!redemption) {
      throw new Error('Redemption not found');
    }

    // Can only cancel pending redemptions
    if (redemption.status !== 'PENDING') {
      throw new Error(`Redemption with status ${redemption.status} cannot be canceled`);
    }

    await prisma.redemption.update({
      where: { id: redemptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date()
      }
    });

    logger.info('Redemption canceled', { redemptionId });

    return {
      status: 'CANCELED',
      message: 'Redemption has been canceled successfully'
    };
  }

  /**
   * Get redemption service status
   */
  async getStatus() {
    const stats = await prisma.redemption.groupBy({
      by: ['status', 'chainId'],
      _count: true
    });

    const recentRedemptions = await prisma.redemption.count({
      where: {
        status: 'COMPLETED',
        completedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return {
      providers: Array.from(this.providers.keys()),
      gateways: Array.from(this.gatewayContracts.keys()),
      tokens: Array.from(this.tokenContracts.keys()),
      statistics: stats,
      recentRedemptions24h: recentRedemptions,
      pilotLimits: {
        dailyLimit: this.pilotDailyRedeemLimit,
        perTransactionLimit: this.pilotPerTxRedeemLimit
      }
    };
  }
}

// Create singleton instance
let redeemServiceInstance = null;

function getRedeemService() {
  if (!redeemServiceInstance) {
    redeemServiceInstance = new RedeemService();
  }
  return redeemServiceInstance;
}

module.exports = {
  RedeemService,
  getRedeemService
};