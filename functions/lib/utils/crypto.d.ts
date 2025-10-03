export declare function validateEthereumAddress(address: string): boolean;
export declare function normalizeAddress(address: string): string;
export declare function verifySignature(message: string, signature: string, expectedAddress: string): boolean;
export declare function generateNonce(): string;
export declare function createSignMessage(address: string, nonce: string): string;
export declare function isValidTransactionHash(hash: string): boolean;
export declare function generateReceiptId(): string;
export declare function hashData(data: string): string;
export declare function encryptSensitiveData(data: string, key: string): string;
export declare function decryptSensitiveData(encryptedData: string, key: string): string;
//# sourceMappingURL=crypto.d.ts.map