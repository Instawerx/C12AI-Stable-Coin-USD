# Firebase Service Account Key Setup

## Status: Service Account Key NOT FOUND

The service account key is required for Firebase Admin SDK operations (backend scripts, Firestore seeding, etc.).

## Quick Setup (5 minutes)

### Step 1: Download Service Account Key

1. Open Firebase Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk

2. Click **"Generate new private key"**

3. Click **"Generate key"** in the confirmation dialog

4. A JSON file will download (e.g., `c12ai-dao-b3bbb-firebase-adminsdk-xxxxx.json`)

5. **Rename** the downloaded file to: `serviceAccountKey.json`

6. **Move** the file to: `C:\Users\tabor\Downloads\C12USD_project\C12USD\serviceAccountKey.json`

### Step 2: Verify the Key

Run this command to verify:
```bash
node scripts/verify-service-account.js
```

Expected output: `✅ Service account key is valid`

## Security Notes

- ✅ `.gitignore` is already configured to exclude `serviceAccountKey.json`
- ⚠️ NEVER commit this file to Git
- ⚠️ NEVER share this file publicly
- ✅ File is only needed for local development and backend scripts

## Alternative: Use Firebase Emulators

If you want to test WITHOUT the service account key, you can use Firebase Emulators:

```bash
# Start emulators (no service account key needed)
firebase emulators:start

# In another terminal, set emulator host
set FIRESTORE_EMULATOR_HOST=localhost:8080

# Run scripts against emulator
node scripts/seed-firestore.js
```

## Next Steps After Key Setup

Once you have the service account key in place:

1. ✅ Verify key: `node scripts/verify-service-account.js`
2. Create Firestore database (see FIRESTORE_DATABASE_SETUP.md)
3. Enable Authentication providers (see FIREBASE_AUTH_SETUP.md)
4. Start emulators and test
