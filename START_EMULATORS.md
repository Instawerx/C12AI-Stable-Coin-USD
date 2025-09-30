# Firebase Emulators Quick Start

## Prerequisites Checklist

Before starting emulators, ensure you have:

- ✅ Firebase CLI installed: `firebase --version`
- ✅ Logged into Firebase: `firebase login`
- ✅ Project selected: `firebase use c12ai-dao-b3bbb`
- ⚠️ Service account key (optional for emulators, but helpful for seeding)

## Start Firebase Emulators

### Option 1: Start All Emulators (Recommended)

```bash
cd /c/Users/tabor/Downloads/C12USD_project/C12USD
firebase emulators:start --project=c12ai-dao-b3bbb
```

This will start:
- 🔐 **Authentication Emulator** on port 9099
- 🗄️ **Firestore Emulator** on port 8080
- 📦 **Storage Emulator** on port 9199
- 🌐 **Hosting Emulator** on port 5000
- 🎛️ **Emulator UI** on port 4000

### Option 2: Start Specific Emulators

```bash
# Only Auth and Firestore
firebase emulators:start --only auth,firestore --project=c12ai-dao-b3bbb

# Only Firestore
firebase emulators:start --only firestore --project=c12ai-dao-b3bbb
```

### Option 3: Use Convenience Script

**Windows:**
```bash
./scripts/start-emulators.bat
```

**Mac/Linux:**
```bash
./scripts/start-emulators.sh
```

## Access Emulator UI

Once emulators are running, open your browser:

**Emulator Suite UI:** http://localhost:4000

From here you can:
- View and manage Firestore data
- Create and manage test users
- View authentication tokens
- Monitor emulator logs

## Individual Emulator Endpoints

### Authentication Emulator
- **Endpoint:** http://localhost:9099
- **Use in code:** Set `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099`

### Firestore Emulator
- **Endpoint:** http://localhost:8080
- **Use in code:** Set `FIRESTORE_EMULATOR_HOST=localhost:8080`

### Storage Emulator
- **Endpoint:** http://localhost:9199
- **Use in code:** Set `FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199`

### Hosting Emulator
- **URL:** http://localhost:5000
- Frontend will be served here

## Seeding Test Data (In Emulator)

Once emulators are running, open a **NEW terminal** and run:

```bash
# Set emulator host for Firestore
set FIRESTORE_EMULATOR_HOST=localhost:8080

# Seed Firestore with test data
cd /c/Users/tabor/Downloads/C12USD_project/C12USD
node scripts/seed-firestore.js

# Create test users
set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
node scripts/create-test-users.js
```

Expected output:
```
✅ Seeded 5 config documents
✅ Seeded 3 proof-of-reserves documents
✅ Seeded 5 user documents
✅ Seeded 20 transaction documents
✅ Seeded 4 rate-limit documents
---
Total: 37 documents seeded
```

## Verify Data in Emulator

### Option 1: Use Emulator UI
1. Open http://localhost:4000
2. Click "Firestore"
3. Browse collections

### Option 2: Run Count Script
```bash
set FIRESTORE_EMULATOR_HOST=localhost:8080
node scripts/count-firestore-docs.js
```

## Test Frontend with Emulators

### Start Next.js Dev Server

In a **NEW terminal** (keep emulators running):

```bash
cd /c/Users/tabor/Downloads/C12USD_project/C12USD/frontend/user
npm run dev
```

The frontend will automatically connect to emulators if they're running on the configured ports.

Access frontend at: http://localhost:3000

## Testing User Registration

1. Navigate to: http://localhost:3000/signup
2. Enter test email: `testuser@example.com`
3. Enter password: `Test123456!`
4. Submit form

Verify in Emulator UI:
- Check Authentication tab for new user
- Check Firestore → users collection for user profile

## Testing MetaMask Connection

1. Navigate to: http://localhost:3000/wallet
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve connection

**Note:** MetaMask works with emulators, but transactions will be on real networks (BSC/Polygon). For full local testing, consider using a local blockchain like Hardhat.

## Stopping Emulators

Press `Ctrl+C` in the terminal where emulators are running.

## Common Issues

### Port Already in Use

If you see "Port already in use":

```bash
# Find and kill process on port 8080 (example)
netstat -ano | findstr :8080
taskkill /PID <process_id> /F
```

### Emulator Data Persistence

By default, emulator data is cleared on restart. To persist data:

```bash
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

### Frontend Not Connecting to Emulators

Check that these environment variables are NOT set in `.env.local`:
- `FIREBASE_AUTH_EMULATOR_HOST` (should auto-detect)
- `FIRESTORE_EMULATOR_HOST` (should auto-detect)

Firebase SDK will automatically connect to local emulators if they're running on the expected ports.

## Next Steps

Once emulators are running and seeded:

1. ✅ Test user registration flow
2. ✅ Test MetaMask wallet connection
3. ✅ Test transaction history viewing
4. ✅ Test mint/redeem operations (emulated)
5. ✅ Deploy to production after testing passes
