/**
 * Service Account Key Verification Script
 * Project: C12USD (c12ai-dao-b3bbb)
 *
 * This script verifies that the Firebase service account key is properly configured
 * and has the correct permissions.
 *
 * Usage: node scripts/verify-service-account.js
 */

const fs = require('fs');
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

// Expected project configuration
const EXPECTED_PROJECT_ID = 'c12ai-dao-b3bbb';
const EXPECTED_PROJECT_NUMBER = '268788831367';

// Possible locations for service account key
const KEY_LOCATIONS = [
  path.join(__dirname, '..', 'serviceAccountKey.json'),
  path.join(__dirname, 'serviceAccountKey.json'),
  path.join(__dirname, 'service-account-key.json'),
  process.env.GOOGLE_APPLICATION_CREDENTIALS
].filter(Boolean);

/**
 * Print section header
 */
function printHeader(title) {
  console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log('='.repeat(60));
}

/**
 * Print success message
 */
function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

/**
 * Print error message
 */
function printError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

/**
 * Print warning message
 */
function printWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

/**
 * Print info message
 */
function printInfo(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

/**
 * Check if service account key file exists
 */
function findServiceAccountKey() {
  printHeader('Checking for Service Account Key');

  console.log(`\nSearching in the following locations:`);
  KEY_LOCATIONS.forEach((location, index) => {
    console.log(`  ${index + 1}. ${location}`);
  });

  for (const location of KEY_LOCATIONS) {
    if (fs.existsSync(location)) {
      printSuccess(`Service account key found at: ${location}`);
      return location;
    }
  }

  printError('Service account key not found in any expected location');
  return null;
}

/**
 * Validate JSON structure
 */
function validateKeyStructure(keyPath) {
  printHeader('Validating Key Structure');

  try {
    const keyContent = fs.readFileSync(keyPath, 'utf8');
    const keyData = JSON.parse(keyContent);

    // Required fields
    const requiredFields = [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri',
      'auth_provider_x509_cert_url',
      'client_x509_cert_url'
    ];

    let allFieldsPresent = true;

    console.log('\nChecking required fields:');
    for (const field of requiredFields) {
      if (keyData.hasOwnProperty(field)) {
        printSuccess(`Field '${field}' present`);
      } else {
        printError(`Field '${field}' missing`);
        allFieldsPresent = false;
      }
    }

    if (!allFieldsPresent) {
      printError('Key structure is invalid - missing required fields');
      return null;
    }

    printSuccess('All required fields present');
    return keyData;

  } catch (error) {
    if (error instanceof SyntaxError) {
      printError('Invalid JSON format');
    } else {
      printError(`Error reading key file: ${error.message}`);
    }
    return null;
  }
}

/**
 * Verify project configuration
 */
function verifyProjectConfig(keyData) {
  printHeader('Verifying Project Configuration');

  let valid = true;

  // Check service account type
  if (keyData.type === 'service_account') {
    printSuccess(`Type: ${keyData.type}`);
  } else {
    printError(`Invalid type: ${keyData.type} (expected: service_account)`);
    valid = false;
  }

  // Check project ID
  if (keyData.project_id === EXPECTED_PROJECT_ID) {
    printSuccess(`Project ID: ${keyData.project_id}`);
  } else {
    printError(`Project ID mismatch: ${keyData.project_id} (expected: ${EXPECTED_PROJECT_ID})`);
    valid = false;
  }

  // Check client email format
  const expectedEmailPattern = /^firebase-adminsdk-.*@c12ai-dao-b3bbb\.iam\.gserviceaccount\.com$/;
  if (expectedEmailPattern.test(keyData.client_email)) {
    printSuccess(`Client email: ${keyData.client_email}`);
  } else {
    printWarning(`Client email format unexpected: ${keyData.client_email}`);
  }

  // Check private key format
  if (keyData.private_key && keyData.private_key.includes('BEGIN PRIVATE KEY')) {
    printSuccess('Private key format valid');
  } else {
    printError('Private key format invalid');
    valid = false;
  }

  return valid;
}

/**
 * Test Firebase Admin SDK initialization
 */
async function testFirebaseInit(keyPath) {
  printHeader('Testing Firebase Admin SDK Initialization');

  try {
    const admin = require('firebase-admin');
    const serviceAccount = require(keyPath);

    // Initialize app with service account
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: EXPECTED_PROJECT_ID
    }, 'test-app-' + Date.now());

    printSuccess('Firebase Admin SDK initialized successfully');

    // Test Firestore connection
    console.log('\nTesting Firestore connection...');
    const db = admin.firestore(app);
    const testDoc = await db.collection('config').doc('chains').get();

    if (testDoc.exists) {
      printSuccess('Firestore connection successful - data exists');
    } else {
      printWarning('Firestore connection successful - but no data found (database may be empty)');
    }

    // Clean up test app
    await app.delete();

    return true;

  } catch (error) {
    printError(`Firebase initialization failed: ${error.message}`);

    if (error.code === 'auth/invalid-credential') {
      console.log('\n  Possible causes:');
      console.log('  - Service account key is corrupted');
      console.log('  - Key was revoked or deleted');
      console.log('  - Wrong project configuration');
    }

    return false;
  }
}

/**
 * Check security considerations
 */
function checkSecurity(keyPath) {
  printHeader('Security Checks');

  // Check if key is in gitignore
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignore.includes('serviceAccountKey.json') || gitignore.includes('service-account-key.json')) {
      printSuccess('Service account key is in .gitignore');
    } else {
      printWarning('Service account key may not be in .gitignore - add it to prevent accidental commits');
    }
  }

  // Check file permissions (Unix-like systems)
  if (process.platform !== 'win32') {
    try {
      const stats = fs.statSync(keyPath);
      const permissions = (stats.mode & parseInt('777', 8)).toString(8);

      if (permissions === '600' || permissions === '400') {
        printSuccess(`File permissions are secure: ${permissions}`);
      } else {
        printWarning(`File permissions may be too permissive: ${permissions} (recommended: 600 or 400)`);
      }
    } catch (error) {
      printWarning('Unable to check file permissions');
    }
  }

  // Remind about security best practices
  console.log('\n' + colors.yellow + 'Security Reminders:' + colors.reset);
  console.log('  - Never commit this file to version control');
  console.log('  - Never share this file publicly');
  console.log('  - Rotate keys periodically (every 90 days)');
  console.log('  - Use environment variables in production');
  console.log('  - Delete unused service accounts');
}

/**
 * Generate report
 */
function generateReport(results) {
  printHeader('Verification Report');

  const checks = [
    { name: 'Key File Found', status: results.keyFound },
    { name: 'Valid JSON Structure', status: results.validStructure },
    { name: 'Project Configuration', status: results.validProject },
    { name: 'Firebase Initialization', status: results.firebaseInit }
  ];

  console.log('\nResults:');
  let allPassed = true;

  checks.forEach(check => {
    if (check.status) {
      printSuccess(check.name);
    } else {
      printError(check.name);
      allPassed = false;
    }
  });

  console.log('\n' + '='.repeat(60));

  if (allPassed) {
    console.log(`\n${colors.green}${colors.bright}✓ All checks passed - Service account is ready!${colors.reset}\n`);
    console.log('Next steps:');
    console.log('  1. Run Firestore seeding: node scripts/seed-firestore.js');
    console.log('  2. Test authentication: node scripts/test-firebase-auth.js');
    console.log('  3. Start Firebase emulators: firebase emulators:start');
  } else {
    console.log(`\n${colors.red}${colors.bright}✗ Some checks failed${colors.reset}\n`);
    console.log('To download service account key:');
    console.log('  1. Visit: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk');
    console.log('  2. Click "Generate new private key"');
    console.log('  3. Save as: C:\\Users\\tabor\\Downloads\\C12USD_project\\C12USD\\serviceAccountKey.json');
    console.log('\nFor detailed instructions, see: docs/SERVICE_ACCOUNT_KEY_GUIDE.md');
  }

  return allPassed;
}

/**
 * Main execution
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}Firebase Service Account Key Verification${colors.reset}`);
  console.log(`${colors.cyan}Project: ${EXPECTED_PROJECT_ID}${colors.reset}\n`);

  const results = {
    keyFound: false,
    validStructure: false,
    validProject: false,
    firebaseInit: false
  };

  // Step 1: Find service account key
  const keyPath = findServiceAccountKey();
  if (!keyPath) {
    console.log(`\n${colors.yellow}${colors.bright}Service Account Key Not Found${colors.reset}`);
    console.log('\nPlease download the service account key:');
    console.log('  1. Go to: https://console.firebase.google.com/project/c12ai-dao-b3bbb/settings/serviceaccounts/adminsdk');
    console.log('  2. Click "Generate new private key"');
    console.log('  3. Save as: serviceAccountKey.json in project root');
    console.log('\nFor detailed instructions: docs/SERVICE_ACCOUNT_KEY_GUIDE.md\n');
    process.exit(1);
  }
  results.keyFound = true;

  // Step 2: Validate structure
  const keyData = validateKeyStructure(keyPath);
  if (!keyData) {
    generateReport(results);
    process.exit(1);
  }
  results.validStructure = true;

  // Step 3: Verify project config
  results.validProject = verifyProjectConfig(keyData);

  // Step 4: Test Firebase initialization
  results.firebaseInit = await testFirebaseInit(keyPath);

  // Step 5: Security checks
  checkSecurity(keyPath);

  // Step 6: Generate report
  const allPassed = generateReport(results);

  process.exit(allPassed ? 0 : 1);
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
  findServiceAccountKey,
  validateKeyStructure,
  verifyProjectConfig,
  testFirebaseInit,
  checkSecurity
};
