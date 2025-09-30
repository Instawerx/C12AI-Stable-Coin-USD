const { ethers } = require('ethers');
const crypto = require('crypto');
const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * EIP-191 Signer Service for C12USD Operations
 *
 * This service handles signing of mint and redeem operations using EIP-191 standard.
 * It enforces per-transaction and daily limits during the pilot phase.
 */
class SignerService {
  constructor() {
    this.privateKey = process.env.OPS_SIGNER_PRIVATE_KEY;
    this.wallet = null;
    this.dailyLimits = new Map(); // Track daily usage per address

    if (!this.privateKey) {
      throw new Error('OPS_SIGNER_PRIVATE_KEY environment variable is required');
    }

    // Initialize wallet without 0x prefix
    const keyWithPrefix = this.privateKey.startsWith('0x') ? this.privateKey : `0x${this.privateKey}`;
    this.wallet = new ethers.Wallet(keyWithPrefix);

    // Transaction limits from environment (no daily limits)
    this.maxTransactionLimit = parseFloat(process.env.MAX_TRANSACTION_LIMIT) || 1000000;

    logger.info('Signer service initialized', {
      signerAddress: this.wallet.address,
      maxTransactionLimit: this.maxTransactionLimit
    });
  }

  /**
   * Get the signer wallet address
   */
  getSignerAddress() {
    return this.wallet.address;
  }

  /**
   * Check if a mint operation is within transaction limits
   */
  async checkTransactionLimits(userWallet, usdAmount) {
    // Check per-transaction limit
    if (usdAmount > this.maxTransactionLimit) {
      throw new Error(`Transaction amount $${usdAmount} exceeds per-transaction limit of $${this.maxTransactionLimit}`);
    }

    // No daily limits for USD/stablecoin purchases
    logger.info('Transaction limit check passed', {
      userWallet,
      usdAmount,
      maxTransactionLimit: this.maxTransactionLimit
    });

    return {
      allowed: true,
      transactionLimit: this.maxTransactionLimit
    };
  }

  /**
   * Generate a unique nonce for the transaction
   */
  generateNonce() {
    return ethers.utils.hexlify(crypto.randomBytes(32));
  }

  /**
   * Calculate offchain reference hash from receipt
   */
  calculateOffchainRef(receiptData) {
    // Create a consistent serialized representation
    const serialized = JSON.stringify({
      provider: receiptData.provider,
      providerId: receiptData.providerId,
      userWallet: receiptData.userWallet.toLowerCase(),
      usdAmount: receiptData.usdAmount.toString(),
      chainId: receiptData.chainId,
      timestamp: receiptData.createdAt.toISOString()
    });

    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(serialized));
  }

  /**
   * Sign a mint operation using EIP-191
   *
   * @param {number} chainId - Chain ID (56 for BSC, 137 for Polygon)
   * @param {string} gatewayAddress - MintRedeemGateway contract address
   * @param {string} offchainRef - Offchain reference hash
   * @param {string} userWallet - User's wallet address
   * @param {number} usdAmount - USD amount to mint
   * @param {string} nonce - Unique nonce for this transaction
   * @param {number} expiryTime - Expiration timestamp
   * @returns {Object} Signature and related data
   */
  async signMintOperation(chainId, gatewayAddress, offchainRef, userWallet, usdAmount, nonce, expiryTime) {
    try {
      // Check transaction limits
      const limitCheck = await this.checkTransactionLimits(userWallet, usdAmount);

      // Convert USD amount to token amount (assuming 1:1 for now)
      const tokenAmount = ethers.utils.parseEther(usdAmount.toString());

      // Create the message hash according to the gateway contract
      const messageHash = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256', 'bytes32', 'uint256', 'bytes32'],
        ['MINT', userWallet.toLowerCase(), tokenAmount, nonce, expiryTime, offchainRef]
      );

      // Sign using EIP-191 personal sign
      const signature = await this.wallet.signMessage(ethers.utils.arrayify(messageHash));

      const signatureData = {
        messageHash,
        signature,
        nonce,
        expiryTime,
        offchainRef,
        tokenAmount: tokenAmount.toString(),
        usdAmount,
        chainId,
        gatewayAddress: gatewayAddress.toLowerCase(),
        userWallet: userWallet.toLowerCase(),
        signerAddress: this.wallet.address,
        limitCheck
      };

      logger.info('Mint operation signed', {
        userWallet,
        usdAmount,
        chainId,
        nonce,
        remainingDailyLimit: limitCheck.remainingDailyLimit
      });

      return signatureData;

    } catch (error) {
      logger.error('Failed to sign mint operation', {
        userWallet,
        usdAmount,
        chainId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sign a redeem operation using EIP-191
   *
   * @param {number} chainId - Chain ID
   * @param {string} gatewayAddress - MintRedeemGateway contract address
   * @param {string} userWallet - User's wallet address
   * @param {number} usdAmount - USD amount to redeem
   * @param {string} nonce - Unique nonce for this transaction
   * @param {number} expiryTime - Expiration timestamp
   * @returns {Object} Signature and related data
   */
  async signRedeemOperation(chainId, gatewayAddress, userWallet, usdAmount, nonce, expiryTime) {
    try {
      // Convert USD amount to token amount (assuming 1:1 for now)
      const tokenAmount = ethers.utils.parseEther(usdAmount.toString());

      // Create a redeem reference hash
      const redeemRef = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ['address', 'uint256', 'uint256', 'bytes32'],
          [userWallet, tokenAmount, chainId, nonce]
        )
      );

      // Create the message hash according to the gateway contract
      const messageHash = ethers.utils.solidityKeccak256(
        ['string', 'address', 'uint256', 'bytes32', 'uint256', 'bytes32'],
        ['REDEEM', userWallet.toLowerCase(), tokenAmount, nonce, expiryTime, redeemRef]
      );

      // Sign using EIP-191 personal sign
      const signature = await this.wallet.signMessage(ethers.utils.arrayify(messageHash));

      const signatureData = {
        messageHash,
        signature,
        nonce,
        expiryTime,
        redeemRef,
        tokenAmount: tokenAmount.toString(),
        usdAmount,
        chainId,
        gatewayAddress: gatewayAddress.toLowerCase(),
        userWallet: userWallet.toLowerCase(),
        signerAddress: this.wallet.address
      };

      logger.info('Redeem operation signed', {
        userWallet,
        usdAmount,
        chainId,
        nonce
      });

      return signatureData;

    } catch (error) {
      logger.error('Failed to sign redeem operation', {
        userWallet,
        usdAmount,
        chainId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verify a signature was created by this signer
   */
  verifySignature(message, signature) {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === this.wallet.address.toLowerCase();
    } catch (error) {
      logger.error('Signature verification failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get current daily usage for a wallet
   */
  async getDailyUsage(userWallet) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyUsage = await prisma.receipt.aggregate({
      _sum: {
        usdAmount: true
      },
      where: {
        userWallet: userWallet.toLowerCase(),
        status: {
          in: ['CONFIRMED', 'MINTED']
        },
        createdAt: {
          gte: today
        }
      }
    });

    const currentUsage = dailyUsage._sum.usdAmount || 0;

    return {
      currentUsage,
      dailyLimit: this.pilotDailyLimit,
      remainingLimit: this.pilotDailyLimit - currentUsage,
      date: today.toISOString().split('T')[0]
    };
  }

  /**
   * Get signer service status and limits
   */
  getStatus() {
    return {
      signerAddress: this.wallet.address,
      pilotLimits: {
        dailyLimit: this.pilotDailyLimit,
        perTransactionLimit: this.pilotPerTxLimit
      },
      isInitialized: !!this.wallet
    };
  }
}

// Create singleton instance
let signerServiceInstance = null;

function getSignerService() {
  if (!signerServiceInstance) {
    signerServiceInstance = new SignerService();
  }
  return signerServiceInstance;
}

module.exports = {
  SignerService,
  getSignerService
};