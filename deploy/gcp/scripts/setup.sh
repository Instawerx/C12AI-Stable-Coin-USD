#!/bin/bash

# C12USD Stablecoin - GCP Initial Setup Script
# This script sets up the initial GCP project and enables required APIs

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Default values
ENVIRONMENT="staging"
PROJECT_ID=""
REGION="us-central1"
ZONE="us-central1-a"

# Help function
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV    Environment (staging|production) [default: staging]"
    echo "  -p, --project-id ID      GCP Project ID (required)"
    echo "  -r, --region REGION      GCP Region [default: us-central1]"
    echo "  -z, --zone ZONE          GCP Zone [default: us-central1-a]"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --project-id c12usd-staging --environment staging"
    echo "  $0 --project-id c12usd-production --environment production"
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
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -z|--zone)
            ZONE="$2"
            shift 2
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

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it first:"
    log_error "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    log_error "Terraform is not installed. Please install it first:"
    log_error "https://learn.hashicorp.com/tutorials/terraform/install-cli"
    exit 1
fi

log_info "Starting GCP setup for C12USD ${ENVIRONMENT} environment..."
log_info "Project ID: ${PROJECT_ID}"
log_info "Region: ${REGION}"
log_info "Zone: ${ZONE}"

# Set gcloud project
log_info "Setting gcloud project..."
gcloud config set project "${PROJECT_ID}"

# Enable required APIs
log_info "Enabling required Google Cloud APIs..."

REQUIRED_APIS=(
    "cloudbuild.googleapis.com"
    "run.googleapis.com"
    "sqladmin.googleapis.com"
    "secretmanager.googleapis.com"
    "iam.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "servicenetworking.googleapis.com"
    "vpcaccess.googleapis.com"
    "monitoring.googleapis.com"
    "logging.googleapis.com"
    "containerregistry.googleapis.com"
    "artifactregistry.googleapis.com"
    "cloudkms.googleapis.com"
    "cloudasset.googleapis.com"
    "securitycenter.googleapis.com"
    "binaryauthorization.googleapis.com"
    "compute.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    log_info "Enabling ${api}..."
    gcloud services enable "${api}" --project="${PROJECT_ID}"
done

log_success "All APIs enabled successfully"

# Create Terraform state bucket
STATE_BUCKET="${PROJECT_ID}-terraform-state"
log_info "Creating Terraform state bucket: ${STATE_BUCKET}..."

if gsutil ls "gs://${STATE_BUCKET}" &> /dev/null; then
    log_warning "Terraform state bucket already exists"
else
    gsutil mb -p "${PROJECT_ID}" -c STANDARD -l "${REGION}" "gs://${STATE_BUCKET}"
    gsutil versioning set on "gs://${STATE_BUCKET}"
    gsutil lifecycle set "${SCRIPT_DIR}/bucket-lifecycle.json" "gs://${STATE_BUCKET}"
    log_success "Terraform state bucket created and configured"
fi

# Create service account for Terraform/CI-CD
SERVICE_ACCOUNT_NAME="terraform-sa"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

log_info "Creating service account for Terraform: ${SERVICE_ACCOUNT_EMAIL}..."

if gcloud iam service-accounts describe "${SERVICE_ACCOUNT_EMAIL}" --project="${PROJECT_ID}" &> /dev/null; then
    log_warning "Service account already exists"
else
    gcloud iam service-accounts create "${SERVICE_ACCOUNT_NAME}" \
        --display-name="Terraform Service Account" \
        --description="Service account for Terraform deployments" \
        --project="${PROJECT_ID}"
    log_success "Service account created"
fi

# Grant necessary roles to the service account
log_info "Granting IAM roles to service account..."

TERRAFORM_ROLES=(
    "roles/owner"                           # For full infrastructure management
    "roles/storage.admin"                   # For state bucket access
    "roles/secretmanager.admin"             # For secret management
    "roles/artifactregistry.admin"          # For container registry
    "roles/cloudsql.admin"                  # For database management
    "roles/run.admin"                       # For Cloud Run management
    "roles/compute.admin"                   # For networking
    "roles/iam.serviceAccountAdmin"         # For service account management
    "roles/iam.serviceAccountKeyAdmin"      # For service account keys
    "roles/cloudkms.admin"                  # For encryption keys
    "roles/monitoring.admin"                # For monitoring setup
    "roles/logging.admin"                   # For logging setup
    "roles/binaryauthorization.policyEditor" # For container security
)

for role in "${TERRAFORM_ROLES[@]}"; do
    gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="${role}"
done

log_success "IAM roles granted to service account"

# Create and download service account key
KEY_FILE="${SCRIPT_DIR}/${PROJECT_ID}-terraform-key.json"
log_info "Creating service account key..."

gcloud iam service-accounts keys create "${KEY_FILE}" \
    --iam-account="${SERVICE_ACCOUNT_EMAIL}" \
    --project="${PROJECT_ID}"

log_success "Service account key created: ${KEY_FILE}"
log_warning "IMPORTANT: Store this key securely and add it to your GitHub secrets as GCP_SA_KEY"

# Initialize Terraform
log_info "Initializing Terraform..."
cd "${PROJECT_ROOT}/deploy/gcp/terraform"

terraform init -backend-config="bucket=${STATE_BUCKET}"

log_success "Terraform initialized successfully"

# Validate Terraform configuration
log_info "Validating Terraform configuration..."
terraform validate

log_success "Terraform configuration is valid"

# Create initial terraform.tfvars file if it doesn't exist
TFVARS_FILE="${PROJECT_ROOT}/deploy/gcp/environments/${ENVIRONMENT}.tfvars.local"
if [[ ! -f "$TFVARS_FILE" ]]; then
    log_info "Creating local tfvars file: ${TFVARS_FILE}"
    cp "${PROJECT_ROOT}/deploy/gcp/environments/${ENVIRONMENT}.tfvars" "$TFVARS_FILE"

    # Update project_id in the local file
    sed -i.bak "s/project_id.*=.*\".*\"/project_id = \"${PROJECT_ID}\"/" "$TFVARS_FILE"
    rm "${TFVARS_FILE}.bak" 2>/dev/null || true

    log_success "Local tfvars file created. Please review and update: ${TFVARS_FILE}"
fi

# Check if we can create a Terraform plan
log_info "Creating initial Terraform plan..."
terraform plan -var-file="../environments/${ENVIRONMENT}.tfvars" -var="project_id=${PROJECT_ID}" -out=tfplan

log_success "Terraform plan created successfully"

# Provide next steps
echo ""
echo "=============================================="
echo -e "${GREEN}GCP Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Review and update the configuration file:"
echo "   ${TFVARS_FILE}"
echo ""
echo "2. Add the service account key to GitHub Secrets:"
echo "   - Go to your GitHub repository settings"
echo "   - Add a new secret named 'GCP_SA_KEY'"
echo "   - Copy the contents of: ${KEY_FILE}"
echo ""
echo "3. Update GitHub Secrets with required values:"
echo "   - GCP_ORGANIZATION_ID (if using organization-level policies)"
echo "   - NOTIFICATION_EMAIL (for monitoring alerts)"
echo "   - SLACK_WEBHOOK_URL (for deployment notifications)"
echo "   - COSIGN_PRIVATE_KEY (for container signing in production)"
echo ""
echo "4. Apply the Terraform configuration:"
echo "   cd ${PROJECT_ROOT}/deploy/gcp/terraform"
echo "   terraform apply tfplan"
echo ""
echo "5. Set up your application secrets:"
echo "   - Run: ${SCRIPT_DIR}/setup-secrets.sh --project-id ${PROJECT_ID} --environment ${ENVIRONMENT}"
echo ""
echo "6. Deploy your application:"
echo "   - Push to the '${ENVIRONMENT}' branch or run the GitHub Action manually"
echo ""

log_success "Setup completed successfully!"