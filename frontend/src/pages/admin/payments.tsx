import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import { ManualPaymentQueue } from '@/components/admin/ManualPaymentQueue';
import { PaymentAnalytics } from '@/components/admin/PaymentAnalytics';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import {
  BarChart3,
  List,
  AlertTriangle,
  Shield,
} from 'lucide-react';

type TabView = 'queue' | 'analytics';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('queue');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user has admin privileges
  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;

      if (!user) {
        router.push('/');
        return;
      }

      try {
        // Check admin role via custom claims or API
        const idTokenResult = await user.getIdTokenResult();
        const adminRole = idTokenResult.claims.adminRole;

        if (adminRole === 'SUPER_ADMIN' || adminRole === 'FINANCE_ADMIN') {
          setIsAdmin(true);
        } else {
          // User is not admin, redirect
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        router.push('/');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAdminRole();
  }, [user, authLoading, router]);

  // Loading state
  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <p>Verifying admin access...</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Not authorized
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">
            You do not have permission to access this page. Admin privileges required.
          </p>
          <GlassButton onClick={() => router.push('/')} variant="primary">
            Return Home
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payment Management - C12USD Admin</title>
        <meta name="description" content="Manage manual token purchases" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Payment Management
                </h1>
                <p className="text-gray-400">
                  Review and manage manual token purchase requests
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-green-400 text-sm font-medium">Admin</span>
                </div>
                <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="text-blue-400 text-sm">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <GlassCard className="p-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'queue'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="w-5 h-5" />
                  <span className="font-medium">Payment Queue</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Admin Warning */}
          <GlassCard className="p-4 mb-6 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 font-medium">Admin Responsibilities</p>
                <p className="text-gray-300 text-sm mt-1">
                  Verify all payment proofs carefully before approval. For Cash App payments,
                  ensure the screenshot shows payment to <strong>$C12Ai</strong> with the correct
                  amount. For stablecoin payments, verify the transaction on the blockchain explorer.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Content */}
          <div>
            {activeTab === 'queue' && <ManualPaymentQueue />}
            {activeTab === 'analytics' && <PaymentAnalytics />}
          </div>
        </div>
      </div>
    </>
  );
}
