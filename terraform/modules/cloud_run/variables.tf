# Variables for cloud run module

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

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "service_account_email" {
  description = "Service account email for Cloud Run"
  type        = string
}

variable "vpc_connector_id" {
  description = "VPC connector ID for private connectivity"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "cloud_sql_instance" {
  description = "Cloud SQL instance connection name"
  type        = string
  default     = ""
}

variable "cpu" {
  description = "CPU allocation for containers"
  type        = string
  default     = "2"
}

variable "memory" {
  description = "Memory allocation for containers"
  type        = string
  default     = "2Gi"
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = string
  default     = "50"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = string
  default     = "1"
}

variable "container_concurrency" {
  description = "Maximum number of concurrent requests per container"
  type        = number
  default     = 1000
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated requests"
  type        = bool
  default     = true
}

variable "custom_domain" {
  description = "Custom domain for the service"
  type        = string
  default     = null
}

variable "enable_cdn" {
  description = "Enable Cloud CDN"
  type        = bool
  default     = true
}

variable "security_policy_id" {
  description = "Security policy ID for DDoS protection"
  type        = string
  default     = null
}

variable "custom_request_headers" {
  description = "Custom request headers"
  type        = list(string)
  default     = []
}

variable "custom_response_headers" {
  description = "Custom response headers"
  type        = list(string)
  default     = []
}