const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');
const { metrics, ApplicationMetrics } = require('../utils/metrics');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '0.1.0',
    environment: process.env.NODE_ENV
  });
});

/**
 * Detailed readiness check including database connectivity
 */
router.get('/ready', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ready',
    checks: {}
  };

  try {
    // Database connectivity check
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    checks.checks.database = {
      status: 'healthy',
      latency: `${dbLatency}ms`
    };

    // Memory usage check
    const memUsage = process.memoryUsage();
    checks.checks.memory = {
      status: 'healthy',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    };

    // Environment check
    checks.checks.environment = {
      status: 'healthy',
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version
    };

    // Service uptime
    checks.checks.uptime = {
      status: 'healthy',
      uptime: Math.floor(process.uptime()),
      startTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
    };

    res.json(checks);

  } catch (error) {
    logger.error('Readiness check failed:', error);

    checks.status = 'unhealthy';
    checks.checks.database = {
      status: 'unhealthy',
      error: error.message
    };

    res.status(503).json(checks);
  }
});

/**
 * Comprehensive metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const startTime = Date.now();

    // Get basic database metrics
    const receiptCount = await prisma.receipt.count();
    const redemptionCount = await prisma.redemption.count();

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentReceipts = await prisma.receipt.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    const recentRedemptions = await prisma.redemption.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    // Calculate total volume
    const totalMintVolume = await prisma.receipt.aggregate({
      _sum: {
        usdAmount: true
      },
      where: {
        status: 'MINTED'
      }
    });

    const totalRedeemVolume = await prisma.redemption.aggregate({
      _sum: {
        usdAmount: true
      },
      where: {
        status: 'COMPLETED'
      }
    });

    // Get application metrics
    const appMetrics = metrics.getMetrics();

    // Record database query performance
    const queryDuration = Date.now() - startTime;
    ApplicationMetrics.databaseQuery('metrics_aggregate', queryDuration);

    const combinedMetrics = {
      timestamp: new Date().toISOString(),
      database: {
        total_receipts: receiptCount,
        total_redemptions: redemptionCount,
        receipts_24h: recentReceipts,
        redemptions_24h: recentRedemptions,
        total_mint_usd: totalMintVolume._sum.usdAmount || 0,
        total_redeem_usd: totalRedeemVolume._sum.usdAmount || 0,
        query_duration_ms: queryDuration
      },
      system: {
        uptime_seconds: Math.floor(process.uptime()),
        memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        node_version: process.version,
        environment: process.env.NODE_ENV
      },
      application: appMetrics
    };

    res.json(combinedMetrics);

  } catch (error) {
    logger.logError(error, { component: 'metrics-endpoint' }, req.correlationId);
    res.status(500).json({
      error: 'Failed to generate metrics',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Prometheus-style metrics endpoint
 */
router.get('/metrics/prometheus', async (req, res) => {
  try {
    const appMetrics = metrics.getMetrics();
    let output = '';

    // Convert metrics to Prometheus format
    output += '# HELP c12usd_uptime_seconds Total uptime of the service\n';
    output += '# TYPE c12usd_uptime_seconds gauge\n';
    output += `c12usd_uptime_seconds ${Math.floor(process.uptime())}\n`;

    output += '# HELP c12usd_memory_heap_used_bytes Current heap memory usage\n';
    output += '# TYPE c12usd_memory_heap_used_bytes gauge\n';
    output += `c12usd_memory_heap_used_bytes ${process.memoryUsage().heapUsed}\n`;

    // Add application counters
    for (const [metricName, value] of Object.entries(appMetrics.counters)) {
      const name = metricName.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# HELP c12usd_${name} Application counter\n`;
      output += `# TYPE c12usd_${name} counter\n`;
      output += `c12usd_${name} ${value}\n`;
    }

    // Add application gauges
    for (const [metricName, data] of Object.entries(appMetrics.gauges)) {
      const name = metricName.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# HELP c12usd_${name} Application gauge\n`;
      output += `# TYPE c12usd_${name} gauge\n`;
      output += `c12usd_${name} ${data.value}\n`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(output);

  } catch (error) {
    logger.logError(error, { component: 'prometheus-metrics' }, req.correlationId);
    res.status(500).send('# Error generating metrics');
  }
});

module.exports = router;