# C12USD Stablecoin - Staging Environment Configuration
# Terraform variables for staging deployment

# Project Configuration
project_id   = "c12ai-dao"  # Using existing C12AI DAO project
project_name = "c12usd"
environment  = "staging"

# Regional Configuration
region = "us-central1"
zone   = "us-central1-a"

# Network Configuration
subnet_cidr    = "10.0.0.0/24"
services_cidr  = "10.1.0.0/24"
pods_cidr      = "10.2.0.0/16"
connector_cidr = "10.8.0.0/28"

# Security Configuration (more relaxed for staging)
office_cidr = "203.0.113.0/24"  # Replace with your office CIDR
vpn_cidr    = "198.51.100.0/24" # Replace with your VPN CIDR

# Database Configuration - Smaller instance for cost optimization
database_version   = "POSTGRES_16"
database_tier      = "db-custom-1-3840"  # 1 vCPU, 3.75GB RAM
database_disk_size = 50                   # 50GB for staging
database_disk_type = "PD_SSD"
enable_high_availability = false         # Disable HA for cost savings
backup_start_time = "03:00"

# Cloud Run Configuration - Smaller resources
cloud_run_cpu                = "1"
cloud_run_memory            = "1Gi"
cloud_run_min_instances     = 0        # Scale to zero for cost savings
cloud_run_max_instances     = 10
cloud_run_concurrency       = 1000
cloud_run_timeout           = 300

# Monitoring Configuration
log_retention_days   = 7
notification_email   = "dev-team@c12usd.com"  # Replace with actual email

# Cost Optimization for Staging
enable_preemptible_instances    = true
enable_committed_use_discount   = false

# Application Configuration
cors_origins = [
  "https://staging.c12usd.com",
  "https://dev.c12usd.com",
  "http://localhost:3000",
  "http://localhost:3001"
]

rate_limit_max       = 500
rate_limit_window_ms = 900000  # 15 minutes

# Blockchain Configuration (testnet endpoints)
bsc_rpc_url     = "https://data-seed-prebsc-1-s1.binance.org:8545/"
polygon_rpc_url = "https://rpc-mumbai.maticvigil.com/"

# Domain Configuration (optional for staging)
domain_name           = ""  # Leave empty or set to staging domain
ssl_certificate_name  = ""

# Feature Flags - Enable all for testing
enable_audit_logs           = true
enable_vpc_flow_logs        = true
enable_binary_authorization = false  # Disabled for easier testing
enable_workload_identity    = true

# Organization ID (if applicable)
organization_id = ""  # Set if using organization-level policies