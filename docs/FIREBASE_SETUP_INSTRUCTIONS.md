# Firebase Setup Instructions for C12USD

## Quick Start Guide

### Step 1: Obtain Firebase Service Account Key

To run the Firestore seeding script, you need to authenticate with Firebase Admin SDK.

#### Option A: Download Service Account Key (For Local Development)

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk

2. **Generate New Private Key**
   - Click on "Service accounts" tab
   - Click "Generate new private key" button
   - Confirm by clicking "Generate key"

3. **Save the Key File**
   - Save the downloaded JSON file as `serviceAccountKey.json`
   - Place it in the project root directory: `C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json`

4. **Verify File Structure**
   The JSON file should look like this:
   ```json
   {
     "type": "service_account",
     "project_id": "c12ai-dao-b3bbb",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@c12ai-dao-b3bbb.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

#### Option B: Use Application Default Credentials (For Google Cloud Environment)

If you're running in Google Cloud Shell or a CI/CD environment:

```bash
# Authenticate with gcloud
gcloud auth application-default login --project=c12ai-dao-b3bbb

# Or set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

### Step 2: Verify Dependencies

Ensure all required packages are installed:

```bash
# Using pnpm (recommended)
pnpm install

# Verify firebase-admin is installed
pnpm list firebase-admin
# Should show: firebase-admin 13.5.0

# Verify faker is installed
pnpm list @faker-js/faker
# Should show: @faker-js/faker 10.0.0
```

### Step 3: Run the Seed Script

```bash
# Using package.json script (recommended)
pnpm seed:firestore

# Or run directly
node scripts/seed-firestore.js
```

### Step 4: Verify in Firebase Console

1. Go to Firestore Database: https://console.firebase.google.com/project/c12ai-dao-b3bbb/firestore
2. You should see 5 collections created:
   - `config` (5 documents)
   - `proof-of-reserves` (3 documents)
   - `users` (5 documents)
   - `transactions` (20 documents)
   - `rate-limits` (4 documents)

## Troubleshooting

### Issue: "Cannot find module 'serviceAccountKey.json'"

**Solution:**
- Make sure you downloaded the service account key from Firebase Console
- Verify the file is named exactly `serviceAccountKey.json` (case-sensitive)
- Check that it's in the root directory of the project

### Issue: "Error: 5 NOT_FOUND"

**Solution:**
- This indicates authentication failure
- Re-download the service account key
- Ensure the project ID in the key matches `c12ai-dao-b3bbb`
- Check if Firestore is enabled in the Firebase project

### Issue: "Permission Denied"

**Solution:**
1. Go to IAM Console: https://console.cloud.google.com/iam-admin/iam?project=c12ai-dao-b3bbb
2. Find the service account email (e.g., `firebase-adminsdk-xxxxx@c12ai-dao-b3bbb.iam.gserviceaccount.com`)
3. Ensure it has one of these roles:
   - "Cloud Datastore User"
   - "Firebase Admin"
   - "Editor"

### Issue: "Module not found: firebase-admin"

**Solution:**
```bash
pnpm add -D firebase-admin @faker-js/faker
```

## Security Best Practices

### DO:
- ✅ Keep `serviceAccountKey.json` in `.gitignore` (already configured)
- ✅ Use different service accounts for dev, staging, and production
- ✅ Rotate service account keys every 90 days
- ✅ Store production keys in Google Secret Manager
- ✅ Use environment variables for CI/CD pipelines

### DON'T:
- ❌ NEVER commit `serviceAccountKey.json` to version control
- ❌ NEVER share service account keys via email or Slack
- ❌ NEVER use production service accounts for local development
- ❌ NEVER run the seed script on production databases

## Firestore Database Structure

After seeding, your database will contain:

### Collections Overview

```
firestore/
├── config/
│   ├── chains
│   ├── contracts-bsc
│   ├── contracts-polygon
│   ├── fees
│   └── limits
├── proof-of-reserves/
│   ├── bsc-latest
│   ├── polygon-latest
│   └── aggregate
├── users/
│   ├── 0x... (5 test users with random addresses)
├── transactions/
│   ├── 0x... (20 test transactions)
└── rate-limits/
    ├── default
    ├── mint
    ├── redeem
    └── bridge
```

## Next Steps

1. **Test Firestore Queries**
   - Use Firebase Console to explore the seeded data
   - Test queries in the Firebase Console query builder

2. **Integrate with Frontend**
   - Update frontend Firebase configuration
   - Test authentication and data fetching
   - Implement real-time listeners

3. **Set up Firestore Rules**
   - Review `firestore.rules` file
   - Deploy rules: `firebase deploy --only firestore:rules`
   - Test rules using Firebase Emulator

4. **Configure Indexes**
   - Deploy indexes: `firebase deploy --only firestore:indexes`
   - Monitor query performance in Console

## Additional Resources

- [Firestore Seeding Documentation](./FIRESTORE_SEEDING.md)
- [Firebase Production Plan](../FIREBASE_PRODUCTION_PLAN.md)
- [Firestore Security Rules](../firestore.rules)
- [Firebase Admin SDK Guide](https://firebase.google.com/docs/admin/setup)

## Support

For issues or questions:
- Email: vrdivebar@gmail.com
- Create an issue in the GitHub repository
- Review logs in Firebase Console

---

**Last Updated**: 2025-09-30
**Project**: c12ai-dao-b3bbb (Firebase Project #268788831367)