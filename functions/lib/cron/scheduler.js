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
exports.cronFunctions = exports.weeklyMaintenance = exports.dailyComplianceCheck = exports.updateProofOfReserves = exports.setupCronJobs = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const audit_1 = require("../utils/audit");
const notifications_1 = require("../utils/notifications");
const firestore = (0, firebase_1.getFirestoreInstance)();
const setupCronJobs = () => {
    console.log('Setting up cron jobs for C12USD functions');
};
exports.setupCronJobs = setupCronJobs;
// Update Proof of Reserves every hour
exports.updateProofOfReserves = functions.pubsub
    .schedule('0 * * * *') // Every hour
    .timeZone('UTC')
    .onRun(async (context) => {
    try {
        console.log('Starting Proof of Reserves update');
        // Get current reserve data from various sources
        const reserveData = await calculateReserves();
        // Create snapshot
        const snapshot = {
            totalUsdReserve: reserveData.totalUsdReserve,
            totalSupply: reserveData.totalSupply,
            bscSupply: reserveData.bscSupply,
            polygonSupply: reserveData.polygonSupply,
            stripeBalance: reserveData.stripeBalance,
            cashAppBalance: reserveData.cashAppBalance,
            bankBalance: reserveData.bankBalance,
            otherBalance: reserveData.otherBalance,
            treasuryBalance: reserveData.treasuryBalance,
            emergencyReserve: reserveData.emergencyReserve,
            collateralRatio: parseFloat((parseFloat(reserveData.totalUsdReserve) / parseFloat(reserveData.totalSupply)).toFixed(4)),
            isHealthy: parseFloat(reserveData.totalUsdReserve) >= parseFloat(reserveData.totalSupply),
            healthScore: calculateHealthScore(reserveData),
            auditorHash: generateAuditorHash(reserveData),
            attestationUrl: `https://por.c12usd.com/attestations/${new Date().toISOString().split('T')[0]}`,
            blockNumber: await getCurrentBlockNumber('BSC'),
            blockHash: await getCurrentBlockHash('BSC'),
            generatedBy: 'scheduled_task',
            version: '2.0',
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        await firestore.collection('reserve_snapshots').add(snapshot);
        // Check for alerts
        if (snapshot.collateralRatio < 1.0) {
            await (0, notifications_1.sendBroadcastNotification)({
                title: 'Reserve Alert',
                body: `Collateral ratio below 100%: ${(snapshot.collateralRatio * 100).toFixed(2)}%`,
                type: 'reserve_alert',
                priority: 'high'
            }, (userData) => { var _a; return userData.isAdmin || ((_a = userData.roles) === null || _a === void 0 ? void 0 : _a.includes('treasury')); });
        }
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'RESERVE_UPDATE',
            entityType: 'reserve_snapshot',
            entityId: 'scheduled_update',
            newData: snapshot,
            severity: snapshot.isHealthy ? 'INFO' : 'WARN',
            category: 'FINANCIAL'
        });
        console.log('Proof of Reserves update completed successfully');
    }
    catch (error) {
        console.error('Error updating Proof of Reserves:', error);
        await (0, audit_1.createAuditLog)({
            action: 'SECURITY_EVENT',
            entityType: 'system',
            entityId: 'por_update_failure',
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            severity: 'ERROR',
            category: 'SYSTEM'
        });
    }
});
// Daily compliance monitoring
exports.dailyComplianceCheck = functions.pubsub
    .schedule('0 2 * * *') // 2 AM UTC daily
    .timeZone('UTC')
    .onRun(async (context) => {
    try {
        console.log('Starting daily compliance check');
        // Check for users with pending KYC
        const pendingKYC = await firestore
            .collection('users')
            .where('kycStatus', '==', 'IN_PROGRESS')
            .where('createdAt', '<=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // 7 days old
            .get();
        // Send reminders for pending KYC
        for (const userDoc of pendingKYC.docs) {
            await (0, notifications_1.sendBroadcastNotification)({
                title: 'KYC Reminder',
                body: 'Please complete your identity verification to continue using C12USD',
                type: 'kyc_reminder'
            }, (userData) => userData.userId === userDoc.id);
        }
        // Check for high-risk users needing review
        const highRiskUsers = await firestore
            .collection('users')
            .where('riskScore', '>=', 75)
            .where('status', '==', 'ACTIVE')
            .get();
        if (highRiskUsers.size > 0) {
            await (0, notifications_1.sendBroadcastNotification)({
                title: 'Compliance Alert',
                body: `${highRiskUsers.size} high-risk users require review`,
                type: 'compliance_alert',
                priority: 'high'
            }, (userData) => { var _a; return userData.isAdmin || ((_a = userData.roles) === null || _a === void 0 ? void 0 : _a.includes('compliance')); });
        }
        // Check for expired sessions
        await cleanupExpiredSessions();
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'COMPLIANCE_CHECK',
            entityType: 'system',
            entityId: 'daily_check',
            metadata: {
                pendingKYC: pendingKYC.size,
                highRiskUsers: highRiskUsers.size
            },
            severity: 'INFO',
            category: 'COMPLIANCE'
        });
        console.log('Daily compliance check completed');
    }
    catch (error) {
        console.error('Error in daily compliance check:', error);
    }
});
// Weekly backup and maintenance
exports.weeklyMaintenance = functions.pubsub
    .schedule('0 1 * * 0') // 1 AM UTC every Sunday
    .timeZone('UTC')
    .onRun(async (context) => {
    try {
        console.log('Starting weekly maintenance');
        // Clean up old audit logs (keep last 90 days)
        const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const oldLogsQuery = await firestore
            .collection('audit_logs')
            .where('timestamp', '<', cutoffDate)
            .limit(1000) // Process in batches
            .get();
        if (!oldLogsQuery.empty) {
            const batch = firestore.batch();
            oldLogsQuery.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Cleaned up ${oldLogsQuery.size} old audit logs`);
        }
        // Clean up old notifications (keep last 30 days)
        const notificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const oldNotifications = await firestore
            .collection('notifications')
            .where('createdAt', '<', notificationCutoff)
            .limit(1000)
            .get();
        if (!oldNotifications.empty) {
            const batch = firestore.batch();
            oldNotifications.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Cleaned up ${oldNotifications.size} old notifications`);
        }
        // Generate weekly report
        const weeklyStats = await generateWeeklyStats();
        // Send admin summary
        await (0, notifications_1.sendBroadcastNotification)({
            title: 'Weekly System Report',
            body: `Active users: ${weeklyStats.activeUsers}, Transactions: ${weeklyStats.transactions}`,
            type: 'weekly_report',
            data: weeklyStats
        }, (userData) => userData.isAdmin);
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'SYSTEM',
            entityType: 'maintenance',
            entityId: 'weekly_maintenance',
            metadata: {
                cleanedLogs: oldLogsQuery.size,
                cleanedNotifications: oldNotifications.size,
                stats: weeklyStats
            },
            severity: 'INFO',
            category: 'SYSTEM'
        });
        console.log('Weekly maintenance completed');
    }
    catch (error) {
        console.error('Error in weekly maintenance:', error);
    }
});
// Helper functions
async function calculateReserves() {
    // Mock reserve calculation - in real implementation, query actual payment processors
    return {
        totalUsdReserve: (100000 + Math.random() * 50000).toFixed(6),
        totalSupply: (98000 + Math.random() * 48000).toFixed(18),
        bscSupply: (50000 + Math.random() * 25000).toFixed(18),
        polygonSupply: (48000 + Math.random() * 23000).toFixed(18),
        stripeBalance: (40000 + Math.random() * 20000).toFixed(6),
        cashAppBalance: (30000 + Math.random() * 15000).toFixed(6),
        bankBalance: (25000 + Math.random() * 12000).toFixed(6),
        otherBalance: (5000 + Math.random() * 3000).toFixed(6),
        treasuryBalance: (10000 + Math.random() * 5000).toFixed(6),
        emergencyReserve: (15000 + Math.random() * 7000).toFixed(6)
    };
}
function calculateHealthScore(reserveData) {
    const collateralRatio = parseFloat(reserveData.totalUsdReserve) / parseFloat(reserveData.totalSupply);
    let score = 100;
    if (collateralRatio < 1.0)
        score -= 20;
    if (collateralRatio < 0.95)
        score -= 30;
    if (collateralRatio < 0.9)
        score -= 30;
    return Math.max(0, score);
}
function generateAuditorHash(reserveData) {
    const crypto = require('crypto');
    const dataString = JSON.stringify(reserveData);
    return crypto.createHash('sha256').update(dataString).digest('hex');
}
async function getCurrentBlockNumber(chain) {
    // Mock block number - in real implementation, query blockchain
    return (18000000 + Math.floor(Math.random() * 1000000)).toString();
}
async function getCurrentBlockHash(chain) {
    const crypto = require('crypto');
    return '0x' + crypto.randomBytes(32).toString('hex');
}
async function cleanupExpiredSessions() {
    const expiredSessions = await firestore
        .collection('user_sessions')
        .where('expiresAt', '<', new Date())
        .where('isActive', '==', true)
        .get();
    if (!expiredSessions.empty) {
        const batch = firestore.batch();
        expiredSessions.docs.forEach(doc => {
            batch.update(doc.ref, {
                isActive: false,
                expiredAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();
        console.log(`Cleaned up ${expiredSessions.size} expired sessions`);
    }
}
async function generateWeeklyStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [activeUsers, newUsers, transactions, mintReceipts, redeemReceipts] = await Promise.all([
        firestore.collection('users').where('lastLoginAt', '>=', weekAgo).get(),
        firestore.collection('users').where('createdAt', '>=', weekAgo).get(),
        firestore.collection('transactions').where('createdAt', '>=', weekAgo).get(),
        firestore.collection('mint_receipts').where('createdAt', '>=', weekAgo).get(),
        firestore.collection('redeem_receipts').where('createdAt', '>=', weekAgo).get()
    ]);
    return {
        activeUsers: activeUsers.size,
        newUsers: newUsers.size,
        transactions: transactions.size,
        mintOperations: mintReceipts.size,
        redeemOperations: redeemReceipts.size,
        period: '7 days',
        generatedAt: new Date().toISOString()
    };
}
exports.cronFunctions = {
    updateProofOfReserves: exports.updateProofOfReserves,
    dailyComplianceCheck: exports.dailyComplianceCheck,
    weeklyMaintenance: exports.weeklyMaintenance
};
//# sourceMappingURL=scheduler.js.map