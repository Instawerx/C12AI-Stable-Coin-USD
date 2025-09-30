# C12USD CI/CD Pipeline Setup Guide

## Overview
This document provides comprehensive instructions for setting up the automated CI/CD pipeline for the C12USD stablecoin project with Git push triggers on Google Cloud Platform.

## 🏗️ Pipeline Architecture

### Deployment Environments
1. **Production** - Triggered by `main` branch pushes
2. **Staging** - Triggered by `develop` branch pushes
3. **Smart Contracts** - Triggered by contract changes on `main` branch

### Build Configurations
- `cloudbuild.yaml` - Production backend deployment
- `cloudbuild-staging.yaml` - Staging backend deployment
- `cloudbuild-contracts.yaml` - Smart contract deployment

## 📋 Prerequisites

### Required Services
- ✅ Google Cloud Project: `c12ai-dao`
- ✅ Cloud Build API enabled
- ✅ Cloud Run API enabled
- ✅ Artifact Registry configured
- ✅ Secret Manager with deployment keys
- ✅ Service accounts with proper IAM roles

### Git Repository Requirements
- GitHub repository with C12USD source code
- Branch protection rules for `main` branch
- Repository webhooks configured for Cloud Build

## 🚀 Setup Instructions

### Step 1: Create Cloud Build Triggers

```bash
# Create production deployment trigger
gcloud builds triggers create github \
  --repo-name="C12USD" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --name="c12usd-production-deploy" \
  --description="C12USD production deployment trigger" \
  --project="c12ai-dao"

# Create staging deployment trigger
gcloud builds triggers create github \
  --repo-name="C12USD" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^develop$" \
  --build-config="cloudbuild-staging.yaml" \
  --name="c12usd-staging-deploy" \
  --description="C12USD staging deployment trigger" \
  --project="c12ai-dao"

# Create smart contract deployment trigger
gcloud builds triggers create github \
  --repo-name="C12USD" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild-contracts.yaml" \
  --included-files="contracts/**,scripts/**,hardhat.config.js" \
  --name="c12usd-contracts-deploy" \
  --description="C12USD smart contract deployment trigger" \
  --project="c12ai-dao"
```

### Step 2: Configure Repository Connection

1. **Connect GitHub Repository**:
   ```bash
   # Install GitHub App for Cloud Build
   gcloud builds repositories create-app-installation \
     --github-owner="YOUR_GITHUB_USERNAME" \
     --project="c12ai-dao"
   ```

2. **Link Repository**:
   ```bash
   # Link the repository to Cloud Build
   gcloud builds repositories create \
     --remote-uri="https://github.com/YOUR_GITHUB_USERNAME/C12USD.git" \
     --name="c12usd-repo" \
     --project="c12ai-dao"
   ```

### Step 3: Configure Webhook Triggers

```bash
# Enable webhook triggers for automatic builds
gcloud builds triggers update c12usd-production-deploy \
  --webhook-trigger-enable \
  --project="c12ai-dao"

gcloud builds triggers update c12usd-staging-deploy \
  --webhook-trigger-enable \
  --project="c12ai-dao"

gcloud builds triggers update c12usd-contracts-deploy \
  --webhook-trigger-enable \
  --project="c12ai-dao"
```

## 🔐 Security Configuration

### Service Account Permissions
The CI/CD pipeline uses the following service account:
- **Account**: `c12usd-production-cloudbuild@c12ai-dao.iam.gserviceaccount.com`
- **Roles**:
  - Cloud Build Service Account
  - Cloud Run Admin
  - Artifact Registry Writer
  - Secret Manager Secret Accessor

### Secret Management
Required secrets in Google Secret Manager:
- `ops_signer_key` - Smart contract deployment private key
- `bsc_rpc_url` - BSC network RPC endpoint
- `polygon_rpc_url` - Polygon network RPC endpoint
- `bsc_scan_api_key` - BSCscan API key for verification
- `polygon_scan_api_key` - PolygonScan API key for verification

## 🔄 Pipeline Workflows

### Production Deployment (main branch)
1. **Trigger**: Push to `main` branch
2. **Steps**:
   - Install dependencies and run tests
   - Build Docker image
   - Push to Artifact Registry
   - Deploy to Cloud Run production
   - Run health checks
   - Send notification to admin@carnival12.com

### Staging Deployment (develop branch)
1. **Trigger**: Push to `develop` branch
2. **Steps**:
   - Install dependencies and compile
   - Build staging Docker image
   - Deploy to Cloud Run staging
   - Run health checks
   - Notify deployment status

### Smart Contract Deployment
1. **Trigger**: Contract changes on `main` branch
2. **Steps**:
   - Compile smart contracts
   - Deploy to BSC Mainnet
   - Deploy to Polygon Mainnet
   - Verify contracts on block explorers
   - Store deployment artifacts
   - Update documentation

## 📊 Monitoring and Notifications

### Build Status Monitoring
- **Email Notifications**: admin@carnival12.com
- **Build History**: Google Cloud Console > Cloud Build
- **Logs**: Centralized logging in Cloud Logging

### Success Criteria
- All tests pass
- Docker build succeeds
- Health checks pass
- Service responds within timeout

### Failure Handling
- Build failures trigger email alerts
- Automatic rollback for critical failures
- Manual intervention required for smart contract issues

## 🛠️ Troubleshooting

### Common Issues

1. **Build Timeout**
   - Check resource allocation in build configuration
   - Optimize Docker build layers
   - Increase timeout in cloudbuild.yaml

2. **Permission Denied**
   - Verify service account has required IAM roles
   - Check Secret Manager access permissions
   - Validate Artifact Registry permissions

3. **Health Check Failures**
   - Verify database connectivity
   - Check environment variable configuration
   - Review Cloud Run service logs

4. **Smart Contract Deployment Failures**
   - Verify private key and RPC endpoints
   - Check gas price and limits
   - Validate contract compilation

### Debug Commands

```bash
# Check trigger status
gcloud builds triggers list --project=c12ai-dao

# View build logs
gcloud builds log BUILD_ID --project=c12ai-dao

# Test trigger manually
gcloud builds triggers run TRIGGER_NAME --branch=main --project=c12ai-dao

# Check service account permissions
gcloud projects get-iam-policy c12ai-dao \
  --flatten="bindings[].members" \
  --filter="bindings.members:c12usd-production-cloudbuild@c12ai-dao.iam.gserviceaccount.com"
```

## 📈 Performance Optimization

### Build Speed Optimization
- Use multi-stage Docker builds
- Cache dependencies between builds
- Parallel test execution
- Optimize image layers

### Cost Management
- Use smaller machine types for simple builds
- Implement build caching
- Set appropriate timeouts
- Monitor build usage

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review build success rates
- **Monthly**: Update dependencies and base images
- **Quarterly**: Review and optimize build configurations
- **As Needed**: Update secrets and API keys

### Update Procedures
1. Test changes in staging environment
2. Update build configurations incrementally
3. Monitor build performance after changes
4. Document all configuration updates

## 📞 Support and Contacts

### Emergency Contacts
- **Primary**: admin@carnival12.com
- **Project**: c12ai-dao
- **Region**: us-central1

### Resources
- [Google Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [C12USD Smart Contract Documentation](./SMART_CONTRACT_DEPLOYMENT.md)
- [Database Configuration Guide](./DATABASE_CONFIGURATION.md)

---
**Last Updated**: 2025-09-28
**Contact**: admin@carnival12.com
**Project**: C12USD Stablecoin - c12ai-dao
**Status**: Production Ready ✅