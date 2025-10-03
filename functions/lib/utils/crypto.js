"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEthereumAddress = validateEthereumAddress;
exports.normalizeAddress = normalizeAddress;
exports.verifySignature = verifySignature;
exports.generateNonce = generateNonce;
exports.createSignMessage = createSignMessage;
exports.isValidTransactionHash = isValidTransactionHash;
exports.generateReceiptId = generateReceiptId;
exports.hashData = hashData;
exports.encryptSensitiveData = encryptSensitiveData;
exports.decryptSensitiveData = decryptSensitiveData;
const ethers_1 = require("ethers");
function validateEthereumAddress(address) {
    try {
        return ethers_1.ethers.utils.isAddress(address);
    }
    catch (_a) {
        return false;
    }
}
function normalizeAddress(address) {
    return ethers_1.ethers.utils.getAddress(address.toLowerCase());
}
function verifySignature(message, signature, expectedAddress) {
    try {
        const recoveredAddress = ethers_1.ethers.utils.verifyMessage(message, signature);
        return normalizeAddress(recoveredAddress) === normalizeAddress(expectedAddress);
    }
    catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}
function generateNonce() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
}
function createSignMessage(address, nonce) {
    return `Sign this message to authenticate with C12USD.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
}
function isValidTransactionHash(hash) {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
function generateReceiptId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `receipt_${timestamp}_${random}`;
}
function hashData(data) {
    return ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes(data));
}
function encryptSensitiveData(data, key) {
    // In a real implementation, use proper encryption
    // This is a placeholder for AES encryption
    const crypto = require('crypto');
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decryptSensitiveData(encryptedData, key) {
    // In a real implementation, use proper decryption
    // This is a placeholder for AES decryption
    const crypto = require('crypto');
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
//# sourceMappingURL=crypto.js.map