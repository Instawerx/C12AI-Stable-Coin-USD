'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  Smartphone,
  Apple,
  Loader
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    connectWallet,
    isAuthenticating,
    error,
    clearError,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (clearError) {
      clearError();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signInWithEmail(formData.email, formData.password);
      toast.success('Welcome back!');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (signInWithApple) {
        await signInWithApple();
      }
      toast.success('Welcome back!');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleWalletConnect = async () => {
    try {
      if (connectWallet) {
        await connectWallet();
      }
      toast.success('Wallet connected!');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Wallet connection failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Sign in to your C12USD account
        </p>
      </div>

      {/* Social Login Options */}
      <div className="space-y-3 mb-6">
        <GlassButton
          variant="secondary"
          size="lg"
          className="w-full justify-center"
          onClick={() => handleSocialLogin('google')}
          disabled={isAuthenticating}
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="lg"
          className="w-full justify-center"
          onClick={() => handleSocialLogin('apple')}
          disabled={isAuthenticating}
        >
          <Apple className="w-5 h-5" />
          Continue with Apple
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="lg"
          className="w-full justify-center"
          onClick={handleWalletConnect}
          disabled={isAuthenticating}
        >
          <Smartphone className="w-5 h-5" />
          Connect Wallet
        </GlassButton>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-light"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background-primary dark:bg-background-dark-primary text-text-secondary dark:text-text-dark-secondary">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email Login Form */}
      <GlassCard className="p-6">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <GlassInput
            type="email"
            name="email"
            label="Email address"
            value={formData.email}
            onChange={handleInputChange}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <GlassInput
            type={showPassword ? 'text' : 'password'}
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          {error && (
            <div className="text-brand-error text-sm text-center">
              {error}
            </div>
          )}

          <GlassButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isSubmitting || isAuthenticating}
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </GlassButton>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
          >
            Forgot your password?
          </Link>
        </div>
      </GlassCard>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </motion.div>
  );
}