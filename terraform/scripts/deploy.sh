#!/bin/bash

# Deployment script for C12USD infrastructure
# This script handles the complete deployment process with safety checks

set -euo pipefail

# Configuration
PROJECT_ID="c12ai-dao"
REGION="us-central1"
ENVIRONMENT="${1:-production}"

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

# Display usage
usage() {
    echo "Usage: $0 [environment]"
    echo "Environments: production, staging"
    echo ""
    echo "Example: $0 production"
    exit 1
}

# Validate environment
validate_environment() {
    if [[ "$ENVIRONMENT" != "production" && "$ENVIRONMENT" != "staging" ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        usage
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."

    # Check if gcloud is authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        log_error "No active gcloud authentication found. Please run 'gcloud auth login' first."
        exit 1
    fi

    # Set project
    gcloud config set project "$PROJECT_ID"

    # Check if Terraform is initialized
    if [[ ! -d "terraform/.terraform" ]]; then
        log_error "Terraform not initialized. Please run 'terraform init' first."
        exit 1
    fi

    # Check if environment-specific tfvars file exists
    if [[ ! -f "terraform/environments/$ENVIRONMENT/terraform.tfvars" ]]; then
        log_error "Environment configuration not found: terraform/environments/$ENVIRONMENT/terraform.tfvars"
        exit 1
    fi

    # Validate Terraform configuration
    cd terraform
    if ! terraform validate; then
        log_error "Terraform configuration validation failed"
        exit 1
    fi
    cd ..

    log_success "Pre-deployment checks passed"
}

# Production safety checks
production_safety_checks() {
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_warning "🚨 PRODUCTION DEPLOYMENT DETECTED 🚨"
        echo ""
        log_info "This will deploy to the production environment."
        log_info "Please ensure you have completed the following:"
        echo ""
        echo "1. ✅ Updated all production secrets with real values"
        echo "2. ✅ Tested the deployment in staging environment"
        echo "3. ✅ Reviewed the Terraform plan carefully"
        echo "4. ✅ Confirmed database backup and rollback procedures"
        echo "5. ✅ Notified the team about the deployment"
        echo ""

        read -p "Are you sure you want to continue with production deployment? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            log_info "Deployment cancelled by user"
            exit 0
        fi
    fi
}

# Plan infrastructure changes
plan_infrastructure() {
    log_info "Planning infrastructure changes..."

    cd terraform

    # Run terraform plan
    terraform plan \
        -var-file="environments/$ENVIRONMENT/terraform.tfvars" \
        -out="$ENVIRONMENT.tfplan"

    log_success "Terraform plan completed. Review the changes above."

    # Ask for confirmation
    echo ""
    read -p "Do you want to apply these changes? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_info "Deployment cancelled by user"
        rm -f "$ENVIRONMENT.tfplan"
        exit 0
    fi

    cd ..
}

# Apply infrastructure changes
apply_infrastructure() {
    log_info "Applying infrastructure changes..."

    cd terraform

    # Apply the plan
    terraform apply "$ENVIRONMENT.tfplan"

    # Clean up plan file
    rm -f "$ENVIRONMENT.tfplan"

    log_success "Infrastructure deployment completed"

    # Get outputs
    log_info "Retrieving infrastructure outputs..."
    terraform output -json > "../infrastructure-outputs-$ENVIRONMENT.json"

    cd ..
}

# Update Cloud SQL database connection info
update_database_connection() {
    log_info "Updating database connection information in secrets..."

    # Get the private IP of Cloud SQL instance
    local db_instance_name="c12usd-$ENVIRONMENT-db"
    local private_ip
    private_ip=$(gcloud sql instances describe "$db_instance_name" --project="$PROJECT_ID" --format="value(ipAddresses[0].ipAddress)" || echo "")

    if [[ -n "$private_ip" ]]; then
        # Update database URL secrets with actual IP
        local db_password
        db_password=$(gcloud secrets versions access latest --secret="c12usd-$ENVIRONMENT-database-password" --project="$PROJECT_ID")

        local db_url="postgresql://c12usd_user:$db_password@$private_ip:5432/c12usd_production?sslmode=require"
        local shadow_db_url="postgresql://c12usd_user:$db_password@$private_ip:5432/c12usd_shadow?sslmode=require"

        echo -n "$db_url" | gcloud secrets versions add "c12usd-$ENVIRONMENT-database-url" --data-file=- --project="$PROJECT_ID"
        echo -n "$shadow_db_url" | gcloud secrets versions add "c12usd-$ENVIRONMENT-shadow-database-url" --data-file=- --project="$PROJECT_ID"

        log_success "Database connection URLs updated with private IP: $private_ip"
    else
        log_error "Could not retrieve Cloud SQL private IP address"
    fi
}

# Deploy application to Cloud Run
deploy_application() {
    log_info "Deploying application to Cloud Run..."

    # Get the latest image from Artifact Registry
    local image_uri
    image_uri="${REGION}-docker.pkg.dev/${PROJECT_ID}/c12usd-repo/c12usd-backend:latest"

    # Check if image exists
    if ! gcloud container images describe "$image_uri" --project="$PROJECT_ID" &> /dev/null; then
        log_warning "Application image not found. Building from source..."

        # Build and push image using Cloud Build
        gcloud builds submit \
            --config cloudbuild.yaml \
            --substitutions="_ENVIRONMENT=$ENVIRONMENT" \
            --project="$PROJECT_ID"
    fi

    # Deploy to Cloud Run (this is handled by Terraform, but we can trigger a revision)
    local service_name="c12usd-$ENVIRONMENT"

    gcloud run deploy "$service_name" \
        --image="$image_uri" \
        --region="$REGION" \
        --platform=managed \
        --project="$PROJECT_ID" \
        --quiet

    log_success "Application deployed to Cloud Run"
}

# Run database migrations
run_database_migrations() {
    log_info "Running database migrations..."

    # This would typically be done through a Cloud Build step or Cloud Run job
    # For now, we'll log the commands that should be run

    echo ""
    log_info "Database migration commands to run:"
    echo "1. Connect to the deployed Cloud Run service"
    echo "2. Run: npm run db:deploy"
    echo "3. Verify migrations completed successfully"
    echo ""
    log_warning "Database migrations should be run manually or through CI/CD pipeline"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    # Get Cloud Run service URL
    local service_name="c12usd-$ENVIRONMENT"
    local service_url
    service_url=$(gcloud run services describe "$service_name" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)" 2>/dev/null || echo "")

    if [[ -n "$service_url" ]]; then
        log_info "Service URL: $service_url"

        # Test health endpoint
        if curl -f -s "$service_url/health" > /dev/null; then
            log_success "Health check passed"
        else
            log_warning "Health check failed - service may still be starting up"
        fi
    else
        log_error "Could not retrieve service URL"
    fi

    # Check Cloud SQL instance status
    local db_instance_name="c12usd-$ENVIRONMENT-db"
    local db_status
    db_status=$(gcloud sql instances describe "$db_instance_name" --project="$PROJECT_ID" --format="value(state)" 2>/dev/null || echo "NOT_FOUND")

    if [[ "$db_status" == "RUNNABLE" ]]; then
        log_success "Database instance is running"
    else
        log_warning "Database instance status: $db_status"
    fi
}

# Post-deployment tasks
post_deployment_tasks() {
    log_info "Running post-deployment tasks..."

    # Create deployment record
    local deployment_record="deployment-record-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S).json"

    cat << EOF > "$deployment_record"
{
  "deployment_time": "$(date -Iseconds)",
  "environment": "$ENVIRONMENT",
  "project_id": "$PROJECT_ID",
  "region": "$REGION",
  "deployed_by": "$(gcloud auth list --filter=status:ACTIVE --format='value(account)')",
  "terraform_version": "$(terraform version -json | jq -r '.terraform_version')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF

    log_success "Deployment record created: $deployment_record"

    # Display important URLs and information
    echo ""
    log_info "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Important Resources:"
    echo "- Google Cloud Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
    echo "- Cloud Run Services: https://console.cloud.google.com/run?project=$PROJECT_ID"
    echo "- Cloud SQL: https://console.cloud.google.com/sql/instances?project=$PROJECT_ID"
    echo "- Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
    echo "- Monitoring: https://console.cloud.google.com/monitoring?project=$PROJECT_ID"
    echo "- Logs: https://console.cloud.google.com/logs?project=$PROJECT_ID"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Run database migrations if not already done"
    echo "2. Configure DNS records for custom domain"
    echo "3. Set up monitoring alerts and notifications"
    echo "4. Run end-to-end tests"
    echo "5. Monitor application metrics and logs"
    echo ""

    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_warning "Production deployment completed. Monitor closely for the first few hours."
    fi
}

# Rollback function (for emergency use)
rollback() {
    log_warning "Rollback functionality would be implemented here"
    log_info "For now, use 'gcloud run deploy' with a previous image tag"
    log_info "Or use 'terraform apply' with previous state"
}

# Main execution
main() {
    log_info "Starting C12USD deployment for environment: $ENVIRONMENT"

    validate_environment
    pre_deployment_checks
    production_safety_checks
    plan_infrastructure
    apply_infrastructure
    update_database_connection
    # deploy_application  # Commented out as it's handled by Terraform
    # run_database_migrations  # Should be done separately
    verify_deployment
    post_deployment_tasks

    log_success "Deployment completed successfully!"
}

# Handle command line arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "production"|"staging"|"")
        main
        ;;
    *)
        usage
        ;;
esac