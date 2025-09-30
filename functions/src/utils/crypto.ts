import { ethers } from 'ethers';

export function validateEthereumAddress(address: string): boolean {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
}

export function normalizeAddress(address: string): string {
  return ethers.utils.getAddress(address.toLowerCase());
}

export function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return normalizeAddress(recoveredAddress) === normalizeAddress(expectedAddress);
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export function generateNonce(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}-${random}`;
}

export function createSignMessage(address: string, nonce: string): string {
  return `Sign this message to authenticate with C12USD.\n\nAddress: ${address}\nNonce: ${nonce}\nTimestamp: ${new Date().toISOString()}`;
}

export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export function generateReceiptId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `receipt_${timestamp}_${random}`;
}

export function hashData(data: string): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(data));
}

export function encryptSensitiveData(data: string, key: string): string {
  // In a real implementation, use proper encryption
  // This is a placeholder for AES encryption
  const crypto = require('crypto');
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decryptSensitiveData(encryptedData: string, key: string): string {
  // In a real implementation, use proper decryption
  // This is a placeholder for AES decryption
  const crypto = require('crypto');
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}