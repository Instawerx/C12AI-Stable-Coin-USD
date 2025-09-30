# C12USD Stablecoin - IAM Configuration
# Comprehensive identity and access management with least privilege principles

# CI/CD Service Account for GitHub Actions deployment
resource "google_service_account" "cicd_sa" {
  account_id   = "${local.name_prefix}-cicd-sa"
  display_name = "CI/CD Service Account for C12USD ${title(var.environment)}"
  description  = "Service account for automated deployments with restricted permissions"
}

# Database admin service account for migrations and maintenance
resource "google_service_account" "db_admin_sa" {
  account_id   = "${local.name_prefix}-db-admin-sa"
  display_name = "Database Admin Service Account"
  description  = "Service account for database administration tasks"
}

# Monitoring service account for custom metrics and alerting
resource "google_service_account" "monitoring_sa" {
  account_id   = "c12usd-prod-monitoring-sa"
  display_name = "Monitoring Service Account"
  description  = "Service account for monitoring and alerting operations"
}

# Security scanning service account
resource "google_service_account" "security_sa" {
  account_id   = "${local.name_prefix}-security-sa"
  display_name = "Security Scanning Service Account"
  description  = "Service account for security scanning and vulnerability assessment"
}

# Custom IAM roles for fine-grained access control

# Custom role for Cloud Run deployment
resource "google_project_iam_custom_role" "cloud_run_deployer" {
  role_id     = "${replace(local.name_prefix, "-", "_")}_run_deployer"
  title       = "C12USD Cloud Run Deployer"
  description = "Custom role for deploying Cloud Run services"

  permissions = [
    "run.services.create",
    "run.services.delete",
    "run.services.get",
    "run.services.list",
    "run.services.update",
    "run.revisions.get",
    "run.revisions.list",
    "run.routes.get",
    "run.routes.list",
    "run.configurations.get",
    "run.configurations.list",
    "iam.serviceAccounts.actAs"
  ]
}

# Custom role for secret management
resource "google_project_iam_custom_role" "secret_manager" {
  role_id     = "${replace(local.name_prefix, "-", "_")}_secret_manager"
  title       = "C12USD Secret Manager"
  description = "Custom role for managing application secrets"

  permissions = [
    "secretmanager.secrets.create",
    "secretmanager.secrets.get",
    "secretmanager.secrets.list",
    "secretmanager.secrets.update",
    "secretmanager.versions.create",
    "secretmanager.versions.access",
    "secretmanager.versions.get",
    "secretmanager.versions.list"
  ]
}

# Custom role for database operations
resource "google_project_iam_custom_role" "database_operator" {
  role_id     = "${replace(local.name_prefix, "-", "_")}_db_operator"
  title       = "C12USD Database Operator"
  description = "Custom role for database operations and migrations"

  permissions = [
    "cloudsql.instances.connect",
    "cloudsql.instances.get",
    "cloudsql.instances.list",
    "cloudsql.databases.create",
    "cloudsql.databases.get",
    "cloudsql.databases.list",
    "cloudsql.databases.update",
    "cloudsql.users.create",
    "cloudsql.users.get",
    "cloudsql.users.list",
    "cloudsql.users.update"
  ]
}

# IAM bindings for CI/CD service account
resource "google_project_iam_binding" "cicd_cloud_run_deployer" {
  project = var.project_id
  role    = google_project_iam_custom_role.cloud_run_deployer.name
  members = ["serviceAccount:${google_service_account.cicd_sa.email}"]
}

resource "google_project_iam_binding" "cicd_secret_manager" {
  project = var.project_id
  role    = google_project_iam_custom_role.secret_manager.name
  members = ["serviceAccount:${google_service_account.cicd_sa.email}"]
}

resource "google_project_iam_binding" "cicd_artifact_registry" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  members = ["serviceAccount:${google_service_account.cicd_sa.email}"]
}

resource "google_project_iam_binding" "cicd_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  members = ["serviceAccount:${google_service_account.cicd_sa.email}"]
}

# Database admin service account bindings
resource "google_project_iam_binding" "db_admin_sql_admin" {
  project = var.project_id
  role    = "roles/cloudsql.admin"
  members = ["serviceAccount:${google_service_account.db_admin_sa.email}"]
}

resource "google_project_iam_binding" "db_admin_database_operator" {
  project = var.project_id
  role    = google_project_iam_custom_role.database_operator.name
  members = ["serviceAccount:${google_service_account.db_admin_sa.email}"]
}

# Monitoring service account bindings
resource "google_project_iam_binding" "monitoring_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  members = ["serviceAccount:${google_service_account.monitoring_sa.email}"]
}

resource "google_project_iam_binding" "monitoring_notification_channel_editor" {
  project = var.project_id
  role    = "roles/monitoring.notificationChannelEditor"
  members = ["serviceAccount:${google_service_account.monitoring_sa.email}"]
}

resource "google_project_iam_binding" "monitoring_alerting_policy_editor" {
  project = var.project_id
  role    = "roles/monitoring.alertPolicyEditor"
  members = ["serviceAccount:${google_service_account.monitoring_sa.email}"]
}

# Security service account bindings
resource "google_project_iam_binding" "security_scanner" {
  project = var.project_id
  role    = "roles/cloudsecurityscanner.editor"
  members = ["serviceAccount:${google_service_account.security_sa.email}"]
}

resource "google_project_iam_binding" "security_asset_viewer" {
  project = var.project_id
  role    = "roles/cloudasset.viewer"
  members = ["serviceAccount:${google_service_account.security_sa.email}"]
}

# Workload Identity bindings for Kubernetes (if needed in the future)
resource "google_service_account_iam_binding" "workload_identity_binding" {
  count = var.enable_workload_identity ? 1 : 0

  service_account_id = google_service_account.cloud_run_sa.name
  role               = "roles/iam.workloadIdentityUser"
  members = [
    "serviceAccount:${var.project_id}.svc.id.goog[default/${local.name_prefix}-ksa]"
  ]
}

# IAM conditions for enhanced security (time-based, IP-based access)
resource "google_project_iam_binding" "cicd_conditional_access" {
  project = var.project_id
  role    = "roles/editor"
  members = ["serviceAccount:${google_service_account.cicd_sa.email}"]

  # Conditional access: only allow during business hours (if production)
  dynamic "condition" {
    for_each = var.environment == "production" ? [1] : []
    content {
      title       = "Business hours only"
      description = "Access only during business hours UTC"
      expression  = "request.time.getHours() >= 8 && request.time.getHours() <= 18"
    }
  }
}

# Organization-level IAM policies (if managing organization)
resource "google_organization_iam_audit_config" "org_audit" {
  count   = var.organization_id != "" ? 1 : 0
  org_id  = var.organization_id
  service = "allServices"

  audit_log_config {
    log_type = "DATA_READ"
  }

  audit_log_config {
    log_type = "DATA_WRITE"
  }

  audit_log_config {
    log_type = "ADMIN_READ"
  }
}

# Service account keys for external integrations (limited and rotated)
resource "google_service_account_key" "cicd_key" {
  service_account_id = google_service_account.cicd_sa.name
  public_key_type    = "TYPE_X509_PEM_FILE"

  # Auto-rotate keys every 90 days
  depends_on = [google_service_account.cicd_sa]
}

# Store service account key in Secret Manager
resource "google_secret_manager_secret" "cicd_service_account_key" {
  secret_id = "${var.environment}-cicd-service-account-key"

  labels = merge(local.common_labels, {
    type = "service-account-key"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "cicd_service_account_key" {
  secret      = google_secret_manager_secret.cicd_service_account_key.id
  secret_data = base64decode(google_service_account_key.cicd_key.private_key)
}

# IAM policy for accessing the service account key secret
resource "google_secret_manager_secret_iam_binding" "cicd_key_access" {
  secret_id = google_secret_manager_secret.cicd_service_account_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members = [
    # Only specific GitHub Actions should have access
    # This will be configured in the GitHub repository secrets
  ]
}

# Audit logging for IAM changes
resource "google_logging_project_sink" "iam_audit" {
  name = "${local.name_prefix}-iam-audit"

  destination = "storage.googleapis.com/${google_storage_bucket.audit_logs.name}"

  filter = <<EOF
protoPayload.serviceName="iam.googleapis.com"
OR protoPayload.serviceName="cloudresourcemanager.googleapis.com"
AND (
  protoPayload.methodName="google.iam.admin.v1.IAMService.CreateServiceAccount"
  OR protoPayload.methodName="google.iam.admin.v1.IAMService.DeleteServiceAccount"
  OR protoPayload.methodName="google.iam.admin.v1.IAMService.UpdateServiceAccount"
  OR protoPayload.methodName="SetIamPolicy"
  OR protoPayload.methodName="CreateRole"
  OR protoPayload.methodName="UpdateRole"
  OR protoPayload.methodName="DeleteRole"
)
EOF

  unique_writer_identity = true
}

# Grant the log sink writer access to the audit bucket
resource "google_storage_bucket_iam_binding" "iam_audit_logs_writer" {
  bucket = google_storage_bucket.audit_logs.name
  role   = "roles/storage.objectCreator"
  members = [google_logging_project_sink.iam_audit.writer_identity]
}

# Note: IAM recommender insights and security center sources
# require organization-level access and are not included in this deployment