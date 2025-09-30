const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');
const { processMintTransaction } = require('../services/mintService');
const { captureFinancialError, startFinancialTransaction } = require('../utils/sentry');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(payload, signature, secret) {
  const elements = signature.split(',');
  const signatureHash = elements.find(element => element.startsWith('v1='));

  if (!signatureHash) {
    throw new Error('No valid signature found');
  }

  const expectedSignature = signatureHash.split('=')[1];
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(computedSignature))) {
    throw new Error('Signature verification failed');
  }

  return true;
}

/**
 * Verify Cash App webhook signature
 */
function verifyCashAppSignature(payload, signature, secret) {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const expectedSignature = `sha256=${computedSignature}`;

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error('Cash App signature verification failed');
  }

  return true;
}

/**
 * Check if we've already processed this event (idempotency)
 */
async function isEventProcessed(provider, eventId) {
  const existing = await prisma.receipt.findFirst({
    where: {
      provider,
      providerId: eventId
    }
  });

  return !!existing;
}

/**
 * Stripe webhook handler
 */
router.post('/stripe', async (req, res) => {
  const signature = req.get('stripe-signature');

  if (!signature) {
    logger.warn('Stripe webhook missing signature header');
    return res.status(400).json({ error: 'Missing signature header' });
  }

  try {
    // Verify webhook signature
    const rawBody = req.body;
    verifyStripeSignature(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // Parse the event
    const event = JSON.parse(rawBody.toString());
    logger.logWebhook('stripe', event.type, {
      eventId: event.id,
      livemode: event.livemode
    });

    // Check for duplicate events
    if (await isEventProcessed('STRIPE', event.id)) {
      logger.info('Duplicate Stripe event ignored', { eventId: event.id });
      return res.json({ received: true, status: 'duplicate' });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(event);
        break;

      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(event);
        break;

      case 'payment_intent.canceled':
        await handleStripePaymentCanceled(event);
        break;

      default:
        logger.info('Unhandled Stripe event type', { eventType: event.type, eventId: event.id });
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Stripe webhook error:', {
      error: error.message,
      signature: signature?.substring(0, 20) + '...'
    });

    // Return 400 for signature verification failures
    if (error.message.includes('signature')) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Cash App webhook handler
 */
router.post('/cashapp', async (req, res) => {
  const signature = req.get('x-cashapp-signature');

  if (!signature) {
    logger.warn('Cash App webhook missing signature header');
    return res.status(400).json({ error: 'Missing signature header' });
  }

  try {
    // Verify webhook signature
    const rawBody = req.body;
    verifyCashAppSignature(rawBody, signature, process.env.CASHAPP_WEBHOOK_SECRET);

    // Parse the event
    const event = JSON.parse(rawBody.toString());
    logger.logWebhook('cashapp', event.type, {
      eventId: event.id,
      timestamp: event.timestamp
    });

    // Check for duplicate events
    if (await isEventProcessed('CASHAPP', event.id)) {
      logger.info('Duplicate Cash App event ignored', { eventId: event.id });
      return res.json({ received: true, status: 'duplicate' });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment.completed':
        await handleCashAppPaymentSuccess(event);
        break;

      case 'payment.failed':
        await handleCashAppPaymentFailure(event);
        break;

      case 'payment.refunded':
        await handleCashAppPaymentRefunded(event);
        break;

      default:
        logger.info('Unhandled Cash App event type', { eventType: event.type, eventId: event.id });
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Cash App webhook error:', {
      error: error.message,
      signature: signature?.substring(0, 20) + '...'
    });

    // Return 400 for signature verification failures
    if (error.message.includes('signature')) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful Stripe payment
 */
async function handleStripePaymentSuccess(event) {
  const transaction = startFinancialTransaction('stripe_payment_success', 'webhook');

  try {
    const paymentIntent = event.data.object;

    // Extract metadata
    const userWallet = paymentIntent.metadata?.wallet;
    const chainId = parseInt(paymentIntent.metadata?.chainId) || 56; // Default to BSC

    if (!userWallet) {
      const error = new Error('Stripe payment missing wallet metadata');
      error.severity = 'high';
      captureFinancialError(error, {
        operation: 'stripe_payment',
        paymentIntentId: paymentIntent.id,
        provider: 'STRIPE',
        financial: true
      });
      logger.error('Stripe payment missing wallet metadata', { paymentIntentId: paymentIntent.id });
      return;
    }

    // Calculate amounts
    const usdAmount = paymentIntent.amount / 100; // Stripe amounts are in cents
    const fees = (paymentIntent.application_fee_amount || 0) / 100;
    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        provider: 'STRIPE',
        providerId: paymentIntent.id,
        userWallet: userWallet.toLowerCase(),
        usdAmount: usdAmount,
        fees: fees,
        chainId: chainId,
        status: 'CONFIRMED',
        rawPayload: event,
        metadata: {
          currency: paymentIntent.currency,
          description: paymentIntent.description,
          customer: paymentIntent.customer
        }
      }
    });

    logger.logTransaction('stripe_payment_received', {
      receiptId: receipt.id,
      paymentIntentId: paymentIntent.id,
      userWallet,
      usdAmount,
      chainId
    });

    // Process mint transaction
    await processMintTransaction(receipt.id);

    transaction.setStatus('ok');
    transaction.finish();

  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();

    captureFinancialError(error, {
      operation: 'stripe_payment_processing',
      paymentIntentId: paymentIntent?.id,
      provider: 'STRIPE',
      amount: usdAmount,
      wallet: userWallet,
      chainId,
      financial: true,
      critical: true
    });

    logger.error('Failed to process Stripe payment', {
      paymentIntentId: paymentIntent?.id,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle failed Stripe payment
 */
async function handleStripePaymentFailure(event) {
  const paymentIntent = event.data.object;

  logger.info('Stripe payment failed', {
    paymentIntentId: paymentIntent.id,
    lastPaymentError: paymentIntent.last_payment_error
  });

  // You might want to notify the user or clean up any pending state
  // For now, we just log the failure
}

/**
 * Handle canceled Stripe payment
 */
async function handleStripePaymentCanceled(event) {
  const paymentIntent = event.data.object;

  logger.info('Stripe payment canceled', {
    paymentIntentId: paymentIntent.id,
    cancellationReason: paymentIntent.cancellation_reason
  });
}

/**
 * Handle successful Cash App payment
 */
async function handleCashAppPaymentSuccess(event) {
  const payment = event.data;

  // Extract user wallet from payment metadata or reference
  const userWallet = payment.metadata?.wallet || payment.reference_id;
  const chainId = parseInt(payment.metadata?.chainId) || 137; // Default to Polygon

  if (!userWallet) {
    logger.error('Cash App payment missing wallet metadata', { paymentId: payment.id });
    return;
  }

  // Calculate amounts (Cash App amounts are typically in dollars)
  const usdAmount = parseFloat(payment.amount);
  const fees = parseFloat(payment.fees || 0);

  try {
    // Create receipt record
    const receipt = await prisma.receipt.create({
      data: {
        provider: 'CASHAPP',
        providerId: payment.id,
        userWallet: userWallet.toLowerCase(),
        usdAmount: usdAmount,
        fees: fees,
        chainId: chainId,
        status: 'CONFIRMED',
        rawPayload: event,
        metadata: {
          reference_id: payment.reference_id,
          note: payment.note
        }
      }
    });

    logger.logTransaction('cashapp_payment_received', {
      receiptId: receipt.id,
      paymentId: payment.id,
      userWallet,
      usdAmount,
      chainId
    });

    // Process mint transaction
    await processMintTransaction(receipt.id);

  } catch (error) {
    logger.error('Failed to process Cash App payment', {
      paymentId: payment.id,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle failed Cash App payment
 */
async function handleCashAppPaymentFailure(event) {
  const payment = event.data;

  logger.info('Cash App payment failed', {
    paymentId: payment.id,
    failureReason: payment.failure_reason
  });
}

/**
 * Handle refunded Cash App payment
 */
async function handleCashAppPaymentRefunded(event) {
  const payment = event.data;

  logger.info('Cash App payment refunded', {
    paymentId: payment.id,
    refundAmount: payment.refund_amount
  });

  // You might want to handle the refund case differently
  // For example, burn corresponding tokens or mark receipt as refunded
}

module.exports = router;