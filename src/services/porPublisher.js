const { ethers } = require('ethers');
const { PrismaClient } = require('../../generated/prisma');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Proof of Reserves (PoR) Publisher Service
 *
 * Periodically queries reserve accounts and updates on-chain PoR aggregator
 */
class PoRPublisher {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.updateIntervalHours = parseInt(process.env.POR_UPDATE_INTERVAL_HOURS) || 24;

    // Mock reserve accounts - in production these would be real accounts
    this.reserveAccounts = {
      bank: {
        type: 'TRADITIONAL_BANK',
        accountId: 'BANK_001',
        // In production, this would connect to bank APIs
        checkBalance: () => this.getMockBankBalance()
      },
      cashApp: {
        type: 'CASHAPP',
        accountId: 'CASHAPP_001',
        // In production, this would use Cash App Business API
        checkBalance: () => this.getMockCashAppBalance()
      },
      treasuryBills: {
        type: 'TREASURY_BILLS',
        accountId: 'TBILL_001',
        // In production, this would connect to treasury/bond platforms
        checkBalance: () => this.getMockTreasuryBalance()
      }
    };

    logger.info('PoR Publisher initialized', {
      updateIntervalHours: this.updateIntervalHours,
      reserveAccounts: Object.keys(this.reserveAccounts).length
    });
  }

  /**
   * Start the PoR publishing service
   */
  start() {
    if (this.isRunning) {
      logger.warn('PoR Publisher is already running');
      return;
    }

    this.isRunning = true;

    // Run immediately on start
    this.updateProofOfReserves().catch(error => {
      logger.error('Initial PoR update failed:', error);
    });

    // Set up periodic updates
    const intervalMs = this.updateIntervalHours * 60 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.updateProofOfReserves().catch(error => {
        logger.error('Scheduled PoR update failed:', error);
      });
    }, intervalMs);

    logger.info('PoR Publisher started', {
      intervalHours: this.updateIntervalHours,
      nextUpdate: new Date(Date.now() + intervalMs).toISOString()
    });
  }

  /**
   * Stop the PoR publishing service
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('PoR Publisher stopped');
  }

  /**
   * Update proof of reserves
   */
  async updateProofOfReserves() {
    try {
      logger.info('Starting PoR update process');

      // Query all reserve accounts
      const reserves = await this.queryAllReserves();

      // Calculate total reserves
      const totalReserves = this.calculateTotalReserves(reserves);

      // Get current circulating supply
      const circulatingSupply = await this.getCirculatingSupply();

      // Create PoR snapshot
      const snapshot = await this.createPoRSnapshot(reserves, totalReserves, circulatingSupply);

      // Update on-chain PoR aggregator (mock implementation)
      const onChainResult = await this.updateOnChainPoR(snapshot);

      // Update database record
      await this.updatePoRDatabase(snapshot, onChainResult);

      logger.info('PoR update completed successfully', {
        snapshotId: snapshot.id,
        totalReserves: totalReserves.usd,
        circulatingSupply: circulatingSupply.usd,
        reserveRatio: snapshot.reserveRatio,
        onChainTxHash: onChainResult.transactionHash
      });

      return snapshot;

    } catch (error) {
      logger.error('PoR update failed:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Query all reserve accounts
   */
  async queryAllReserves() {
    const reserves = [];

    for (const [name, account] of Object.entries(this.reserveAccounts)) {
      try {
        logger.info(`Querying ${name} reserves`);

        const balance = await account.checkBalance();

        reserves.push({
          accountName: name,
          accountType: account.type,
          accountId: account.accountId,
          balance: balance,
          lastUpdated: new Date(),
          status: 'ACTIVE'
        });

        logger.info(`${name} balance retrieved`, {
          balance: balance.usd,
          currency: balance.currency
        });

      } catch (error) {
        logger.error(`Failed to query ${name} reserves:`, error);

        reserves.push({
          accountName: name,
          accountType: account.type,
          accountId: account.accountId,
          balance: { usd: 0, currency: 'USD', raw: 0 },
          lastUpdated: new Date(),
          status: 'ERROR',
          error: error.message
        });
      }
    }

    return reserves;
  }

  /**
   * Calculate total reserves across all accounts
   */
  calculateTotalReserves(reserves) {
    const total = reserves.reduce((sum, reserve) => {
      return sum + (reserve.balance.usd || 0);
    }, 0);

    return {
      usd: total,
      currency: 'USD',
      breakdown: reserves.map(r => ({
        account: r.accountName,
        amount: r.balance.usd,
        percentage: total > 0 ? ((r.balance.usd || 0) / total * 100).toFixed(2) : 0
      }))
    };
  }

  /**
   * Get current circulating supply of C12USD
   */
  async getCirculatingSupply() {
    try {
      // Query database for total minted tokens
      const totalMinted = await prisma.receipt.aggregate({
        _sum: {
          usdAmount: true
        },
        where: {
          status: 'MINTED'
        }
      });

      // Query database for total redeemed tokens
      const totalRedeemed = await prisma.redemption.aggregate({
        _sum: {
          usdAmount: true
        },
        where: {
          status: 'COMPLETED'
        }
      });

      const minted = totalMinted._sum.usdAmount || 0;
      const redeemed = totalRedeemed._sum.usdAmount || 0;
      const circulating = minted - redeemed;

      return {
        usd: circulating,
        minted: minted,
        redeemed: redeemed,
        currency: 'USD'
      };

    } catch (error) {
      logger.error('Failed to get circulating supply:', error);
      return { usd: 0, minted: 0, redeemed: 0, currency: 'USD' };
    }
  }

  /**
   * Create PoR snapshot record
   */
  async createPoRSnapshot(reserves, totalReserves, circulatingSupply) {
    const reserveRatio = circulatingSupply.usd > 0 ?
      (totalReserves.usd / circulatingSupply.usd * 100).toFixed(2) : 100;

    const snapshot = await prisma.porSnapshot.create({
      data: {
        totalReserves: totalReserves.usd,
        circulatingSupply: circulatingSupply.usd,
        reserveRatio: parseFloat(reserveRatio),
        reserves: {
          accounts: reserves,
          breakdown: totalReserves.breakdown,
          queryTimestamp: new Date().toISOString()
        },
        status: 'CREATED'
      }
    });

    return snapshot;
  }

  /**
   * Update on-chain PoR aggregator (mock implementation)
   */
  async updateOnChainPoR(snapshot) {
    // This is a mock implementation
    // In production, this would call the actual PoR aggregator contract

    logger.info('Updating on-chain PoR aggregator', {
      snapshotId: snapshot.id,
      totalReserves: snapshot.totalReserves,
      reserveRatio: snapshot.reserveRatio
    });

    // Mock transaction hash and details
    const mockTxHash = `0x${crypto.randomBytes(32).toString('hex')}`;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      transactionHash: mockTxHash,
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: '150000',
      confirmed: true
    };
  }

  /**
   * Update PoR database with on-chain transaction details
   */
  async updatePoRDatabase(snapshot, onChainResult) {
    await prisma.porSnapshot.update({
      where: { id: snapshot.id },
      data: {
        status: 'PUBLISHED',
        txHash: onChainResult.transactionHash,
        blockNumber: onChainResult.blockNumber,
        publishedAt: new Date()
      }
    });

    logger.info('PoR database updated', {
      snapshotId: snapshot.id,
      txHash: onChainResult.transactionHash
    });
  }

  /**
   * Get latest PoR snapshot
   */
  async getLatestSnapshot() {
    return prisma.porSnapshot.findFirst({
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get PoR history
   */
  async getPoRHistory(limit = 10, offset = 0) {
    const [snapshots, total] = await Promise.all([
      prisma.porSnapshot.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.porSnapshot.count()
    ]);

    return {
      snapshots,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + snapshots.length
      }
    };
  }

  /**
   * Mock bank balance (replace with real bank API integration)
   */
  async getMockBankBalance() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      usd: 50000 + Math.random() * 10000, // $50k - $60k
      currency: 'USD',
      raw: 50000 + Math.random() * 10000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Mock Cash App balance (replace with Cash App Business API)
   */
  async getMockCashAppBalance() {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      usd: 25000 + Math.random() * 5000, // $25k - $30k
      currency: 'USD',
      raw: 25000 + Math.random() * 5000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Mock treasury bills balance (replace with treasury platform API)
   */
  async getMockTreasuryBalance() {
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      usd: 100000 + Math.random() * 20000, // $100k - $120k
      currency: 'USD',
      raw: 100000 + Math.random() * 20000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get PoR service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateIntervalHours: this.updateIntervalHours,
      nextUpdate: this.intervalId ?
        new Date(Date.now() + this.updateIntervalHours * 60 * 60 * 1000).toISOString() :
        null,
      reserveAccounts: Object.keys(this.reserveAccounts)
    };
  }
}

// Create singleton instance
let porPublisherInstance = null;

function getPoRPublisher() {
  if (!porPublisherInstance) {
    porPublisherInstance = new PoRPublisher();
  }
  return porPublisherInstance;
}

function startPoRPublisher() {
  const publisher = getPoRPublisher();
  publisher.start();
  return publisher;
}

module.exports = {
  PoRPublisher,
  getPoRPublisher,
  startPoRPublisher
};