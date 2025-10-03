#!/bin/bash

# Firebase Deployment Script for Manual Payment System
# This script deploys Functions and Security Rules

set -e  # Exit on any error

echo "🚀 Firebase Deployment Script"
echo "============================="
echo ""

# Check we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found"
    echo "   Please run this script from the C12USD directory"
    exit 1
fi

# Check Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not installed"
    echo "   Install with: npm install -g firebase-tools"
    exit 1
fi

# Check login status
echo "🔍 Checking Firebase login status..."
firebase login:list

echo ""
echo "📋 Current Firebase Project:"
firebase use

echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Step 1: Deploy Security Rules
echo ""
echo "📜 Step 1: Deploying Security Rules..."
echo "   - Firestore Rules"
echo "   - Storage Rules"
echo ""

firebase deploy --only firestore:rules,storage:rules

if [ $? -eq 0 ]; then
    echo "✅ Security rules deployed successfully!"
else
    echo "❌ Security rules deployment failed"
    exit 1
fi

# Step 2: Deploy Functions
echo ""
echo "⚡ Step 2: Deploying Firebase Functions..."
echo "   - manualPayments.createManualPayment"
echo "   - manualPayments.submitPaymentProof"
echo "   - manualPayments.verifyManualPayment"
echo "   - manualPayments.getManualPayment"
echo "   - manualPayments.listPayments"
echo "   - manualPayments.getAnalytics"
echo ""

cd functions

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing function dependencies..."
    npm install
fi

cd ..

# Deploy functions
firebase deploy --only functions:manualPayments

if [ $? -eq 0 ]; then
    echo "✅ Functions deployed successfully!"
else
    echo "❌ Functions deployment failed"
    exit 1
fi

# Summary
echo ""
echo "✅ Deployment Complete!"
echo "====================="
echo ""
echo "📋 Deployed Components:"
echo "   ✓ Firestore Security Rules"
echo "   ✓ Storage Security Rules"
echo "   ✓ Firebase Functions (6 endpoints)"
echo ""
echo "🧪 Next Steps:"
echo "   1. Test functions: firebase functions:log"
echo "   2. Verify security rules in Firebase Console"
echo "   3. Test admin user access to /admin/payments"
echo "   4. Complete end-to-end payment flow test"
echo ""
echo "📖 For troubleshooting, see: DEPLOYMENT_GUIDE.md"
echo ""
