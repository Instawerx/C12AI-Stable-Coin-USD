import * as functions from 'firebase-functions';
export declare const dailyBackup: functions.CloudFunction<unknown>;
export declare const createManualBackup: functions.HttpsFunction & functions.Runnable<any>;
export declare const restoreFromBackup: functions.HttpsFunction & functions.Runnable<any>;
export declare const backupFunctions: {
    dailyBackup: functions.CloudFunction<unknown>;
    createManualBackup: functions.HttpsFunction & functions.Runnable<any>;
    restoreFromBackup: functions.HttpsFunction & functions.Runnable<any>;
};
//# sourceMappingURL=index.d.ts.map