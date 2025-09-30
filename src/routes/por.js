const express = require('express');
const { getPoRPublisher } = require('../services/porPublisher');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/por/latest
 * Get the latest proof of reserves snapshot
 */
router.get('/latest', async (req, res) => {
  try {
    const porPublisher = getPoRPublisher();
    const snapshot = await porPublisher.getLatestSnapshot();

    if (!snapshot) {
      return res.status(404).json({
        error: 'No PoR snapshots available'
      });
    }

    res.json({
      snapshot: {
        id: snapshot.id,
        totalReserves: snapshot.totalReserves,
        circulatingSupply: snapshot.circulatingSupply,
        reserveRatio: snapshot.reserveRatio,
        status: snapshot.status,
        txHash: snapshot.txHash,
        blockNumber: snapshot.blockNumber,
        createdAt: snapshot.createdAt,
        publishedAt: snapshot.publishedAt,
        reserves: snapshot.reserves
      }
    });

  } catch (error) {
    logger.error('Failed to get latest PoR snapshot:', error);
    res.status(500).json({
      error: 'Failed to retrieve PoR data'
    });
  }
});

/**
 * GET /api/por/history
 * Get PoR snapshot history
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const porPublisher = getPoRPublisher();
    const history = await porPublisher.getPoRHistory(
      Math.min(parseInt(limit), 100),
      parseInt(offset)
    );

    res.json(history);

  } catch (error) {
    logger.error('Failed to get PoR history:', error);
    res.status(500).json({
      error: 'Failed to retrieve PoR history'
    });
  }
});

/**
 * POST /api/por/update
 * Manually trigger PoR update (internal use)
 */
router.post('/update', async (req, res) => {
  try {
    // Add basic authentication or API key check here in production
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    logger.info('Manual PoR update triggered');

    const porPublisher = getPoRPublisher();
    const snapshot = await porPublisher.updateProofOfReserves();

    res.json({
      success: true,
      snapshot: {
        id: snapshot.id,
        totalReserves: snapshot.totalReserves,
        circulatingSupply: snapshot.circulatingSupply,
        reserveRatio: snapshot.reserveRatio,
        status: snapshot.status
      }
    });

  } catch (error) {
    logger.error('Manual PoR update failed:', error);
    res.status(500).json({
      error: 'PoR update failed',
      message: error.message
    });
  }
});

/**
 * GET /api/por/status
 * Get PoR service status
 */
router.get('/status', (req, res) => {
  try {
    const porPublisher = getPoRPublisher();
    const status = porPublisher.getStatus();

    res.json({
      service: 'PoR Publisher',
      ...status
    });

  } catch (error) {
    logger.error('Failed to get PoR status:', error);
    res.status(500).json({
      error: 'Failed to get PoR status'
    });
  }
});

module.exports = router;