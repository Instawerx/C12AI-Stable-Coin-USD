/**
 * Create Test Users Script
 * Project: C12USD (c12ai-dao-b3bbb)
 *
 * This script creates test users for Firebase Authentication testing
 * Supports both emulator and production environments
 *
 * Usage:
 *   # For emulator
 *   set FIRESTORE_EMULATOR_HOST=localhost:8080
 *   set FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
 *   node scripts/create-test-users.js
 *
 *   # For production (with service account key)
 *   node scripts/create-test-users.js --production
 */

const admin = require('firebase-admin');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Configuration
const PROJECT_ID = 'c12ai-dao-b3bbb';
const USE_EMULATOR = !process.argv.includes('--production');

// Test user data
const TEST_USERS = [
  {
    email: 'test@c12usd.com',
    password: 'Test123456!',
    displayName: 'Test User',
    role: 'user',
    kycStatus: 'approved',
    kycTier: 'basic'
  },
  {
    email: 'admin@c12usd.com',
    password: 'Admin123456!',
    displayName: 'Admin User',
    role: 'admin',
    kycStatus: 'approved',
    kycTier: 'pro'
  },
  {
    email: 'dao.member@c12usd.com',
    password: 'DAO123456!',
    displayName: 'DAO Member',
    role: 'dao_member',
    kycStatus: 'approved',
    kycTier: 'advanced'
  },
  {
    email: 'pending.kyc@c12usd.com',
    password: 'Pending123456!',
    displayName: 'Pending KYC User',
    role: 'user',
    kycStatus: 'pending',
    kycTier: 'not_started'
  },
  {
    email: 'new.user@c12usd.com',
    password: 'NewUser123456!',
    displayName: 'New User',
    role: 'user',
    kycStatus: 'not_started',
    kycTier: 'not_started'
  }
];

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  console.log(`${colors.cyan}[INFO]${colors.reset} Initializing Firebase Admin SDK...`);

  if (USE_EMULATOR) {
    console.log(`${colors.yellow}[EMULATOR]${colors.reset} Using Firebase Emulators`);
    console.log(`  - Auth: ${process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099'}`);
    console.log(`  - Firestore: ${process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080'}`);

    // Set emulator environment variables if not already set
    if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
    }
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    }

    admin.initializeApp({
      projectId: PROJECT_ID
    });
  } else {
    console.log(`${colors.yellow}[PRODUCTION]${colors.reset} Using Production Firebase`);

    try {
      const serviceAccount = require('../serviceAccountKey.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    } catch (error) {
      console.error(`${colors.red}[ERROR]${colors.reset} Service account key not found`);
      console.log('Download from: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk');
      process.exit(1);
    }
  }

  console.log(`${colors.green}[SUCCESS]${colors.reset} Firebase initialized\n`);
}

/**
 * Create a test user
 */
async function createTestUser(userData) {
  const auth = admin.auth();
  const db = admin.firestore();

  try {
    console.log(`${colors.cyan}[CREATING]${colors.reset} ${userData.email}...`);

    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(userData.email);
      console.log(`${colors.yellow}[EXISTS]${colors.reset} User already exists, updating...`);

      // Update existing user
      await auth.updateUser(existingUser.uid, {
        displayName: userData.displayName,
        password: userData.password
      });

      // Update custom claims
      await auth.setCustomUserClaims(existingUser.uid, {
        role: userData.role,
        kycStatus: userData.kycStatus,
        kycTier: userData.kycTier
      });

      // Update Firestore document
      await db.collection('users').doc(existingUser.uid).set({
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        kycStatus: userData.kycStatus,
        kycTier: userData.kycTier,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`${colors.green}[UPDATED]${colors.reset} ${userData.email}`);
      console.log(`  - UID: ${existingUser.uid}`);
      console.log(`  - Role: ${userData.role}`);
      console.log(`  - KYC Status: ${userData.kycStatus}`);

      return {
        uid: existingUser.uid,
        email: userData.email,
        password: userData.password,
        created: false
      };

    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        const userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName,
          emailVerified: true
        });

        // Set custom claims
        await auth.setCustomUserClaims(userRecord.uid, {
          role: userData.role,
          kycStatus: userData.kycStatus,
          kycTier: userData.kycTier
        });

        // Create Firestore document
        await db.collection('users').doc(userRecord.uid).set({
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role,
          kycStatus: userData.kycStatus,
          kycTier: userData.kycTier,
          preferences: {
            defaultChain: 'bsc',
            notifications: {
              email: true,
              push: false
            },
            theme: 'dark'
          },
          stats: {
            totalTransactions: 0,
            totalVolume: '0',
            lastActive: admin.firestore.FieldValue.serverTimestamp()
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`${colors.green}[CREATED]${colors.reset} ${userData.email}`);
        console.log(`  - UID: ${userRecord.uid}`);
        console.log(`  - Role: ${userData.role}`);
        console.log(`  - KYC Status: ${userData.kycStatus}`);

        return {
          uid: userRecord.uid,
          email: userData.email,
          password: userData.password,
          created: true
        };
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error(`${colors.red}[ERROR]${colors.reset} Failed to create ${userData.email}:`, error.message);
    return null;
  }
}

/**
 * Generate credentials file
 */
function generateCredentialsFile(createdUsers) {
  const fs = require('fs');
  const credentialsPath = path.join(__dirname, '..', 'test-credentials.json');

  const credentials = {
    project: PROJECT_ID,
    environment: USE_EMULATOR ? 'emulator' : 'production',
    created: new Date().toISOString(),
    users: createdUsers
  };

  fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

  console.log(`\n${colors.green}[SAVED]${colors.reset} Credentials saved to: test-credentials.json`);
}

/**
 * Display test credentials
 */
function displayCredentials(createdUsers) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}TEST USER CREDENTIALS${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.cyan}Environment:${colors.reset} ${USE_EMULATOR ? 'Emulator' : 'Production'}`);
  console.log(`${colors.cyan}Project:${colors.reset} ${PROJECT_ID}\n`);

  console.log(`${colors.bright}Login Credentials:${colors.reset}\n`);

  createdUsers.forEach((user, index) => {
    console.log(`${colors.green}${index + 1}. ${user.email}${colors.reset}`);
    console.log(`   Password: ${colors.yellow}${user.password}${colors.reset}`);
    console.log(`   UID: ${user.uid}`);
    console.log('');
  });

  console.log(`${colors.bright}Testing URLs:${colors.reset}\n`);

  if (USE_EMULATOR) {
    console.log('  Frontend: http://localhost:3001');
    console.log('  Emulator UI: http://localhost:4000');
    console.log('  Auth Emulator: http://localhost:9099');
  } else {
    console.log('  Frontend: https://c12ai-dao-b3bbb.web.app');
    console.log('  Firebase Console: https://console.firebase.google.com/project/c12ai-dao-b3bbb/authentication');
  }

  console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
  console.log('  1. Start frontend: cd frontend/user && npm run dev');
  console.log('  2. Go to: http://localhost:3001/auth/login');
  console.log('  3. Login with any test credentials above');
  console.log('  4. Test user flows (dashboard, wallet, transactions)');

  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}Firebase Test Users Creation${colors.reset}\n`);

  // Initialize Firebase
  initializeFirebase();

  // Create test users
  const createdUsers = [];

  for (const userData of TEST_USERS) {
    const result = await createTestUser(userData);
    if (result) {
      createdUsers.push(result);
    }
  }

  // Generate credentials file
  generateCredentialsFile(createdUsers);

  // Display credentials
  displayCredentials(createdUsers);

  console.log(`${colors.green}[COMPLETE]${colors.reset} Created ${createdUsers.length}/${TEST_USERS.length} test users\n`);

  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error(`\n${colors.red}[FATAL]${colors.reset} Unhandled error:`, error);
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  initializeFirebase,
  createTestUser,
  TEST_USERS
};
