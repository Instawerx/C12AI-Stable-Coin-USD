import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';
import { createAuditLog, createComplianceAlert } from '../utils/audit';
import { sendNotification } from '../utils/notifications';

const firestore = getFirestoreInstance();

// Monitor user risk scores and trigger compliance checks
export const riskAssessment = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Only trigger if risk score increased significantly
    const riskIncrease = (afterData.riskScore || 0) - (beforeData.riskScore || 0);
    if (riskIncrease < 20) {
      return;
    }

    try {
      const newRiskScore = afterData.riskScore || 0;

      // Create compliance check based on risk level
      let complianceType = 'RISK_ASSESSMENT';
      let flags: string[] = [];

      if (newRiskScore > 80) {
        complianceType = 'AML';
        flags = ['high_risk', 'manual_review_required'];
      } else if (newRiskScore > 60) {
        flags = ['medium_risk', 'enhanced_monitoring'];
      }

      // Create compliance check
      await firestore.collection('compliance_checks').add({
        userId,
        type: complianceType,
        status: 'PENDING',
        riskScore: newRiskScore,
        flags: { flags },
        details: {
          trigger: 'risk_score_increase',
          previousScore: beforeData.riskScore || 0,
          newScore: newRiskScore,
          increase: riskIncrease
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Create compliance alert if high risk
      if (newRiskScore > 75) {
        await createComplianceAlert(
          userId,
          'HIGH_RISK_SCORE',
          `User risk score increased to ${newRiskScore}`,
          newRiskScore,
          flags
        );
      }

      // Suspend user if critically high risk
      if (newRiskScore > 90) {
        await firestore.collection('users').doc(userId).update({
          status: 'SUSPENDED',
          suspendedAt: admin.firestore.FieldValue.serverTimestamp(),
          suspensionReason: 'Critically high risk score'
        });

        // Notify user
        await sendNotification(userId, {
          title: 'Account Suspended',
          body: 'Your account has been temporarily suspended for review',
          type: 'account_suspended',
          priority: 'high'
        });
      }

      // Audit log
      await createAuditLog({
        action: 'COMPLIANCE_CHECK',
        entityType: 'user',
        entityId: userId,
        userAddress: afterData.address,
        riskScore: newRiskScore,
        oldData: { riskScore: beforeData.riskScore },
        newData: { riskScore: newRiskScore, flags },
        severity: newRiskScore > 80 ? 'ERROR' : 'WARN',
        category: 'COMPLIANCE'
      });

      console.log(`Risk assessment triggered for user ${userId}: ${beforeData.riskScore} -> ${newRiskScore}`);

    } catch (error) {
      console.error(`Error in risk assessment for user ${userId}:`, error);
    }
  });

// Monitor large transactions for AML compliance
export const transactionMonitoring = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snapshot, context) => {
    const transactionId = context.params.transactionId;
    const transactionData = snapshot.data();

    try {
      const { userId, amount, usdValue, type, fromAddress, toAddress } = transactionData;

      if (!userId || !usdValue) return;

      const usdAmount = parseFloat(usdValue);
      let riskScore = 0;
      const flags: string[] = [];

      // Large transaction flag
      if (usdAmount > 10000) {
        riskScore += 30;
        flags.push('large_transaction');
      }

      // Get user data for additional risk factors
      const userDoc = await firestore.collection('users').doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();

        // New user with large transaction
        const userAge = Date.now() - userData?.createdAt?.toDate().getTime();
        if (userAge < 24 * 60 * 60 * 1000 && usdAmount > 1000) { // New user (< 24 hours) with > $1000
          riskScore += 25;
          flags.push('new_user_large_transaction');
        }

        // High-risk country
        const highRiskCountries = ['AF', 'BD', 'BT', 'KH', 'CN', 'HT', 'IR', 'LA', 'MM', 'NP', 'KP', 'PK', 'LK', 'SY', 'UZ', 'VU', 'YE'];
        if (userData?.country && highRiskCountries.includes(userData.country)) {
          riskScore += 20;
          flags.push('high_risk_country');
        }
      }

      // Rapid succession of transactions
      const recentTransactions = await firestore
        .collection('transactions')
        .where('userId', '==', userId)
        .where('createdAt', '>', new Date(Date.now() - 60 * 60 * 1000)) // Last hour
        .get();

      if (recentTransactions.size > 5) {
        riskScore += 15;
        flags.push('rapid_transactions');
      }

      // Create compliance check if risk score is significant
      if (riskScore > 20 || flags.length > 0) {
        await firestore.collection('compliance_checks').add({
          userId,
          type: 'TRANSACTION_MONITORING',
          status: 'PENDING',
          riskScore,
          flags: { flags },
          details: {
            transactionId,
            amount: usdAmount,
            type,
            fromAddress,
            toAddress,
            analysisDate: new Date().toISOString()
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Update user risk score
        if (userDoc.exists) {
          const currentRiskScore = userDoc.data()?.riskScore || 0;
          const newRiskScore = Math.min(100, currentRiskScore + Math.floor(riskScore / 5));

          await firestore.collection('users').doc(userId).update({
            riskScore: newRiskScore,
            lastRiskUpdate: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        // Audit log
        await createAuditLog({
          action: 'COMPLIANCE_CHECK',
          entityType: 'transaction',
          entityId: transactionId,
          userAddress: fromAddress,
          riskScore,
          securityFlags: { flags },
          metadata: { usdAmount, type, analysisType: 'transaction_monitoring' },
          severity: riskScore > 50 ? 'WARN' : 'INFO',
          category: 'COMPLIANCE'
        });

        console.log(`Transaction monitoring flagged transaction ${transactionId} with risk score ${riskScore}`);
      }

    } catch (error) {
      console.error(`Error in transaction monitoring for ${transactionId}:`, error);
    }
  });

// Sanctions screening
export const sanctionsScreening = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { address, userId } = data;

    if (!address) {
      throw new functions.https.HttpsError('invalid-argument', 'Address required');
    }

    // Mock sanctions screening (in real implementation, integrate with OFAC/sanctions API)
    const isSanctioned = await checkSanctionsList(address);

    if (isSanctioned) {
      // Immediately blacklist the user
      if (userId) {
        await firestore.collection('users').doc(userId).update({
          isBlacklisted: true,
          blacklistedAt: admin.firestore.FieldValue.serverTimestamp(),
          blacklistReason: 'Sanctioned address detected'
        });

        // Create compliance alert
        await createComplianceAlert(
          userId,
          'SANCTIONS_HIT',
          `Address ${address} appears on sanctions list`,
          100,
          ['sanctioned', 'blocked']
        );
      }

      // Audit log
      await createAuditLog({
        action: 'SECURITY_EVENT',
        entityType: 'sanctions',
        entityId: address,
        userAddress: address,
        securityFlags: { flags: ['sanctions_hit', 'immediate_block'] },
        metadata: { address, screening_result: 'SANCTIONED' },
        severity: 'CRITICAL',
        category: 'COMPLIANCE'
      });

      throw new functions.https.HttpsError('permission-denied', 'Address appears on sanctions list');
    }

    // Create compliance record
    await firestore.collection('compliance_checks').add({
      userId: userId || null,
      type: 'SANCTIONS',
      status: 'PASSED',
      riskScore: 0,
      flags: {},
      details: {
        address,
        screeningResult: 'CLEAN',
        screeningDate: new Date().toISOString()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      passed: true,
      address,
      screeningDate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error in sanctions screening:', error);
    throw error;
  }
});

// KYC document processing
export const processKYCDocument = functions.firestore
  .document('kyc_documents/{docId}')
  .onCreate(async (snapshot, context) => {
    const docId = context.params.docId;
    const docData = snapshot.data();

    try {
      const { userId, type, storageUrl } = docData;

      // Mock document verification (in real implementation, integrate with KYC provider)
      const verificationResult = await verifyDocument(storageUrl, type);

      // Update document status
      await snapshot.ref.update({
        status: verificationResult.approved ? 'APPROVED' : 'REJECTED',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: 'automated_system',
        rejectionReason: verificationResult.approved ? null : verificationResult.reason,
        confidence: verificationResult.confidence
      });

      // Update user KYC status if all required documents are approved
      if (verificationResult.approved) {
        await updateUserKYCStatus(userId);
      }

      // Audit log
      await createAuditLog({
        action: 'KYC',
        entityType: 'kyc_document',
        entityId: docId,
        userAddress: userId,
        newData: {
          documentType: type,
          status: verificationResult.approved ? 'APPROVED' : 'REJECTED',
          confidence: verificationResult.confidence
        },
        severity: 'INFO',
        category: 'COMPLIANCE'
      });

      console.log(`KYC document ${docId} processed: ${verificationResult.approved ? 'APPROVED' : 'REJECTED'}`);

    } catch (error) {
      console.error(`Error processing KYC document ${docId}:`, error);

      // Update document with error status
      await snapshot.ref.update({
        status: 'REJECTED',
        rejectionReason: 'Processing error',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

// Helper functions
async function checkSanctionsList(address: string): Promise<boolean> {
  // Mock sanctions check - in real implementation, call OFAC API or similar
  const mockSanctionedAddresses = [
    '0x0000000000000000000000000000000000000001',
    '0x1234567890123456789012345678901234567890'
  ];

  return mockSanctionedAddresses.includes(address.toLowerCase());
}

async function verifyDocument(storageUrl: string, type: string): Promise<{
  approved: boolean;
  confidence: number;
  reason?: string;
}> {
  // Mock document verification - in real implementation, use OCR/AI service
  const confidence = Math.random() * 100;
  const approved = confidence > 70; // 70% confidence threshold

  return {
    approved,
    confidence,
    reason: approved ? undefined : 'Low confidence score in document verification'
  };
}

async function updateUserKYCStatus(userId: string): Promise<void> {
  // Check if user has all required documents approved
  const requiredDocs = ['PASSPORT', 'PROOF_OF_ADDRESS'];
  const approvedDocs = await firestore
    .collection('kyc_documents')
    .where('userId', '==', userId)
    .where('status', '==', 'APPROVED')
    .get();

  const approvedTypes = approvedDocs.docs.map(doc => doc.data().type);
  const hasAllRequired = requiredDocs.every(type => approvedTypes.includes(type));

  if (hasAllRequired) {
    await firestore.collection('users').doc(userId).update({
      kycStatus: 'APPROVED',
      kycTier: 2,
      kycApprovedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send notification
    await sendNotification(userId, {
      title: 'KYC Approved',
      body: 'Your identity verification has been approved!',
      type: 'kyc_approved'
    });
  }
}

export const complianceFunctions = {
  riskAssessment,
  transactionMonitoring,
  sanctionsScreening,
  processKYCDocument
};