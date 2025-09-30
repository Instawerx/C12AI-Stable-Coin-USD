# C12USD Stablecoin - Secret Manager Configuration
# Secure secret management with customer-managed encryption

# BSC RPC URL secret
resource "google_secret_manager_secret" "bsc_rpc_url" {
  secret_id = "${var.environment}-bsc-rpc-url"

  labels = merge(local.common_labels, {
    type = "rpc-endpoint"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      # Add replica in different region for production
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "bsc_rpc_url" {
  secret = google_secret_manager_secret.bsc_rpc_url.id
  secret_data = var.bsc_rpc_url != "" ? var.bsc_rpc_url : (
    var.environment == "production" ?
    "https://bsc-dataseed1.binance.org/" :
    "https://data-seed-prebsc-1-s1.binance.org:8545/"
  )
}

# Polygon RPC URL secret
resource "google_secret_manager_secret" "polygon_rpc_url" {
  secret_id = "${var.environment}-polygon-rpc-url"

  labels = merge(local.common_labels, {
    type = "rpc-endpoint"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "polygon_rpc_url" {
  secret = google_secret_manager_secret.polygon_rpc_url.id
  secret_data = var.polygon_rpc_url != "" ? var.polygon_rpc_url : (
    var.environment == "production" ?
    "https://polygon-rpc.com/" :
    "https://rpc-mumbai.maticvigil.com/"
  )
}

# Operations signer private key (high security)
resource "google_secret_manager_secret" "ops_signer_key" {
  secret_id = "${var.environment}-ops-signer-key"

  labels = merge(local.common_labels, {
    type      = "private-key"
    security  = "high"
    component = "blockchain"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

# Note: The actual private key should be set manually or through CI/CD
resource "google_secret_manager_secret_version" "ops_signer_key" {
  secret      = google_secret_manager_secret.ops_signer_key.id
  secret_data = "REPLACE_WITH_ACTUAL_PRIVATE_KEY"

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# JWT signing secret for API authentication
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "${var.environment}-jwt-secret"

  labels = merge(local.common_labels, {
    type = "jwt-key"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

# API key for external services (e.g., price feeds, block explorers)
resource "google_secret_manager_secret" "api_keys" {
  secret_id = "${var.environment}-api-keys"

  labels = merge(local.common_labels, {
    type = "api-credentials"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "api_keys" {
  secret = google_secret_manager_secret.api_keys.id
  secret_data = jsonencode({
    bscscan_api_key     = "YOUR_BSCSCAN_API_KEY"
    polygonscan_api_key = "YOUR_POLYGONSCAN_API_KEY"
    coingecko_api_key   = "YOUR_COINGECKO_API_KEY"
    chainlink_api_key   = "YOUR_CHAINLINK_API_KEY"
  })

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# Webhook secrets for external integrations
resource "google_secret_manager_secret" "webhook_secrets" {
  secret_id = "${var.environment}-webhook-secrets"

  labels = merge(local.common_labels, {
    type = "webhook-credentials"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "webhook_secrets" {
  secret = google_secret_manager_secret.webhook_secrets.id
  secret_data = jsonencode({
    github_webhook_secret = random_password.github_webhook.result
    slack_webhook_url     = "REPLACE_WITH_SLACK_WEBHOOK_URL"
    discord_webhook_url   = "REPLACE_WITH_DISCORD_WEBHOOK_URL"
  })

  lifecycle {
    ignore_changes = [secret_data]
  }
}

resource "random_password" "github_webhook" {
  length  = 32
  special = true
}

# SSL/TLS certificates (if not using managed certificates)
resource "google_secret_manager_secret" "ssl_certificates" {
  count = var.ssl_certificate_name != "" ? 1 : 0

  secret_id = "${var.environment}-ssl-certificates"

  labels = merge(local.common_labels, {
    type = "ssl-certificate"
  })

  replication {
    user_managed {
      replicas {
        location = var.region
        customer_managed_encryption {
          kms_key_name = google_kms_crypto_key.database_key.id
        }
      }
      dynamic "replicas" {
        for_each = var.environment == "production" ? ["us-east1"] : []
        content {
          location = replicas.value
          customer_managed_encryption {
            kms_key_name = google_kms_crypto_key.database_key.id
          }
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "ssl_certificates" {
  count = var.ssl_certificate_name != "" ? 1 : 0

  secret = google_secret_manager_secret.ssl_certificates[0].id
  secret_data = jsonencode({
    certificate = "REPLACE_WITH_SSL_CERTIFICATE"
    private_key = "REPLACE_WITH_SSL_PRIVATE_KEY"
  })

  lifecycle {
    ignore_changes = [secret_data]
  }
}

# IAM bindings for secret access with principle of least privilege
resource "google_secret_manager_secret_iam_binding" "jwt_secret_access" {
  secret_id = google_secret_manager_secret.jwt_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_secret_manager_secret_iam_binding" "api_keys_access" {
  secret_id = google_secret_manager_secret.api_keys.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.cloud_run_sa.email}"]
}

resource "google_secret_manager_secret_iam_binding" "webhook_secrets_access" {
  secret_id = google_secret_manager_secret.webhook_secrets.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = [
    "serviceAccount:${google_service_account.cloud_run_sa.email}",
    "serviceAccount:${google_service_account.cicd_sa.email}"
  ]
}

# Separate IAM bindings for high-security secrets (ops signer key)
# Only specific service accounts should have access
resource "google_secret_manager_secret_iam_binding" "ops_signer_limited_access" {
  secret_id = google_secret_manager_secret.ops_signer_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  members   = [
    "serviceAccount:${google_service_account.cloud_run_sa.email}",
    # Add specific admin accounts for production
    # "user:admin@c12usd.com"
  ]
}

# Audit logging for secret access
resource "google_logging_project_sink" "secret_manager_audit" {
  name = "${local.name_prefix}-secret-manager-audit"

  destination = "storage.googleapis.com/${google_storage_bucket.audit_logs.name}"

  filter = <<EOF
protoPayload.serviceName="secretmanager.googleapis.com"
AND (
  protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.AccessSecretVersion"
  OR protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.CreateSecret"
  OR protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.UpdateSecret"
  OR protoPayload.methodName="google.cloud.secretmanager.v1.SecretManagerService.DeleteSecret"
)
EOF

  unique_writer_identity = true
}

# Grant the log sink writer access to the audit bucket
resource "google_storage_bucket_iam_binding" "audit_logs_writer" {
  bucket = google_storage_bucket.audit_logs.name
  role   = "roles/storage.objectCreator"
  members = [google_logging_project_sink.secret_manager_audit.writer_identity]
}