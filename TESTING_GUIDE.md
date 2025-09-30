# C12USD Testing Guide

## 🎯 Testing Environment Status

### ✅ All Services Running

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | http://localhost:3001 | ✅ Running |
| **Emulator UI** | http://localhost:4000 | ✅ Running |
| **Auth Emulator** | http://localhost:9099 | ✅ Running |
| **Firestore Emulator** | http://localhost:8080 | ✅ Running |

---

## 📝 Test Credentials

### Test Users (Created in Auth Emulator)

| Email | Password | Role | KYC Status | Purpose |
|-------|----------|------|------------|---------|
| test@c12usd.com | Test123456! | user | approved | General user testing |
| admin@c12usd.com | Admin123456! | admin | approved | Admin features testing |
| dao.member@c12usd.com | DAO123456! | dao_member | approved | DAO governance testing |
| pending.kyc@c12usd.com | Pending123456! | user | pending | KYC flow testing |
| new.user@c12usd.com | NewUser123456! | user | not_started | New user onboarding |

---

## 🧪 Testing Scenarios

### 1. User Registration Testing

**Goal:** Test new user registration flow

**Steps:**
1. Open: http://localhost:3001/signup (or /register or /auth/signup depending on routing)
2. Enter new credentials:
   - Email: newtester@example.com
   - Password: TestPassword123!
3. Submit form
4. Verify success message
5. Check Auth Emulator: http://localhost:4000/auth
6. Confirm new user appears in the list

**Expected Results:**
- ✅ Registration form validates input
- ✅ User created successfully
- ✅ User appears in Auth Emulator UI
- ✅ User can immediately log in

---

### 2. User Login Testing

**Goal:** Test authentication with existing users

**Test A: Successful Login**
1. Open: http://localhost:3001/login (or /auth/login)
2. Enter credentials: test@c12usd.com / Test123456!
3. Click "Login" or "Sign In"
4. Verify redirect to dashboard

**Test B: Invalid Credentials**
1. Enter wrong password
2. Verify error message displays
3. Confirm user not logged in

**Test C: Admin Login**
1. Login as: admin@c12usd.com / Admin123456!
2. Verify admin role recognized
3. Check for admin-only UI elements

**Expected Results:**
- ✅ Valid credentials → successful login
- ✅ Invalid credentials → clear error message
- ✅ Role-based UI displays correctly

---

### 3. MetaMask Wallet Connection Testing

**Prerequisites:**
- MetaMask extension installed in browser
- Test wallet with BSC and Polygon networks configured

**Steps:**
1. Login to frontend: test@c12usd.com
2. Navigate to wallet page: http://localhost:3001/wallet
3. Click "Connect Wallet" button
4. Select "MetaMask" from RainbowKit modal
5. Approve connection in MetaMask popup
6. Verify wallet address displayed
7. Test network switching:
   - Switch to BSC (ChainId: 56)
   - Verify network name displayed
   - Switch to Polygon (ChainId: 137)
   - Verify network change

**Test Contract Interaction:**
1. With BSC selected, verify contract address: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
2. With Polygon selected, verify contract: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

**Expected Results:**
- ✅ MetaMask prompts for connection
- ✅ Wallet address displays after connection
- ✅ Network switching works
- ✅ Correct contract addresses loaded
- ✅ Disconnect button works

**Note:** MetaMask connects to real BSC/Polygon networks. For testing token operations, use testnets or ensure you have test funds.

---

### 4. Transaction History Testing

**Goal:** View seeded transaction data

**Steps:**
1. Login: test@c12usd.com
2. Navigate to: http://localhost:3001/transactions (or /history)
3. Verify transaction list loads
4. Check for 20 seeded transactions

**Test Filters:**
- Filter by type: mint, redeem, transfer, bridge
- Filter by chain: BSC, Polygon
- Filter by date range

**Test Transaction Details:**
1. Click on a transaction
2. Verify modal/detail view opens
3. Check displayed information:
   - Transaction hash
   - Amount
   - Chain
   - Timestamp
   - Status
   - From/To addresses

**Sample Transactions (Seeded):**
- Mint: 1018.26 C12USD on Polygon
- Redeem: Various amounts on BSC/Polygon
- Transfer: Between addresses
- Bridge: Cross-chain operations

**Expected Results:**
- ✅ All 20 transactions display
- ✅ Filters work correctly
- ✅ Transaction details accurate
- ✅ Blockchain explorer links work

---

### 5. Dashboard Testing

**Goal:** Verify user dashboard displays correctly

**Steps:**
1. Login: test@c12usd.com
2. Navigate to: http://localhost:3001/dashboard (or home page after login)
3. Verify displayed information:
   - User profile (from Firestore)
   - KYC status badge
   - Wallet balances (if connected)
   - Recent transactions
   - Statistics

**Check Data Sources:**
- User profile: Should load from Firestore `users` collection
- Transactions: Should load from `transactions` collection
- Config: Should load from `config` collection

**Expected Results:**
- ✅ User data loads correctly
- ✅ Dashboard widgets functional
- ✅ No console errors
- ✅ Data refreshes properly

---

### 6. KYC Status Testing

**Test Different KYC States:**

**A. Approved User (test@c12usd.com)**
- ✅ KYC badge shows "Approved"
- ✅ Full access to features
- ✅ Can mint/redeem (if enabled)

**B. Pending KYC (pending.kyc@c12usd.com)**
- ⚠️ KYC badge shows "Pending"
- ⚠️ Limited access message
- ⚠️ Prompt to complete verification

**C. Not Started (new.user@c12usd.com)**
- ⚠️ KYC badge shows "Not Started"
- ⚠️ Prompt to begin KYC process

**Expected Results:**
- ✅ KYC status displays correctly for each user
- ✅ Feature access reflects KYC status
- ✅ Clear messaging for users

---

### 7. Proof of Reserves Testing

**Goal:** Verify proof-of-reserves data displays

**Steps:**
1. Navigate to: http://localhost:3001/reserves (or wherever displayed)
2. Verify displayed data:
   - Total Supply: 200,000,000 C12USD
   - Total Collateral: 201,500,000 USD
   - Collateral Ratio: 100.75%
   - BSC reserves
   - Polygon reserves

**Data Source:** Firestore `proof-of-reserves` collection

**Expected Results:**
- ✅ Aggregate data displays correctly
- ✅ Per-chain breakdown shown
- ✅ Collateral ratio calculated
- ✅ Last updated timestamp

---

### 8. Admin Features Testing

**Prerequisites:** Login as admin@c12usd.com

**Test Admin Dashboard:**
1. Verify admin-only routes accessible
2. Check for admin menu items
3. Test admin functions:
   - User management
   - KYC approval
   - System configuration
   - Transaction monitoring

**Expected Results:**
- ✅ Admin routes only accessible to admin role
- ✅ Regular users get access denied
- ✅ Admin tools functional

---

### 9. DAO Member Testing

**Prerequisites:** Login as dao.member@c12usd.com

**Test DAO Features:**
1. Navigate to governance/DAO section
2. Verify DAO member access
3. Test voting features (if implemented)

**Expected Results:**
- ✅ DAO sections accessible
- ✅ Voting power displayed
- ✅ Proposal viewing works

---

### 10. Error Handling Testing

**Test Error Scenarios:**

**A. Network Errors**
1. Stop Firestore emulator
2. Try to load data
3. Verify graceful error message

**B. Authentication Errors**
1. Try accessing protected routes without login
2. Verify redirect to login page

**C. Invalid Input**
1. Submit forms with invalid data
2. Verify validation messages

**Expected Results:**
- ✅ Clear error messages
- ✅ No app crashes
- ✅ Proper error recovery

---

## 🔍 Verification Checklist

Use this checklist during testing:

### Authentication ✅
- [ ] User registration works
- [ ] Email/password login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] Session persists on refresh

### Wallet Connection ✅
- [ ] MetaMask connects
- [ ] Wallet address displays
- [ ] Network switching works
- [ ] BSC contract loaded correctly
- [ ] Polygon contract loaded correctly
- [ ] Disconnect works

### Data Display ✅
- [ ] User profile loads from Firestore
- [ ] Transaction history displays
- [ ] 20 seeded transactions visible
- [ ] Proof-of-reserves data shows
- [ ] Config data loads

### UI/UX ✅
- [ ] Responsive on mobile
- [ ] Loading states display
- [ ] Error messages clear
- [ ] Success notifications work
- [ ] Navigation functional

### Role-Based Access ✅
- [ ] Admin sees admin features
- [ ] DAO member sees governance
- [ ] KYC status displays correctly
- [ ] Feature access enforced

---

## 🐛 Debugging Tools

### Browser DevTools

**Check Console for:**
- JavaScript errors
- Network requests
- Firebase SDK logs

**Network Tab:**
- Verify API calls to emulators
- Check response data
- Monitor load times

### Firebase Emulator UI

**Auth Tab:** http://localhost:4000/auth
- View all users
- Check custom claims
- Verify email verification status

**Firestore Tab:** http://localhost:4000/firestore
- Browse collections
- View document data
- Check indexes

**Logs Tab:**
- View emulator logs
- Debug authentication issues
- Check Firestore queries

---

## 📊 Expected Data Volumes

| Collection | Documents | Purpose |
|-----------|-----------|---------|
| config | 5 | System configuration |
| proof-of-reserves | 3 | Reserve data |
| users | 5+ | User profiles (5 seeded + new registrations) |
| transactions | 20+ | Transaction history |
| rate-limits | 4 | API rate limiting |

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to emulators"
**Solution:** Verify emulators running on correct ports (9099, 8080)

### Issue: "User not authenticated"
**Solution:** Check Firebase auth state, verify session not expired

### Issue: "Data not loading"
**Solution:**
1. Check Firestore emulator running
2. Verify `FIRESTORE_EMULATOR_HOST=localhost:8080`
3. Check browser console for errors

### Issue: "MetaMask not connecting"
**Solution:**
1. Ensure MetaMask installed
2. Add WalletConnect Project ID to `.env.local`
3. Check RainbowKit configuration

### Issue: "Transaction data empty"
**Solution:** Re-run seed script: `node scripts/seed-firestore.js`

---

## 🎯 Testing Priority Order

Based on your requirements:

1. **User Registration** (Priority 1)
   - Test signup flow
   - Verify user creation

2. **Wallet Connection** (Priority 2)
   - MetaMask integration
   - Network switching

3. **Transaction Functionality** (Priority 3)
   - View transaction history
   - Filter and search
   - Transaction details

4. **Additional Features**
   - Dashboard
   - Proof of reserves
   - Admin features
   - DAO governance

---

## 📝 Test Results Template

Use this to document your testing:

```
## Test Session: [Date/Time]

### User Registration
- Status: [ ] Pass [ ] Fail
- Notes:

### User Login
- Status: [ ] Pass [ ] Fail
- Notes:

### Wallet Connection
- Status: [ ] Pass [ ] Fail
- Notes:

### Transaction History
- Status: [ ] Pass [ ] Fail
- Notes:

### Issues Found:
1.
2.
3.

### Next Steps:
1.
2.
```

---

## 🚀 After Testing Completes

Once emulator testing passes:

1. **Create Production Firestore Database**
   - https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore

2. **Enable Auth Providers in Production**
   - https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers

3. **Deploy to Production:**
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules --project=c12ai-dao-b3bbb

   # Deploy hosting
   firebase deploy --only hosting --project=c12ai-dao-b3bbb
   ```

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console, Emulator UI logs, and the troubleshooting section above.
