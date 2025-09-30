# C12USD Production Environment - Terraform Variables
# WARNING: This file contains production configuration. Handle with care.

# Project Configuration
project_id      = "c12ai-dao"
project_name    = "c12usd"
organization_id = ""  # Not using organization
environment     = "production"

# Regional Configuration
region = "us-central1"
zone   = "us-central1-a"

# Network Configuration
subnet_cidr    = "10.0.0.0/24"
services_cidr  = "10.1.0.0/24"
pods_cidr      = "10.2.0.0/16"
connector_cidr = "10.8.0.0/28"

# Security Configuration - Current network access
office_cidr = "172.59.187.18/32"  # Current IP address
vpn_cidr    = "172.59.187.18/32"  # Same as office for now

# Cloud SQL Configuration - Production Ready
database_version          = "POSTGRES_16"
database_tier            = "db-perf-optimized-N-2"  # Performance optimized for production
database_disk_size       = 500                 # 500GB for production
database_disk_type       = "PD_SSD"
enable_high_availability = true
backup_start_time        = "03:00"

# Cloud Run Configuration - Production Ready
cloud_run_cpu          = "4"
cloud_run_memory       = "4Gi"
cloud_run_min_instances = 2
cloud_run_max_instances = 100
cloud_run_concurrency  = 1000
cloud_run_timeout      = 300

# Monitoring Configuration
log_retention_days  = 90
notification_email  = "vrdivebar@gmail.com"  # Monitoring alerts email

# Cost Optimization
enable_preemptible_instances   = false  # Disabled for production
enable_committed_use_discount  = true

# Application Configuration
cors_origins = [
  "https://app.c12usd.com",
  "https://c12usd.com"
]

rate_limit_max       = 1000
rate_limit_window_ms = 900000  # 15 minutes

# Blockchain Configuration (will be populated via Secret Manager)
bsc_rpc_url     = ""  # Will be set via Secret Manager
polygon_rpc_url = ""  # Will be set via Secret Manager

# Custom Domain Configuration
domain_name          = "api.c12usd.com"
ssl_certificate_name = ""

# Feature Flags
enable_audit_logs           = true
enable_vpc_flow_logs        = true
enable_binary_authorization = true
enable_workload_identity    = true