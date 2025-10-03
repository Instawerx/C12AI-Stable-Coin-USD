import * as functions from 'firebase-functions';
export declare const setupCronJobs: () => void;
export declare const updateProofOfReserves: functions.CloudFunction<unknown>;
export declare const dailyComplianceCheck: functions.CloudFunction<unknown>;
export declare const weeklyMaintenance: functions.CloudFunction<unknown>;
export declare const cronFunctions: {
    updateProofOfReserves: functions.CloudFunction<unknown>;
    dailyComplianceCheck: functions.CloudFunction<unknown>;
    weeklyMaintenance: functions.CloudFunction<unknown>;
};
//# sourceMappingURL=scheduler.d.ts.map