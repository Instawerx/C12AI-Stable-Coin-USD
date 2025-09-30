import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';
import { createAuditLog } from '../utils/audit';
import { checkRateLimit } from '../utils/rateLimit';
import { validateTransactionData } from '../utils/validation';
import { sendNotification } from '../utils/notifications';

const firestore = getFirestoreInstance();

// Process mint request with real-time updates
export const processMintRequest = functions.firestore
  .document('mint_receipts/{receiptId}')
  .onCreate(async (snapshot, context) => {
    const receiptId = context.params.receiptId;
    const mintData = snapshot.data();

    try {
      // Validate mint request
      await validateTransactionData(mintData, 'mint');

      // Check user rate limits
      await checkRateLimit('MINT_OPERATIONS', mintData.userId, 5, 3600); // 5 per hour

      // Update status to processing
      await snapshot.ref.update({
        status: 'PAYMENT_RECEIVED',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create real-time status update
      await firestore.collection('transaction_status').doc(receiptId).set({
        receiptId,
        userId: mintData.userId,
        type: 'mint',
        status: 'processing',
        message: 'Payment received, processing mint request',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      await createAuditLog({
        action: 'MINT',
        entityType: 'mint_receipt',
        entityId: receiptId,
        userAddress: mintData.userAddress,
        newData: { status: 'PAYMENT_RECEIVED', amount: mintData.amount },
        severity: 'INFO',
        category: 'FINANCIAL'
      });

      // Send notification to user
      await sendNotification(mintData.userId, {
        title: 'Mint Request Processing',
        body: `Your mint request for $${mintData.amount} is being processed`,
        type: 'mint_processing',
        data: { receiptId, amount: mintData.amount }
      });

      console.log(`Mint request ${receiptId} processing started`);

    } catch (error) {
      console.error(`Error processing mint request ${receiptId}:`, error);

      // Update status to failed
      await snapshot.ref.update({
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update real-time status
      await firestore.collection('transaction_status').doc(receiptId).set({
        receiptId,
        userId: mintData.userId,
        type: 'mint',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Processing failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      await createAuditLog({
        action: 'MINT',
        entityType: 'mint_receipt',
        entityId: receiptId,
        userAddress: mintData.userAddress,
        newData: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'ERROR',
        category: 'FINANCIAL'
      });
    }
  });

// Process redeem request
export const processRedeemRequest = functions.firestore
  .document('redeem_receipts/{receiptId}')
  .onCreate(async (snapshot, context) => {
    const receiptId = context.params.receiptId;
    const redeemData = snapshot.data();

    try {
      // Validate redeem request
      await validateTransactionData(redeemData, 'redeem');

      // Check user rate limits
      await checkRateLimit('REDEEM_OPERATIONS', redeemData.userId, 3, 3600); // 3 per hour

      // Update status to processing
      await snapshot.ref.update({
        status: 'BURN_PENDING',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create real-time status update
      await firestore.collection('transaction_status').doc(receiptId).set({
        receiptId,
        userId: redeemData.userId,
        type: 'redeem',
        status: 'processing',
        message: 'Preparing token burn transaction',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      await createAuditLog({
        action: 'REDEEM',
        entityType: 'redeem_receipt',
        entityId: receiptId,
        userAddress: redeemData.userAddress,
        newData: { status: 'BURN_PENDING', amount: redeemData.amount },
        severity: 'INFO',
        category: 'FINANCIAL'
      });

      // Send notification
      await sendNotification(redeemData.userId, {
        title: 'Redeem Request Processing',
        body: `Your redeem request for ${redeemData.tokenAmount} C12USD is being processed`,
        type: 'redeem_processing',
        data: { receiptId, tokenAmount: redeemData.tokenAmount }
      });

      console.log(`Redeem request ${receiptId} processing started`);

    } catch (error) {
      console.error(`Error processing redeem request ${receiptId}:`, error);

      // Update status to failed
      await snapshot.ref.update({
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Processing failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Update real-time status
      await firestore.collection('transaction_status').doc(receiptId).set({
        receiptId,
        userId: redeemData.userId,
        type: 'redeem',
        status: 'failed',
        message: error instanceof Error ? error.message : 'Processing failed',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Audit log
      await createAuditLog({
        action: 'REDEEM',
        entityType: 'redeem_receipt',
        entityId: receiptId,
        userAddress: redeemData.userAddress,
        newData: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'ERROR',
        category: 'FINANCIAL'
      });
    }
  });

// Monitor transaction completion
export const monitorTransactionStatus = functions.firestore
  .document('transactions/{transactionId}')
  .onUpdate(async (change, context) => {
    const transactionId = context.params.transactionId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Only process status changes
    if (beforeData.status === afterData.status) {
      return;
    }

    try {
      const { userId, type, status, hash } = afterData;

      // Update related receipt if exists
      if (type === 'MINT' && afterData.mintReceiptId) {
        await firestore.collection('mint_receipts').doc(afterData.mintReceiptId).update({
          status: status === 'CONFIRMED' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : 'MINTING',
          txHash: hash,
          completedAt: status === 'CONFIRMED' ? admin.firestore.FieldValue.serverTimestamp() : null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      if (type === 'REDEEM' && afterData.redeemReceiptId) {
        await firestore.collection('redeem_receipts').doc(afterData.redeemReceiptId).update({
          status: status === 'CONFIRMED' ? 'BURNED' : status === 'FAILED' ? 'FAILED' : 'BURN_PENDING',
          burnTxHash: hash,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Update real-time status
      const statusDoc = await firestore.collection('transaction_status')
        .where('receiptId', '==', afterData.mintReceiptId || afterData.redeemReceiptId)
        .get();

      if (!statusDoc.empty) {
        await statusDoc.docs[0].ref.update({
          status: status.toLowerCase(),
          message: getStatusMessage(status, type),
          txHash: hash,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Send notification based on status
      if (userId) {
        let notificationData;
        if (status === 'CONFIRMED') {
          notificationData = {
            title: `${type} Completed`,
            body: `Your ${type.toLowerCase()} transaction has been confirmed`,
            type: `${type.toLowerCase()}_completed`,
            data: { transactionId, hash, status }
          };
        } else if (status === 'FAILED') {
          notificationData = {
            title: `${type} Failed`,
            body: `Your ${type.toLowerCase()} transaction has failed`,
            type: `${type.toLowerCase()}_failed`,
            data: { transactionId, hash, status, error: afterData.errorMessage }
          };
        }

        if (notificationData) {
          await sendNotification(userId, notificationData);
        }
      }

      // Audit log
      await createAuditLog({
        action: 'UPDATE',
        entityType: 'transaction',
        entityId: transactionId,
        userAddress: afterData.fromAddress,
        oldData: { status: beforeData.status },
        newData: { status: afterData.status, hash: afterData.hash },
        severity: status === 'FAILED' ? 'ERROR' : 'INFO',
        category: 'FINANCIAL'
      });

      console.log(`Transaction ${transactionId} status updated: ${beforeData.status} -> ${afterData.status}`);

    } catch (error) {
      console.error(`Error monitoring transaction ${transactionId}:`, error);

      // Audit error
      await createAuditLog({
        action: 'SECURITY_EVENT',
        entityType: 'transaction',
        entityId: transactionId,
        securityFlags: { flags: ['monitoring_error'] },
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        severity: 'ERROR',
        category: 'SYSTEM'
      });
    }
  });

// Handle cross-chain transfer updates
export const processCrossChainTransfer = functions.firestore
  .document('cross_chain_transfers/{transferId}')
  .onUpdate(async (change, context) => {
    const transferId = context.params.transferId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Only process status changes
    if (beforeData.status === afterData.status) {
      return;
    }

    try {
      const { userId, status, amount, fromChain, toChain } = afterData;

      // Update real-time status
      await firestore.collection('transaction_status').doc(`transfer_${transferId}`).set({
        transferId,
        userId,
        type: 'cross_chain_transfer',
        status: status.toLowerCase(),
        message: getCrossChainStatusMessage(status, fromChain, toChain),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Send notification for completed or failed transfers
      if (status === 'COMPLETED' || status === 'FAILED') {
        await sendNotification(userId, {
          title: status === 'COMPLETED' ? 'Cross-Chain Transfer Completed' : 'Cross-Chain Transfer Failed',
          body: status === 'COMPLETED'
            ? `${amount} C12USD transferred from ${fromChain} to ${toChain}`
            : `Transfer from ${fromChain} to ${toChain} has failed`,
          type: `cross_chain_${status.toLowerCase()}`,
          data: { transferId, amount, fromChain, toChain, status }
        });
      }

      // Audit log
      await createAuditLog({
        action: 'TRANSFER',
        entityType: 'cross_chain_transfer',
        entityId: transferId,
        userAddress: afterData.fromAddress,
        oldData: { status: beforeData.status },
        newData: { status: afterData.status, amount, fromChain, toChain },
        severity: status === 'FAILED' ? 'ERROR' : 'INFO',
        category: 'FINANCIAL'
      });

      console.log(`Cross-chain transfer ${transferId} status updated: ${beforeData.status} -> ${afterData.status}`);

    } catch (error) {
      console.error(`Error processing cross-chain transfer ${transferId}:`, error);
    }
  });

// Utility functions
function getStatusMessage(status: string, type: string): string {
  const typeText = type.toLowerCase();
  switch (status) {
    case 'PENDING':
      return `${type} transaction pending blockchain confirmation`;
    case 'CONFIRMED':
      return `${type} transaction confirmed successfully`;
    case 'FAILED':
      return `${type} transaction failed`;
    default:
      return `${type} transaction status updated`;
  }
}

function getCrossChainStatusMessage(status: string, fromChain: string, toChain: string): string {
  switch (status) {
    case 'INITIATED':
      return `Transfer initiated from ${fromChain}`;
    case 'IN_PROGRESS':
      return `Transfer in progress: ${fromChain} → ${toChain}`;
    case 'COMPLETED':
      return `Transfer completed: ${fromChain} → ${toChain}`;
    case 'FAILED':
      return `Transfer failed: ${fromChain} → ${toChain}`;
    case 'REFUNDED':
      return `Transfer refunded on ${fromChain}`;
    default:
      return `Transfer status updated: ${fromChain} → ${toChain}`;
  }
}

export const transactionFunctions = {
  processMintRequest,
  processRedeemRequest,
  monitorTransactionStatus,
  processCrossChainTransfer
};