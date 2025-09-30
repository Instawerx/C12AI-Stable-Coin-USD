#!/bin/bash

# Setup script for Terraform backend and initial GCP configuration
# This script creates the necessary GCS bucket for Terraform state and enables required APIs

set -euo pipefail

# Configuration
PROJECT_ID="c12ai-dao"
REGION="us-central1"
TERRAFORM_STATE_BUCKET="${PROJECT_ID}-terraform-state"
BILLING_ACCOUNT_ID=""  # Set your billing account ID

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

# Check if gcloud is installed and authenticated
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v terraform &> /dev/null; then
        log_error "terraform is not installed. Please install it first."
        exit 1
    fi

    # Check if user is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "No active gcloud authentication found. Please run 'gcloud auth login' first."
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Set the project and enable billing
setup_project() {
    log_info "Setting up GCP project: $PROJECT_ID"

    # Set the project
    gcloud config set project "$PROJECT_ID"

    # Enable billing if billing account ID is provided
    if [[ -n "$BILLING_ACCOUNT_ID" ]]; then
        log_info "Linking billing account: $BILLING_ACCOUNT_ID"
        gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
    else
        log_warning "No billing account ID provided. Please ensure billing is enabled manually."
    fi

    log_success "Project setup completed"
}

# Enable required APIs
enable_apis() {
    log_info "Enabling required Google Cloud APIs..."

    local apis=(
        "cloudresourcemanager.googleapis.com"
        "cloudbilling.googleapis.com"
        "iam.googleapis.com"
        "compute.googleapis.com"
        "container.googleapis.com"
        "containerregistry.googleapis.com"
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "sqladmin.googleapis.com"
        "secretmanager.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "cloudsecurity.googleapis.com"
        "artifactregistry.googleapis.com"
        "servicenetworking.googleapis.com"
        "vpcaccess.googleapis.com"
        "redis.googleapis.com"
        "cloudkms.googleapis.com"
        "cloudasset.googleapis.com"
        "securitycenter.googleapis.com"
        "binaryauthorization.googleapis.com"
        "containeranalysis.googleapis.com"
    )

    for api in "${apis[@]}"; do
        log_info "Enabling $api..."
        gcloud services enable "$api" --project="$PROJECT_ID"
    done

    log_success "All APIs enabled successfully"
}

# Create Terraform state bucket
create_terraform_backend() {
    log_info "Creating Terraform state bucket: $TERRAFORM_STATE_BUCKET"

    # Check if bucket already exists
    if gsutil ls -b "gs://$TERRAFORM_STATE_BUCKET" &> /dev/null; then
        log_warning "Terraform state bucket already exists"
    else
        # Create the bucket
        gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$REGION" "gs://$TERRAFORM_STATE_BUCKET"

        # Enable versioning
        gsutil versioning set on "gs://$TERRAFORM_STATE_BUCKET"

        # Set lifecycle policy to prevent accidental deletion
        cat << EOF > lifecycle.json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 365, "isLive": false}
      }
    ]
  }
}
EOF
        gsutil lifecycle set lifecycle.json "gs://$TERRAFORM_STATE_BUCKET"
        rm lifecycle.json

        log_success "Terraform state bucket created successfully"
    fi
}

# Create service account for Terraform
create_terraform_service_account() {
    log_info "Creating Terraform service account..."

    local sa_name="terraform-admin"
    local sa_email="${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com"

    # Check if service account exists
    if gcloud iam service-accounts describe "$sa_email" --project="$PROJECT_ID" &> /dev/null; then
        log_warning "Terraform service account already exists"
    else
        # Create service account
        gcloud iam service-accounts create "$sa_name" \
            --display-name="Terraform Admin" \
            --description="Service account for Terraform infrastructure management" \
            --project="$PROJECT_ID"

        log_success "Terraform service account created"
    fi

    # Grant necessary roles
    local roles=(
        "roles/owner"
        "roles/storage.admin"
        "roles/iam.securityAdmin"
        "roles/iam.serviceAccountAdmin"
        "roles/resourcemanager.projectIamAdmin"
    )

    for role in "${roles[@]}"; do
        log_info "Granting role $role to Terraform service account..."
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
            --member="serviceAccount:$sa_email" \
            --role="$role"
    done

    log_success "Terraform service account configured"
}

# Generate Terraform service account key
generate_service_account_key() {
    log_info "Generating Terraform service account key..."

    local sa_email="terraform-admin@${PROJECT_ID}.iam.gserviceaccount.com"
    local key_file="terraform-admin-key.json"

    gcloud iam service-accounts keys create "$key_file" \
        --iam-account="$sa_email" \
        --project="$PROJECT_ID"

    log_success "Service account key generated: $key_file"
    log_warning "Keep this key file secure and do not commit it to version control!"

    # Set environment variable
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/$key_file"
    echo "export GOOGLE_APPLICATION_CREDENTIALS=\"$(pwd)/$key_file\"" >> ~/.bashrc

    log_info "Set GOOGLE_APPLICATION_CREDENTIALS environment variable"
}

# Initialize Terraform
initialize_terraform() {
    log_info "Initializing Terraform..."

    # Change to terraform directory
    cd terraform

    # Initialize Terraform
    terraform init

    # Validate configuration
    terraform validate

    # Plan the infrastructure
    log_info "Running Terraform plan..."
    terraform plan -var-file="environments/production/terraform.tfvars"

    log_success "Terraform initialized and validated"

    cd ..
}

# Set up monitoring and alerting notification channels
setup_notification_channels() {
    log_info "Setting up notification channels..."

    # Create email notification channel
    cat << EOF > email-notification-channel.json
{
  "type": "email",
  "displayName": "C12USD Production Email Alerts",
  "description": "Email notifications for C12USD production alerts",
  "labels": {
    "email_address": "alerts@c12usd.com"
  },
  "enabled": true
}
EOF

    log_info "Email notification channel configuration created"
    log_warning "Please create notification channels manually in the Google Cloud Console"
    log_warning "Navigate to Monitoring > Alerting > Notification Channels"

    rm -f email-notification-channel.json
}

# Main execution
main() {
    log_info "Starting C12USD GCP infrastructure setup..."

    check_prerequisites
    setup_project
    enable_apis
    create_terraform_backend
    create_terraform_service_account
    generate_service_account_key
    setup_notification_channels
    initialize_terraform

    log_success "Setup completed successfully!"

    echo ""
    log_info "Next steps:"
    echo "1. Review the Terraform plan output above"
    echo "2. Update notification channel IDs in terraform.tfvars"
    echo "3. Set up actual production secrets in Secret Manager"
    echo "4. Run 'terraform apply' to create the infrastructure"
    echo "5. Configure custom domain DNS records"
    echo "6. Set up monitoring dashboards and alerts"
    echo ""
    log_warning "Remember to:"
    echo "- Keep the service account key secure"
    echo "- Update production secrets with real values"
    echo "- Configure proper DNS for your domain"
    echo "- Set up backup and disaster recovery procedures"
    echo "- Review and adjust cost budgets"
}

# Run the main function
main "$@"