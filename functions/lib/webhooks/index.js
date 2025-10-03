"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookFunctions = exports.layerZeroWebhook = exports.cashAppWebhook = exports.stripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const audit_1 = require("../utils/audit");
const firestore = (0, firebase_1.getFirestoreInstance)();
// Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        const sig = req.headers['stripe-signature'];
        const webhookSecret = (_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.webhook_secret;
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
    }
    catch (error) {
        console.error('Error processing Stripe webhook:', error);
        res.status(400).send('Webhook error');
    }
});
// Cash App webhook handler
exports.cashAppWebhook = functions.https.onRequest(async (req, res) => {
    var _a;
    try {
        const webhookSecret = (_a = functions.config().cashapp) === null || _a === void 0 ? void 0 : _a.webhook_secret;
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
    }
    catch (error) {
        console.error('Error processing Cash App webhook:', error);
        res.status(400).send('Webhook error');
    }
});
// LayerZero webhook for cross-chain transfers
exports.layerZeroWebhook = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        console.error('Error processing LayerZero webhook:', error);
        res.status(400).send('Webhook error');
    }
});
// Helper functions
async function handleStripePaymentSuccess(paymentIntent) {
    var _a, _b;
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
            paymentHash: (_b = (_a = paymentIntent.charges) === null || _a === void 0 ? void 0 : _a.data[0]) === null || _b === void 0 ? void 0 : _b.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await (0, audit_1.createAuditLog)({
            action: 'MINT',
            entityType: 'mint_receipt',
            entityId: mintDoc.id,
            newData: { paymentStatus: 'succeeded', paymentId },
            severity: 'INFO',
            category: 'FINANCIAL'
        });
    }
}
async function handleStripePaymentFailure(paymentIntent) {
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
        await (0, audit_1.createAuditLog)({
            action: 'MINT',
            entityType: 'mint_receipt',
            entityId: mintDoc.id,
            newData: { paymentStatus: 'failed', paymentId },
            severity: 'WARN',
            category: 'FINANCIAL'
        });
    }
}
async function handleCashAppPaymentSuccess(paymentData) {
    // Similar to Stripe handler but for Cash App
    console.log('Cash App payment success:', paymentData);
}
async function handleCashAppPaymentFailure(paymentData) {
    // Similar to Stripe handler but for Cash App
    console.log('Cash App payment failure:', paymentData);
}
async function handleLayerZeroMessageSent(messageData) {
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
async function handleLayerZeroMessageReceived(messageData) {
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
exports.webhookFunctions = {
    stripeWebhook: exports.stripeWebhook,
    cashAppWebhook: exports.cashAppWebhook,
    layerZeroWebhook: exports.layerZeroWebhook
};
//# sourceMappingURL=index.js.map