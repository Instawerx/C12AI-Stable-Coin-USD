'use client';

import React from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlassCard className="p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-brand-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-brand-warning" />
        </div>

        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>

        <p className="text-text-secondary dark:text-text-dark-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-3">
          <GlassButton
            variant="secondary"
            onClick={() => window.history.back()}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </GlassButton>

          <Link href="/" className="flex-1">
            <GlassButton variant="primary" className="w-full">
              <Home className="w-4 h-4" />
              Home
            </GlassButton>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border-light">
          <p className="text-sm text-text-secondary">
            Need help? <Link href="/support" className="text-brand-primary hover:text-brand-secondary">Contact Support</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}