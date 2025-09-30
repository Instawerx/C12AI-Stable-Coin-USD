# C12USD Stablecoin - Terraform Variables
# Production-ready variable definitions with secure defaults

# Project Configuration
variable "project_id" {
  description = "The GCP project ID"
  type        = string
  validation {
    condition     = length(var.project_id) > 0
    error_message = "Project ID cannot be empty."
  }
}

variable "project_name" {
  description = "The project name used for resource naming"
  type        = string
  default     = "c12usd"
  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.project_name))
    error_message = "Project name must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "organization_id" {
  description = "The GCP organization ID"
  type        = string
}

# Environment Configuration
variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

# Regional Configuration
variable "region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
  validation {
    condition = contains([
      "us-central1", "us-east1", "us-west1", "us-west2", "us-west3", "us-west4",
      "europe-west1", "europe-west2", "europe-west3", "europe-west4", "europe-west6",
      "asia-east1", "asia-northeast1", "asia-southeast1"
    ], var.region)
    error_message = "Region must be a valid GCP region."
  }
}

variable "zone" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-a"
}

# Network Configuration
variable "subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.0.0/24"
  validation {
    condition     = can(cidrhost(var.subnet_cidr, 0))
    error_message = "Subnet CIDR must be a valid CIDR block."
  }
}

variable "services_cidr" {
  description = "CIDR block for Kubernetes services"
  type        = string
  default     = "10.1.0.0/24"
}

variable "pods_cidr" {
  description = "CIDR block for Kubernetes pods"
  type        = string
  default     = "10.2.0.0/16"
}

variable "connector_cidr" {
  description = "CIDR block for VPC Access Connector"
  type        = string
  default     = "10.8.0.0/28"
  validation {
    condition     = can(cidrhost(var.connector_cidr, 0))
    error_message = "Connector CIDR must be a valid CIDR block."
  }
}

# Security Configuration
variable "office_cidr" {
  description = "CIDR block for office network access"
  type        = string
  default     = "203.0.113.0/24"  # Example IP range - replace with actual
}

variable "vpn_cidr" {
  description = "CIDR block for VPN access"
  type        = string
  default     = "198.51.100.0/24"  # Example IP range - replace with actual
}

variable "pgp_public_key" {
  description = "PGP public key for binary authorization"
  type        = string
  default     = ""
}

# Cloud SQL Configuration
variable "database_version" {
  description = "PostgreSQL version for Cloud SQL"
  type        = string
  default     = "POSTGRES_16"
  validation {
    condition     = contains(["POSTGRES_13", "POSTGRES_14", "POSTGRES_15", "POSTGRES_16"], var.database_version)
    error_message = "Database version must be a supported PostgreSQL version."
  }
}

variable "database_tier" {
  description = "Machine type for Cloud SQL instance"
  type        = string
  default     = "db-custom-2-4096"  # 2 vCPU, 4GB RAM for staging
}

variable "database_disk_size" {
  description = "Disk size in GB for Cloud SQL"
  type        = number
  default     = 100
  validation {
    condition     = var.database_disk_size >= 10 && var.database_disk_size <= 65536
    error_message = "Database disk size must be between 10 and 65536 GB."
  }
}

variable "database_disk_type" {
  description = "Disk type for Cloud SQL"
  type        = string
  default     = "PD_SSD"
  validation {
    condition     = contains(["PD_SSD", "PD_HDD"], var.database_disk_type)
    error_message = "Database disk type must be either PD_SSD or PD_HDD."
  }
}

variable "enable_high_availability" {
  description = "Enable high availability for Cloud SQL"
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Start time for automated backups (HH:MM format)"
  type        = string
  default     = "03:00"
  validation {
    condition     = can(regex("^([01]?[0-9]|2[0-3]):[0-5][0-9]$", var.backup_start_time))
    error_message = "Backup start time must be in HH:MM format."
  }
}

# Cloud Run Configuration
variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run service"
  type        = string
  default     = "2"
  validation {
    condition     = contains(["1", "2", "4", "6", "8"], var.cloud_run_cpu)
    error_message = "Cloud Run CPU must be one of: 1, 2, 4, 6, 8."
  }
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run service"
  type        = string
  default     = "2Gi"
  validation {
    condition     = can(regex("^[1-9][0-9]*[GM]i$", var.cloud_run_memory))
    error_message = "Cloud Run memory must be in format like '2Gi' or '512Mi'."
  }
}

variable "cloud_run_min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 1
  validation {
    condition     = var.cloud_run_min_instances >= 0 && var.cloud_run_min_instances <= 1000
    error_message = "Minimum instances must be between 0 and 1000."
  }
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 100
  validation {
    condition     = var.cloud_run_max_instances >= 1 && var.cloud_run_max_instances <= 1000
    error_message = "Maximum instances must be between 1 and 1000."
  }
}

variable "cloud_run_concurrency" {
  description = "Maximum number of concurrent requests per instance"
  type        = number
  default     = 1000
  validation {
    condition     = var.cloud_run_concurrency >= 1 && var.cloud_run_concurrency <= 1000
    error_message = "Concurrency must be between 1 and 1000."
  }
}

variable "cloud_run_timeout" {
  description = "Request timeout for Cloud Run service in seconds"
  type        = number
  default     = 300
  validation {
    condition     = var.cloud_run_timeout >= 1 && var.cloud_run_timeout <= 3600
    error_message = "Timeout must be between 1 and 3600 seconds."
  }
}

# Monitoring and Logging Configuration
variable "log_retention_days" {
  description = "Log retention period in days"
  type        = number
  default     = 30
  validation {
    condition     = var.log_retention_days >= 1 && var.log_retention_days <= 3653
    error_message = "Log retention must be between 1 and 3653 days."
  }
}

variable "notification_email" {
  description = "Email address for monitoring notifications"
  type        = string
  default     = ""
  validation {
    condition     = var.notification_email == "" || can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.notification_email))
    error_message = "Notification email must be a valid email address or empty."
  }
}

# Cost Optimization Configuration
variable "enable_preemptible_instances" {
  description = "Enable preemptible instances for cost optimization (staging only)"
  type        = bool
  default     = false
}

variable "enable_committed_use_discount" {
  description = "Enable committed use discount for production"
  type        = bool
  default     = true
}

# Application Configuration
variable "cors_origins" {
  description = "Allowed CORS origins"
  type        = list(string)
  default = [
    "https://app.c12usd.com",
    "https://c12usd.com"
  ]
}

variable "rate_limit_max" {
  description = "Maximum requests per window"
  type        = number
  default     = 1000
  validation {
    condition     = var.rate_limit_max >= 1
    error_message = "Rate limit max must be at least 1."
  }
}

variable "rate_limit_window_ms" {
  description = "Rate limit window in milliseconds"
  type        = number
  default     = 900000  # 15 minutes
  validation {
    condition     = var.rate_limit_window_ms >= 1000
    error_message = "Rate limit window must be at least 1000ms."
  }
}

# Blockchain Configuration
variable "bsc_rpc_url" {
  description = "Binance Smart Chain RPC URL"
  type        = string
  default     = ""
  sensitive   = true
}

variable "polygon_rpc_url" {
  description = "Polygon RPC URL"
  type        = string
  default     = ""
  sensitive   = true
}

# Custom Domain Configuration
variable "domain_name" {
  description = "Custom domain name for the application"
  type        = string
  default     = ""
}

variable "ssl_certificate_name" {
  description = "Name of the SSL certificate"
  type        = string
  default     = ""
}

# Feature Flags
variable "enable_audit_logs" {
  description = "Enable audit logging"
  type        = bool
  default     = true
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC flow logs"
  type        = bool
  default     = true
}

variable "enable_binary_authorization" {
  description = "Enable binary authorization for container security"
  type        = bool
  default     = true
}

variable "enable_workload_identity" {
  description = "Enable workload identity for enhanced security"
  type        = bool
  default     = true
}