#!/bin/bash
# Setup Workload Identity Federation for C12USD deployment pipeline

set -euo pipefail

# Configuration variables
PROJECT_ID="${1:-}"
GITHUB_REPO="${2:-c12ai/c12usd}"
WIF_POOL_NAME="github-actions-pool"
WIF_PROVIDER_NAME="github-actions-provider"
SERVICE_ACCOUNT_NAME="cloudbuild-sa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

# Check if required parameters are provided
if [ -z "$PROJECT_ID" ]; then
    log_error "Usage: $0 <PROJECT_ID> [GITHUB_REPO]"
    log_error "Example: $0 my-gcp-project c12ai/c12usd"
    exit 1
fi

log_info "Setting up Workload Identity Federation for project: $PROJECT_ID"
log_info "GitHub repository: $GITHUB_REPO"

# Set the project
log_info "Setting up GCP project..."
gcloud config set project "$PROJECT_ID"

# Enable required APIs
log_info "Enabling required Google Cloud APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    iamcredentials.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com

log_success "APIs enabled successfully"

# Create Artifact Registry repository
log_info "Creating Artifact Registry repository..."
gcloud artifacts repositories create c12usd-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="C12USD Docker images repository" || true

log_success "Artifact Registry repository created"

# Create service account
log_info "Creating service account for Cloud Build and Cloud Run..."
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
    --display-name="C12USD Cloud Build Service Account" \
    --description="Service account for C12USD deployment pipeline" || true

SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
log_success "Service account created: $SERVICE_ACCOUNT_EMAIL"

# Grant necessary IAM roles to service account
log_info "Granting IAM roles to service account..."

# Roles for Cloud Build
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudbuild.builds.builder"

# Roles for Artifact Registry
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/artifactregistry.writer"

# Roles for Cloud Run
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/run.developer"

# Roles for Secret Manager
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

# Roles for IAM (for service account impersonation)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# Basic roles
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.admin"

log_success "IAM roles granted successfully"

# Create Workload Identity Pool
log_info "Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "$WIF_POOL_NAME" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --description="Workload Identity Pool for GitHub Actions" || true

WIF_POOL_RESOURCE="projects/$PROJECT_ID/locations/global/workloadIdentityPools/$WIF_POOL_NAME"
log_success "Workload Identity Pool created: $WIF_POOL_RESOURCE"

# Create Workload Identity Provider
log_info "Creating Workload Identity Provider..."
gcloud iam workload-identity-pools providers create-oidc "$WIF_PROVIDER_NAME" \
    --workload-identity-pool="$WIF_POOL_NAME" \
    --location="global" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor,attribute.aud=assertion.aud" \
    --attribute-condition="assertion.repository=='$GITHUB_REPO'" || true

WIF_PROVIDER_RESOURCE="$WIF_POOL_RESOURCE/providers/$WIF_PROVIDER_NAME"
log_success "Workload Identity Provider created: $WIF_PROVIDER_RESOURCE"

# Allow the Workload Identity Provider to impersonate the service account
log_info "Binding Workload Identity to service account..."
gcloud iam service-accounts add-iam-policy-binding \
    "$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/$WIF_POOL_RESOURCE/attribute.repository/$GITHUB_REPO"

log_success "Workload Identity binding completed"

# Create secrets for environment variables
log_info "Creating secrets in Secret Manager..."

# Database URLs (placeholder - update with actual values)
echo "postgresql://user:password@prod-host:5432/c12usd_production" | \
    gcloud secrets create prod-database-url --data-file=- || \
    echo "postgresql://user:password@prod-host:5432/c12usd_production" | \
    gcloud secrets versions add prod-database-url --data-file=-

echo "postgresql://user:password@staging-host:5432/c12usd_staging" | \
    gcloud secrets create staging-database-url --data-file=- || \
    echo "postgresql://user:password@staging-host:5432/c12usd_staging" | \
    gcloud secrets versions add staging-database-url --data-file=-

# RPC URLs (placeholder - update with actual values)
echo "https://bsc-dataseed1.binance.org/" | \
    gcloud secrets create bsc-rpc-url --data-file=- || \
    echo "https://bsc-dataseed1.binance.org/" | \
    gcloud secrets versions add bsc-rpc-url --data-file=-

echo "https://polygon-rpc.com/" | \
    gcloud secrets create polygon-rpc-url --data-file=- || \
    echo "https://polygon-rpc.com/" | \
    gcloud secrets versions add polygon-rpc-url --data-file=-

# Operations signer key (placeholder - update with actual value)
echo "0x0000000000000000000000000000000000000000000000000000000000000000" | \
    gcloud secrets create ops-signer-key --data-file=- || \
    echo "0x0000000000000000000000000000000000000000000000000000000000000000" | \
    gcloud secrets versions add ops-signer-key --data-file=-

log_success "Secrets created successfully"

# Output configuration for GitHub
log_info "Configuration completed! Add the following secrets to your GitHub repository:"
echo ""
echo -e "${GREEN}GitHub Secrets to add:${NC}"
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo "WIF_PROVIDER: $WIF_PROVIDER_RESOURCE"
echo ""
echo -e "${GREEN}GitHub Environments to create:${NC}"
echo "1. 'staging' - for develop branch deployments"
echo "2. 'production' - for main branch deployments (with approval required)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to Secrets and Variables > Actions"
echo "3. Add the above secrets"
echo "4. Navigate to Environments"
echo "5. Create 'staging' and 'production' environments"
echo "6. For 'production', enable required reviewers"
echo "7. Update the secret values in Google Secret Manager with actual values"
echo ""
echo -e "${GREEN}Deployment pipeline is now ready!${NC}"