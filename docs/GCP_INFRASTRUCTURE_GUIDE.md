# C12USD Google Cloud Platform Infrastructure Guide

## Overview

This guide provides comprehensive documentation for deploying the C12USD stablecoin project on Google Cloud Platform with production-ready security, cost optimization, and monitoring.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Cloud Run     │    │   Cloud SQL     │
│   + Cloud Armor │ -> │   (Serverless)  │ -> │   (PostgreSQL)  │
│   + SSL/TLS     │    │   + Auto Scale  │    │   + Read Replica│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         v                        v                        v
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Artifact      │    │   Secret        │    │   Monitoring    │
│   Registry      │    │   Manager       │    │   + Alerting    │
│   (Docker)      │    │   (Secrets)     │    │   + Dashboards  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Infrastructure Components

### 1. Network Security
- **VPC Network** with private subnets
- **Cloud NAT** for outbound internet access
- **Cloud Armor** for DDoS protection and WAF
- **Private Google Access** enabled
- **VPC Flow Logs** for network monitoring

### 2. Compute & Application
- **Cloud Run** for serverless container hosting
- **Artifact Registry** for Docker image storage
- **Global Load Balancer** with SSL termination
- **Auto-scaling** based on demand
- **Health checks** and uptime monitoring

### 3. Database
- **Cloud SQL PostgreSQL 15** with regional HA
- **Private IP** only (no public access)
- **SSL/TLS encryption** enforced
- **Automated backups** with 30-day retention
- **Read replica** for production scaling

### 4. Security
- **Secret Manager** for all sensitive data
- **KMS encryption** for data at rest
- **IAM with least-privilege** access
- **Binary Authorization** for container security
- **Audit logging** with 7-year retention
- **Security Command Center** integration

### 5. Monitoring & Observability
- **Cloud Monitoring** with custom dashboards
- **SLO monitoring** (99.9% availability, 200ms P95)
- **Alerting** via email, Slack, Discord
- **Application Performance Monitoring**
- **Cost monitoring** and budget alerts
- **Compliance logging** for financial regulations

## Quick Start

### Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Terraform** >= 1.5 installed
4. **Docker** installed for local building
5. **Domain name** registered (optional)

### Step 1: Initial Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd C12USD

# Run the setup script
./terraform/scripts/setup-terraform-backend.sh
```

This script will:
- Enable required Google Cloud APIs
- Create Terraform state bucket
- Set up service accounts and permissions
- Initialize Terraform

### Step 2: Configure Secrets

```bash
# Set up production secrets
./terraform/scripts/setup-secrets.sh
```

**⚠️ IMPORTANT:** After running this script, you MUST update the following secrets with real values:

1. **Private Key** (CRITICAL):
   ```bash
   echo -n "YOUR_ACTUAL_METAMASK_PRIVATE_KEY" | \
   gcloud secrets versions add c12usd-production-ops-signer-private-key --data-file=-
   ```

2. **Stripe Production Keys**:
   ```bash
   echo -n "sk_live_..." | \
   gcloud secrets versions add c12usd-production-stripe-secret-key --data-file=-

   echo -n "whsec_..." | \
   gcloud secrets versions add c12usd-production-stripe-webhook-secret --data-file=-
   ```

3. **Cash App Production Keys**:
   ```bash
   echo -n "YOUR_CASHAPP_CLIENT_ID" | \
   gcloud secrets versions add c12usd-production-cashapp-client-id --data-file=-
   ```

### Step 3: Deploy Infrastructure

```bash
# Deploy to production
./terraform/scripts/deploy.sh production

# Or deploy to staging first
./terraform/scripts/deploy.sh staging
```

The deployment process includes:
- Infrastructure planning and review
- Resource creation with Terraform
- Database connection configuration
- Application deployment
- Health checks and verification

## Environment Configuration

### Production Configuration
- **Location**: us-central1 (Iowa, USA)
- **Cloud Run**: 2-100 instances, 4 CPU, 4GB RAM
- **Database**: db-custom-4-15360 (4 vCPU, 15GB RAM)
- **Storage**: 500GB SSD with automated scaling
- **Backups**: 30-day retention + cross-region replication
- **Budget**: $2000/month with 50%, 75%, 90%, 100% alerts

### Staging Configuration
- **Location**: us-central1 (shared region)
- **Cloud Run**: 1-10 instances, 2 CPU, 2GB RAM
- **Database**: db-custom-2-7680 (2 vCPU, 7.5GB RAM)
- **Storage**: 100GB SSD
- **Backups**: 7-day retention
- **Budget**: $500/month

## Security Best Practices

### 1. Secret Management
- All secrets stored in Google Secret Manager
- Automatic rotation enabled where possible
- Least-privilege access with IAM
- Audit logging for all secret access

### 2. Network Security
- Private IP addresses only for databases
- Cloud Armor protection against DDoS
- SSL/TLS encryption everywhere
- VPC flow logs enabled

### 3. Application Security
- Container vulnerability scanning
- Binary Authorization for deployment
- Runtime security monitoring
- Regular security updates

### 4. Compliance
- 7-year audit log retention
- Financial transaction logging
- GDPR compliance ready
- SOC 2 Type II compatible

## Cost Optimization

### 1. Resource Rightsizing
- Auto-scaling based on demand
- Committed use discounts for predictable workloads
- Regional persistent disks
- Efficient machine types

### 2. Storage Optimization
- Lifecycle policies for logs and backups
- Appropriate storage classes
- Automated cleanup of old artifacts
- Compression for backups

### 3. Monitoring & Alerts
- Cost anomaly detection
- Budget alerts at multiple thresholds
- Resource utilization monitoring
- Recommendation engine integration

### 4. Expected Monthly Costs (Production)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| Cloud Run | 4 CPU, 4GB RAM, avg 10 instances | $400-600 |
| Cloud SQL | 4 vCPU, 15GB RAM + replica | $800-1000 |
| Load Balancer | Global HTTPS LB | $25-50 |
| Storage | Database + backups + logs | $100-200 |
| Networking | NAT + egress | $50-100 |
| Monitoring | Logs + metrics + alerts | $50-100 |
| **Total** | | **$1,425-2,050** |

## Monitoring & Alerting

### Key Metrics Monitored
1. **Application Performance**
   - Request rate and latency
   - Error rate (target: <1%)
   - CPU and memory utilization
   - Container instance count

2. **Database Performance**
   - Connection count
   - Query performance
   - CPU and memory usage
   - Disk I/O and space

3. **Business Metrics**
   - Mint operations per hour
   - Redeem operations per hour
   - Transaction volume
   - Failed authentication attempts

4. **Cost & Budget**
   - Daily spend vs. budget
   - Resource utilization efficiency
   - Cost per transaction
   - Budget alert thresholds

### SLO Targets
- **Availability**: 99.9% (8.77 hours downtime/year)
- **Latency**: 95th percentile < 200ms
- **Error Rate**: < 0.1% for critical operations
- **Database Query Time**: < 100ms average

### Alert Channels
- **Email**: alerts@c12usd.com
- **Slack**: #alerts-production channel
- **Discord**: Operations webhook
- **PagerDuty**: For critical alerts (optional)

## Backup & Disaster Recovery

### Automated Backups
- **Database**: Daily automated backups, 30-day retention
- **Cross-region replication** to us-east1
- **Point-in-time recovery** enabled
- **Binary logs** retained for 7 days

### Disaster Recovery Plan
1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup verification**: Weekly automated tests
4. **Runbook**: Documented recovery procedures
5. **Testing**: Quarterly DR drills

### Manual Backup Process
```bash
# Create manual database backup
gcloud sql export sql c12usd-production-db gs://c12ai-dao-production-db-backups/manual-backup-$(date +%Y%m%d-%H%M%S).sql \
  --database=c12usd_production

# Export secrets backup
gcloud secrets list --format="value(name)" | \
  xargs -I {} gcloud secrets versions access latest --secret={}
```

## Troubleshooting

### Common Issues

1. **Service Not Responding**
   ```bash
   # Check service status
   gcloud run services describe c12usd-production --region=us-central1

   # Check logs
   gcloud logs read "resource.type=cloud_run_revision" --limit=50
   ```

2. **Database Connection Issues**
   ```bash
   # Check Cloud SQL status
   gcloud sql instances describe c12usd-production-db

   # Test connectivity from Cloud Shell
   gcloud sql connect c12usd-production-db --user=c12usd_user
   ```

3. **High Costs**
   ```bash
   # Check current usage
   gcloud billing budgets list --billing-account=YOUR_BILLING_ACCOUNT

   # Analyze costs
   gcloud logging read "resource.type=billing_account" --limit=10
   ```

### Support Contacts
- **Infrastructure**: DevOps team
- **Security**: Security team
- **Database**: DBA team
- **Cost Optimization**: FinOps team

## Maintenance

### Regular Tasks
- **Weekly**: Review cost reports and alerts
- **Monthly**: Security updates and patches
- **Quarterly**: Disaster recovery testing
- **Annually**: Security audit and compliance review

### Upgrade Procedures
1. Test in staging environment
2. Plan maintenance window
3. Create manual backup
4. Deploy with blue-green strategy
5. Monitor metrics post-deployment
6. Rollback if issues detected

## Compliance & Governance

### Financial Regulations
- **PCI DSS**: Payment card data protection
- **AML/KYC**: Anti-money laundering compliance
- **SOX**: Financial reporting accuracy
- **GDPR**: European data protection

### Audit Requirements
- 7-year log retention for financial transactions
- Immutable audit trails
- Regular compliance reporting
- Third-party security assessments

### Data Governance
- Data classification and labeling
- Access controls and monitoring
- Encryption at rest and in transit
- Data retention and deletion policies

---

For additional support or questions, please contact the DevOps team or refer to the Google Cloud documentation.