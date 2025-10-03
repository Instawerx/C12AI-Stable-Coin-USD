import * as functions from 'firebase-functions';
export interface DAOMembershipData {
    userId: string;
    role: 'MEMBER' | 'DEVELOPER' | 'ADMIN' | 'TRUSTED';
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    tokenBalance: number;
    votingPower: number;
    totalVolume: number;
    totalTransactions: number;
    joinDate: FirebaseFirestore.Timestamp;
    walletAddress: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE';
    applicationData: any;
}
export interface RoleApplicationData {
    userId: string;
    role: 'MEMBER' | 'DEVELOPER' | 'ADMIN' | 'TRUSTED';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicationData: any;
    reviewedBy?: string;
    reviewDate?: FirebaseFirestore.Timestamp;
    reviewNotes?: string;
    createdAt: FirebaseFirestore.Timestamp;
}
/**
 * Submit a DAO membership application
 */
export declare const submitDAOApplication: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Calculate membership tier based on volume and transactions
 */
export declare const calculateMembershipTier: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Approve or reject a role application (admin only)
 */
export declare const reviewRoleApplication: functions.HttpsFunction & functions.Runnable<any>;
//# sourceMappingURL=membershipManager.d.ts.map