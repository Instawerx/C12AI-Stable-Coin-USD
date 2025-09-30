# Firebase App Hosting Deployment Guide
## C12USD User Frontend - Production Deployment

**Project**: c12ai-dao-b3bbb
**Framework**: Next.js 14 with App Router
**Last Updated**: 2025-09-30
**Status**: Ready for Deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Status](#pre-deployment-status)
3. [Deployment Methods](#deployment-methods)
4. [Manual App Hosting Setup](#manual-app-hosting-setup)
5. [Environment Configuration](#environment-configuration)
6. [Deployment Commands](#deployment-commands)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

Firebase App Hosting provides a fully managed hosting solution for Next.js applications with automatic CI/CD integration from GitHub. This guide covers deploying the C12USD user frontend to production.

### Architecture

```
GitHub Repository (master branch)
    ↓
Firebase App Hosting (detects commits)
    ↓
Cloud Build (builds Next.js app)
    ↓
Cloud Run (serves application)
    ↓
Global CDN (caches static assets)
    ↓
Users
```

### Key Features
- Automatic deployments from GitHub
- Native Next.js 14 App Router support
- Serverless auto-scaling
- Global CDN distribution
- Built-in SSL/TLS certificates
- Integration with Cloud Run backend

---

## Pre-Deployment Status

### ✅ Completed Tasks

1. **Firebase CLI**: v14.16.0 installed and configured
2. **Firebase Project**: c12ai-dao-b3bbb (Project #268788831367) active
3. **Frontend Build**: Successful production build completed
   - Build output: `frontend/user/.next`
   - All pages generated successfully
   - Static pages: 12 routes
   - No critical errors
4. **Configuration Files**:
   - `firebase.json`: Updated with optimized hosting config
   - `apphosting.yaml`: Configured with runtime settings
   - `.env.production`: Production environment variables set
   - `next.config.js`: Production-optimized
5. **Backend Integration**: Cloud Run backend URL configured
   - API URL: https://c12usd-backend-prod-239414215297.us-central1.run.app

### ⚠️ Pending Items

1. **WalletConnect Project ID**: Currently placeholder in .env.production
   - Required for Web3 wallet connections
   - Get from: https://cloud.walletconnect.com/
2. **App Hosting Backend Creation**: Needs manual setup via Firebase Console
3. **GitHub Repository Connection**: Needs authorization in Firebase Console
4. **Secrets Configuration**: App URL and WalletConnect ID need to be set as secrets
5. **Custom Domain**: Optional, can be configured post-deployment

---

## Deployment Methods

### Method 1: Firebase App Hosting (Recommended)

Firebase App Hosting provides automatic CI/CD from GitHub with zero-configuration Next.js support.

**Advantages**:
- Automatic deployments on git push
- Native Next.js optimization
- Built-in preview channels
- Integrated monitoring
- No Docker configuration needed

**Use when**:
- Setting up production deployment
- Need automatic CI/CD
- Want managed infrastructure

### Method 2: Firebase Hosting (Traditional)

Traditional Firebase Hosting with manual deployments.

**Advantages**:
- Manual control over deployments
- Simpler setup
- Good for static sites

**Use when**:
- Need manual deployment control
- Testing before going live
- Temporary deployments

---

## Manual App Hosting Setup

Firebase App Hosting requires manual setup through the Firebase Console because it involves GitHub OAuth integration and backend provisioning.

### Step 1: Access Firebase Console

1. Go to: https://console.firebase.google.com/project/c12ai-dao-b3bbb
2. Navigate to **App Hosting** in the left sidebar
3. Click **Get Started** (if first time) or **Add Backend**

### Step 2: Connect GitHub Repository

1. Click **Connect to GitHub**
2. Authorize Firebase to access your GitHub account
3. Select repository: `Instawerx/C12AI-Stable-Coin-USD`
4. Grant permissions:
   - Read repository contents
   - Write commit statuses
   - Access webhooks

### Step 3: Configure Backend

**Backend Name**: `c12usd-frontend-user`

**Build Settings**:
- **Branch**: `master`
- **Root directory**: `frontend/user`
- **Framework**: Next.js (auto-detected)
- **Build command**: `npm run build` (auto-detected)
- **Output directory**: `.next` (auto-detected)
- **Install command**: `npm install` (auto-detected)
- **Node version**: 20 (auto-detected from package.json)

**Runtime Settings** (from apphosting.yaml):
- **Min instances**: 1
- **Max instances**: 10
- **Memory**: 512 MiB
- **CPU**: 1 vCPU
- **Timeout**: 60 seconds
- **Concurrency**: 80 requests/instance

### Step 4: Configure Environment Variables

In the Firebase Console > App Hosting > Environment Variables:

#### Public Variables (Available at runtime)
```
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=c12ai-dao-b3bbb
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCS_f1-nt1oE1MLQtNwA48SMkaLn5ERM4c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=c12ai-dao-b3bbb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=c12ai-dao-b3bbb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=268788831367
NEXT_PUBLIC_FIREBASE_APP_ID=1:268788831367:web:40c645a16c754dfe3d9422
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5KZ40WHD28
NEXT_PUBLIC_API_URL=https://c12usd-backend-prod-239414215297.us-central1.run.app
```

#### Secrets (Configured via Secret Manager)

**Secret 1: app-url**
```
Name: app-url
Value: https://c12ai-dao-b3bbb.web.app
Availability: BUILD
```

**Secret 2: walletconnect-project-id**
```
Name: walletconnect-project-id
Value: [YOUR_WALLETCONNECT_PROJECT_ID]
Availability: BUILD
```

**How to Create Secrets**:
1. In App Hosting backend settings, click **Add Secret**
2. Click **Create New Secret**
3. Enter secret name (e.g., `app-url`)
4. Enter secret value
5. Select **Grant access** to App Hosting service account
6. Click **Create**
7. In environment variable configuration, reference: `secret:app-url`

### Step 5: Initial Deployment

1. Click **Deploy**
2. Firebase will:
   - Clone the repository
   - Install dependencies
   - Run the build
   - Deploy to Cloud Run
   - Configure CDN
3. Monitor deployment progress in the console
4. First deployment typically takes 5-10 minutes

---

## Environment Configuration

### Required Environment Variables

All environment variables are configured in `apphosting.yaml` and should match `.env.production`:

| Variable | Type | Purpose | Value |
|----------|------|---------|-------|
| `NODE_ENV` | Public | Environment | `production` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | Firebase Config | `c12ai-dao-b3bbb` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | Firebase Config | From Console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Firebase Auth | `c12ai-dao-b3bbb.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | Firebase Storage | `c12ai-dao-b3bbb.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public | Firebase Messaging | `268788831367` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public | Firebase App | `1:268788831367:web:40c645a16c754dfe3d9422` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Public | Analytics | `G-5KZ40WHD28` |
| `NEXT_PUBLIC_API_URL` | Public | Backend API | Cloud Run URL |
| `NEXT_PUBLIC_APP_URL` | Secret | Frontend URL | App Hosting URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Secret | Web3 Wallets | From WalletConnect |

### Getting WalletConnect Project ID

1. Go to: https://cloud.walletconnect.com/
2. Sign up or log in
3. Create a new project
4. Copy the Project ID
5. Add to Secret Manager as `walletconnect-project-id`

---

## Deployment Commands

### Option A: Automatic Deployment (Recommended)

Once App Hosting is configured, deployments happen automatically:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin master

# Firebase App Hosting detects the push and deploys automatically
# Monitor deployment in Firebase Console
```

### Option B: Manual Deployment (Traditional Hosting)

For manual deployments using Firebase Hosting:

```bash
# Navigate to frontend directory
cd frontend/user

# Build for production
npm run build

# Deploy to Firebase Hosting
cd ../..
firebase deploy --only hosting:user-app --project c12ai-dao-b3bbb

# Or deploy everything
firebase deploy --project c12ai-dao-b3bbb
```

### Option C: Deploy with Preview Channel

Test deployments before going live:

```bash
# Create preview channel
firebase hosting:channel:deploy preview --project c12ai-dao-b3bbb

# Preview URL will be provided (e.g., c12ai-dao-b3bbb--preview-abc123.web.app)
```

### Deployment Checklist

Before deploying, verify:

```bash
# 1. Check Firebase CLI is logged in
firebase login:list

# 2. Verify correct project is selected
firebase use c12ai-dao-b3bbb

# 3. Run build locally to check for errors
cd frontend/user && npm run build

# 4. Run linting
npm run lint

# 5. Type check
npm run type-check

# 6. Check environment variables
cat .env.production

# 7. Verify firebase.json is correct
cd ../.. && cat firebase.json

# 8. Check apphosting.yaml
cat frontend/user/apphosting.yaml
```

---

## Post-Deployment Verification

### Functional Testing

Test all critical user flows:

#### 1. Landing Page
```
URL: https://c12ai-dao-b3bbb.web.app
✓ Page loads without errors
✓ Images and assets load correctly
✓ Navigation works
✓ CTAs (Call-to-actions) functional
```

#### 2. Authentication
```
✓ Email/password signup
✓ Email/password login
✓ Google OAuth login
✓ Facebook OAuth login
✓ Logout functionality
✓ Password reset flow
```

#### 3. Web3 Wallet Connection
```
✓ MetaMask connection
✓ WalletConnect integration
✓ Wallet address display
✓ Network switching
✓ Disconnect wallet
```

#### 4. User Dashboard
```
✓ Balance display
✓ Transaction history
✓ Real-time updates
✓ Navigation to other pages
```

#### 5. API Integration
```
✓ Backend API calls successful
✓ Data fetching works
✓ Error handling displays correctly
✓ Loading states work
```

### Performance Testing

Run Lighthouse audit:

```bash
# Install Lighthouse CLI (if not installed)
npm install -g lighthouse

# Run audit
lighthouse https://c12ai-dao-b3bbb.web.app --view

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

**Key Metrics to Monitor**:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Security Verification

Check security headers:

```bash
# Test security headers
curl -I https://c12ai-dao-b3bbb.web.app

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# Referrer-Policy: strict-origin-when-cross-origin
```

### Firebase Services Check

```bash
# Check Firebase Authentication
firebase auth:export users.json --project c12ai-dao-b3bbb

# Check Firestore
firebase firestore:indexes --project c12ai-dao-b3bbb

# Check Hosting status
firebase hosting:sites:list --project c12ai-dao-b3bbb
```

---

## Rollback Procedures

### Option 1: Rollback via Firebase Console (App Hosting)

1. Go to Firebase Console > App Hosting
2. Select your backend: `c12usd-frontend-user`
3. Click **Deployments** tab
4. Find the previous working deployment
5. Click **...** menu > **Rollback**
6. Confirm rollback
7. Deployment reverts in ~2-3 minutes

### Option 2: Rollback via Git (App Hosting)

```bash
# Find the last working commit
git log --oneline

# Create rollback commit
git revert <bad-commit-hash>

# Push to trigger new deployment
git push origin master

# Or reset to previous commit (use with caution)
git reset --hard <last-good-commit>
git push -f origin master
```

### Option 3: Rollback Traditional Hosting

```bash
# List previous deployments
firebase hosting:clone --project c12ai-dao-b3bbb

# Deploy previous version
firebase hosting:rollback --project c12ai-dao-b3bbb
```

### Emergency Procedures

If the application is completely broken:

```bash
# 1. Immediately disable the site
firebase hosting:disable --project c12ai-dao-b3bbb

# 2. Fix the issue locally
cd frontend/user
npm run build

# 3. Test thoroughly
npm start

# 4. Redeploy
firebase deploy --only hosting:user-app --project c12ai-dao-b3bbb

# 5. Re-enable
firebase hosting:enable --project c12ai-dao-b3bbb
```

---

## Troubleshooting

### Build Failures

**Symptom**: Build fails during deployment

**Solutions**:

```bash
# 1. Check build logs in Firebase Console
# App Hosting > Deployments > Failed Build > View Logs

# 2. Reproduce locally
cd frontend/user
rm -rf .next node_modules
npm install
npm run build

# 3. Check for common issues:
# - Missing dependencies
# - TypeScript errors
# - Environment variables not set
# - Import errors

# 4. Fix and redeploy
git add .
git commit -m "Fix build errors"
git push origin master
```

### Authentication Errors

**Symptom**: Users cannot log in

**Check**:
1. Firebase Console > Authentication > Settings > Authorized domains
2. Ensure your App Hosting URL is listed
3. Check OAuth provider configuration
4. Verify API keys in environment variables

**Fix**:
```bash
# Add authorized domain via CLI
firebase auth:domain:add <your-app-hosting-url> --project c12ai-dao-b3bbb
```

### API Connection Errors

**Symptom**: Frontend cannot reach backend

**Check**:
1. Backend Cloud Run service is running
2. CORS headers allow App Hosting domain
3. API URL in environment variables is correct

**Fix**:
```bash
# Update backend CORS
gcloud run services update c12usd-backend-prod \
  --update-env-vars="ALLOWED_ORIGINS=https://c12ai-dao-b3bbb.web.app,https://c12ai-dao-b3bbb.firebaseapp.com" \
  --region=us-central1 \
  --project=c12ai-dao
```

### Performance Issues

**Symptom**: Slow page loads

**Check**:
1. Lighthouse performance score
2. Large bundle sizes
3. Unoptimized images
4. Missing caching headers

**Fix**:
```javascript
// next.config.js - Enable compression and optimization
const nextConfig = {
  compress: true,
  swcMinify: true,
  images: {
    domains: ['your-domains'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Secret Manager Issues

**Symptom**: Environment variables not available

**Check**:
```bash
# List secrets
gcloud secrets list --project=c12ai-dao-b3bbb

# Check secret permissions
gcloud secrets get-iam-policy app-url --project=c12ai-dao-b3bbb

# Grant access to App Hosting service account
gcloud secrets add-iam-policy-binding app-url \
  --member="serviceAccount:firebase-app-hosting@c12ai-dao-b3bbb.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=c12ai-dao-b3bbb
```

---

## Monitoring & Maintenance

### Firebase Console Monitoring

Monitor key metrics:

1. **App Hosting Dashboard**
   - Request count
   - Response times (p50, p95, p99)
   - Error rates
   - Build success rate

2. **Authentication Metrics**
   - Daily Active Users (DAU)
   - Monthly Active Users (MAU)
   - Sign-in success rate
   - Provider usage breakdown

3. **Firestore Usage**
   - Document reads/writes
   - Storage usage
   - Query performance
   - Cost tracking

### Set Up Alerts

Configure alerts for critical issues:

```bash
# Via Firebase Console:
# 1. Go to Alerts > Create Alert
# 2. Configure conditions:

# Alert 1: High Error Rate
# Condition: Error rate > 5% for 5 minutes
# Actions: Email to dev team

# Alert 2: Slow Response Time
# Condition: p95 latency > 3s for 10 minutes
# Actions: Email + Slack notification

# Alert 3: Build Failures
# Condition: Build fails 2 times consecutively
# Actions: Email to dev team
```

### Log Analysis

```bash
# View App Hosting logs
firebase apphosting:logs --project c12ai-dao-b3bbb

# Filter for errors
firebase apphosting:logs --level error --project c12ai-dao-b3bbb

# Follow logs in real-time
firebase apphosting:logs --follow --project c12ai-dao-b3bbb
```

### Regular Maintenance Tasks

**Weekly**:
- Review error logs
- Check performance metrics
- Monitor costs
- Review security alerts

**Monthly**:
- Update dependencies
- Review and optimize bundle size
- Audit security headers
- Check for unused resources

**Quarterly**:
- Rotate API keys and secrets
- Review access permissions
- Performance audit with Lighthouse
- Security audit
- Update documentation

### Cost Optimization

Monitor and optimize costs:

```bash
# Check current usage
firebase hosting:usage --project c12ai-dao-b3bbb

# Firestore usage
firebase firestore:usage --project c12ai-dao-b3bbb

# Optimize:
# 1. Enable caching for static assets
# 2. Implement pagination for large lists
# 3. Use client-side caching (React Query)
# 4. Compress images
# 5. Minimize Firestore reads with batching
```

---

## Additional Resources

### Documentation
- [Firebase App Hosting Guide](https://firebase.google.com/docs/app-hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/app-hosting/frameworks/nextjs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

### Support Channels
- Firebase Support: https://firebase.google.com/support
- Firebase Discord: https://discord.gg/firebase
- Stack Overflow: Tag `firebase` + `next.js`
- GitHub Issues: https://github.com/Instawerx/C12AI-Stable-Coin-USD/issues

### Useful Commands Reference

```bash
# Firebase CLI
firebase login                          # Log in to Firebase
firebase projects:list                  # List all projects
firebase use <project-id>              # Switch project
firebase deploy                         # Deploy all services
firebase deploy --only hosting         # Deploy only hosting
firebase deploy --only functions       # Deploy only functions

# App Hosting
firebase apphosting:backends:list      # List backends
firebase apphosting:builds:list        # List builds
firebase apphosting:logs               # View logs
firebase apphosting:rollback           # Rollback deployment

# Hosting
firebase hosting:sites:list            # List hosting sites
firebase hosting:channel:deploy        # Deploy preview channel
firebase hosting:disable               # Disable site

# Debugging
firebase serve                          # Run locally
firebase emulators:start               # Start emulators
firebase debug                          # Debug mode
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Firebase CLI installed and updated (v14.16.0+)
- [ ] Logged into correct Firebase account
- [ ] Project set to `c12ai-dao-b3bbb`
- [ ] Production build successful locally
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] WalletConnect Project ID obtained
- [ ] Secrets created in Secret Manager
- [ ] firebase.json updated
- [ ] apphosting.yaml configured

### Initial Setup
- [ ] Firebase App Hosting backend created
- [ ] GitHub repository connected
- [ ] OAuth permissions granted
- [ ] Build configuration verified
- [ ] Runtime settings configured
- [ ] Environment variables set in console
- [ ] Secrets configured and accessible

### Deployment
- [ ] Code pushed to master branch
- [ ] Build triggered automatically
- [ ] Build completed successfully
- [ ] Deployment successful
- [ ] Application accessible via URL
- [ ] Custom domain configured (optional)

### Post-Deployment
- [ ] Landing page loads correctly
- [ ] Authentication flows work
- [ ] Web3 wallet connection works
- [ ] API calls to backend successful
- [ ] All pages render correctly
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] SSL/TLS certificate active
- [ ] Monitoring alerts configured

### Documentation
- [ ] Deployment documented
- [ ] Known issues logged
- [ ] Rollback procedures tested
- [ ] Team notified
- [ ] User documentation updated

---

**Last Updated**: 2025-09-30
**Next Review**: After first production deployment
**Maintained by**: C12AI DAO Development Team
**Contact**: vrdivebar@gmail.com