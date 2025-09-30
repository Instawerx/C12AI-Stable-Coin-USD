import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-gradient p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">C12</span>
            </div>
            <span className="text-2xl font-semibold">C12USD</span>
          </Link>
        </div>

        <div className="text-white">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to the Future of Stablecoins
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of users who trust C12USD for secure, transparent, and cross-chain stablecoin transactions.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Cross-chain compatibility</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">DAO governance</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Full transparency</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-white/90">Secure & audited</span>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2024 C12AI DAO. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background-primary dark:bg-background-dark-primary">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}