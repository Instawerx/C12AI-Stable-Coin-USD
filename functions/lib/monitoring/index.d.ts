import * as functions from 'firebase-functions';
export declare const systemHealthCheck: functions.CloudFunction<unknown>;
export declare const performanceMonitor: functions.HttpsFunction & functions.Runnable<any>;
export declare const errorTracker: functions.HttpsFunction & functions.Runnable<any>;
export declare const monitoringFunctions: {
    systemHealthCheck: functions.CloudFunction<unknown>;
    performanceMonitor: functions.HttpsFunction & functions.Runnable<any>;
    errorTracker: functions.HttpsFunction & functions.Runnable<any>;
};
//# sourceMappingURL=index.d.ts.map