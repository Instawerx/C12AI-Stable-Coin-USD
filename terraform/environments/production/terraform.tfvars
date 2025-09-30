# Production environment configuration for C12USD

# Project configuration
project_id  = "c12ai-dao"
region      = "us-central1"
zone        = "us-central1-a"
environment = "production"

# Domain configuration
domain_name     = "c12usd.com"
api_domain_name = "api.c12usd.com"

# Database configuration
db_tier                     = "db-custom-4-15360"  # 4 vCPU, 15GB RAM for production
db_disk_size                = 500                   # 500GB for production
db_backup_retention_days    = 30
enable_deletion_protection  = true

# Cloud Run configuration
cloud_run_max_instances = 100  # Higher for production traffic
cloud_run_min_instances = 2    # Always have instances ready
cloud_run_cpu          = "4"   # More CPU for production
cloud_run_memory       = "4Gi" # More memory for production

# Security configuration
enable_audit_logs         = true
enable_cloud_armor        = true
enable_vpc_flow_logs      = true
enable_private_google_access = true
ssl_policy_min_tls_version = "TLS_1_2"

# Budget and cost control
budget_amount = 2000  # $2000/month for production
budget_alert_thresholds = [0.5, 0.75, 0.9, 1.0]
enable_committed_use_discount = true
preemptible_instances = false  # No preemptible for production

# Backup and disaster recovery
enable_cross_region_backup = true
backup_region             = "us-east1"
secret_replication_policy = "automatic"

# DNS configuration
dns_zone_name = "c12usd-com"

# Monitoring and SLO
enable_slo_monitoring     = true
slo_availability_target   = 0.999  # 99.9% uptime
slo_latency_target_ms     = 200    # 200ms P95 latency
log_retention_days        = 90

# Notification channels (will be created separately)
notification_channels = [
  {
    display_name = "Production Email Alerts"
    type         = "email"
    labels = {
      email_address = "alerts@c12usd.com"
    }
  },
  {
    display_name = "Production Slack Alerts"
    type         = "slack"
    labels = {
      channel_name = "#alerts-production"
      webhook_url  = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    }
  }
]

# IP ranges (restrict in production)
allowed_ip_ranges = [
  "10.0.0.0/8",     # Private networks only
  "172.16.0.0/12",
  "192.168.0.0/16"
]