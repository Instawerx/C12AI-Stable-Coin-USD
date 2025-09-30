# Production environment configuration for C12USD

terraform {
  required_version = ">= 1.5"

  backend "gcs" {
    bucket = "c12ai-dao-terraform-state"
    prefix = "terraform/production/state"
  }
}

module "c12usd_production" {
  source = "../../"

  # Pass all variables to the root module
  project_id  = var.project_id
  region      = var.region
  zone        = var.zone
  environment = var.environment

  # Notification channels for production
  notification_channels = var.notification_channels

  # Production-specific overrides
  db_tier                     = var.db_tier
  db_disk_size                = var.db_disk_size
  db_backup_retention_days    = var.db_backup_retention_days
  cloud_run_max_instances     = var.cloud_run_max_instances
  cloud_run_min_instances     = var.cloud_run_min_instances
  cloud_run_cpu              = var.cloud_run_cpu
  cloud_run_memory           = var.cloud_run_memory
  enable_deletion_protection  = var.enable_deletion_protection
  enable_audit_logs          = var.enable_audit_logs
  budget_amount              = var.budget_amount
  budget_alert_thresholds    = var.budget_alert_thresholds
  allowed_ip_ranges          = var.allowed_ip_ranges
  ssl_policy_min_tls_version = var.ssl_policy_min_tls_version
  dns_zone_name              = var.dns_zone_name
  domain_name                = var.domain_name
  api_domain_name            = var.api_domain_name
  enable_cloud_armor         = var.enable_cloud_armor
  enable_vpc_flow_logs       = var.enable_vpc_flow_logs
  enable_private_google_access = var.enable_private_google_access
  preemptible_instances      = var.preemptible_instances
  enable_committed_use_discount = var.enable_committed_use_discount
  enable_cross_region_backup = var.enable_cross_region_backup
  backup_region              = var.backup_region
  secret_replication_policy  = var.secret_replication_policy
  log_retention_days         = var.log_retention_days
  enable_slo_monitoring      = var.enable_slo_monitoring
  slo_availability_target    = var.slo_availability_target
  slo_latency_target_ms      = var.slo_latency_target_ms
}

# Variables file reference for production
variable "project_id" { type = string }
variable "region" { type = string }
variable "zone" { type = string }
variable "environment" { type = string }
variable "notification_channels" { type = list(any) }
variable "db_tier" { type = string }
variable "db_disk_size" { type = number }
variable "db_backup_retention_days" { type = number }
variable "cloud_run_max_instances" { type = number }
variable "cloud_run_min_instances" { type = number }
variable "cloud_run_cpu" { type = string }
variable "cloud_run_memory" { type = string }
variable "enable_deletion_protection" { type = bool }
variable "enable_audit_logs" { type = bool }
variable "budget_amount" { type = number }
variable "budget_alert_thresholds" { type = list(number) }
variable "allowed_ip_ranges" { type = list(string) }
variable "ssl_policy_min_tls_version" { type = string }
variable "dns_zone_name" { type = string }
variable "domain_name" { type = string }
variable "api_domain_name" { type = string }
variable "enable_cloud_armor" { type = bool }
variable "enable_vpc_flow_logs" { type = bool }
variable "enable_private_google_access" { type = bool }
variable "preemptible_instances" { type = bool }
variable "enable_committed_use_discount" { type = bool }
variable "enable_cross_region_backup" { type = bool }
variable "backup_region" { type = string }
variable "secret_replication_policy" { type = string }
variable "log_retention_days" { type = number }
variable "enable_slo_monitoring" { type = bool }
variable "slo_availability_target" { type = number }
variable "slo_latency_target_ms" { type = number }

# Outputs
output "infrastructure_outputs" {
  description = "All infrastructure outputs"
  value       = module.c12usd_production
  sensitive   = true
}