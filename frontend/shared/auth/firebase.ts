import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

appleProvider.addScope('email');
appleProvider.addScope('name');

// Auth service interface
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  providerData: any[];
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

// Transform Firebase user to our AuthUser interface
const transformFirebaseUser = (user: FirebaseUser): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
  providerId: user.providerId,
  providerData: user.providerData,
});

// Authentication service
export class FirebaseAuthService {
  // Social authentication
  static async signInWithGoogle(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = transformFirebaseUser(result.user);

      // Create/update user profile in Firestore
      await this.createUserProfile(user, 'GOOGLE');

      return { user };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Google sign-in failed',
      };
    }
  }

  static async signInWithFacebook(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = transformFirebaseUser(result.user);

      await this.createUserProfile(user, 'FACEBOOK');

      return { user };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Facebook sign-in failed',
      };
    }
  }

  static async signInWithApple(): Promise<AuthResult> {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const user = transformFirebaseUser(result.user);

      await this.createUserProfile(user, 'APPLE');

      return { user };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Apple sign-in failed',
      };
    }
  }

  // Email/password authentication
  static async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = transformFirebaseUser(result.user);

      return { user };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Email sign-in failed',
      };
    }
  }

  static async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResult> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      const user = transformFirebaseUser(result.user);

      // Send email verification
      await this.sendEmailVerification();

      // Create user profile
      await this.createUserProfile(user, 'EMAIL');

      return { user };
    } catch (error: any) {
      return {
        user: null,
        error: error.message || 'Email sign-up failed',
      };
    }
  }

  // Password reset
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  // Email verification
  static async sendEmailVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return { success: true };
      }
      return { success: false, error: 'No user logged in' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  }

  // Auth state observer
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? transformFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  // Get current user
  static getCurrentUser(): AuthUser | null {
    return auth.currentUser ? transformFirebaseUser(auth.currentUser) : null;
  }

  // Create/update user profile in Firestore
  private static async createUserProfile(
    user: AuthUser,
    loginMethod: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        lastLoginMethod: loginMethod,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          preferences: {
            darkMode: false,
            emailNotifications: true,
            pushNotifications: true,
            language: 'en',
          },
        });
      } else {
        // Update existing user profile
        await updateDoc(userRef, userData);
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
    }
  }

  // Get user profile from Firestore
  static async getUserProfile(uid: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile in Firestore
  static async updateUserProfile(uid: string, data: any): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }
}

export default FirebaseAuthService;