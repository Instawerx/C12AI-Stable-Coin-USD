# Firestore Database Setup

## Status: NO DATABASE FOUND

Firestore database must be created before deployment.

## Quick Setup (3 minutes)

### Step 1: Create Firestore Database

1. Open Firestore Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore

2. Click **"Create database"**

3. **Select mode:**
   - Choose **"Production mode"** (we have security rules ready)
   - Click **"Next"**

4. **Select location:**
   - Choose **"us-central1"** (recommended - matches Cloud Run region)
   - Click **"Enable"**

5. Wait 1-2 minutes for database creation

### Step 2: Verify Database

Run this command to verify:
```bash
firebase firestore:databases:list --project=c12ai-dao-b3bbb
```

Expected output: Should show `(default)` database in `us-central1`

## Security Rules Already Configured

The following security rules are ready to deploy from `firestore.rules`:

```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Transactions visible to sender/receiver only
match /transactions/{transactionId} {
  allow read: if request.auth != null &&
    (resource.data.fromAddress == request.auth.token.address ||
     resource.data.toAddress == request.auth.token.address);
}

// Config and proof-of-reserves are read-only for authenticated users
match /config/{document=**} {
  allow read: if request.auth != null;
}

match /proof-of-reserves/{document=**} {
  allow read: if request.auth != null;
}
```

### Step 3: Deploy Security Rules

After database creation, deploy rules:
```bash
firebase deploy --only firestore:rules --project=c12ai-dao-b3bbb
```

## Firestore Collections Structure

Once the database is created, these collections will be seeded:

### 1. **config** (5 documents)
- Chain configurations (BSC, Polygon)
- Contract addresses
- Fee settings
- System parameters

### 2. **proof-of-reserves** (3 documents)
- BSC reserves
- Polygon reserves
- Aggregate totals

### 3. **users** (5 test users)
- User profiles
- KYC status
- Wallet addresses
- Roles (admin, user, dao_member)

### 4. **transactions** (20 sample transactions)
- Mints, redeems, transfers
- Cross-chain bridge operations
- Transaction history

### 5. **rate-limits** (4 rate limit configs)
- Default limits
- Mint/redeem/bridge specific limits
- Per-user and per-IP restrictions

## Next Steps After Database Creation

1. ✅ Verify database exists
2. Deploy security rules: `firebase deploy --only firestore:rules`
3. Start emulators: `firebase emulators:start`
4. Seed test data: `node scripts/seed-firestore.js` (with `FIRESTORE_EMULATOR_HOST=localhost:8080`)
5. Verify data: `node scripts/count-firestore-docs.js`
