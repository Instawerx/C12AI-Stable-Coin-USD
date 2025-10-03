# 🗄️ Database Migration Instructions - Manual Payment System

**Phase:** 1.1.3
**Date:** October 2, 2025
**Status:** Ready to Execute

---

## 📋 Pre-Migration Checklist

- [ ] Backup existing database
- [ ] Ensure PostgreSQL is running
- [ ] Verify DATABASE_URL in .env file
- [ ] Stop any running application instances
- [ ] Review schema changes in `prisma/schema.prisma`

---

## 🚀 Migration Steps

### Step 1: Backup Database (CRITICAL)

```bash
# Create backup directory
mkdir -p backups

# Backup database (PostgreSQL)
pg_dump $DATABASE_URL > backups/pre-manual-payment-$(date +%Y%m%d-%H%M%S).sql

# Verify backup was created
ls -lh backups/
```

**Windows PowerShell:**
```powershell
# Create backup directory
New-Item -ItemType Directory -Force -Path backups

# Get database connection string from .env
$dbUrl = Get-Content .env | Select-String "DATABASE_URL" | ForEach-Object { $_.ToString().Split('=')[1] }

# Note: You'll need to manually backup via your PostgreSQL tool or use pg_dump if installed
```

---

### Step 2: Generate Prisma Migration

```bash
cd C12USD

# Generate migration
npx prisma migrate dev --name add_manual_payment_system

# This will:
# - Create migration files in prisma/migrations/
# - Apply migration to database
# - Regenerate Prisma Client
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "c12usd"

Applying migration `20251002_add_manual_payment_system`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251002XXXXXX_add_manual_payment_system/
      └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (4.x.x) to ./generated/prisma in XXXms
```

---

### Step 3: Run Seed Script

```bash
# Install dependencies if needed
npm install

# Run seed script to add pricing configuration
npm run seed
# OR
npx ts-node prisma/seed.ts
```

**Expected Output:**
```
🌱 Seeding database...
✅ Database seeded successfully!
📊 Created 16 system configurations
📈 Created initial reserve snapshot
📝 Created audit log entry
```

---

### Step 4: Verify Migration

```bash
# Check Prisma Client generated correctly
npx prisma generate

# Verify database schema
npx prisma db pull

# Check ManualPayment table exists
npx prisma studio
```

**In Prisma Studio:**
1. Navigate to `manual_payments` table
2. Verify table structure matches schema
3. Navigate to `system_config` table
4. Verify pricing configurations exist:
   - C12USD_PRICE_USD = 1.00
   - C12DAO_PRICE_USD = 3.30
   - MIN_PURCHASE_USD = 10.00
   - etc.

---

### Step 5: Test Database Connection

```bash
# Create a test script to verify connection
node -e "
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function test() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'C12USD_PRICE_USD' }
  });
  console.log('✅ Database connection successful!');
  console.log('C12USD Price:', config?.value);
  await prisma.\$disconnect();
}

test().catch(console.error);
"
```

**Expected Output:**
```
✅ Database connection successful!
C12USD Price: 1.00
```

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Solution:**
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"

# Restart PostgreSQL if needed
# macOS: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
# Windows: net start postgresql-x64-XX
```

---

### Error: "Migration failed"

**Solution:**
```bash
# Reset database (CAUTION: Destroys all data)
npx prisma migrate reset

# Re-run migration
npx prisma migrate dev --name add_manual_payment_system

# Re-run seed
npm run seed
```

---

### Error: "Prisma Client not generated"

**Solution:**
```bash
# Manually generate client
npx prisma generate

# Verify generated client exists
ls -la generated/prisma/
```

---

## 📊 Database Changes Applied

### New Table: `manual_payments`

**Columns:**
- `id` - CUID primary key
- `referenceId` - Unique reference (C12-XXXXXX)
- `userId` - Foreign key to users
- `tokenType` - C12USD or C12DAO
- `requestedAmount` - USD amount (Decimal 18,6)
- `tokenAmount` - Token amount (Decimal 18,18)
- `deliveryChain` - BSC or POLYGON
- `paymentMethod` - CASH_APP or STABLECOIN
- `paymentAmount` - Amount paid (Decimal 18,6)
- `cashAppCashtag` - Sender's cashtag (nullable)
- `cashAppProof` - Screenshot URL (nullable)
- `stablecoinType` - BUSD/USDT/USDC (nullable)
- `senderAddress` - Wallet address (nullable)
- `txHash` - Blockchain TX hash (nullable)
- `blockchainChain` - Payment chain (nullable)
- `status` - Payment status (enum)
- `verifiedBy` - Admin user ID (nullable)
- `verifiedAt` - Verification timestamp (nullable)
- `rejectionReason` - Rejection reason (nullable)
- `distributionTxHash` - Distribution TX hash (nullable)
- `distributedAt` - Distribution timestamp (nullable)
- `userNotes` - User notes (nullable)
- `adminNotes` - Admin notes (nullable)
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp
- `expiresAt` - Expiration timestamp

**Indexes:**
- `(status, createdAt)` - For admin queue queries
- `(userId)` - For user payment history
- `(referenceId)` - For reference lookup

**Foreign Keys:**
- `userId` → `users(id)` ON DELETE CASCADE

---

### New Enums:

1. **ManualPaymentTokenType:**
   - C12USD
   - C12DAO

2. **ManualPaymentMethod:**
   - CASH_APP
   - STABLECOIN

3. **StablecoinType:**
   - BUSD
   - USDT
   - USDC

4. **ManualPaymentStatus:**
   - PENDING_SUBMISSION
   - PENDING_VERIFICATION
   - VERIFYING
   - APPROVED
   - DISTRIBUTING
   - COMPLETED
   - REJECTED
   - EXPIRED
   - REFUNDED

---

### Updated Tables:

**`users` table:**
- Added relationship: `manualPayments ManualPayment[]`

**`system_config` table:**
- Added 8 new configuration rows (via seed script)

---

## 🔒 Rollback Instructions

If migration fails and you need to rollback:

```bash
# Restore from backup
psql $DATABASE_URL < backups/pre-manual-payment-YYYYMMDD-HHMMSS.sql

# OR use Prisma reset (CAUTION: Destroys data)
npx prisma migrate reset

# Remove migration folder
rm -rf prisma/migrations/20251002*_add_manual_payment_system
```

---

## ✅ Post-Migration Checklist

- [ ] Database backup exists
- [ ] Migration applied successfully
- [ ] Prisma Client regenerated
- [ ] Seed script executed
- [ ] Pricing configurations verified in database
- [ ] Test connection successful
- [ ] `manual_payments` table visible in Prisma Studio
- [ ] Application can connect to database
- [ ] No errors in application logs

---

## 📝 Next Steps After Migration

1. **Start Backend Development:**
   - Create Firebase Functions for manual payments
   - File: `functions/src/manualPayments/index.ts`

2. **Start Frontend Development:**
   - Create BuyTokensModal component
   - File: `frontend/user/src/components/BuyTokensModal.tsx`

3. **Update Documentation:**
   - Mark Phase 1.1.3 as complete in todo list
   - Update IMPLEMENTATION_SUMMARY.md

---

## 🆘 Support

If you encounter issues:

1. **Check Migration Logs:**
   ```bash
   cat prisma/migrations/20251002*_add_manual_payment_system/migration.sql
   ```

2. **Verify Database Schema:**
   ```bash
   npx prisma db pull
   ```

3. **Check Prisma Version:**
   ```bash
   npx prisma --version
   ```

4. **Contact:**
   - Development Team Lead
   - Database Administrator
   - Review GitHub Issues

---

**STATUS:** Ready to Execute
**Estimated Time:** 5-10 minutes
**Risk Level:** Low (with backup)

---

*Last Updated: October 2, 2025*
