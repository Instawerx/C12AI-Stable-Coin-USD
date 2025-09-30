// Firebase Configuration for C12USD Frontend
// This file contains the Firebase client configuration and initialization

// Firebase configuration object
// In production, these values should be stored in environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-api-key-here",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "c12ai-dao.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "c12ai-dao",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "c12ai-dao.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "your-measurement-id"
};

// Firestore settings for better performance
const firestoreSettings = {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: false,
  merge: true
};

// Auth settings
const authSettings = {
  persistence: 'local', // 'local', 'session', or 'none'
  signInSuccessUrl: '/dashboard',
  signInFlow: 'popup', // 'popup' or 'redirect'
  customParameters: {
    prompt: 'select_account'
  }
};

// Real-time database settings (if using)
const databaseSettings = {
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`
};

// Cloud messaging settings
const messagingSettings = {
  vapidKey: process.env.FIREBASE_VAPID_KEY || "your-vapid-key"
};

// Performance monitoring settings
const performanceSettings = {
  dataCollectionEnabled: process.env.NODE_ENV === 'production',
  instrumentationEnabled: process.env.NODE_ENV === 'production'
};

// Analytics settings
const analyticsSettings = {
  anonymize_ip: true,
  allow_google_signals: process.env.NODE_ENV === 'production',
  allow_ad_personalization_signals: false
};

// Export configuration objects
module.exports = {
  firebaseConfig,
  firestoreSettings,
  authSettings,
  databaseSettings,
  messagingSettings,
  performanceSettings,
  analyticsSettings,

  // Environment helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NODE_ENV === 'staging',

  // Feature flags
  features: {
    analytics: process.env.FIREBASE_ANALYTICS_ENABLED === 'true',
    crashlytics: process.env.FIREBASE_CRASHLYTICS_ENABLED === 'true',
    performance: process.env.FIREBASE_PERFORMANCE_ENABLED === 'true',
    remoteConfig: process.env.FIREBASE_REMOTE_CONFIG_ENABLED === 'true',
    messaging: process.env.FIREBASE_MESSAGING_ENABLED === 'true'
  },

  // API endpoints
  apiEndpoints: {
    functions: process.env.FIREBASE_FUNCTIONS_URL || `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`,
    hosting: process.env.FIREBASE_HOSTING_URL || `https://${firebaseConfig.projectId}.web.app`,
    backend: process.env.BACKEND_API_URL || 'http://localhost:3000/api'
  }
};