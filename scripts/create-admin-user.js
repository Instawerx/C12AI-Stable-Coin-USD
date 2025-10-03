/**
 * Create Admin User Script
 * Creates a Firebase Auth user with admin privileges programmatically
 * Bypasses the need for manual signup
 */

const admin = require('firebase-admin');
const { PrismaClient } = require('../functions/node_modules/@prisma/client');

// Initialize Firebase Admin using application default credentials
admin.initializeApp({
  projectId: 'c12ai-dao-b3bbb'
});

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'vrdivebar@gmail.com';
const ADMIN_PASSWORD = 'TempPassword123!'; // Change this after first login
const ADMIN_NAME = 'VR Divebar';

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...');

    // Step 1: Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`✓ User already exists: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
          emailVerified: true
        });
        console.log(`✓ Created new user: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Step 2: Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin',
      permissions: {
        manageUsers: true,
        manageKYC: true,
        manageTransactions: true,
        manageReserves: true,
        manageCompliance: true,
        viewAnalytics: true,
        manageSettings: true
      }
    });
    console.log('✓ Set custom claims for admin');

    // Step 3: Create Firestore user document
    const userRef = admin.firestore().collection('users').doc(userRecord.uid);
    await userRef.set({
      uid: userRecord.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: 'admin',
      isAdmin: true,
      kycStatus: 'approved',
      kycLevel: 'tier3',
      emailVerified: true,
      accountStatus: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        createdBy: 'admin-script',
        source: 'manual-creation'
      }
    }, { merge: true });
    console.log('✓ Created Firestore user document');

    // Step 4: Create admin profile in Firestore
    const adminRef = admin.firestore().collection('admins').doc(userRecord.uid);
    await adminRef.set({
      uid: userRecord.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      permissions: {
        manageUsers: true,
        manageKYC: true,
        manageTransactions: true,
        manageReserves: true,
        manageCompliance: true,
        viewAnalytics: true,
        manageSettings: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✓ Created admin profile in Firestore');

    // Step 5: Create PostgreSQL admin record
    try {
      const adminRecord = await prisma.admin.upsert({
        where: { firebaseUid: userRecord.uid },
        update: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify({
            manageUsers: true,
            manageKYC: true,
            manageTransactions: true,
            manageReserves: true,
            manageCompliance: true,
            viewAnalytics: true,
            manageSettings: true
          }),
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          firebaseUid: userRecord.uid,
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: 'SUPER_ADMIN',
          permissions: JSON.stringify({
            manageUsers: true,
            manageKYC: true,
            manageTransactions: true,
            manageReserves: true,
            manageCompliance: true,
            viewAnalytics: true,
            manageSettings: true
          }),
          isActive: true,
          lastLogin: null
        }
      });
      console.log('✓ Created/Updated PostgreSQL admin record');
    } catch (dbError) {
      console.warn('⚠️  PostgreSQL operation failed (may need to run migrations first):', dbError.message);
    }

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Firebase UID: ${userRecord.uid}`);
    console.log('\n⚠️  IMPORTANT: Change your password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Run the script
createAdminUser();
