import * as admin from 'firebase-admin';
declare let app: admin.app.App;
export declare const initializeApp: () => admin.app.App;
export declare const getFirestoreInstance: () => admin.firestore.Firestore;
export declare const getStorageInstance: () => import("firebase-admin/storage").Storage;
export declare const getAuthInstance: () => import("firebase-admin/auth").Auth;
export { app };
//# sourceMappingURL=firebase.d.ts.map