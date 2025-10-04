'use client';

import React from 'react';
import { Trophy, TrendingUp, DollarSign, Crown, ShoppingCart, Send, Download, ArrowUpRight, ArrowDownLeft, Zap, Gift, BarChart3, Shield, Users } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { TokenIcon } from '../ui/TokenIcon';

interface GoldDashboardProps {
  user: any;
  stats: any;
  recentTransactions: any[];
}

export const GoldDashboard: React.FC<GoldDashboardProps> = ({ user, stats, recentTransactions }) => {
  return (
    <div className="space-y-8">
      {/* Gold Tier Header - Premium Design */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 p-10 border-4 border-yellow-300/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-300/40 to-amber-400/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-300/20 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              {/* Multi-layer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-2xl opacity-70 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-2xl blur-xl opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl blur-sm opacity-40" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-yellow-200/80">
                <Trophy className="w-12 h-12 text-white drop-shadow-2xl" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 bg-clip-text text-transparent drop-shadow-sm">
                  Gold Member
                </h1>
                <Badge variant="warning" size="lg" className="shadow-2xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 px-4 py-2 text-base">
                  TIER 3
                </Badge>
              </div>
              <p className="text-gray-800 mt-2 font-semibold text-lg">Premium tier with exclusive governance access</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg shadow-lg">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">Governance Eligible</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-lg shadow-lg">
                  <Gift className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">Monthly Rewards</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right bg-gradient-to-br from-white/80 to-yellow-50/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-yellow-200/60">
            <div className="text-sm text-gray-700 font-semibold mb-1">Your Voting Power</div>
            <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">2.5x</div>
            <div className="text-sm text-green-600 font-bold mt-1">+150% Boost</div>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-yellow-200/40">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl blur-lg opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-xs font-bold text-green-600">+15.2%</div>
            </div>
            <div className="text-3xl font-black text-gray-900">${stats.totalBalance}</div>
            <div className="text-sm text-gray-600 font-semibold mt-1">Total Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-yellow-200/40">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-400 to-amber-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl blur-lg opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <TokenIcon type="C12USD" size={32} />
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">${stats.c12usdBalance}</div>
            <div className="text-sm text-gray-600 font-semibold mt-1">C12USD Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-yellow-200/40">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl blur-lg opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <TokenIcon type="C12DAO" size={32} />
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">1,000</div>
            <div className="text-sm text-gray-600 font-semibold mt-1">C12DAO Tokens</div>
            <div className="mt-2"><Badge variant="warning" size="sm">Gold Tier</Badge></div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-yellow-200/40">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 group-hover:scale-150 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur-lg opacity-50" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-xl ring-2 ring-white/50">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-xs font-bold text-gray-600">Next in 12 days</div>
            </div>
            <div className="text-3xl font-black text-gray-900">$450.00</div>
            <div className="text-sm text-gray-600 font-semibold mt-1">Monthly Rewards</div>
          </div>
        </GlassCard>
      </div>

      {/* Exclusive Gold Benefits */}
      <GlassCard className="p-8 bg-gradient-to-br from-yellow-50/70 to-amber-50/70 border-2 border-yellow-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-700 to-amber-700 bg-clip-text text-transparent">
            Gold Tier Exclusive Benefits
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Governance Committee', desc: 'Eligible for leadership roles', color: 'from-blue-500 to-cyan-600' },
            { icon: Zap, title: 'Priority Features', desc: 'Beta access & custom tools', color: 'from-purple-500 to-pink-600' },
            { icon: Users, title: 'Direct Team Access', desc: 'Exclusive communication channel', color: 'from-green-500 to-emerald-600' },
            { icon: Gift, title: 'Monthly Rewards', desc: 'Automatic reward distribution', color: 'from-yellow-500 to-amber-600' }
          ].map((benefit, i) => (
            <div key={i} className="p-5 bg-white/80 rounded-xl border-2 border-yellow-100/50 hover:shadow-xl hover:scale-105 transition-all group">
              <div className={`w-12 h-12 bg-gradient-to-br ${benefit.color} rounded-lg flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-gray-900 mb-1">{benefit.title}</div>
              <div className="text-sm text-gray-600">{benefit.desc}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Premium Quick Actions */}
      <GlassCard className="p-8">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          Premium Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: '/app/transactions?type=mint', icon: ShoppingCart, title: 'Buy Tokens', desc: 'Priority processing', color: 'from-green-500 to-emerald-600' },
            { href: '/app/wallet', icon: Send, title: 'Transfer', desc: 'Instant transfers', color: 'from-blue-500 to-cyan-600' },
            { href: '/app/history', icon: BarChart3, title: 'Analytics', desc: 'Premium insights', color: 'from-purple-500 to-pink-600' },
            { href: '#', icon: Download, title: 'Export', desc: 'Full data access', color: 'from-gray-600 to-gray-700' }
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-2xl hover:scale-105 transition-all border-2 border-yellow-100/50 h-24">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} rounded-xl blur-lg opacity-50`} />
                    <div className={`relative w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-base">{action.title}</div>
                    <div className="text-xs text-gray-600 font-medium">{action.desc}</div>
                  </div>
                </div>
              </GlassButton>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Activity & Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/70 to-yellow-50/30 rounded-xl border-2 border-yellow-100/40 hover:shadow-xl hover:scale-102 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center ${
                    tx.type === 'mint' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                    tx.type === 'redeem' ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                    'bg-gradient-to-br from-blue-100 to-cyan-100'
                  }`}>
                    <div className={`absolute inset-0 rounded-xl blur-md opacity-60 ${
                      tx.type === 'mint' ? 'bg-green-400' :
                      tx.type === 'redeem' ? 'bg-orange-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="relative">
                      {tx.type === 'mint' ? <ArrowDownLeft className="w-7 h-7 text-green-600" /> :
                       tx.type === 'redeem' ? <ArrowUpRight className="w-7 h-7 text-orange-600" /> :
                       <Send className="w-7 h-7 text-blue-600" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold capitalize text-lg">{tx.type}</div>
                    <div className="text-sm text-gray-600 font-medium">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl">${tx.amount}</div>
                  <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm" className="shadow-lg">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold mb-6">Performance Metrics</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white/70 rounded-xl border border-blue-200/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Monthly Volume</span>
                <span className="text-lg font-bold text-blue-600">$25,650</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{width: '78%'}} />
              </div>
            </div>
            <div className="p-4 bg-white/70 rounded-xl border border-purple-200/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Governance Participation</span>
                <span className="text-lg font-bold text-purple-600">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{width: '92%'}} />
              </div>
            </div>
            <div className="p-4 bg-white/70 rounded-xl border border-green-200/40">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Rewards Earned</span>
                <span className="text-lg font-bold text-green-600">$1,340</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{width: '85%'}} />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Upgrade to Platinum CTA */}
      <GlassCard className="p-10 relative overflow-hidden bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 border-4 border-blue-300/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/40 to-cyan-400/40 rounded-full blur-3xl" />
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl ring-4 ring-blue-200/50">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-700 via-cyan-700 to-blue-800 bg-clip-text text-transparent">
            Ascend to Platinum Tier
          </h3>
          <p className="text-gray-800 mb-8 text-lg font-semibold">
            Maximum voting weight, advisory board access, and weekly premium rewards
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/app/dao">
              <GlassButton variant="primary" size="lg" className="shadow-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-3xl px-8 py-4 text-lg">
                <Crown className="w-5 h-5" />
                Explore Platinum Benefits
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
