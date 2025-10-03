export declare function validateEthereumAddress(address: string): boolean;
export declare function validateAmount(amount: string | number): boolean;
export declare function validateChain(chain: string): boolean;
export declare function validateTransactionData(data: any, type: 'mint' | 'redeem'): Promise<void>;
export declare function validateKYCDocument(data: any): Promise<void>;
export declare function validateSignature(message: string, signature: string, expectedAddress: string): boolean;
export declare function validateTreasuryOperation(data: any): Promise<void>;
//# sourceMappingURL=validation.d.ts.map