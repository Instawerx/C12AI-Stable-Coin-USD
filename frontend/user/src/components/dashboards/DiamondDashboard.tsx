'use client';

import React from 'react';
import { Diamond, TrendingUp, DollarSign, Sparkles, ShoppingCart, Send, Download, ArrowUpRight, ArrowDownLeft, Zap, Gift, BarChart3, Shield, Users, Star, Award, Crown, Flame } from 'lucide-react';
import Link from 'next/link';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { Badge } from '../ui/Badge';
import { TokenIcon } from '../ui/TokenIcon';

interface DiamondDashboardProps {
  user: any;
  stats: any;
  recentTransactions: any[];
}

export const DiamondDashboard: React.FC<DiamondDashboardProps> = ({ user, stats, recentTransactions }) => {
  return (
    <div className="space-y-8">
      {/* Diamond Tier Header - Ultimate Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 p-16 border-4 border-purple-400/80 shadow-[0_0_80px_rgba(168,85,247,0.4)]">
        {/* Animated glowing orbs - more intense */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/50 rounded-full blur-3xl animation-delay-1000 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/40 rounded-full blur-3xl animate-pulse animation-delay-500" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-pink-300/30 rounded-full blur-2xl animate-pulse animation-delay-750" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="relative">
              {/* Ultra intense multi-layer glow */}
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-3xl blur-3xl opacity-90 animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-3xl blur-2xl opacity-80 animation-delay-300 animate-pulse" />
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 rounded-2xl blur-xl opacity-70 animation-delay-600 animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.8)] ring-4 ring-pink-200 animate-pulse">
                <Diamond className="w-16 h-16 text-white drop-shadow-2xl" />
              </div>
              {/* Sparkle effects */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-5 mb-3">
                <h1 className="text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                  Diamond Member
                </h1>
                <Badge variant="primary" size="lg" className="shadow-[0_0_30px_rgba(168,85,247,0.6)] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white border-0 px-8 py-4 text-xl animate-pulse">
                  TIER 5 - ELITE
                </Badge>
              </div>
              <p className="text-gray-900 mt-3 font-black text-2xl">Ultimate tier with exclusive network expansion rights</p>
              <div className="flex items-center gap-4 mt-6">
                {[
                  { icon: Crown, text: 'Executive Team', color: 'from-yellow-500 to-amber-600' },
                  { icon: Flame, text: 'Daily Rewards', color: 'from-orange-500 to-red-600' },
                  { icon: Zap, text: 'Revenue Share', color: 'from-green-500 to-emerald-600' },
                  { icon: Diamond, text: 'VIP Network', color: 'from-purple-500 to-pink-600' }
                ].map((item, i) => (
                  <div key={i} className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-all`} />
                    <div className="relative flex items-center gap-3 bg-white/90 px-6 py-4 rounded-xl shadow-2xl hover:scale-110 transition-transform border-2 border-white/50">
                      <item.icon className="w-6 h-6 text-purple-600" />
                      <span className="text-sm font-black text-gray-900">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right bg-gradient-to-br from-white/95 to-purple-50/95 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_60px_rgba(168,85,247,0.5)] border-4 border-purple-300/80">
            <div className="text-lg text-gray-900 font-black mb-3 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Your Voting Power
            </div>
            <div className="text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 bg-clip-text text-transparent animate-pulse">10x</div>
            <div className="text-lg text-green-600 font-black mt-3 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6" />
              +900% Boost
            </div>
            <div className="mt-4 pt-4 border-t-2 border-purple-200">
              <div className="text-sm text-gray-700 font-bold">Elite Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ultimate Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-8 relative overflow-hidden group hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:scale-110 transition-all duration-300 border-4 border-purple-200/60">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-purple-600 to-pink-700 opacity-20 rounded-full blur-3xl group-hover:opacity-30 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-400/15 rounded-full blur-3xl animate-pulse animation-delay-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl blur-2xl opacity-70 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] ring-4 ring-white/70">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-sm font-black px-4 py-2 rounded-xl shadow-lg bg-green-100 text-green-800 border-2 border-green-300">+35.7%</div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">${stats.totalBalance}</div>
            <div className="text-sm text-gray-800 font-black">Total Portfolio</div>
            <div className="text-xs text-purple-600 font-bold mt-2 flex items-center gap-1"><Star className="w-3 h-3" />Record high</div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 relative overflow-hidden group hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:scale-110 transition-all duration-300 border-4 border-purple-200/60">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-blue-600 to-cyan-700 opacity-20 rounded-full blur-3xl group-hover:opacity-30 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-400/15 rounded-full blur-3xl animate-pulse animation-delay-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-3xl blur-2xl opacity-70 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] ring-4 ring-white/70">
                  <TokenIcon type="C12USD" size={40} />
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">${stats.c12usdBalance}</div>
            <div className="text-sm text-gray-800 font-black">C12USD Balance</div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 relative overflow-hidden group hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:scale-110 transition-all duration-300 border-4 border-purple-200/60">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-pink-600 to-purple-700 opacity-20 rounded-full blur-3xl group-hover:opacity-30 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-400/15 rounded-full blur-3xl animate-pulse animation-delay-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-pink-600 to-purple-700 rounded-3xl blur-2xl opacity-70 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-br from-pink-600 to-purple-700 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-pink-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] ring-4 ring-white/70">
                  <TokenIcon type="C12DAO" size={40} />
                </div>
              </div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">25,000</div>
            <div className="text-sm text-gray-800 font-black">C12DAO Tokens</div>
            <div className="mt-3"><Badge variant="primary" size="sm" className="shadow-xl bg-gradient-to-r from-purple-500 to-pink-600 border-0">Diamond Tier</Badge></div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 relative overflow-hidden group hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:scale-110 transition-all duration-300 border-4 border-purple-200/60">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-gradient-to-br from-orange-500 to-red-600 opacity-20 rounded-full blur-3xl group-hover:opacity-30 group-hover:scale-150 transition-all animate-pulse" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-400/15 rounded-full blur-3xl animate-pulse animation-delay-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur-2xl opacity-70 animate-pulse" />
                <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-lg opacity-60" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.6)] ring-4 ring-white/70">
                  <Flame className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-sm font-black px-4 py-2 rounded-xl shadow-lg bg-purple-100 text-purple-800 border-2 border-purple-300">Tomorrow at 12:00</div>
            </div>
            <div className="text-4xl font-black text-gray-900 mb-2">$1,875</div>
            <div className="text-sm text-gray-800 font-black">Daily Rewards</div>
          </div>
        </GlassCard>
      </div>


      {/* Diamond Elite Benefits */}
      <GlassCard className="p-12 bg-gradient-to-br from-purple-50/90 to-pink-50/90 border-4 border-purple-300/70 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl blur-xl opacity-70 animate-pulse" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-purple-200">
              <Diamond className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 bg-clip-text text-transparent">
            Diamond Elite Privileges
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Crown, title: 'Executive Team Access', desc: 'Direct communication with leadership', color: 'from-yellow-500 to-amber-600' },
            { icon: Shield, title: 'Exclusive Voting Rights', desc: '10x voting power on critical proposals', color: 'from-blue-600 to-cyan-700' },
            { icon: Zap, title: 'Revenue Sharing', desc: 'Participate in protocol revenue', color: 'from-green-600 to-emerald-700' },
            { icon: Flame, title: 'Daily Premium Rewards', desc: 'Highest tier automated payouts', color: 'from-orange-500 to-red-600' },
            { icon: Users, title: 'Network Expansion', desc: 'Rights to expand to new networks', color: 'from-purple-600 to-pink-700' },
            { icon: Star, title: 'White Glove Service', desc: 'Dedicated account manager', color: 'from-indigo-600 to-purple-700' },
            { icon: Award, title: 'Strategic Partnerships', desc: 'Co-investment opportunities', color: 'from-pink-600 to-rose-700' },
            { icon: Diamond, title: 'Lifetime Benefits', desc: 'Guaranteed tier benefits forever', color: 'from-purple-700 to-pink-800' }
          ].map((benefit, i) => (
            <div key={i} className="p-7 bg-white/95 rounded-2xl border-4 border-purple-200/70 hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-all group">
              <div className="relative mb-5">
                <div className={`absolute -inset-2 bg-gradient-to-br ${benefit.color} rounded-2xl blur-lg opacity-60 animate-pulse`} />
                <div className={`relative w-16 h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ring-4 ring-white/60`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="font-black text-gray-900 mb-3 text-xl">{benefit.title}</div>
              <div className="text-sm text-gray-800 font-semibold leading-relaxed">{benefit.desc}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Ultimate Executive Actions */}
      <GlassCard className="p-12 border-4 border-purple-200/60">
        <h2 className="text-4xl font-black mb-10 flex items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl blur-xl opacity-70 animate-pulse" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          Diamond Executive Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { href: '/app/transactions?type=mint', icon: ShoppingCart, title: 'Buy Tokens', desc: 'White glove service', color: 'from-green-600 to-emerald-700' },
            { href: '/app/wallet', icon: Send, title: 'Transfer', desc: 'Instant priority routing', color: 'from-blue-600 to-cyan-700' },
            { href: '/app/history', icon: BarChart3, title: 'Analytics', desc: 'AI-powered insights', color: 'from-purple-600 to-pink-700' },
            { href: '#', icon: Download, title: 'Export', desc: 'Real-time API access', color: 'from-gray-800 to-gray-900' }
          ].map((action, i) => (
            <Link key={i} href={action.href}>
              <GlassButton variant="secondary" className="w-full justify-start group hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-110 transition-all border-4 border-purple-100/60 h-32 p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className={`absolute -inset-3 bg-gradient-to-br ${action.color} rounded-3xl blur-2xl opacity-70 animate-pulse`} />
                    <div className={`relative w-18 h-18 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.5)] ring-4 ring-white/60`}>
                      <action.icon className="w-9 h-9 text-white" />
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xl mb-1">{action.title}</div>
                    <div className="text-sm text-gray-800 font-bold">{action.desc}</div>
                  </div>
                </div>
              </GlassButton>
            </Link>
          ))}
        </div>
      </GlassCard>

      {/* Activity & Performance */}
      <div className="grid lg:grid-cols-2 gap-8">
        <GlassCard className="p-10 border-4 border-purple-200/60">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <Diamond className="w-8 h-8 text-purple-600" />
            Diamond Activity
          </h2>
          <div className="space-y-5">
            {recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-white/90 to-purple-50/50 rounded-2xl border-4 border-purple-100/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-102 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`relative w-18 h-18 rounded-2xl flex items-center justify-center ${
                    tx.type === 'mint' ? 'bg-gradient-to-br from-green-100 to-emerald-100' :
                    tx.type === 'redeem' ? 'bg-gradient-to-br from-orange-100 to-amber-100' :
                    'bg-gradient-to-br from-blue-100 to-cyan-100'
                  }`}>
                    <div className={`absolute inset-0 rounded-2xl blur-xl opacity-80 ${
                      tx.type === 'mint' ? 'bg-green-500' :
                      tx.type === 'redeem' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="relative">
                      {tx.type === 'mint' ? <ArrowDownLeft className="w-9 h-9 text-green-700" /> :
                       tx.type === 'redeem' ? <ArrowUpRight className="w-9 h-9 text-orange-700" /> :
                       <Send className="w-9 h-9 text-blue-700" />}
                    </div>
                  </div>
                  <div>
                    <div className="font-black capitalize text-2xl">{tx.type}</div>
                    <div className="text-sm text-gray-800 font-bold mt-1">{tx.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-3xl">${tx.amount}</div>
                  <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm" className="shadow-2xl mt-2">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-10 bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-200/60">
          <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Elite Performance
          </h2>
          <div className="space-y-6">
            {[
              { label: 'Monthly Volume', value: '$625,850', percent: 98, color: 'from-blue-600 to-cyan-700', icon: TrendingUp },
              { label: 'Governance Dominance', value: '100%', percent: 100, color: 'from-purple-600 to-pink-700', icon: Crown },
              { label: 'Revenue Share Earned', value: '$75,450', percent: 96, color: 'from-green-600 to-emerald-700', icon: DollarSign },
              { label: 'Network Influence', value: '99.8%', percent: 99, color: 'from-orange-500 to-red-600', icon: Flame }
            ].map((metric, i) => (
              <div key={i} className="p-6 bg-white/90 rounded-2xl border-4 border-purple-200/60 shadow-xl hover:scale-102 transition-transform">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <metric.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-900">{metric.label}</span>
                  </div>
                  <span className={`text-3xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <div className={`bg-gradient-to-r ${metric.color} h-4 rounded-full shadow-xl transition-all duration-1000`} style={{width: `${metric.percent}%`}} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Diamond Exclusive Section */}
      <GlassCard className="p-16 relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 border-4 border-purple-400/80 shadow-[0_0_100px_rgba(168,85,247,0.5)]">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/50 rounded-full blur-3xl animate-pulse animation-delay-1000" />
        <div className="relative text-center max-w-5xl mx-auto">
          <div className="relative inline-block mb-10">
            <div className="absolute -inset-6 bg-gradient-to-br from-purple-600 to-pink-700 rounded-3xl blur-3xl opacity-80 animate-pulse" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-3xl flex items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.8)] ring-4 ring-purple-200">
              <Diamond className="w-14 h-14 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-6xl font-black mb-8 bg-gradient-to-r from-purple-900 via-pink-900 to-purple-900 bg-clip-text text-transparent">
            You've Reached the Summit
          </h3>
          <p className="text-gray-900 mb-12 text-2xl font-bold leading-relaxed max-w-3xl mx-auto">
            As a Diamond member, you have access to every feature, every benefit, and every opportunity<br/>
            within the C12 DAO ecosystem. Thank you for your elite support.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link href="/app/dao">
              <GlassButton variant="primary" size="lg" className="shadow-[0_0_60px_rgba(168,85,247,0.6)] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:shadow-[0_0_80px_rgba(168,85,247,0.8)] px-12 py-6 text-2xl border-4 border-white/40">
                <Crown className="w-7 h-7 animate-pulse" />
                Explore Your Kingdom
                <Sparkles className="w-7 h-7 animate-pulse" />
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
