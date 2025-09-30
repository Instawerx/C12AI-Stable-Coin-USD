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
  Loader,
  User,
  Check
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import toast from 'react-hot-toast';

const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
  { id: 'uppercase', text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
  { id: 'lowercase', text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
  { id: 'number', text: 'One number', test: (pwd: string) => /\d/.test(pwd) },
];

export default function SignUpPage() {
  const router = useRouter();
  const {
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    connectWallet,
    isAuthenticating,
    error,
    clearError,
  } = useAuth();

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (clearError) {
      clearError();
    }
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    const passedRequirements = passwordRequirements.filter(req => req.test(password));
    return passedRequirements.length;
  };

  const isPasswordValid = () => {
    return getPasswordStrength() === passwordRequirements.length;
  };

  const isFormValid = () => {
    return (
      formData.displayName.trim() &&
      formData.email.trim() &&
      isPasswordValid() &&
      formData.password === formData.confirmPassword &&
      agreedToTerms
    );
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error('Please fill all fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail(formData.email, formData.password, formData.displayName);
      toast.success('Account created successfully! Please check your email for verification.');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (signInWithApple) {
        await signInWithApple();
      }
      toast.success('Account created successfully!');
      router.push('/app/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
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
        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Join the C12USD community today
        </p>
      </div>

      {/* Social Sign Up Options */}
      <div className="space-y-3 mb-6">
        <GlassButton
          variant="secondary"
          size="lg"
          className="w-full justify-center"
          onClick={() => handleSocialSignUp('google')}
          disabled={isAuthenticating}
        >
          <Chrome className="w-5 h-5" />
          Continue with Google
        </GlassButton>

        <GlassButton
          variant="secondary"
          size="lg"
          className="w-full justify-center"
          onClick={() => handleSocialSignUp('apple')}
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
            Or create account with email
          </span>
        </div>
      </div>

      {/* Email Sign Up Form */}
      <GlassCard className="p-6">
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <GlassInput
            type="text"
            name="displayName"
            label="Display name"
            value={formData.displayName}
            onChange={handleInputChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

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

          {/* Password Requirements */}
          {formData.password && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-text-secondary">Password requirements:</div>
              {passwordRequirements.map((req) => (
                <div key={req.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.test(formData.password)
                      ? 'bg-brand-success text-white'
                      : 'bg-surface-glass border border-border-light'
                  }`}>
                    {req.test(formData.password) && <Check className="w-3 h-3" />}
                  </div>
                  <span className={req.test(formData.password) ? 'text-brand-success' : 'text-text-secondary'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          <GlassInput
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            label="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={
              formData.confirmPassword && formData.password !== formData.confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
            required
          />

          {/* Terms and Conditions */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-primary bg-transparent border-border-light rounded focus:ring-brand-primary/20"
            />
            <label htmlFor="terms" className="text-sm text-text-secondary dark:text-text-dark-secondary">
              I agree to the{' '}
              <Link href="/terms" className="text-brand-primary hover:text-brand-secondary">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-brand-primary hover:text-brand-secondary">
                Privacy Policy
              </Link>
            </label>
          </div>

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
            disabled={!isFormValid() || isSubmitting || isAuthenticating}
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </GlassButton>
        </form>
      </GlassCard>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
          >
            Sign in
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