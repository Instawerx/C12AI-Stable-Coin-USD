# Variables for C12USD GCP Infrastructure

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "c12ai-dao"
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"

  validation {
    condition = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be one of: production, staging, development."
  }
}

variable "notification_channels" {
  description = "List of notification channels for monitoring alerts"
  type = list(object({
    display_name = string
    type         = string
    labels       = map(string)
  }))
  default = [
    {
      display_name = "Email Alerts"
      type         = "email"
      labels = {
        email_address = "alerts@c12usd.com"
      }
    }
  ]
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-7680"  # 2 vCPU, 7.5GB RAM - optimized for cost/performance
}

variable "db_disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 100
}

variable "db_backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 30
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 50
}

variable "cloud_run_min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 1
}

variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run service"
  type        = string
  default     = "2"
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run service"
  type        = string
  default     = "2Gi"
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for critical resources"
  type        = bool
  default     = true
}

variable "enable_audit_logs" {
  description = "Enable audit logging for compliance"
  type        = bool
  default     = true
}

variable "budget_amount" {
  description = "Monthly budget amount in USD"
  type        = number
  default     = 1000
}

variable "budget_alert_thresholds" {
  description = "Budget alert thresholds as percentages"
  type        = list(number)
  default     = [0.5, 0.75, 0.9, 1.0]
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access resources"
  type        = list(string)
  default     = ["0.0.0.0/0"]  # Will be restricted in production
}

variable "ssl_policy_min_tls_version" {
  description = "Minimum TLS version for SSL policy"
  type        = string
  default     = "TLS_1_2"
}

variable "dns_zone_name" {
  description = "Cloud DNS zone name"
  type        = string
  default     = "c12usd-com"
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "c12usd.com"
}

variable "api_domain_name" {
  description = "API domain name"
  type        = string
  default     = "api.c12usd.com"
}

# Security Configuration
variable "enable_cloud_armor" {
  description = "Enable Cloud Armor DDoS protection"
  type        = bool
  default     = true
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs for network monitoring"
  type        = bool
  default     = true
}

variable "enable_private_google_access" {
  description = "Enable Private Google Access for subnets"
  type        = bool
  default     = true
}

# Cost Optimization
variable "preemptible_instances" {
  description = "Use preemptible instances where possible"
  type        = bool
  default     = false  # false for production
}

variable "enable_committed_use_discount" {
  description = "Enable committed use discounts for predictable workloads"
  type        = bool
  default     = true
}

# Backup and Disaster Recovery
variable "enable_cross_region_backup" {
  description = "Enable cross-region backup for disaster recovery"
  type        = bool
  default     = true
}

variable "backup_region" {
  description = "Region for cross-region backups"
  type        = string
  default     = "us-east1"
}

# Secrets Configuration
variable "secret_replication_policy" {
  description = "Secret Manager replication policy"
  type        = string
  default     = "automatic"

  validation {
    condition     = contains(["automatic", "user-managed"], var.secret_replication_policy)
    error_message = "Secret replication policy must be 'automatic' or 'user-managed'."
  }
}

# Monitoring and Alerting
variable "log_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 90
}

variable "enable_slo_monitoring" {
  description = "Enable SLO monitoring and alerting"
  type        = bool
  default     = true
}

variable "slo_availability_target" {
  description = "SLO availability target (e.g., 0.999 for 99.9%)"
  type        = number
  default     = 0.999
}

variable "slo_latency_target_ms" {
  description = "SLO latency target in milliseconds"
  type        = number
  default     = 500
}