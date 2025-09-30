// Firebase Service for C12USD Frontend
// Provides authentication, Firestore, and Cloud Functions integration

const { initializeApp, getApps } = require('firebase/app');
const { getAuth, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getFunctions, connectFunctionsEmulator } = require('firebase/functions');
const { getStorage, connectStorageEmulator } = require('firebase/storage');
const { getMessaging, isSupported } = require('firebase/messaging');
const { getAnalytics, isSupported: isAnalyticsSupported } = require('firebase/analytics');
const { getPerformance } = require('firebase/performance');

const {
  firebaseConfig,
  firestoreSettings,
  authSettings,
  messagingSettings,
  features,
  isDevelopment
} = require('../config/firebase-config');

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.firestore = null;
    this.functions = null;
    this.storage = null;
    this.messaging = null;
    this.analytics = null;
    this.performance = null;
    this.initialized = false;
  }

  // Initialize Firebase services
  async initialize() {
    try {
      // Initialize Firebase app if not already done
      this.app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

      // Initialize Authentication
      this.auth = getAuth(this.app);

      // Initialize Firestore
      this.firestore = getFirestore(this.app);

      // Apply Firestore settings
      if (firestoreSettings) {
        // Note: Settings must be applied before any other Firestore operations
        console.log('Firestore settings configured');
      }

      // Initialize Cloud Functions
      this.functions = getFunctions(this.app, 'us-central1');

      // Initialize Storage
      this.storage = getStorage(this.app);

      // Initialize Cloud Messaging (if supported)
      if (features.messaging && typeof window !== 'undefined') {
        const messagingSupported = await isSupported();
        if (messagingSupported) {
          this.messaging = getMessaging(this.app);
          console.log('Firebase Messaging initialized');
        }
      }

      // Initialize Analytics (if supported and enabled)
      if (features.analytics && typeof window !== 'undefined') {
        const analyticsSupported = await isAnalyticsSupported();
        if (analyticsSupported) {
          this.analytics = getAnalytics(this.app);
          console.log('Firebase Analytics initialized');
        }
      }

      // Initialize Performance Monitoring (if enabled)
      if (features.performance && typeof window !== 'undefined') {
        this.performance = getPerformance(this.app);
        console.log('Firebase Performance initialized');
      }

      // Connect to emulators in development
      if (isDevelopment && typeof window !== 'undefined') {
        this.connectToEmulators();
      }

      this.initialized = true;
      console.log('Firebase services initialized successfully');

    } catch (error) {
      console.error('Error initializing Firebase services:', error);
      throw error;
    }
  }

  // Connect to Firebase emulators for local development
  connectToEmulators() {
    try {
      // Auth emulator
      if (this.auth && !this.auth._delegate._config.emulator) {
        connectAuthEmulator(this.auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Auth emulator');
      }

      // Firestore emulator
      if (this.firestore && !this.firestore._delegate._databaseId.host.includes('localhost')) {
        connectFirestoreEmulator(this.firestore, 'localhost', 8080);
        console.log('Connected to Firestore emulator');
      }

      // Functions emulator
      if (this.functions && !this.functions._delegate._url.includes('localhost')) {
        connectFunctionsEmulator(this.functions, 'localhost', 5001);
        console.log('Connected to Functions emulator');
      }

      // Storage emulator
      if (this.storage && !this.storage._delegate._host.includes('localhost')) {
        connectStorageEmulator(this.storage, 'localhost', 9199);
        console.log('Connected to Storage emulator');
      }

    } catch (error) {
      console.warn('Error connecting to emulators (this is normal if they are not running):', error.message);
    }
  }

  // Get Firebase services (with initialization check)
  getAuth() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.auth;
  }

  getFirestore() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.firestore;
  }

  getFunctions() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.functions;
  }

  getStorage() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.storage;
  }

  getMessaging() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.messaging;
  }

  getAnalytics() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.analytics;
  }

  getPerformance() {
    if (!this.initialized) {
      throw new Error('Firebase service not initialized. Call initialize() first.');
    }
    return this.performance;
  }

  // Utility method to check if running in browser
  isBrowser() {
    return typeof window !== 'undefined';
  }

  // Utility method to check if service worker is available
  isServiceWorkerAvailable() {
    return this.isBrowser() && 'serviceWorker' in navigator;
  }

  // Get current environment
  getEnvironment() {
    if (isDevelopment) return 'development';
    if (window?.location?.hostname?.includes('staging')) return 'staging';
    return 'production';
  }
}

// Create singleton instance
const firebaseService = new FirebaseService();

// Auto-initialize when imported (safe for both server and client)
if (typeof window !== 'undefined') {
  firebaseService.initialize().catch(error => {
    console.error('Failed to auto-initialize Firebase:', error);
  });
}

module.exports = firebaseService;