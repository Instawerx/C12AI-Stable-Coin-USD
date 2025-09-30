# C12USD Firebase & Database Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the C12USD stablecoin project with Firebase, PostgreSQL database, and all associated services.

## Architecture

### Technology Stack
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Firebase Services**:
  - Authentication
  - Firestore (NoSQL database)
  - Cloud Functions
  - Cloud Storage
  - Hosting
  - Cloud Messaging
- **Blockchain**: BSC and Polygon networks
- **Payment Processing**: Stripe and Cash App

### Service Architecture
```
Frontend (React/Vue)
    ↓
Firebase Hosting
    ↓
Firebase Auth → Node.js Backend → PostgreSQL Database
    ↓                ↓
Firestore       Cloud Functions
    ↓                ↓
Real-time       Webhooks & Cron Jobs
Updates
```

## Prerequisites

### Required Tools
```bash
# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Firebase CLI
npm install -g firebase-tools

# Install Google Cloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Install Prisma CLI
npm install -g prisma

# Install PostgreSQL client
sudo apt-get install postgresql-client
```

### Environment Setup
1. Create Google Cloud Project: `c12ai-dao`
2. Enable required APIs:
   - Firebase Management API
   - Cloud Firestore API
   - Cloud Functions API
   - Cloud Storage API
   - Identity and Access Management API
   - Cloud Build API

## Step 1: PostgreSQL Database Setup

### 1.1 Create PostgreSQL Instance

**Google Cloud SQL:**
```bash
# Create Cloud SQL instance
gcloud sql instances create c12usd-postgres \
    --database-version=POSTGRES_15 \
    --tier=db-custom-2-7680 \
    --region=us-central1 \
    --backup-start-time=03:00 \
    --enable-bin-log \
    --storage-auto-increase

# Create database
gcloud sql databases create c12usd_production \
    --instance=c12usd-postgres

# Create user
gcloud sql users create c12usd \
    --instance=c12usd-postgres \
    --password=SECURE_PASSWORD_HERE
```

**Local Development:**
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE c12usd_dev;
CREATE USER c12usd WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE c12usd_dev TO c12usd;
\q
```

### 1.2 Configure Database Connection

Create `.env` file:
```bash
# Database
DATABASE_URL="postgresql://c12usd:password@localhost:5432/c12usd_dev"

# Production (use Cloud SQL Proxy)
DATABASE_URL="postgresql://c12usd:SECURE_PASSWORD@/c12usd_production?host=/cloudsql/c12ai-dao:us-central1:c12usd-postgres"

# Firebase
FIREBASE_PROJECT_ID="c12ai-dao"
GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"

# JWT
JWT_SECRET="your-super-secure-jwt-secret"

# External Services
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
CASHAPP_CLIENT_ID="your-cashapp-client-id"
CASHAPP_CLIENT_SECRET="your-cashapp-client-secret"
```

### 1.3 Initialize Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed
```

## Step 2: Firebase Project Setup

### 2.1 Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize project
firebase init

# Select features:
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Remote Config

# Select existing project: c12ai-dao
```

### 2.2 Configure Firebase Services

**Firestore Rules:**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

**Storage Rules:**
```bash
# Deploy storage rules
firebase deploy --only storage
```

**Remote Config:**
```bash
# Deploy remote config template
firebase deploy --only remoteconfig
```

### 2.3 Authentication Setup

**Enable Authentication Providers:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable:
   - Custom token (for wallet authentication)
   - Email/Password (for admin users)
   - Phone (for SMS verification)

**Custom Claims Setup:**
```javascript
// Set admin claims
const admin = require('firebase-admin');
await admin.auth().setCustomUserClaims(userId, {
  admin: true,
  roles: ['admin', 'treasury']
});
```

## Step 3: Cloud Functions Deployment

### 3.1 Install Function Dependencies

```bash
cd functions
npm install
```

### 3.2 Configure Environment Variables

```bash
# Set function configuration
firebase functions:config:set \
  stripe.secret_key="sk_live_..." \
  stripe.webhook_secret="whsec_..." \
  cashapp.client_id="your-client-id" \
  cashapp.client_secret="your-client-secret" \
  jwt.secret="your-jwt-secret"
```

### 3.3 Deploy Functions

```bash
# Build functions
npm run build

# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:auth-createCustomToken
```

## Step 4: Backend API Deployment

### 4.1 Google Cloud Run Deployment

**Build Docker Image:**
```bash
# Build image
gcloud builds submit --tag gcr.io/c12ai-dao/c12usd-backend

# Deploy to Cloud Run
gcloud run deploy c12usd-backend \
    --image gcr.io/c12ai-dao/c12usd-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "DATABASE_URL=postgresql://..."
```

**Configure Cloud SQL Proxy:**
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/c12usd-backend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/c12usd-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'c12usd-backend'
      - '--image=gcr.io/$PROJECT_ID/c12usd-backend'
      - '--region=us-central1'
      - '--platform=managed'
      - '--add-cloudsql-instances=$PROJECT_ID:us-central1:c12usd-postgres'
```

## Step 5: Frontend Deployment

### 5.1 Build Frontend

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 5.2 Deploy to Firebase Hosting

```bash
# Deploy hosting
firebase deploy --only hosting

# Custom domain setup
firebase hosting:channel:deploy main --expires 30d
```

## Step 6: Security Configuration

### 6.1 IAM Roles Setup

```bash
# Create service account for functions
gcloud iam service-accounts create c12usd-functions \
    --description="Service account for C12USD functions" \
    --display-name="C12USD Functions"

# Grant necessary permissions
gcloud projects add-iam-policy-binding c12ai-dao \
    --member="serviceAccount:c12usd-functions@c12ai-dao.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding c12ai-dao \
    --member="serviceAccount:c12usd-functions@c12ai-dao.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

### 6.2 Network Security

**VPC Configuration:**
```bash
# Create VPC network
gcloud compute networks create c12usd-vpc --subnet-mode regional

# Create firewall rules
gcloud compute firewall-rules create allow-internal \
    --network c12usd-vpc \
    --allow tcp,udp,icmp \
    --source-ranges 10.0.0.0/8

# Configure private Google access
gcloud compute networks subnets update default \
    --region us-central1 \
    --enable-private-ip-google-access
```

### 6.3 SSL/TLS Certificates

```bash
# Create managed SSL certificate
gcloud compute ssl-certificates create c12usd-ssl \
    --domains app.c12usd.com,api.c12usd.com
```

## Step 7: Monitoring & Observability

### 7.1 Cloud Monitoring Setup

```bash
# Enable APIs
gcloud services enable monitoring.googleapis.com
gcloud services enable logging.googleapis.com

# Create monitoring workspace
gcloud alpha monitoring workspaces create \
    --display-name="C12USD Monitoring"
```

### 7.2 Alerting Policies

```yaml
# monitoring.yaml
alertingPolicies:
  - displayName: "High Error Rate"
    conditions:
      - displayName: "Error rate > 5%"
        conditionThreshold:
          filter: 'resource.type="cloud_function"'
          comparison: COMPARISON_GT
          thresholdValue: 0.05
    notificationChannels:
      - "projects/c12ai-dao/notificationChannels/SLACK_CHANNEL_ID"
```

### 7.3 Log-based Metrics

```bash
# Create log-based metric for failed transactions
gcloud logging metrics create failed_transactions \
    --description="Count of failed transactions" \
    --log-filter='severity="ERROR" AND "transaction failed"'
```

## Step 8: Backup & Disaster Recovery

### 8.1 Database Backups

```bash
# Automated backups (already configured in Cloud SQL)
gcloud sql backups list --instance=c12usd-postgres

# On-demand backup
gcloud sql backups create --instance=c12usd-postgres
```

### 8.2 Firestore Backups

```bash
# Create Firestore backup
gcloud firestore export gs://c12ai-dao-backups/$(date +%Y%m%d)
```

### 8.3 Code Repository Backups

```bash
# Set up mirroring to multiple repositories
git remote add backup https://github.com/c12ai-dao/c12usd-backup.git
git push backup main
```

## Step 9: Performance Optimization

### 9.1 CDN Configuration

```bash
# Enable Cloud CDN
gcloud compute backend-services update c12usd-backend \
    --enable-cdn \
    --cache-mode=CACHE_ALL_STATIC
```

### 9.2 Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_users_address ON users(address);
CREATE INDEX CONCURRENTLY idx_mint_receipts_user_id ON mint_receipts(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_hash ON transactions(hash);
CREATE INDEX CONCURRENTLY idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### 9.3 Cache Layer

```bash
# Deploy Redis for caching
gcloud redis instances create c12usd-cache \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_6_x
```

## Step 10: Testing & Validation

### 10.1 End-to-End Testing

```bash
# Run integration tests
npm run test:integration

# Run load tests
npm run test:load
```

### 10.2 Security Testing

```bash
# Run security scans
npm audit
snyk test

# OWASP dependency check
dependency-check --project C12USD --scan ./
```

### 10.3 Performance Testing

```bash
# Load testing with Artillery
artillery quick --count 100 --num 10 https://api.c12usd.com/health
```

## Step 11: Go-Live Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Database migrations tested
- [ ] Backup procedures tested
- [ ] Monitoring alerts configured
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Rate limiting configured
- [ ] Error tracking enabled

### Post-deployment
- [ ] Health checks passing
- [ ] Monitoring dashboards showing green
- [ ] All integrations working
- [ ] Performance within acceptable limits
- [ ] Security headers present
- [ ] Backup systems operational
- [ ] Team notifications configured

## Maintenance Procedures

### Daily Tasks
- Monitor system health dashboards
- Review error logs and alerts
- Check backup completion status
- Verify external service integrations

### Weekly Tasks
- Review performance metrics
- Update security patches
- Analyze user feedback and issues
- Review and update documentation

### Monthly Tasks
- Security vulnerability assessment
- Performance optimization review
- Cost analysis and optimization
- Disaster recovery testing

## Troubleshooting Guide

### Common Issues

**Database Connection Issues:**
```bash
# Test connection
psql postgresql://user:password@host:port/database

# Check Cloud SQL proxy
cloud_sql_proxy -instances=c12ai-dao:us-central1:c12usd-postgres=tcp:5432
```

**Firebase Function Errors:**
```bash
# View logs
firebase functions:log --only auth-createCustomToken

# Debug locally
firebase emulators:start --only functions
```

**Authentication Issues:**
```bash
# Verify JWT token
firebase auth:verify <token>

# Check custom claims
firebase auth:get <uid>
```

### Support Contacts
- **Technical Issues**: tech-support@c12usd.com
- **Security Issues**: security@c12usd.com
- **Infrastructure**: ops@c12usd.com

## Conclusion

This deployment guide provides a production-ready setup for the C12USD stablecoin project with comprehensive security, monitoring, and scalability features. Regular maintenance and monitoring are essential for optimal performance and security.

For additional support or questions, please refer to the project documentation or contact the development team.