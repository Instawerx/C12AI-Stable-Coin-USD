import * as functions from 'firebase-functions';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export function validateEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && num <= 1000000; // Max $1M
}

export function validateChain(chain: string): boolean {
  return ['BSC', 'POLYGON', 'ETHEREUM', 'ARBITRUM'].includes(chain);
}

export async function validateTransactionData(data: any, type: 'mint' | 'redeem'): Promise<void> {
  // Basic field validation
  if (!data.userId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing userId');
  }

  if (!data.amount || !validateAmount(data.amount)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  if (!data.chain || !validateChain(data.chain)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid chain');
  }

  // Get system configuration
  const configQuery = await firestore
    .collection('system_config')
    .where('category', '==', 'limits')
    .get();

  const config: { [key: string]: any } = {};
  configQuery.docs.forEach(doc => {
    config[doc.data().key] = doc.data().value;
  });

  // Validate amount limits
  const minAmount = parseFloat(config[`MIN_${type.toUpperCase()}_AMOUNT_USD`] || '1.00');
  const maxAmount = parseFloat(config[`MAX_${type.toUpperCase()}_AMOUNT_USD`] || '10000.00');

  const amount = parseFloat(data.amount);
  if (amount < minAmount) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Minimum ${type} amount is $${minAmount}`
    );
  }

  if (amount > maxAmount) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Maximum ${type} amount is $${maxAmount}`
    );
  }

  // Check user status
  const userDoc = await firestore.collection('users').doc(data.userId).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }

  const userData = userDoc.data();
  if (userData?.isBlacklisted) {
    throw new functions.https.HttpsError('permission-denied', 'User is blacklisted');
  }

  if (userData?.status === 'SUSPENDED' || userData?.status === 'BANNED') {
    throw new functions.https.HttpsError('permission-denied', 'User account is suspended');
  }

  // Check KYC requirements if enabled
  const kycRequired = config.KYC_REQUIRED === 'true';
  if (kycRequired && userData?.kycStatus !== 'APPROVED') {
    throw new functions.https.HttpsError('permission-denied', 'KYC verification required');
  }

  // Check circuit breaker
  const circuitBreakerEnabled = config.CIRCUIT_BREAKER_ENABLED === 'true';
  if (circuitBreakerEnabled) {
    // Check system health
    const healthQuery = await firestore
      .collection('system_health')
      .where('service', '==', type === 'mint' ? 'minting' : 'redemption')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!healthQuery.empty) {
      const healthData = healthQuery.docs[0].data();
      if (healthData.status !== 'healthy') {
        throw new functions.https.HttpsError(
          'unavailable',
          `${type} service is temporarily unavailable`
        );
      }
    }
  }

  // For redeem, check if user has sufficient balance (simplified check)
  if (type === 'redeem') {
    // In a real implementation, you would check the user's token balance
    // This is a placeholder for balance verification
    console.log('TODO: Implement token balance check for redeem');
  }
}

export async function validateKYCDocument(data: any): Promise<void> {
  const requiredFields = ['userId', 'type', 'filename', 'storageUrl', 'mimeType', 'fileSize'];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new functions.https.HttpsError('invalid-argument', `Missing required field: ${field}`);
    }
  }

  // Validate document type
  const validTypes = ['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID', 'PROOF_OF_ADDRESS', 'SELFIE'];
  if (!validTypes.includes(data.type)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid document type');
  }

  // Validate file size (5MB limit)
  if (data.fileSize > 5 * 1024 * 1024) {
    throw new functions.https.HttpsError('invalid-argument', 'File size exceeds 5MB limit');
  }

  // Validate mime type
  const validMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
  ];
  if (!validMimeTypes.includes(data.mimeType)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid file type');
  }

  // Check if user exists
  const userDoc = await firestore.collection('users').doc(data.userId).get();
  if (!userDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
}

export function validateSignature(message: string, signature: string, expectedAddress: string): boolean {
  // This is a placeholder for signature validation
  // In a real implementation, you would use ethers.js to verify the signature
  console.log('TODO: Implement signature validation');
  return true; // Simplified for now
}

export async function validateTreasuryOperation(data: any): Promise<void> {
  const requiredFields = ['type', 'amount', 'description', 'requestedBy'];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new functions.https.HttpsError('invalid-argument', `Missing required field: ${field}`);
    }
  }

  // Validate operation type
  const validTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INVESTMENT', 'RESERVE_ADJUSTMENT', 'FEE_COLLECTION'];
  if (!validTypes.includes(data.type)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid operation type');
  }

  // Validate amount
  if (!validateAmount(data.amount)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  // Check if requester has admin privileges
  // This would typically check admin status in the auth token
  console.log('TODO: Implement admin privilege check');
}