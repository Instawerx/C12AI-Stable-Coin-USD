#!/bin/bash
# Setup monitoring and alerting for C12USD deployment

set -euo pipefail

PROJECT_ID="${1:-}"
NOTIFICATION_EMAIL="${2:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

if [ -z "$PROJECT_ID" ]; then
    log_error "Usage: $0 <PROJECT_ID> [NOTIFICATION_EMAIL]"
    log_error "Example: $0 my-gcp-project admin@example.com"
    exit 1
fi

log_info "Setting up monitoring for project: $PROJECT_ID"

# Set the project
gcloud config set project "$PROJECT_ID"

# Enable monitoring APIs
log_info "Enabling monitoring APIs..."
gcloud services enable \
    monitoring.googleapis.com \
    logging.googleapis.com \
    clouderrorreporting.googleapis.com \
    cloudprofiler.googleapis.com

# Create monitoring dashboard
log_info "Creating monitoring dashboard..."
gcloud monitoring dashboards create --config-from-file=monitoring/dashboard.json
log_success "Monitoring dashboard created"

# Create notification channel if email provided
if [ -n "$NOTIFICATION_EMAIL" ]; then
    log_info "Creating notification channel for email: $NOTIFICATION_EMAIL"

    cat > /tmp/notification-channel.json << EOF
{
  "type": "email",
  "displayName": "C12USD Admin Email",
  "description": "Email notifications for C12USD alerts",
  "labels": {
    "email_address": "$NOTIFICATION_EMAIL"
  },
  "enabled": true
}
EOF

    NOTIFICATION_CHANNEL=$(gcloud alpha monitoring channels create --channel-content-from-file=/tmp/notification-channel.json --format="value(name)")
    log_success "Notification channel created: $NOTIFICATION_CHANNEL"

    rm /tmp/notification-channel.json
else
    log_warning "No notification email provided. Skipping notification channel creation."
    NOTIFICATION_CHANNEL=""
fi

# Create alerting policies
log_info "Creating alerting policies..."

# High error rate alert
if [ -n "$NOTIFICATION_CHANNEL" ]; then
    cat > /tmp/error-rate-alert.yaml << EOF
displayName: "C12USD High Error Rate"
documentation:
  content: "Error rate for C12USD backend services has exceeded 5% for more than 5 minutes."
  mimeType: "text/markdown"
conditions:
- displayName: "Error rate too high"
  conditionThreshold:
    filter: 'resource.type="cloud_run_revision" resource.label.service_name=~"c12usd-backend.*" metric.type="run.googleapis.com/request_count" metric.label.response_code_class!="2xx"'
    comparison: COMPARISON_GREATER_THAN
    thresholdValue: 0.05
    duration: 300s
    aggregations:
    - alignmentPeriod: 60s
      perSeriesAligner: ALIGN_RATE
      crossSeriesReducer: REDUCE_SUM
      groupByFields:
      - resource.label.service_name
notificationChannels:
- $NOTIFICATION_CHANNEL
alertStrategy:
  autoClose: 86400s
EOF

    gcloud alpha monitoring policies create --policy-from-file=/tmp/error-rate-alert.yaml
    log_success "High error rate alert created"
    rm /tmp/error-rate-alert.yaml
fi

# High latency alert
if [ -n "$NOTIFICATION_CHANNEL" ]; then
    cat > /tmp/latency-alert.yaml << EOF
displayName: "C12USD High Latency"
documentation:
  content: "95th percentile latency for C12USD backend services has exceeded 2 seconds for more than 5 minutes."
  mimeType: "text/markdown"
conditions:
- displayName: "Latency too high"
  conditionThreshold:
    filter: 'resource.type="cloud_run_revision" resource.label.service_name=~"c12usd-backend.*" metric.type="run.googleapis.com/request_latencies"'
    comparison: COMPARISON_GREATER_THAN
    thresholdValue: 2000
    duration: 300s
    aggregations:
    - alignmentPeriod: 60s
      perSeriesAligner: ALIGN_DELTA
      crossSeriesReducer: REDUCE_PERCENTILE_95
      groupByFields:
      - resource.label.service_name
notificationChannels:
- $NOTIFICATION_CHANNEL
alertStrategy:
  autoClose: 86400s
EOF

    gcloud alpha monitoring policies create --policy-from-file=/tmp/latency-alert.yaml
    log_success "High latency alert created"
    rm /tmp/latency-alert.yaml
fi

# Service down alert
if [ -n "$NOTIFICATION_CHANNEL" ]; then
    cat > /tmp/service-down-alert.yaml << EOF
displayName: "C12USD Service Down"
documentation:
  content: "C12USD backend service has no active instances or is not receiving requests."
  mimeType: "text/markdown"
conditions:
- displayName: "Service has no instances"
  conditionThreshold:
    filter: 'resource.type="cloud_run_revision" resource.label.service_name=~"c12usd-backend.*" metric.type="run.googleapis.com/container/instance_count"'
    comparison: COMPARISON_EQUAL
    thresholdValue: 0
    duration: 180s
    aggregations:
    - alignmentPeriod: 60s
      perSeriesAligner: ALIGN_MAX
      crossSeriesReducer: REDUCE_MAX
      groupByFields:
      - resource.label.service_name
notificationChannels:
- $NOTIFICATION_CHANNEL
alertStrategy:
  autoClose: 3600s
EOF

    gcloud alpha monitoring policies create --policy-from-file=/tmp/service-down-alert.yaml
    log_success "Service down alert created"
    rm /tmp/service-down-alert.yaml
fi

# Create uptime checks
log_info "Creating uptime checks..."

# Production uptime check
PROD_URL=$(gcloud run services describe c12usd-backend-prod --region=us-central1 --format='value(status.url)' 2>/dev/null || echo "")
if [ -n "$PROD_URL" ]; then
    cat > /tmp/prod-uptime-check.json << EOF
{
  "displayName": "C12USD Production Health Check",
  "monitoredResource": {
    "type": "uptime_url",
    "labels": {
      "project_id": "$PROJECT_ID",
      "host": "$(echo $PROD_URL | sed 's|https://||' | sed 's|/.*||')"
    }
  },
  "httpCheck": {
    "path": "/health",
    "port": 443,
    "useSsl": true
  },
  "period": "300s",
  "timeout": "10s"
}
EOF

    gcloud monitoring uptime create --config-from-file=/tmp/prod-uptime-check.json
    log_success "Production uptime check created"
    rm /tmp/prod-uptime-check.json
else
    log_warning "Production service not found. Skipping production uptime check."
fi

# Create log-based metrics
log_info "Creating log-based metrics..."

# Error log metric
gcloud logging metrics create c12usd_error_count \
    --description="Count of error-level logs from C12USD services" \
    --log-filter='resource.type="cloud_run_revision" resource.labels.service_name=~"c12usd-backend.*" severity>=ERROR' || true

# Successful transaction metric
gcloud logging metrics create c12usd_transactions \
    --description="Count of successful transactions from C12USD services" \
    --log-filter='resource.type="cloud_run_revision" resource.labels.service_name=~"c12usd-backend.*" jsonPayload.event="transaction_completed"' || true

log_success "Log-based metrics created"

# Create custom dashboard URL
DASHBOARD_URL="https://console.cloud.google.com/monitoring/dashboards/custom?project=$PROJECT_ID"

log_info "Monitoring setup completed!"
echo ""
echo -e "${GREEN}Dashboard URL:${NC} $DASHBOARD_URL"
echo -e "${GREEN}Uptime Checks:${NC} https://console.cloud.google.com/monitoring/uptime?project=$PROJECT_ID"
echo -e "${GREEN}Alert Policies:${NC} https://console.cloud.google.com/monitoring/alerting/policies?project=$PROJECT_ID"
echo -e "${GREEN}Logs:${NC} https://console.cloud.google.com/logs/query?project=$PROJECT_ID"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit the monitoring dashboard to view metrics"
echo "2. Test alert notifications by triggering conditions"
echo "3. Customize alert thresholds based on your requirements"
echo "4. Set up additional custom metrics as needed"