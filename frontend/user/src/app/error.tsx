'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-brand-error" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>

        <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
            <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            onClick={reset}
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </GlassButton>

          <Link href="/" className="flex-1">
            <GlassButton variant="primary" className="w-full">
              <Home className="w-4 h-4" />
              Go Home
            </GlassButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}