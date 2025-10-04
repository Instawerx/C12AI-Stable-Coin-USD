'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Star,
  Activity,
  ChevronRight,
  Plus,
  Send,
  Download,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useAccount, useBalance, useChainId } from 'wagmi';
import { WalletButton } from '../../../components/ui/WalletButton';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { Badge } from '../../../components/ui/Badge';
import { BuyTokensModal } from '../../../components/BuyTokensModal';
import { BronzeDashboard } from '../../../components/dashboards/BronzeDashboard';
import { SilverDashboard } from '../../../components/dashboards/SilverDashboard';
import { GoldDashboard } from '../../../components/dashboards/GoldDashboard';
import { PlatinumDashboard } from '../../../components/dashboards/PlatinumDashboard';
import { DiamondDashboard } from '../../../components/dashboards/DiamondDashboard';

// Helper function to map rarity to badge variant
const rarityToVariant = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'default';
    case 'uncommon': return 'secondary';
    case 'rare': return 'info';
    case 'epic': return 'warning';
    case 'legendary': return 'primary';
    default: return 'default';
  }
};

// Mock data - replace with real API calls
const mockData = {
  portfolio: {
    totalBalance: '1,250.00',
    totalBalanceChange: '+125.50',
    totalBalanceChangePercent: '+11.2%',
    c12usdBalance: '1,000.00',
    nativeBalances: {
      BNB: '0.25',
      MATIC: '150.00',
    },
  },
  recentTransactions: [
    {
      id: '1',
      type: 'mint',
      amount: '500.00',
      status: 'completed',
      date: '2024-01-15',
      txHash: '0x1234...5678',
    },
    {
      id: '2',
      type: 'redeem',
      amount: '250.00',
      status: 'pending',
      date: '2024-01-14',
      txHash: '0x8765...4321',
    },
    {
      id: '3',
      type: 'transfer',
      amount: '100.00',
      status: 'completed',
      date: '2024-01-13',
      txHash: '0x9999...1111',
    },
  ],
  daoStats: {
    memberCount: '10,234',
    totalVolume: '$125M',
    yourRank: '1,456',
    membershipTier: 'Gold',
  },
  badges: [
    { id: '1', name: 'Early Adopter', rarity: 'rare', icon: '🏆' },
    { id: '2', name: 'High Volume', rarity: 'epic', icon: '💎' },
    { id: '3', name: 'Community Member', rarity: 'common', icon: '🤝' },
  ],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const [selectedTimeframe, setSelectedTimeframe] = useState('7D');
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const timeframes = ['24H', '7D', '30D', '90D'];

  // Get user's membership tier and route to appropriate dashboard
  const membershipTier = user?.daoMembership?.membershipTier?.toLowerCase();

  // Render tier-specific dashboard if user has DAO membership
  if (user?.daoMembership && membershipTier) {
    const tierProps = {
      user,
      stats: mockData.portfolio,
      recentTransactions: mockData.recentTransactions
    };

    switch (membershipTier) {
      case 'bronze':
        return <BronzeDashboard {...tierProps} />;
      case 'silver':
        return <SilverDashboard {...tierProps} />;
      case 'gold':
        return <GoldDashboard {...tierProps} />;
      case 'platinum':
        return <PlatinumDashboard {...tierProps} />;
      case 'diamond':
        return <DiamondDashboard {...tierProps} />;
      default:
        // Fall through to default dashboard
        break;
    }
  }

  // Default dashboard for non-DAO members
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.displayName || 'User'}!
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            Here's your C12USD portfolio overview
          </p>
          {isConnected && address && (
            <p className="text-sm text-text-secondary mt-1 font-mono">
              {address.slice(0, 6)}...{address.slice(-4)} • {chainId === 56 ? 'BSC' : chainId === 137 ? 'Polygon' : 'Unknown Chain'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isConnected && <WalletButton />}
          <GlassButton variant="secondary">
            <Download className="w-4 h-4" />
            Export
          </GlassButton>
          <Link href="/app/transactions">
            <GlassButton variant="primary">
              <Plus className="w-4 h-4" />
              New Transaction
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Portfolio Card */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Portfolio Balance</h2>
              <div className="flex items-center gap-2">
                {timeframes.map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      selectedTimeframe === timeframe
                        ? 'bg-brand-primary text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-glass'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold">
                  ${mockData.portfolio.totalBalance}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-brand-success font-medium">
                    {mockData.portfolio.totalBalanceChange}
                  </span>
                  <span className="text-brand-success text-sm">
                    ({mockData.portfolio.totalBalanceChangePercent})
                  </span>
                  <TrendingUp className="w-4 h-4 text-brand-success" />
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 glass-card rounded-lg flex items-center justify-center">
                <div className="text-center text-text-secondary">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Portfolio chart will be displayed here</p>
                  <p className="text-sm">(Integration with charting library)</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <GlassButton
                variant="primary"
                className="w-full justify-start"
                onClick={() => setIsBuyModalOpen(true)}
              >
                <ShoppingCart className="w-4 h-4 text-white" />
                Buy Tokens
                <ChevronRight className="w-4 h-4 ml-auto" />
              </GlassButton>
              <Link href="/app/transactions?type=mint">
                <GlassButton variant="secondary" className="w-full justify-start">
                  <ArrowDownLeft className="w-4 h-4 text-brand-success" />
                  Mint C12USD
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </GlassButton>
              </Link>
              <Link href="/app/transactions?type=redeem">
                <GlassButton variant="secondary" className="w-full justify-start">
                  <ArrowUpRight className="w-4 h-4 text-brand-warning" />
                  Redeem C12USD
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </GlassButton>
              </Link>
              <Link href="/app/wallet">
                <GlassButton variant="secondary" className="w-full justify-start">
                  <Send className="w-4 h-4 text-brand-primary" />
                  Transfer
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </GlassButton>
              </Link>
            </div>
          </GlassCard>

          {/* Balance Breakdown */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Balance Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C12</span>
                  </div>
                  <span>C12USD</span>
                </div>
                <span className="font-medium">${mockData.portfolio.c12usdBalance}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">BNB</span>
                  </div>
                  <span>BNB</span>
                </div>
                <span className="font-medium">{mockData.portfolio.nativeBalances.BNB}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MATIC</span>
                  </div>
                  <span>MATIC</span>
                </div>
                <span className="font-medium">{mockData.portfolio.nativeBalances.MATIC}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Activity & DAO Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Link href="/app/history">
              <GlassButton variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </div>

          <div className="space-y-4">
            {mockData.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'mint' ? 'bg-brand-success/20 text-brand-success' :
                    tx.type === 'redeem' ? 'bg-brand-warning/20 text-brand-warning' :
                    'bg-brand-primary/20 text-brand-primary'
                  }`}>
                    {tx.type === 'mint' ? <ArrowDownLeft className="w-4 h-4" /> :
                     tx.type === 'redeem' ? <ArrowUpRight className="w-4 h-4" /> :
                     <Send className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{tx.type}</div>
                    <div className="text-sm text-text-secondary">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${tx.amount}</div>
                  <Badge
                    variant={tx.status === 'completed' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* DAO Status */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">DAO Membership</h2>
            <Link href="/app/dao">
              <GlassButton variant="ghost" size="sm">
                View DAO
                <ChevronRight className="w-4 h-4" />
              </GlassButton>
            </Link>
          </div>

          {user?.daoMembership ? (
            <div className="space-y-4">
              <div className="text-center">
                <Badge variant="primary" size="lg" className="mb-3">
                  {mockData.daoStats.membershipTier} Member
                </Badge>
                <div className="text-sm text-text-secondary">
                  Rank #{mockData.daoStats.yourRank} of {mockData.daoStats.memberCount}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold">{mockData.daoStats.memberCount}</div>
                  <div className="text-sm text-text-secondary">Members</div>
                </div>
                <div className="text-center p-3 glass-card rounded-lg">
                  <div className="text-lg font-bold">{mockData.daoStats.totalVolume}</div>
                  <div className="text-sm text-text-secondary">Total Volume</div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <div className="text-sm font-medium mb-3">Your Badges</div>
                <div className="flex flex-wrap gap-2">
                  {mockData.badges.map((badge) => (
                    <Badge
                      key={badge.id}
                      variant={rarityToVariant(badge.rarity)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <span>{badge.icon}</span>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
              <h3 className="text-lg font-medium mb-2">Join the DAO</h3>
              <p className="text-text-secondary mb-4">
                Become a member to unlock exclusive benefits and voting rights.
              </p>
              <Link href="/app/dao/join">
                <GlassButton variant="primary">
                  Join Now
                </GlassButton>
              </Link>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-6 h-6 text-brand-primary" />
          </div>
          <div className="text-2xl font-bold">${mockData.portfolio.totalBalance}</div>
          <div className="text-sm text-text-secondary">Total Balance</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-brand-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-brand-success" />
          </div>
          <div className="text-2xl font-bold">+{mockData.portfolio.totalBalanceChangePercent}</div>
          <div className="text-sm text-text-secondary">7D Change</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-brand-warning/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-6 h-6 text-brand-warning" />
          </div>
          <div className="text-2xl font-bold">${mockData.portfolio.c12usdBalance}</div>
          <div className="text-sm text-text-secondary">C12USD Balance</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-brand-secondary" />
          </div>
          <div className="text-2xl font-bold">{mockData.badges.length}</div>
          <div className="text-sm text-text-secondary">Badges Earned</div>
        </GlassCard>
      </div>

      {/* Buy Tokens Modal */}
      <BuyTokensModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        userAddress={address}
      />
    </div>
  );
}