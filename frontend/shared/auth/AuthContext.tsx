'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthSession, LoginRequest, WalletConnection } from '../types';
import { FirebaseAuthService, AuthUser } from './firebase';
import { Web3AuthService } from './web3';
import { apiClient } from '../api/client';

// Auth context state interface
interface AuthState {
  // User data
  user: User | null;
  firebaseUser: AuthUser | null;
  walletConnection: WalletConnection | null;

  // Loading states
  isLoading: boolean;
  isAuthenticating: boolean;

  // Error state
  error: string | null;

  // Auth status
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isWalletConnected: boolean;
}

// Auth context actions interface
interface AuthActions {
  // Firebase authentication
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;

  // Web3 authentication
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchChain: (chain: 'BSC' | 'POLYGON') => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;

  // General
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
}

// Combined context interface
interface AuthContextType extends AuthState, AuthActions {}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    walletConnection: null,
    isLoading: true,
    isAuthenticating: false,
    error: null,
    isAuthenticated: false,
    isEmailVerified: false,
    isWalletConnected: false,
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Set error
  const setError = useCallback((error: string) => {
    updateState({ error, isAuthenticating: false });
  }, [updateState]);

  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  // Set authenticating state
  const setAuthenticating = useCallback((isAuthenticating: boolean) => {
    updateState({ isAuthenticating });
  }, [updateState]);

  // Sync user data from backend
  const syncUserData = useCallback(async (firebaseUser: AuthUser) => {
    try {
      const response = await apiClient.getProfile();
      if (response.success && response.data) {
        updateState({
          user: response.data,
          isAuthenticated: true,
          isEmailVerified: firebaseUser.emailVerified,
        });
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  }, [updateState]);

  // Firebase authentication methods
  const signInWithGoogle = useCallback(async () => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await FirebaseAuthService.signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await syncUserData(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Google sign-in failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, syncUserData]);

  const signInWithFacebook = useCallback(async () => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await FirebaseAuthService.signInWithFacebook();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await syncUserData(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Facebook sign-in failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, syncUserData]);

  const signInWithApple = useCallback(async () => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await FirebaseAuthService.signInWithApple();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await syncUserData(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Apple sign-in failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, syncUserData]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await FirebaseAuthService.signInWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await syncUserData(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Email sign-in failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, syncUserData]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName?: string) => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await FirebaseAuthService.signUpWithEmail(email, password, displayName);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await syncUserData(result.user);
      }
    } catch (error: any) {
      setError(error.message || 'Email sign-up failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, syncUserData]);

  const resetPassword = useCallback(async (email: string) => {
    clearError();

    try {
      const result = await FirebaseAuthService.resetPassword(email);
      if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message || 'Password reset failed');
    }
  }, [clearError, setError]);

  const sendEmailVerification = useCallback(async () => {
    clearError();

    try {
      const result = await FirebaseAuthService.sendEmailVerification();
      if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message || 'Email verification failed');
    }
  }, [clearError, setError]);

  // Web3 authentication methods
  const connectWallet = useCallback(async () => {
    setAuthenticating(true);
    clearError();

    try {
      const result = await Web3AuthService.connectMetaMask();
      if (result.error) {
        setError(result.error);
      } else if (result.connection) {
        updateState({
          walletConnection: result.connection,
          isWalletConnected: true,
        });
      }
    } catch (error: any) {
      setError(error.message || 'Wallet connection failed');
    }

    setAuthenticating(false);
  }, [setAuthenticating, clearError, setError, updateState]);

  const disconnectWallet = useCallback(async () => {
    try {
      await Web3AuthService.disconnect();
      updateState({
        walletConnection: null,
        isWalletConnected: false,
      });
    } catch (error: any) {
      setError(error.message || 'Wallet disconnection failed');
    }
  }, [updateState, setError]);

  const switchChain = useCallback(async (chain: 'BSC' | 'POLYGON') => {
    clearError();

    try {
      const result = await Web3AuthService.switchChain(chain);
      if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      setError(error.message || 'Chain switch failed');
    }
  }, [clearError, setError]);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    clearError();

    try {
      const result = await Web3AuthService.signMessage(message);
      if (result.error) {
        setError(result.error);
        return null;
      }
      return result.signature;
    } catch (error: any) {
      setError(error.message || 'Message signing failed');
      return null;
    }
  }, [clearError, setError]);

  // General authentication methods
  const signOut = useCallback(async () => {
    try {
      await FirebaseAuthService.signOut();
      await Web3AuthService.disconnect();
      await apiClient.logout();

      updateState({
        user: null,
        firebaseUser: null,
        walletConnection: null,
        isAuthenticated: false,
        isEmailVerified: false,
        isWalletConnected: false,
        error: null,
      });
    } catch (error: any) {
      setError(error.message || 'Sign out failed');
    }
  }, [updateState, setError]);

  const refreshAuth = useCallback(async () => {
    setLoading(true);

    try {
      // Check Firebase auth state
      const firebaseUser = FirebaseAuthService.getCurrentUser();
      if (firebaseUser) {
        await syncUserData(firebaseUser);
      }

      // Check wallet connection
      const walletConnection = await Web3AuthService.getConnection();
      if (walletConnection) {
        updateState({
          walletConnection,
          isWalletConnected: true,
        });
      }
    } catch (error: any) {
      console.error('Error refreshing auth:', error);
    }

    setLoading(false);
  }, [setLoading, syncUserData, updateState]);

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      updateState({ firebaseUser });

      if (firebaseUser) {
        await syncUserData(firebaseUser);
      } else {
        updateState({
          user: null,
          isAuthenticated: false,
          isEmailVerified: false,
        });
      }

      setLoading(false);
    });

    // Check initial wallet connection
    refreshAuth();

    return unsubscribe;
  }, [updateState, syncUserData, setLoading, refreshAuth]);

  // Set up wallet event listeners
  useEffect(() => {
    const handleAccountChanged = (event: CustomEvent) => {
      updateState({
        walletConnection: {
          ...state.walletConnection!,
          address: event.detail.address,
        },
      });
    };

    const handleChainChanged = (event: CustomEvent) => {
      updateState({
        walletConnection: {
          ...state.walletConnection!,
          chainId: event.detail.chainId,
        },
      });
    };

    const handleDisconnected = () => {
      updateState({
        walletConnection: null,
        isWalletConnected: false,
      });
    };

    window.addEventListener('wallet:accountChanged', handleAccountChanged as EventListener);
    window.addEventListener('wallet:chainChanged', handleChainChanged as EventListener);
    window.addEventListener('wallet:disconnected', handleDisconnected);

    return () => {
      window.removeEventListener('wallet:accountChanged', handleAccountChanged as EventListener);
      window.removeEventListener('wallet:chainChanged', handleChainChanged as EventListener);
      window.removeEventListener('wallet:disconnected', handleDisconnected);
    };
  }, [updateState, state.walletConnection]);

  // Context value
  const contextValue: AuthContextType = {
    // State
    ...state,

    // Actions
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    sendEmailVerification,
    connectWallet,
    disconnectWallet,
    switchChain,
    signMessage,
    signOut,
    clearError,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;