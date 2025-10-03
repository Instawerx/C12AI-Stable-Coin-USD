import * as functions from 'firebase-functions';
/**
 * Create a new manual payment request
 * User calls this after selecting token type and amount
 */
export declare const createManualPayment: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Update manual payment with proof (screenshot or TX hash)
 * User calls this after making the payment
 */
export declare const submitPaymentProof: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Admin function to verify and approve/reject manual payment
 * Only callable by admins with FINANCE_ADMIN role
 */
export declare const verifyManualPayment: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Get manual payment by reference ID
 */
export declare const getManualPayment: functions.HttpsFunction & functions.Runnable<any>;
/**
 * List manual payments (Admin only)
 * Supports filtering by status
 */
export declare const listPayments: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Get payment analytics (Admin only)
 * Returns aggregated statistics for the specified time range
 */
export declare const getAnalytics: functions.HttpsFunction & functions.Runnable<any>;
export declare const manualPaymentFunctions: {
    createManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    submitPaymentProof: functions.HttpsFunction & functions.Runnable<any>;
    verifyManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    getManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    listPayments: functions.HttpsFunction & functions.Runnable<any>;
    getAnalytics: functions.HttpsFunction & functions.Runnable<any>;
};
//# sourceMappingURL=index.d.ts.map