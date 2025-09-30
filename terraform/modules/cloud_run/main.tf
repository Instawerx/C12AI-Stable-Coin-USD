# Cloud Run module for C12USD - Serverless container deployment

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Cloud Run service
resource "google_cloud_run_service" "main" {
  name     = "${var.project_name}-${var.environment}"
  location = var.region

  template {
    metadata {
      labels = var.labels
      annotations = {
        "autoscaling.knative.dev/maxScale"                = var.max_instances
        "autoscaling.knative.dev/minScale"                = var.min_instances
        "run.googleapis.com/cloudsql-instances"           = var.cloud_sql_instance
        "run.googleapis.com/vpc-access-connector"         = var.vpc_connector_id
        "run.googleapis.com/vpc-access-egress"            = "private-ranges-only"
        "run.googleapis.com/execution-environment"        = "gen2"
        "run.googleapis.com/cpu-throttling"               = "false"
      }
    }

    spec {
      container_concurrency = var.container_concurrency
      timeout_seconds       = var.timeout_seconds
      service_account_name  = var.service_account_email

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.project_name}-repo/${var.project_name}-backend:latest"

        # Resource allocation
        resources {
          limits = {
            cpu    = var.cpu
            memory = var.memory
          }
        }

        # Ports
        ports {
          name           = "http1"
          container_port = 8080
          protocol       = "TCP"
        }

        # Environment variables
        env {
          name  = "NODE_ENV"
          value = var.environment
        }

        env {
          name  = "PORT"
          value = "8080"
        }

        env {
          name  = "GCP_PROJECT_ID"
          value = var.project_id
        }

        env {
          name  = "GCP_REGION"
          value = var.region
        }

        env {
          name  = "LOG_LEVEL"
          value = var.environment == "production" ? "warn" : "info"
        }

        # Database connection from secrets
        env {
          name = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-database-url"
              key  = "latest"
            }
          }
        }

        env {
          name = "SHADOW_DATABASE_URL"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-shadow-database-url"
              key  = "latest"
            }
          }
        }

        # Blockchain RPC URLs
        env {
          name = "BSC_RPC"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-bsc-rpc-url"
              key  = "latest"
            }
          }
        }

        env {
          name = "POLYGON_RPC"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-polygon-rpc-url"
              key  = "latest"
            }
          }
        }

        # Private key for operations
        env {
          name = "OPS_SIGNER_PRIVATE_KEY"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-ops-signer-private-key"
              key  = "latest"
            }
          }
        }

        # API keys
        env {
          name = "ETHERSCAN_API_KEY"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-etherscan-api-key"
              key  = "latest"
            }
          }
        }

        # JWT secret
        env {
          name = "JWT_SECRET"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-jwt-secret"
              key  = "latest"
            }
          }
        }

        # Payment provider secrets
        env {
          name = "STRIPE_SECRET_KEY"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-stripe-secret-key"
              key  = "latest"
            }
          }
        }

        env {
          name = "STRIPE_WEBHOOK_SECRET"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-stripe-webhook-secret"
              key  = "latest"
            }
          }
        }

        env {
          name = "CASHAPP_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              name = "${var.project_name}-${var.environment}-cashapp-client-secret"
              key  = "latest"
            }
          }
        }

        # Health check
        startup_probe {
          http_get {
            path = "/health"
            port = 8080
          }
          initial_delay_seconds = 30
          timeout_seconds       = 5
          period_seconds        = 10
          failure_threshold     = 3
        }

        liveness_probe {
          http_get {
            path = "/health"
            port = 8080
          }
          initial_delay_seconds = 60
          timeout_seconds       = 5
          period_seconds        = 30
          failure_threshold     = 3
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  autogenerate_revision_name = true

  lifecycle {
    ignore_changes = [
      template[0].spec[0].containers[0].image,
    ]
  }
}

# IAM policy for public access
resource "google_cloud_run_service_iam_policy" "noauth" {
  count = var.allow_unauthenticated ? 1 : 0

  location    = google_cloud_run_service.main.location
  project     = google_cloud_run_service.main.project
  service     = google_cloud_run_service.main.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

# Custom domain mapping
resource "google_cloud_run_domain_mapping" "main" {
  count = var.custom_domain != null ? 1 : 0

  location = var.region
  name     = var.custom_domain

  metadata {
    namespace = var.project_id
    labels    = var.labels
  }

  spec {
    route_name = google_cloud_run_service.main.name
  }
}

# Load balancer with SSL termination
resource "google_compute_region_network_endpoint_group" "cloud_run_neg" {
  name                  = "${var.project_name}-${var.environment}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_service.main.name
  }
}

# Global load balancer components
resource "google_compute_backend_service" "cloud_run_backend" {
  name                  = "${var.project_name}-${var.environment}-backend"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30
  connection_draining_timeout_sec = 60

  backend {
    group = google_compute_region_network_endpoint_group.cloud_run_neg.id
  }

  # Health check
  health_checks = [google_compute_health_check.cloud_run_health_check.id]

  # Enable CDN for static content
  enable_cdn = var.enable_cdn

  cdn_policy {
    cache_mode                   = "CACHE_ALL_STATIC"
    default_ttl                  = 3600
    max_ttl                      = 86400
    client_ttl                   = 3600
    negative_caching             = true
    signed_url_cache_max_age_sec = 7200
  }

  # Security policy
  security_policy = var.security_policy_id

  # Custom headers
  custom_request_headers  = var.custom_request_headers
  custom_response_headers = var.custom_response_headers

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

# Health check for load balancer
resource "google_compute_health_check" "cloud_run_health_check" {
  name                = "${var.project_name}-${var.environment}-health-check"
  check_interval_sec  = 30
  timeout_sec         = 10
  healthy_threshold   = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = "8080"
    request_path = "/health"
  }
}

# URL map for routing
resource "google_compute_url_map" "cloud_run_url_map" {
  name            = "${var.project_name}-${var.environment}-url-map"
  default_service = google_compute_backend_service.cloud_run_backend.id

  # API routing rules
  path_matcher {
    name            = "api-matcher"
    default_service = google_compute_backend_service.cloud_run_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.cloud_run_backend.id
    }

    path_rule {
      paths   = ["/health"]
      service = google_compute_backend_service.cloud_run_backend.id
    }
  }

  host_rule {
    hosts        = var.custom_domain != null ? [var.custom_domain] : ["*"]
    path_matcher = "api-matcher"
  }
}

# SSL certificate
resource "google_compute_managed_ssl_certificate" "cloud_run_ssl" {
  count = var.custom_domain != null ? 1 : 0

  name = "${var.project_name}-${var.environment}-ssl-cert"

  managed {
    domains = [var.custom_domain]
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS proxy
resource "google_compute_target_https_proxy" "cloud_run_https_proxy" {
  count = var.custom_domain != null ? 1 : 0

  name             = "${var.project_name}-${var.environment}-https-proxy"
  url_map          = google_compute_url_map.cloud_run_url_map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.cloud_run_ssl[0].id]
  ssl_policy       = google_compute_ssl_policy.modern_ssl_policy.id
}

# SSL policy
resource "google_compute_ssl_policy" "modern_ssl_policy" {
  name            = "${var.project_name}-${var.environment}-ssl-policy"
  profile         = "MODERN"
  min_tls_version = "TLS_1_2"
}

# Global forwarding rule
resource "google_compute_global_forwarding_rule" "cloud_run_forwarding_rule" {
  count = var.custom_domain != null ? 1 : 0

  name       = "${var.project_name}-${var.environment}-forwarding-rule"
  target     = google_compute_target_https_proxy.cloud_run_https_proxy[0].id
  port_range = "443"
}

# Output values
output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.main.name
}

output "service_url" {
  description = "URL of the Cloud Run service"
  value       = google_cloud_run_service.main.status[0].url
}

output "service_id" {
  description = "ID of the Cloud Run service"
  value       = google_cloud_run_service.main.id
}

output "load_balancer_ip" {
  description = "IP address of the load balancer"
  value       = var.custom_domain != null ? google_compute_global_forwarding_rule.cloud_run_forwarding_rule[0].ip_address : null
}

output "ssl_certificate_id" {
  description = "ID of the SSL certificate"
  value       = var.custom_domain != null ? google_compute_managed_ssl_certificate.cloud_run_ssl[0].id : null
}