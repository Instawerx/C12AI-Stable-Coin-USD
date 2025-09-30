const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');
const { captureFinancialError, startFinancialTransaction, captureFinancialEvent } = require('../utils/sentry');

const prisma = new PrismaClient();

/**
 * Enhanced mint service with Sentry integration
 * This shows how to properly integrate Sentry into your existing services
 */
class EnhancedMintService {
  /**
   * Process mint transaction with comprehensive error monitoring
   */
  static async processMintTransaction(receiptId) {
    const transaction = startFinancialTransaction('process_mint_transaction', 'mint');

    try {
      // Set transaction context
      transaction.setTag('operation', 'mint');
      transaction.setTag('service', 'mint-service');

      logger.info('Starting mint transaction processing', { receiptId });

      // Fetch receipt with error handling
      const receipt = await this.getReceiptSafely(receiptId);
      if (!receipt) {
        throw new Error(`Receipt not found: ${receiptId}`);
      }

      // Add receipt context to transaction
      transaction.setContext('receipt', {
        id: receipt.id,
        provider: receipt.provider,
        amount: receipt.usdAmount,
        chain_id: receipt.chainId,
        wallet: receipt.userWallet.substring(0, 6) + '...' + receipt.userWallet.substring(-4)
      });

      // Validate receipt
      await this.validateReceipt(receipt);

      // Calculate token amount
      const tokenAmount = await this.calculateTokenAmount(receipt.usdAmount);
      transaction.setData('token_amount', tokenAmount);

      // Execute blockchain transaction
      const blockchainTx = await this.executeBlockchainMint(receipt, tokenAmount);

      // Update receipt status
      await this.updateReceiptStatus(receipt.id, 'MINTED', blockchainTx.hash);

      // Log successful completion
      captureFinancialEvent('Mint transaction completed successfully', 'info', {
        operation: 'mint',
        receiptId: receipt.id,
        tokenAmount,
        txHash: blockchainTx.hash,
        provider: receipt.provider,
        chainId: receipt.chainId
      });

      logger.info('Mint transaction completed', {
        receiptId: receipt.id,
        tokenAmount,
        txHash: blockchainTx.hash
      });

      transaction.setStatus('ok');
      return blockchainTx;

    } catch (error) {
      transaction.setStatus('internal_error');

      // Capture error with full context
      captureFinancialError(error, {
        operation: 'mint',
        receiptId,
        service: 'mint-service',
        financial: true,
        critical: true,
        severity: 'high'
      });

      logger.logError(error, {
        component: 'mint-service',
        receiptId,
        financial: true,
        critical: true
      });

      throw error;
    } finally {
      transaction.finish();
    }
  }

  /**
   * Safely get receipt with error handling
   */
  static async getReceiptSafely(receiptId) {
    const span = startFinancialTransaction('get_receipt', 'db');

    try {
      const receipt = await prisma.receipt.findUnique({
        where: { id: receiptId }
      });

      span.setStatus('ok');
      return receipt;
    } catch (error) {
      span.setStatus('internal_error');

      captureFinancialError(error, {
        operation: 'database_query',
        receiptId,
        query: 'findUnique_receipt',
        critical: true
      });

      throw error;
    } finally {
      span.finish();
    }
  }

  /**
   * Validate receipt data
   */
  static async validateReceipt(receipt) {
    if (receipt.status !== 'CONFIRMED') {
      const error = new Error(`Invalid receipt status: ${receipt.status}`);
      error.severity = 'high';
      throw error;
    }

    if (!receipt.userWallet || !receipt.usdAmount) {
      const error = new Error('Invalid receipt data: missing required fields');
      error.severity = 'high';
      throw error;
    }

    // Log validation success
    captureFinancialEvent('Receipt validation passed', 'info', {
      operation: 'validation',
      receiptId: receipt.id
    });
  }

  /**
   * Calculate token amount with error handling
   */
  static async calculateTokenAmount(usdAmount) {
    const span = startFinancialTransaction('calculate_tokens', 'calculation');

    try {
      // Mock calculation - replace with your actual logic
      const rate = 1.0; // 1 USD = 1 C12USD
      const tokenAmount = usdAmount * rate;

      if (tokenAmount <= 0) {
        throw new Error(`Invalid token amount calculated: ${tokenAmount}`);
      }

      span.setData('usd_amount', usdAmount);
      span.setData('token_amount', tokenAmount);
      span.setData('exchange_rate', rate);

      span.setStatus('ok');
      return tokenAmount;

    } catch (error) {
      span.setStatus('internal_error');

      captureFinancialError(error, {
        operation: 'token_calculation',
        usdAmount,
        critical: true
      });

      throw error;
    } finally {
      span.finish();
    }
  }

  /**
   * Execute blockchain mint transaction
   */
  static async executeBlockchainMint(receipt, tokenAmount) {
    const span = startFinancialTransaction('blockchain_mint', 'blockchain');

    try {
      // Add blockchain context
      span.setTag('blockchain', receipt.chainId === 56 ? 'bsc' : 'polygon');
      span.setTag('contract_operation', 'mint');
      span.setData('token_amount', tokenAmount);

      // Mock blockchain transaction - replace with your actual implementation
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);

      logger.info('Executing blockchain mint', {
        chainId: receipt.chainId,
        wallet: receipt.userWallet,
        amount: tokenAmount
      });

      // Simulate blockchain delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const blockchainTx = {
        hash: mockTxHash,
        blockNumber: Math.floor(Math.random() * 1000000),
        gasUsed: '21000',
        status: 'confirmed'
      };

      span.setData('tx_hash', blockchainTx.hash);
      span.setData('block_number', blockchainTx.blockNumber);
      span.setStatus('ok');

      return blockchainTx;

    } catch (error) {
      span.setStatus('internal_error');

      captureFinancialError(error, {
        operation: 'blockchain_mint',
        chainId: receipt.chainId,
        wallet: receipt.userWallet,
        amount: tokenAmount,
        financial: true,
        critical: true,
        severity: 'high'
      });

      throw error;
    } finally {
      span.finish();
    }
  }

  /**
   * Update receipt status in database
   */
  static async updateReceiptStatus(receiptId, status, txHash = null) {
    const span = startFinancialTransaction('update_receipt_status', 'db');

    try {
      const updatedReceipt = await prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status,
          ...(txHash && { txHash }),
          updatedAt: new Date()
        }
      });

      span.setData('new_status', status);
      span.setStatus('ok');

      captureFinancialEvent('Receipt status updated', 'info', {
        operation: 'status_update',
        receiptId,
        newStatus: status,
        txHash
      });

      return updatedReceipt;

    } catch (error) {
      span.setStatus('internal_error');

      captureFinancialError(error, {
        operation: 'database_update',
        receiptId,
        status,
        critical: true
      });

      throw error;
    } finally {
      span.finish();
    }
  }

  /**
   * Handle flash loan operations with enhanced monitoring
   */
  static async processFlashLoan(params) {
    const transaction = startFinancialTransaction('flash_loan_operation', 'defi');

    try {
      transaction.setTag('operation', 'flash_loan');
      transaction.setTag('protocol', params.protocol);
      transaction.setContext('loan_params', {
        amount: params.amount,
        asset: params.asset,
        fee_rate: params.feeRate
      });

      logger.info('Starting flash loan operation', {
        protocol: params.protocol,
        amount: params.amount,
        asset: params.asset
      });

      // Flash loan implementation would go here
      // This is just a placeholder showing monitoring integration

      captureFinancialEvent('Flash loan executed successfully', 'info', {
        operation: 'flash_loan',
        protocol: params.protocol,
        amount: params.amount,
        asset: params.asset
      });

      transaction.setStatus('ok');
      return { success: true };

    } catch (error) {
      transaction.setStatus('internal_error');

      captureFinancialError(error, {
        operation: 'flash_loan',
        protocol: params.protocol,
        amount: params.amount,
        financial: true,
        critical: true,
        severity: 'high'
      });

      throw error;
    } finally {
      transaction.finish();
    }
  }

  /**
   * Monitor treasury operations
   */
  static async monitorTreasuryOperation(operation, data) {
    captureFinancialEvent(`Treasury operation: ${operation}`, 'info', {
      operation: 'treasury',
      treasury_operation: operation,
      ...data
    });
  }
}

module.exports = EnhancedMintService;