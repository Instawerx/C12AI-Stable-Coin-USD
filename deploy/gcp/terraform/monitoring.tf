# C12USD Stablecoin - Monitoring and Observability Configuration
# Comprehensive monitoring, logging, and alerting setup

# Log bucket for centralized logging
resource "google_logging_project_bucket_config" "application_logs" {
  project        = var.project_id
  location       = var.region
  retention_days = var.log_retention_days
  bucket_id      = "${local.name_prefix}-application-logs"

  cmek_settings {
    kms_key_name = google_kms_crypto_key.database_key.id
  }

  depends_on = [google_project_service.required_apis]
}

# Storage bucket for audit logs
resource "google_storage_bucket" "audit_logs" {
  name          = "${var.project_id}-${var.environment}-audit-logs"
  location      = var.region
  force_destroy = var.environment != "production"

  # Lifecycle management for cost optimization
  lifecycle_rule {
    condition {
      age = var.environment == "production" ? 2555 : 90  # 7 years for production, 90 days for staging
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
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }

  # Encryption with customer-managed keys
  encryption {
    default_kms_key_name = google_kms_crypto_key.database_key.id
  }

  # Versioning for audit compliance
  versioning {
    enabled = true
  }

  # Uniform bucket-level access for better security
  uniform_bucket_level_access = true

  labels = local.common_labels
}

# Cloud Logging sink for application logs
resource "google_logging_project_sink" "application_sink" {
  name = "${local.name_prefix}-application-sink"

  destination = "logging.googleapis.com/projects/${var.project_id}/locations/${var.region}/buckets/${google_logging_project_bucket_config.application_logs.bucket_id}"

  filter = <<EOF
resource.type="cloud_run_revision"
AND resource.labels.service_name="${local.name_prefix}-api"
AND (
  severity >= "WARNING"
  OR jsonPayload.level >= "warning"
  OR textPayload:"ERROR"
  OR textPayload:"WARN"
)
EOF

  unique_writer_identity = true

  depends_on = [google_logging_project_bucket_config.application_logs]
}

# Structured logging sink for database operations
resource "google_logging_project_sink" "database_sink" {
  name = "${local.name_prefix}-database-sink"

  destination = "logging.googleapis.com/projects/${var.project_id}/locations/${var.region}/buckets/${google_logging_project_bucket_config.application_logs.bucket_id}"

  filter = <<EOF
resource.type="cloudsql_database"
AND resource.labels.database_id="${var.project_id}:${google_sql_database_instance.main.name}"
AND (
  severity >= "WARNING"
  OR protoPayload.methodName:"cloudsql"
)
EOF

  unique_writer_identity = true
}

# Security logging sink
resource "google_logging_project_sink" "security_sink" {
  name = "${local.name_prefix}-security-sink"

  destination = "storage.googleapis.com/${google_storage_bucket.audit_logs.name}"

  filter = <<EOF
protoPayload.authenticationInfo.principalEmail!=""
OR protoPayload.authorizationInfo!=""
OR protoPayload.request.policy!=""
OR protoPayload.response.bindings!=""
OR (
  severity >= "WARNING"
  AND (
    resource.type="gce_instance"
    OR resource.type="cloud_run_revision"
    OR resource.type="cloudsql_database"
    OR resource.type="gcs_bucket"
  )
)
EOF

  unique_writer_identity = true
}

# Custom metrics for business logic monitoring
resource "google_monitoring_custom_service" "c12usd_service" {
  service_id   = "${local.name_prefix}-service"
  display_name = "C12USD ${title(var.environment)} Service"

  telemetry {
    resource_name = "//run.googleapis.com/projects/${var.project_id}/locations/${var.region}/services/${google_cloud_run_v2_service.api.name}"
  }
}

# Note: SLI resources are managed automatically by SLO resources

# Note: SLOs can be configured manually in Cloud Console

# Note: Latency SLI is managed by SLO resource

# Note: Latency SLO can be configured manually in Cloud Console

# Notification channels
resource "google_monitoring_notification_channel" "email" {
  count = var.notification_email != "" ? 1 : 0

  display_name = "Email Alerts"
  type         = "email"
  labels = {
    email_address = var.notification_email
  }
  enabled = true
}

resource "google_monitoring_notification_channel" "slack" {
  display_name = "Slack Alerts"
  type         = "slack"
  labels = {
    channel_name = "#alerts-${var.environment}"
    url          = "REPLACE_WITH_SLACK_WEBHOOK_URL"
  }
  enabled = var.environment == "production"

  lifecycle {
    ignore_changes = [labels]
  }
}

# Alert policies for critical metrics

# High error rate alert
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Error rate above threshold"

    condition_threshold {
      filter         = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = var.environment == "production" ? 5 : 10

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields = ["resource.labels.service_name"]
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"  # 30 minutes
  }

  notification_channels = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])

  documentation {
    content = "High error rate detected in C12USD ${var.environment} environment. Check application logs and database connectivity."
  }
}

# High latency alert
resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Response Latency - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Response latency above threshold"

    condition_threshold {
      filter         = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = var.environment == "production" ? 2000 : 5000  # milliseconds

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
        group_by_fields = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])

  documentation {
    content = "High response latency detected. Check database performance and application bottlenecks."
  }
}

# Database connection alert
resource "google_monitoring_alert_policy" "database_connections" {
  display_name = "High Database Connections - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Database connections above threshold"

    condition_threshold {
      filter         = "resource.type=\"cloudsql_database\" AND metric.type=\"cloudsql.googleapis.com/database/postgresql/num_backends\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = var.environment == "production" ? 150 : 75  # 75% of max connections

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MAX"
      }
    }
  }

  notification_channels = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])

  documentation {
    content = "High database connection count. Check for connection leaks or increase connection pool size."
  }
}

# Memory usage alert
resource "google_monitoring_alert_policy" "high_memory_usage" {
  display_name = "High Memory Usage - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Memory utilization above threshold"

    condition_threshold {
      filter         = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/container/memory/utilizations\""
      duration       = "300s"
      comparison     = "COMPARISON_GT"
      threshold_value = 0.85  # 85%

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MAX"
        group_by_fields = ["resource.labels.service_name"]
      }
    }
  }

  notification_channels = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])
}

# Custom dashboard for C12USD monitoring
resource "google_monitoring_dashboard" "c12usd_dashboard" {
  dashboard_json = jsonencode({
    displayName = "C12USD ${title(var.environment)} Dashboard"
    mosaicLayout = {
      tiles = [
        {
          width = 6
          height = 4
          widget = {
            title = "Request Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\""
                    aggregation = {
                      alignmentPeriod = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields = ["resource.labels.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              axes = [{
                label = "Requests per second"
                scale = "LINEAR"
              }]
            }
          }
        },
        {
          width = 6
          height = 4
          xPos = 6
          widget = {
            title = "Response Latency (95th percentile)"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_latencies\""
                    aggregation = {
                      alignmentPeriod = "60s"
                      perSeriesAligner = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_95"
                      groupByFields = ["resource.labels.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              axes = [{
                label = "Latency (ms)"
                scale = "LINEAR"
              }]
            }
          }
        },
        {
          width = 6
          height = 4
          yPos = 4
          widget = {
            title = "Error Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND metric.type=\"run.googleapis.com/request_count\" AND metric.labels.response_code_class=\"5xx\""
                    aggregation = {
                      alignmentPeriod = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                      groupByFields = ["resource.labels.service_name"]
                    }
                  }
                }
                plotType = "LINE"
              }]
              axes = [{
                label = "Errors per second"
                scale = "LINEAR"
              }]
            }
          }
        },
        {
          width = 6
          height = 4
          xPos = 6
          yPos = 4
          widget = {
            title = "Database Connections"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloudsql_database\" AND metric.type=\"cloudsql.googleapis.com/database/postgresql/num_backends\""
                    aggregation = {
                      alignmentPeriod = "60s"
                      perSeriesAligner = "ALIGN_MEAN"
                      crossSeriesReducer = "REDUCE_MAX"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        }
      ]
    }
  })
}

# Uptime checks for external monitoring
resource "google_monitoring_uptime_check_config" "api_uptime" {
  display_name = "C12USD API Uptime - ${title(var.environment)}"
  timeout      = "10s"
  period       = "300s"

  http_check {
    path         = "/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true

    accepted_response_status_codes {
      status_value = 200
    }
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.domain_name != "" ? var.domain_name : "${google_cloud_run_v2_service.api.uri}"
    }
  }

  # Monitor from multiple locations
  selected_regions = var.environment == "production" ? [
    "USA_OREGON", "USA_IOWA", "EUROPE_IRELAND", "ASIA_SINGAPORE"
  ] : ["USA_OREGON"]

  depends_on = [google_cloud_run_v2_service.api]
}

# Alert for uptime check failures
resource "google_monitoring_alert_policy" "uptime_check_failure" {
  display_name = "API Uptime Check Failure - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Uptime check failure"

    condition_threshold {
      filter         = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\""
      duration       = "300s"
      comparison     = "COMPARISON_LT"
      threshold_value = 1

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        group_by_fields = ["resource.labels.url"]
      }
    }
  }

  notification_channels = compact([
    var.notification_email != "" ? google_monitoring_notification_channel.email[0].id : "",
    google_monitoring_notification_channel.slack.id
  ])

  documentation {
    content = "API uptime check failed. Service may be down or experiencing issues."
  }

  depends_on = [google_monitoring_uptime_check_config.api_uptime]
}