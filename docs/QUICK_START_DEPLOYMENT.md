# Firebase App Hosting - Quick Start Guide
## Deploy C12USD Frontend in 15 Minutes

**Project**: c12ai-dao-b3bbb
**Last Updated**: 2025-09-30
**Difficulty**: Intermediate

---

## Prerequisites Checklist

Before starting, ensure you have:

- [x] Firebase CLI v14.16.0+ installed
- [x] Access to Firebase Console (project: c12ai-dao-b3bbb)
- [x] GitHub repository access (Instawerx/C12AI-Stable-Coin-USD)
- [ ] WalletConnect account (create at https://cloud.walletconnect.com/)
- [x] Frontend built successfully (already completed)

**Estimated Time**: 15-20 minutes

---

## Step 1: Get WalletConnect Project ID (5 min)

1. Go to: https://cloud.walletconnect.com/
2. Sign up or log in
3. Click **Create New Project**
4. Name: "C12USD Production"
5. Copy the **Project ID**
6. Save it - you'll need it in Step 4

**Your WalletConnect Project ID**: `_______________________________`

---

## Step 2: Access Firebase Console (1 min)

1. Open: https://console.firebase.google.com/project/c12ai-dao-b3bbb
2. Navigate to **App Hosting** in left sidebar
3. Click **Get Started** or **Add Backend**

---

## Step 3: Configure App Hosting Backend (5 min)

### 3.1 Connect GitHub

1. Click **Connect to GitHub**
2. Authorize Firebase
3. Select repository: `Instawerx/C12AI-Stable-Coin-USD`
4. Grant all requested permissions

### 3.2 Backend Configuration

**Backend name**: `c12usd-frontend-user`

**Repository settings**:
- **Branch**: `master`
- **Root directory**: `frontend/user`

**Build settings** (auto-detected, verify):
- **Framework**: Next.js
- **Build command**: `npm run build`
- **Output directory**: `.next`

**Runtime settings**:
- **Region**: `us-central1`
- **Min instances**: 1
- **Max instances**: 10
- **Memory**: 512 MiB
- **CPU**: 1

Click **Next** to continue.

---

## Step 4: Configure Environment Variables (5 min)

### 4.1 Public Environment Variables

In the Environment Variables section, add these:

```bash
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

### 4.2 Secret Variables

#### Secret 1: app-url

1. Click **Add variable**
2. Name: `NEXT_PUBLIC_APP_URL`
3. Select **Reference a secret**
4. Click **Create new secret**
5. Secret name: `app-url`
6. Secret value: `https://c12ai-dao-b3bbb.web.app`
7. Availability: **BUILD**
8. Click **Create**

#### Secret 2: walletconnect-project-id

1. Click **Add variable**
2. Name: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
3. Select **Reference a secret**
4. Click **Create new secret**
5. Secret name: `walletconnect-project-id`
6. Secret value: [Paste your WalletConnect Project ID from Step 1]
7. Availability: **BUILD**
8. Click **Create**

---

## Step 5: Deploy (5-10 min)

1. Click **Create Backend**
2. Firebase will start the deployment:
   - ✓ Cloning repository
   - ✓ Installing dependencies
   - ✓ Building application
   - ✓ Creating Cloud Run service
   - ✓ Configuring CDN
   - ✓ Generating SSL certificate

**Wait time**: 5-10 minutes

**Deployment URL**: Will be shown when complete (e.g., `https://c12usd-frontend-user---c12ai-dao-b3bbb.web.app`)

---

## Step 6: Verify Deployment (5 min)

### Test Checklist

Open your deployment URL and verify:

- [ ] Landing page loads without errors
- [ ] Navigation works
- [ ] Images display correctly
- [ ] Authentication dialog opens
- [ ] No console errors (press F12)

### Test Authentication (if time permits)

- [ ] Email/password signup works
- [ ] Login works
- [ ] Logout works

### Test Wallet Connection (if time permits)

- [ ] MetaMask connection prompt appears
- [ ] Wallet address displays after connection

---

## Step 7: Update Backend CORS (2 min)

Your frontend can now access the backend. Update backend to allow the new domain:

```bash
gcloud run services update c12usd-backend-prod \
  --update-env-vars="ALLOWED_ORIGINS=https://c12ai-dao-b3bbb.web.app,https://c12usd-frontend-user---c12ai-dao-b3bbb.web.app" \
  --region=us-central1 \
  --project=c12ai-dao
```

---

## Automatic Deployments Enabled!

From now on, every push to the `master` branch will automatically deploy:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin master

# Firebase automatically deploys in ~5 minutes
```

---

## Next Steps

### Immediate
- [ ] Test all authentication flows thoroughly
- [ ] Test wallet connections (MetaMask, WalletConnect)
- [ ] Verify API calls work correctly

### Within 24 Hours
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring alerts
- [ ] Run Lighthouse performance audit
- [ ] Test with real users

### Within 1 Week
- [ ] Review analytics and usage
- [ ] Optimize based on real performance data
- [ ] Document any issues encountered

---

## Troubleshooting

### Build Failed?

**Check**:
1. View build logs in Firebase Console
2. Verify all environment variables are set
3. Check GitHub repository access

**Fix**:
```bash
# Test build locally
cd frontend/user
npm install
npm run build

# If successful, retry deployment
```

### Can't Access Application?

**Check**:
1. Deployment status in Firebase Console
2. Cloud Run service is running
3. SSL certificate is active

**Fix**:
- Wait 2-3 minutes for DNS propagation
- Try incognito mode
- Clear browser cache

### Authentication Not Working?

**Check**:
1. Authorized domains in Firebase Console > Authentication > Settings
2. Environment variables are correct
3. Firebase API key is valid

**Fix**:
```bash
# Add deployment URL to authorized domains
firebase auth:domain:add <your-deployment-url> --project c12ai-dao-b3bbb
```

---

## Support

- **Full Documentation**: `docs/FIREBASE_HOSTING_DEPLOYMENT.md`
- **Status Report**: `docs/DEPLOYMENT_STATUS_REPORT.md`
- **Firebase Console**: https://console.firebase.google.com/project/c12ai-dao-b3bbb
- **Email Support**: vrdivebar@gmail.com

---

## Success!

If you've completed all steps and the application is accessible, congratulations! Your C12USD frontend is now live on Firebase App Hosting with automatic CI/CD from GitHub.

**Deployment URL**: https://c12ai-dao-b3bbb.web.app (or your custom domain)

---

**Quick Start Guide v1.0**
**Last Updated**: 2025-09-30
**Total Time**: ~15-20 minutes