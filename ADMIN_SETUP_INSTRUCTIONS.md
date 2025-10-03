# Admin Setup Instructions

## Current Status: User Must Sign Up First

The admin user **vrdivebar@gmail.com** does not exist yet in Firebase Authentication. Follow these steps to complete the setup.

---

## Step-by-Step Setup Process

### Step 1: Sign Up in the Application ⏳

**Action Required:** The user must create an account through the C12USD application.

**Instructions:**
1. Go to your C12USD application (login/signup page)
2. Click "Sign Up" or "Create Account"
3. Use these credentials:
   - **Email**: `vrdivebar@gmail.com`
   - **Password**: (choose a secure password)
4. Connect MetaMask wallet when prompted
5. Use wallet address: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`
6. Complete email verification if required

**Note**: The user MUST sign up through the app (not via CLI) to ensure proper authentication flow.

---

### Step 2: Set Firebase Custom Claims ✅

After signup is complete, run this command to set admin permissions:

```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD
node scripts\set-admin-claims.js
```

**What this does:**
- Looks up the user by email (vrdivebar@gmail.com)
- Displays their Firebase UID
- Sets custom claim: `{ adminRole: "SUPER_ADMIN" }`
- Confirms the update

**Expected Output:**
```
Initializing Firebase Admin with project: c12ai-dao-b3bbb

🔍 Looking up user by email...
   Email: vrdivebar@gmail.com

✅ User found!
   UID: [FIREBASE_UID_HERE]
   Display Name: ...
   Email Verified: true

📋 Current Custom Claims:
{}

🔐 Setting custom claims: { adminRole: "SUPER_ADMIN" }
✅ Custom claims updated successfully!

📋 Updated Custom Claims:
{
  "adminRole": "SUPER_ADMIN"
}

✅ Setup Complete!
```

**Important**: Copy the Firebase UID shown - you'll need it for Step 3!

---

### Step 3: Create Database Records 📊

**Prerequisites:**
- PostgreSQL database is running
- You have the Firebase UID from Step 2

**Option A: Using psql (Command Line)**

```bash
# 1. Get the Firebase UID from Step 2 output
# 2. Edit the SQL file and replace 'FIREBASE_USER_UID' with actual UID

# 3. Connect to your database and run the script
psql $DATABASE_URL -f C:\Users\tabor\Downloads\C12USD_project\C12USD\scripts\create-admin-db.sql
```

**Option B: Using Prisma Studio (GUI)**

```bash
# 1. Open Prisma Studio
npx prisma studio

# 2. Navigate to 'users' table
# 3. Click "Add record" and enter:
#    - id: [FIREBASE_UID from Step 2]
#    - email: vrdivebar@gmail.com
#    - address: 0x7903c63CB9f42284d03BC2a124474760f9C1390b
#    - created_at: [current timestamp]
#    - updated_at: [current timestamp]

# 4. Navigate to 'admin_roles' table
# 5. Click "Add record" and enter:
#    - id: [auto-generated]
#    - user_id: [FIREBASE_UID from Step 2]
#    - role: SUPER_ADMIN
#    - permissions: ["ALL"]
#    - is_active: true
#    - created_at: [current timestamp]
#    - updated_at: [current timestamp]
```

**Verify Database Records:**

```sql
-- Run this to verify everything was created correctly
SELECT
  ar.id,
  ar.role,
  ar.permissions,
  ar.is_active,
  u.email,
  u.address
FROM admin_roles ar
JOIN users u ON ar.user_id = u.id
WHERE u.email = 'vrdivebar@gmail.com';
```

**Expected Result:**
```
 role        | permissions | is_active | email                | address
-------------+-------------+-----------+---------------------+------------------------------------------
 SUPER_ADMIN | {ALL}       | t         | vrdivebar@gmail.com | 0x7903c63CB9f42284d03BC2a124474760f9C1390b
```

---

### Step 4: User Must Re-authenticate 🔄

**Action Required:** The user must sign out and sign back in.

**Why?** Firebase custom claims are only refreshed when a new ID token is issued. This happens during login.

**Instructions:**
1. In the C12USD application, click "Sign Out"
2. Sign back in with:
   - Email: vrdivebar@gmail.com
   - Password: [password from Step 1]

---

### Step 5: Test Admin Access 🧪

**Test the admin dashboard:**

```
Navigate to: http://[your-app-url]/admin/payments
```

**Expected Behavior:**
- ✅ Page loads (not redirected to home)
- ✅ Shows "Payment Management" header
- ✅ Displays admin email badge in top-right
- ✅ Can switch between "Payment Queue" and "Analytics" tabs
- ✅ No "Access Denied" error

**If you see "Access Denied":**
1. Check browser console for errors
2. Verify custom claims were set (run step 2 again)
3. Ensure user signed out and back in (step 4)
4. Verify database records exist (run SQL query from step 3)

---

## Troubleshooting

### Issue: Script says "User not found"

**Cause:** User hasn't signed up yet or wrong email

**Solution:**
1. Verify user signed up in the app
2. Check email spelling: vrdivebar@gmail.com
3. Export Firebase users to verify:
   ```bash
   firebase auth:export users.json
   cat users.json | grep vrdivebar
   ```

---

### Issue: Custom claims not working

**Cause:** User didn't sign out/in after claims were set

**Solution:**
1. Force sign out in the app
2. Clear browser cache/cookies
3. Sign back in
4. Check ID token in browser DevTools:
   ```javascript
   // In browser console
   firebase.auth().currentUser.getIdTokenResult()
     .then(token => console.log(token.claims));
   ```

---

### Issue: Database query returns no results

**Cause:** User ID mismatch between Firebase and database

**Solution:**
1. Get Firebase UID:
   ```bash
   node scripts/set-admin-claims.js
   ```
2. Check database:
   ```sql
   SELECT * FROM users WHERE email = 'vrdivebar@gmail.com';
   ```
3. Ensure IDs match - if not, update database:
   ```sql
   UPDATE users SET id = '[CORRECT_FIREBASE_UID]'
   WHERE email = 'vrdivebar@gmail.com';
   ```

---

### Issue: Can't access /admin/payments

**Cause:** Missing role check or security rules

**Solution:**
1. Check Firebase custom claims exist:
   ```bash
   node scripts/set-admin-claims.js
   ```
2. Verify database admin_roles record exists
3. Clear browser cache and retry
4. Check browser console for specific error

---

## Quick Reference

### Admin User Details
- **Email**: vrdivebar@gmail.com
- **Wallet**: 0x7903c63CB9f42284d03BC2a124474760f9C1390b
- **Role**: SUPER_ADMIN
- **Permissions**: ALL
- **Firebase Project**: c12ai-dao-b3bbb

### Key Commands

```bash
# Set custom claims
cd C:\Users\tabor\Downloads\C12USD_project\C12USD
node scripts\set-admin-claims.js

# Create database records
psql $DATABASE_URL -f scripts\create-admin-db.sql

# Verify user exists
firebase auth:export users.json
cat users.json | grep vrdivebar

# Open Prisma Studio
npx prisma studio
```

### Key Files
- Custom claims script: `scripts/set-admin-claims.js`
- Database SQL: `scripts/create-admin-db.sql`
- Firebase config: `.firebaserc`

---

## Next Steps After Admin Setup

Once admin setup is complete:

1. **Deploy Firebase Functions**
   ```bash
   cd functions
   firebase deploy --only functions:manualPayments
   ```

2. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   vercel deploy --prod
   ```

4. **Add QR Code Image**
   - Save Cash App QR to: `frontend/user/public/assets/qr/cashapp-payment-qr.png`

5. **Test End-to-End**
   - User flow: token purchase
   - Admin flow: payment review
   - Analytics dashboard

---

**Status**: Waiting for user signup at Step 1

**Current Step**: User must sign up at the C12USD application with email vrdivebar@gmail.com

**Last Updated**: October 2, 2025
