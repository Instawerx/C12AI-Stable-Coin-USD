/**
 * Count Firestore Documents
 *
 * Simple script to count documents in each collection
 * Useful for verifying seed script execution
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let app;
try {
  const serviceAccount = require('../serviceAccountKey.json');
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'c12ai-dao-b3bbb'
  });
} catch (error) {
  app = admin.initializeApp({
    projectId: 'c12ai-dao-b3bbb'
  });
}

const db = admin.firestore();

async function countDocuments() {
  console.log('📊 Counting Firestore documents...\n');

  const collections = [
    'config',
    'proof-of-reserves',
    'users',
    'transactions',
    'rate-limits',
    'kyc',
    'audit-logs'
  ];

  let totalDocs = 0;

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const count = snapshot.size;
      totalDocs += count;

      console.log(`   ${collectionName.padEnd(20)} ${count.toString().padStart(4)} documents`);

      if (count > 0 && count <= 3) {
        console.log(`      └─ Document IDs: ${snapshot.docs.map(d => d.id).join(', ')}`);
      }
    } catch (error) {
      console.log(`   ${collectionName.padEnd(20)} ERROR: ${error.message}`);
    }
  }

  console.log(`\n   ${'Total'.padEnd(20)} ${totalDocs.toString().padStart(4)} documents\n`);
}

countDocuments()
  .then(() => {
    console.log('✅ Count completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });