import * as functions from 'firebase-functions';
export declare const riskAssessment: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const transactionMonitoring: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const sanctionsScreening: functions.HttpsFunction & functions.Runnable<any>;
export declare const processKYCDocument: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const complianceFunctions: {
    riskAssessment: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
    transactionMonitoring: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    sanctionsScreening: functions.HttpsFunction & functions.Runnable<any>;
    processKYCDocument: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
};
//# sourceMappingURL=index.d.ts.map