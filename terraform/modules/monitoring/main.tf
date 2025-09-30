# Monitoring module for C12USD - Comprehensive observability and cost optimization

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# Billing budget for cost control
resource "google_billing_budget" "main_budget" {
  billing_account = var.billing_account_id
  display_name    = "${var.project_name}-${var.environment}-budget"

  budget_filter {
    projects = ["projects/${var.project_id}"]

    services = [
      "services/6F81-5844-456A",  # Compute Engine
      "services/95FF-2EF5-5EA1",  # Cloud SQL
      "services/A1E8-BE35-7EBC",  # Cloud Run
      "services/24E6-581D-38E5",  # Cloud Storage
    ]

    labels = {
      environment = var.environment
      project     = var.project_name
    }
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = tostring(var.budget_amount)
    }
  }

  # Alert thresholds
  dynamic "threshold_rules" {
    for_each = var.budget_alert_thresholds
    content {
      threshold_percent = threshold_rules.value
      spend_basis       = "CURRENT_SPEND"
    }
  }

  # Notification channels
  all_updates_rule {
    monitoring_notification_channels = var.notification_channels
    pubsub_topic                      = google_pubsub_topic.budget_alerts.id
  }
}

# Pub/Sub topic for budget alerts
resource "google_pubsub_topic" "budget_alerts" {
  name = "${var.project_name}-${var.environment}-budget-alerts"

  labels = var.labels
}

# Budget alert function (Cloud Function)
resource "google_storage_bucket" "budget_function_source" {
  name          = "${var.project_id}-${var.environment}-budget-function-source"
  location      = var.region
  force_destroy = true

  labels = var.labels
}

resource "google_storage_bucket_object" "budget_function_zip" {
  name   = "budget-alert-function.zip"
  bucket = google_storage_bucket.budget_function_source.name
  source = "${path.module}/budget-alert-function.zip"
}

resource "google_cloudfunctions_function" "budget_alert" {
  name        = "${var.project_name}-${var.environment}-budget-alert"
  description = "Process budget alert notifications"
  runtime     = "nodejs18"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.budget_function_source.name
  source_archive_object = google_storage_bucket_object.budget_function_zip.name
  entry_point           = "processBudgetAlert"

  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = google_pubsub_topic.budget_alerts.name
  }

  environment_variables = {
    SLACK_WEBHOOK_URL   = var.slack_webhook_url
    DISCORD_WEBHOOK_URL = var.discord_webhook_url
    PROJECT_ID          = var.project_id
    ENVIRONMENT         = var.environment
  }

  labels = var.labels
}

# Application Performance Monitoring
resource "google_monitoring_dashboard" "main_dashboard" {
  dashboard_json = jsonencode({
    displayName = "C12USD ${title(var.environment)} Dashboard"

    mosaicLayout = {
      tiles = [
        {
          width  = 6
          height = 4
          widget = {
            title = "Cloud Run Request Rate"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_RATE"
                      crossSeriesReducer = "REDUCE_SUM"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          widget = {
            title = "Cloud Run Response Latency"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_DELTA"
                      crossSeriesReducer = "REDUCE_PERCENTILE_95"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        },
        {
          width  = 6
          height = 4
          yPos   = 4
          widget = {
            title = "Cloud SQL CPU Usage"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"gce_instance\" AND resource.labels.instance_id=\"${var.cloud_sql_instance_id}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_MEAN"
                    }
                  }
                }
                plotType = "LINE"
              }]
            }
          }
        },
        {
          width  = 6
          height = 4
          xPos   = 6
          yPos   = 4
          widget = {
            title = "Cloud SQL Connections"
            xyChart = {
              dataSets = [{
                timeSeriesQuery = {
                  timeSeriesFilter = {
                    filter = "resource.type=\"gce_instance\" AND resource.labels.instance_id=\"${var.cloud_sql_instance_id}\""
                    aggregation = {
                      alignmentPeriod  = "60s"
                      perSeriesAligner = "ALIGN_MEAN"
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

# SLO Configuration
resource "google_monitoring_slo" "availability_slo" {
  count = var.enable_slo_monitoring ? 1 : 0

  service      = google_monitoring_service.cloud_run_service.name
  display_name = "Availability SLO"
  slo_id       = "availability-slo"

  request_based_sli {
    good_total_ratio {
      total_service_filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
      good_service_filter  = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND metric.labels.response_code_class=\"2xx\""
    }
  }

  goal = var.slo_availability_target

  rolling_period = "86400s"  # 24 hours
}

resource "google_monitoring_slo" "latency_slo" {
  count = var.enable_slo_monitoring ? 1 : 0

  service      = google_monitoring_service.cloud_run_service.name
  display_name = "Latency SLO"
  slo_id       = "latency-slo"

  request_based_sli {
    distribution_cut {
      distribution_filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
      range {
        max = var.slo_latency_target_ms / 1000  # Convert to seconds
      }
    }
  }

  goal = var.slo_availability_target

  rolling_period = "86400s"
}

# Service for SLO
resource "google_monitoring_service" "cloud_run_service" {
  service_id   = "${var.project_name}-${var.environment}-service"
  display_name = "C12USD ${title(var.environment)} Service"

  basic_service {
    service_type = "CLOUD_RUN"
    service_labels = {
      service_name = var.cloud_run_service_name
      location     = var.region
    }
  }
}

# Alert policies
resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Error rate above 5%"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND metric.labels.response_code_class!=\"2xx\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.05

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_SUM"
        group_by_fields      = ["resource.label.service_name"]
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Latency - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "95th percentile latency above 1000ms"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 1.0  # 1 second

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

resource "google_monitoring_alert_policy" "cloud_run_cpu_high" {
  display_name = "Cloud Run CPU High - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "CPU utilization above 80%"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.8

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

resource "google_monitoring_alert_policy" "cloud_run_memory_high" {
  display_name = "Cloud Run Memory High - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Memory utilization above 85%"

    condition_threshold {
      filter          = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.85

      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_MEAN"
        cross_series_reducer = "REDUCE_MEAN"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

# Log-based metrics
resource "google_logging_metric" "business_metric_mint_operations" {
  name   = "${var.project_name}_${var.environment}_mint_operations"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND jsonPayload.event=\"mint_completed\""

  label_extractors = {
    "amount"      = "EXTRACT(jsonPayload.amount)"
    "chain"       = "EXTRACT(jsonPayload.chain)"
    "user_id"     = "EXTRACT(jsonPayload.user_id)"
  }

  metric_descriptor {
    metric_kind = "COUNTER"
    value_type  = "INT64"
    unit        = "1"
    display_name = "Mint Operations"
  }
}

resource "google_logging_metric" "business_metric_redeem_operations" {
  name   = "${var.project_name}_${var.environment}_redeem_operations"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND jsonPayload.event=\"redeem_completed\""

  label_extractors = {
    "amount"      = "EXTRACT(jsonPayload.amount)"
    "chain"       = "EXTRACT(jsonPayload.chain)"
    "user_id"     = "EXTRACT(jsonPayload.user_id)"
  }

  metric_descriptor {
    metric_kind = "COUNTER"
    value_type  = "INT64"
    unit        = "1"
    display_name = "Redeem Operations"
  }
}

# Security monitoring
resource "google_logging_metric" "security_failed_authentication" {
  name   = "${var.project_name}_${var.environment}_failed_auth"
  filter = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${var.cloud_run_service_name}\" AND (jsonPayload.event=\"auth_failed\" OR httpRequest.status=\"401\")"

  label_extractors = {
    "source_ip" = "EXTRACT(httpRequest.remoteIp)"
    "user_agent" = "EXTRACT(httpRequest.userAgent)"
  }

  metric_descriptor {
    metric_kind = "COUNTER"
    value_type  = "INT64"
    unit        = "1"
    display_name = "Failed Authentication Attempts"
  }
}

# Cost optimization - Committed Use Discount recommendations
resource "google_monitoring_alert_policy" "cost_anomaly_detection" {
  display_name = "Cost Anomaly Detection - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Daily cost increase above 20%"

    condition_threshold {
      filter          = "resource.type=\"billing_account\" AND metric.type=\"billing.googleapis.com/billing/total_cost\""
      duration        = "86400s"  # 24 hours
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = var.budget_amount * 0.2  # 20% increase

      aggregations {
        alignment_period     = "86400s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_SUM"
      }
    }
  }

  alert_strategy {
    auto_close = "86400s"  # 24 hours
  }

  notification_channels = var.notification_channels
}

# Custom log sink for financial compliance
resource "google_logging_project_sink" "financial_compliance_sink" {
  name        = "${var.project_name}-${var.environment}-financial-compliance-sink"
  destination = "storage.googleapis.com/${google_storage_bucket.compliance_logs.name}"

  filter = <<EOF
resource.type="cloud_run_revision"
AND resource.labels.service_name="${var.cloud_run_service_name}"
AND (
  jsonPayload.event="mint_completed"
  OR jsonPayload.event="redeem_completed"
  OR jsonPayload.event="payment_received"
  OR jsonPayload.event="payout_sent"
  OR jsonPayload.event="compliance_check"
)
EOF

  unique_writer_identity = true
}

# Storage bucket for compliance logs
resource "google_storage_bucket" "compliance_logs" {
  name          = "${var.project_id}-${var.environment}-compliance-logs"
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

  labels = merge(var.labels, {
    purpose     = "financial-compliance"
    retention   = "7-years"
    compliance  = "financial"
  })
}

# IAM for compliance log sink
resource "google_storage_bucket_iam_member" "compliance_logs_writer" {
  bucket = google_storage_bucket.compliance_logs.name
  role   = "roles/storage.objectCreator"
  member = google_logging_project_sink.financial_compliance_sink.writer_identity
}

# Uptime checks
resource "google_monitoring_uptime_check_config" "https_check" {
  display_name = "HTTPS Uptime Check - ${title(var.environment)}"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path           = "/health"
    port           = "443"
    use_ssl        = true
    validate_ssl   = true
    request_method = "GET"

    headers = {
      "User-Agent" = "GoogleStackdriverMonitoring-UptimeChecks"
    }
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host       = var.domain_name != null ? var.domain_name : "example.com"
    }
  }

  content_matchers {
    content = "healthy"
    matcher = "CONTAINS_STRING"
  }

  selected_regions = ["USA", "EUROPE", "ASIA_PACIFIC"]
}

# Alert for uptime check failures
resource "google_monitoring_alert_policy" "uptime_check_failure" {
  display_name = "Uptime Check Failure - ${title(var.environment)}"
  combiner     = "OR"
  enabled      = true

  conditions {
    display_name = "Uptime check failure"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\""
      duration        = "300s"
      comparison      = "COMPARISON_EQUAL"
      threshold_value = 0

      aggregations {
        alignment_period     = "600s"
        per_series_aligner   = "ALIGN_FRACTION_TRUE"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields      = ["resource.label.host"]
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  notification_channels = var.notification_channels
}

# Outputs
output "dashboard_url" {
  description = "URL of the monitoring dashboard"
  value       = "https://console.cloud.google.com/monitoring/dashboards/custom/${google_monitoring_dashboard.main_dashboard.id}?project=${var.project_id}"
}

output "budget_id" {
  description = "ID of the billing budget"
  value       = google_billing_budget.main_budget.name
}

output "compliance_logs_bucket" {
  description = "Name of the compliance logs bucket"
  value       = google_storage_bucket.compliance_logs.name
}