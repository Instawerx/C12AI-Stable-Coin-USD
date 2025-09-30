# Firebase Services Setup Guide

## Overview
This document provides instructions for enabling and configuring Firebase services for the C12USD Stablecoin project.

## Project Information
- **Firebase Project**: c12ai-dao-b3bbb
- **Project Number**: 268788831367
- **GCP Project**: c12ai-dao (Project #239414215297)

## Already Enabled Services

Based on service check, the following services are already enabled:

### Firebase Core Services
- ✅ `firebase.googleapis.com` - Firebase Core API
- ✅ `firestore.googleapis.com` - Cloud Firestore
- ✅ `identitytoolkit.googleapis.com` - Firebase Authentication
- ✅ `firebasehosting.googleapis.com` - Firebase Hosting
- ✅ `firebaseapphosting.googleapis.com` - Firebase App Hosting
- ✅ `firebaseinstallations.googleapis.com` - Firebase Installations
- ✅ `firebaseremoteconfig.googleapis.com` - Firebase Remote Config
- ✅ `firebasedataconnect.googleapis.com` - Firebase Data Connect
- ✅ `firebaserules.googleapis.com` - Firebase Security Rules

### Additional Services Available
- `firebasestorage.googleapis.com` - Firebase Storage (needs enabling)
- `firebaseappcheck.googleapis.com` - Firebase App Check (recommended)
- `firebaseml.googleapis.com` - Firebase ML (optional)

## Manual Configuration Required

### 1. Create Firestore Database

**Current Status**: No databases found

**Steps to Create**:

1. Go to Firebase Console:
   ```
   https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore
   ```

2. Click **"Create database"**

3. Choose location:
   - **Recommended**: `us-central1` (Iowa)
   - Reason: Same region as Cloud Run backend

4. Select mode:
   - **Production mode** (with security rules)
   - Security rules will be deployed from `firestore.rules`

5. Click **"Enable"**

**Expected Result**:
```
Database created: (default)
Location: us-central1
Rules: Production mode
```

### 2. Enable Firebase Authentication Providers

**Firebase Console URL**:
```
https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers
```

#### Email/Password Provider

1. Go to Authentication > Sign-in method
2. Click on **"Email/Password"**
3. Enable the provider
4. Click **"Save"**

**Configuration**:
- ✓ Email/Password enabled
- ✓ Email link (passwordless sign-in) - Optional
- ✓ Email enumeration protection - RECOMMENDED

#### Google OAuth Provider

1. Click on **"Google"**
2. Enable the provider
3. Configure support email:
   ```
   vrdivebar@gmail.com
   ```
4. Click **"Save"**

**Note**: Google OAuth client ID is automatically created by Firebase

#### Facebook OAuth Provider (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app or use existing
3. Get App ID and App Secret
4. Return to Firebase Console > Authentication
5. Click **"Facebook"**
6. Enable and enter:
   - App ID: `[YOUR_FACEBOOK_APP_ID]`
   - App Secret: `[YOUR_FACEBOOK_APP_SECRET]`
7. Copy OAuth redirect URI and add to Facebook App settings
8. Click **"Save"**

### 3. Configure Authorized Domains

**Firebase Console URL**:
```
https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/settings
```

Go to **"Authorized domains"** section and add:

- ✅ `localhost` (already added)
- ✅ `c12ai-dao-b3bbb.firebaseapp.com` (already added)
- ⬜ `c12ai-dao-b3bbb.web.app` (add this)
- ⬜ Your custom domain (e.g., `app.c12usd.com`)
- ⬜ Your App Hosting URL when deployed

### 4. Enable Firebase Storage

**Firebase Console URL**:
```
https://console.firebase.google.com/project/c12ai-dao-b3bbb/storage
```

1. Click **"Get started"**
2. Review security rules
3. Choose location: `us-central1`
4. Click **"Done"**

**Storage will be used for**:
- User profile images
- KYC document uploads
- Proof of reserve attestations

### 5. Deploy Firestore Security Rules

From your local machine:

```bash
cd C:\Users\tabor\Downloads\C12USD_project\C12USD
firebase deploy --only firestore:rules --project=c12ai-dao-b3bbb
```

**Rules file**: `firestore.rules`

**What the rules enforce**:
- Users can only read/write their own data
- Transactions linked to wallet addresses
- Admin-only access for KYC and audit logs
- Public read for proof-of-reserves

### 6. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes --project=c12ai-dao-b3bbb
```

**Indexes file**: `firestore.indexes.json`

**Indexes created for**:
- Transaction queries by user and date
- User queries by email and wallet address
- Proof-of-reserves queries by chain and timestamp

### 7. Deploy Storage Rules

```bash
firebase deploy --only storage --project=c12ai-dao-b3bbb
```

**Rules file**: `storage.rules`

**What the rules enforce**:
- Users can only access their own files
- File size limits enforced
- File type restrictions (images, PDFs only)

### 8. Enable Firebase App Check (Recommended)

**Why App Check?**
- Protects against abuse (bots, scrapers)
- Free tier: 5M verifications/month
- Required for production security

**Steps**:

1. Go to Firebase Console:
   ```
   https://console.firebase.google.com/project/c12ai-dao-b3bbb/appcheck
   ```

2. Click **"Get started"**

3. For Web App, choose:
   - **reCAPTCHA Enterprise** (recommended for production)
   - **reCAPTCHA v3** (easier for development)

4. Register your app

5. Add App Check SDK to frontend:
   ```typescript
   // src/lib/firebase.ts
   import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

   const appCheck = initializeAppCheck(app, {
     provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
     isTokenAutoRefreshEnabled: true
   });
   ```

6. Update environment variables:
   ```env
   NEXT_PUBLIC_FIREBASE_APPCHECK_KEY=your_recaptcha_site_key
   ```

## Verification Commands

After setup, verify everything works:

### Check Firestore Database
```bash
firebase firestore:databases:list --project=c12ai-dao-b3bbb
```

Expected output:
```
(default) - us-central1
```

### Check Authentication Providers
Go to: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers

Expected:
- ✓ Email/Password: Enabled
- ✓ Google: Enabled
- ✓ Facebook: Enabled (if configured)

### Check Storage Bucket
```bash
gsutil ls -p c12ai-dao-b3bbb
```

Expected output:
```
gs://c12ai-dao-b3bbb.appspot.com/
gs://c12ai-dao-b3bbb.firebasestorage.app/
```

### Test Firestore Connection
```bash
node scripts/verify-service-account.js
```

Expected: All checks pass

## Environment Variables

After services are enabled, verify `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCS_f1-nt1oE1MLQtNwA48SMkaLn5ERM4c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=c12ai-dao-b3bbb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=c12ai-dao-b3bbb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=c12ai-dao-b3bbb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=268788831367
NEXT_PUBLIC_FIREBASE_APP_ID=1:268788831367:web:40c645a16c754dfe3d9422
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5KZ40WHD28

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# API Configuration
NEXT_PUBLIC_API_URL=https://c12usd-backend-prod-239414215297.us-central1.run.app
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Environment
NODE_ENV=development
```

## Common Issues

### Issue: "Project doesn't have Firestore enabled"
**Solution**: Create Firestore database in Firebase Console (Step 1 above)

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy Firestore rules: `firebase deploy --only firestore:rules`

### Issue: "Auth domain not authorized"
**Solution**: Add domain to authorized domains in Authentication settings

### Issue: "Storage bucket doesn't exist"
**Solution**: Enable Firebase Storage in Firebase Console (Step 4 above)

## Security Checklist

Before going to production:

- [ ] Firestore security rules deployed and tested
- [ ] Storage security rules deployed and tested
- [ ] Email enumeration protection enabled
- [ ] Firebase App Check enabled
- [ ] Authorized domains configured
- [ ] Service account key secured (not in git)
- [ ] Environment variables not hardcoded
- [ ] HTTPS enforced on all domains
- [ ] Password policy configured
- [ ] MFA available for admin accounts

## Next Steps

After completing this setup:

1. ✓ Enable Firestore database
2. ✓ Enable Authentication providers
3. ✓ Deploy security rules
4. → Seed Firestore with test data: `node scripts/seed-firestore.js`
5. → Test authentication: `node scripts/test-firebase-auth.js`
6. → Start emulators: `firebase emulators:start`
7. → Build frontend: `cd frontend/user && npm run build`

## Support Resources

- Firebase Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb
- Firestore: https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore
- Authentication: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication
- Storage: https://console.firebase.google.com/project/c12ai-dao-b3bbb/storage
- Documentation: https://firebase.google.com/docs

---

**Last Updated**: 2025-09-30
**Document Version**: 1.0
