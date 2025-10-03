import * as functions from 'firebase-functions';
import * as daoFunctions from './dao/membershipManager';
export declare const auth: {
    createCustomToken: functions.HttpsFunction & functions.Runnable<any>;
    logout: functions.HttpsFunction & functions.Runnable<any>;
    updateProfile: functions.HttpsFunction & functions.Runnable<any>;
    validateSession: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const transactions: {
    processMintRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    processRedeemRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    monitorTransactionStatus: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
    processCrossChainTransfer: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
};
export declare const compliance: {
    riskAssessment: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
    transactionMonitoring: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    sanctionsScreening: functions.HttpsFunction & functions.Runnable<any>;
    processKYCDocument: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
};
export declare const reserves: {
    getReserveStatus: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const notifications: {
    sendUserNotification: functions.HttpsFunction & functions.Runnable<any>;
    markAsRead: functions.HttpsFunction & functions.Runnable<any>;
    getUnreadCount: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const webhooks: {
    stripeWebhook: functions.HttpsFunction;
    cashAppWebhook: functions.HttpsFunction;
    layerZeroWebhook: functions.HttpsFunction;
};
export declare const monitoring: {
    systemHealthCheck: functions.CloudFunction<unknown>;
    performanceMonitor: functions.HttpsFunction & functions.Runnable<any>;
    errorTracker: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const backup: {
    dailyBackup: functions.CloudFunction<unknown>;
    createManualBackup: functions.HttpsFunction & functions.Runnable<any>;
    restoreFromBackup: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const manualPayments: {
    createManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    submitPaymentProof: functions.HttpsFunction & functions.Runnable<any>;
    verifyManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    getManualPayment: functions.HttpsFunction & functions.Runnable<any>;
    listPayments: functions.HttpsFunction & functions.Runnable<any>;
    getAnalytics: functions.HttpsFunction & functions.Runnable<any>;
};
export declare const dao: typeof daoFunctions;
export declare const healthCheck: functions.HttpsFunction;
//# sourceMappingURL=index.d.ts.map