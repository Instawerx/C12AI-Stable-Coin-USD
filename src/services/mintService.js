const { ethers } = require('ethers');
const { PrismaClient } = require('../../generated/prisma');
const { getSignerService } = require('./signerService');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Mint Integration Service
 *
 * Handles the process of minting tokens on-chain after successful fiat payments
 */
class MintService {
  constructor() {
    this.providers = new Map();
    this.gatewayContracts = new Map();
    this.signerService = getSignerService();

    // Initialize blockchain providers and contracts
    this.initializeProviders();
  }

  /**
   * Initialize blockchain providers and gateway contracts
   */
  initializeProviders() {
    try {
      // BSC Provider and Gateway
      if (process.env.BSC_RPC && process.env.BSC_GATEWAY_ADDRESS) {
        const bscProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC);
        this.providers.set(56, bscProvider);

        // Load gateway contract ABI (simplified for now)
        const gatewayAbi = [
          'function executeMint(address recipient, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes calldata signature) external',
          'function executeRedeem(address account, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes calldata signature) external',
          'function usedNonces(bytes32 nonce) external view returns (bool)',
          'event MintExecuted(address indexed recipient, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)',
          'event RedeemExecuted(address indexed account, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)'
        ];

        const bscGateway = new ethers.Contract(
          process.env.BSC_GATEWAY_ADDRESS,
          gatewayAbi,
          bscProvider
        );

        this.gatewayContracts.set(56, {
          contract: bscGateway,
          address: process.env.BSC_GATEWAY_ADDRESS
        });

        logger.info('BSC provider and gateway initialized', {
          chainId: 56,
          gateway: process.env.BSC_GATEWAY_ADDRESS
        });
      }

      // Polygon Provider and Gateway
      if (process.env.POLYGON_RPC && process.env.POLYGON_GATEWAY_ADDRESS) {
        const polygonProvider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
        this.providers.set(137, polygonProvider);

        const gatewayAbi = [
          'function executeMint(address recipient, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes calldata signature) external',
          'function executeRedeem(address account, uint256 amount, bytes32 nonce, uint256 expiryTime, bytes32 receiptHash, bytes calldata signature) external',
          'function usedNonces(bytes32 nonce) external view returns (bool)',
          'event MintExecuted(address indexed recipient, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)',
          'event RedeemExecuted(address indexed account, uint256 amount, bytes32 indexed receiptHash, bytes32 nonce)'
        ];

        const polygonGateway = new ethers.Contract(
          process.env.POLYGON_GATEWAY_ADDRESS,
          gatewayAbi,
          polygonProvider
        );

        this.gatewayContracts.set(137, {
          contract: polygonGateway,
          address: process.env.POLYGON_GATEWAY_ADDRESS
        });

        logger.info('Polygon provider and gateway initialized', {
          chainId: 137,
          gateway: process.env.POLYGON_GATEWAY_ADDRESS
        });
      }

      if (this.providers.size === 0) {
        throw new Error('No blockchain providers configured');
      }

    } catch (error) {
      logger.error('Failed to initialize providers', error);
      throw error;
    }
  }

  /**
   * Get provider for chain ID
   */
  getProvider(chainId) {
    const provider = this.providers.get(chainId);
    if (!provider) {
      throw new Error(`No provider configured for chain ID: ${chainId}`);
    }
    return provider;
  }

  /**
   * Get gateway contract for chain ID
   */
  getGateway(chainId) {
    const gateway = this.gatewayContracts.get(chainId);
    if (!gateway) {
      throw new Error(`No gateway contract configured for chain ID: ${chainId}`);
    }
    return gateway;
  }

  /**
   * Process mint transaction for a receipt
   */
  async processMintTransaction(receiptId) {
    try {
      // Get the receipt from database
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId }
      });

      if (!receipt) {
        throw new Error(`Receipt not found: ${receiptId}`);
      }

      if (receipt.status !== 'CONFIRMED') {
        throw new Error(`Receipt status is ${receipt.status}, expected CONFIRMED`);
      }

      logger.info('Processing mint transaction', {
        receiptId,
        userWallet: receipt.userWallet,
        usdAmount: receipt.usdAmount,
        chainId: receipt.chainId
      });

      // Update status to processing
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { status: 'PROCESSING' }
      });

      // Get gateway contract
      const gateway = this.getGateway(receipt.chainId);

      // Calculate offchain reference
      const offchainRef = this.signerService.calculateOffchainRef(receipt);

      // Generate nonce and expiry time
      const nonce = this.signerService.generateNonce();
      const expiryTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours from now

      // Sign the mint operation
      const signatureData = await this.signerService.signMintOperation(
        receipt.chainId,
        gateway.address,
        offchainRef,
        receipt.userWallet,
        receipt.usdAmount,
        nonce,
        expiryTime
      );

      // Execute the mint transaction on-chain
      const mintResult = await this.executeMintOnChain(
        receipt.chainId,
        receipt.userWallet,
        signatureData
      );

      // Update receipt with mint transaction details
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'MINTED',
          txHash: mintResult.transactionHash,
          nonce: nonce,
          signatureData: signatureData,
          mintedAt: new Date()
        }
      });

      logger.logTransaction('mint_completed', {
        receiptId,
        txHash: mintResult.transactionHash,
        userWallet: receipt.userWallet,
        usdAmount: receipt.usdAmount,
        chainId: receipt.chainId,
        gasUsed: mintResult.gasUsed
      });

      return {
        success: true,
        receiptId,
        transactionHash: mintResult.transactionHash,
        tokenAmount: signatureData.tokenAmount,
        nonce
      };

    } catch (error) {
      logger.error('Mint transaction failed', {
        receiptId,
        error: error.message,
        stack: error.stack
      });

      // Update receipt status to failed
      await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
          failedAt: new Date()
        }
      }).catch(dbError => {
        logger.error('Failed to update receipt status', { receiptId, dbError: dbError.message });
      });

      throw error;
    }
  }

  /**
   * Execute mint transaction on the blockchain
   */
  async executeMintOnChain(chainId, userWallet, signatureData) {
    const provider = this.getProvider(chainId);
    const gateway = this.getGateway(chainId);

    // Create wallet with provider for transaction signing
    const signerWallet = new ethers.Wallet(
      this.signerService.privateKey.startsWith('0x') ?
        this.signerService.privateKey :
        `0x${this.signerService.privateKey}`,
      provider
    );

    // Create gateway contract instance with signer
    const gatewayWithSigner = gateway.contract.connect(signerWallet);

    // Check if nonce is already used (safety check)
    const isNonceUsed = await gateway.contract.usedNonces(signatureData.nonce);
    if (isNonceUsed) {
      throw new Error(`Nonce ${signatureData.nonce} already used`);
    }

    // Estimate gas
    const gasEstimate = await gatewayWithSigner.estimateGas.executeMint(
      userWallet,
      signatureData.tokenAmount,
      signatureData.nonce,
      signatureData.expiryTime,
      signatureData.offchainRef,
      signatureData.signature
    );

    // Add 20% buffer to gas estimate
    const gasLimit = gasEstimate.mul(120).div(100);

    // Get current gas price
    const gasPrice = await provider.getGasPrice();

    logger.info('Executing mint on-chain', {
      chainId,
      userWallet,
      tokenAmount: signatureData.tokenAmount,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString()
    });

    // Execute the mint transaction
    const tx = await gatewayWithSigner.executeMint(
      userWallet,
      signatureData.tokenAmount,
      signatureData.nonce,
      signatureData.expiryTime,
      signatureData.offchainRef,
      signatureData.signature,
      {
        gasLimit,
        gasPrice: gasPrice.mul(110).div(100) // 10% premium for faster confirmation
      }
    );

    logger.info('Mint transaction submitted', {
      chainId,
      txHash: tx.hash,
      userWallet
    });

    // Wait for confirmation
    const receipt = await tx.wait(1); // Wait for 1 confirmation

    logger.info('Mint transaction confirmed', {
      chainId,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

    return receipt;
  }

  /**
   * Check mint transaction status
   */
  async checkMintStatus(receiptId) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId }
    });

    if (!receipt) {
      return { found: false };
    }

    return {
      found: true,
      status: receipt.status,
      txHash: receipt.txHash,
      mintedAt: receipt.mintedAt,
      errorMessage: receipt.errorMessage,
      usdAmount: receipt.usdAmount,
      userWallet: receipt.userWallet,
      chainId: receipt.chainId
    };
  }

  /**
   * Retry failed mint transaction
   */
  async retryMintTransaction(receiptId) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId }
    });

    if (!receipt) {
      throw new Error(`Receipt not found: ${receiptId}`);
    }

    if (receipt.status !== 'FAILED') {
      throw new Error(`Cannot retry receipt with status: ${receipt.status}`);
    }

    logger.info('Retrying mint transaction', { receiptId });

    // Reset status to CONFIRMED and retry
    await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        status: 'CONFIRMED',
        errorMessage: null,
        failedAt: null
      }
    });

    return this.processMintTransaction(receiptId);
  }

  /**
   * Get mint service status and statistics
   */
  async getStatus() {
    const stats = await prisma.receipt.groupBy({
      by: ['status', 'chainId'],
      _count: true
    });

    const recentMints = await prisma.receipt.count({
      where: {
        status: 'MINTED',
        mintedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    return {
      providers: Array.from(this.providers.keys()),
      gateways: Array.from(this.gatewayContracts.keys()),
      statistics: stats,
      recentMints24h: recentMints,
      signerAddress: this.signerService.getSignerAddress()
    };
  }
}

// Create singleton instance
let mintServiceInstance = null;

function getMintService() {
  if (!mintServiceInstance) {
    mintServiceInstance = new MintService();
  }
  return mintServiceInstance;
}

// Export function to process mint transaction (used by webhook handler)
async function processMintTransaction(receiptId) {
  const mintService = getMintService();
  return mintService.processMintTransaction(receiptId);
}

module.exports = {
  MintService,
  getMintService,
  processMintTransaction
};