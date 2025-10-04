'use client';

import React from 'react';
import { Crown, TrendingUp, DollarSign, Sparkles, ShoppingCart, Send, Download, ArrowUpRight, ArrowDownLeft, Zap, Gift, BarChart3, Shield, Users, Star, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { TokenIcon } from '../ui/TokenIcon';

interface PlatinumDashboardProps {
  user: any;
  stats: any;
  recentTransactions: any[];
}

export const PlatinumDashboard: React.FC<PlatinumDashboardProps> = ({ user, stats, recentTransactions }) => {
  return (
    <div className="space-y-8">
      {/* Platinum Tier Header - Ultra Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 p-12 border-4 border-cyan-300/70 shadow-3xl">
        {/* Multiple animated glowing orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/50 to-cyan-400/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400/40 rounded-full blur-3xl animation-delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-300/30 rounded-full blur-2xl animate-pulse animation-delay-500" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="relative">
              {/* Intense multi-layer glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-3xl blur-3xl opacity-80 animate-pulse" />
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 rounded-2xl blur-2xl opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-60" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-3xl ring-4 ring-cyan-200">
                <Crown className="w-14 h-14 text-white drop-shadow-2xl animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent drop-shadow-lg">
                  Platinum Member
                </h1>
                <Badge variant="info" size="lg" className="shadow-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 px-6 py-3 text-lg animate-pulse">
                  TIER 4
                </Badge>
              </div>
              <p className="text-gray-900 mt-2 font-bold text-xl">Elite tier with maximum governance power</p>
              <div className="flex items-center gap-4 mt-4">
                {[
                  { icon: Shield, text: 'Advisory Board' },
                  { icon: Award, text: 'Weekly Rewards' },
                  { icon: Star, text: 'Custom Features' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/80 px-5 py-3 rounded-xl shadow-xl hover:scale-105 transition-transform">
                    <item.icon className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm font-bold text-gray-800">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right bg-gradient-to-br from-white/90 to-cyan-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-3xl border-4 border-cyan-200/70">
            <div className="text-base text-gray-800 font-bold mb-2">Your Voting Power</div>
            <div className="text-6xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">5.0x</div>
            <div className="text-base text-green-600 font-black mt-2 flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              +400% Boost
            </div>
          </div>
        </div>
      </div>

      {/* Executive Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-7 relative overflow-hidden group hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-cyan-200/50">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-600 to-cyan-700 opacity-15 rounded-full blur-3xl group-hover:opacity-25 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl blur-md opacity-50" />
                <div className="relative w-18 h-18 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/60">
                  <DollarSign className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="text-xs font-black px-3 py-1 rounded-lg bg-green-100 text-green-700">+22.8%</div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">${stats.totalBalance}</div>
            <div className="text-sm text-gray-700 font-bold">Total Balance</div>
            <div className="text-xs text-gray-600 font-semibold mt-1">All-time high</div>
          </div>
        </GlassCard>

        <GlassCard className="p-7 relative overflow-hidden group hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-cyan-200/50">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-15 rounded-full blur-3xl group-hover:opacity-25 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl blur-md opacity-50" />
                <div className="relative w-18 h-18 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/60">
                  <TokenIcon type="C12USD" size={36} />
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">${stats.c12usdBalance}</div>
            <div className="text-sm text-gray-700 font-bold">C12USD Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-7 relative overflow-hidden group hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-cyan-200/50">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-700 opacity-15 rounded-full blur-3xl group-hover:opacity-25 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl blur-md opacity-50" />
                <div className="relative w-18 h-18 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/60">
                  <TokenIcon type="C12DAO" size={36} />
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">5,000</div>
            <div className="text-sm text-gray-700 font-bold">C12DAO Tokens</div>
            <div className="mt-3"><Badge variant="info" size="sm" className="shadow-lg">Platinum Tier</Badge></div>
          </div>
        </GlassCard>

        <GlassCard className="p-7 relative overflow-hidden group hover:shadow-3xl hover:scale-110 transition-all duration-300 border-4 border-cyan-200/50">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-gradient-to-br from-green-600 to-emerald-700 opacity-15 rounded-full blur-3xl group-hover:opacity-25 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-400/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl blur-xl opacity-60 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl blur-md opacity-50" />
                <div className="relative w-18 h-18 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/60">
                  <Gift className="w-9 h-9 text-white" />
                </div>
              </div>
              <div className="text-xs font-black px-3 py-1 rounded-lg bg-cyan-100 text-cyan-700">Next in 3 days</div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-1">$2,250</div>
            <div className="text-sm text-gray-700 font-bold">Weekly Rewards</div>
          </div>
        </GlassCard>
      </div>

      {/* Elite Platinum Benefits */}
      <GlassCard className="p-10 bg-gradient-to-br from-cyan-50/80 to-blue-50/80 border-4 border-cyan-200/60 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-800 via-cyan-800 to-blue-900 bg-clip-text text-transparent">
            Platinum Executive Benefits
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Users, title: 'Advisory Board Access', desc: 'Direct influence on roadmap', color: 'from-blue-600 to-cyan-700' },
            { icon: Shield, title: 'Maximum Voting Power', desc: '5x voting weight on all proposals', color: 'from-purple-600 to-pink-700' },
            { icon: Zap, title: 'Custom Features', desc: 'Personalized tools & dashboards', color: 'from-yellow-500 to-amber-600' },
            { icon: Gift, title: 'Weekly Rewards', desc: 'Automated premium distributions', color: 'from-green-600 to-emerald-700' }
          ].map((benefit, i) => (
            <div key={i} className="p-6 bg-white/90 rounded-2xl border-4 border-cyan-100/60 hover:shadow-2xl hover:scale-105 transition-all group">
              <div className="relative mb-4">
                <div className={`absolute -inset-1 bg-gradient-to-br ${benefit.color} rounded-xl blur-md opacity-50`} />
                <div className={`relative w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="font-black text-gray-900 mb-2 text-lg">{benefit.title}</div>
              <div className="text-sm text-gray-700 font-medium">{benefit.desc}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Executive Actions */}
      <GlassCard className="p-10">
        <h2 className="text-3xl font-black mb-8 flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl blur-lg opacity-60" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          Executive Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { href: '/app/transactions?type=mint', icon: ShoppingCart, title: 'Buy Tokens', desc: 'VIP processing', color: 'from-green-600 to-emerald-700' },
            { href: '/app/wallet', icon: Send, title: 'Transfer', desc: 'Priority routing', color: 'from-blue-600 to-cyan-700' },
            { href: '/app/history', icon: BarChart3, title: 'Analytics', desc: 'Executive dashboards', color: 'from-purple-600 to-pink-700' },
            { href: '#', icon: Download, title: 'Export', desc: 'Full data API access', color: 'from-gray-700 to-gray-800' }
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-3xl hover:scale-110 transition-all border-4 border-cyan-100/50 h-28 p-5">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className={`absolute -inset-2 bg-gradient-to-br ${action.color} rounded-2xl blur-xl opacity-60 animate-pulse`} />
                    <div className={`relative w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl`}>
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-lg">{action.title}</div>
                    <div className="text-xs text-gray-700 font-bold">{action.desc}</div>
                  </div>
                </div>
              </GlassButton>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Activity & Performance */}
      <div className="grid lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 border-4 border-cyan-100/50">
          <h2 className="text-2xl font-black mb-6">Recent Executive Activity</h2>
          <div className="space-y-4">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-white/80 to-cyan-50/40 rounded-2xl border-4 border-cyan-100/50 hover:shadow-2xl hover:scale-102 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center ${
                    tx.type === 'mint' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                    tx.type === 'redeem' ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                    'bg-gradient-to-br from-blue-100 to-cyan-100'
                  }`}>
                    <div className={`absolute inset-0 rounded-2xl blur-lg opacity-70 ${
                      tx.type === 'mint' ? 'bg-green-500' :
                      tx.type === 'redeem' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="relative">
                      {tx.type === 'mint' ? <ArrowDownLeft className="w-8 h-8 text-green-600" /> :
                       tx.type === 'redeem' ? <ArrowUpRight className="w-8 h-8 text-orange-600" /> :
                       <Send className="w-8 h-8 text-blue-600" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-black capitalize text-xl">{tx.type}</div>
                    <div className="text-sm text-gray-700 font-bold">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-2xl">${tx.amount}</div>
                  <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm" className="shadow-xl">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-200/50">
          <h2 className="text-2xl font-black mb-6">Executive Metrics</h2>
          <div className="space-y-5">
            {[
              { label: 'Monthly Volume', value: '$125,450', percent: 95, color: 'from-blue-600 to-cyan-700' },
              { label: 'Governance Impact', value: '98%', percent: 98, color: 'from-purple-600 to-pink-700' },
              { label: 'Total Rewards Earned', value: '$12,450', percent: 92, color: 'from-green-600 to-emerald-700' }
            ].map((metric, i) => (
              <div key={i} className="p-5 bg-white/80 rounded-2xl border-2 border-purple-200/50 shadow-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-base font-black text-gray-800">{metric.label}</span>
                  <span className="text-2xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent">{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div className={`bg-gradient-to-r ${metric.color} h-3 rounded-full shadow-lg`} style={{width: `${metric.percent}%`}} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Diamond Tier CTA */}
      <GlassCard className="p-12 relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 border-4 border-purple-300/60 shadow-3xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/50 to-pink-400/50 rounded-full blur-3xl animate-pulse" />
        <div className="relative text-center max-w-4xl mx-auto">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl blur-2xl opacity-70 animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-3xl ring-4 ring-purple-200/70">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-purple-800 via-pink-800 to-purple-900 bg-clip-text text-transparent">
            Unlock Diamond Tier
          </h3>
          <p className="text-gray-900 mb-10 text-xl font-bold leading-relaxed">
            Experience the ultimate tier with exclusive voting privileges, executive team access,<br />revenue sharing, and daily premium rewards
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/app/dao">
              <GlassButton variant="primary" size="lg" className="shadow-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:shadow-4xl px-10 py-5 text-xl border-4 border-white/30">
                <Sparkles className="w-6 h-6 animate-pulse" />
                Discover Diamond Benefits
                <ArrowRight className="w-6 h-6" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
