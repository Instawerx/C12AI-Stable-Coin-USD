#!/bin/bash

# C12USD - GCP Secret Manager Setup Script
# This script creates and manages secrets in Google Cloud Secret Manager

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="c12ai-dao"
REGION="us-central1"

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

# Function to create or update a secret
create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    local description=$3

    log_info "Setting up secret: $secret_name"

    # Check if secret exists
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        log_warning "Secret $secret_name already exists. Adding new version..."
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID"
    else
        log_info "Creating new secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --project="$PROJECT_ID" \
            --labels="environment=production,component=c12usd"

        # Add description if provided
        if [[ -n "$description" ]]; then
            gcloud secrets update "$secret_name" \
                --update-labels="description=$description" \
                --project="$PROJECT_ID"
        fi
    fi

    log_success "Secret $secret_name configured successfully"
}

# Function to prompt for secret value
prompt_for_secret() {
    local secret_name=$1
    local description=$2
    local default_value=$3

    echo ""
    log_info "Setting up: $secret_name"
    echo "Description: $description"

    if [[ -n "$default_value" ]]; then
        echo "Default/Current: $default_value"
        read -p "Enter new value (or press Enter to use default): " -s secret_value
        echo ""
        if [[ -z "$secret_value" ]]; then
            secret_value="$default_value"
        fi
    else
        read -p "Enter value: " -s secret_value
        echo ""
    fi

    if [[ -z "$secret_value" ]]; then
        log_error "Secret value cannot be empty"
        return 1
    fi

    create_or_update_secret "$secret_name" "$secret_value" "$description"
}

main() {
    log_info "Starting GCP Secret Manager setup for C12USD..."
    log_info "Project: $PROJECT_ID"

    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "No active gcloud authentication found. Please run 'gcloud auth login' first."
        exit 1
    fi

    # Enable Secret Manager API
    log_info "Enabling Secret Manager API..."
    gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"

    # Database Configuration
    log_info "=== Database Configuration ==="
    prompt_for_secret "prod_database_url" \
        "Production PostgreSQL database connection string" \
        "postgresql://c12usd_user:SECURE_PASSWORD@CLOUD_SQL_IP:5432/c12usd_production?sslmode=require"

    prompt_for_secret "staging_database_url" \
        "Staging PostgreSQL database connection string" \
        "postgresql://c12usd_user:SECURE_PASSWORD@CLOUD_SQL_IP:5432/c12usd_staging?sslmode=require"

    # Blockchain RPC URLs
    log_info "=== Blockchain Configuration ==="
    prompt_for_secret "bsc_rpc_url" \
        "BSC Mainnet RPC URL (e.g., from Moralis, Alchemy, or QuickNode)" \
        "https://bsc-dataseed1.binance.org/"

    prompt_for_secret "polygon_rpc_url" \
        "Polygon Mainnet RPC URL (e.g., from Moralis, Alchemy, or QuickNode)" \
        "https://polygon-rpc.com/"

    # Private Key for Contract Operations
    log_warning "=== CRITICAL: Private Key Setup ==="
    echo "⚠️  This private key will be used for contract deployments and operations"
    echo "⚠️  Make sure this is from your production MetaMask wallet"
    echo "⚠️  Ensure the wallet has sufficient ETH/BNB for gas fees"
    prompt_for_secret "ops_signer_key" \
        "Private key for contract operations (WITHOUT 0x prefix)" \
        ""

    # API Keys for Blockchain Scanners
    log_info "=== Blockchain Scanner API Keys ==="
    prompt_for_secret "bscscan_api_key" \
        "BSCScan API key for contract verification" \
        ""

    prompt_for_secret "polygonscan_api_key" \
        "PolygonScan API key for contract verification" \
        ""

    # Payment Provider Secrets
    log_info "=== Payment Provider Configuration ==="
    prompt_for_secret "stripe_secret_key" \
        "Stripe Secret Key (live)" \
        ""

    prompt_for_secret "stripe_webhook_secret" \
        "Stripe Webhook Secret" \
        ""

    prompt_for_secret "cashapp_client_secret" \
        "Cash App Client Secret" \
        ""

    prompt_for_secret "cashapp_access_token" \
        "Cash App Access Token" \
        ""

    # JWT and Security
    log_info "=== Security Configuration ==="

    # Generate a secure JWT secret if not provided
    jwt_secret=$(openssl rand -base64 64 | tr -d "\\n")
    create_or_update_secret "jwt_secret" "$jwt_secret" "JWT signing secret"

    # Generate backup encryption key
    backup_key=$(openssl rand -base64 32 | tr -d "\\n")
    create_or_update_secret "backup_encryption_key" "$backup_key" "Backup encryption key"

    # Service Account Key (for CI/CD)
    log_info "=== Service Account Configuration ==="
    log_warning "Service account key should be added to GitHub Secrets manually"
    log_info "Use the key created by the setup.sh script: deploy/gcp/scripts/c12ai-dao-terraform-key.json"

    # Grant Cloud Run access to secrets
    log_info "=== Setting up IAM permissions for Cloud Run ==="

    SERVICE_ACCOUNT="c12usd-service@$PROJECT_ID.iam.gserviceaccount.com"

    log_info "Granting Secret Manager access to service account: $SERVICE_ACCOUNT"
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor"

    # Summary
    echo ""
    log_success "Secret Manager setup completed!"
    echo ""
    echo "Secrets created:"
    gcloud secrets list --project="$PROJECT_ID" --filter="labels.component=c12usd" --format="table(name,createTime,labels)"

    echo ""
    log_info "Next steps:"
    echo "1. Add the GCP service account key to GitHub Secrets as GCP_SA_KEY"
    echo "2. Update your .env.production file to reference these secrets"
    echo "3. Test the deployment pipeline"
    echo "4. Deploy smart contracts using: npm run deploy:production"
    echo "5. Deploy backend services using: npm run deploy:prod"

    echo ""
    log_warning "Security reminders:"
    echo "- Never commit .env.production to version control"
    echo "- Regularly rotate sensitive secrets"
    echo "- Monitor secret access logs"
    echo "- Use principle of least privilege for service accounts"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi