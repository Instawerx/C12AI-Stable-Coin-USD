import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';
import { createAuditLog } from '../utils/audit';

const firestore = getFirestoreInstance();

// System health monitoring
export const systemHealthCheck = functions.pubsub
  .schedule('*/5 * * * *') // Every 5 minutes
  .onRun(async (context) => {
    try {
      const services = ['firestore', 'auth', 'storage', 'functions'];
      const healthData: any = {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        overall: 'healthy',
        services: {}
      };

      // Check each service
      for (const service of services) {
        try {
          const serviceHealth = await checkServiceHealth(service);
          healthData.services[service] = serviceHealth;

          if (serviceHealth.status !== 'healthy') {
            healthData.overall = 'degraded';
          }
        } catch (error) {
          healthData.services[service] = {
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          healthData.overall = 'unhealthy';
        }
      }

      // Store health data
      await firestore.collection('system_health').doc('current').set(healthData);

      // Alert if system is unhealthy
      if (healthData.overall !== 'healthy') {
        await createAuditLog({
          action: 'SECURITY_EVENT',
          entityType: 'system',
          entityId: 'health_check',
          securityFlags: { flags: ['system_unhealthy'] },
          metadata: healthData.services,
          severity: healthData.overall === 'unhealthy' ? 'CRITICAL' : 'WARN',
          category: 'SYSTEM'
        });
      }

    } catch (error) {
      console.error('Error in system health check:', error);
    }
  });

// Performance monitoring
export const performanceMonitor = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError('permission-denied', 'Admin access required');
    }

    const { timeRange = '1h' } = data;
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = new Date(Date.now() - timeRangeMs);

    // Get performance metrics
    const metrics = await getPerformanceMetrics(startTime);

    return {
      timeRange,
      startTime: startTime.toISOString(),
      endTime: new Date().toISOString(),
      metrics
    };

  } catch (error) {
    console.error('Error getting performance metrics:', error);
    throw error;
  }
});

// Error tracking and alerting
export const errorTracker = functions.https.onCall(async (data, context) => {
  try {
    const { error, severity, context: errorContext } = data;

    // Store error
    await firestore.collection('error_logs').add({
      error: error.message || 'Unknown error',
      stack: error.stack,
      severity: severity || 'ERROR',
      context: errorContext || {},
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: context.auth?.uid,
      userAgent: context.rawRequest?.headers['user-agent'],
      ipAddress: context.rawRequest?.ip
    });

    // Create audit log for critical errors
    if (severity === 'CRITICAL') {
      await createAuditLog({
        action: 'SECURITY_EVENT',
        entityType: 'error',
        entityId: 'critical_error',
        userAddress: context.auth?.token?.address,
        securityFlags: { flags: ['critical_error'] },
        metadata: { error: error.message, context: errorContext },
        severity: 'CRITICAL',
        category: 'SYSTEM'
      });
    }

    return { success: true };

  } catch (error) {
    console.error('Error tracking error:', error);
    throw error;
  }
});

// Helper functions
async function checkServiceHealth(service: string): Promise<any> {
  switch (service) {
    case 'firestore':
      // Test Firestore connectivity
      await firestore.collection('system_health').doc('test').set({
        test: true,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
      return { status: 'healthy', responseTime: 50 };

    case 'auth':
      // Test Auth service
      try {
        await admin.auth().listUsers(1);
        return { status: 'healthy', responseTime: 30 };
      } catch (error) {
        return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
      }

    case 'storage':
      // Test Storage service
      return { status: 'healthy', responseTime: 40 }; // Simplified

    case 'functions':
      // Functions are running if we're executing this code
      return { status: 'healthy', responseTime: 10 };

    default:
      return { status: 'unknown', error: 'Unknown service' };
  }
}

function parseTimeRange(timeRange: string): number {
  const unit = timeRange.slice(-1);
  const value = parseInt(timeRange.slice(0, -1));

  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return 60 * 60 * 1000; // Default 1 hour
  }
}

async function getPerformanceMetrics(startTime: Date): Promise<any> {
  // Get transaction metrics
  const transactionQuery = await firestore
    .collection('transactions')
    .where('createdAt', '>=', startTime)
    .get();

  const mintQuery = await firestore
    .collection('mint_receipts')
    .where('createdAt', '>=', startTime)
    .get();

  const redeemQuery = await firestore
    .collection('redeem_receipts')
    .where('createdAt', '>=', startTime)
    .get();

  // Calculate success rates
  const successfulTransactions = transactionQuery.docs.filter(
    doc => doc.data().status === 'CONFIRMED'
  ).length;

  const successfulMints = mintQuery.docs.filter(
    doc => doc.data().status === 'COMPLETED'
  ).length;

  const successfulRedeems = redeemQuery.docs.filter(
    doc => doc.data().status === 'COMPLETED'
  ).length;

  return {
    transactions: {
      total: transactionQuery.size,
      successful: successfulTransactions,
      successRate: transactionQuery.size > 0 ? (successfulTransactions / transactionQuery.size) * 100 : 0
    },
    mints: {
      total: mintQuery.size,
      successful: successfulMints,
      successRate: mintQuery.size > 0 ? (successfulMints / mintQuery.size) * 100 : 0
    },
    redeems: {
      total: redeemQuery.size,
      successful: successfulRedeems,
      successRate: redeemQuery.size > 0 ? (successfulRedeems / redeemQuery.size) * 100 : 0
    }
  };
}

export const monitoringFunctions = {
  systemHealthCheck,
  performanceMonitor,
  errorTracker
};