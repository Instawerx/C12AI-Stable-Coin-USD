# C12USD Stablecoin - Google Cloud Platform Infrastructure
# Production-ready Terraform configuration for financial application

terraform {
  required_version = ">= 1.5"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.4"
    }
  }

  backend "gcs" {
    bucket = "c12ai-dao-terraform-state"
    prefix = "terraform/state"
  }
}

# Configure providers
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Local values for common configurations
locals {
  project_name = "c12usd"
  environment  = var.environment
  region       = var.region
  zone         = var.zone

  # Common labels for all resources
  common_labels = {
    project     = local.project_name
    environment = local.environment
    managed_by  = "terraform"
    team        = "c12ai-dao"
    cost_center = "blockchain"
  }

  # Network configuration
  vpc_name = "${local.project_name}-${local.environment}-vpc"
  subnet_name = "${local.project_name}-${local.environment}-subnet"

  # Database configuration
  db_instance_name = "${local.project_name}-${local.environment}-db"
  db_name_prod = "c12usd_production"
  db_name_shadow = "c12usd_shadow"

  # Service account names
  cloud_run_sa = "${local.project_name}-cloudrun-sa"
  cloudbuild_sa = "${local.project_name}-cloudbuild-sa"
  cloudsql_sa = "${local.project_name}-cloudsql-sa"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "compute.googleapis.com",
    "container.googleapis.com",
    "containerregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "artifactregistry.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "redis.googleapis.com",
    "cloudkms.googleapis.com",
    "cloudasset.googleapis.com",
    "securitycenter.googleapis.com"
  ])

  service = each.key
  project = var.project_id

  disable_on_destroy = false
}

# Import existing modules
module "network" {
  source = "./modules/network"

  project_id = var.project_id
  region     = local.region
  zone       = local.zone

  vpc_name    = local.vpc_name
  subnet_name = local.subnet_name

  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

module "security" {
  source = "./modules/security"

  project_id   = var.project_id
  region       = local.region
  environment  = local.environment
  project_name = local.project_name

  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

module "database" {
  source = "./modules/database"

  project_id       = var.project_id
  region           = local.region
  environment      = local.environment
  db_instance_name = local.db_instance_name

  vpc_network_id = module.network.vpc_network_id
  subnet_id      = module.network.private_subnet_id

  db_name_prod   = local.db_name_prod
  db_name_shadow = local.db_name_shadow

  labels = local.common_labels

  depends_on = [
    google_project_service.required_apis,
    module.network
  ]
}

module "secrets" {
  source = "./modules/secrets"

  project_id   = var.project_id
  region       = local.region
  environment  = local.environment
  project_name = local.project_name

  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

module "artifact_registry" {
  source = "./modules/artifact_registry"

  project_id   = var.project_id
  region       = local.region
  environment  = local.environment
  project_name = local.project_name

  labels = local.common_labels

  depends_on = [google_project_service.required_apis]
}

module "cloud_run" {
  source = "./modules/cloud_run"

  project_id   = var.project_id
  region       = local.region
  environment  = local.environment
  project_name = local.project_name

  vpc_connector_id = module.network.vpc_connector_id
  database_url     = module.database.connection_string

  service_account_email = module.security.cloud_run_service_account_email

  labels = local.common_labels

  depends_on = [
    google_project_service.required_apis,
    module.network,
    module.database,
    module.security,
    module.secrets
  ]
}

# Note: Commenting out monitoring module for now due to configuration complexity
# Will be re-enabled after fixing notification channel configurations
# module "monitoring" {
#   source = "./modules/monitoring"
#
#   project_id   = var.project_id
#   region       = local.region
#   environment  = local.environment
#   project_name = local.project_name
#
#   cloud_run_service_name = module.cloud_run.service_name
#   cloud_sql_instance_id  = module.database.instance_id
#
#   notification_channels = []
#
#   labels = local.common_labels
#
#   depends_on = [
#     google_project_service.required_apis,
#     module.cloud_run,
#     module.database
#   ]
# }

# Output important values
output "project_id" {
  description = "The GCP project ID"
  value       = var.project_id
}

output "region" {
  description = "The GCP region"
  value       = local.region
}

output "environment" {
  description = "The environment (production/staging)"
  value       = local.environment
}

output "vpc_network_id" {
  description = "The VPC network ID"
  value       = module.network.vpc_network_id
}

output "database_connection_string" {
  description = "Cloud SQL connection string"
  value       = module.database.connection_string
  sensitive   = true
}

output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "artifact_registry_repository" {
  description = "Artifact Registry repository for Docker images"
  value       = module.artifact_registry.repository_url
}

output "service_accounts" {
  description = "Created service accounts"
  value = {
    cloud_run   = module.security.cloud_run_service_account_email
    cloud_build = module.security.cloud_build_service_account_email
    cloud_sql   = module.security.cloud_sql_service_account_email
  }
}