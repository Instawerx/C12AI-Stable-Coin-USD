import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';

let app: admin.app.App;

export const initializeApp = () => {
  if (!app) {
    // Initialize Firebase Admin with service account
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.GCLOUD_PROJECT || 'c12ai-dao',
      storageBucket: `${process.env.GCLOUD_PROJECT || 'c12ai-dao'}.appspot.com`,
      databaseURL: `https://${process.env.GCLOUD_PROJECT || 'c12ai-dao'}-default-rtdb.firebaseio.com`
    });

    // Configure Firestore settings
    const firestore = getFirestore(app);
    firestore.settings({
      ignoreUndefinedProperties: true,
      timestampsInSnapshots: true
    });

    console.log('Firebase Admin initialized successfully');
  }
  return app;
};

export const getFirestoreInstance = () => {
  if (!app) initializeApp();
  return getFirestore(app);
};

export const getStorageInstance = () => {
  if (!app) initializeApp();
  return getStorage(app);
};

export const getAuthInstance = () => {
  if (!app) initializeApp();
  return getAuth(app);
};

export { app };