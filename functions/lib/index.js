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
exports.healthCheck = exports.manualPayments = exports.backup = exports.monitoring = exports.webhooks = exports.notifications = exports.reserves = exports.compliance = exports.transactions = exports.auth = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("./config/firebase");
const scheduler_1 = require("./cron/scheduler");
// Import all function modules
const auth_1 = require("./auth");
const transactions_1 = require("./transactions");
const compliance_1 = require("./compliance");
const reserves_1 = require("./reserves");
const notifications_1 = require("./notifications");
const webhooks_1 = require("./webhooks");
const monitoring_1 = require("./monitoring");
const backup_1 = require("./backup");
const manualPayments_1 = require("./manualPayments");
// Initialize Firebase Admin
(0, firebase_1.initializeApp)();
// Setup scheduled functions
(0, scheduler_1.setupCronJobs)();
// Export all Cloud Functions
exports.auth = auth_1.authFunctions;
exports.transactions = transactions_1.transactionFunctions;
exports.compliance = compliance_1.complianceFunctions;
exports.reserves = reserves_1.reserveFunctions;
exports.notifications = notifications_1.notificationFunctions;
exports.webhooks = webhooks_1.webhookFunctions;
exports.monitoring = monitoring_1.monitoringFunctions;
exports.backup = backup_1.backupFunctions;
exports.manualPayments = manualPayments_1.manualPaymentFunctions;
// Health check endpoint
exports.healthCheck = functions.https.onRequest(async (req, res) => {
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
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=index.js.map