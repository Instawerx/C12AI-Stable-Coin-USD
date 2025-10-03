import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create initial system configuration
  const configs = [
    {
      key: 'PILOT_MAX_SUPPLY_USD',
      value: '100.00',
      description: 'Maximum USD supply for pilot phase',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'MIN_MINT_AMOUNT_USD',
      value: '1.00',
      description: 'Minimum USD amount for minting',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'MIN_REDEEM_AMOUNT_USD',
      value: '1.00',
      description: 'Minimum USD amount for redemption',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'MINT_FEE_BPS',
      value: '0',
      description: 'Minting fee in basis points (0 = no fee)',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'REDEEM_FEE_BPS',
      value: '0',
      description: 'Redemption fee in basis points (0 = no fee)',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'POR_UPDATE_INTERVAL_HOURS',
      value: '1',
      description: 'How often to update Proof of Reserve data',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'MIN_COLLATERAL_RATIO',
      value: '1.0000',
      description: 'Minimum collateral ratio (1.0000 = 100%)',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    {
      key: 'CIRCUIT_BREAKER_ENABLED',
      value: 'true',
      description: 'Whether circuit breaker is active',
      updatedBy: '0x0000000000000000000000000000000000000000'
    },
    // Manual Payment System Configuration
    {
      key: 'C12USD_PRICE_USD',
      value: '1.00',
      description: 'C12USD price in USD (fixed 1:1 peg)',
      updatedBy: 'system'
    },
    {
      key: 'C12DAO_PRICE_USD',
      value: '3.30',
      description: 'C12DAO price in USD (current market price)',
      updatedBy: 'system'
    },
    {
      key: 'MIN_PURCHASE_USD',
      value: '10.00',
      description: 'Minimum purchase amount in USD',
      updatedBy: 'system'
    },
    {
      key: 'MAX_PURCHASE_USD',
      value: '50000.00',
      description: 'Maximum purchase amount without enhanced KYC',
      updatedBy: 'system'
    },
    {
      key: 'MANUAL_PAYMENT_EXPIRY_HOURS',
      value: '24',
      description: 'Hours until manual payment submission expires',
      updatedBy: 'system'
    },
    {
      key: 'ADMIN_WALLET_ADDRESS',
      value: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
      description: 'Admin wallet for receiving payments',
      updatedBy: 'system'
    },
    {
      key: 'CASH_APP_CASHTAG',
      value: '$C12Ai',
      description: 'Cash App cashtag for payments',
      updatedBy: 'system'
    },
    {
      key: 'CASH_APP_URL',
      value: 'https://cash.app/$C12Ai',
      description: 'Cash App payment URL',
      updatedBy: 'system'
    }
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config
    });
  }

  // Create initial reserve snapshot (empty state)
  await prisma.reserveSnapshot.create({
    data: {
      totalUsdReserve: '0.000000',
      totalSupply: '0.000000000000000000',
      bscSupply: '0.000000000000000000',
      polygonSupply: '0.000000000000000000',
      stripeBalance: '0.000000',
      cashAppBalance: '0.000000',
      bankBalance: '0.000000',
      collateralRatio: '1.0000',
      isHealthy: true,
      blockNumber: 0
    }
  });

  // Create audit log for seeding
  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entityType: 'seed',
      entityId: 'initial_seed',
      adminAddress: '0x0000000000000000000000000000000000000000',
      newData: {
        action: 'database_seeded',
        timestamp: new Date().toISOString(),
        configs_created: configs.length,
        initial_snapshot_created: true
      }
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created ${configs.length} system configurations`);
  console.log('📈 Created initial reserve snapshot');
  console.log('📝 Created audit log entry');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });