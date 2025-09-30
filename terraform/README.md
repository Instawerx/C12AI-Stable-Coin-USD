# C12USD Terraform Infrastructure

This directory contains Terraform configurations for deploying the C12USD stablecoin infrastructure on Google Cloud Platform.

## Directory Structure

```
terraform/
├── main.tf                     # Root module configuration
├── variables.tf               # Input variables
├── modules/                   # Reusable modules
│   ├── network/              # VPC, subnets, firewall rules
│   ├── security/             # IAM, KMS, audit logging
│   ├── database/             # Cloud SQL with backups
│   ├── secrets/              # Secret Manager configuration
│   ├── artifact_registry/    # Docker image repository
│   ├── cloud_run/           # Serverless application hosting
│   └── monitoring/          # Observability and alerting
├── environments/            # Environment-specific configs
│   └── production/         # Production environment
│       ├── main.tf         # Environment main config
│       └── terraform.tfvars # Variable values
└── scripts/                # Deployment automation
    ├── setup-terraform-backend.sh
    ├── setup-secrets.sh
    └── deploy.sh
```

## Quick Start

1. **Setup Infrastructure**:
   ```bash
   ./scripts/setup-terraform-backend.sh
   ```

2. **Configure Secrets**:
   ```bash
   ./scripts/setup-secrets.sh
   ```

3. **Deploy**:
   ```bash
   ./scripts/deploy.sh production
   ```

## Architecture

The infrastructure includes:

- **Networking**: VPC with private subnets, Cloud NAT, firewalls
- **Security**: IAM roles, KMS encryption, audit logging
- **Database**: Cloud SQL PostgreSQL with read replica
- **Application**: Cloud Run with auto-scaling
- **Storage**: Artifact Registry for containers
- **Monitoring**: Comprehensive observability stack
- **Secrets**: Google Secret Manager for sensitive data

## Security Features

- Private IP addresses for all internal communication
- KMS encryption for data at rest
- SSL/TLS everywhere
- Cloud Armor DDoS protection
- Binary Authorization for container security
- Comprehensive audit logging
- Least-privilege IAM policies

## Cost Optimization

- Auto-scaling Cloud Run instances
- Committed use discounts
- Lifecycle policies for storage
- Budget alerts and monitoring
- Resource rightsizing recommendations

## Compliance

- 7-year audit log retention for financial compliance
- Encrypted backups with cross-region replication
- GDPR-ready data governance
- SOC 2 Type II compatible configurations

For detailed documentation, see `../docs/GCP_INFRASTRUCTURE_GUIDE.md`.