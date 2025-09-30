# Database module for C12USD - Cloud SQL PostgreSQL with high availability and security

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.4"
    }
  }
}

# Generate database password
resource "random_password" "database_password" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

# Cloud SQL instance
resource "google_sql_database_instance" "main" {
  name             = var.db_instance_name
  database_version = "POSTGRES_15"
  region           = var.region

  deletion_protection = var.enable_deletion_protection

  settings {
    tier                        = var.db_tier
    disk_type                  = "PD_SSD"
    disk_size                  = var.db_disk_size
    disk_autoresize           = true
    disk_autoresize_limit     = 1000
    availability_type         = var.environment == "production" ? "REGIONAL" : "ZONAL"
    edition                   = "ENTERPRISE"

    # Backup configuration
    backup_configuration {
      enabled                        = true
      start_time                     = "02:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = var.db_backup_retention_days
        retention_unit   = "COUNT"
      }
      transaction_log_retention_days = 7
    }

    # IP configuration - private only for security
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.vpc_network_id
      enable_private_path_for_google_cloud_services = true

      # Authorized networks (empty for private only)
      authorized_networks {
        name  = "allow-private-access"
        value = "10.0.0.0/8"
      }

      ssl_mode                = "ENCRYPTED_ONLY"
      require_ssl            = true
    }

    # Maintenance window
    maintenance_window {
      day          = 7  # Sunday
      hour         = 3  # 3 AM
      update_track = "stable"
    }

    # Enable query insights
    insights_config {
      query_insights_enabled  = true
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    # Database flags for optimization
    database_flags {
      name  = "max_connections"
      value = "200"
    }

    database_flags {
      name  = "shared_preload_libraries"
      value = "pg_stat_statements"
    }

    database_flags {
      name  = "log_statement"
      value = "all"
    }

    database_flags {
      name  = "log_min_duration_statement"
      value = "1000"  # Log queries taking longer than 1 second
    }

    # User labels
    user_labels = var.labels
  }
}

# SSL certificate for secure connections
resource "google_sql_ssl_cert" "client_cert" {
  common_name = "${var.db_instance_name}-client-cert"
  instance    = google_sql_database_instance.main.name
}

# Create database user
resource "google_sql_user" "application_user" {
  name     = "c12usd_user"
  instance = google_sql_database_instance.main.name
  password = random_password.database_password.result

  depends_on = [google_sql_database_instance.main]
}

# Create production database
resource "google_sql_database" "production" {
  name     = var.db_name_prod
  instance = google_sql_database_instance.main.name
  charset  = "UTF8"
  collation = "en_US.UTF8"

  depends_on = [google_sql_database_instance.main]
}

# Create shadow database for Prisma migrations
resource "google_sql_database" "shadow" {
  name     = var.db_name_shadow
  instance = google_sql_database_instance.main.name
  charset  = "UTF8"
  collation = "en_US.UTF8"

  depends_on = [google_sql_database_instance.main]
}

# Read replica for read scaling (production only)
resource "google_sql_database_instance" "read_replica" {
  count = var.environment == "production" ? 1 : 0

  name                 = "${var.db_instance_name}-read-replica"
  database_version     = "POSTGRES_15"
  region               = var.region
  master_instance_name = google_sql_database_instance.main.name

  replica_configuration {
    failover_target = true
  }

  settings {
    tier              = var.db_tier
    disk_type         = "PD_SSD"
    disk_size         = var.db_disk_size
    disk_autoresize   = true
    availability_type = "ZONAL"

    # IP configuration
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = var.vpc_network_id
      enable_private_path_for_google_cloud_services = true
      ssl_mode                                      = "ENCRYPTED_ONLY"
      require_ssl                                   = true
    }

    user_labels = merge(var.labels, {
      role = "read-replica"
    })
  }

  depends_on = [google_sql_database_instance.main]
}

# Cloud SQL Proxy setup for secure connections
resource "google_service_account" "sql_proxy" {
  account_id   = "${var.db_instance_name}-sql-proxy"
  display_name = "Cloud SQL Proxy Service Account"
  description  = "Service account for Cloud SQL Proxy connections"
}

resource "google_project_iam_member" "sql_proxy_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.sql_proxy.email}"
}

# Create Cloud Storage bucket for database backups
resource "google_storage_bucket" "database_backups" {
  name          = "${var.project_id}-${var.environment}-db-backups"
  location      = var.region
  force_destroy = false

  # Enable versioning
  versioning {
    enabled = true
  }

  # Lifecycle management
  lifecycle_rule {
    condition {
      age = 90
    }
    action {
      type = "Delete"
    }
  }

  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  # Enable uniform bucket-level access
  uniform_bucket_level_access = true

  # Encryption - commenting out KMS key requirement for initial deployment
  # encryption {
  #   default_kms_key_name = var.kms_key_id
  # }

  labels = merge(var.labels, {
    purpose = "database-backups"
  })
}

# IAM binding for backup bucket
resource "google_storage_bucket_iam_binding" "database_backup_binding" {
  bucket = google_storage_bucket.database_backups.name
  role   = "roles/storage.objectAdmin"

  members = [
    "serviceAccount:${google_service_account.sql_proxy.email}",
    "serviceAccount:service-${data.google_project.current.number}@gcp-sa-cloud-sql.iam.gserviceaccount.com"
  ]
}

# Get current project information
data "google_project" "current" {}

# Database monitoring
resource "google_monitoring_alert_policy" "database_cpu" {
  display_name = "Cloud SQL CPU Usage High"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL CPU usage above 80%"

    condition_threshold {
      filter         = "resource.type=\"gce_instance\" AND resource.labels.instance_id=\"${google_sql_database_instance.main.name}\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = 0.8

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"  # 30 minutes
  }

  notification_channels = var.notification_channels
}

resource "google_monitoring_alert_policy" "database_memory" {
  display_name = "Cloud SQL Memory Usage High"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL memory usage above 85%"

    condition_threshold {
      filter         = "resource.type=\"gce_instance\" AND resource.labels.instance_id=\"${google_sql_database_instance.main.name}\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = 0.85

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

resource "google_monitoring_alert_policy" "database_connections" {
  display_name = "Cloud SQL Connection Count High"
  combiner     = "OR"

  conditions {
    display_name = "Cloud SQL connection count above 150"

    condition_threshold {
      filter         = "resource.type=\"gce_instance\" AND resource.labels.instance_id=\"${google_sql_database_instance.main.name}\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = 150

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

# Output values
output "instance_id" {
  description = "The ID of the Cloud SQL instance"
  value       = google_sql_database_instance.main.id
}

output "instance_name" {
  description = "The name of the Cloud SQL instance"
  value       = google_sql_database_instance.main.name
}

output "connection_string" {
  description = "The connection string for the database"
  value       = "postgresql://${google_sql_user.application_user.name}:${random_password.database_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.production.name}?sslmode=require"
  sensitive   = true
}

output "private_ip_address" {
  description = "The private IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.main.private_ip_address
}

output "database_password" {
  description = "The generated database password"
  value       = random_password.database_password.result
  sensitive   = true
}

output "ssl_cert" {
  description = "SSL certificate for database connections"
  value       = google_sql_ssl_cert.client_cert.cert
  sensitive   = true
}

output "ssl_key" {
  description = "SSL private key for database connections"
  value       = google_sql_ssl_cert.client_cert.private_key
  sensitive   = true
}

output "backup_bucket" {
  description = "Cloud Storage bucket for database backups"
  value       = google_storage_bucket.database_backups.name
}

output "read_replica_ip" {
  description = "Private IP address of the read replica (if created)"
  value       = var.environment == "production" ? google_sql_database_instance.read_replica[0].private_ip_address : null
}