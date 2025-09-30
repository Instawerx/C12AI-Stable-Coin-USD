/**
 * Firestore Data Seeding Script for C12USD Stablecoin
 *
 * This script populates the Firestore database with synthetic data for testing
 * and development purposes.
 *
 * Project: c12ai-dao-b3bbb
 * Usage: node scripts/seed-firestore.js
 */

const admin = require('firebase-admin');
const { faker } = require('@faker-js/faker');

// Initialize Firebase Admin SDK
// You need to set GOOGLE_APPLICATION_CREDENTIALS environment variable
// or place serviceAccountKey.json in the root directory
let app;
try {
  // Try to use service account key file if it exists
  const serviceAccount = require('../serviceAccountKey.json');
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'c12ai-dao-b3bbb'
  });
} catch (error) {
  // Fall back to default credentials (useful for Cloud Shell/CI)
  app = admin.initializeApp({
    projectId: 'c12ai-dao-b3bbb'
  });
}

const db = admin.firestore();

// Contract addresses from deployment
const CONTRACTS = {
  BSC: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
  POLYGON: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811'
};

// LayerZero Endpoint IDs
const LAYERZERO_ENDPOINTS = {
  BSC: 102,
  POLYGON: 109
};

// Helper function to generate random wallet address
function generateWalletAddress() {
  return '0x' + faker.string.hexadecimal({ length: 40, casing: 'lower', prefix: '' });
}

// Helper function to generate random transaction hash
function generateTxHash() {
  return '0x' + faker.string.hexadecimal({ length: 64, casing: 'lower', prefix: '' });
}

// Helper function to get random past date within last 30 days
function getRandomPastDate(daysAgo = 30) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return admin.firestore.Timestamp.fromDate(pastDate);
}

// Seed Config Collection
async function seedConfig() {
  console.log('🔧 Seeding config collection...');

  const configData = [
    {
      id: 'chains',
      data: {
        supported: ['bsc', 'polygon'],
        default: 'bsc',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'contracts-bsc',
      data: {
        chainId: 56,
        chainName: 'BSC',
        contractAddress: CONTRACTS.BSC,
        layerZeroEndpointId: LAYERZERO_ENDPOINTS.BSC,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        blockExplorer: 'https://bscscan.com',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'contracts-polygon',
      data: {
        chainId: 137,
        chainName: 'Polygon',
        contractAddress: CONTRACTS.POLYGON,
        layerZeroEndpointId: LAYERZERO_ENDPOINTS.POLYGON,
        rpcUrl: 'https://polygon-rpc.com/',
        blockExplorer: 'https://polygonscan.com',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'fees',
      data: {
        flashLoanFee: 0.0005, // 0.05%
        flashLoanFeePercent: '0.05',
        bridgeFee: 0.001, // 0.1%
        bridgeFeePercent: '0.1',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'limits',
      data: {
        maxMintPerTransaction: '1000000', // 1M C12USD
        maxRedeemPerTransaction: '1000000',
        dailyMintLimit: '10000000', // 10M C12USD
        dailyRedeemLimit: '10000000',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ];

  const batch = db.batch();
  for (const { id, data } of configData) {
    const ref = db.collection('config').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log(`✅ Created ${configData.length} config documents`);
  return configData.length;
}

// Seed Proof-of-Reserves Collection
async function seedProofOfReserves() {
  console.log('🔐 Seeding proof-of-reserves collection...');

  const reservesData = [
    {
      id: 'bsc-latest',
      data: {
        chain: 'bsc',
        chainId: 56,
        totalSupply: '100000000', // 100M C12USD
        collateralValue: '100500000', // 100.5M USDC (105% collateralized)
        collateralRatio: 1.05,
        attestationTimestamp: getRandomPastDate(1),
        attestationProvider: 'Chainlink Proof of Reserve',
        verificationStatus: 'verified',
        lastVerified: getRandomPastDate(1),
        nextVerification: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'polygon-latest',
      data: {
        chain: 'polygon',
        chainId: 137,
        totalSupply: '100000000', // 100M C12USD
        collateralValue: '101000000', // 101M USDC (101% collateralized)
        collateralRatio: 1.01,
        attestationTimestamp: getRandomPastDate(1),
        attestationProvider: 'Chainlink Proof of Reserve',
        verificationStatus: 'verified',
        lastVerified: getRandomPastDate(1),
        nextVerification: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'aggregate',
      data: {
        totalSupplyAllChains: '200000000', // 200M total
        totalCollateralAllChains: '201500000', // 201.5M total
        overallCollateralRatio: 1.0075,
        chains: ['bsc', 'polygon'],
        lastAggregated: getRandomPastDate(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ];

  const batch = db.batch();
  for (const { id, data } of reservesData) {
    const ref = db.collection('proof-of-reserves').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log(`✅ Created ${reservesData.length} proof-of-reserves documents`);
  return reservesData.length;
}

// Seed Sample Users Collection
async function seedUsers() {
  console.log('👥 Seeding users collection...');

  const users = [];
  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const walletAddress = generateWalletAddress();

    users.push({
      id: walletAddress,
      data: {
        email: faker.internet.email({ firstName, lastName }),
        displayName: `${firstName} ${lastName}`,
        walletAddress: walletAddress,
        createdAt: getRandomPastDate(30),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        preferences: {
          defaultChain: faker.helpers.arrayElement(['bsc', 'polygon']),
          notifications: {
            email: faker.datatype.boolean(),
            push: faker.datatype.boolean()
          },
          theme: faker.helpers.arrayElement(['light', 'dark', 'auto'])
        },
        kyc: {
          status: faker.helpers.arrayElement(['pending', 'approved', 'rejected', 'not_started']),
          tier: faker.helpers.arrayElement(['basic', 'advanced', 'pro'])
        },
        stats: {
          totalTransactions: faker.number.int({ min: 0, max: 100 }),
          totalVolume: faker.finance.amount({ min: 1000, max: 100000, dec: 2 }),
          lastActive: getRandomPastDate(7)
        }
      }
    });
  }

  const batch = db.batch();
  for (const { id, data } of users) {
    const ref = db.collection('users').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log(`✅ Created ${users.length} user documents`);
  return { count: users.length, addresses: users.map(u => u.id) };
}

// Seed Sample Transactions Collection
async function seedTransactions(userAddresses) {
  console.log('💳 Seeding transactions collection...');

  const transactionTypes = ['mint', 'redeem', 'transfer', 'bridge'];
  const statuses = ['completed', 'pending', 'failed'];
  const chains = ['bsc', 'polygon'];

  const transactions = [];

  for (let i = 0; i < 20; i++) {
    const txType = faker.helpers.arrayElement(transactionTypes);
    const status = faker.helpers.weightedArrayElement([
      { weight: 8, value: 'completed' },
      { weight: 1, value: 'pending' },
      { weight: 1, value: 'failed' }
    ]);
    const chain = faker.helpers.arrayElement(chains);
    const fromAddress = faker.helpers.arrayElement(userAddresses);
    const toAddress = txType === 'transfer' ? faker.helpers.arrayElement(userAddresses) : fromAddress;
    const amount = faker.finance.amount({ min: 100, max: 50000, dec: 2 });
    const txHash = generateTxHash();

    const txData = {
      id: txHash,
      data: {
        type: txType,
        status: status,
        chain: chain,
        chainId: chain === 'bsc' ? 56 : 137,
        fromAddress: fromAddress,
        toAddress: toAddress,
        amount: amount,
        txHash: txHash,
        blockNumber: faker.number.int({ min: 30000000, max: 40000000 }),
        timestamp: getRandomPastDate(30),
        gasUsed: faker.number.int({ min: 50000, max: 200000 }).toString(),
        gasPrice: faker.number.int({ min: 5, max: 50 }).toString(),
        fee: faker.finance.amount({ min: 0.1, max: 5, dec: 4 }),
        createdAt: getRandomPastDate(30),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    // Add bridge-specific fields
    if (txType === 'bridge') {
      txData.data.sourceChain = chain;
      txData.data.destinationChain = chain === 'bsc' ? 'polygon' : 'bsc';
      txData.data.bridgeStatus = status === 'completed' ? 'delivered' : 'in_transit';
      txData.data.layerZeroNonce = faker.number.int({ min: 1, max: 1000 });
    }

    // Add status details
    if (status === 'failed') {
      txData.data.error = faker.helpers.arrayElement([
        'Insufficient balance',
        'Gas price too low',
        'Transaction reverted',
        'Network congestion'
      ]);
    }

    transactions.push(txData);
  }

  const batch = db.batch();
  for (const { id, data } of transactions) {
    const ref = db.collection('transactions').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log(`✅ Created ${transactions.length} transaction documents`);
  return transactions.length;
}

// Seed Rate Limits Collection
async function seedRateLimits() {
  console.log('⏱️ Seeding rate-limits collection...');

  const rateLimitsData = [
    {
      id: 'default',
      data: {
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
        maxRequestsPerDay: 10000,
        description: 'Default rate limit for all users',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'mint',
      data: {
        maxTransactionsPerHour: 10,
        maxTransactionsPerDay: 50,
        maxAmountPerTransaction: '1000000',
        maxAmountPerDay: '5000000',
        description: 'Rate limits for mint operations',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'redeem',
      data: {
        maxTransactionsPerHour: 10,
        maxTransactionsPerDay: 50,
        maxAmountPerTransaction: '1000000',
        maxAmountPerDay: '5000000',
        description: 'Rate limits for redeem operations',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    },
    {
      id: 'bridge',
      data: {
        maxTransactionsPerHour: 5,
        maxTransactionsPerDay: 20,
        maxAmountPerTransaction: '500000',
        maxAmountPerDay: '2000000',
        description: 'Rate limits for bridge operations',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    }
  ];

  const batch = db.batch();
  for (const { id, data } of rateLimitsData) {
    const ref = db.collection('rate-limits').doc(id);
    batch.set(ref, data);
  }
  await batch.commit();

  console.log(`✅ Created ${rateLimitsData.length} rate-limit documents`);
  return rateLimitsData.length;
}

// Main seeding function
async function seedAll() {
  console.log('🌱 Starting Firestore data seeding for C12USD...\n');
  console.log('Project: c12ai-dao-b3bbb');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  const results = {
    config: 0,
    proofOfReserves: 0,
    users: 0,
    transactions: 0,
    rateLimits: 0
  };

  try {
    // Seed all collections
    results.config = await seedConfig();
    results.proofOfReserves = await seedProofOfReserves();

    const userResult = await seedUsers();
    results.users = userResult.count;

    results.transactions = await seedTransactions(userResult.addresses);
    results.rateLimits = await seedRateLimits();

    console.log('\n✨ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Config documents: ${results.config}`);
    console.log(`   - Proof-of-Reserves documents: ${results.proofOfReserves}`);
    console.log(`   - User documents: ${results.users}`);
    console.log(`   - Transaction documents: ${results.transactions}`);
    console.log(`   - Rate-limit documents: ${results.rateLimits}`);
    console.log(`   - Total documents: ${Object.values(results).reduce((a, b) => a + b, 0)}`);

    // Display sample data
    console.log('\n📋 Sample Data:');
    await displaySampleData();

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Display sample data from each collection
async function displaySampleData() {
  try {
    // Config sample
    const configDoc = await db.collection('config').doc('chains').get();
    console.log('\n🔧 Config Sample (chains):');
    console.log(JSON.stringify(configDoc.data(), null, 2));

    // Proof of Reserves sample
    const porDoc = await db.collection('proof-of-reserves').doc('aggregate').get();
    console.log('\n🔐 Proof-of-Reserves Sample (aggregate):');
    console.log(JSON.stringify(porDoc.data(), null, 2));

    // User sample
    const usersSnapshot = await db.collection('users').limit(1).get();
    if (!usersSnapshot.empty) {
      console.log('\n👥 User Sample:');
      usersSnapshot.forEach(doc => {
        console.log(`   Address: ${doc.id}`);
        console.log(`   Email: ${doc.data().email}`);
        console.log(`   Display Name: ${doc.data().displayName}`);
      });
    }

    // Transaction sample
    const txSnapshot = await db.collection('transactions').where('status', '==', 'completed').limit(1).get();
    if (!txSnapshot.empty) {
      console.log('\n💳 Transaction Sample:');
      txSnapshot.forEach(doc => {
        console.log(`   Hash: ${doc.id}`);
        console.log(`   Type: ${doc.data().type}`);
        console.log(`   Amount: ${doc.data().amount}`);
        console.log(`   Chain: ${doc.data().chain}`);
      });
    }

  } catch (error) {
    console.error('Error displaying sample data:', error);
  }
}

// Verify document counts
async function verifySeeding() {
  console.log('\n🔍 Verifying seeded data...');

  const collections = ['config', 'proof-of-reserves', 'users', 'transactions', 'rate-limits'];
  const counts = {};

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    counts[collectionName] = snapshot.size;
    console.log(`   ${collectionName}: ${snapshot.size} documents`);
  }

  return counts;
}

// Run seeding and verification
async function main() {
  try {
    await seedAll();
    await verifySeeding();
    console.log('\n✅ All operations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Execute main function
main();