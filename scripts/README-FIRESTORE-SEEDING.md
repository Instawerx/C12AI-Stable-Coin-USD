# Firestore Seeding Scripts

## Quick Start

### 1. Setup Firebase Authentication

Download your service account key:
```
https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk
```

Save as `serviceAccountKey.json` in project root.

### 2. Run Seed Script

```bash
# Seed all collections
pnpm seed:firestore

# Count documents
pnpm count:firestore
```

## Scripts

### seed-firestore.js
Main seeding script that creates:
- 5 config documents
- 3 proof-of-reserves documents
- 5 user documents
- 20 transaction documents
- 4 rate-limit documents

**Total**: 37 documents

### count-firestore-docs.js
Utility to count documents in each collection and verify seeding was successful.

## Documentation

- **Complete Guide**: `../docs/FIRESTORE_SEEDING.md`
- **Setup Instructions**: `../docs/FIREBASE_SETUP_INSTRUCTIONS.md`
- **Execution Report**: `../docs/FIRESTORE_SEEDING_REPORT.md`

## Deployed Contracts

- **BSC**: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
- **Polygon**: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

## Security

⚠️ **NEVER commit serviceAccountKey.json to version control**

The file is already in `.gitignore`.

## Support

For issues: vrdivebar@gmail.com