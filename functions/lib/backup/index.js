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
exports.backupFunctions = exports.restoreFromBackup = exports.createManualBackup = exports.dailyBackup = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const audit_1 = require("../utils/audit");
const firestore = (0, firebase_1.getFirestoreInstance)();
const storage = (0, firebase_1.getStorageInstance)();
// Daily database backup
exports.dailyBackup = functions.pubsub
    .schedule('0 3 * * *') // 3 AM UTC daily
    .timeZone('UTC')
    .onRun(async (context) => {
    try {
        console.log('Starting daily backup');
        const backupId = `backup-${new Date().toISOString().split('T')[0]}`;
        const bucket = storage.bucket();
        // Collections to backup
        const collections = [
            'users',
            'mint_receipts',
            'redeem_receipts',
            'transactions',
            'treasury_operations',
            'compliance_checks',
            'reserve_snapshots',
            'system_config'
        ];
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            collections: {}
        };
        // Backup each collection
        for (const collectionName of collections) {
            console.log(`Backing up collection: ${collectionName}`);
            const collectionRef = firestore.collection(collectionName);
            const snapshot = await collectionRef.get();
            const documents = [];
            snapshot.docs.forEach(doc => {
                documents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            backupData.collections[collectionName] = {
                count: documents.length,
                documents
            };
        }
        // Save backup to Cloud Storage
        const backupFile = bucket.file(`backups/${backupId}.json`);
        await backupFile.save(JSON.stringify(backupData, null, 2), {
            metadata: {
                contentType: 'application/json',
                customMetadata: {
                    backupType: 'daily',
                    version: '1.0',
                    collections: collections.join(',')
                }
            }
        });
        // Create backup record
        await firestore.collection('backup_logs').add({
            backupId,
            type: 'daily',
            status: 'completed',
            collectionsCount: collections.length,
            totalDocuments: Object.values(backupData.collections).reduce((sum, col) => sum + col.count, 0),
            storageUrl: `gs://${bucket.name}/backups/${backupId}.json`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Clean up old backups (keep last 30 days)
        await cleanupOldBackups(30);
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'BACKUP',
            entityType: 'system',
            entityId: backupId,
            metadata: {
                type: 'daily',
                collections: collections.length,
                totalDocuments: Object.values(backupData.collections).reduce((sum, col) => sum + col.count, 0)
            },
            severity: 'INFO',
            category: 'SYSTEM'
        });
        console.log(`Daily backup completed: ${backupId}`);
    }
    catch (error) {
        console.error('Error in daily backup:', error);
        // Log backup failure
        await firestore.collection('backup_logs').add({
            type: 'daily',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await (0, audit_1.createAuditLog)({
            action: 'BACKUP',
            entityType: 'system',
            entityId: 'backup_failure',
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            severity: 'ERROR',
            category: 'SYSTEM'
        });
    }
});
// Manual backup function for admins
exports.createManualBackup = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth || !context.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { collections: requestedCollections, description } = data;
        const backupId = `manual-backup-${Date.now()}`;
        // Default to all collections if none specified
        const collections = requestedCollections || [
            'users',
            'mint_receipts',
            'redeem_receipts',
            'transactions',
            'treasury_operations',
            'compliance_checks',
            'reserve_snapshots',
            'system_config'
        ];
        const bucket = storage.bucket();
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            type: 'manual',
            description: description || 'Manual backup',
            requestedBy: context.auth.uid,
            collections: {}
        };
        // Backup requested collections
        for (const collectionName of collections) {
            const collectionRef = firestore.collection(collectionName);
            const snapshot = await collectionRef.get();
            const documents = [];
            snapshot.docs.forEach(doc => {
                documents.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            backupData.collections[collectionName] = {
                count: documents.length,
                documents
            };
        }
        // Save backup
        const backupFile = bucket.file(`backups/${backupId}.json`);
        await backupFile.save(JSON.stringify(backupData, null, 2), {
            metadata: {
                contentType: 'application/json',
                customMetadata: {
                    backupType: 'manual',
                    requestedBy: context.auth.uid,
                    description: description || 'Manual backup'
                }
            }
        });
        // Create backup record
        await firestore.collection('backup_logs').add({
            backupId,
            type: 'manual',
            status: 'completed',
            description: description || 'Manual backup',
            requestedBy: context.auth.uid,
            collectionsCount: collections.length,
            totalDocuments: Object.values(backupData.collections).reduce((sum, col) => sum + col.count, 0),
            storageUrl: `gs://${bucket.name}/backups/${backupId}.json`,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Audit log
        await (0, audit_1.createAuditLog)({
            action: 'BACKUP',
            entityType: 'system',
            entityId: backupId,
            adminAddress: context.auth.token.address,
            metadata: {
                type: 'manual',
                description,
                collections: collections.length
            },
            severity: 'INFO',
            category: 'ADMIN_ACTION'
        });
        return {
            success: true,
            backupId,
            collections: collections.length,
            totalDocuments: Object.values(backupData.collections).reduce((sum, col) => sum + col.count, 0)
        };
    }
    catch (error) {
        console.error('Error creating manual backup:', error);
        throw error;
    }
});
// Restore from backup (emergency use only)
exports.restoreFromBackup = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth || !context.auth.token.admin) {
            throw new functions.https.HttpsError('permission-denied', 'Admin access required');
        }
        const { backupId, collections: targetCollections, confirmRestore } = data;
        if (!confirmRestore) {
            throw new functions.https.HttpsError('invalid-argument', 'Restore operation must be explicitly confirmed');
        }
        console.log(`Starting restore from backup: ${backupId}`);
        // Get backup file
        const bucket = storage.bucket();
        const backupFile = bucket.file(`backups/${backupId}.json`);
        const [exists] = await backupFile.exists();
        if (!exists) {
            throw new functions.https.HttpsError('not-found', 'Backup file not found');
        }
        // Download and parse backup
        const [backupContent] = await backupFile.download();
        const backupData = JSON.parse(backupContent.toString());
        const restoreId = `restore-${Date.now()}`;
        const restoredCollections = [];
        // Restore collections
        for (const [collectionName, collectionData] of Object.entries(backupData.collections)) {
            if (targetCollections && !targetCollections.includes(collectionName)) {
                continue;
            }
            console.log(`Restoring collection: ${collectionName}`);
            const collectionRef = firestore.collection(collectionName);
            const batch = firestore.batch();
            // Clear existing documents (if specified)
            const existingDocs = await collectionRef.get();
            existingDocs.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Restore documents
            const documents = collectionData.documents;
            documents.forEach((doc) => {
                const docRef = collectionRef.doc(doc.id);
                batch.set(docRef, doc.data);
            });
            await batch.commit();
            restoredCollections.push(collectionName);
        }
        // Create restore record
        await firestore.collection('restore_logs').add({
            restoreId,
            backupId,
            status: 'completed',
            restoredCollections,
            requestedBy: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Critical audit log
        await (0, audit_1.createAuditLog)({
            action: 'RESTORE',
            entityType: 'system',
            entityId: restoreId,
            adminAddress: context.auth.token.address,
            metadata: {
                backupId,
                restoredCollections,
                restoreType: 'full'
            },
            severity: 'CRITICAL',
            category: 'ADMIN_ACTION'
        });
        return {
            success: true,
            restoreId,
            restoredCollections
        };
    }
    catch (error) {
        console.error('Error restoring from backup:', error);
        throw error;
    }
});
// Helper function to clean up old backups
async function cleanupOldBackups(retentionDays) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const oldBackupsQuery = await firestore
            .collection('backup_logs')
            .where('createdAt', '<', cutoffDate)
            .where('type', '==', 'daily')
            .get();
        const bucket = storage.bucket();
        for (const backupDoc of oldBackupsQuery.docs) {
            const backupData = backupDoc.data();
            const backupId = backupData.backupId;
            // Delete from storage
            const backupFile = bucket.file(`backups/${backupId}.json`);
            const [exists] = await backupFile.exists();
            if (exists) {
                await backupFile.delete();
            }
            // Delete record
            await backupDoc.ref.delete();
        }
        if (oldBackupsQuery.size > 0) {
            console.log(`Cleaned up ${oldBackupsQuery.size} old backups`);
        }
    }
    catch (error) {
        console.error('Error cleaning up old backups:', error);
    }
}
exports.backupFunctions = {
    dailyBackup: exports.dailyBackup,
    createManualBackup: exports.createManualBackup,
    restoreFromBackup: exports.restoreFromBackup
};
//# sourceMappingURL=index.js.map