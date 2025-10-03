/**
 * Database Seed Script
 * Seeds Firestore with initial pricing configuration and system settings
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin using application default credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'c12ai-dao-b3bbb'
  });
}

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...\n');

    // Seed pricing configuration
    console.log('📊 Creating pricing configuration...');
    const pricingRef = db.collection('config').doc('pricing');
    await pricingRef.set({
      mint: {
        usd: {
          baseFee: 0.005,        // 0.5%
          minAmount: 10,
          maxAmount: 1000000,
          processingTime: '1-3 business days'
        },
        stablecoin: {
          baseFee: 0.003,        // 0.3%
          minAmount: 10,
          maxAmount: 1000000,
          processingTime: 'Instant'
        }
      },
      redeem: {
        usd: {
          baseFee: 0.005,        // 0.5%
          minAmount: 10,
          maxAmount: 1000000,
          processingTime: '1-3 business days'
        },
        stablecoin: {
          baseFee: 0.003,        // 0.3%
          minAmount: 10,
          maxAmount: 1000000,
          processingTime: 'Instant'
        }
      },
      bridge: {
        baseFee: 0.001,          // 0.1%
        gasEstimate: 0.5,        // $0.50 average
        minAmount: 10,
        maxAmount: 1000000
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    console.log('✓ Pricing configuration created');

    // Seed system settings
    console.log('⚙️  Creating system settings...');
    const settingsRef = db.collection('config').doc('system');
    await settingsRef.set({
      maintenance: {
        enabled: false,
        message: '',
        scheduledStart: null,
        scheduledEnd: null
      },
      features: {
        mintEnabled: true,
        redeemEnabled: true,
        bridgeEnabled: true,
        daoEnabled: true,
        kycRequired: true
      },
      limits: {
        dailyMintLimit: 100000,
        dailyRedeemLimit: 100000,
        userDailyLimit: 10000,
        userMonthlyLimit: 100000
      },
      compliance: {
        kycProvider: 'manual',
        amlChecksEnabled: true,
        sanctionsScreeningEnabled: true,
        restrictedCountries: ['CU', 'IR', 'KP', 'SY']
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    console.log('✓ System settings created');

    // Seed supported chains configuration
    console.log('⛓️  Creating chains configuration...');
    const chainsRef = db.collection('config').doc('chains');
    await chainsRef.set({
      supported: {
        bsc: {
          chainId: 56,
          name: 'BNB Smart Chain',
          symbol: 'BNB',
          rpcUrl: 'https://bsc-dataseed.binance.org/',
          explorerUrl: 'https://bscscan.com',
          enabled: true,
          contractAddress: '0x0000000000000000000000000000000000000000', // Replace with actual
          layerZeroEndpointId: 102
        },
        polygon: {
          chainId: 137,
          name: 'Polygon',
          symbol: 'MATIC',
          rpcUrl: 'https://polygon-rpc.com/',
          explorerUrl: 'https://polygonscan.com',
          enabled: true,
          contractAddress: '0x0000000000000000000000000000000000000000', // Replace with actual
          layerZeroEndpointId: 109
        },
        ethereum: {
          chainId: 1,
          name: 'Ethereum',
          symbol: 'ETH',
          rpcUrl: 'https://eth.llamarpc.com',
          explorerUrl: 'https://etherscan.io',
          enabled: false,
          contractAddress: '0x0000000000000000000000000000000000000000', // Replace with actual
          layerZeroEndpointId: 101
        }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    console.log('✓ Chains configuration created');

    // Seed payment methods configuration
    console.log('💳 Creating payment methods configuration...');
    const paymentMethodsRef = db.collection('config').doc('paymentMethods');
    await paymentMethodsRef.set({
      methods: {
        stripe: {
          enabled: true,
          name: 'Credit/Debit Card',
          description: 'Pay with Visa, Mastercard, or American Express',
          processingTime: '1-3 business days',
          minAmount: 10,
          maxAmount: 10000,
          fee: 0.029, // 2.9% + $0.30
          fixedFee: 0.30
        },
        cashapp: {
          enabled: true,
          name: 'Cash App',
          description: 'Pay with Cash App',
          processingTime: '1-2 business days',
          minAmount: 10,
          maxAmount: 10000,
          fee: 0.015, // 1.5%
          cashtag: '$c12usd'
        },
        usdc: {
          enabled: true,
          name: 'USDC',
          description: 'Pay with USDC stablecoin',
          processingTime: 'Instant',
          minAmount: 10,
          maxAmount: 1000000,
          fee: 0.003, // 0.3%
          chains: ['bsc', 'polygon']
        },
        usdt: {
          enabled: true,
          name: 'USDT',
          description: 'Pay with USDT stablecoin',
          processingTime: 'Instant',
          minAmount: 10,
          maxAmount: 1000000,
          fee: 0.003, // 0.3%
          chains: ['bsc', 'polygon']
        }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    console.log('✓ Payment methods configuration created');

    // Seed KYC tiers configuration
    console.log('🔐 Creating KYC tiers configuration...');
    const kycTiersRef = db.collection('config').doc('kycTiers');
    await kycTiersRef.set({
      tiers: {
        tier0: {
          name: 'No KYC',
          dailyLimit: 0,
          monthlyLimit: 0,
          requiresVerification: false,
          requiredDocuments: []
        },
        tier1: {
          name: 'Basic',
          dailyLimit: 1000,
          monthlyLimit: 10000,
          requiresVerification: true,
          requiredDocuments: ['email']
        },
        tier2: {
          name: 'Intermediate',
          dailyLimit: 10000,
          monthlyLimit: 100000,
          requiresVerification: true,
          requiredDocuments: ['email', 'phone', 'identity']
        },
        tier3: {
          name: 'Advanced',
          dailyLimit: 100000,
          monthlyLimit: 1000000,
          requiresVerification: true,
          requiredDocuments: ['email', 'phone', 'identity', 'address']
        }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      version: '1.0.0'
    });
    console.log('✓ KYC tiers configuration created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Created collections:');
    console.log('   - config/pricing');
    console.log('   - config/system');
    console.log('   - config/chains');
    console.log('   - config/paymentMethods');
    console.log('   - config/kycTiers');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the script
seedDatabase();
