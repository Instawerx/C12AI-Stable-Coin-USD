import * as admin from 'firebase-admin';
import { getFirestoreInstance } from '../config/firebase';

const firestore = getFirestoreInstance();

export interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  userAddress?: string;
  adminAddress?: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  sessionId?: string;
  riskScore?: number;
  securityFlags?: any;
  oldData?: any;
  newData?: any;
  metadata?: any;
  severity?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  category?: 'SYSTEM' | 'SECURITY' | 'FINANCIAL' | 'COMPLIANCE' | 'USER_ACTION' | 'ADMIN_ACTION';
  correlationId?: string;
  parentLogId?: string;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    const auditLog = {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      userAddress: data.userAddress?.toLowerCase(),
      adminAddress: data.adminAddress?.toLowerCase(),
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

  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

export async function createSecurityEvent(
  type: string,
  description: string,
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  metadata: any = {}
): Promise<void> {
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

  } catch (error) {
    console.error('Failed to create security event:', error);
  }
}

export async function createComplianceAlert(
  userId: string,
  alertType: string,
  description: string,
  riskScore: number,
  flags: string[]
): Promise<void> {
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

  } catch (error) {
    console.error('Failed to create compliance alert:', error);
  }
}