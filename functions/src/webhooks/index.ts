import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';
import { createAuditLog } from '../utils/audit';

const firestore = getFirestoreInstance();

// Stripe webhook handler
export const stripeWebhook = functions.https.onRequest(async (req, res): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = functions.config().stripe?.webhook_secret;

    if (!sig || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      res.status(400).send('Missing signature or webhook secret');
      return;
    }

    // Verify webhook signature (simplified)
    // In real implementation, use Stripe's webhook verification

    const event = req.body;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handleStripePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handleStripePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.status(200).send('Webhook processed');

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(400).send('Webhook error');
  }
});

// Cash App webhook handler
export const cashAppWebhook = functions.https.onRequest(async (req, res): Promise<void> => {
  try {
    const webhookSecret = functions.config().cashapp?.webhook_secret;

    if (!webhookSecret) {
      res.status(400).send('Missing webhook secret');
      return;
    }

    // Verify webhook signature (simplified)
    const event = req.body;

    switch (event.type) {
      case 'payment.completed':
        await handleCashAppPaymentSuccess(event.data);
        break;
      case 'payment.failed':
        await handleCashAppPaymentFailure(event.data);
        break;
      default:
        console.log(`Unhandled Cash App event type: ${event.type}`);
    }

    res.status(200).send('Webhook processed');

  } catch (error) {
    console.error('Error processing Cash App webhook:', error);
    res.status(400).send('Webhook error');
  }
});

// LayerZero webhook for cross-chain transfers
export const layerZeroWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const event = req.body;

    switch (event.type) {
      case 'message.sent':
        await handleLayerZeroMessageSent(event.data);
        break;
      case 'message.received':
        await handleLayerZeroMessageReceived(event.data);
        break;
      default:
        console.log(`Unhandled LayerZero event type: ${event.type}`);
    }

    res.status(200).send('Webhook processed');

  } catch (error) {
    console.error('Error processing LayerZero webhook:', error);
    res.status(400).send('Webhook error');
  }
});

// Helper functions
async function handleStripePaymentSuccess(paymentIntent: any): Promise<void> {
  const paymentId = paymentIntent.id;

  // Find corresponding mint receipt
  const mintQuery = await firestore
    .collection('mint_receipts')
    .where('paymentId', '==', paymentId)
    .get();

  if (!mintQuery.empty) {
    const mintDoc = mintQuery.docs[0];

    await mintDoc.ref.update({
      status: 'PAYMENT_RECEIVED',
      paymentHash: paymentIntent.charges?.data[0]?.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await createAuditLog({
      action: 'MINT',
      entityType: 'mint_receipt',
      entityId: mintDoc.id,
      newData: { paymentStatus: 'succeeded', paymentId },
      severity: 'INFO',
      category: 'FINANCIAL'
    });
  }
}

async function handleStripePaymentFailure(paymentIntent: any): Promise<void> {
  const paymentId = paymentIntent.id;

  const mintQuery = await firestore
    .collection('mint_receipts')
    .where('paymentId', '==', paymentId)
    .get();

  if (!mintQuery.empty) {
    const mintDoc = mintQuery.docs[0];

    await mintDoc.ref.update({
      status: 'FAILED',
      errorMessage: 'Payment failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await createAuditLog({
      action: 'MINT',
      entityType: 'mint_receipt',
      entityId: mintDoc.id,
      newData: { paymentStatus: 'failed', paymentId },
      severity: 'WARN',
      category: 'FINANCIAL'
    });
  }
}

async function handleCashAppPaymentSuccess(paymentData: any): Promise<void> {
  // Similar to Stripe handler but for Cash App
  console.log('Cash App payment success:', paymentData);
}

async function handleCashAppPaymentFailure(paymentData: any): Promise<void> {
  // Similar to Stripe handler but for Cash App
  console.log('Cash App payment failure:', paymentData);
}

async function handleLayerZeroMessageSent(messageData: any): Promise<void> {
  const { srcChain, dstChain, nonce, hash } = messageData;

  // Update cross-chain transfer status
  const transferQuery = await firestore
    .collection('cross_chain_transfers')
    .where('srcTxHash', '==', hash)
    .get();

  if (!transferQuery.empty) {
    const transferDoc = transferQuery.docs[0];

    await transferDoc.ref.update({
      status: 'IN_PROGRESS',
      lzTxHash: messageData.lzHash,
      nonce: nonce,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function handleLayerZeroMessageReceived(messageData: any): Promise<void> {
  const { srcChain, dstChain, nonce, hash } = messageData;

  const transferQuery = await firestore
    .collection('cross_chain_transfers')
    .where('nonce', '==', nonce)
    .get();

  if (!transferQuery.empty) {
    const transferDoc = transferQuery.docs[0];

    await transferDoc.ref.update({
      status: 'COMPLETED',
      dstTxHash: hash,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}

export const webhookFunctions = {
  stripeWebhook,
  cashAppWebhook,
  layerZeroWebhook
};