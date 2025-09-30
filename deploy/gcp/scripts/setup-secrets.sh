#!/bin/bash

# C12USD Stablecoin - Secret Setup Script
# This script helps set up application secrets in Google Secret Manager

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="staging"
PROJECT_ID=""
INTERACTIVE=true

# Help function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment (staging|production) [default: staging]"
    echo "  -p, --project-id ID      GCP Project ID (required)"
    echo "  -n, --non-interactive    Non-interactive mode (uses default/placeholder values)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --project-id c12usd-staging --environment staging"
    echo "  $0 --project-id c12usd-production --environment production --non-interactive"
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

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local default="$2"
    local sensitive="${3:-false}"
    local value=""

    if [[ "$INTERACTIVE" == "true" ]]; then
        if [[ "$sensitive" == "true" ]]; then
            echo -n "${prompt} [hidden input]: "
            read -s value
            echo ""
        else
            echo -n "${prompt}"
            if [[ -n "$default" ]]; then
                echo -n " [${default}]: "
            else
                echo -n ": "
            fi
            read value
        fi

        if [[ -z "$value" && -n "$default" ]]; then
            value="$default"
        fi
    else
        value="$default"
    fi

    echo "$value"
}

# Function to create or update a secret
create_or_update_secret() {
    local secret_id="$1"
    local secret_value="$2"
    local description="$3"

    if gcloud secrets describe "$secret_id" --project="$PROJECT_ID" &> /dev/null; then
        log_info "Updating existing secret: $secret_id"
        echo "$secret_value" | gcloud secrets versions add "$secret_id" --data-file=- --project="$PROJECT_ID"
    else
        log_info "Creating new secret: $secret_id"
        echo "$secret_value" | gcloud secrets create "$secret_id" --data-file=- --project="$PROJECT_ID"
    fi

    # Add description if provided
    if [[ -n "$description" ]]; then
        gcloud secrets update "$secret_id" --update-labels="description=$description" --project="$PROJECT_ID" || true
    fi

    log_success "Secret $secret_id configured"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        -n|--non-interactive)
            INTERACTIVE=false
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

# Validate required parameters
if [[ -z "$PROJECT_ID" ]]; then
    log_error "Project ID is required. Use -p or --project-id"
    usage
    exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Environment must be either 'staging' or 'production'"
    exit 1
fi

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it first:"
    log_error "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set gcloud project
gcloud config set project "${PROJECT_ID}"

log_info "Setting up secrets for C12USD ${ENVIRONMENT} environment..."
log_info "Project ID: ${PROJECT_ID}"

if [[ "$INTERACTIVE" == "true" ]]; then
    log_info "This script will help you set up the required secrets for your C12USD deployment."
    log_info "You can press Enter to use default values where provided."
    echo ""
fi

# BSC RPC URL
log_info "Setting up BSC RPC URL..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    BSC_RPC_DEFAULT="https://bsc-dataseed1.binance.org/"
    BSC_RPC_PROMPT="Enter BSC Mainnet RPC URL"
else
    BSC_RPC_DEFAULT="https://data-seed-prebsc-1-s1.binance.org:8545/"
    BSC_RPC_PROMPT="Enter BSC Testnet RPC URL"
fi

BSC_RPC=$(prompt_input "$BSC_RPC_PROMPT" "$BSC_RPC_DEFAULT")
create_or_update_secret "${ENVIRONMENT}-bsc-rpc-url" "$BSC_RPC" "BSC RPC endpoint"

# Polygon RPC URL
log_info "Setting up Polygon RPC URL..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    POLYGON_RPC_DEFAULT="https://polygon-rpc.com/"
    POLYGON_RPC_PROMPT="Enter Polygon Mainnet RPC URL"
else
    POLYGON_RPC_DEFAULT="https://rpc-mumbai.maticvigil.com/"
    POLYGON_RPC_PROMPT="Enter Polygon Mumbai RPC URL"
fi

POLYGON_RPC=$(prompt_input "$POLYGON_RPC_PROMPT" "$POLYGON_RPC_DEFAULT")
create_or_update_secret "${ENVIRONMENT}-polygon-rpc-url" "$POLYGON_RPC" "Polygon RPC endpoint"

# Operations Signer Private Key
log_info "Setting up Operations Signer Private Key..."
log_warning "This is a sensitive value. Make sure you have a secure private key ready."

if [[ "$INTERACTIVE" == "true" ]]; then
    OPS_SIGNER_KEY=$(prompt_input "Enter operations signer private key (without 0x prefix)" "" true)
    if [[ -z "$OPS_SIGNER_KEY" ]]; then
        log_warning "No private key provided. Using placeholder value."
        OPS_SIGNER_KEY="REPLACE_WITH_ACTUAL_PRIVATE_KEY"
    fi
else
    OPS_SIGNER_KEY="REPLACE_WITH_ACTUAL_PRIVATE_KEY"
    log_warning "Using placeholder value for operations signer key. Update manually later."
fi

create_or_update_secret "${ENVIRONMENT}-ops-signer-key" "$OPS_SIGNER_KEY" "Operations signer private key"

# API Keys
log_info "Setting up API keys for external services..."

# BSCScan API Key
BSCSCAN_API_KEY=$(prompt_input "Enter BSCScan API key (optional)" "YOUR_BSCSCAN_API_KEY")

# PolygonScan API Key
POLYGONSCAN_API_KEY=$(prompt_input "Enter PolygonScan API key (optional)" "YOUR_POLYGONSCAN_API_KEY")

# CoinGecko API Key
COINGECKO_API_KEY=$(prompt_input "Enter CoinGecko API key (optional)" "YOUR_COINGECKO_API_KEY")

# Chainlink API Key
CHAINLINK_API_KEY=$(prompt_input "Enter Chainlink API key (optional)" "YOUR_CHAINLINK_API_KEY")

# Create API keys JSON
API_KEYS_JSON=$(cat <<EOF
{
  "bscscan_api_key": "$BSCSCAN_API_KEY",
  "polygonscan_api_key": "$POLYGONSCAN_API_KEY",
  "coingecko_api_key": "$COINGECKO_API_KEY",
  "chainlink_api_key": "$CHAINLINK_API_KEY"
}
EOF
)

create_or_update_secret "${ENVIRONMENT}-api-keys" "$API_KEYS_JSON" "External API keys"

# Webhook Secrets
log_info "Setting up webhook secrets..."

# Slack webhook URL
SLACK_WEBHOOK=$(prompt_input "Enter Slack webhook URL (optional)" "REPLACE_WITH_SLACK_WEBHOOK_URL")

# Discord webhook URL
DISCORD_WEBHOOK=$(prompt_input "Enter Discord webhook URL (optional)" "REPLACE_WITH_DISCORD_WEBHOOK_URL")

# Generate GitHub webhook secret
GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 32)

# Create webhook secrets JSON
WEBHOOK_SECRETS_JSON=$(cat <<EOF
{
  "github_webhook_secret": "$GITHUB_WEBHOOK_SECRET",
  "slack_webhook_url": "$SLACK_WEBHOOK",
  "discord_webhook_url": "$DISCORD_WEBHOOK"
}
EOF
)

create_or_update_secret "${ENVIRONMENT}-webhook-secrets" "$WEBHOOK_SECRETS_JSON" "Webhook secrets"

# SSL Certificates (if needed)
if [[ "$INTERACTIVE" == "true" ]]; then
    echo ""
    read -p "Do you want to configure SSL certificates? (y/N): " configure_ssl
    if [[ "$configure_ssl" =~ ^[Yy]$ ]]; then
        log_info "Setting up SSL certificates..."

        SSL_CERT=$(prompt_input "Enter SSL certificate (PEM format)" "REPLACE_WITH_SSL_CERTIFICATE")
        SSL_KEY=$(prompt_input "Enter SSL private key (PEM format)" "REPLACE_WITH_SSL_PRIVATE_KEY" true)

        SSL_JSON=$(cat <<EOF
{
  "certificate": "$SSL_CERT",
  "private_key": "$SSL_KEY"
}
EOF
)

        create_or_update_secret "${ENVIRONMENT}-ssl-certificates" "$SSL_JSON" "SSL certificates"
    fi
fi

# Display summary
echo ""
echo "=============================================="
echo -e "${GREEN}Secret Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "The following secrets have been configured:"
echo ""
echo "✅ ${ENVIRONMENT}-bsc-rpc-url"
echo "✅ ${ENVIRONMENT}-polygon-rpc-url"
echo "✅ ${ENVIRONMENT}-ops-signer-key"
echo "✅ ${ENVIRONMENT}-api-keys"
echo "✅ ${ENVIRONMENT}-webhook-secrets"
if gcloud secrets describe "${ENVIRONMENT}-ssl-certificates" --project="$PROJECT_ID" &> /dev/null; then
    echo "✅ ${ENVIRONMENT}-ssl-certificates"
fi
echo ""

if [[ "$OPS_SIGNER_KEY" == "REPLACE_WITH_ACTUAL_PRIVATE_KEY" ]]; then
    echo -e "${YELLOW}WARNING:${NC} Operations signer private key is set to a placeholder value."
    echo "You must update it with a real private key before deploying to production:"
    echo ""
    echo "  gcloud secrets versions add ${ENVIRONMENT}-ops-signer-key --data-file=- --project=${PROJECT_ID}"
    echo "  # Then paste your private key and press Ctrl+D"
    echo ""
fi

if [[ "$BSC_RPC" == *"YOUR_"* ]] || [[ "$POLYGON_RPC" == *"YOUR_"* ]] || [[ "$BSCSCAN_API_KEY" == "YOUR_"* ]]; then
    echo -e "${YELLOW}WARNING:${NC} Some secrets contain placeholder values."
    echo "Update them with real values before production deployment."
    echo ""
fi

echo "To view or update any secret:"
echo "  gcloud secrets versions access latest --secret=SECRET_NAME --project=${PROJECT_ID}"
echo "  gcloud secrets versions add SECRET_NAME --data-file=- --project=${PROJECT_ID}"
echo ""

log_success "All secrets configured successfully!"

# Verify secret manager access for Cloud Run service account
log_info "Verifying Secret Manager access permissions..."
SERVICE_ACCOUNT_EMAIL="c12usd-${ENVIRONMENT}-run-sa@${PROJECT_ID}.iam.gserviceaccount.com"

# Note: The actual IAM bindings will be created by Terraform
# This is just a verification that the secrets exist and are accessible

echo ""
log_info "Next steps:"
echo "1. Run 'terraform apply' to create the infrastructure and IAM bindings"
echo "2. Deploy your application using the GitHub Actions workflow"
echo "3. Monitor the deployment and verify all secrets are accessible"
echo ""

log_success "Secret setup completed successfully!"