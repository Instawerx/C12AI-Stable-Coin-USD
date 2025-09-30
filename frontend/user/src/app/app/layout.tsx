'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Wallet,
  ArrowUpDown,
  History,
  Users,
  Settings,
  Bell,
  Menu,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { GlassNavbar } from '../../components/ui/GlassNavbar';
import { GlassButton } from '../../components/ui/GlassButton';
import { Badge } from '../../components/ui/Badge';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-text-dark-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/app/dashboard',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'wallet',
      label: 'Wallet',
      href: '/app/wallet',
      icon: <Wallet className="w-4 h-4" />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      href: '/app/transactions',
      icon: <ArrowUpDown className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'History',
      href: '/app/history',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'dao',
      label: 'DAO',
      href: '/app/dao',
      icon: <Users className="w-4 h-4" />,
      badge: user?.daoMembership ? undefined : 1,
    },
  ];

  const navActions = (
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <GlassButton variant="ghost" size="sm">
        <Bell className="w-4 h-4" />
      </GlassButton>

      {/* Theme Toggle */}
      <GlassButton variant="ghost" size="sm" onClick={toggleTheme}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </GlassButton>

      {/* User Menu */}
      <div className="relative group">
        <GlassButton variant="ghost" className="flex items-center gap-2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-brand-gradient rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {user?.displayName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          )}
          <span className="hidden sm:inline">{user?.displayName || 'User'}</span>
        </GlassButton>

        {/* Dropdown Menu */}
        <div className="absolute top-full right-0 mt-2 w-64 glass-modal border border-border-light rounded-xl shadow-floating opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{user?.displayName || 'User'}</div>
                <div className="text-sm text-text-secondary truncate">{user?.email}</div>
              </div>
            </div>

            {/* Membership Badge */}
            {user?.daoMembership && (
              <div className="mb-4">
                <Badge variant="primary" size="sm">
                  {user.daoMembership.membershipTier} Member
                </Badge>
              </div>
            )}

            <div className="space-y-1">
              <GlassButton
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/app/profile')}
              >
                <Settings className="w-4 h-4" />
                Settings
              </GlassButton>
              <GlassButton
                variant="ghost"
                className="w-full justify-start text-brand-error hover:text-brand-error"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary dark:bg-background-dark-primary">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/10 via-transparent to-transparent" />
      </div>

      {/* Navigation */}
      <GlassNavbar
        items={navItems}
        logo={
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C12</span>
            </div>
            <span className="text-xl font-semibold text-gradient">C12USD</span>
          </div>
        }
        logoHref="/app/dashboard"
        actions={navActions}
      />

      {/* Main Content */}
      <main className="container-glass py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-surface-modal border-t border-border-light backdrop-blur-xl z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <GlassButton
              key={item.id}
              variant="ghost"
              size="sm"
              className="flex-col gap-1 py-3 relative"
              onClick={() => router.push(item.href)}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
              {item.badge && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-brand-error rounded-full"></div>
              )}
            </GlassButton>
          ))}
          <GlassButton
            variant="ghost"
            size="sm"
            className="flex-col gap-1 py-3"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs">More</span>
          </GlassButton>
        </div>
      </div>

      {/* Safe area for mobile */}
      <div className="safe-bottom lg:hidden"></div>
    </div>
  );
}