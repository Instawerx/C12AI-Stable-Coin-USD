'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, signInWithGoogle, signInWithFacebook, signInWithEmail, signUpWithEmail, logout } from '../lib/firebase';
import type { User, DaoMembership } from '../lib/types';

interface AuthUser extends User {
  // Firebase specific properties
  uid: string;
  avatar?: string;
  photoURL?: string;
  // Profile properties
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
  discord?: string;
  // Notification preferences
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  language?: string;
  preferredChain?: string;
  kycStatus?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ user: any; error: string | null }>;
  signInWithFacebook: () => Promise<{ user: any; error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: any; error: string | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ user: any; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  logout: () => Promise<{ error: string | null }>;
  // Wallet-related properties (placeholder implementations)
  walletConnection?: any;
  switchChain?: (chain: string) => Promise<void>;
  connectWallet?: () => Promise<void>;
  isAuthenticating?: boolean;
  error?: string;
  clearError?: () => void;
  signInWithApple?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || undefined,
          avatar: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          walletAddress: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          daoMembership: undefined, // Will be loaded separately if needed
          settings: undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    signUpWithEmail,
    signOut: logout,
    logout,
    // Placeholder implementations for wallet features
    walletConnection: null,
    switchChain: async (chain: string) => { console.log('Switch chain:', chain); },
    connectWallet: async () => { console.log('Connect wallet'); },
    isAuthenticating: false,
    error: undefined,
    clearError: () => { console.log('Clear error'); },
    signInWithApple: async () => { console.log('Sign in with Apple'); },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};