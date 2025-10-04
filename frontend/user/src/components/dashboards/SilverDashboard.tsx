'use client';

import React from 'react';
import { Star, TrendingUp, DollarSign, Activity, ShoppingCart, Send, Download, ArrowUpRight, ArrowDownLeft, Zap, Gift, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { TokenIcon } from '../ui/TokenIcon';

interface SilverDashboardProps {
  user: any;
  stats: any;
  recentTransactions: any[];
}

export const SilverDashboard: React.FC<SilverDashboardProps> = ({ user, stats, recentTransactions }) => {
  return (
    <div className="space-y-8">
      {/* Silver Tier Header with Enhanced Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 p-8 border-2 border-gray-300/50 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-300/30 to-slate-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-400/20 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-500 rounded-xl blur-xl opacity-60 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-500 rounded-xl blur-sm opacity-40" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-gray-400 via-slate-400 to-gray-500 rounded-xl flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                <Star className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-600 via-slate-600 to-gray-700 bg-clip-text text-transparent">
                  Silver Member
                </h1>
                <Badge variant="secondary" size="lg" className="shadow-lg bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0">TIER 2</Badge>
              </div>
              <p className="text-gray-700 mt-1 font-medium">Enhanced benefits and priority support</p>
            </div>
          </div>
          <div className="text-right bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="text-sm text-gray-600 font-medium">Your Voting Power</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">1.5x</div>
            <div className="text-xs text-green-600 font-semibold">+50% Boost</div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-50" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">${stats.totalBalance}</div>
            <div className="text-sm text-gray-600 font-medium">Total Balance</div>
            <div className="mt-2 text-xs text-green-600 font-semibold">+12.5% this month</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-400/20 rounded-full blur-2xl group-hover:bg-gray-400/30 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-slate-500 rounded-xl blur-md opacity-50" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-gray-400 to-slate-500 rounded-xl flex items-center justify-center shadow-xl">
                  <TokenIcon type="C12USD" size={28} />
                </div>
              </div>
              <Star className="w-6 h-6 text-gray-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">${stats.c12usdBalance}</div>
            <div className="text-sm text-gray-600 font-medium">C12USD Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl blur-md opacity-50" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                  <TokenIcon type="C12DAO" size={28} />
                </div>
              </div>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">250</div>
            <div className="text-sm text-gray-600 font-medium">C12DAO Tokens</div>
            <div className="mt-2 text-xs text-purple-600 font-semibold">Silver Tier Allocation</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur-md opacity-50" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xl">
                  <Gift className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">$127.50</div>
            <div className="text-sm text-gray-600 font-medium">Quarterly Rewards</div>
            <div className="mt-2 text-xs text-green-600 font-semibold">Next payout in 45 days</div>
          </div>
        </GlassCard>
      </div>

      {/* Silver Member Benefits */}
      <GlassCard className="p-6 bg-gradient-to-br from-gray-50/50 to-slate-50/50">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          Silver Member Benefits
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-white/70 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Priority Support</div>
                <div className="text-sm text-gray-600">24/7 dedicated support team</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/70 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Early Access</div>
                <div className="text-sm text-gray-600">Beta features before public release</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/70 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Quarterly Rewards</div>
                <div className="text-sm text-gray-600">Earn rewards based on activity</div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quick Actions - Enhanced */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/app/transactions?type=mint">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-xl hover:scale-105 transition-all border-2 border-white/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg blur-md opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold">Buy Tokens</div>
                  <div className="text-xs text-gray-600">Priority processing</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <Link href="/app/wallet">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-xl hover:scale-105 transition-all border-2 border-white/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg blur-md opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold">Transfer</div>
                  <div className="text-xs text-gray-600">Fast transfers</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <Link href="/app/history">
            <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-xl hover:scale-105 transition-all border-2 border-white/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-md opacity-50" />
                  <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold">Analytics</div>
                  <div className="text-xs text-gray-600">Advanced insights</div>
                </div>
              </div>
            </GlassButton>
          </Link>

          <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-xl hover:scale-105 transition-all border-2 border-white/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg blur-md opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-left">
                <div className="font-bold">Export</div>
                <div className="text-xs text-gray-600">Detailed reports</div>
              </div>
            </div>
          </GlassButton>
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-3">
          {recentTransactions.slice(0, 6).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/60 to-white/40 rounded-xl border border-white/40 hover:shadow-lg hover:scale-102 transition-all">
              <div className="flex items-center gap-4">
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
                  tx.type === 'mint' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                  tx.type === 'redeem' ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                  'bg-gradient-to-br from-blue-100 to-cyan-100'
                }`}>
                  <div className={`absolute inset-0 rounded-xl blur-sm opacity-50 ${
                    tx.type === 'mint' ? 'bg-green-400' :
                    tx.type === 'redeem' ? 'bg-orange-400' :
                    'bg-blue-400'
                  }`} />
                  <div className="relative">
                    {tx.type === 'mint' ? <ArrowDownLeft className="w-6 h-6 text-green-600" /> :
                     tx.type === 'redeem' ? <ArrowUpRight className="w-6 h-6 text-orange-600" /> :
                     <Send className="w-6 h-6 text-blue-600" />}
                  </div>
                </div>
                <div>
                  <div className="font-bold capitalize">{tx.type}</div>
                  <div className="text-sm text-gray-600">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${tx.amount}</div>
                <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm" className="shadow-md">
                  {tx.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Upgrade CTA */}
      <GlassCard className="p-8 relative overflow-hidden bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-300/30 to-amber-400/30 rounded-full blur-3xl" />
        <div className="relative text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Upgrade to Gold Tier
          </h3>
          <p className="text-gray-700 mb-6 font-medium">
            Premium voting weight, governance committee eligibility, and monthly rewards
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/app/dao">
              <GlassButton variant="primary" size="lg" className="shadow-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-2xl">
                View Gold Benefits
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
