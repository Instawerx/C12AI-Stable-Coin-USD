# C12USD Stablecoin - Production Environment Configuration
# Terraform variables for production deployment

# Project Configuration
project_id   = "c12ai-dao"  # Actual GCP project ID
project_name = "c12usd"
environment  = "production"

# Regional Configuration
region = "us-central1"
zone   = "us-central1-a"

# Network Configuration
subnet_cidr    = "10.0.0.0/24"
services_cidr  = "10.1.0.0/24"
pods_cidr      = "10.2.0.0/16"
connector_cidr = "10.8.0.0/28"

# Security Configuration (strict for production)
office_cidr = "203.0.113.0/24"  # Replace with your office CIDR
vpn_cidr    = "198.51.100.0/24" # Replace with your VPN CIDR

# Database Configuration - Production grade with high availability
database_version   = "POSTGRES_16"
database_tier      = "db-custom-4-16384"  # 4 vCPU, 16GB RAM
database_disk_size = 500                   # 500GB for production
database_disk_type = "PD_SSD"
enable_high_availability = true           # Enable HA for production
backup_start_time = "03:00"

# Cloud Run Configuration - Production resources
cloud_run_cpu                = "4"
cloud_run_memory            = "4Gi"
cloud_run_min_instances     = 2        # Always keep 2 instances warm
cloud_run_max_instances     = 100
cloud_run_concurrency       = 1000
cloud_run_timeout           = 300

# Monitoring Configuration
log_retention_days   = 90    # 90 days for production compliance
notification_email   = "vrdivebar@gmail.com"  # Actual notification email

# Cost Optimization for Production
enable_preemptible_instances    = false  # Use stable instances for production
enable_committed_use_discount   = true   # Enable for cost savings

# Application Configuration
cors_origins = [
  "https://app.c12usd.com",
  "https://c12usd.com",
  "https://www.c12usd.com"
]

rate_limit_max       = 2000
rate_limit_window_ms = 900000  # 15 minutes

# Blockchain Configuration (mainnet endpoints)
bsc_rpc_url     = "https://bsc-dataseed1.binance.org/"
polygon_rpc_url = "https://polygon-rpc.com/"

# Domain Configuration
domain_name           = "api.c12usd.com"  # Set your production domain
ssl_certificate_name  = ""                # Use managed certificate

# Feature Flags - All security features enabled for production
enable_audit_logs           = true
enable_vpc_flow_logs        = true
enable_binary_authorization = true
enable_workload_identity    = true

# Organization ID (required for production security features)
organization_id = "123456789012"  # Replace with your organization ID

# PGP Public Key for Binary Authorization
pgp_public_key = <<EOT
-----BEGIN PGP PUBLIC KEY BLOCK-----
# Replace with your actual PGP public key for container signing
# This should be the public key corresponding to the private key used
# for signing container images in your CI/CD pipeline
EOT