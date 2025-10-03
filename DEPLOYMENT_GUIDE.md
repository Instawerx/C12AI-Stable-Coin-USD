# C12USD Production Deployment Guide

This guide provides step-by-step instructions for deploying the C12USD stablecoin to production on Google Cloud Platform with smart contracts on BSC and Polygon mainnet.

---

# 🚀 MANUAL PAYMENT SYSTEM - QUICK DEPLOYMENT

**Status:** Ready for deployment (Phase 1.3 Complete)
**Priority:** HIGH - Enables immediate revenue generation
**Estimated Time:** 30 minutes

This section covers deploying the Manual Payment System (Cash App + Stablecoin purchases) that was just built.

## Prerequisites for Manual Payment System

- [x] Database schema created (Phase 1.1 ✅)
- [x] Firebase Functions built (Phase 1.2 ✅)
- [x] Frontend components built (Phase 1.3 ✅)
- [ ] QR code image added to `frontend/user/public/assets/qr/cashapp-payment-qr.png`
- [ ] Admin user accounts have FINANCE_ADMIN or SUPER_ADMIN role

## Step 1: Database Migration (5 minutes)

```bash
cd C12USD

# Generate Prisma client
npx prisma generate

# Run the migration
npx prisma migrate dev --name add_manual_payment_system

# Seed pricing configuration
npm run seed

# Verify migration
npx prisma studio
# Check: manual_payments table exists with 25 columns
# Check: system_config has 8 pricing entries
```

**Verification:**
- ✅ `manual_payments` table exists
- ✅ 4 new enums created (ManualPaymentTokenType, ManualPaymentMethod, StablecoinType, ManualPaymentStatus)
- ✅ User model has `manualPayments` relation
- ✅ Pricing config: C12USD=$1.00, C12DAO=$3.30

## Step 2: Deploy Firebase Functions (10 minutes)

```bash
# Navigate to functions directory
cd functions

# Install dependencies (if not already done)
npm install

# Build TypeScript
npm run build

# Deploy only manual payment functions
firebase deploy --only functions:manualPayments

# Or deploy all functions
firebase deploy --only functions
```

**Deployed Endpoints:**
- ✅ `manualPayments.createManualPayment` - Creates payment request
- ✅ `manualPayments.submitPaymentProof` - Submits screenshot/TX hash
- ✅ `manualPayments.verifyManualPayment` - Admin approve/reject
- ✅ `manualPayments.getManualPayment` - Get payment status

**Testing Functions:**
```bash
# Test createManualPayment
firebase functions:shell
> manualPayments.createManualPayment({
    tokenType: 'C12USD',
    requestedAmount: 100,
    paymentMethod: 'CASH_APP',
    deliveryChain: 'BSC'
  }, { auth: { uid: 'test-user-id' } })
```

## Step 3: Add QR Code Image (2 minutes)

**REQUIRED:** User must add Cash App QR code image.

1. Get your Cash App QR code using one of these methods:
   - **Method 1:** Open Cash App → Profile → Share $Cashtag → Save QR code
   - **Method 2:** Generate at https://www.qr-code-generator.com/ using `https://cash.app/$C12Ai`
   - **Method 3:** Cash App web at https://cash.app/account

2. Save image as:
   ```
   frontend/user/public/assets/qr/cashapp-payment-qr.png
   ```

3. **Image specs:**
   - Format: PNG
   - Recommended size: 512x512 pixels
   - Transparent or white background

**Note:** If you skip this step, users will see a placeholder but can still use the Cash App link.

## Step 4: Integrate Modal into Dashboard (5 minutes)

Add the BuyTokensModal to your user dashboard:

```typescript
// frontend/user/src/app/dashboard/page.tsx (or wherever your dashboard is)

import { BuyTokensModal } from '@/components/BuyTokensModal';
import { useState } from 'react';

export default function Dashboard() {
  const [showBuyModal, setShowBuyModal] = useState(false);

  return (
    <div>
      {/* Existing dashboard content */}

      <GlassButton onClick={() => setShowBuyModal(true)}>
        Buy Tokens
      </GlassButton>

      <BuyTokensModal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        userAddress={user?.walletAddress}
      />
    </div>
  );
}
```

## Step 5: Frontend Deployment (5 minutes)

```bash
cd frontend/user

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Test locally first
npm run dev
# Open http://localhost:3000 and test the Buy Tokens flow

# Deploy to Firebase Hosting (or your hosting provider)
firebase deploy --only hosting
```

## Step 6: Set Admin Roles (3 minutes)

Grant admin permissions to finance team members:

```bash
# Using Prisma Studio
npx prisma studio

# Or using SQL
psql $DATABASE_URL

# Grant FINANCE_ADMIN role
UPDATE admin_users
SET admin_roles = admin_roles || '["FINANCE_ADMIN"]'::jsonb
WHERE email = 'finance@c12ai.com';

# Grant SUPER_ADMIN role (full access)
UPDATE admin_users
SET admin_roles = admin_roles || '["SUPER_ADMIN"]'::jsonb
WHERE email = 'admin@c12ai.com';
```

## Step 7: End-to-End Testing (5 minutes)

### User Flow Test:
1. ✅ Open dashboard and click "Buy Tokens"
2. ✅ Select C12USD, enter $100, choose BSC chain
3. ✅ Select Cash App payment method
4. ✅ Verify instructions show $C12Ai and payment amount
5. ✅ Upload screenshot, enter cashtag, submit
6. ✅ Verify success screen with reference ID

### Admin Flow Test (requires Phase 1.5 admin dashboard):
1. ✅ Admin logs in and sees pending payment
2. ✅ Admin reviews screenshot and payment details
3. ✅ Admin approves payment
4. ✅ Verify tokens distributed to user's wallet
5. ✅ User receives notification

### Stablecoin Flow Test:
1. ✅ Select stablecoin payment method
2. ✅ Choose USDT on BSC network
3. ✅ Send USDT to admin wallet
4. ✅ Submit TX hash and sender address
5. ✅ Verify payment tracked correctly

## Step 8: Monitoring Setup (5 minutes)

```bash
# Enable Firebase logging
firebase functions:log

# Watch for payment events
firebase functions:log --only manualPayments

# Set up alerts for errors
gcloud logging write test-log "Manual payment system deployed" --severity=INFO
```

**Key Metrics to Monitor:**
- Payment creation rate (payments/hour)
- Verification time (submission → approval)
- Success rate (approved/total)
- Average payment amount
- Distribution failures

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] Firebase Functions deployed and responding
- [ ] QR code image added (or placeholder accepted)
- [ ] Modal integrated into dashboard
- [ ] Frontend deployed and accessible
- [ ] Admin roles granted
- [ ] Test payment completed end-to-end
- [ ] Monitoring enabled

## Configuration Files

All configuration is centralized in:

- **Backend:** `functions/src/manualPayments/index.ts`
  - Payment config: Admin wallet, Cash App cashtag
  - Min/max purchase limits
  - Expiry time (24 hours)

- **Frontend:** `frontend/user/src/lib/pricing.ts`
  - Token prices: C12USD=$1.00, C12DAO=$3.30
  - Payment addresses
  - Stablecoin support

**To update pricing:**
```sql
UPDATE system_config
SET value = '1.05'
WHERE key = 'C12USD_PRICE_USD';
```

## Security Notes

✅ **Implemented:**
- User authentication required
- Admin role verification (FINANCE_ADMIN or SUPER_ADMIN)
- 24-hour submission window
- File upload validation (5MB max, images only)
- TX hash format validation
- Wallet address validation
- Audit logging of all actions

⚠️ **Additional Security (Optional):**
- Add rate limiting (max 5 payments per user per day)
- Add fraud detection (check for duplicate screenshots)
- Add automatic screenshot analysis
- Add blockchain verification for TX hashes
- Add withdrawal limits based on KYC level

## Troubleshooting

### Issue: Database migration fails
```bash
# Rollback and retry
npx prisma migrate reset
npx prisma migrate dev --name add_manual_payment_system
```

### Issue: Firebase Functions won't deploy
```bash
# Check Firebase project
firebase use --add

# Check authentication
firebase login

# Increase timeout
firebase deploy --only functions --force
```

### Issue: Modal doesn't appear
- Check: BuyTokensModal imported correctly
- Check: Modal state (isOpen) managed properly
- Check: No z-index conflicts with other elements
- Check: Browser console for errors

### Issue: Payment submission fails
- Check: User is authenticated
- Check: Firebase Functions responding (check logs)
- Check: Network tab for API errors
- Check: Amount meets min/max requirements

## Next Steps

After deployment:

1. **Phase 1.5 (Optional):** Build admin dashboard for payment review
   - Located at: `frontend/admin/src/pages/ManualPaymentsPage.tsx`
   - Features: Real-time payment queue, approve/reject UI, screenshot viewer

2. **Phase 1.6:** Final testing and documentation
   - Load testing (simulate 100+ concurrent payments)
   - Security audit
   - Update user documentation
   - Create admin training guide

3. **Future Enhancements:**
   - Automatic Cash App API integration
   - Stripe credit card payments
   - Cryptocurrency payment verification
   - Multi-currency support
   - Batch payment processing

## Success Metrics

Track these KPIs after launch:

- **Conversion Rate:** % of users who complete purchase
- **Average Payment:** Mean USD amount per transaction
- **Verification Time:** Time from submission → approval
- **Success Rate:** % of payments approved
- **User Satisfaction:** Support ticket rate

**Target Metrics:**
- Verification time: < 30 minutes (business hours)
- Success rate: > 95%
- Conversion rate: > 40% (of users who open modal)

---

## Prerequisites

Before starting the deployment, ensure you have:

- [x] Google Cloud Platform account with billing enabled
- [x] GCP CLI (`gcloud`) installed and authenticated
- [x] Docker installed
- [x] Node.js 20+ installed
- [x] Production MetaMask wallet with ETH and BNB for gas fees
- [x] API keys for BSCScan and PolygonScan
- [x] Payment provider credentials (Stripe, Cash App)

## Phase 1: Enable Billing and GCP Setup

⚠️ **CRITICAL**: Before proceeding, you must enable billing on the GCP project.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project `c12ai-dao`
3. Go to Billing → Link a billing account
4. Enable billing for the project

Once billing is enabled:

```bash
cd C12USD

# Enable all required GCP APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  servicenetworking.googleapis.com \
  vpcaccess.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  artifactregistry.googleapis.com \
  cloudkms.googleapis.com \
  compute.googleapis.com
```

## Phase 2: Infrastructure Setup with Terraform

```bash
# Install Terraform (if not already installed)
# On Windows: already installed via winget
# On Mac: brew install terraform
# On Linux: Follow https://learn.hashicorp.com/tutorials/terraform/install-cli

# Run the GCP setup script (requires Terraform)
npm run setup:gcp

# This script will:
# - Create Terraform state bucket
# - Set up service accounts and IAM roles
# - Initialize Terraform configuration
# - Create VPC, subnets, and networking
# - Set up Cloud SQL database
# - Configure Cloud KMS for encryption
```

## Phase 3: Configure Secrets

```bash
# Run the secrets setup script
chmod +x scripts/setup-secrets.sh
./scripts/setup-secrets.sh

# Or use the npm script:
npm run setup:secrets
```

The script will prompt you for:

- **Database credentials** (generated Cloud SQL connection string)
- **Blockchain RPC URLs** (Moralis, Alchemy, or QuickNode endpoints)
- **Private key** (from your production MetaMask wallet)
- **API keys** (BSCScan, PolygonScan for contract verification)
- **Payment provider keys** (Stripe production keys, Cash App credentials)

## Phase 4: Deploy Infrastructure

```bash
# Navigate to Terraform directory
cd deploy/gcp/terraform

# Review the Terraform plan
terraform plan -var-file="../environments/production.tfvars"

# Apply infrastructure changes (after review)
terraform apply -var-file="../environments/production.tfvars"

# This will create:
# - VPC with private subnets
# - Cloud SQL PostgreSQL database (HA configuration)
# - Cloud Run services
# - Load balancer and SSL certificates
# - Artifact Registry for container images
# - Monitoring and logging setup
```

## Phase 5: Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Deploy database schema to production
DATABASE_URL="$(gcloud secrets versions access latest --secret=prod_database_url)" \
npm run db:deploy

# Seed initial data (if needed)
DATABASE_URL="$(gcloud secrets versions access latest --secret=prod_database_url)" \
npm run db:seed
```

## Phase 6: Smart Contract Deployment

⚠️ **CRITICAL**: This uses real funds on mainnet. Ensure your wallet has sufficient ETH and BNB.

```bash
# Copy production environment
cp .env.production .env

# Update with your actual private key (do not commit this file)
# Edit .env and replace REPLACE_WITH_PRODUCTION_PRIVATE_KEY

# Deploy contracts to BSC and Polygon mainnet
npm run deploy:production

# The script will:
# - Deploy C12USD token contracts on both networks
# - Deploy MintRedeemGateway contracts
# - Configure LayerZero cross-chain functionality
# - Grant necessary permissions
# - Save deployment information to DEPLOYMENT_LOG.md
# - Generate contract verification commands
```

After deployment, verify contracts on block explorers:

```bash
# BSC Mainnet
npx hardhat verify --network bsc <TOKEN_ADDRESS> "<LZ_ENDPOINT>" "<DEPLOYER>" "<DEPLOYER>"
npx hardhat verify --network bsc <GATEWAY_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER>"

# Polygon Mainnet
npx hardhat verify --network polygon <TOKEN_ADDRESS> "<LZ_ENDPOINT>" "<DEPLOYER>" "<DEPLOYER>"
npx hardhat verify --network polygon <GATEWAY_ADDRESS> "<TOKEN_ADDRESS>" "<DEPLOYER>"
```

## Phase 7: Update Configuration

Update Secret Manager with deployed contract addresses:

```bash
# Update contract addresses in Secret Manager
gcloud secrets versions add bsc_token_address --data-file=- <<< "0xYourBSCTokenAddress"
gcloud secrets versions add bsc_gateway_address --data-file=- <<< "0xYourBSCGatewayAddress"
gcloud secrets versions add polygon_token_address --data-file=- <<< "0xYourPolygonTokenAddress"
gcloud secrets versions add polygon_gateway_address --data-file=- <<< "0xYourPolygonGatewayAddress"
```

## Phase 8: Deploy Backend Services

```bash
# Build and deploy to Cloud Run
npm run deploy:prod

# Or using Cloud Build directly:
gcloud builds submit --config cloudbuild.yaml --substitutions=_ENVIRONMENT=production

# This will:
# - Run tests and security scans
# - Build Docker image
# - Push to Artifact Registry
# - Deploy to Cloud Run with production configuration
# - Run health checks
# - Configure auto-scaling and monitoring
```

## Phase 9: Set up Continuous Deployment

1. **Add GitHub Secrets** (in your repository settings):
   ```
   GCP_SA_KEY: <content of the service account key JSON file>
   BSC_RPC_URL: <production BSC RPC endpoint>
   POLYGON_RPC_URL: <production Polygon RPC endpoint>
   OPS_SIGNER_PRIVATE_KEY: <your production private key>
   BSCSCAN_API_KEY: <BSCScan API key>
   POLYGONSCAN_API_KEY: <PolygonScan API key>
   SLACK_WEBHOOK_URL: <Slack webhook for notifications>
   ```

2. **Configure Branch Protection** (recommended):
   - Require pull request reviews
   - Require status checks (tests, security scans)
   - Require branches to be up to date

3. **Test the Pipeline**:
   ```bash
   # Create a test branch
   git checkout -b test-deployment

   # Make a small change and push
   echo "# Test deployment" >> README.md
   git add README.md
   git commit -m "Test deployment pipeline"
   git push origin test-deployment

   # Create pull request and merge to trigger deployment
   ```

## Phase 10: Configure Monitoring and Alerts

```bash
# Set up monitoring dashboards
gcloud monitoring dashboards create --config-from-file=monitoring/dashboard.json

# Configure alerting policies
gcloud alpha monitoring policies create --policy-from-file=monitoring/alerts.yaml
```

## Phase 11: DNS and Domain Setup

1. **Configure Custom Domain** (if desired):
   ```bash
   # Map custom domain to Cloud Run
   gcloud run domain-mappings create \
     --service=c12usd-backend-prod \
     --domain=api.c12usd.com \
     --region=us-central1
   ```

2. **Update DNS Records**:
   - Point `api.c12usd.com` to the Cloud Run service
   - Add SSL certificate verification records

## Phase 12: Security Hardening

1. **Review IAM Permissions**:
   ```bash
   # Audit service account permissions
   gcloud projects get-iam-policy c12ai-dao
   ```

2. **Enable Security Monitoring**:
   ```bash
   # Enable Security Command Center
   gcloud services enable securitycenter.googleapis.com

   # Configure vulnerability scanning
   gcloud container images scan <IMAGE_URL>
   ```

3. **Set up Backup Strategy**:
   ```bash
   # Configure automated database backups
   gcloud sql backups create --instance=c12usd-db-prod
   ```

## Phase 13: Go-Live Checklist

- [ ] All infrastructure deployed and healthy
- [ ] Smart contracts deployed and verified
- [ ] Database migrated and seeded
- [ ] Backend services running and passing health checks
- [ ] Monitoring and alerting configured
- [ ] DNS configured (if using custom domain)
- [ ] Security scans passed
- [ ] Load testing completed
- [ ] Backup and recovery procedures tested
- [ ] Team trained on production procedures

## Post-Deployment Operations

### Daily Operations

```bash
# Check service health
gcloud run services list --platform=managed --region=us-central1

# Monitor logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=c12usd-backend-prod"

# Check database performance
gcloud sql operations list --instance=c12usd-db-prod
```

### Regular Maintenance

```bash
# Update dependencies (monthly)
npm audit fix
npm update

# Rotate secrets (quarterly)
./scripts/setup-secrets.sh

# Review and update scaling parameters
gcloud run services update c12usd-backend-prod --max-instances=200 --region=us-central1
```

## Troubleshooting

### Common Issues

1. **Billing Not Enabled**:
   - Go to GCP Console → Billing
   - Link a valid billing account

2. **Insufficient Permissions**:
   - Check service account has all required roles
   - Run: `gcloud projects get-iam-policy c12ai-dao`

3. **Container Build Failures**:
   - Check Dockerfile and build context
   - Review Cloud Build logs: `gcloud builds list`

4. **Smart Contract Deployment Fails**:
   - Ensure wallet has sufficient gas fees
   - Check RPC endpoint connectivity
   - Verify private key format (no 0x prefix)

5. **Database Connection Issues**:
   - Check VPC networking configuration
   - Verify Cloud SQL Auth Proxy setup
   - Review connection string format

### Emergency Procedures

```bash
# Emergency stop (if needed)
gcloud run services update c12usd-backend-prod \
  --max-instances=0 \
  --region=us-central1

# Emergency restart
gcloud run services update c12usd-backend-prod \
  --max-instances=100 \
  --region=us-central1

# Rollback to previous version
gcloud run services update c12usd-backend-prod \
  --image=PREVIOUS_IMAGE_URL \
  --region=us-central1
```

## Support and Documentation

- **Deployment Log**: `DEPLOYMENT_LOG.md` (updated automatically)
- **Architecture Docs**: `docs/architecture/`
- **API Documentation**: Auto-generated and deployed with the service
- **Monitoring Dashboards**: GCP Console → Monitoring
- **Error Reporting**: GCP Console → Error Reporting

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate secrets regularly** (quarterly)
3. **Use least privilege** access for service accounts
4. **Enable audit logging** for all critical operations
5. **Monitor for suspicious activity** using Cloud Security Command Center
6. **Keep dependencies updated** to patch vulnerabilities
7. **Regular security reviews** of code and infrastructure

---

**⚠️ Important**: This deployment uses real mainnet networks and will incur costs. Always test on testnets first and review all configurations before deploying to production.

For additional support or questions, refer to the project documentation or contact the development team.