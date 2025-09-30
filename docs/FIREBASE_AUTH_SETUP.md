# Firebase Authentication Setup Guide

## Project Information
- **Project ID**: c12ai-dao-b3bbb
- **Frontend Path**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\frontend\user`
- **Firebase SDK Version**: 10.7.0
- **Authentication Methods**: Email/Password, Google OAuth, Facebook OAuth, Apple (UI only)

---

## Table of Contents
1. [Current Implementation Overview](#current-implementation-overview)
2. [Enable Authentication Providers](#enable-authentication-providers)
3. [Configure OAuth Providers](#configure-oauth-providers)
4. [Authorized Domains Configuration](#authorized-domains-configuration)
5. [Security Best Practices](#security-best-practices)
6. [Email Verification Setup](#email-verification-setup)
7. [Password Reset Configuration](#password-reset-configuration)
8. [Custom Claims for Admin Roles](#custom-claims-for-admin-roles)
9. [Testing Procedures](#testing-procedures)
10. [Troubleshooting](#troubleshooting)

---

## Current Implementation Overview

### Implemented Authentication Methods

#### 1. Email/Password Authentication
**Files**:
- `frontend/user/src/lib/firebase.ts` (lines 72-88)
- `frontend/user/src/contexts/AuthContext.tsx` (lines 33-36)
- `frontend/user/src/app/auth/login/page.tsx` (lines 50-63)
- `frontend/user/src/app/auth/signup/page.tsx` (lines 83-102)

**Features**:
- User registration with email/password
- Sign-in with email/password
- Password validation (min 8 chars, uppercase, lowercase, number)
- Display name support
- User document creation in Firestore

#### 2. Google OAuth
**Files**:
- `frontend/user/src/lib/firebase.ts` (lines 50, 54-61)
- Both login and signup pages support Google authentication

**Implementation**: Uses `signInWithPopup` with `GoogleAuthProvider`

#### 3. Facebook OAuth
**Files**:
- `frontend/user/src/lib/firebase.ts` (lines 51, 63-70)

**Implementation**: Uses `signInWithPopup` with `FacebookAuthProvider`

#### 4. Apple Sign-In
**Status**: UI implemented but not fully configured
**Note**: Requires additional Firebase setup and Apple Developer account

### Firebase Configuration
Location: `frontend/user/.env.local` (not in version control)

Required environment variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=c12ai-dao-b3bbb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=c12ai-dao-b3bbb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=c12ai-dao-b3bbb.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## Enable Authentication Providers

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **c12ai-dao-b3bbb**
3. Navigate to **Authentication** → **Sign-in method**

### Step 2: Enable Email/Password

1. Click on **Email/Password** provider
2. Enable the **first toggle** (Email/Password)
3. **Optional**: Enable **Email link (passwordless sign-in)**
   - This allows users to sign in via magic link
   - Requires additional frontend implementation
4. Click **Save**

**Configuration Options**:
- **Password policy**: Set minimum requirements
  - Current frontend validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - Recommended: Enforce in Firebase settings
- **Email enumeration protection**: Enable to prevent email discovery attacks

### Step 3: Enable Google OAuth

1. Click on **Google** provider
2. Toggle **Enable**
3. Configure:
   - **Project public-facing name**: "C12USD Stablecoin Platform"
   - **Project support email**: Select your admin email
4. Click **Save**

**Important Notes**:
- Default configuration uses Firebase's OAuth client
- For production, consider using custom OAuth client (see OAuth Configuration section)
- Google OAuth works out-of-the-box for web applications

### Step 4: Enable Facebook OAuth

1. Click on **Facebook** provider
2. Toggle **Enable**
3. You will need:
   - **App ID**: From Facebook Developers Console
   - **App Secret**: From Facebook Developers Console
4. Copy the **OAuth redirect URI** provided by Firebase
5. Configure in Facebook Developers Console (see OAuth Configuration section)
6. Paste App ID and App Secret into Firebase
7. Click **Save**

### Step 5: Enable Apple Sign-In (Optional)

1. Click on **Apple** provider
2. Toggle **Enable**
3. Requirements:
   - Apple Developer Account ($99/year)
   - Service ID configuration
   - Private key for Sign in with Apple
4. Follow [Firebase Apple Sign-In Guide](https://firebase.google.com/docs/auth/web/apple)

**Note**: Apple Sign-In button is implemented in UI but needs backend configuration

---

## Configure OAuth Providers

### Google OAuth Configuration

#### Using Default Firebase OAuth Client (Recommended for Development)
Firebase provides a default OAuth client that works immediately after enabling. No additional setup required.

#### Using Custom OAuth Client (Recommended for Production)

**Why use custom client?**
- More control over branding
- Custom consent screen
- Better analytics
- Required for some advanced features

**Setup Steps**:

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/
   - Select project: c12ai-dao-b3bbb

2. **Enable Google+ API** (if not already enabled)
   - APIs & Services → Library
   - Search for "Google+ API"
   - Click Enable

3. **Create OAuth 2.0 Credentials**
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "C12USD Production Web Client"

4. **Configure Authorized Origins**
   ```
   Development:
   - http://localhost:3001
   - http://127.0.0.1:3001

   Production:
   - https://c12ai-dao-b3bbb.web.app
   - https://c12ai-dao-b3bbb.firebaseapp.com
   - https://your-custom-domain.com
   ```

5. **Configure Authorized Redirect URIs**
   ```
   Development:
   - http://localhost:3001/__/auth/handler

   Production:
   - https://c12ai-dao-b3bbb.firebaseapp.com/__/auth/handler
   - https://your-custom-domain.com/__/auth/handler
   ```

6. **Update Firebase Configuration**
   - Copy Client ID
   - In Firebase Console → Authentication → Sign-in method → Google
   - Click "Advanced" and paste your custom Client ID
   - Add Web SDK configuration if prompted

7. **Configure OAuth Consent Screen**
   - Go to APIs & Services → OAuth consent screen
   - User Type: **External** (for public app)
   - Fill in required fields:
     - App name: "C12USD Stablecoin Platform"
     - User support email: your-email@domain.com
     - Developer contact information
   - Add scopes:
     - `./auth/userinfo.email`
     - `./auth/userinfo.profile`
     - `openid`
   - Add test users (if app is in testing mode)

### Facebook OAuth Configuration

1. **Create Facebook App**
   - Go to: https://developers.facebook.com/
   - Click "My Apps" → "Create App"
   - Use case: **Consumer**
   - App name: "C12USD Platform"
   - Contact email: your-email@domain.com

2. **Add Facebook Login Product**
   - In app dashboard, click "Add Product"
   - Find "Facebook Login" → Click "Set Up"
   - Choose "Web" platform

3. **Configure OAuth Settings**
   - In left sidebar: Products → Facebook Login → Settings
   - **Valid OAuth Redirect URIs**:
     ```
     https://c12ai-dao-b3bbb.firebaseapp.com/__/auth/handler
     https://your-custom-domain.com/__/auth/handler
     ```
   - Enable "Login with the JavaScript SDK"
   - Enable "Use Strict Mode for Redirect URIs"
   - Save changes

4. **Get App Credentials**
   - Settings → Basic
   - Copy **App ID**
   - Show and copy **App Secret**

5. **Configure in Firebase**
   - Firebase Console → Authentication → Sign-in method → Facebook
   - Paste App ID and App Secret
   - Copy the OAuth redirect URI from Firebase
   - Ensure it matches what you entered in Facebook settings

6. **App Review (for Production)**
   - Submit for review to make app public
   - Required permissions: `email`, `public_profile`
   - Until approved, only test users can log in

7. **Configure Test Users** (During Development)
   - Roles → Test Users
   - Add test Facebook accounts for testing

### Facebook Business Verification
For production, you may need:
- Business verification (for large user base)
- Privacy Policy URL
- Terms of Service URL
- Data Deletion Instructions URL

---

## Authorized Domains Configuration

### Current Setup
Firebase restricts authentication to authorized domains for security.

### Development Domains (Already Configured)
```
localhost
127.0.0.1
```

### Firebase Default Domains (Auto-configured)
```
c12ai-dao-b3bbb.firebaseapp.com
c12ai-dao-b3bbb.web.app
```

### Add Production/Custom Domains

1. **In Firebase Console**:
   - Authentication → Settings → Authorized domains
   - Click "Add domain"

2. **Domains to Add**:
   ```
   Production:
   - app.c12usd.com (or your custom domain)
   - www.c12usd.com

   Staging:
   - staging.c12usd.com
   ```

3. **Domain Verification**:
   - For custom domains, you may need to verify ownership
   - Add TXT record to DNS as instructed by Firebase

### CORS Configuration
Ensure your custom domains support CORS if making API calls from different origins.

---

## Security Best Practices

### 1. Password Policy Enforcement

**Current Frontend Validation**:
```typescript
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
```

**Enforce in Firebase**:
1. Authentication → Settings → Password policy
2. Enable **Enforce password policy**
3. Configure:
   - Minimum length: **12 characters** (more secure than 8)
   - Require uppercase letter: **Yes**
   - Require lowercase letter: **Yes**
   - Require numeric character: **Yes**
   - Require special character: **Yes** (recommended)

**Update Frontend Validation** to match Firebase policy:
```typescript
// frontend/user/src/app/auth/signup/page.tsx
const passwordRequirements = [
  { id: 'length', text: 'At least 12 characters', test: (pwd: string) => pwd.length >= 12 },
  { id: 'uppercase', text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
  { id: 'number', text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
  { id: 'special', text: 'One special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];
```

### 2. Enable Email Enumeration Protection

**Why**: Prevents attackers from discovering registered email addresses

**How to Enable**:
1. Authentication → Settings
2. Find "User account management"
3. Enable **Email enumeration protection**

**Impact**:
- Sign-in errors will be generic: "Wrong email or password"
- Cannot distinguish between "user not found" and "wrong password"
- Better security, slightly worse UX

### 3. Rate Limiting

**Firebase automatically provides**:
- Rate limiting on authentication endpoints
- Protection against brute-force attacks

**Additional Protection**:
Implement in your Firestore rules (already present in `firestore-enhanced.rules`):
```javascript
// Limit requests per user
match /rate_limits/{userId} {
  allow read, write: if request.auth != null &&
    (request.auth.uid == userId || request.auth.token.admin == true);
}
```

**Backend Rate Limiting** (Optional):
- Use Cloud Functions to track failed login attempts
- Temporarily block IPs with excessive failures
- Send alerts on suspicious activity

### 4. Multi-Factor Authentication (MFA)

**Recommended for**:
- Admin accounts
- High-value transactions
- Sensitive operations

**Setup**:
1. Authentication → Sign-in method → Advanced → Multi-factor authentication
2. Enable **SMS** or **TOTP** (Time-based One-Time Password)
3. **Enforcement**: Optional or Required

**Implementation** (requires additional frontend code):
- Users can enable MFA in their profile settings
- Admin accounts should be required to use MFA

### 5. Session Management

**Current Implementation**:
- Uses Firebase's default session management
- Session tokens automatically refreshed
- Tokens expire after 1 hour (refreshed automatically)

**Additional Security**:
```typescript
// Force re-authentication for sensitive operations
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

async function reauthenticateUser(password: string) {
  const user = auth.currentUser;
  if (!user || !user.email) return;

  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}
```

### 6. Security Monitoring

**Enable in Firebase**:
- Authentication → Settings → Security
- Enable **Suspicious activity detection**
- Configure email alerts for admins

**What it monitors**:
- Unusual sign-in locations
- Multiple failed login attempts
- Account takeover attempts
- Token theft

### 7. Account Takeover Protection

**Recommendations**:
1. **Email verification required** (see Email Verification section)
2. **Send notification on new sign-in**
   - Implement via Cloud Functions
   - Email user when signing in from new device/location
3. **Account recovery process**
   - Require email verification for password reset
   - Optional: Security questions
   - Optional: SMS verification

### 8. Secure Token Management

**Best Practices**:
- Never expose Firebase config in public repositories (already done with `.env`)
- Use environment variables for sensitive data
- Rotate API keys periodically
- Use Firebase App Check for additional API security

### 9. Data Privacy Compliance

**GDPR/CCPA Compliance**:
- Implement data export functionality
- Implement account deletion
- Clear privacy policy
- Cookie consent banner
- Data retention policies

**Firebase Features**:
- User data export via Firebase Console
- Automatic user deletion via API

---

## Email Verification Setup

### Why Email Verification?
- Confirms user owns the email address
- Reduces spam and fake accounts
- Required for password reset
- Improves email deliverability

### Enable Email Verification

**Method 1: Automatic (Recommended)**

Update signup function to send verification email:

```typescript
// frontend/user/src/lib/firebase.ts
import { sendEmailVerification } from 'firebase/auth';

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Send verification email
    if (result.user) {
      await sendEmailVerification(result.user, {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
        handleCodeInApp: false
      });
    }

    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};
```

**Method 2: Manual Trigger**

Allow users to request verification email:

```typescript
// frontend/user/src/lib/firebase.ts
export const sendVerificationEmail = async () => {
  const user = auth.currentUser;
  if (!user) return { error: 'No user signed in' };

  try {
    await sendEmailVerification(user, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard`,
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
```

### Customize Email Templates

1. **In Firebase Console**:
   - Authentication → Templates
   - Select template: **Email address verification**

2. **Customize**:
   - From name: "C12USD Platform"
   - Reply-to email: support@c12usd.com
   - Subject: "Verify your email for C12USD"
   - Body: Customize with your branding

**Default Template Variables**:
- `%LINK%`: Verification link
- `%EMAIL%`: User's email
- `%DISPLAY_NAME%`: User's display name
- `%APP_NAME%`: Your app name

**Example Custom Template**:
```html
Hello %DISPLAY_NAME%,

Welcome to C12USD! Please verify your email address by clicking the link below:

%LINK%

If you didn't create an account with C12USD, you can safely ignore this email.

Best regards,
The C12USD Team
```

### Enforce Email Verification

**In Firestore Rules**:
```javascript
// firestore-enhanced.rules
function isEmailVerified() {
  return request.auth != null && request.auth.token.email_verified == true;
}

match /transactions/{transactionId} {
  allow create: if isEmailVerified() && isNotBlacklisted();
}
```

**In Frontend**:
```typescript
// Check if email is verified before critical operations
const user = auth.currentUser;
if (!user?.emailVerified) {
  toast.error('Please verify your email before proceeding');
  return;
}
```

### Verification Flow UI

Create a banner or modal to prompt unverified users:

```typescript
// frontend/user/src/components/EmailVerificationBanner.tsx
export function EmailVerificationBanner() {
  const { user } = useAuth();

  if (!user || user.emailVerified) return null;

  return (
    <div className="bg-yellow-500 text-white p-4">
      <p>Please verify your email. Check your inbox.</p>
      <button onClick={sendVerificationEmail}>
        Resend verification email
      </button>
    </div>
  );
}
```

---

## Password Reset Configuration

### Current Implementation

The Firebase SDK provides built-in password reset functionality.

### Implement Password Reset Flow

**1. Add Password Reset Function**:

```typescript
// frontend/user/src/lib/firebase.ts
import { sendPasswordResetEmail } from 'firebase/auth';

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      handleCodeInApp: false
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
```

**2. Create Password Reset Page**:

```typescript
// frontend/user/src/app/auth/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import { resetPassword } from '../../../lib/firebase';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
      setEmail('');
    }

    setIsSubmitting(false);
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" disabled={isSubmitting}>
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
```

### Customize Password Reset Email

1. **Firebase Console**:
   - Authentication → Templates
   - Select: **Password reset**

2. **Customize**:
   - From name: "C12USD Support"
   - Subject: "Reset your C12USD password"
   - Body: Add branding and instructions

**Example Template**:
```html
Hello %DISPLAY_NAME%,

We received a request to reset your password for your C12USD account.

Click the link below to create a new password:
%LINK%

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 1 hour.

Best regards,
The C12USD Team
```

### Password Reset Action Handler

For custom password reset pages, create an action handler:

```typescript
// frontend/user/src/app/auth/action/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function AuthActionPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (mode === 'resetPassword' && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          console.log('Valid code for email:', email);
        })
        .catch((error) => {
          console.error('Invalid or expired code:', error);
        });
    }
  }, [mode, oobCode]);

  const handleResetPassword = async () => {
    if (!oobCode) return;

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success('Password reset successful! Please sign in.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Render UI based on mode
  return <div>...</div>;
}
```

### Security Considerations

1. **Rate Limiting**:
   - Firebase automatically rate limits password reset requests
   - Prevents abuse and spam

2. **Link Expiration**:
   - Password reset links expire after 1 hour
   - Links are single-use only

3. **Email Verification**:
   - Only send reset emails to verified addresses
   - Prevents account takeover via email change

---

## Custom Claims for Admin Roles

### Why Custom Claims?
- Assign admin privileges to specific users
- Used in Firestore security rules
- Persistent across sessions
- Secure (can only be set server-side)

### Current Usage in Firestore Rules

**From `firestore-enhanced.rules`**:
```javascript
function isAdmin() {
  return request.auth != null &&
         ('admin' in request.auth.token && request.auth.token.admin == true);
}

function hasRole(role) {
  return isAuthenticated() &&
         ('roles' in request.auth.token &&
          role in request.auth.token.roles);
}
```

**Available Roles**:
- `admin`: Full system access
- `kyc_reviewer`: Can review KYC documents
- `compliance_officer`: Access compliance data
- `treasury_operator`: Manage treasury operations
- `transaction_processor`: Process transactions
- `bridge_operator`: Manage cross-chain transfers
- `reserve_manager`: Update reserve snapshots
- `auditor`: Read audit logs
- `monitor`: View system health
- `security_officer`: Access security events

### Set Custom Claims via Cloud Functions

**1. Create Admin Management Function**:

```typescript
// functions/src/admin.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin SDK
admin.initializeApp();

export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if requester is admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set admin claims'
    );
  }

  const { uid, isAdmin } = data;

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    return { success: true, message: `Admin claim set for user ${uid}` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error setting custom claim');
  }
});

export const setUserRoles = functions.https.onCall(async (data, context) => {
  // Check if requester is admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set user roles'
    );
  }

  const { uid, roles } = data;

  try {
    await admin.auth().setCustomUserClaims(uid, { roles });
    return { success: true, message: `Roles set for user ${uid}` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error setting roles');
  }
});
```

**2. Set Initial Admin via Firebase CLI**:

```bash
# Install Firebase Admin SDK globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create a one-time script
node scripts/setup-initial-admin.js
```

**3. Create Setup Script**:

```javascript
// scripts/setup-initial-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setInitialAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true,
      roles: {
        admin: true,
        compliance_officer: true,
        treasury_operator: true,
      }
    });
    console.log(`Successfully set admin claim for ${email}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Replace with your admin email
setInitialAdmin('admin@c12usd.com');
```

**4. Get Service Account Key**:
1. Firebase Console → Project Settings
2. Service Accounts tab
3. Click "Generate new private key"
4. Save as `scripts/service-account-key.json`
5. **IMPORTANT**: Add to `.gitignore` - never commit this file!

### Frontend Admin Panel

Create an admin interface to manage user roles:

```typescript
// frontend/user/src/app/admin/users/page.tsx
'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../lib/firebase';

export default function UserManagementPage() {
  const [userId, setUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const setUserRolesFunction = httpsCallable(functions, 'setUserRoles');

  const handleSetRoles = async () => {
    try {
      const roles = selectedRoles.reduce((acc, role) => ({
        ...acc,
        [role]: true
      }), {});

      await setUserRolesFunction({ uid: userId, roles });
      toast.success('Roles updated successfully');
    } catch (error) {
      toast.error('Failed to update roles');
    }
  };

  return (
    <div>
      <h1>User Management</h1>
      {/* UI for selecting users and roles */}
    </div>
  );
}
```

### Verify Custom Claims

**In Frontend**:
```typescript
const user = auth.currentUser;
if (user) {
  const idTokenResult = await user.getIdTokenResult();
  console.log('Admin:', idTokenResult.claims.admin);
  console.log('Roles:', idTokenResult.claims.roles);
}
```

**Force Token Refresh** after setting claims:
```typescript
await auth.currentUser?.getIdToken(true); // Force refresh
```

---

## Testing Procedures

### Pre-Testing Checklist

- [ ] All authentication providers enabled in Firebase Console
- [ ] OAuth credentials configured (Google, Facebook)
- [ ] Authorized domains added
- [ ] Email templates customized
- [ ] Environment variables set correctly
- [ ] Frontend application running locally

### Test Scenarios

#### Test 1: Email/Password Registration

**Steps**:
1. Navigate to `/auth/signup`
2. Fill in registration form:
   - Display name: "Test User"
   - Email: "test@example.com"
   - Password: "Test123456!" (meets all requirements)
   - Confirm password: "Test123456!"
3. Check "I agree to terms"
4. Click "Create Account"

**Expected Results**:
- ✅ Password requirements all show green checkmarks
- ✅ Account created successfully
- ✅ Redirected to `/app/dashboard`
- ✅ User document created in Firestore (`users/{uid}`)
- ✅ Verification email sent (check inbox)
- ✅ Toast notification: "Account created successfully!"

**Verify in Firebase Console**:
- Authentication → Users → New user appears
- Firestore → users collection → Document exists with user data

#### Test 2: Email/Password Login

**Steps**:
1. Navigate to `/auth/login`
2. Enter email and password from Test 1
3. Click "Sign In"

**Expected Results**:
- ✅ Login successful
- ✅ Redirected to `/app/dashboard`
- ✅ User data loaded in AuthContext
- ✅ Toast notification: "Welcome back!"

#### Test 3: Google OAuth Sign-Up

**Steps**:
1. Navigate to `/auth/signup`
2. Click "Continue with Google"
3. Select/login with Google account in popup
4. Grant permissions

**Expected Results**:
- ✅ Popup window opens
- ✅ Google login completes
- ✅ Popup closes automatically
- ✅ Account created in Firebase
- ✅ Redirected to `/app/dashboard`
- ✅ User document created in Firestore
- ✅ Display name and photo from Google profile

#### Test 4: Google OAuth Login

**Steps**:
1. Log out if logged in
2. Navigate to `/auth/login`
3. Click "Continue with Google"
4. Select same Google account

**Expected Results**:
- ✅ Login successful (no new account created)
- ✅ Redirected to `/app/dashboard`
- ✅ Existing user data loaded

#### Test 5: Facebook OAuth Sign-Up

**Prerequisites**: Facebook test user configured

**Steps**:
1. Navigate to `/auth/signup`
2. Click "Continue with Facebook"
3. Login with Facebook test account
4. Grant permissions

**Expected Results**:
- ✅ Facebook login popup opens
- ✅ Login completes successfully
- ✅ Account created in Firebase
- ✅ Redirected to `/app/dashboard`
- ✅ User data includes Facebook profile info

**Common Issues**:
- App not public: Only test users can log in
- Invalid OAuth redirect URI: Check Facebook app settings
- App domain not verified: Complete Facebook app review

#### Test 6: Password Reset Flow

**Steps**:
1. Navigate to `/auth/login`
2. Click "Forgot your password?"
3. Enter email address
4. Click "Send Reset Link"
5. Check email inbox
6. Click reset link in email
7. Enter new password
8. Submit

**Expected Results**:
- ✅ Reset email sent within 1 minute
- ✅ Email contains valid reset link
- ✅ Reset link opens in browser
- ✅ New password accepted
- ✅ Can log in with new password
- ✅ Cannot reuse reset link (single-use)

#### Test 7: Email Verification

**Steps**:
1. Register new account (Test 1)
2. Check email inbox
3. Click verification link
4. Verify email verified status

**Expected Results**:
- ✅ Verification email received
- ✅ Link opens Firebase action handler
- ✅ Success message displayed
- ✅ `emailVerified` property set to `true` in Firebase
- ✅ Can access email-verification-required features

**Check Verification Status**:
```typescript
const user = auth.currentUser;
console.log('Email verified:', user?.emailVerified);
```

#### Test 8: Session Persistence

**Steps**:
1. Log in successfully
2. Close browser tab
3. Reopen application URL
4. Check if still logged in

**Expected Results**:
- ✅ User remains logged in
- ✅ No need to log in again
- ✅ User data loaded automatically

**Test Logout**:
1. Click logout button
2. Verify redirected to login page
3. Verify cannot access protected routes

#### Test 9: Protected Routes

**Steps**:
1. Log out (ensure not authenticated)
2. Try to access `/app/dashboard` directly
3. Try to access other protected routes

**Expected Results**:
- ✅ Redirected to `/auth/login`
- ✅ After login, redirected back to intended page

#### Test 10: Multiple Browser/Device Testing

**Steps**:
1. Log in on Browser A
2. Log in with same account on Browser B
3. Perform actions on both browsers

**Expected Results**:
- ✅ Can be logged in on multiple devices simultaneously
- ✅ Both sessions remain active
- ✅ Firestore real-time updates sync across devices

#### Test 11: Error Handling

**Test Invalid Email**:
- Email: "notanemail"
- Expected: "Please enter a valid email"

**Test Weak Password**:
- Password: "123"
- Expected: Password requirements not met, button disabled

**Test Password Mismatch**:
- Password: "Test123456!"
- Confirm: "Different123!"
- Expected: "Passwords do not match" error

**Test Existing Email**:
- Register with existing email
- Expected: "Email already in use" error

**Test Wrong Password**:
- Login with wrong password
- Expected: "Wrong email or password" (with email enumeration protection)

**Test Network Error**:
- Disable network
- Try to log in
- Expected: Network error message

#### Test 12: Custom Claims (Admin)

**Steps**:
1. Set admin claim for test user (via script)
2. Log in as that user
3. Check token claims in browser console:
   ```typescript
   const user = auth.currentUser;
   const token = await user?.getIdTokenResult();
   console.log(token?.claims);
   ```

**Expected Results**:
- ✅ `admin: true` in claims
- ✅ Can access admin-only routes
- ✅ Firestore rules allow admin operations

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "auth/operation-not-allowed"

**Cause**: Authentication provider not enabled in Firebase Console

**Solution**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable the specific provider (Email/Password, Google, Facebook)
3. Save changes
4. Try again

#### Issue: "auth/invalid-api-key"

**Cause**: Incorrect Firebase configuration or API key

**Solution**:
1. Verify `.env.local` contains correct Firebase config
2. Check Firebase Console → Project Settings → General
3. Compare API key and other values
4. Restart Next.js development server after changes
5. Ensure environment variables start with `NEXT_PUBLIC_`

#### Issue: "auth/unauthorized-domain"

**Cause**: Current domain not in authorized domains list

**Solution**:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain (e.g., localhost, production domain)
3. For localhost, ensure both "localhost" and "127.0.0.1" are added
4. Save changes

#### Issue: Google OAuth "popup_closed_by_user"

**Cause**: User closed popup before completing authentication

**Solution**:
- Not an error, user action
- Handle gracefully in frontend
- Display "Login cancelled" message
- Consider using redirect flow instead of popup:
  ```typescript
  import { signInWithRedirect, getRedirectResult } from 'firebase/auth';

  // Use redirect instead of popup
  await signInWithRedirect(auth, googleProvider);

  // On return, get result
  const result = await getRedirectResult(auth);
  ```

#### Issue: Facebook OAuth "invalid_oauth_redirect_uri"

**Cause**: OAuth redirect URI mismatch

**Solution**:
1. Copy exact redirect URI from Firebase Console (Facebook provider settings)
2. Go to Facebook Developers Console → App → Facebook Login → Settings
3. Paste URI into "Valid OAuth Redirect URIs"
4. Ensure exact match (including `https://` and path)
5. Save changes
6. Wait a few minutes for Facebook to update

#### Issue: Facebook "app_not_setup"

**Cause**: Facebook app not fully configured or not public

**Solution**:
1. Verify Facebook Login product is added to app
2. Check OAuth settings are saved
3. For testing: Add test users in Facebook app dashboard
4. For production: Submit app for review to make public

#### Issue: Email verification link broken

**Cause**: Action code expired or already used

**Solution**:
- Links expire after 1 hour
- Links are single-use only
- Request new verification email:
  ```typescript
  await sendEmailVerification(auth.currentUser);
  ```

#### Issue: "auth/user-token-expired"

**Cause**: Session token expired

**Solution**:
- Firebase automatically refreshes tokens
- If issues persist, force refresh:
  ```typescript
  await auth.currentUser?.getIdToken(true);
  ```
- Or implement automatic refresh:
  ```typescript
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await user.getIdToken(true); // Force refresh on state change
    }
  });
  ```

#### Issue: "auth/network-request-failed"

**Cause**: Network connectivity issue or Firebase service down

**Solution**:
1. Check internet connection
2. Verify Firebase service status: https://status.firebase.google.com/
3. Check CORS settings if using custom domain
4. Try again after a moment

#### Issue: Firestore permission denied after authentication

**Cause**: Firestore rules require custom claims not yet set

**Solution**:
1. Check Firestore rules in `firestore-enhanced.rules`
2. Verify required claims exist:
   ```typescript
   const token = await auth.currentUser?.getIdTokenResult();
   console.log('Claims:', token?.claims);
   ```
3. If claims missing, set them via Cloud Function or admin script
4. Force token refresh after setting claims

#### Issue: Custom claims not appearing

**Cause**: Token not refreshed after setting claims

**Solution**:
```typescript
// Force token refresh
await auth.currentUser?.getIdToken(true);

// Re-fetch ID token result
const tokenResult = await auth.currentUser?.getIdTokenResult();
console.log('Updated claims:', tokenResult?.claims);
```

#### Issue: "auth/too-many-requests"

**Cause**: Too many authentication attempts from same IP

**Solution**:
- Firebase rate limiting protecting against abuse
- Wait 15-30 minutes before retrying
- For development, try from different network/IP
- In production, this is a feature protecting your app

#### Issue: Sign-in successful but user data not loading

**Cause**: User document not created in Firestore

**Solution**:
1. Check if `createUserDocument` is called after signup
2. Verify Firestore rules allow user document creation
3. Check browser console for errors
4. Manually create user document if needed:
   ```typescript
   const userRef = doc(db, 'users', user.uid);
   await setDoc(userRef, {
     email: user.email,
     displayName: user.displayName,
     createdAt: serverTimestamp(),
   });
   ```

---

## Testing Authentication Setup

### Automated Testing

A comprehensive test script has been created to verify Firebase Authentication:

**Location**: `scripts/test-firebase-auth.js`

**Usage**:
```bash
# Run the test script
node scripts/test-firebase-auth.js
```

**What it tests**:
- Firebase Authentication connection
- Available authentication providers
- Custom token creation
- Firestore user document access
- Security configuration verification

**Setup Requirements**:
1. Download service account key from Firebase Console
2. Save as `scripts/service-account-key.json`
3. Or set `FIREBASE_SERVICE_ACCOUNT_PATH` environment variable

**Download Service Account Key**:
https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk

### Manual Testing Checklist

Use the comprehensive testing procedures in the "Testing Procedures" section above to manually verify:
- Email/Password registration and login
- Google OAuth authentication
- Facebook OAuth authentication
- Password reset flow
- Email verification
- Session persistence
- Protected route access
- Error handling

---

## Security Audit Summary

### Current Security Status

**Strengths**:
- ✅ Firebase SDK properly integrated
- ✅ Environment variables properly externalized
- ✅ Password validation implemented in frontend
- ✅ Firestore security rules implemented
- ✅ User document creation automated
- ✅ Multiple authentication methods supported
- ✅ Session management via Firebase Auth
- ✅ Audit logging implemented in Cloud Functions

**Areas for Improvement**:
- ⚠️ Password policy enforcement (upgrade to 12+ chars)
- ⚠️ Email enumeration protection (enable in Console)
- ⚠️ Multi-factor authentication (implement for admin)
- ⚠️ Rate limiting (enhance in Cloud Functions)
- ⚠️ Email verification requirement (add to signup)
- ⚠️ Token refresh handling (improve error handling)

**Critical Security Recommendations**:
1. Enable email enumeration protection in Firebase Console
2. Enforce stronger password policy (12+ characters)
3. Implement MFA for admin accounts
4. Add email verification requirement before critical operations
5. Implement IP-based rate limiting in Cloud Functions
6. Add security monitoring and alerting
7. Configure Firebase App Check for bot protection
8. Regular security audits and penetration testing

### Code Security Issues

**No critical vulnerabilities found**, but consider these improvements:

1. **Error Message Sanitization**:
   - Current: Returns raw error messages to client
   - Recommendation: Sanitize error messages to avoid information leakage

2. **Token Management**:
   - Current: Tokens handled by Firebase SDK (secure)
   - Recommendation: Implement token refresh logic for long sessions

3. **Session Security**:
   - Current: Firebase default session management
   - Recommendation: Add custom session validation for sensitive operations

---

## Next Steps

After completing this setup:

1. **Test all authentication flows** thoroughly using the test script
2. **Enable authentication providers** in Firebase Console
3. **Configure OAuth credentials** (Google, Facebook)
4. **Set up monitoring** for auth events
5. **Configure email templates** with your branding
6. **Implement admin panel** for user management
7. **Set up compliance tracking** for regulatory requirements
8. **Create user documentation** for authentication flows
9. **Implement backup authentication** methods (SMS, etc.)
10. **Run security audit** and penetration testing

---

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Test Script](../scripts/test-firebase-auth.js)

---

**Document Version**: 2.0
**Last Updated**: 2025-09-30
**Author**: Firebase Configuration Agent
**Project**: C12USD Stablecoin Platform