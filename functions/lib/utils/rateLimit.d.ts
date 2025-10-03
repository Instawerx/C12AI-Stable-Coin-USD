export declare function checkRateLimit(type: 'API_REQUESTS' | 'MINT_OPERATIONS' | 'REDEEM_OPERATIONS' | 'LOGIN_ATTEMPTS' | 'FAILED_TRANSACTIONS', identifier: string, limit: number, windowSeconds: number): Promise<void>;
export declare function resetRateLimit(identifier: string, type: string): Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map