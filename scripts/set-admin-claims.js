/**
 * Set Admin Custom Claims using Firebase CLI
 * This script works with firebase-admin initialized via Application Default Credentials
 */

const admin = require('firebase-admin');

// Initialize with application default credentials (works with Firebase CLI)
try {
  // Explicitly set the project ID from environment variable or default
  const projectId = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT || 'c12ai-dao-b3bbb';

  admin.initializeApp({
    projectId: projectId,
  });

  console.log(`Initializing Firebase Admin with project: ${projectId}\n`);
} catch (error) {
  console.log('Admin already initialized');
}

const ADMIN_EMAIL = 'vrdivebar@gmail.com';
const ADMIN_ROLE = 'SUPER_ADMIN';

async function setAdminClaims() {
  try {
    console.log('🔍 Looking up user by email...');
    console.log(`   Email: ${ADMIN_EMAIL}\n`);

    // Find user by email
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);

    console.log('✅ User found!');
    console.log(`   UID: ${user.uid}`);
    console.log(`   Display Name: ${user.displayName || 'Not set'}`);
    console.log(`   Email Verified: ${user.emailVerified}`);

    // Check existing custom claims
    console.log('\n📋 Current Custom Claims:');
    console.log(JSON.stringify(user.customClaims || {}, null, 2));

    // Set new custom claims
    console.log(`\n🔐 Setting custom claims: { adminRole: "${ADMIN_ROLE}" }`);
    await admin.auth().setCustomUserClaims(user.uid, {
      adminRole: ADMIN_ROLE,
    });

    console.log('✅ Custom claims updated successfully!');

    // Verify the update
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('\n📋 Updated Custom Claims:');
    console.log(JSON.stringify(updatedUser.customClaims, null, 2));

    console.log('\n✅ Setup Complete!');
    console.log('\n📝 User must sign out and sign back in for claims to take effect.');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Create database record in Prisma (see instructions below)');
    console.log('   2. Have user sign out and sign back in');
    console.log('   3. Test access to /admin/payments');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found: ${ADMIN_EMAIL}`);
      console.log('\n📝 User needs to sign up first:');
      console.log('   1. Go to your app login page');
      console.log('   2. Sign up with email: vrdivebar@gmail.com');
      console.log('   3. Connect wallet: 0x7903c63CB9f42284d03BC2a124474760f9C1390b');
      console.log('   4. Run this script again');
    } else {
      console.error('\n❌ Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the function
setAdminClaims();
