# Firestore Data Seeding Guide

## Overview

This guide explains how to seed synthetic data into the C12USD Firestore database for testing and development purposes.

## Prerequisites

1. **Firebase Admin SDK**: Installed via `pnpm add -D firebase-admin @faker-js/faker`
2. **Service Account Key**: Required for authentication (see setup below)
3. **Firestore Database**: Must be provisioned in Firebase project `c12ai-dao-b3bbb`

## Service Account Setup

### Option 1: Download Service Account Key (Recommended for Local Development)

1. Go to [Firebase Console](https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk)
2. Click "Generate New Private Key"
3. Save the downloaded JSON file as `serviceAccountKey.json` in the project root
4. Add `serviceAccountKey.json` to `.gitignore` (already done)

### Option 2: Use Application Default Credentials (CI/CD)

If running in Google Cloud Shell or CI/CD:
```bash
gcloud auth application-default login --project=c12ai-dao-b3bbb
```

## Data Structure

The seed script creates the following collections with synthetic data:

### 1. Config Collection

Configuration data for the C12USD stablecoin system.

**Documents:**
- `chains`: Supported blockchain networks (BSC, Polygon)
- `contracts-bsc`: BSC contract configuration
- `contracts-polygon`: Polygon contract configuration
- `fees`: Flash loan and bridge fees
- `limits`: Transaction and daily limits

**Sample:**
```json
{
  "chainId": 56,
  "chainName": "BSC",
  "contractAddress": "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
  "layerZeroEndpointId": 102,
  "rpcUrl": "https://bsc-dataseed.binance.org/",
  "blockExplorer": "https://bscscan.com"
}
```

### 2. Proof-of-Reserves Collection

Reserve attestation data demonstrating over-collateralization.

**Documents:**
- `bsc-latest`: Latest BSC reserve data
- `polygon-latest`: Latest Polygon reserve data
- `aggregate`: Combined reserve data across all chains

**Sample:**
```json
{
  "chain": "bsc",
  "totalSupply": "100000000",
  "collateralValue": "100500000",
  "collateralRatio": 1.05,
  "attestationProvider": "Chainlink Proof of Reserve",
  "verificationStatus": "verified"
}
```

### 3. Users Collection

Synthetic user profiles for testing.

**Generated Data:**
- 5 test user accounts
- Random wallet addresses
- Email addresses (faker-generated)
- User preferences (chain, notifications, theme)
- KYC status and tier
- User statistics (transactions, volume)

**Sample:**
```json
{
  "email": "john.doe@example.com",
  "displayName": "John Doe",
  "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "preferences": {
    "defaultChain": "bsc",
    "notifications": { "email": true, "push": false },
    "theme": "dark"
  },
  "kyc": {
    "status": "approved",
    "tier": "advanced"
  }
}
```

### 4. Transactions Collection

Sample transaction history across different operation types.

**Generated Data:**
- 20 sample transactions
- Transaction types: mint, redeem, transfer, bridge
- Statuses: completed (80%), pending (10%), failed (10%)
- Distributed across BSC and Polygon
- Realistic timestamps (past 30 days)
- Gas usage and fees

**Sample:**
```json
{
  "type": "mint",
  "status": "completed",
  "chain": "bsc",
  "fromAddress": "0x1234...",
  "amount": "25000.00",
  "txHash": "0xabcd...",
  "blockNumber": 35428901,
  "gasUsed": "125000",
  "fee": "2.50"
}
```

### 5. Rate Limits Collection

Rate limiting configurations for different operations.

**Documents:**
- `default`: Global rate limits
- `mint`: Mint operation limits
- `redeem`: Redeem operation limits
- `bridge`: Bridge operation limits

**Sample:**
```json
{
  "maxTransactionsPerHour": 10,
  "maxTransactionsPerDay": 50,
  "maxAmountPerTransaction": "1000000",
  "maxAmountPerDay": "5000000"
}
```

## Running the Seed Script

### Command

```bash
# Using npm
npm run seed:firestore

# Using pnpm (recommended)
pnpm seed:firestore

# Direct execution
node scripts/seed-firestore.js
```

### Expected Output

```
🌱 Starting Firestore data seeding for C12USD...

Project: c12ai-dao-b3bbb
Timestamp: 2025-09-30T05:04:52.651Z

🔧 Seeding config collection...
✅ Created 5 config documents

🔐 Seeding proof-of-reserves collection...
✅ Created 3 proof-of-reserves documents

👥 Seeding users collection...
✅ Created 5 user documents

💳 Seeding transactions collection...
✅ Created 20 transaction documents

⏱️ Seeding rate-limits collection...
✅ Created 4 rate-limit documents

✨ Seeding completed successfully!

📊 Summary:
   - Config documents: 5
   - Proof-of-Reserves documents: 3
   - User documents: 5
   - Transaction documents: 20
   - Rate-limit documents: 4
   - Total documents: 37

📋 Sample Data:
[Sample documents displayed...]

🔍 Verifying seeded data...
   config: 5 documents
   proof-of-reserves: 3 documents
   users: 5 documents
   transactions: 20 documents
   rate-limits: 4 documents

✅ All operations completed successfully!
```

## Verification

### Using Firebase Console

1. Go to [Firestore Console](https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore)
2. Verify each collection has been created with the correct number of documents
3. Inspect sample documents to ensure data structure is correct

### Using Firebase CLI

```bash
# List all collections
firebase firestore:indexes --project=c12ai-dao-b3bbb

# Count documents (requires custom script)
node scripts/count-firestore-docs.js
```

## Resetting Data

### Option 1: Delete and Re-seed

To completely reset the database:

```bash
# WARNING: This will delete ALL data in Firestore
# Only use in development environments!

# Delete all documents (requires admin permissions)
firebase firestore:delete --all-collections --project=c12ai-dao-b3bbb

# Re-seed data
pnpm seed:firestore
```

### Option 2: Manual Deletion

1. Go to Firestore Console
2. Delete individual collections or documents
3. Run seed script to repopulate

## Sample Queries

### Get All Completed Transactions

```javascript
const db = admin.firestore();
const transactions = await db
  .collection('transactions')
  .where('status', '==', 'completed')
  .get();
```

### Get BSC Reserve Data

```javascript
const reserves = await db
  .collection('proof-of-reserves')
  .doc('bsc-latest')
  .get();

console.log(reserves.data());
```

### Get User by Wallet Address

```javascript
const userDoc = await db
  .collection('users')
  .doc('0x1234...') // wallet address
  .get();
```

### Get Recent Transactions for a User

```javascript
const userAddress = '0x1234...';
const txs = await db
  .collection('transactions')
  .where('fromAddress', '==', userAddress)
  .orderBy('timestamp', 'desc')
  .limit(10)
  .get();
```

## Customization

### Modify User Count

Edit `scripts/seed-firestore.js`, line ~188:

```javascript
for (let i = 0; i < 5; i++) { // Change 5 to desired count
```

### Modify Transaction Count

Edit `scripts/seed-firestore.js`, line ~228:

```javascript
for (let i = 0; i < 20; i++) { // Change 20 to desired count
```

### Modify Time Range

Edit `scripts/seed-firestore.js`, line ~40:

```javascript
function getRandomPastDate(daysAgo = 30) { // Change 30 to desired range
```

### Change Contract Addresses

Edit `scripts/seed-firestore.js`, lines ~25-28:

```javascript
const CONTRACTS = {
  BSC: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
  POLYGON: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811'
};
```

## Security Considerations

### Production Warning

**DO NOT run this script on production databases!**

- The script is designed for development and testing only
- It will create synthetic data that looks real but is fake
- Running on production could corrupt real user data

### Service Account Key Security

- **NEVER** commit `serviceAccountKey.json` to version control
- Store securely using secret management (e.g., Google Secret Manager)
- Use environment-specific credentials (dev, staging, prod)
- Rotate keys regularly (every 90 days)

### Firestore Rules

Ensure production Firestore rules are properly configured:

```javascript
// Prevent unauthorized writes to config
match /config/{configId} {
  allow read: if true;
  allow write: if request.auth.token.admin == true;
}
```

## Troubleshooting

### Error: "5 NOT_FOUND"

**Cause**: Service account key not found or invalid credentials

**Solution**:
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Ensure file is not corrupted

### Error: "Permission Denied"

**Cause**: Service account lacks Firestore permissions

**Solution**:
1. Go to [IAM Console](https://console.cloud.google.com/iam-admin/iam?project=c12ai-dao-b3bbb)
2. Find your service account
3. Add role: "Cloud Datastore User" or "Firebase Admin"

### Error: "Quota Exceeded"

**Cause**: Too many write operations in short time

**Solution**:
1. Wait a few minutes and retry
2. Reduce batch size in script
3. Upgrade Firebase plan if needed

### Faker Data Issues

**Cause**: Faker version mismatch or API changes

**Solution**:
```bash
pnpm update @faker-js/faker
```

## Integration with Frontend

### Example: Fetching Transactions

```typescript
// frontend/src/lib/firestore.ts
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserTransactions(walletAddress: string) {
  const q = query(
    collection(db, 'transactions'),
    where('fromAddress', '==', walletAddress)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Example: Fetching Reserves

```typescript
// frontend/src/lib/firestore.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getProofOfReserves(chain: 'bsc' | 'polygon') {
  const docRef = doc(db, 'proof-of-reserves', `${chain}-latest`);
  const snapshot = await getDoc(docRef);
  return snapshot.data();
}
```

## References

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Firebase Production Plan](../FIREBASE_PRODUCTION_PLAN.md)
- [Firestore Security Rules](../firestore.rules)

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact: vrdivebar@gmail.com
- Review deployment logs in Cloud Console

## Changelog

### Version 1.0 (2025-09-30)
- Initial seed script creation
- Support for 5 collections (config, proof-of-reserves, users, transactions, rate-limits)
- Faker integration for realistic synthetic data
- Batch operations for efficient writes
- Comprehensive documentation

---

**Last Updated**: 2025-09-30
**Script Location**: `scripts/seed-firestore.js`
**Project**: c12ai-dao-b3bbb
**Environment**: Development/Testing Only