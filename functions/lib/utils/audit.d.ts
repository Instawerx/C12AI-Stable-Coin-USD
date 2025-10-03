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
export declare function createAuditLog(data: AuditLogData): Promise<void>;
export declare function createSecurityEvent(type: string, description: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', metadata?: any): Promise<void>;
export declare function createComplianceAlert(userId: string, alertType: string, description: string, riskScore: number, flags: string[]): Promise<void>;
//# sourceMappingURL=audit.d.ts.map