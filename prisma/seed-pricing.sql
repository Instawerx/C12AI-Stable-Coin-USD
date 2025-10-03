-- Pricing Configuration for C12USD Manual Payment System
-- Run this after the Prisma migration to populate system configuration

-- Insert pricing configuration
INSERT INTO system_config (id, key, value, description, "updatedBy", "updatedAt")
VALUES
  (gen_random_uuid(), 'C12USD_PRICE_USD', '1.00', 'C12USD price in USD (fixed 1:1 peg)', 'system', NOW()),
  (gen_random_uuid(), 'C12DAO_PRICE_USD', '3.30', 'C12DAO price in USD (current market price)', 'system', NOW()),
  (gen_random_uuid(), 'MIN_PURCHASE_USD', '10.00', 'Minimum purchase amount in USD', 'system', NOW()),
  (gen_random_uuid(), 'MAX_PURCHASE_USD', '50000.00', 'Maximum purchase amount without enhanced KYC', 'system', NOW()),
  (gen_random_uuid(), 'MANUAL_PAYMENT_EXPIRY_HOURS', '24', 'Hours until manual payment submission expires', 'system', NOW()),
  (gen_random_uuid(), 'ADMIN_WALLET_ADDRESS', '0x7903c63CB9f42284d03BC2a124474760f9C1390b', 'Admin wallet for receiving payments', 'system', NOW()),
  (gen_random_uuid(), 'CASH_APP_CASHTAG', '$C12Ai', 'Cash App cashtag for payments', 'system', NOW()),
  (gen_random_uuid(), 'CASH_APP_URL', 'https://cash.app/$C12Ai', 'Cash App payment URL', 'system', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      "updatedAt" = NOW();

-- Verify insertion
SELECT key, value, description FROM system_config WHERE key LIKE 'C12%' OR key LIKE 'MANUAL%' OR key LIKE 'ADMIN%' OR key LIKE 'CASH_APP%';
