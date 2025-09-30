# Firebase Service Account Key - Download Guide

## Overview
This guide provides step-by-step instructions for downloading the Firebase Admin SDK service account key required for C12USD backend operations and Firestore seeding.

## Project Information
- **Firebase Project**: c12ai-dao-b3bbb
- **Project Number**: 268788831367
- **Project Display Name**: C12AI DAO

## Why Do We Need This?

The service account key allows:
1. Firebase Admin SDK authentication
2. Firestore database seeding with test data
3. Cloud Function deployment and testing
4. User management operations
5. Custom token creation for Web3 wallet authentication

## Step-by-Step Download Instructions

### Step 1: Open Firebase Console
Navigate to the Service Accounts page:
```
https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk
```

Or manually:
1. Go to https://console.firebase.google.com/
2. Select project: **C12AI DAO** (c12ai-dao-b3bbb)
3. Click gear icon (Settings) → **Project settings**
4. Click **Service accounts** tab

### Step 2: Generate New Private Key

1. On the Service accounts page, you'll see "Firebase Admin SDK" section
2. Click the **"Generate new private key"** button
3. A popup dialog will appear with a warning message:
   ```
   Generate new private key?

   This key should be kept confidential and never committed to version control.
   Anyone with this key can perform admin operations on your Firebase project.
   ```
4. Click **"Generate key"** to confirm

### Step 3: Save the Downloaded File

Your browser will download a JSON file with a name like:
```
c12ai-dao-b3bbb-firebase-adminsdk-xxxxx-xxxxxxxxxx.json
```

**Save this file to:**
```
C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json
```

**IMPORTANT**:
- Rename the file to exactly: `serviceAccountKey.json`
- Place it in the root directory of the C12USD project
- DO NOT commit this file to git (it's already in .gitignore)

### Step 4: Verify File Contents

Open the downloaded JSON file and verify it contains these fields:
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
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

### Step 5: Verify Installation

Run the verification script:
```bash
node scripts/verify-service-account.js
```

Expected output:
```
✓ Service account key file found
✓ Valid JSON format
✓ Contains required fields
✓ Project ID matches: c12ai-dao-b3bbb
✓ Service account ready for use
```

## Security Best Practices

### DO:
- Keep the file secure and private
- Store in project root (already in .gitignore)
- Use environment variable `GOOGLE_APPLICATION_CREDENTIALS` in production
- Rotate keys periodically (every 90 days recommended)
- Delete keys that are no longer needed

### DON'T:
- Never commit to version control
- Never share publicly or in screenshots
- Never hardcode in application code
- Never upload to public storage
- Never send via email or chat

## Alternative: Using Environment Variable

Instead of placing the file in the project, you can set an environment variable:

### Windows (PowerShell):
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
```

### Windows (Command Prompt):
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
```

### Linux/macOS:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

## Production Deployment

For production environments (Cloud Run, Cloud Functions):
1. **DO NOT** include the service account key file
2. Use Workload Identity or Application Default Credentials
3. Cloud Run/Functions automatically have access via service accounts
4. No manual key management needed

## Troubleshooting

### Issue: "File not found" error
**Solution**: Ensure the file is named exactly `serviceAccountKey.json` (case-sensitive) and placed in:
```
C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json
```

### Issue: "Invalid credentials" error
**Solution**:
1. Download a fresh key from Firebase Console
2. Verify the project ID matches: `c12ai-dao-b3bbb`
3. Check the JSON is not corrupted

### Issue: "Permission denied" error
**Solution**:
1. Verify the service account has the correct roles:
   - Firebase Admin SDK Administrator Service Agent
   - Cloud Datastore User
2. Check in IAM & Admin: https://console.cloud.google.com/iam-admin/iam?project=c12ai-dao-b3bbb

## Key Permissions

The service account key provides access to:
- Firebase Authentication (create/list/delete users)
- Cloud Firestore (read/write all documents)
- Firebase Storage (upload/download files)
- Cloud Functions (deploy and invoke)
- Firebase Remote Config

## Next Steps

After obtaining the service account key:
1. ✓ Save to project root as `serviceAccountKey.json`
2. ✓ Run verification script
3. → Proceed with Firestore seeding
4. → Test Firebase Authentication
5. → Deploy Cloud Functions

## Support Resources

- Firebase Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb
- IAM & Admin: https://console.cloud.google.com/iam-admin/iam?project=c12ai-dao-b3bbb
- Service Accounts: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts
- Documentation: https://firebase.google.com/docs/admin/setup

## Contact

For issues or questions:
- Project Owner: vrdivebar@gmail.com
- Firebase Support: https://firebase.google.com/support

---

**Last Updated**: 2025-09-30
**Document Version**: 1.0
