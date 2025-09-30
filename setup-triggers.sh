#!/bin/bash

# C12USD CI/CD Trigger Setup Script
# This script sets up Cloud Build triggers for automated deployment

set -e

PROJECT_ID="c12ai-dao"
CONTACT_EMAIL="admin@carnival12.com"

echo "🚀 Setting up C12USD CI/CD Pipeline Triggers..."
echo "Project: $PROJECT_ID"
echo "Contact: $CONTACT_EMAIL"

# Check if Cloud Build API is enabled
echo "🔍 Checking Cloud Build API status..."
gcloud services enable cloudbuild.googleapis.com --project=$PROJECT_ID

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Generated webhook secret: $WEBHOOK_SECRET"

# Create webhook trigger for production deployment
echo "📦 Creating production deployment trigger..."
gcloud builds triggers create webhook \
  --name="c12usd-production-deploy" \
  --secret="$WEBHOOK_SECRET" \
  --inline-config="cloudbuild.yaml" \
  --substitutions="_REGION=us-central1,_REPOSITORY=c12usd-repo,_SERVICE_ACCOUNT=c12usd-production-cloudrun@c12ai-dao.iam.gserviceaccount.com,_ENVIRONMENT=production,_CONTACT_EMAIL=$CONTACT_EMAIL" \
  --project=$PROJECT_ID

# Create webhook trigger for staging deployment
echo "🧪 Creating staging deployment trigger..."
gcloud builds triggers create webhook \
  --name="c12usd-staging-deploy" \
  --secret="$WEBHOOK_SECRET" \
  --inline-config="cloudbuild-staging.yaml" \
  --substitutions="_REGION=us-central1,_REPOSITORY=c12usd-repo,_SERVICE_ACCOUNT=c12usd-production-cloudrun@c12ai-dao.iam.gserviceaccount.com,_ENVIRONMENT=staging,_CONTACT_EMAIL=$CONTACT_EMAIL" \
  --project=$PROJECT_ID

# Create webhook trigger for smart contract deployment
echo "📜 Creating smart contract deployment trigger..."
gcloud builds triggers create webhook \
  --name="c12usd-contracts-deploy" \
  --secret="$WEBHOOK_SECRET" \
  --inline-config="cloudbuild-contracts.yaml" \
  --substitutions="_DEPLOYER_KEY=ops_signer_key,_ENVIRONMENT=production,_CONTACT_EMAIL=$CONTACT_EMAIL" \
  --project=$PROJECT_ID

echo "✅ Cloud Build triggers created successfully!"

# Display webhook URLs
echo ""
echo "📋 Webhook URLs for Git integration:"
echo "Production: https://cloudbuild.googleapis.com/v1/projects/$PROJECT_ID/triggers/c12usd-production-deploy:webhook"
echo "Staging: https://cloudbuild.googleapis.com/v1/projects/$PROJECT_ID/triggers/c12usd-staging-deploy:webhook"
echo "Contracts: https://cloudbuild.googleapis.com/v1/projects/$PROJECT_ID/triggers/c12usd-contracts-deploy:webhook"

echo ""
echo "🔧 Next steps:"
echo "1. Configure your Git repository webhooks to call these URLs"
echo "2. Add webhook secret for security"
echo "3. Test the pipeline with a sample commit"

echo ""
echo "📊 View triggers in console:"
echo "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"