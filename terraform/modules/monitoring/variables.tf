# Variables for monitoring module

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

variable "cloud_run_service_name" {
  description = "Name of the Cloud Run service to monitor"
  type        = string
}

variable "cloud_sql_instance_id" {
  description = "ID of the Cloud SQL instance to monitor"
  type        = string
}

variable "notification_channels" {
  description = "List of notification channels for alerts"
  type        = list(string)
  default     = []
}

variable "billing_account_id" {
  description = "Billing account ID for budget alerts"
  type        = string
  default     = ""
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

variable "slack_webhook_url" {
  description = "Slack webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
}

variable "discord_webhook_url" {
  description = "Discord webhook URL for notifications"
  type        = string
  default     = ""
  sensitive   = true
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

variable "domain_name" {
  description = "Domain name for uptime checks"
  type        = string
  default     = null
}