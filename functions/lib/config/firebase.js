"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.getAuthInstance = exports.getStorageInstance = exports.getFirestoreInstance = exports.initializeApp = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("firebase-admin/auth");
let app;
const initializeApp = () => {
    if (!app) {
        // Initialize Firebase Admin with service account
        exports.app = app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.GCLOUD_PROJECT || 'c12ai-dao',
            storageBucket: `${process.env.GCLOUD_PROJECT || 'c12ai-dao'}.appspot.com`,
            databaseURL: `https://${process.env.GCLOUD_PROJECT || 'c12ai-dao'}-default-rtdb.firebaseio.com`
        });
        // Configure Firestore settings
        const firestore = (0, firestore_1.getFirestore)(app);
        firestore.settings({
            ignoreUndefinedProperties: true,
            timestampsInSnapshots: true
        });
        console.log('Firebase Admin initialized successfully');
    }
    return app;
};
exports.initializeApp = initializeApp;
const getFirestoreInstance = () => {
    if (!app)
        (0, exports.initializeApp)();
    return (0, firestore_1.getFirestore)(app);
};
exports.getFirestoreInstance = getFirestoreInstance;
const getStorageInstance = () => {
    if (!app)
        (0, exports.initializeApp)();
    return (0, storage_1.getStorage)(app);
};
exports.getStorageInstance = getStorageInstance;
const getAuthInstance = () => {
    if (!app)
        (0, exports.initializeApp)();
    return (0, auth_1.getAuth)(app);
};
exports.getAuthInstance = getAuthInstance;
//# sourceMappingURL=firebase.js.map