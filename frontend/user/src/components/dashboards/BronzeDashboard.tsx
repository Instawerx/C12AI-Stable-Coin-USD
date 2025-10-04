'use client';

import React from 'react';
import { Award, TrendingUp, DollarSign, Activity, ShoppingCart, Send, Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { TokenIcon } from '../ui/TokenIcon';

interface BronzeDashboardProps {
  user: any;
  stats: any;
  recentTransactions: any[];
}

export const BronzeDashboard: React.FC<BronzeDashboardProps> = ({ user, stats, recentTransactions }) => {
  return (
    <div className="space-y-8">
      {/* Bronze Tier Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-400/10 to-amber-500/20 p-8 border border-orange-300/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur-lg opacity-50 animate-pulse" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-xl">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Bronze Member
                </h1>
                <Badge variant="warning" size="lg" className="shadow-lg">TIER 1</Badge>
              </div>
              <p className="text-gray-600 mt-1">Welcome to your member dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Your Voting Power</div>
            <div className="text-3xl font-bold text-orange-600">1.0x</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.totalBalance}</div>
            <div className="text-sm text-gray-600">Total Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <TokenIcon type="C12USD" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${stats.c12usdBalance}</div>
            <div className="text-sm text-gray-600">C12USD Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <TokenIcon type="C12DAO" size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">50</div>
            <div className="text-sm text-gray-600">C12DAO Tokens</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-2xl group-hover:bg-green-400/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{recentTransactions.length}</div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          Bronze Member Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/app/transactions?type=mint">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Buy Tokens</div>
                  <div className="text-xs text-gray-600">Purchase C12USD</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <Link href="/app/wallet">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Transfer</div>
                  <div className="text-xs text-gray-600">Send tokens</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <Link href="/app/history">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-lg transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">History</div>
                  <div className="text-xs text-gray-600">View activity</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Export</div>
                <div className="text-xs text-gray-600">Download data</div>
              </div>
            </div>
          </GlassButton>
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {recentTransactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-white/30 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'mint' ? 'bg-green-100' : tx.type === 'redeem' ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {tx.type === 'mint' ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> :
                   tx.type === 'redeem' ? <ArrowUpRight className="w-5 h-5 text-orange-600" /> :
                   <Send className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <div className="font-semibold capitalize">{tx.type}</div>
                  <div className="text-sm text-gray-600">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">${tx.amount}</div>
                <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Upgrade CTA */}
      <GlassCard className="p-8 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-400/20 to-gray-600/20 rounded-full blur-3xl" />
        <div className="relative text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-3">Upgrade to Silver Tier</h3>
          <p className="text-gray-600 mb-6">
            Get enhanced voting weight, priority support, and quarterly rewards
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/app/dao">
              <GlassButton variant="primary" size="lg">
                View Upgrade Options
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
