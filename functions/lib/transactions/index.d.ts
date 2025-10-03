import * as functions from 'firebase-functions';
export declare const processMintRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const processRedeemRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
export declare const monitorTransactionStatus: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const processCrossChainTransfer: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
export declare const transactionFunctions: {
    processMintRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    processRedeemRequest: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
    monitorTransactionStatus: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
    processCrossChainTransfer: functions.CloudFunction<functions.Change<functions.firestore.QueryDocumentSnapshot>>;
};
//# sourceMappingURL=index.d.ts.map