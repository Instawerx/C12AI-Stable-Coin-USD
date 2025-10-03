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
exports.createAuditLog = createAuditLog;
exports.createSecurityEvent = createSecurityEvent;
exports.createComplianceAlert = createComplianceAlert;
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("../config/firebase");
const firestore = (0, firebase_1.getFirestoreInstance)();
async function createAuditLog(data) {
    var _a, _b;
    try {
        const auditLog = {
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            userAddress: (_a = data.userAddress) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
            adminAddress: (_b = data.adminAddress) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            country: data.country,
            sessionId: data.sessionId,
            riskScore: data.riskScore || 0,
            securityFlags: data.securityFlags || {},
            oldData: data.oldData || null,
            newData: data.newData || null,
            metadata: data.metadata || {},
            severity: data.severity || 'INFO',
            category: data.category || 'SYSTEM',
            correlationId: data.correlationId,
            parentLogId: data.parentLogId,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
        await firestore.collection('audit_logs').add(auditLog);
        // If this is a critical or error level log, also log to console
        if (data.severity === 'CRITICAL' || data.severity === 'ERROR') {
            console.error('AUDIT LOG:', JSON.stringify(auditLog, null, 2));
        }
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to avoid breaking the main operation
    }
}
async function createSecurityEvent(type, description, severity, metadata = {}) {
    try {
        const securityEvent = {
            type,
            description,
            severity,
            metadata,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            resolved: false,
            resolvedAt: null,
            resolvedBy: null
        };
        await firestore.collection('security_events').add(securityEvent);
        // Also create audit log
        await createAuditLog({
            action: 'SECURITY_EVENT',
            entityType: 'security',
            entityId: type,
            securityFlags: { flags: [type], severity },
            metadata: { description, ...metadata },
            severity: severity === 'CRITICAL' ? 'CRITICAL' : severity === 'HIGH' ? 'ERROR' : 'WARN',
            category: 'SECURITY'
        });
        console.log(`Security event created: ${type} - ${severity}`);
    }
    catch (error) {
        console.error('Failed to create security event:', error);
    }
}
async function createComplianceAlert(userId, alertType, description, riskScore, flags) {
    try {
        const alert = {
            userId,
            alertType,
            description,
            riskScore,
            flags,
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            resolvedAt: null,
            resolvedBy: null,
            resolution: null
        };
        await firestore.collection('compliance_alerts').add(alert);
        // Create audit log
        await createAuditLog({
            action: 'COMPLIANCE_CHECK',
            entityType: 'compliance_alert',
            entityId: userId,
            userAddress: userId,
            riskScore,
            securityFlags: { flags },
            metadata: { alertType, description },
            severity: riskScore > 80 ? 'ERROR' : riskScore > 60 ? 'WARN' : 'INFO',
            category: 'COMPLIANCE'
        });
        console.log(`Compliance alert created for user ${userId}: ${alertType}`);
    }
    catch (error) {
        console.error('Failed to create compliance alert:', error);
    }
}
//# sourceMappingURL=audit.js.map