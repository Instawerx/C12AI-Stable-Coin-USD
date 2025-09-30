# C12USD Stablecoin - Cloud Run Configuration
# Production-ready serverless deployment with latest Gen2 features

# Service Account for Cloud Run with minimal privileges
resource "google_service_account" "cloud_run_sa" {
  account_id   = "${local.name_prefix}-run-sa"
  display_name = "Cloud Run Service Account for C12USD ${title(var.environment)}"
  description  = "Service account for Cloud Run with least privilege access"
}

# IAM binding for Cloud Run service account to access secrets
resource "google_secret_manager_secret_iam_binding" "database_url_access" {
  secret_id = google_secret_manager_secret.database_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_secret_manager_secret_iam_binding" "bsc_rpc_access" {
  secret_id = google_secret_manager_secret.bsc_rpc_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_secret_manager_secret_iam_binding" "polygon_rpc_access" {
  secret_id = google_secret_manager_secret.polygon_rpc_url.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_secret_manager_secret_iam_binding" "ops_signer_access" {
  secret_id = google_secret_manager_secret.ops_signer_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

# Additional IAM roles for Cloud Run service account
resource "google_project_iam_binding" "cloud_run_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  members = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_project_iam_binding" "cloud_run_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  members = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_project_iam_binding" "cloud_run_trace" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  members = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

# Cloud Run service with Gen2 features and security hardening
resource "google_cloud_run_v2_service" "api" {
  name     = "${local.name_prefix}-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  labels = local.common_labels

  # Binary authorization for enhanced container security
  binary_authorization {
    use_default = var.enable_binary_authorization
    breakglass_justification = var.environment != "production" ? "Development environment" : null
  }

  template {
    labels = merge(local.common_labels, {
      version = "latest"
    })

    # Scaling configuration with latest features
    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

    # Service account with least privilege
    service_account = google_service_account.cloud_run_sa.email

    # Execution environment Gen2 for better performance
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

    # Session affinity for stateful connections (if needed)
    session_affinity = false

    # Timeout configuration
    timeout = "${var.cloud_run_timeout}s"

    # VPC Access for private networking
    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    # Container configuration
    containers {
      image = "${google_artifact_registry_repository.repo.location}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.name}/c12usd-backend:latest"

      # Resource allocation based on environment
      resources {
        limits = {
          cpu    = var.cloud_run_cpu
          memory = var.cloud_run_memory
        }
        cpu_idle = var.environment == "production" ? false : true
        startup_cpu_boost = var.environment == "production"
      }

      # Port configuration
      ports {
        container_port = 3000
        name          = "http1"
      }

      # Environment variables
      env {
        name  = "NODE_ENV"
        value = var.environment == "staging" ? "staging" : "production"
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "LOG_LEVEL"
        value = var.environment == "production" ? "info" : "debug"
      }

      env {
        name  = "REGION"
        value = var.region
      }

      # CORS configuration
      env {
        name  = "CORS_ORIGIN"
        value = join(",", var.cors_origins)
      }

      # Rate limiting configuration
      env {
        name  = "RATE_LIMIT_MAX"
        value = tostring(var.rate_limit_max)
      }

      env {
        name  = "RATE_LIMIT_WINDOW_MS"
        value = tostring(var.rate_limit_window_ms)
      }

      # Secrets from Secret Manager
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "BSC_RPC"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.bsc_rpc_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "POLYGON_RPC"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.polygon_rpc_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "OPS_SIGNER_PRIVATE_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.ops_signer_key.secret_id
            version = "latest"
          }
        }
      }

      # Health check probes
      startup_probe {
        http_get {
          path = "/health"
          port = 3000
          http_headers {
            name  = "User-Agent"
            value = "Google-Cloud-Run-Health-Check"
          }
        }
        initial_delay_seconds = 15
        timeout_seconds      = 3
        period_seconds       = 3
        failure_threshold    = 20
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 3000
          http_headers {
            name  = "User-Agent"
            value = "Google-Cloud-Run-Health-Check"
          }
        }
        initial_delay_seconds = 30
        timeout_seconds      = 5
        period_seconds       = 15
        failure_threshold    = 3
      }
    }

    # Container concurrency
    max_instance_request_concurrency = var.cloud_run_concurrency

    # Annotations for additional configuration
    annotations = {
      "autoscaling.knative.dev/minScale" = tostring(var.cloud_run_min_instances)
      "autoscaling.knative.dev/maxScale" = tostring(var.cloud_run_max_instances)
      "run.googleapis.com/cpu-throttling" = var.environment == "production" ? "false" : "true"
      "run.googleapis.com/startup-cpu-boost" = var.environment == "production" ? "true" : "false"
    }
  }

  # Traffic allocation with support for gradual rollouts
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.required_apis,
    google_artifact_registry_repository.repo
  ]
}

# IAM policy for Cloud Run service (allow public access or authenticated only)
resource "google_cloud_run_service_iam_binding" "public_access" {
  count = var.environment == "staging" ? 1 : 0

  location = google_cloud_run_v2_service.api.location
  service  = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

# For production, use authenticated access only
resource "google_cloud_run_service_iam_binding" "authenticated_access" {
  count = var.environment == "production" ? 1 : 0

  location = google_cloud_run_v2_service.api.location
  service  = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  members  = [
    "serviceAccount:${google_service_account.cloud_run_sa.email}",
    # Add specific user accounts or groups for production access
    # "user:admin@c12usd.com",
    # "group:developers@c12usd.com"
  ]
}

# Domain mapping for custom domain (optional)
resource "google_cloud_run_domain_mapping" "domain" {
  count = var.domain_name != "" ? 1 : 0

  location = var.region
  name     = var.domain_name

  metadata {
    namespace = var.project_id
    labels    = local.common_labels
  }

  spec {
    route_name = google_cloud_run_v2_service.api.name
  }
}

# SSL certificate for custom domain (if using managed certificates)
resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  count = var.domain_name != "" && var.ssl_certificate_name == "" ? 1 : 0

  name = "${local.name_prefix}-ssl-cert"

  managed {
    domains = [var.domain_name]
  }

  depends_on = [google_cloud_run_domain_mapping.domain]
}