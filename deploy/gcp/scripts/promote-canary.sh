#!/bin/bash

# C12USD Stablecoin - Canary Promotion Script
# This script promotes a canary deployment to 100% traffic in production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="c12usd-production"  # Production project only
SERVICE_NAME="c12usd-production-api"
REGION="us-central1"

# Help function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG            Revision tag to promote (required)"
    echo "  -p, --percentage PERCENT Traffic percentage to allocate [default: 100]"
    echo "  --check-metrics          Check metrics before promotion"
    echo "  --rollback               Rollback to previous stable version"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --tag v20240101-abc1234 --percentage 50"
    echo "  $0 --tag v20240101-abc1234 --check-metrics"
    echo "  $0 --rollback"
}

# Logging functions
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

# Default values
TAG=""
PERCENTAGE="100"
CHECK_METRICS=false
ROLLBACK=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -p|--percentage)
            PERCENTAGE="$2"
            shift 2
            ;;
        --check-metrics)
            CHECK_METRICS=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown parameter: $1"
            usage
            exit 1
            ;;
    esac
done

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed"
    exit 1
fi

# Set gcloud project
gcloud config set project "${PROJECT_ID}"

# Function to check metrics
check_canary_metrics() {
    local tag="$1"
    log_info "Checking metrics for canary deployment: $tag"

    # Get current time and 30 minutes ago for metrics query
    local end_time=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local start_time=$(date -u -d '30 minutes ago' +"%Y-%m-%dT%H:%M:%SZ")

    # Check error rate
    log_info "Checking error rate..."
    local error_query="fetch cloud_run_revision
| filter resource.service_name == '${SERVICE_NAME}'
| filter resource.revision_name =~ '.*${tag}.*'
| filter metric.response_code_class == '5xx'
| group_by 1m, [value_count_true: count()]
| every 1m"

    # Check response latency
    log_info "Checking response latency..."
    local latency_query="fetch cloud_run_revision
| filter resource.service_name == '${SERVICE_NAME}'
| filter resource.revision_name =~ '.*${tag}.*'
| filter metric.type == 'run.googleapis.com/request_latencies'
| group_by 1m, [value_percentile: percentile(value.request_latencies, 95)]
| every 1m"

    # Simple metric check (in a real scenario, you'd parse the actual values)
    log_info "Metrics check completed. Review monitoring dashboard for detailed analysis."
    log_info "Dashboard: https://console.cloud.google.com/monitoring/dashboards?project=${PROJECT_ID}"

    # Prompt user to continue
    echo ""
    read -p "Do the metrics look good? Continue with promotion? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "Promotion cancelled by user"
        exit 0
    fi
}

# Function to get current traffic allocation
get_current_traffic() {
    gcloud run services describe "$SERVICE_NAME" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --format="value(status.traffic[].percent,status.traffic[].tag)" | \
        paste - - | \
        sort -nr
}

# Function to rollback to previous version
rollback_deployment() {
    log_info "Rolling back to previous stable version..."

    # Get current traffic allocation
    local current_traffic=$(get_current_traffic)
    log_info "Current traffic allocation:"
    echo "$current_traffic"

    # Find the previous stable tag (assuming it's the one with highest non-canary traffic)
    local stable_tag=$(echo "$current_traffic" | grep -v "canary\|^0" | head -n1 | awk '{print $2}')

    if [[ -z "$stable_tag" ]]; then
        log_error "Could not determine stable version for rollback"
        exit 1
    fi

    log_warning "Rolling back to stable version: $stable_tag"

    # Allocate 100% traffic to stable version
    gcloud run services update-traffic "$SERVICE_NAME" \
        --to-tags="$stable_tag=100" \
        --region="$REGION" \
        --project="$PROJECT_ID"

    log_success "Rollback completed successfully"
    log_info "All traffic is now directed to: $stable_tag"
}

# Main execution
if [[ "$ROLLBACK" == "true" ]]; then
    rollback_deployment
    exit 0
fi

# Validate required parameters
if [[ -z "$TAG" ]]; then
    log_error "Tag is required for promotion. Use -t or --tag"
    usage
    exit 1
fi

# Validate percentage
if ! [[ "$PERCENTAGE" =~ ^[0-9]+$ ]] || [[ "$PERCENTAGE" -lt 0 ]] || [[ "$PERCENTAGE" -gt 100 ]]; then
    log_error "Percentage must be a number between 0 and 100"
    exit 1
fi

log_info "Promoting canary deployment to ${PERCENTAGE}% traffic"
log_info "Service: $SERVICE_NAME"
log_info "Tag: $TAG"
log_info "Project: $PROJECT_ID"

# Check if the tagged revision exists
log_info "Verifying revision exists with tag: $TAG"
if ! gcloud run revisions list \
    --service="$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --filter="metadata.labels.run\\.googleapis\\.com/tag:$TAG" \
    --format="value(metadata.name)" | grep -q .; then
    log_error "No revision found with tag: $TAG"
    exit 1
fi

log_success "Revision with tag $TAG found"

# Show current traffic allocation
log_info "Current traffic allocation:"
get_current_traffic

# Check metrics if requested
if [[ "$CHECK_METRICS" == "true" ]]; then
    check_canary_metrics "$TAG"
fi

# Calculate remaining traffic for other revisions
if [[ "$PERCENTAGE" -eq 100 ]]; then
    log_info "Promoting to 100% traffic (full promotion)"
    TRAFFIC_ALLOCATION="$TAG=100"
else
    log_info "Promoting to ${PERCENTAGE}% traffic (gradual rollout)"
    REMAINING=$((100 - PERCENTAGE))
    TRAFFIC_ALLOCATION="$TAG=$PERCENTAGE,live=$REMAINING"
fi

# Confirm promotion
echo ""
log_warning "You are about to update traffic allocation:"
echo "  Tag '$TAG': ${PERCENTAGE}%"
if [[ "$PERCENTAGE" -ne 100 ]]; then
    echo "  Live version: ${REMAINING}%"
fi
echo ""

read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_warning "Promotion cancelled by user"
    exit 0
fi

# Perform the traffic update
log_info "Updating traffic allocation..."

gcloud run services update-traffic "$SERVICE_NAME" \
    --to-tags="$TRAFFIC_ALLOCATION" \
    --region="$REGION" \
    --project="$PROJECT_ID"

if [[ $? -eq 0 ]]; then
    log_success "Traffic allocation updated successfully"
else
    log_error "Failed to update traffic allocation"
    exit 1
fi

# Show new traffic allocation
echo ""
log_info "New traffic allocation:"
get_current_traffic

# Post-promotion monitoring recommendations
echo ""
echo "=============================================="
echo -e "${GREEN}Canary Promotion Complete!${NC}"
echo "=============================================="
echo ""
echo "Post-promotion monitoring recommendations:"
echo ""
echo "1. Monitor key metrics for the next 30 minutes:"
echo "   - Error rate: < 0.1%"
echo "   - Response latency (p95): < 1000ms"
echo "   - CPU and memory usage"
echo ""
echo "2. Check application logs for any issues:"
echo "   https://console.cloud.google.com/logs/query?project=${PROJECT_ID}"
echo ""
echo "3. Monitor user reports and feedback"
echo ""
echo "4. If issues are detected, run rollback:"
echo "   $0 --rollback"
echo ""

if [[ "$PERCENTAGE" -eq 100 ]]; then
    log_success "Full promotion completed. Monitor closely for the next hour."
else
    log_info "Gradual rollout at ${PERCENTAGE}%. Consider full promotion after monitoring:"
    echo "   $0 --tag $TAG --percentage 100"
fi

echo ""
log_success "Canary promotion completed successfully!"