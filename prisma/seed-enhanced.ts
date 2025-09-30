import { PrismaClient } from '../generated/prisma';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Helper functions for generating realistic test data
function randomAddress(): string {
  return `0x${randomBytes(20).toString('hex')}`;
}

function randomHash(): string {
  return `0x${randomBytes(32).toString('hex')}`;
}

function randomDecimal(min: number, max: number, decimals: number = 6): string {
  const value = Math.random() * (max - min) + min;
  return value.toFixed(decimals);
}

function randomBigInt(min: number, max: number): string {
  return Math.floor(Math.random() * (max - min) + min).toString();
}

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌱 Seeding enhanced C12USD database with comprehensive test data...');

  // Clean existing data first
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.complianceCheck.deleteMany();
  await prisma.crossChainTransfer.deleteMany();
  await prisma.flashLoanRequest.deleteMany();
  await prisma.treasuryOperation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.redeemReceipt.deleteMany();
  await prisma.mintReceipt.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.reserveSnapshot.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.rateLimit.deleteMany();

  // 1. Create system configuration
  console.log('⚙️ Creating system configuration...');
  const systemConfigs = [
    // Limits and fees
    { key: 'PILOT_MAX_SUPPLY_USD', value: '100000.00', dataType: 'NUMBER', category: 'limits', description: 'Maximum USD supply for pilot phase' },
    { key: 'MIN_MINT_AMOUNT_USD', value: '1.00', dataType: 'NUMBER', category: 'limits', description: 'Minimum USD amount for minting' },
    { key: 'MIN_REDEEM_AMOUNT_USD', value: '1.00', dataType: 'NUMBER', category: 'limits', description: 'Minimum USD amount for redemption' },
    { key: 'MAX_MINT_AMOUNT_USD', value: '10000.00', dataType: 'NUMBER', category: 'limits', description: 'Maximum USD amount for minting' },
    { key: 'MAX_REDEEM_AMOUNT_USD', value: '10000.00', dataType: 'NUMBER', category: 'limits', description: 'Maximum USD amount for redemption' },
    { key: 'MINT_FEE_BPS', value: '0', dataType: 'NUMBER', category: 'fees', description: 'Minting fee in basis points (0 = no fee)' },
    { key: 'REDEEM_FEE_BPS', value: '0', dataType: 'NUMBER', category: 'fees', description: 'Redemption fee in basis points (0 = no fee)' },

    // Compliance and security
    { key: 'MIN_COLLATERAL_RATIO', value: '1.0000', dataType: 'NUMBER', category: 'compliance', description: 'Minimum collateral ratio (1.0000 = 100%)' },
    { key: 'CIRCUIT_BREAKER_ENABLED', value: 'true', dataType: 'BOOLEAN', category: 'security', description: 'Whether circuit breaker is active' },
    { key: 'KYC_REQUIRED', value: 'false', dataType: 'BOOLEAN', category: 'compliance', description: 'Whether KYC is required for all operations' },
    { key: 'MAX_RISK_SCORE', value: '75', dataType: 'NUMBER', category: 'compliance', description: 'Maximum allowed risk score' },

    // System settings
    { key: 'POR_UPDATE_INTERVAL_HOURS', value: '1', dataType: 'NUMBER', category: 'system', description: 'How often to update Proof of Reserve data' },
    { key: 'RATE_LIMIT_PER_HOUR', value: '100', dataType: 'NUMBER', category: 'security', description: 'API requests per user per hour' },
    { key: 'SESSION_TIMEOUT_HOURS', value: '24', dataType: 'NUMBER', category: 'security', description: 'User session timeout in hours' },

    // Contract addresses (placeholder)
    { key: 'BSC_TOKEN_ADDRESS', value: randomAddress(), dataType: 'STRING', category: 'contracts', description: 'BSC token contract address' },
    { key: 'POLYGON_TOKEN_ADDRESS', value: randomAddress(), dataType: 'STRING', category: 'contracts', description: 'Polygon token contract address' },
    { key: 'BSC_GATEWAY_ADDRESS', value: randomAddress(), dataType: 'STRING', category: 'contracts', description: 'BSC gateway contract address' },
    { key: 'POLYGON_GATEWAY_ADDRESS', value: randomAddress(), dataType: 'STRING', category: 'contracts', description: 'Polygon gateway contract address' },

    // Flash loan settings
    { key: 'FLASH_LOAN_ENABLED', value: 'true', dataType: 'BOOLEAN', category: 'features', description: 'Whether flash loans are enabled' },
    { key: 'FLASH_LOAN_FEE_BPS', value: '5', dataType: 'NUMBER', category: 'fees', description: 'Flash loan fee in basis points' },
    { key: 'MAX_FLASH_LOAN_AMOUNT', value: '50000.00', dataType: 'NUMBER', category: 'limits', description: 'Maximum flash loan amount in USD' },
  ];

  const adminAddress = '0x742d35Cc6634C0532925a3b8D4631d1e0C5a67F8'; // Sample admin address

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({
      data: {
        ...config,
        updatedBy: adminAddress,
      }
    });
  }

  // 2. Create test users with various profiles
  console.log('👥 Creating test users...');
  const testUsers = [];
  const userAddresses = [
    '0x8ba1f109551bD432803012645Hac136c30FF3E14',
    '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
    '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
    '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
  ];

  for (let i = 0; i < userAddresses.length; i++) {
    const user = await prisma.user.create({
      data: {
        address: userAddresses[i],
        email: `user${i + 1}@test.com`,
        phoneNumber: `+1555000010${i}`,
        firstName: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'][i],
        lastName: ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller'][i],
        dateOfBirth: randomDate(new Date('1980-01-01'), new Date('2000-12-31')),
        country: randomFromArray(['USA', 'UK', 'Canada', 'Germany', 'Japan']),
        status: randomFromArray(['ACTIVE', 'ACTIVE', 'ACTIVE', 'SUSPENDED']), // Mostly active
        kycStatus: randomFromArray(['APPROVED', 'APPROVED', 'IN_PROGRESS', 'NOT_STARTED']),
        kycTier: randomFromArray([0, 1, 2]),
        riskScore: Math.floor(Math.random() * 100),
        isBlacklisted: i === 4, // Last user is blacklisted
        lastLoginAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
    testUsers.push(user);
  }

  // 3. Create user sessions
  console.log('🔐 Creating user sessions...');
  for (const user of testUsers.slice(0, 3)) { // Only active users have sessions
    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionToken: randomBytes(32).toString('hex'),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        country: user.country,
        city: randomFromArray(['New York', 'London', 'Toronto', 'Berlin', 'Tokyo']),
        isActive: true,
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isSuspicious: Math.random() < 0.1, // 10% chance
      }
    });
  }

  // 4. Create KYC documents
  console.log('📄 Creating KYC documents...');
  for (const user of testUsers) {
    if (user.kycStatus !== 'NOT_STARTED') {
      const docTypes = ['PASSPORT', 'DRIVERS_LICENSE', 'PROOF_OF_ADDRESS'];
      for (const docType of docTypes) {
        await prisma.kycDocument.create({
          data: {
            userId: user.id,
            type: docType as any,
            status: user.kycStatus === 'APPROVED' ? 'APPROVED' : randomFromArray(['PENDING', 'APPROVED']),
            filename: `${user.firstName}_${docType.toLowerCase()}.pdf`,
            storageUrl: `/kyc/${user.id}/${docType.toLowerCase()}.pdf`,
            mimeType: docType === 'PROOF_OF_ADDRESS' ? 'application/pdf' : 'image/jpeg',
            fileSize: Math.floor(Math.random() * 5 * 1024 * 1024), // Up to 5MB
            verifiedBy: user.kycStatus === 'APPROVED' ? adminAddress : null,
            verifiedAt: user.kycStatus === 'APPROVED' ? randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null,
          }
        });
      }
    }
  }

  // 5. Create mint receipts with realistic transaction history
  console.log('💰 Creating mint receipts...');
  const mintReceipts = [];
  for (let i = 0; i < 25; i++) {
    const user = randomFromArray(testUsers.slice(0, 4)); // Exclude blacklisted user
    const amount = randomDecimal(10, 1000, 2);
    const tokenAmount = randomDecimal(parseFloat(amount) * 0.99, parseFloat(amount) * 1.01, 18); // ~1:1 ratio with slight variation

    const mintReceipt = await prisma.mintReceipt.create({
      data: {
        userId: user.id,
        amount: amount,
        tokenAmount: tokenAmount,
        chain: randomFromArray(['BSC', 'POLYGON']),
        status: randomFromArray(['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING', 'FAILED']), // Mostly completed
        paymentMethod: randomFromArray(['STRIPE', 'CASHAPP', 'BANK_TRANSFER']),
        paymentId: `pay_${randomBytes(16).toString('hex')}`,
        paymentHash: randomHash(),
        paymentFee: randomDecimal(0.5, 3.0, 2),
        txHash: randomHash(),
        blockNumber: BigInt(randomBigInt(18000000, 20000000)),
        gasUsed: BigInt(randomBigInt(21000, 100000)),
        gasPrice: BigInt(randomBigInt(10000000000, 50000000000)),
        receipt: `receipt_${randomBytes(16).toString('hex')}`,
        signature: randomHash(),
        nonce: randomBytes(32).toString('hex'),
        exchangeRate: randomDecimal(0.998, 1.002, 8),
        mintFee: randomDecimal(0, 1.0, 6),
        totalFees: randomDecimal(1.0, 4.0, 6),
        riskScore: Math.floor(Math.random() * 50), // Lower risk scores for mints
        complianceFlags: Math.random() < 0.1 ? { flags: ['high_amount'] } : {},
        createdAt: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
        completedAt: randomDate(new Date(Date.now() - 89 * 24 * 60 * 60 * 1000), new Date()),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });
    mintReceipts.push(mintReceipt);
  }

  // 6. Create redeem receipts
  console.log('💸 Creating redeem receipts...');
  const redeemReceipts = [];
  for (let i = 0; i < 15; i++) {
    const user = randomFromArray(testUsers.slice(0, 4));
    const amount = randomDecimal(5, 500, 2);
    const tokenAmount = randomDecimal(parseFloat(amount) * 0.99, parseFloat(amount) * 1.01, 18);

    const redeemReceipt = await prisma.redeemReceipt.create({
      data: {
        userId: user.id,
        tokenAmount: tokenAmount,
        amount: amount,
        chain: randomFromArray(['BSC', 'POLYGON']),
        status: randomFromArray(['COMPLETED', 'COMPLETED', 'PENDING', 'PAYOUT_PENDING']),
        paymentMethod: randomFromArray(['STRIPE', 'CASHAPP', 'BANK_TRANSFER']),
        paymentAddress: user.email || `bank_${randomBytes(8).toString('hex')}`,
        paymentFee: randomDecimal(1.0, 5.0, 2),
        burnTxHash: randomHash(),
        blockNumber: BigInt(randomBigInt(18000000, 20000000)),
        gasUsed: BigInt(randomBigInt(21000, 100000)),
        gasPrice: BigInt(randomBigInt(10000000000, 50000000000)),
        payoutId: `payout_${randomBytes(16).toString('hex')}`,
        payoutHash: randomHash(),
        payoutFee: randomDecimal(0.5, 2.0, 6),
        receipt: `receipt_${randomBytes(16).toString('hex')}`,
        signature: randomHash(),
        nonce: randomBytes(32).toString('hex'),
        exchangeRate: randomDecimal(0.998, 1.002, 8),
        redeemFee: randomDecimal(0, 1.0, 6),
        totalFees: randomDecimal(1.5, 7.0, 6),
        riskScore: Math.floor(Math.random() * 60),
        complianceFlags: Math.random() < 0.15 ? { flags: ['rapid_redemption'] } : {},
        createdAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
        completedAt: randomDate(new Date(Date.now() - 59 * 24 * 60 * 60 * 1000), new Date()),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    });
    redeemReceipts.push(redeemReceipt);
  }

  // 7. Create transactions
  console.log('🔗 Creating blockchain transactions...');
  for (let i = 0; i < 50; i++) {
    const user = randomFromArray(testUsers);
    const txType = randomFromArray(['MINT', 'REDEEM', 'TRANSFER', 'BRIDGE']);

    await prisma.transaction.create({
      data: {
        hash: randomHash(),
        type: txType as any,
        status: randomFromArray(['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'PENDING', 'FAILED']),
        fromAddress: randomAddress(),
        toAddress: randomAddress(),
        amount: randomDecimal(1, 1000, 18),
        chain: randomFromArray(['BSC', 'POLYGON']),
        blockNumber: BigInt(randomBigInt(18000000, 20000000)),
        blockHash: randomHash(),
        transactionIndex: Math.floor(Math.random() * 100),
        gasUsed: BigInt(randomBigInt(21000, 200000)),
        gasPrice: BigInt(randomBigInt(10000000000, 50000000000)),
        gasLimit: BigInt(randomBigInt(21000, 300000)),
        usdValue: randomDecimal(1, 1000, 6),
        fee: randomDecimal(0.001, 0.1, 18),
        metadata: { type: txType, processed: true },
        userId: user.id,
        createdAt: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
        confirmedAt: randomDate(new Date(Date.now() - 89 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
  }

  // 8. Create treasury operations
  console.log('🏦 Creating treasury operations...');
  const treasuryTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'INVESTMENT', 'RESERVE_ADJUSTMENT', 'FEE_COLLECTION'];
  for (let i = 0; i < 20; i++) {
    await prisma.treasuryOperation.create({
      data: {
        type: randomFromArray(treasuryTypes) as any,
        status: randomFromArray(['EXECUTED', 'EXECUTED', 'PENDING', 'APPROVED']),
        amount: randomDecimal(100, 50000, 6),
        currency: 'USD',
        description: `Treasury operation ${i + 1} - automated reserve management`,
        requestedBy: adminAddress,
        approvedBy: adminAddress,
        requiredApprovals: 1,
        currentApprovals: 1,
        externalId: `treas_${randomBytes(16).toString('hex')}`,
        externalHash: randomHash(),
        txHash: Math.random() < 0.7 ? randomHash() : null,
        chain: Math.random() < 0.7 ? randomFromArray(['BSC', 'POLYGON']) : null,
        blockNumber: Math.random() < 0.7 ? BigInt(randomBigInt(18000000, 20000000)) : null,
        riskAssessment: { score: Math.floor(Math.random() * 30), level: 'LOW' },
        complianceChecks: { aml: 'PASSED', sanctions: 'PASSED' },
        createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        executedAt: randomDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
  }

  // 9. Create flash loan requests
  console.log('⚡ Creating flash loan requests...');
  for (let i = 0; i < 10; i++) {
    const user = randomFromArray(testUsers.slice(0, 3)); // Only advanced users
    await prisma.flashLoanRequest.create({
      data: {
        userId: user.id,
        amount: randomDecimal(1000, 10000, 18),
        status: randomFromArray(['COMPLETED', 'COMPLETED', 'PENDING', 'CANCELLED']),
        chain: randomFromArray(['BSC', 'POLYGON']),
        collateralAmount: randomDecimal(1100, 11000, 18), // 110% collateral
        interestRate: randomDecimal(0.0005, 0.005, 4), // 0.05% to 0.5%
        duration: Math.floor(Math.random() * 3600) + 300, // 5 minutes to 1 hour
        contractAddress: randomAddress(),
        callData: randomBytes(64).toString('hex'),
        fee: randomDecimal(0.5, 50, 18),
        profit: randomDecimal(0, 100, 18),
        txHash: randomHash(),
        blockNumber: BigInt(randomBigInt(18000000, 20000000)),
        gasUsed: BigInt(randomBigInt(100000, 500000)),
        riskScore: Math.floor(Math.random() * 80),
        maxSlippage: randomDecimal(0.001, 0.05, 4), // 0.1% to 5%
        createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        executedAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
        completedAt: randomDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), new Date()),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      }
    });
  }

  // 10. Create cross-chain transfers
  console.log('🌉 Creating cross-chain transfers...');
  for (let i = 0; i < 15; i++) {
    const user = randomFromArray(testUsers.slice(0, 4));
    const fromChain = randomFromArray(['BSC', 'POLYGON']);
    const toChain = fromChain === 'BSC' ? 'POLYGON' : 'BSC';

    await prisma.crossChainTransfer.create({
      data: {
        userId: user.id,
        status: randomFromArray(['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'PENDING']),
        amount: randomDecimal(10, 1000, 18),
        fromChain: fromChain as any,
        toChain: toChain as any,
        fromAddress: user.address,
        toAddress: randomAddress(),
        srcTxHash: randomHash(),
        dstTxHash: Math.random() < 0.8 ? randomHash() : null,
        lzTxHash: randomHash(),
        nonce: BigInt(Math.floor(Math.random() * 1000000)),
        bridgeFee: randomDecimal(0.1, 2.0, 18),
        gasFee: randomDecimal(0.01, 0.5, 18),
        totalFee: randomDecimal(0.11, 2.5, 18),
        estimatedArrival: new Date(Date.now() + Math.random() * 30 * 60 * 1000), // 0-30 minutes
        retryCount: Math.floor(Math.random() * 3),
        maxRetries: 3,
        createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        completedAt: randomDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
  }

  // 11. Create compliance checks
  console.log('🔍 Creating compliance checks...');
  const complianceTypes = ['AML', 'KYC', 'SANCTIONS', 'RISK_ASSESSMENT', 'TRANSACTION_MONITORING'];
  for (let i = 0; i < 30; i++) {
    const user = randomFromArray(testUsers);
    const riskScore = Math.floor(Math.random() * 100);

    await prisma.complianceCheck.create({
      data: {
        userId: user.id,
        type: randomFromArray(complianceTypes) as any,
        status: randomFromArray(['PASSED', 'PASSED', 'PASSED', 'REVIEW_REQUIRED', 'FAILED']),
        riskScore: riskScore,
        flags: riskScore > 75 ? { flags: ['high_risk', 'manual_review'] } : riskScore > 50 ? { flags: ['medium_risk'] } : {},
        details: {
          score: riskScore,
          factors: ['transaction_volume', 'geographic_risk', 'behavioral_analysis'],
          recommendation: riskScore > 75 ? 'ESCALATE' : riskScore > 50 ? 'MONITOR' : 'APPROVE'
        },
        providerId: 'chainalysis',
        providerRef: `CA_${randomBytes(16).toString('hex')}`,
        resolution: riskScore > 75 ? 'Escalated to compliance team' : null,
        resolvedBy: riskScore > 75 ? adminAddress : null,
        resolvedAt: riskScore > 75 ? randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) : null,
        createdAt: randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
  }

  // 12. Create reserve snapshots
  console.log('📊 Creating reserve snapshots...');
  for (let i = 0; i < 30; i++) { // Daily snapshots for 30 days
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const totalUsdReserve = randomDecimal(50000, 150000, 6);
    const totalSupply = randomDecimal(49000, 149000, 18); // Slightly under-collateralized for realism

    await prisma.reserveSnapshot.create({
      data: {
        totalUsdReserve: totalUsdReserve,
        totalSupply: totalSupply,
        bscSupply: randomDecimal(parseFloat(totalSupply) * 0.4, parseFloat(totalSupply) * 0.6, 18),
        polygonSupply: randomDecimal(parseFloat(totalSupply) * 0.4, parseFloat(totalSupply) * 0.6, 18),
        stripeBalance: randomDecimal(parseFloat(totalUsdReserve) * 0.3, parseFloat(totalUsdReserve) * 0.5, 6),
        cashAppBalance: randomDecimal(parseFloat(totalUsdReserve) * 0.2, parseFloat(totalUsdReserve) * 0.4, 6),
        bankBalance: randomDecimal(parseFloat(totalUsdReserve) * 0.1, parseFloat(totalUsdReserve) * 0.3, 6),
        otherBalance: randomDecimal(0, parseFloat(totalUsdReserve) * 0.1, 6),
        treasuryBalance: randomDecimal(parseFloat(totalUsdReserve) * 0.05, parseFloat(totalUsdReserve) * 0.15, 6),
        emergencyReserve: randomDecimal(parseFloat(totalUsdReserve) * 0.05, parseFloat(totalUsdReserve) * 0.1, 6),
        collateralRatio: randomDecimal(1.0, 1.05, 4),
        isHealthy: parseFloat(totalUsdReserve) >= parseFloat(totalSupply),
        healthScore: Math.floor(Math.random() * 20) + 80, // 80-100
        auditorHash: randomHash(),
        attestationUrl: `https://por.c12usd.com/attestations/${date.toISOString().split('T')[0]}`,
        blockNumber: BigInt(randomBigInt(18000000, 20000000)),
        blockHash: randomHash(),
        generatedBy: 'por-service',
        version: '2.0',
        timestamp: date,
      }
    });
  }

  // 13. Create rate limits
  console.log('⏱️ Creating rate limit records...');
  const rateLimitTypes = ['API_REQUESTS', 'MINT_OPERATIONS', 'REDEEM_OPERATIONS', 'LOGIN_ATTEMPTS', 'FAILED_TRANSACTIONS'];
  for (let i = 0; i < 20; i++) {
    const user = randomFromArray(testUsers);
    const windowStart = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

    await prisma.rateLimit.create({
      data: {
        identifier: user.id,
        type: randomFromArray(rateLimitTypes) as any,
        windowStart: windowStart,
        windowEnd: new Date(windowStart.getTime() + 60 * 60 * 1000), // 1 hour window
        requestCount: Math.floor(Math.random() * 100),
        limit: 100,
        userAgent: 'C12USD-Client/1.0',
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        country: user.country,
        isBlocked: Math.random() < 0.05, // 5% chance of being blocked
        blockedUntil: Math.random() < 0.05 ? new Date(Date.now() + 60 * 60 * 1000) : null,
      }
    });
  }

  // 14. Create comprehensive audit logs
  console.log('📝 Creating audit logs...');
  const auditActions = ['CREATE', 'UPDATE', 'LOGIN', 'LOGOUT', 'MINT', 'REDEEM', 'TRANSFER', 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE', 'CONFIG_CHANGE', 'RESERVE_UPDATE', 'COMPLIANCE_CHECK', 'SECURITY_EVENT'];
  const entityTypes = ['user', 'mint_receipt', 'redeem_receipt', 'transaction', 'treasury_operation', 'compliance_check', 'system_config'];
  const severities = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
  const categories = ['SYSTEM', 'SECURITY', 'FINANCIAL', 'COMPLIANCE', 'USER_ACTION', 'ADMIN_ACTION'];

  for (let i = 0; i < 100; i++) {
    const user = Math.random() < 0.7 ? randomFromArray(testUsers) : null;
    const isAdminAction = Math.random() < 0.3;
    const action = randomFromArray(auditActions);
    const severity = action === 'SECURITY_EVENT' ? randomFromArray(['WARN', 'ERROR', 'CRITICAL']) : randomFromArray(severities);

    await prisma.auditLog.create({
      data: {
        action: action as any,
        entityType: randomFromArray(entityTypes),
        entityId: randomBytes(16).toString('hex'),
        userAddress: user?.address,
        adminAddress: isAdminAction ? adminAddress : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        country: user?.country || 'USA',
        sessionId: randomBytes(16).toString('hex'),
        riskScore: Math.floor(Math.random() * 100),
        securityFlags: action === 'SECURITY_EVENT' ? { flags: ['suspicious_activity', 'rate_limit_exceeded'] } : {},
        oldData: action === 'UPDATE' ? { status: 'PENDING' } : null,
        newData: action === 'UPDATE' ? { status: 'COMPLETED' } : { action: action },
        metadata: {
          ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'C12USD-Client/1.0',
          timestamp: new Date().toISOString(),
        },
        severity: severity as any,
        category: randomFromArray(categories) as any,
        correlationId: i % 10 === 0 ? randomBytes(16).toString('hex') : null, // 10% have correlation IDs
        parentLogId: i > 10 && Math.random() < 0.1 ? randomBytes(16).toString('hex') : null, // 10% are child logs
        timestamp: randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()),
      }
    });
  }

  // Summary statistics
  const stats = {
    users: await prisma.user.count(),
    userSessions: await prisma.userSession.count(),
    kycDocuments: await prisma.kycDocument.count(),
    mintReceipts: await prisma.mintReceipt.count(),
    redeemReceipts: await prisma.redeemReceipt.count(),
    transactions: await prisma.transaction.count(),
    treasuryOperations: await prisma.treasuryOperation.count(),
    flashLoanRequests: await prisma.flashLoanRequest.count(),
    crossChainTransfers: await prisma.crossChainTransfer.count(),
    complianceChecks: await prisma.complianceCheck.count(),
    reserveSnapshots: await prisma.reserveSnapshot.count(),
    systemConfigs: await prisma.systemConfig.count(),
    rateLimits: await prisma.rateLimit.count(),
    auditLogs: await prisma.auditLog.count(),
  };

  console.log('✅ Enhanced database seeded successfully!');
  console.log('📊 Statistics:');
  Object.entries(stats).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  console.log('\n🎯 Key Test Scenarios Created:');
  console.log('   • Mix of active, suspended, and blacklisted users');
  console.log('   • Various KYC statuses and documentation states');
  console.log('   • Comprehensive transaction history across chains');
  console.log('   • Treasury operations and reserve management');
  console.log('   • Flash loan examples and cross-chain transfers');
  console.log('   • Compliance checks with various risk levels');
  console.log('   • Daily reserve snapshots with health metrics');
  console.log('   • Rate limiting and security event tracking');
  console.log('   • Comprehensive audit trail with 100 log entries');

  console.log('\n🔧 Test Environment Ready:');
  console.log('   • Use test users for frontend integration testing');
  console.log('   • Realistic financial data for reporting features');
  console.log('   • Compliance scenarios for regulatory testing');
  console.log('   • Security events for monitoring system testing');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding enhanced database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });