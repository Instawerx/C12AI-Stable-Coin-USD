# Variables for database module

variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
}

variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
}

variable "db_instance_name" {
  description = "Name of the Cloud SQL instance"
  type        = string
}

variable "vpc_network_id" {
  description = "VPC network ID for private connection"
  type        = string
}

variable "subnet_id" {
  description = "Subnet ID for database placement"
  type        = string
}

variable "db_name_prod" {
  description = "Name of the production database"
  type        = string
}

variable "db_name_shadow" {
  description = "Name of the shadow database"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-7680"
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

variable "enable_deletion_protection" {
  description = "Enable deletion protection for Cloud SQL instance"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
  default     = null
}

variable "notification_channels" {
  description = "List of notification channels for monitoring alerts"
  type        = list(string)
  default     = []
}

variable "module_depends_on" {
  description = "List of resources this module depends on"
  type        = list(any)
  default     = []
}