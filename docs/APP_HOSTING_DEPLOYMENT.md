# Firebase App Hosting Deployment Guide
## C12USD User Frontend - Next.js 14 Application

**Document Version**: 1.0
**Last Updated**: 2025-09-30
**Project**: c12ai-dao-b3bbb
**GitHub Repository**: https://github.com/Instawerx/C12AI-Stable-Coin-USD
**Branch**: master
**Frontend Directory**: `frontend/user`

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Steps](#deployment-steps)
4. [Custom Domain Configuration](#custom-domain-configuration)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Rollback Procedures](#rollback-procedures)
7. [Monitoring and Validation](#monitoring-and-validation)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Security Considerations](#security-considerations)
10. [Cost Optimization](#cost-optimization)

---

## Prerequisites

### Required Tools and Accounts

- [ ] **Firebase CLI** (version 13.0.0 or later)
  ```bash
  npm install -g firebase-tools
  firebase --version
  ```

- [ ] **Node.js** (version 18.x or 20.x)
  ```bash
  node --version  # Should be v18.x or v20.x
  ```

- [ ] **Firebase Project Access**
  - Project ID: `c12ai-dao-b3bbb`
  - Required roles: Firebase Admin or Editor
  - Login: `firebase login`

- [ ] **GitHub Repository Access**
  - Repository: Instawerx/C12AI-Stable-Coin-USD
  - Branch: master
  - Write access required for GitHub Actions integration

- [ ] **GCP Access** (for backend integration)
  - Project: c12ai-dao (Project #239414215297)
  - Cloud Run service: c12usd-backend-prod

### Pre-Deployment Checklist

- [ ] Firebase web frameworks experiment enabled
  ```bash
  firebase experiments:enable webframeworks
  ```

- [ ] Production build successful locally
  ```bash
  cd frontend/user
  npm run build
  ```

- [ ] All environment variables documented
- [ ] OAuth credentials configured in Firebase Console
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Backend API endpoints verified

---

## Environment Setup

### 1. Firebase Configuration

The `apphosting.yaml` file in `frontend/user/` contains the App Hosting configuration:

**Location**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\frontend\user\apphosting.yaml`

**Configuration Summary**:
```yaml
runConfig:
  minInstances: 1          # Keep 1 instance warm for availability
  maxInstances: 10         # Scale up to 10 instances
  concurrency: 80          # 80 concurrent requests per instance
  cpu: 1                   # 1 vCPU per instance
  memoryMiB: 512          # 512 MB RAM per instance
  timeoutSeconds: 60       # 60 second request timeout
```

### 2. Environment Variables

#### Public Variables (Already in apphosting.yaml)
- `NODE_ENV`: production
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: c12ai-dao-b3bbb
- `NEXT_PUBLIC_FIREBASE_API_KEY`: AIzaSyCS_f1-nt1oE1MLQtNwA48SMkaLn5ERM4c
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: c12ai-dao-b3bbb.firebaseapp.com
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: c12ai-dao-b3bbb.firebasestorage.app
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: 268788831367
- `NEXT_PUBLIC_FIREBASE_APP_ID`: 1:268788831367:web:40c645a16c754dfe3d9422
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: G-5KZ40WHD28
- `NEXT_PUBLIC_API_URL`: https://c12usd-backend-prod-239414215297.us-central1.run.app

#### Secret Variables (Must be configured via Firebase Console)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID
- `NEXT_PUBLIC_APP_URL`: Production App Hosting URL

### 3. WalletConnect Setup

**Required for Web3 wallet connections**:

1. Visit: https://cloud.walletconnect.com/
2. Create a new project
3. Get your Project ID
4. Add to Firebase Console as secret: `walletconnect-project-id`

---

## Deployment Steps

### Method 1: Firebase CLI Deployment (Recommended)

#### Step 1: Initialize App Hosting

```bash
# Navigate to project root
cd C:\Users\tabor\Downloads\C12USD_project\C12USD

# Initialize App Hosting (if not already done)
firebase init apphosting

# When prompted:
# - Select project: c12ai-dao-b3bbb
# - Connect GitHub repository: Instawerx/C12AI-Stable-Coin-USD
# - Branch: master
# - Root directory: frontend/user
# - Framework: Next.js (auto-detected)
```

#### Step 2: Configure Secrets in Firebase Console

1. Go to [Firebase Console > App Hosting](https://console.firebase.google.com/project/c12ai-dao-b3bbb/apphosting)
2. Navigate to your backend configuration
3. Add secrets:
   - Name: `walletconnect-project-id`
   - Value: Your WalletConnect Project ID
   - Name: `app-url`
   - Value: Your production App Hosting URL

#### Step 3: Deploy to App Hosting

```bash
# Deploy everything
firebase deploy --only apphosting

# Or deploy with specific target
firebase deploy --only apphosting:user-app

# Monitor deployment status
firebase apphosting:backends:list
```

#### Step 4: Verify Deployment

```bash
# Get deployment URL
firebase apphosting:backends:get user-app

# View build logs
firebase apphosting:builds:list
firebase apphosting:builds:logs <BUILD_ID>

# Check deployment status
firebase apphosting:deploys:list
```

### Method 2: GitHub Actions (Automatic Deployment)

App Hosting automatically deploys when you push to the master branch.

**Workflow**:
1. Commit changes to master branch
2. Firebase App Hosting detects the commit
3. Cloud Build automatically builds the Next.js app
4. Deploys to Cloud Run via App Hosting
5. Health check and gradual rollout
6. Production live

**Monitor automatic deployments**:
- Firebase Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/apphosting
- GitHub Actions: https://github.com/Instawerx/C12AI-Stable-Coin-USD/actions

---

## Custom Domain Configuration

### Option 1: Firebase Hosting Domain

**Default Domain**: `c12ai-dao-b3bbb.web.app`

### Option 2: Custom Domain Setup

1. **Add Domain in Firebase Console**:
   ```
   Firebase Console > Hosting > Add custom domain
   ```

2. **Recommended Domain**: `app.c12usd.com`

3. **DNS Configuration**:
   ```
   Type: A
   Name: app
   Value: <Firebase Hosting IP>

   Type: A
   Name: app
   Value: <Firebase Hosting IP>
   ```

4. **SSL Certificate**:
   - Automatically provisioned by Firebase
   - Takes 24-48 hours to propagate

5. **Verify Domain**:
   ```bash
   firebase hosting:channel:list
   ```

---

## Environment Variables Configuration

### Via Firebase Console (Recommended for Secrets)

1. Navigate to: https://console.firebase.google.com/project/c12ai-dao-b3bbb/apphosting
2. Select your backend
3. Go to "Configuration" tab
4. Add environment variables:
   - Public variables: Can be added directly
   - Secrets: Use Secret Manager integration

### Via CLI (For Public Variables)

Update `apphosting.yaml` and redeploy:

```yaml
env:
  - variable: NEW_VARIABLE
    value: new_value
```

Then deploy:
```bash
firebase deploy --only apphosting
```

### Secret Manager Integration

For sensitive values:

```bash
# Create secret in Secret Manager
gcloud secrets create walletconnect-project-id \
  --data-file=- \
  --project=c12ai-dao

# Grant access to App Hosting service account
gcloud secrets add-iam-policy-binding walletconnect-project-id \
  --member="serviceAccount:firebase-adminsdk-xxx@c12ai-dao-b3bbb.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=c12ai-dao
```

---

## Rollback Procedures

### Rollback to Previous Version

```bash
# List recent deployments
firebase apphosting:rollouts:list user-app

# Rollback to specific version
firebase apphosting:rollouts:rollback user-app --rollout-id=<ROLLOUT_ID>

# Or rollback to previous version
firebase apphosting:rollouts:rollback user-app
```

### Emergency Rollback (via Console)

1. Go to: https://console.firebase.google.com/project/c12ai-dao-b3bbb/apphosting
2. Select your backend
3. Go to "Rollouts" tab
4. Click on current deployment
5. Select "Rollback to previous version"
6. Confirm rollback

### Rollback Validation

After rollback:

1. Verify application loads correctly
2. Test authentication flows
3. Check API connectivity
4. Monitor error rates in Console
5. Validate Web3 wallet connections

---

## Monitoring and Validation

### Post-Deployment Validation Checklist

#### Functional Testing
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] Email/password login successful
- [ ] Google OAuth login successful
- [ ] Facebook OAuth login successful
- [ ] MetaMask wallet connection works
- [ ] WalletConnect integration functional
- [ ] Transaction history displays
- [ ] Real-time balance updates working
- [ ] DAO governance interface accessible

#### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Time to First Byte (TTFB) < 600ms
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Total Blocking Time (TBT) < 200ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

#### Security Validation
- [ ] HTTPS enforced (all HTTP redirects to HTTPS)
- [ ] CSP headers configured correctly
- [ ] No API keys exposed in client code
- [ ] Firebase App Check working (if enabled)
- [ ] Firestore rules preventing unauthorized access
- [ ] CORS working for API endpoints

### Monitoring Tools

#### Firebase Console Metrics

**App Hosting Performance**:
```
Firebase Console > App Hosting > user-app > Metrics
```
- Request count
- Response time (p50, p95, p99)
- Error rate
- Instance count
- Memory usage
- CPU usage

**Authentication Metrics**:
```
Firebase Console > Authentication > Usage
```
- Daily active users
- Sign-in success rate
- Provider usage breakdown
- Failed login attempts

**Firestore Metrics**:
```
Firebase Console > Firestore > Usage
```
- Read/write operations
- Storage usage
- Query performance
- Error rates

#### Cloud Monitoring (Google Cloud Console)

```
https://console.cloud.google.com/monitoring?project=c12ai-dao
```

**Key Metrics to Monitor**:
- Cloud Run request latency
- Cloud Run request count
- Cloud Run error rate
- Cloud SQL connections
- Cloud SQL query performance

### Alerts Configuration

Set up alerts for:

1. **High Error Rate**:
   - Threshold: > 5% error rate
   - Duration: 5 minutes
   - Action: Send email to team

2. **Slow Response Time**:
   - Threshold: p95 > 3 seconds
   - Duration: 5 minutes
   - Action: Send email + Slack notification

3. **Authentication Failures**:
   - Threshold: > 100 failures in 1 hour
   - Action: Send email to security team

4. **Firestore Quota Exceeded**:
   - Threshold: 90% of daily quota
   - Action: Send email + increase quota

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: Build Failures

**Symptoms**:
- Build fails during deployment
- Error: "Module not found"
- Error: "TypeScript compilation failed"

**Solutions**:

1. Check build logs:
   ```bash
   firebase apphosting:builds:logs <BUILD_ID>
   ```

2. Test build locally:
   ```bash
   cd frontend/user
   npm run build
   ```

3. Common fixes:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install

   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

4. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```

#### Issue 2: Environment Variables Not Loading

**Symptoms**:
- Application loads but features don't work
- Firebase connection errors
- API endpoint errors

**Solutions**:

1. Verify environment variables in Console:
   ```
   Firebase Console > App Hosting > Configuration
   ```

2. Check if secrets are properly configured:
   ```bash
   gcloud secrets list --project=c12ai-dao
   ```

3. Verify variable names match exactly (including NEXT_PUBLIC_ prefix)

4. Check `apphosting.yaml` syntax:
   ```yaml
   env:
     - variable: NAME
       value: value  # Correct
     # NOT:
     - NAME: value   # Incorrect
   ```

#### Issue 3: Authentication Errors

**Symptoms**:
- "Firebase: Error (auth/unauthorized-domain)"
- OAuth login fails
- Redirect errors

**Solutions**:

1. Add domain to authorized domains:
   ```
   Firebase Console > Authentication > Settings > Authorized domains
   ```
   Add:
   - `c12ai-dao-b3bbb.web.app`
   - `c12ai-dao-b3bbb.firebaseapp.com`
   - Custom domain (e.g., `app.c12usd.com`)

2. Verify OAuth credentials:
   ```
   Firebase Console > Authentication > Sign-in method
   ```
   - Google: Check OAuth client ID
   - Facebook: Verify App ID and Secret

3. Check redirect URIs in OAuth provider console

#### Issue 4: CORS Errors

**Symptoms**:
- "Access-Control-Allow-Origin" errors
- API requests fail from frontend
- Network errors in browser console

**Solutions**:

1. Update backend CORS configuration:
   ```javascript
   const allowedOrigins = [
     'https://c12ai-dao-b3bbb.web.app',
     'https://c12ai-dao-b3bbb.firebaseapp.com',
     'https://app.c12usd.com',
   ];
   ```

2. Update Cloud Run service:
   ```bash
   gcloud run services update c12usd-backend-prod \
     --update-env-vars="FRONTEND_URL=https://c12ai-dao-b3bbb.web.app" \
     --region=us-central1 \
     --project=c12ai-dao
   ```

3. Verify API endpoint URL in environment variables

#### Issue 5: Slow Performance

**Symptoms**:
- Pages load slowly
- High TTFB
- Poor Lighthouse scores

**Solutions**:

1. Enable caching in `next.config.js`:
   ```javascript
   async headers() {
     return [
       {
         source: '/_next/static/:path*',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=31536000, immutable',
           },
         ],
       },
     ];
   }
   ```

2. Optimize images:
   - Use Next.js `<Image />` component
   - Convert to WebP format
   - Implement lazy loading

3. Increase instance resources in `apphosting.yaml`:
   ```yaml
   runConfig:
     cpu: 2
     memoryMiB: 1024
   ```

4. Enable CDN caching in Firebase Hosting

#### Issue 6: Deployment Stuck

**Symptoms**:
- Deployment running for > 10 minutes
- No progress in build logs
- "Waiting for deployment" status

**Solutions**:

1. Cancel and retry:
   ```bash
   firebase apphosting:rollouts:cancel user-app
   firebase deploy --only apphosting
   ```

2. Check Cloud Build status:
   ```
   https://console.cloud.google.com/cloud-build/builds?project=c12ai-dao
   ```

3. Verify GitHub connection:
   ```
   Firebase Console > App Hosting > GitHub connection
   ```

4. Check for build timeouts in `apphosting.yaml`:
   ```yaml
   runConfig:
     timeoutSeconds: 120  # Increase if needed
   ```

#### Issue 7: Firestore Permission Denied

**Symptoms**:
- "Missing or insufficient permissions"
- Data not loading
- Write operations fail

**Solutions**:

1. Verify user is authenticated:
   ```javascript
   const user = auth.currentUser;
   console.log('User:', user);
   ```

2. Check Firestore security rules:
   ```bash
   firebase firestore:rules:get
   ```

3. Test rules in Firebase Console:
   ```
   Firebase Console > Firestore > Rules > Playground
   ```

4. Common rule fixes:
   ```javascript
   // Allow read for authenticated users
   match /users/{userId} {
     allow read: if request.auth != null;
     allow write: if request.auth.uid == userId;
   }
   ```

---

## Security Considerations

### 1. Environment Variable Security

- **Never commit** `.env.local` or `.env.production` to Git
- Use Secret Manager for sensitive values
- Rotate API keys quarterly
- Use different keys for dev/staging/prod

### 2. Firebase App Check

Enable App Check for production:

```bash
# Install App Check
npm install firebase/app-check

# Enable in Firebase Console
# Firebase Console > App Check > Register app
```

**Implementation** (in `src/lib/firebase.ts`):
```javascript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true,
});
```

### 3. Content Security Policy

Already configured in `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ];
}
```

### 4. Firestore Security Rules

Review and test rules regularly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Transactions linked to wallet addresses
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Admin-only access
    match /kyc/{document=**} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

### 5. API Security

- Enable Cloud Armor for DDoS protection
- Implement rate limiting
- Use JWT tokens for authentication
- Validate all inputs on backend
- Enable Cloud Audit Logs

---

## Cost Optimization

### Current Estimated Costs

**Firebase Services** (per month):
- App Hosting: ~$0 (Spark plan) - $50 (Blaze plan with traffic)
- Authentication: $0 (up to 10K MAU)
- Firestore: ~$10 (1M reads, 100K writes)
- Storage: ~$1 (5GB storage, 10GB bandwidth)
- Cloud Functions: ~$5 (1M invocations)

**Total Firebase**: ~$16-66/month

**GCP Services** (per month):
- Cloud Run: ~$50
- Cloud SQL: ~$25
- Cloud Build: ~$10
- Artifact Registry: ~$1

**Total GCP**: ~$86/month

**Grand Total**: ~$102-152/month

### Cost Reduction Strategies

1. **App Hosting Optimization**:
   ```yaml
   runConfig:
     minInstances: 0  # Use 0 for non-critical apps
     maxInstances: 5  # Reduce max instances
     cpu: 0.5         # Use fractional CPU if supported
   ```

2. **Firestore Optimization**:
   - Implement client-side caching (5 min)
   - Use batch operations
   - Add composite indexes for complex queries
   - Enable offline persistence

3. **CDN Caching**:
   - Cache static assets for 24 hours
   - Cache API responses where appropriate
   - Use Firebase Hosting CDN

4. **Image Optimization**:
   - Serve WebP images
   - Implement lazy loading
   - Use responsive images
   - Compress images before upload

5. **Monitoring and Alerts**:
   - Set budget alerts at $100/month
   - Monitor quota usage
   - Review Cloud Build usage
   - Optimize build times

---

## Additional Resources

### Documentation
- [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/app-hosting/frameworks/nextjs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security)

### Support
- Firebase Discord: https://discord.gg/firebase
- Stack Overflow: Tag `firebase` + `next.js`
- GitHub Issues: https://github.com/Instawerx/C12AI-Stable-Coin-USD/issues

### Contact
- **Project Owner**: C12AI DAO Development Team
- **Email**: vrdivebar@gmail.com
- **Repository**: https://github.com/Instawerx/C12AI-Stable-Coin-USD

---

## Deployment Timeline

### Estimated Time to Complete

| Task | Duration | Dependencies |
|------|----------|--------------|
| Prerequisites Setup | 30 min | Firebase CLI, Node.js |
| Environment Variables | 15 min | Firebase Console access |
| OAuth Configuration | 30 min | Google/Facebook developer accounts |
| Initial Deployment | 15 min | Prerequisites complete |
| Custom Domain Setup | 24-48 hrs | DNS propagation |
| Testing & Validation | 2 hrs | Deployment complete |
| Production Release | 1 hr | All testing passed |

**Total**: ~4-5 hours (excluding DNS propagation)

---

## Next Steps After Deployment

1. **Enable Monitoring**:
   - Set up Cloud Monitoring dashboards
   - Configure alerts for critical metrics
   - Enable Firebase Performance Monitoring

2. **Security Hardening**:
   - Enable Firebase App Check
   - Configure reCAPTCHA Enterprise
   - Review and test Firestore rules
   - Implement rate limiting

3. **Performance Optimization**:
   - Run Lighthouse audits
   - Optimize images and assets
   - Implement advanced caching
   - Enable CDN

4. **User Onboarding**:
   - Document user flows
   - Create help documentation
   - Set up customer support channels
   - Prepare launch communications

5. **Post-Launch Monitoring**:
   - Monitor error rates daily
   - Review user feedback
   - Track performance metrics
   - Plan iterative improvements

---

**Document Status**: ✅ Ready for Deployment
**Prepared By**: Firebase App Hosting Deployment Agent
**Date**: 2025-09-30
**Version**: 1.0