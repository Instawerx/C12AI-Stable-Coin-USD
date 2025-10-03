/**
 * Setup Admin User Script
 * Creates admin user in Firebase Auth and sets custom claims
 *
 * Usage: node scripts/setup-admin.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const ADMIN_EMAIL = 'vrdivebar@gmail.com';
const ADMIN_WALLET = '0x7903c63CB9f42284d03BC2a124474760f9C1390b';

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...\n');

    // Step 1: Check if user exists in Firebase Auth
    let user;
    try {
      user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`✅ Found existing user: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('📝 User not found, creating new user...');

        // Create new user
        user = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          emailVerified: true,
          displayName: 'Super Admin',
        });

        console.log(`✅ Created user: ${user.uid}`);
        console.log(`📧 Password reset link will be sent to: ${ADMIN_EMAIL}`);

        // Generate password reset link
        const resetLink = await admin.auth().generatePasswordResetLink(ADMIN_EMAIL);
        console.log(`\n🔗 Password Reset Link:\n${resetLink}\n`);
      } else {
        throw error;
      }
    }

    // Step 2: Set custom claims for SUPER_ADMIN role
    console.log('🔐 Setting custom claims...');
    await admin.auth().setCustomUserClaims(user.uid, {
      adminRole: 'SUPER_ADMIN',
    });
    console.log('✅ Custom claims set: { adminRole: "SUPER_ADMIN" }');

    // Step 3: Update display name with wallet address
    console.log('👤 Updating user profile...');
    await admin.auth().updateUser(user.uid, {
      displayName: `Super Admin (${ADMIN_WALLET})`,
    });
    console.log('✅ User profile updated');

    // Step 4: Output Prisma commands to create database record
    console.log('\n📊 Next steps - Run these commands in Prisma Studio or psql:\n');
    console.log('--- SQL Commands ---');
    console.log(`
-- 1. Find or create user in users table
INSERT INTO users (id, email, address, created_at, updated_at)
VALUES ('${user.uid}', '${ADMIN_EMAIL}', '${ADMIN_WALLET}', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET address = '${ADMIN_WALLET}';

-- 2. Get the user ID
SELECT id FROM users WHERE email = '${ADMIN_EMAIL}';

-- 3. Create admin role (replace <user_id> with actual ID from step 2)
INSERT INTO admin_roles (id, user_id, role, permissions, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), '<user_id>', 'SUPER_ADMIN', ARRAY['ALL'], true, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET role = 'SUPER_ADMIN', is_active = true;
    `);

    console.log('\n✅ Admin setup complete!');
    console.log('\n📋 Summary:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   UID: ${user.uid}`);
    console.log(`   Wallet: ${ADMIN_WALLET}`);
    console.log(`   Role: SUPER_ADMIN`);
    console.log(`   Custom Claims: Set ✓`);

    console.log('\n🔄 Next Actions:');
    console.log('   1. Run the SQL commands above to create database records');
    console.log('   2. Have admin set password via reset link (if new user)');
    console.log('   3. Test login at /admin/payments');
    console.log('   4. Deploy Firebase Functions and Security Rules');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

setupAdmin();
