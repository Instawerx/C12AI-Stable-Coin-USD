import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { initializeApp } from './config/firebase';
import { setupCronJobs } from './cron/scheduler';

// Import all function modules
import { authFunctions } from './auth';
import { transactionFunctions } from './transactions';
import { complianceFunctions } from './compliance';
import { reserveFunctions } from './reserves';
import { notificationFunctions } from './notifications';
import { webhookFunctions } from './webhooks';
import { monitoringFunctions } from './monitoring';
import { backupFunctions } from './backup';

// Initialize Firebase Admin
initializeApp();

// Setup scheduled functions
setupCronJobs();

// Export all Cloud Functions
export const auth = authFunctions;
export const transactions = transactionFunctions;
export const compliance = complianceFunctions;
export const reserves = reserveFunctions;
export const notifications = notificationFunctions;
export const webhooks = webhookFunctions;
export const monitoring = monitoringFunctions;
export const backup = backupFunctions;

// Health check endpoint
export const healthCheck = functions.https.onRequest(async (req, res) => {
  try {
    // Basic health checks
    const firestore = admin.firestore();
    await firestore.collection('system_health').doc('ping').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'healthy',
      version: '1.0.0'
    });

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        firestore: 'healthy',
        auth: 'healthy',
        functions: 'healthy'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});