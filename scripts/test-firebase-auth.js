/**
 * Firebase Authentication Test Script
 * Project: C12USD (c12ai-dao-b3bbb)
 *
 * This script tests Firebase Authentication configuration and connectivity
 * using Firebase Admin SDK.
 *
 * Usage:
 *   node scripts/test-firebase-auth.js
 *
 * Requirements:
 *   - Firebase Admin SDK service account key
 *   - Node.js environment
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
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.join(__dirname, 'service-account-key.json');

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebase() {
  console.log(`${colors.cyan}[INFO]${colors.reset} Initializing Firebase Admin SDK...`);

  try {
    // Check if service account file exists
    const fs = require('fs');
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.log(`${colors.yellow}[WARN]${colors.reset} Service account key not found at: ${SERVICE_ACCOUNT_PATH}`);
      console.log(`${colors.yellow}[WARN]${colors.reset} Attempting to use Application Default Credentials...`);

      admin.initializeApp({
        projectId: PROJECT_ID
      });
    } else {
      const serviceAccount = require(SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: PROJECT_ID
      });
    }

    console.log(`${colors.green}[SUCCESS]${colors.reset} Firebase Admin SDK initialized\n`);
    return true;
  } catch (error) {
    console.error(`${colors.red}[ERROR]${colors.reset} Failed to initialize Firebase:`, error.message);
    return false;
  }
}

/**
 * Test Firebase Authentication connection
 */
async function testAuthConnection() {
  console.log(`${colors.bright}${colors.blue}Testing Firebase Authentication Connection${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const auth = admin.auth();

    // Test 1: List users (even if empty)
    console.log(`\n${colors.cyan}[TEST]${colors.reset} Listing users...`);
    const listUsersResult = await auth.listUsers(10);

    console.log(`${colors.green}[PASS]${colors.reset} Successfully connected to Firebase Authentication`);
    console.log(`  - Total users found: ${listUsersResult.users.length}`);
    console.log(`  - Has more users: ${listUsersResult.pageToken ? 'Yes' : 'No'}`);

    return {
      success: true,
      totalUsers: listUsersResult.users.length,
      hasMoreUsers: !!listUsersResult.pageToken
    };
  } catch (error) {
    console.error(`${colors.red}[FAIL]${colors.reset} Connection test failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check enabled authentication providers
 */
async function checkAuthProviders() {
  console.log(`\n${colors.bright}${colors.blue}Checking Enabled Authentication Providers${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const auth = admin.auth();

    // Get authentication configuration (this requires checking users with different providers)
    const listUsersResult = await auth.listUsers(1000);
    const providerStats = {
      'password': 0,
      'google.com': 0,
      'facebook.com': 0,
      'apple.com': 0,
      'custom': 0,
      'anonymous': 0,
      'other': 0
    };

    listUsersResult.users.forEach(user => {
      user.providerData.forEach(provider => {
        if (providerStats.hasOwnProperty(provider.providerId)) {
          providerStats[provider.providerId]++;
        } else {
          providerStats['other']++;
        }
      });
    });

    console.log(`\n${colors.cyan}[INFO]${colors.reset} Provider Usage Statistics:`);
    console.log(`  - Email/Password: ${providerStats['password']} users`);
    console.log(`  - Google OAuth: ${providerStats['google.com']} users`);
    console.log(`  - Facebook OAuth: ${providerStats['facebook.com']} users`);
    console.log(`  - Apple Sign-In: ${providerStats['apple.com']} users`);
    console.log(`  - Custom Auth: ${providerStats['custom']} users`);
    console.log(`  - Anonymous: ${providerStats['anonymous']} users`);
    console.log(`  - Other: ${providerStats['other']} users`);

    // Note: Admin SDK cannot directly check which providers are enabled
    // This requires Firebase Console access or REST API
    console.log(`\n${colors.yellow}[NOTE]${colors.reset} To check enabled providers, visit:`);
    console.log(`  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`);

    return providerStats;
  } catch (error) {
    console.error(`${colors.red}[ERROR]${colors.reset} Failed to check providers:`, error.message);
    return null;
  }
}

/**
 * Test custom token creation
 */
async function testCustomTokenCreation() {
  console.log(`\n${colors.bright}${colors.blue}Testing Custom Token Creation${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const auth = admin.auth();

    // Create a test custom token
    const testUid = 'test-user-' + Date.now();
    const customClaims = {
      admin: false,
      testUser: true,
      kycStatus: 'NOT_STARTED',
      kycTier: 0
    };

    console.log(`\n${colors.cyan}[TEST]${colors.reset} Creating custom token for UID: ${testUid}`);
    const customToken = await auth.createCustomToken(testUid, customClaims);

    console.log(`${colors.green}[PASS]${colors.reset} Custom token created successfully`);
    console.log(`  - Token length: ${customToken.length} characters`);
    console.log(`  - Token preview: ${customToken.substring(0, 50)}...`);
    console.log(`\n${colors.yellow}[NOTE]${colors.reset} This token can be used in client apps to sign in`);

    return {
      success: true,
      tokenLength: customToken.length
    };
  } catch (error) {
    console.error(`${colors.red}[FAIL]${colors.reset} Custom token creation failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check authentication security settings
 */
async function checkSecuritySettings() {
  console.log(`\n${colors.bright}${colors.blue}Checking Authentication Security Settings${colors.reset}`);
  console.log('='.repeat(60));

  console.log(`\n${colors.yellow}[NOTE]${colors.reset} The following settings can only be verified in Firebase Console:`);
  console.log(`  https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings\n`);

  const settings = [
    {
      name: 'Email Enumeration Protection',
      description: 'Prevents attackers from discovering registered emails',
      recommended: 'Enabled'
    },
    {
      name: 'Password Policy',
      description: 'Enforces strong password requirements',
      recommended: 'Min 12 chars, uppercase, lowercase, number, special char'
    },
    {
      name: 'Multi-Factor Authentication (MFA)',
      description: 'Requires second factor for authentication',
      recommended: 'Optional (Required for admin accounts)'
    },
    {
      name: 'Authorized Domains',
      description: 'Restricts authentication to specific domains',
      recommended: 'localhost, firebaseapp.com, custom domains'
    },
    {
      name: 'Suspicious Activity Detection',
      description: 'Monitors and blocks suspicious login attempts',
      recommended: 'Enabled'
    }
  ];

  settings.forEach((setting, index) => {
    console.log(`${colors.cyan}${index + 1}. ${setting.name}${colors.reset}`);
    console.log(`   Description: ${setting.description}`);
    console.log(`   Recommended: ${colors.green}${setting.recommended}${colors.reset}\n`);
  });

  return settings;
}

/**
 * Test Firestore user document access
 */
async function testFirestoreAccess() {
  console.log(`\n${colors.bright}${colors.blue}Testing Firestore User Document Access${colors.reset}`);
  console.log('='.repeat(60));

  try {
    const firestore = admin.firestore();

    console.log(`\n${colors.cyan}[TEST]${colors.reset} Querying users collection...`);
    const usersSnapshot = await firestore.collection('users').limit(5).get();

    console.log(`${colors.green}[PASS]${colors.reset} Successfully accessed Firestore`);
    console.log(`  - Users collection documents: ${usersSnapshot.size}`);

    if (usersSnapshot.size > 0) {
      console.log(`\n${colors.cyan}[INFO]${colors.reset} Sample user documents:`);
      usersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n  User ${index + 1} (${doc.id}):`);
        console.log(`    - Email: ${data.email || 'N/A'}`);
        console.log(`    - Display Name: ${data.displayName || 'N/A'}`);
        console.log(`    - Address: ${data.address || 'N/A'}`);
        console.log(`    - KYC Status: ${data.kycStatus || 'N/A'}`);
        console.log(`    - Created: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      });
    }

    return {
      success: true,
      userCount: usersSnapshot.size
    };
  } catch (error) {
    console.error(`${colors.red}[FAIL]${colors.reset} Firestore access failed:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate test report
 */
function generateReport(results) {
  console.log(`\n\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}FIREBASE AUTHENTICATION TEST REPORT${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.cyan}Project:${colors.reset} ${PROJECT_ID}`);
  console.log(`${colors.cyan}Date:${colors.reset} ${new Date().toISOString()}`);
  console.log(`${colors.cyan}Environment:${colors.reset} ${process.env.NODE_ENV || 'development'}\n`);

  console.log(`${colors.bright}Test Results:${colors.reset}`);
  console.log('-'.repeat(60));

  const tests = [
    { name: 'Authentication Connection', result: results.connection },
    { name: 'Custom Token Creation', result: results.customToken },
    { name: 'Firestore Access', result: results.firestore }
  ];

  let passedTests = 0;
  let failedTests = 0;

  tests.forEach(test => {
    const status = test.result?.success ?
      `${colors.green}✓ PASS${colors.reset}` :
      `${colors.red}✗ FAIL${colors.reset}`;

    console.log(`  ${status} - ${test.name}`);

    if (test.result?.success) {
      passedTests++;
    } else {
      failedTests++;
      if (test.result?.error) {
        console.log(`    Error: ${test.result.error}`);
      }
    }
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`${colors.bright}Summary:${colors.reset}`);
  console.log(`  Total Tests: ${tests.length}`);
  console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);

  if (results.providers) {
    const totalUsers = Object.values(results.providers).reduce((a, b) => a + b, 0);
    console.log(`\n  Total Registered Users: ${totalUsers}`);
  }

  console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
  console.log('  1. Enable authentication providers in Firebase Console');
  console.log('  2. Configure OAuth credentials (Google, Facebook)');
  console.log('  3. Add authorized domains for production');
  console.log('  4. Configure email templates');
  console.log('  5. Enable security features (MFA, email enumeration protection)');
  console.log('  6. Test authentication flows in frontend application');

  console.log(`\n${colors.cyan}Resources:${colors.reset}`);
  console.log(`  - Firebase Console: https://console.firebase.google.com/project/${PROJECT_ID}`);
  console.log(`  - Auth Providers: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/providers`);
  console.log(`  - Auth Settings: https://console.firebase.google.com/project/${PROJECT_ID}/authentication/settings`);
  console.log(`  - Documentation: docs/FIREBASE_AUTH_SETUP.md`);

  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  return {
    totalTests: tests.length,
    passed: passedTests,
    failed: failedTests,
    allPassed: failedTests === 0
  };
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}Firebase Authentication Test Suite${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}Project: ${PROJECT_ID}${colors.reset}\n`);

  // Initialize Firebase
  const initialized = initializeFirebase();
  if (!initialized) {
    console.log(`\n${colors.red}[ERROR]${colors.reset} Cannot proceed without Firebase initialization`);
    console.log(`\n${colors.yellow}Setup Instructions:${colors.reset}`);
    console.log('  1. Download service account key from Firebase Console');
    console.log('  2. Save as: scripts/service-account-key.json');
    console.log('  3. Or set FIREBASE_SERVICE_ACCOUNT_PATH environment variable');
    console.log(`\n  Download from: https://console.firebase.google.com/project/${PROJECT_ID}/settings/serviceaccounts/adminsdk\n`);
    process.exit(1);
  }

  const results = {};

  // Run tests
  results.connection = await testAuthConnection();
  results.providers = await checkAuthProviders();
  results.customToken = await testCustomTokenCreation();
  await checkSecuritySettings();
  results.firestore = await testFirestoreAccess();

  // Generate report
  const report = generateReport(results);

  // Exit with appropriate code
  process.exit(report.allPassed ? 0 : 1);
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
  testAuthConnection,
  checkAuthProviders,
  testCustomTokenCreation,
  checkSecuritySettings,
  testFirestoreAccess
};