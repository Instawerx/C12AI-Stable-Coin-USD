const express = require('express');
const { captureFinancialError, captureFinancialEvent, startFinancialTransaction } = require('../utils/sentry');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Test endpoints for verifying Sentry integration
 * Remove these endpoints in production!
 */

// Test basic error capture
router.get('/test-error', (req, res) => {
  try {
    throw new Error('This is a test error for Sentry verification');
  } catch (error) {
    captureFinancialError(error, {
      operation: 'test',
      endpoint: '/test-error',
      financial: true
    });

    res.json({
      message: 'Test error sent to Sentry',
      timestamp: new Date().toISOString()
    });
  }
});

// Test financial operation monitoring
router.post('/test-financial-operation', (req, res) => {
  const transaction = startFinancialTransaction('test_financial_operation', 'test');

  try {
    transaction.setTag('test_type', 'financial');
    transaction.setContext('test_data', {
      amount: 100.00,
      currency: 'USD',
      wallet: '0x1234...5678'
    });

    // Simulate some processing
    setTimeout(() => {
      captureFinancialEvent('Test financial operation completed', 'info', {
        operation: 'test_financial',
        amount: 100.00,
        success: true
      });

      transaction.setStatus('ok');
      transaction.finish();
    }, 100);

    res.json({
      message: 'Test financial operation logged to Sentry',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();

    captureFinancialError(error, {
      operation: 'test_financial',
      critical: true
    });

    res.status(500).json({ error: 'Test failed' });
  }
});

// Test performance monitoring
router.get('/test-performance', async (req, res) => {
  const transaction = startFinancialTransaction('test_performance_operation', 'performance');

  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

    transaction.setStatus('ok');
    res.json({
      message: 'Performance test completed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
});

// Test webhook error simulation
router.post('/test-webhook-error', (req, res) => {
  try {
    // Simulate webhook processing error
    const error = new Error('Webhook signature verification failed');
    error.severity = 'high';

    captureFinancialError(error, {
      operation: 'webhook',
      provider: 'TEST',
      webhook_type: 'payment.completed',
      financial: true,
      critical: true
    });

    logger.logError(error, {
      component: 'webhook-handler',
      provider: 'TEST',
      financial: true
    });

    res.json({
      message: 'Test webhook error sent to Sentry',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Test failed' });
  }
});

module.exports = router;