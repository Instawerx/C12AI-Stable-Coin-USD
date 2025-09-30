# C12USD Deployment Guide

This document provides comprehensive instructions for deploying the C12USD stablecoin backend to Google Cloud Platform using automated CI/CD pipelines.

## Architecture Overview

### Infrastructure Components

- **Google Cloud Run**: Serverless container platform for the backend API
- **Artifact Registry**: Container image storage
- **Secret Manager**: Secure storage for sensitive configuration
- **Workload Identity Federation**: Keyless authentication from GitHub Actions
- **Cloud Build**: Alternative CI/CD pipeline
- **VPC Connector**: Private networking for database connections

### Deployment Environments

| Environment | Branch | URL | Resources | Auto-scaling |
|-------------|--------|-----|-----------|--------------|
| Staging | `develop` | https://staging-api.c12usd.com | 1 CPU, 1GB RAM | 0-10 instances |
| Production | `main` | https://api.c12usd.com | 2 CPU, 2GB RAM | 2-100 instances |

## Prerequisites

### 1. Google Cloud Project Setup

1. Create a new GCP project or use an existing one
2. Enable billing for the project
3. Install and configure `gcloud` CLI

### 2. GitHub Repository Setup

1. Fork or clone the repository
2. Ensure you have admin access to configure secrets and environments

## Initial Setup

### Step 1: Run Workload Identity Setup

Execute the setup script to configure authentication and permissions:

```bash
# Make the script executable
chmod +x scripts/setup-workload-identity.sh

# Run the setup script
./scripts/setup-workload-identity.sh YOUR_PROJECT_ID your-org/your-repo
```

This script will:
- Enable required GCP APIs
- Create Artifact Registry repository
- Set up service accounts and IAM roles
- Configure Workload Identity Federation
- Create initial secrets in Secret Manager

### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following **Repository Secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `your-project-id` | Your Google Cloud Project ID |
| `WIF_PROVIDER` | `projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider` | Workload Identity Provider resource name |

### Step 3: Configure GitHub Environments

Create deployment environments for approval gates:

1. Go to **Settings** → **Environments**
2. Create two environments:

#### Staging Environment
- **Name**: `staging`
- **Deployment branches**: `develop` only
- **Protection rules**: None (automatic deployment)

#### Production Environment
- **Name**: `production`
- **Deployment branches**: `main` only
- **Protection rules**:
  - Required reviewers: 1-2 team members
  - Wait timer: 5 minutes (optional)

### Step 4: Update Secret Manager Values

Replace placeholder values in Google Secret Manager with actual configuration:

```bash
# Database URLs
echo "postgresql://user:password@prod-db-host:5432/c12usd_production" | \
    gcloud secrets versions add prod-database-url --data-file=-

echo "postgresql://user:password@staging-db-host:5432/c12usd_staging" | \
    gcloud secrets versions add staging-database-url --data-file=-

# RPC URLs
echo "https://your-bsc-rpc-url" | \
    gcloud secrets versions add bsc-rpc-url --data-file=-

echo "https://your-polygon-rpc-url" | \
    gcloud secrets versions add polygon-rpc-url --data-file=-

# Operations signer private key (without 0x prefix)
echo "your-private-key-here" | \
    gcloud secrets versions add ops-signer-key --data-file=-
```

## Deployment Process

### Automatic Deployments

The deployment pipeline automatically triggers on:

1. **Push to `develop`** → Deploys to **staging** environment
2. **Push to `main`** → Deploys to **production** (with approval)

### Pipeline Stages

#### 1. Build & Test Stage
- Install dependencies with pnpm
- Run ESLint for code quality
- Compile Solidity contracts
- Execute comprehensive test suite
- Generate coverage reports

#### 2. Container Build Stage
- Build multi-stage Docker image
- Push to Artifact Registry
- Scan for security vulnerabilities

#### 3. Deploy Stage
- Deploy to appropriate environment
- Configure resources and scaling
- Update environment variables and secrets

#### 4. Verification Stage
- Health checks
- Basic performance testing
- Integration testing

### Manual Deployment

You can trigger deployments manually:

1. Go to **Actions** → **Deploy to Google Cloud**
2. Click **Run workflow**
3. Select the target branch
4. Monitor the deployment progress

## Monitoring & Operations

### Health Endpoints

The backend exposes several health check endpoints:

- **`/health`**: Basic health check
- **`/ready`**: Readiness check (includes database connectivity)
- **`/metrics`**: Prometheus-compatible metrics (if enabled)

### Viewing Logs

```bash
# Staging logs
gcloud run services logs read c12usd-backend-staging --region=us-central1

# Production logs
gcloud run services logs read c12usd-backend-prod --region=us-central1

# Follow logs in real-time
gcloud run services logs tail c12usd-backend-prod --region=us-central1
```

### Service URLs

```bash
# Get staging URL
gcloud run services describe c12usd-backend-staging \
  --region=us-central1 --format='value(status.url)'

# Get production URL
gcloud run services describe c12usd-backend-prod \
  --region=us-central1 --format='value(status.url)'
```

### Scaling Configuration

#### Staging
- **Min instances**: 0 (scales to zero when idle)
- **Max instances**: 10
- **CPU**: 1 vCPU
- **Memory**: 1 GB
- **Concurrency**: 1000 requests per instance

#### Production
- **Min instances**: 2 (always running)
- **Max instances**: 100
- **CPU**: 2 vCPU
- **Memory**: 2 GB
- **Concurrency**: 1000 requests per instance

## Troubleshooting

### Common Issues

#### 1. Authentication Failed
```bash
# Check Workload Identity configuration
gcloud iam workload-identity-pools describe github-actions-pool --location=global

# Verify service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID
```

#### 2. Container Build Failed
```bash
# Check Cloud Build logs
gcloud builds list --limit=10

# View specific build logs
gcloud builds log BUILD_ID
```

#### 3. Deployment Failed
```bash
# Check Cloud Run revision status
gcloud run revisions list --service=c12usd-backend-prod --region=us-central1

# Describe failed revision
gcloud run revisions describe REVISION_NAME --region=us-central1
```

#### 4. Health Check Failures
```bash
# Test health endpoint directly
curl -f https://your-service-url/health

# Check service logs for errors
gcloud run services logs read c12usd-backend-prod --region=us-central1 --limit=50
```

### Performance Optimization

#### 1. Cold Start Optimization
- Use startup CPU boost for faster cold starts
- Minimize Docker image size with multi-stage builds
- Pre-warm instances with minimum scaling

#### 2. Database Connection Optimization
- Use connection pooling
- Configure appropriate connection limits
- Use VPC connector for private database access

#### 3. Memory and CPU Tuning
- Monitor resource usage with Cloud Monitoring
- Adjust CPU/memory allocation based on metrics
- Use horizontal auto-scaling for traffic spikes

## Security Considerations

### 1. Container Security
- Non-root user execution
- Read-only root filesystem where possible
- Minimal container surface area
- Regular image scanning

### 2. Network Security
- VPC-based private networking
- Proper firewall rules
- TLS encryption for all communications

### 3. Secret Management
- All sensitive data in Secret Manager
- Automatic secret rotation where possible
- No secrets in container images or code

### 4. Access Control
- Least-privilege IAM policies
- Service account per environment
- Audit logging enabled

## Rollback Procedures

### Automatic Rollback
Cloud Run automatically rolls back failed deployments, but you can also manually rollback:

```bash
# List revisions
gcloud run revisions list --service=c12usd-backend-prod --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic c12usd-backend-prod \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

### Emergency Procedures
1. **Immediate rollback**: Use Cloud Console or CLI to route traffic to previous revision
2. **Circuit breaker**: Enable maintenance mode or circuit breaker in the application
3. **Scale down**: Reduce traffic by scaling down to minimum instances
4. **Incident response**: Follow your organization's incident response procedures

## Cost Optimization

### 1. Resource Right-sizing
- Monitor CPU/memory utilization
- Adjust resource allocation based on actual usage
- Use scaling metrics to optimize instance counts

### 2. Storage Optimization
- Regular cleanup of old container images
- Use image compression and multi-stage builds
- Configure retention policies for logs and artifacts

### 3. Network Optimization
- Use CDN for static assets
- Optimize database queries to reduce response times
- Configure appropriate caching strategies

## Support and Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Review deployment metrics and logs
2. **Monthly**: Update dependencies and base images
3. **Quarterly**: Review and update security configurations
4. **Annually**: Complete architecture review and optimization

### Getting Help
- Check the [troubleshooting section](#troubleshooting) first
- Review Cloud Run documentation
- Contact the DevOps team for infrastructure issues
- File issues in the project repository for application problems