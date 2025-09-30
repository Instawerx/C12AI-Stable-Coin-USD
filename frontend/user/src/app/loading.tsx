import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading C12USD</h2>
        <p className="text-text-secondary dark:text-text-dark-secondary">
          Please wait while we load your dashboard...
        </p>
      </div>
    </div>
  );
}