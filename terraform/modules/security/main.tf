# Security module for C12USD - IAM roles, service accounts, and security policies

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "${var.project_name}-${var.environment}-cloudrun"
  display_name = "C12USD Cloud Run Service Account"
  description  = "Service account for Cloud Run services"
}

# Service account for Cloud Build
resource "google_service_account" "cloud_build" {
  account_id   = "${var.project_name}-${var.environment}-cloudbuild"
  display_name = "C12USD Cloud Build Service Account"
  description  = "Service account for Cloud Build pipelines"
}

# Service account for Cloud SQL operations
resource "google_service_account" "cloud_sql" {
  account_id   = "${var.project_name}-${var.environment}-cloudsql"
  display_name = "C12USD Cloud SQL Service Account"
  description  = "Service account for Cloud SQL operations"
}

# Service account for monitoring and logging
resource "google_service_account" "monitoring" {
  account_id   = "${var.project_name}-${var.environment}-monitoring"
  display_name = "C12USD Monitoring Service Account"
  description  = "Service account for monitoring and logging operations"
}

# IAM roles for Cloud Run service account
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_storage_object_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_logging_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_monitoring_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "cloud_run_trace_agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# IAM roles for Cloud Build service account
resource "google_project_iam_member" "cloud_build_editor" {
  project = var.project_id
  role    = "roles/editor"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_project_iam_member" "cloud_build_artifact_registry_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_project_iam_member" "cloud_build_cloud_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_project_iam_member" "cloud_build_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

resource "google_project_iam_member" "cloud_build_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.cloud_build.email}"
}

# IAM roles for Cloud SQL service account
resource "google_project_iam_member" "cloud_sql_admin" {
  project = var.project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${google_service_account.cloud_sql.email}"
}

resource "google_project_iam_member" "cloud_sql_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.cloud_sql.email}"
}

# IAM roles for monitoring service account
resource "google_project_iam_member" "monitoring_admin" {
  project = var.project_id
  role    = "roles/monitoring.admin"
  member  = "serviceAccount:${google_service_account.monitoring.email}"
}

resource "google_project_iam_member" "monitoring_logging_admin" {
  project = var.project_id
  role    = "roles/logging.admin"
  member  = "serviceAccount:${google_service_account.monitoring.email}"
}

# Custom IAM role for restricted operations
resource "google_project_iam_custom_role" "c12usd_app_role" {
  role_id     = "c12usdAppRole"
  title       = "C12USD Application Role"
  description = "Custom role for C12USD application with minimal required permissions"

  permissions = [
    "secretmanager.versions.access",
    "cloudsql.instances.connect",
    "storage.objects.get",
    "storage.objects.list",
    "monitoring.timeSeries.create",
    "logging.logEntries.create",
    "cloudtrace.traces.patch",
  ]
}

# Bind custom role to Cloud Run service account
resource "google_project_iam_member" "cloud_run_custom_role" {
  project = var.project_id
  role    = google_project_iam_custom_role.c12usd_app_role.id
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Organization policy constraints
resource "google_org_policy_policy" "disable_service_account_key_creation" {
  count = var.enable_org_policies ? 1 : 0

  name   = "projects/${var.project_id}/policies/iam.disableServiceAccountKeyCreation"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      enforce = "TRUE"
    }
  }
}

resource "google_org_policy_policy" "require_shielded_vm" {
  count = var.enable_org_policies ? 1 : 0

  name   = "projects/${var.project_id}/policies/compute.requireShieldedVm"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      enforce = "TRUE"
    }
  }
}

resource "google_org_policy_policy" "restrict_public_ip" {
  count = var.enable_org_policies ? 1 : 0

  name   = "projects/${var.project_id}/policies/compute.vmExternalIpAccess"
  parent = "projects/${var.project_id}"

  spec {
    rules {
      deny_all = "TRUE"
    }
  }
}

# Security Command Center notifications
# Note: This resource type is not supported in the current provider version
# resource "google_security_center_notification_config" "basic" {
#   config_id    = "c12usd-security-notifications"
#   organization = var.organization_id
#   description  = "Security notifications for C12USD project"
#   pubsub_topic = "projects/${var.project_id}/topics/security-notifications"

#
#   streaming_config {
#     filter = "category=\"MALWARE\" OR category=\"NETWORK_CONNECTION_ANOMALY\" OR category=\"POLICY_VIOLATION\""
#   }
# }

# Create Pub/Sub topic for security notifications
resource "google_pubsub_topic" "security_notifications" {
  name = "security-notifications"

  labels = var.labels
}

# IAM binding for security notifications
resource "google_pubsub_topic_iam_binding" "security_notifications" {
  topic = google_pubsub_topic.security_notifications.name
  role  = "roles/pubsub.subscriber"

  members = [
    "serviceAccount:${google_service_account.monitoring.email}",
  ]
}

# Binary Authorization policy for container security
resource "google_binary_authorization_policy" "policy" {
  admission_whitelist_patterns {
    name_pattern = "${var.region}-docker.pkg.dev/${var.project_id}/${var.project_name}-repo/*"
  }

  default_admission_rule {
    evaluation_mode  = "REQUIRE_ATTESTATION"
    enforcement_mode = "ENFORCED_BLOCK_AND_AUDIT_LOG"

    require_attestations_by = [
      google_binary_authorization_attestor.attestor.name,
    ]
  }

  # Allow Google Cloud Build images
  admission_whitelist_patterns {
    name_pattern = "gcr.io/cloud-builders/*"
  }
}

# Binary Authorization attestor
resource "google_binary_authorization_attestor" "attestor" {
  name = "${var.project_name}-attestor"

  attestation_authority_note {
    note_reference = google_container_analysis_note.note.name
  }
}

# Container Analysis note for attestation
resource "google_container_analysis_note" "note" {
  name = "${var.project_name}-attestor-note"

  attestation_authority {
    hint {
      human_readable_name = "C12USD Attestor"
    }
  }
}

# KMS key for encryption
resource "google_kms_key_ring" "main" {
  name     = "${var.project_name}-${var.environment}-keyring"
  location = var.region
}

resource "google_kms_crypto_key" "main" {
  name     = "${var.project_name}-${var.environment}-key"
  key_ring = google_kms_key_ring.main.id

  lifecycle {
    prevent_destroy = true
  }

  labels = var.labels
}

# IAM binding for KMS key
resource "google_kms_crypto_key_iam_binding" "crypto_key" {
  crypto_key_id = google_kms_crypto_key.main.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"

  members = [
    "serviceAccount:${google_service_account.cloud_run.email}",
    "serviceAccount:${google_service_account.cloud_build.email}",
    "serviceAccount:service-${data.google_project.current.number}@gs-project-accounts.iam.gserviceaccount.com",
  ]
}

# Get current project
data "google_project" "current" {}

# Audit logging configuration
resource "google_logging_project_sink" "audit_sink" {
  name                   = "${var.project_name}-audit-sink"
  destination            = "storage.googleapis.com/${google_storage_bucket.audit_logs.name}"
  filter                 = "logName=\"projects/${var.project_id}/logs/cloudaudit.googleapis.com%2Factivity\" OR logName=\"projects/${var.project_id}/logs/cloudaudit.googleapis.com%2Fdata_access\""
  unique_writer_identity = true
}

# Storage bucket for audit logs
resource "google_storage_bucket" "audit_logs" {
  name          = "${var.project_id}-${var.environment}-audit-logs"
  location      = var.region
  force_destroy = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 2555  # 7 years for financial compliance
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age = 365  # 1 year
    }
    action {
      type = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  uniform_bucket_level_access = true

  encryption {
    default_kms_key_name = google_kms_crypto_key.main.id
  }

  labels = merge(var.labels, {
    purpose = "audit-logs"
  })
}

# IAM binding for audit log sink
resource "google_storage_bucket_iam_member" "audit_logs_writer" {
  bucket = google_storage_bucket.audit_logs.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.audit_sink.writer_identity
}

# Output values
output "cloud_run_service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}

output "cloud_build_service_account_email" {
  description = "Email of the Cloud Build service account"
  value       = google_service_account.cloud_build.email
}

output "cloud_sql_service_account_email" {
  description = "Email of the Cloud SQL service account"
  value       = google_service_account.cloud_sql.email
}

output "monitoring_service_account_email" {
  description = "Email of the monitoring service account"
  value       = google_service_account.monitoring.email
}

output "kms_key_id" {
  description = "ID of the KMS encryption key"
  value       = google_kms_crypto_key.main.id
}

output "security_policy_id" {
  description = "ID of the Binary Authorization policy"
  value       = google_binary_authorization_policy.policy.id
}

output "audit_logs_bucket" {
  description = "Name of the audit logs bucket"
  value       = google_storage_bucket.audit_logs.name
}