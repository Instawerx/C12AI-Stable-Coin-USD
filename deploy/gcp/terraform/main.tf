# C12USD Stablecoin - Google Cloud Platform Infrastructure
# Production-ready Terraform configuration with latest GCP best practices
# Version: 7.0+ compatible

terraform {
  required_version = ">= 1.10.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 7.0"
    }
  }

  # Remote state backend for production
  backend "gcs" {
    bucket  = "c12ai-dao-terraform-state"
    prefix  = "terraform/state"
  }
}

# Configure the Google Cloud Provider with latest features
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  # Enable write-only attributes for enhanced security (v7.0 feature)
  default_labels = {
    project     = "c12usd-stablecoin"
    environment = var.environment
    managed-by  = "terraform"
    team        = "c12ai-dao"
  }
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Local values for resource naming and configuration
locals {
  name_prefix = "${var.project_name}-${var.environment}"

  # Common labels for all resources
  common_labels = {
    project     = var.project_name
    environment = var.environment
    managed-by  = "terraform"
    team        = "c12ai-dao"
    cost-center = "engineering"
  }

  # Network and security configurations
  authorized_networks = var.environment == "production" ? [
    {
      name  = "office-network"
      value = var.office_cidr
    },
    {
      name  = "vpn-network"
      value = var.vpn_cidr
    }
  ] : [
    {
      name  = "development-all"
      value = "0.0.0.0/0"
    }
  ]
}

# Data sources for existing resources
data "google_project" "current" {}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "vpcaccess.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudkms.googleapis.com",
    "cloudasset.googleapis.com",
    "securitycenter.googleapis.com",
    "binaryauthorization.googleapis.com"
  ])

  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy        = false
}

# VPC Network for enhanced security
resource "google_compute_network" "vpc_network" {
  name                    = "${local.name_prefix}-vpc"
  auto_create_subnetworks = false
  mtu                     = 1460

  depends_on = [google_project_service.required_apis]
}

# Subnet for Cloud Run and other services
resource "google_compute_subnetwork" "subnet" {
  name          = "${local.name_prefix}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc_network.id

  # Private Google Access for secure communication
  private_ip_google_access = true

  # Secondary IP ranges for GKE (if needed in future)
  secondary_ip_range {
    range_name    = "services-range"
    ip_cidr_range = var.services_cidr
  }

  secondary_ip_range {
    range_name    = "pods-range"
    ip_cidr_range = var.pods_cidr
  }
}

# Cloud Router for NAT gateway
resource "google_compute_router" "router" {
  name    = "${local.name_prefix}-router"
  region  = var.region
  network = google_compute_network.vpc_network.id
}

# NAT gateway for outbound internet access
resource "google_compute_router_nat" "nat" {
  name                               = "${local.name_prefix}-nat"
  router                             = google_compute_router.router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

# VPC Access Connector for Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "${local.name_prefix}-connector"
  region        = var.region
  ip_cidr_range = var.connector_cidr
  network       = google_compute_network.vpc_network.name

  # Use latest machine type for better performance
  machine_type   = "e2-standard-4"
  min_instances  = var.environment == "production" ? 2 : 1
  max_instances  = var.environment == "production" ? 10 : 3

  depends_on = [google_project_service.required_apis]
}

# Private Service Connection for Cloud SQL
resource "google_compute_global_address" "private_ip_address" {
  name          = "${local.name_prefix}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

# Cloud KMS for encryption keys
resource "google_kms_key_ring" "keyring" {
  name     = "${local.name_prefix}-keyring"
  location = var.region

  depends_on = [google_project_service.required_apis]
}

resource "google_kms_crypto_key" "database_key" {
  name     = "database-encryption-key"
  key_ring = google_kms_key_ring.keyring.id
  purpose  = "ENCRYPT_DECRYPT"

  lifecycle {
    prevent_destroy = true
  }

  version_template {
    algorithm        = "GOOGLE_SYMMETRIC_ENCRYPTION"
    protection_level = "SOFTWARE"
  }

  rotation_period = "7776000s" # 90 days
}

# Artifact Registry for container images
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "${var.project_name}-repo"
  description   = "C12USD container repository"
  format        = "DOCKER"

  # Note: Cleanup policies can be configured manually post-deployment

  depends_on = [google_project_service.required_apis]
}

# Binary Authorization policy for container security
resource "google_binary_authorization_policy" "policy" {
  admission_whitelist_patterns {
    name_pattern = "gcr.io/my-project/*"
  }

  default_admission_rule {
    evaluation_mode         = "REQUIRE_ATTESTATION"
    enforcement_mode        = "ENFORCED_BLOCK_AND_AUDIT_LOG"
    require_attestations_by = [google_binary_authorization_attestor.attestor.name]
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_binary_authorization_attestor" "attestor" {
  name = "${local.name_prefix}-attestor"

  attestation_authority_note {
    note_reference = google_container_analysis_note.note.name

    public_keys {
      ascii_armored_pgp_public_key = var.pgp_public_key
    }
  }
}

resource "google_container_analysis_note" "note" {
  name = "${local.name_prefix}-attestor-note"

  attestation_authority {
    hint {
      human_readable_name = "C12USD Attestor"
    }
  }
}

# Security monitoring with Pub/Sub (without org-level SCC)
resource "google_pubsub_topic" "security_notifications" {
  name = "${local.name_prefix}-security-notifications"

  depends_on = [google_project_service.required_apis]
}