# C12USD Stablecoin - Terraform Outputs
# Comprehensive output values for deployment and monitoring

# Project Information
output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "project_name" {
  description = "The project name"
  value       = var.project_name
}

output "environment" {
  description = "The deployment environment"
  value       = var.environment
}

output "region" {
  description = "The deployment region"
  value       = var.region
}

# Network Information
output "vpc_network_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.vpc_network.id
}

output "vpc_network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.vpc_network.name
}

output "subnet_id" {
  description = "The ID of the subnet"
  value       = google_compute_subnetwork.subnet.id
}

output "subnet_cidr" {
  description = "The CIDR block of the subnet"
  value       = google_compute_subnetwork.subnet.ip_cidr_range
}

output "vpc_connector_id" {
  description = "The ID of the VPC Access Connector"
  value       = google_vpc_access_connector.connector.id
}

# Cloud SQL Information
output "database_instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.name
}

output "database_instance_connection_name" {
  description = "The connection name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.connection_name
}

output "database_private_ip" {
  description = "The private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
}

output "database_name" {
  description = "The name of the database"
  value       = google_sql_database.database.name
}

output "database_replica_connection_name" {
  description = "The connection name of the read replica (if exists)"
  value       = var.environment == "production" && length(google_sql_database_instance.read_replica) > 0 ? google_sql_database_instance.read_replica[0].connection_name : null
}

# Cloud Run Information
output "cloud_run_service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_v2_service.api.name
}

output "cloud_run_service_url" {
  description = "The URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.api.uri
}

output "cloud_run_service_location" {
  description = "The location of the Cloud Run service"
  value       = google_cloud_run_v2_service.api.location
}

output "custom_domain_url" {
  description = "The custom domain URL (if configured)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : null
}

# Service Accounts
output "cloud_run_service_account_email" {
  description = "The email of the Cloud Run service account"
  value       = google_service_account.cloud_run_sa.email
}

output "cicd_service_account_email" {
  description = "The email of the CI/CD service account"
  value       = google_service_account.cicd_sa.email
}

output "db_admin_service_account_email" {
  description = "The email of the database admin service account"
  value       = google_service_account.db_admin_sa.email
}

output "monitoring_service_account_email" {
  description = "The email of the monitoring service account"
  value       = google_service_account.monitoring_sa.email
}

# Secret Manager Information
output "database_url_secret_name" {
  description = "The name of the database URL secret"
  value       = google_secret_manager_secret.database_url.secret_id
}

output "bsc_rpc_secret_name" {
  description = "The name of the BSC RPC URL secret"
  value       = google_secret_manager_secret.bsc_rpc_url.secret_id
}

output "polygon_rpc_secret_name" {
  description = "The name of the Polygon RPC URL secret"
  value       = google_secret_manager_secret.polygon_rpc_url.secret_id
}

output "ops_signer_secret_name" {
  description = "The name of the operations signer private key secret"
  value       = google_secret_manager_secret.ops_signer_key.secret_id
}

output "jwt_secret_name" {
  description = "The name of the JWT secret"
  value       = google_secret_manager_secret.jwt_secret.secret_id
}

# Artifact Registry
output "artifact_registry_repository_name" {
  description = "The name of the Artifact Registry repository"
  value       = google_artifact_registry_repository.repo.name
}

output "artifact_registry_repository_location" {
  description = "The location of the Artifact Registry repository"
  value       = google_artifact_registry_repository.repo.location
}

output "container_image_uri_base" {
  description = "The base URI for container images"
  value       = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.name}"
}

# KMS Information
output "kms_key_ring_name" {
  description = "The name of the KMS key ring"
  value       = google_kms_key_ring.keyring.name
}

output "database_kms_key_name" {
  description = "The name of the database encryption KMS key"
  value       = google_kms_crypto_key.database_key.name
}

output "database_kms_key_id" {
  description = "The full resource ID of the database encryption KMS key"
  value       = google_kms_crypto_key.database_key.id
}

# Monitoring Information
output "monitoring_dashboard_id" {
  description = "The ID of the monitoring dashboard"
  value       = google_monitoring_dashboard.c12usd_dashboard.id
}

output "uptime_check_id" {
  description = "The ID of the uptime check"
  value       = google_monitoring_uptime_check_config.api_uptime.uptime_check_id
}

output "notification_channel_ids" {
  description = "The IDs of the notification channels"
  value = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])
}

# Storage Information
output "audit_logs_bucket_name" {
  description = "The name of the audit logs storage bucket"
  value       = google_storage_bucket.audit_logs.name
}

output "application_logs_bucket_name" {
  description = "The name of the application logs bucket"
  value       = google_logging_project_bucket_config.application_logs.bucket_id
}

# Security Information
output "binary_authorization_policy_name" {
  description = "The name of the binary authorization policy"
  value       = google_binary_authorization_policy.policy.admission_whitelist_patterns[0].name_pattern
}

output "attestor_name" {
  description = "The name of the binary authorization attestor"
  value       = google_binary_authorization_attestor.attestor.name
}

# Custom IAM Roles
output "cloud_run_deployer_role_id" {
  description = "The ID of the custom Cloud Run deployer role"
  value       = google_project_iam_custom_role.cloud_run_deployer.role_id
}

output "secret_manager_role_id" {
  description = "The ID of the custom secret manager role"
  value       = google_project_iam_custom_role.secret_manager.role_id
}

output "database_operator_role_id" {
  description = "The ID of the custom database operator role"
  value       = google_project_iam_custom_role.database_operator.role_id
}

# Cost Optimization Information
output "committed_use_discount_enabled" {
  description = "Whether committed use discount is enabled"
  value       = var.enable_committed_use_discount
}

output "preemptible_instances_enabled" {
  description = "Whether preemptible instances are enabled"
  value       = var.enable_preemptible_instances
}

# Deployment Information
output "deployment_timestamp" {
  description = "The timestamp of this deployment"
  value       = timestamp()
}

output "terraform_version" {
  description = "The version of Terraform used for this deployment"
  value       = "~> 1.10.0"
}

output "google_provider_version" {
  description = "The version of the Google provider used"
  value       = "~> 7.0"
}

# SSL Certificate Information (if using managed certificates)
output "ssl_certificate_name" {
  description = "The name of the managed SSL certificate"
  value       = var.domain_name != "" && var.ssl_certificate_name == "" && length(google_compute_managed_ssl_certificate.ssl_cert) > 0 ? google_compute_managed_ssl_certificate.ssl_cert[0].name : var.ssl_certificate_name
}

# Connection Information for Applications
output "connection_info" {
  description = "Connection information for applications and CI/CD"
  value = {
    cloud_run_url              = google_cloud_run_v2_service.api.uri
    custom_domain              = var.domain_name != "" ? "https://${var.domain_name}" : null
    database_connection_name   = google_sql_database_instance.main.connection_name
    container_registry        = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.name}"
    service_account_email     = google_service_account.cicd_sa.email
    monitoring_dashboard_url  = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.c12usd_dashboard.id}?project=${var.project_id}"
    region                    = var.region
    environment               = var.environment
  }
}

# Resource Names for External Scripts
output "resource_names" {
  description = "Resource names for use in external scripts and documentation"
  value = {
    vpc_network           = google_compute_network.vpc_network.name
    subnet               = google_compute_subnetwork.subnet.name
    cloud_run_service    = google_cloud_run_v2_service.api.name
    database_instance    = google_sql_database_instance.main.name
    database_name        = google_sql_database.database.name
    kms_keyring          = google_kms_key_ring.keyring.name
    artifact_registry    = google_artifact_registry_repository.repo.name
    audit_logs_bucket    = google_storage_bucket.audit_logs.name
  }
}

# Security and Compliance Outputs
output "security_features_enabled" {
  description = "List of enabled security features"
  value = {
    binary_authorization     = var.enable_binary_authorization
    workload_identity       = var.enable_workload_identity
    audit_logs             = var.enable_audit_logs
    vpc_flow_logs          = var.enable_vpc_flow_logs
    customer_managed_keys  = true
    private_networking     = true
    ssl_enforcement        = true
    iam_conditions         = var.environment == "production"
  }
}