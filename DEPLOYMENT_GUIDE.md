# C12USD Production Deployment Guide

This guide provides step-by-step instructions for deploying the C12USD stablecoin to production on Google Cloud Platform with smart contracts on BSC and Polygon mainnet.

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