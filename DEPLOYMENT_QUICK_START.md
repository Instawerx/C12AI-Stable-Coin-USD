# C12USD Firebase Deployment - Quick Start Guide

## Status: 95% Ready - 3 Manual Steps Required

**Last Updated**: September 30, 2025

---

## Critical Actions Required (Do These First!)

### ⚠️ Step 1: Download Service Account Key (5 minutes)

1. **Open this URL**:
   ```
   https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk
   ```

2. **Click "Generate new private key"** → Confirm

3. **Save the downloaded file as**:
   ```
   C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json
   ```

4. **Verify**:
   ```bash
   node scripts/verify-service-account.js
   ```

   Expected: ✅ All checks pass

---

### ⚠️ Step 2: Create Firestore Database (3 minutes)

1. **Open this URL**:
   ```
   https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore
   ```

2. **Click "Create database"**

3. **Select location**: `us-central1` (Iowa)

4. **Choose mode**: Production mode

5. **Click "Enable"**

6. **Verify**:
   ```bash
   firebase firestore:databases:list --project=c12ai-dao-b3bbb
   ```

   Expected: `(default) - us-central1`

---

### ⚠️ Step 3: Enable Authentication Providers (5 minutes)

1. **Open this URL**:
   ```
   https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers
   ```

2. **Enable Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

3. **Enable Google OAuth**:
   - Click "Google"
   - Toggle "Enable"
   - Support email: `vrdivebar@gmail.com`
   - Click "Save"

4. **Configure Authorized Domains**:
   - Go to: Settings → Authorized domains
   - Ensure these are added:
     - `localhost`
     - `c12ai-dao-b3bbb.firebaseapp.com`
     - `c12ai-dao-b3bbb.web.app`

---

## After Manual Steps: Full Testing Flow

### Step 1: Start Firebase Emulators

**Terminal 1**:
```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD
firebase emulators:start --project=c12ai-dao-b3bbb
```

**Emulator URLs**:
- UI Dashboard: http://localhost:4000
- Auth: http://localhost:9099
- Firestore: http://localhost:8080
- Storage: http://localhost:9199

---

### Step 2: Seed Firestore with Test Data

**Terminal 2**:
```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD

# For emulator
set FIRESTORE_EMULATOR_HOST=localhost:8080
node scripts/seed-firestore.js

# Expected: 37 documents created
```

**Collections Created**:
- `config` (5 docs) - Chain configs, fees, limits
- `proof-of-reserves` (3 docs) - Collateral attestations
- `users` (5 docs) - Sample user profiles
- `transactions` (20 docs) - Test transactions
- `rate-limits` (4 docs) - Operation limits

---

### Step 3: Create Test Users

**Terminal 3**:
```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD

# For emulator
set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
set FIRESTORE_EMULATOR_HOST=localhost:8080
node scripts/create-test-users.js
```

**Test Credentials Created**:
| Email | Password | Role |
|-------|----------|------|
| test@c12usd.com | Test123456! | user |
| admin@c12usd.com | Admin123456! | admin |
| dao.member@c12usd.com | DAO123456! | dao_member |

**Saved to**: `test-credentials.json`

---

### Step 4: Start Frontend Development Server

**Terminal 4**:
```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD\frontend\user

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

**Frontend URL**: http://localhost:3001

---

### Step 5: Test User Registration & Login

#### A. Test Registration:

1. Go to: http://localhost:3001/auth/signup
2. Enter:
   - Email: `newuser@test.com`
   - Password: `TestPass123!`
3. Click "Sign Up"
4. Expected: ✅ User created, redirected to dashboard

#### B. Test Login:

1. Go to: http://localhost:3001/auth/login
2. Enter:
   - Email: `test@c12usd.com`
   - Password: `Test123456!`
3. Click "Login"
4. Expected: ✅ Logged in, redirected to dashboard

#### C. Verify in Emulator UI:

1. Open: http://localhost:4000
2. Go to "Authentication" tab
3. Verify users appear
4. Go to "Firestore" tab
5. Check `users` collection has documents

---

### Step 6: Test Wallet Connection (MetaMask)

**Prerequisites**:
- MetaMask browser extension installed
- Test wallet with BSC or Polygon testnet funds

**Steps**:

1. Go to: http://localhost:3001/app/wallet

2. Click "Connect Wallet"

3. Select "MetaMask"

4. Approve connection in MetaMask popup

5. Verify:
   - ✅ Wallet address displayed
   - ✅ Network badge shows (BSC or Polygon)
   - ✅ Balance shown (if tokens present)

6. Test network switching:
   - Switch chain in MetaMask
   - Verify UI updates

---

### Step 7: Test Transaction History

1. Go to: http://localhost:3001/app/transactions

2. Verify:
   - ✅ Transaction list displays
   - ✅ Shows 20 test transactions
   - ✅ Different types (mint, redeem, transfer, bridge)
   - ✅ Status badges (completed, pending, failed)
   - ✅ Pagination works

3. Click on a transaction:
   - ✅ Transaction details modal opens
   - ✅ Shows transaction hash, amount, fees

---

## Production Deployment (After Tests Pass)

### Deploy to Firebase Hosting:

```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD

# 1. Deploy Firestore rules and indexes
firebase deploy --only firestore --project=c12ai-dao-b3bbb

# 2. Deploy Storage rules
firebase deploy --only storage --project=c12ai-dao-b3bbb

# 3. Build and deploy frontend
cd frontend/user
npm run build
firebase deploy --only hosting:user-app --project=c12ai-dao-b3bbb
```

**Production URL**: https://c12ai-dao-b3bbb.web.app

---

### Verify Production Deployment:

1. Open: https://c12ai-dao-b3bbb.web.app

2. Test registration with new email

3. Test login with test credentials

4. Test wallet connection

5. Verify transaction history

6. Check browser console for errors

---

## Optional: WalletConnect Configuration

**Why?** Better wallet compatibility (Coinbase Wallet, Trust Wallet, etc.)

**Steps**:

1. Go to: https://cloud.walletconnect.com/

2. Sign up or login

3. Create new project: "C12USD"

4. Copy Project ID

5. Update `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_actual_project_id>
   ```

6. Restart frontend server

**Without WalletConnect**: MetaMask direct connection still works

---

## Troubleshooting

### Issue: Emulators won't start

**Error**: "Port already in use"

**Solution**:
```bash
# Kill processes on required ports
netstat -ano | findstr :9099
netstat -ano | findstr :8080
netstat -ano | findstr :4000

# Kill process by PID
taskkill /PID <process_id> /F
```

---

### Issue: Service account key not found

**Error**: "service account key not found"

**Solution**:
1. Verify file exists at: `C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json`
2. Check filename is exactly: `serviceAccountKey.json` (case-sensitive)
3. Re-download from Firebase Console if needed

---

### Issue: Frontend won't build

**Error**: Build errors or TypeScript errors

**Solution**:
```bash
cd frontend/user

# Clear cache
rm -rf .next node_modules

# Reinstall dependencies
npm install

# Try build again
npm run build
```

---

### Issue: Firestore permission denied

**Error**: "Missing or insufficient permissions"

**Solution**:
1. Ensure Firestore rules are deployed:
   ```bash
   firebase deploy --only firestore:rules --project=c12ai-dao-b3bbb
   ```
2. Check user is authenticated
3. Verify security rules allow the operation

---

## File Structure Overview

```
C12USD_project/C12USD/
├── firebase.json                    # Firebase config with emulators
├── firestore.rules                  # Firestore security rules
├── firestore.indexes.json           # Firestore indexes
├── storage.rules                    # Storage security rules
├── serviceAccountKey.json           # ⚠️ Download this first!
│
├── docs/
│   ├── SERVICE_ACCOUNT_KEY_GUIDE.md      # Key download guide
│   └── FIREBASE_SERVICES_SETUP.md        # Services setup guide
│
├── scripts/
│   ├── verify-service-account.js         # Key verification
│   ├── seed-firestore.js                 # Data seeding
│   ├── create-test-users.js              # Test user creation
│   ├── test-firebase-auth.js             # Auth testing
│   ├── start-emulators.bat               # Windows emulator start
│   └── start-emulators.sh                # Linux/Mac emulator start
│
└── frontend/user/
    ├── .env.local                   # Environment variables
    ├── package.json                 # Dependencies
    ├── next.config.js               # Next.js config
    │
    └── src/
        ├── app/                     # Next.js pages
        │   ├── page.tsx             # Landing page
        │   ├── auth/                # Login/signup pages
        │   └── app/                 # Protected pages
        │       ├── dashboard/
        │       ├── wallet/
        │       ├── transactions/
        │       └── dao/
        │
        └── lib/
            ├── firebase.ts          # Firebase SDK init
            ├── wagmi.ts             # Web3 config
            └── apiClient.ts         # API client
```

---

## Success Criteria Checklist

**Before declaring success, verify all these work:**

### Authentication:
- [ ] User registration works (email/password)
- [ ] User login works
- [ ] Logout works
- [ ] Session persists on page refresh
- [ ] Protected routes redirect to login when not authenticated

### Wallet Connection:
- [ ] MetaMask connects successfully
- [ ] Wallet address displays correctly
- [ ] Network switching works (BSC ↔ Polygon)
- [ ] Disconnect works

### Data Display:
- [ ] Dashboard loads with user data
- [ ] Transaction history displays 20 test transactions
- [ ] Transaction filtering/sorting works
- [ ] User profile displays

### Backend Integration:
- [ ] API calls to backend succeed
- [ ] Transaction data fetched correctly
- [ ] Error handling works (network errors, etc.)

### Production:
- [ ] Website accessible at production URL
- [ ] No console errors
- [ ] Performance acceptable (load time < 3s)
- [ ] Mobile responsive

---

## Timeline Estimate

| Task | Time |
|------|------|
| Complete 3 manual steps | 15 mins |
| Start emulators + seed data | 10 mins |
| Test authentication flows | 30 mins |
| Test wallet connection | 20 mins |
| Test transaction features | 30 mins |
| Production deployment | 20 mins |
| Verification | 20 mins |
| **TOTAL** | **~2.5 hours** |

---

## Support & Resources

### Documentation:
- Full Deployment Report: `FIREBASE_DEPLOYMENT_REPORT.md`
- Service Account Guide: `docs/SERVICE_ACCOUNT_KEY_GUIDE.md`
- Services Setup: `docs/FIREBASE_SERVICES_SETUP.md`

### Firebase Console:
- Project: https://console.firebase.google.com/project/c12ai-dao-b3bbb
- Authentication: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication
- Firestore: https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore

### Backend API:
- Base URL: https://c12usd-backend-prod-239414215297.us-central1.run.app
- Health: https://c12usd-backend-prod-239414215297.us-central1.run.app/health

### Contact:
- Project Owner: vrdivebar@gmail.com

---

## Next Actions

1. ✅ **Read this guide completely**
2. ⚠️ **Complete 3 manual steps** (15 minutes)
3. ⚠️ **Run emulator testing** (1 hour)
4. ⚠️ **Deploy to production** (if tests pass)
5. ✅ **Celebrate successful deployment!**

---

**Good luck with your deployment! 🚀**
