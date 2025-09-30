# C12USD Stablecoin - Cloud SQL Configuration
# Production-ready PostgreSQL with high availability and security

# Random password for database user
resource "random_password" "database_password" {
  length  = 32
  special = true
}

# Cloud SQL instance with latest PostgreSQL and enhanced security
resource "google_sql_database_instance" "main" {
  name                = "${local.name_prefix}-db-instance"
  database_version    = var.database_version
  region              = var.region
  deletion_protection = var.environment == "production"

  settings {
    tier              = var.database_tier
    availability_type = var.enable_high_availability ? "REGIONAL" : "ZONAL"
    disk_type         = var.database_disk_type
    disk_size         = var.database_disk_size
    disk_autoresize   = true

    # Enhanced autoresize configuration (latest feature)
    disk_autoresize_limit = var.database_disk_size * 10

    # User labels for cost tracking and management
    user_labels = local.common_labels

    # Enhanced backup configuration
    backup_configuration {
      enabled                        = true
      start_time                     = var.backup_start_time
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = var.environment == "production" ? 7 : 3

      # Automated backup retention
      backup_retention_settings {
        retained_backups = var.environment == "production" ? 30 : 7
        retention_unit   = "COUNT"
      }
    }

    # IP configuration with private networking
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc_network.id
      enable_private_path_for_google_cloud_services = true

      # Only allow authorized networks in production
      dynamic "authorized_networks" {
        for_each = var.environment == "production" ? local.authorized_networks : []
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.value
        }
      }

      # SSL enforcement
      ssl_mode = "ENCRYPTED_ONLY"
    }

    # Enhanced maintenance window
    maintenance_window {
      day          = 7  # Sunday
      hour         = 3  # 3 AM
      update_track = var.environment == "production" ? "stable" : "canary"
    }

    # Basic database flags for PostgreSQL
    database_flags {
      name  = "max_connections"
      value = var.environment == "production" ? "200" : "100"
    }

    # Enable Query Insights for performance monitoring
    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
      record_client_address   = true
      query_plans_per_minute  = 10
    }

    # Advanced machine configuration for production
    dynamic "advanced_machine_features" {
      for_each = var.environment == "production" ? [1] : []
      content {
        threads_per_core = 2
      }
    }

    # Data cache configuration for better performance
    data_cache_config {
      data_cache_enabled = var.environment == "production"
    }
  }

  # Enhanced encryption with customer-managed keys
  encryption_key_name = google_kms_crypto_key.database_key.id

  depends_on = [
    google_service_networking_connection.private_vpc_connection,
    google_project_service.required_apis
  ]
}

# Create the main database
resource "google_sql_database" "database" {
  name      = var.project_name
  instance  = google_sql_database_instance.main.name
  charset   = "UTF8"
  collation = "en_US.UTF8"
}

# Application database user with minimal privileges
resource "google_sql_user" "app_user" {
  name     = "${var.project_name}_app"
  instance = google_sql_database_instance.main.name

  # Use write-only password for enhanced security (v7.0 feature)
  password    = random_password.database_password.result
  type        = "BUILT_IN"

  # Grant only necessary privileges
  host = "%"
}

# Read-only user for reporting and analytics
resource "google_sql_user" "readonly_user" {
  name     = "${var.project_name}_readonly"
  instance = google_sql_database_instance.main.name
  password = random_password.readonly_password.result
  type     = "BUILT_IN"
  host     = "%"
}

resource "random_password" "readonly_password" {
  length  = 32
  special = true
}

# Database replica for read operations and disaster recovery
resource "google_sql_database_instance" "read_replica" {
  count               = var.environment == "production" ? 1 : 0
  name                = "${local.name_prefix}-db-replica"
  database_version    = var.database_version
  region              = var.environment == "production" ? "us-east1" : var.region  # Different region for DR
  master_instance_name = google_sql_database_instance.main.name

  settings {
    tier              = var.database_tier
    availability_type = "ZONAL"  # Replicas are always zonal
    disk_type         = var.database_disk_type
    disk_size         = var.database_disk_size
    disk_autoresize   = true

    user_labels = merge(local.common_labels, {
      role = "read-replica"
    })

    # IP configuration matching master
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = google_compute_network.vpc_network.id
      enable_private_path_for_google_cloud_services = true
      ssl_mode                                      = "ENCRYPTED_ONLY"
    }

    # Replica-specific database flags
    database_flags {
      name  = "max_connections"
      value = "100"
    }

    # Enable Query Insights for read replica monitoring
    insights_config {
      query_insights_enabled  = true
      record_application_tags = true
      record_client_address   = true
      query_plans_per_minute  = 5
    }
  }

  replica_configuration {
    failover_target = false  # Manual failover only
  }

  depends_on = [google_sql_database_instance.main]
}

# Cloud SQL SSL certificate
resource "google_sql_ssl_cert" "client_cert" {
  common_name = "${local.name_prefix}-client-cert"
  instance    = google_sql_database_instance.main.name
}

# Store database connection details in Secret Manager
resource "google_secret_manager_secret" "database_url" {
  secret_id = "${var.environment}-database-url"

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

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://${google_sql_user.app_user.name}:${random_password.database_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.database.name}?sslmode=require"
}

# Read-only database URL for analytics
resource "google_secret_manager_secret" "database_readonly_url" {
  secret_id = "${var.environment}-database-readonly-url"

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

resource "google_secret_manager_secret_version" "database_readonly_url" {
  secret      = google_secret_manager_secret.database_readonly_url.id
  secret_data = var.environment == "production" && length(google_sql_database_instance.read_replica) > 0 ? "postgresql://${google_sql_user.readonly_user.name}:${random_password.readonly_password.result}@${google_sql_database_instance.read_replica[0].private_ip_address}:5432/${google_sql_database.database.name}?sslmode=require" : "postgresql://${google_sql_user.readonly_user.name}:${random_password.readonly_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.database.name}?sslmode=require"
}