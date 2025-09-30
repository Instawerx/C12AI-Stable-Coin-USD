# Firebase Authentication Providers Setup

## Required Providers Configuration

### 1. Email/Password Authentication (5 minutes)

#### Enable Email/Password Provider

1. Open Authentication Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers

2. Click **"Email/Password"**

3. Click **"Enable"** toggle

4. ✅ Enable **"Email/Password"**
5. ✅ Enable **"Email link (passwordless sign-in)"** (optional but recommended)

6. Click **"Save"**

#### Configure Email Templates

1. Go to **Templates** tab: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/emails

2. Customize these templates:
   - ✉️ Email verification
   - 🔒 Password reset
   - 📧 Email address change

---

### 2. GitHub OAuth Provider (10 minutes)

#### Step 1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in details:
   - **Application name:** `C12USD Stablecoin`
   - **Homepage URL:** `https://c12ai-dao-b3bbb.web.app`
   - **Authorization callback URL:** `https://c12ai-dao-b3bbb.firebaseapp.com/__/auth/handler`

4. Click **"Register application"**

5. **Copy** the **Client ID**

6. Click **"Generate a new client secret"**

7. **Copy** the **Client Secret** (you won't see it again!)

#### Step 2: Enable in Firebase

1. Open Authentication Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers

2. Click **"GitHub"**

3. Click **"Enable"** toggle

4. Paste **Client ID** from GitHub

5. Paste **Client Secret** from GitHub

6. **Copy** the **Authorization callback URL** from Firebase

7. Click **"Save"**

#### Step 3: Verify GitHub OAuth App

Go back to your GitHub OAuth App settings and verify the callback URL matches.

---

### 3. Google OAuth Provider (Optional - 5 minutes)

#### Enable Google Sign-In

1. Open Authentication Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication/providers

2. Click **"Google"**

3. Click **"Enable"** toggle

4. **Project support email:** Select `vrdivebar@gmail.com`

5. Click **"Save"**

#### Configure OAuth Consent Screen (if needed)

If you haven't already:

1. Go to: https://console.cloud.google.com/apis/credentials/consent?project=c12ai-dao-b3bbb

2. Select **"External"** user type

3. Fill in:
   - **App name:** `C12USD Stablecoin`
   - **User support email:** `vrdivebar@gmail.com`
   - **Developer contact:** `vrdivebar@gmail.com`

4. Add scopes: `email`, `profile`, `openid`

5. Click **"Save and Continue"**

---

### 4. MetaMask/Web3 Wallet Integration

#### Configuration in Codebase

MetaMask integration is already configured in:
- `frontend/user/src/lib/wagmi.ts`
- Uses RainbowKit v2 + Wagmi v2
- Supports BSC and Polygon networks

#### Required: WalletConnect Project ID

1. Go to: https://cloud.walletconnect.com/

2. Create account or sign in

3. Create new project: **"C12USD Stablecoin"**

4. **Copy** the **Project ID**

5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

#### Verify Contract Addresses

Already configured:
- **BSC:** `0x6fa920C5c676ac15AF6360D9D755187a6C87bd58`
- **Polygon:** `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`

---

## Verification Checklist

After completing setup:

### ✅ Email/Password
```bash
node scripts/test-firebase-auth.js
```

### ✅ GitHub OAuth
- Test login flow in development: `npm run dev`
- Navigate to `/login`
- Click "Sign in with GitHub"

### ✅ Google OAuth (if enabled)
- Test login flow in development
- Click "Sign in with Google"

### ✅ MetaMask
- Test wallet connection: `npm run dev`
- Navigate to `/wallet`
- Click "Connect Wallet"
- Select MetaMask
- Switch to BSC or Polygon network

---

## Next Steps After Provider Setup

1. ✅ Test email/password signup: `node scripts/create-test-users.js`
2. ✅ Test OAuth flows in browser
3. ✅ Test MetaMask connection
4. Enable Firestore and seed test data
5. Start full integration testing
