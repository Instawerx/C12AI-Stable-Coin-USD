'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Coins,
  Calendar,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { PRICING, type TokenType } from '../../lib/pricing';

interface AnalyticsData {
  totalPayments: number;
  totalVolume: number;
  completedPayments: number;
  completedVolume: number;
  pendingPayments: number;
  pendingVolume: number;
  rejectedPayments: number;
  averageAmount: number;
  averageVerificationTime: number; // hours
  conversionRate: number; // percentage
  dailyStats: Array<{
    date: string;
    count: number;
    volume: number;
    completed: number;
    rejected: number;
  }>;
  tokenBreakdown: {
    C12USD: { count: number; volume: number };
    C12DAO: { count: number; volume: number };
  };
  paymentMethodBreakdown: {
    CASH_APP: { count: number; volume: number };
    STABLECOIN: { count: number; volume: number };
  };
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const PaymentAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const functions = getFunctions();
      const getAnalytics = httpsCallable(functions, 'manualPayments-getAnalytics');

      const result = await getAnalytics({ timeRange }) as { data: AnalyticsData };
      setAnalytics(result.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard className="p-8">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-400 text-lg mb-2">Failed to load analytics</p>
          <p className="text-gray-400 text-sm mb-4">{error}</p>
          <GlassButton onClick={fetchAnalytics} variant="primary">
            Retry
          </GlassButton>
        </div>
      </GlassCard>
    );
  }

  if (!analytics) {
    return null;
  }

  const StatCard: React.FC<{
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }> = ({ icon: Icon, title, value, subtitle, trend, trendValue, color = 'blue' }) => (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
    </GlassCard>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Payment Analytics</h2>
          <p className="text-gray-400 mt-1">Performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <GlassButton
            onClick={fetchAnalytics}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </GlassButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          title="Total Volume"
          value={`$${analytics.totalVolume.toLocaleString()}`}
          subtitle={`${analytics.totalPayments} payments`}
          color="green"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={`$${analytics.completedVolume.toLocaleString()}`}
          subtitle={`${analytics.completedPayments} payments`}
          trend="up"
          trendValue={`${analytics.conversionRate.toFixed(1)}%`}
          color="green"
        />
        <StatCard
          icon={Clock}
          title="Pending Review"
          value={analytics.pendingPayments}
          subtitle={`$${analytics.pendingVolume.toLocaleString()} value`}
          color="yellow"
        />
        <StatCard
          icon={Users}
          title="Avg. Payment"
          value={`$${analytics.averageAmount.toFixed(0)}`}
          subtitle={`${analytics.averageVerificationTime.toFixed(1)}h avg time`}
          color="blue"
        />
      </div>

      {/* Token & Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-purple-400" />
            Token Breakdown
          </h3>
          <div className="space-y-4">
            {(Object.keys(analytics.tokenBreakdown) as TokenType[]).map((token) => {
              const data = analytics.tokenBreakdown[token];
              const percentage = analytics.totalPayments > 0
                ? (data.count / analytics.totalPayments) * 100
                : 0;

              return (
                <div key={token}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{PRICING[token].icon}</span>
                      <span className="text-white font-medium">{PRICING[token].name}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{data.count} payments</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-sm">{percentage.toFixed(1)}%</span>
                    <span className="text-white font-medium">${data.volume.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Payment Method Breakdown */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Payment Methods
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.paymentMethodBreakdown).map(([method, data]) => {
              const percentage = analytics.totalPayments > 0
                ? (data.count / analytics.totalPayments) * 100
                : 0;

              return (
                <div key={method}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {method === 'CASH_APP' ? '💵 Cash App' : '💰 Stablecoins'}
                    </span>
                    <span className="text-gray-400 text-sm">{data.count} payments</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        method === 'CASH_APP'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500 text-sm">{percentage.toFixed(1)}%</span>
                    <span className="text-white font-medium">${data.volume.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Daily Stats Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-400" />
          Daily Activity
        </h3>
        {analytics.dailyStats.length > 0 ? (
          <div className="space-y-3">
            {analytics.dailyStats.slice(-14).map((day) => {
              const maxVolume = Math.max(...analytics.dailyStats.map((d) => d.volume));
              const volumePercentage = maxVolume > 0 ? (day.volume / maxVolume) * 100 : 0;
              const successRate = day.count > 0 ? (day.completed / day.count) * 100 : 0;

              return (
                <div key={day.date} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-white">{day.count} payments</span>
                      <span className="text-green-400 font-medium">
                        ${day.volume.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-green-500 transition-all"
                        style={{ width: `${(volumePercentage * successRate) / 100}%` }}
                        title={`Completed: $${(day.volume * successRate / 100).toFixed(0)}`}
                      />
                      <div
                        className="bg-yellow-500 transition-all"
                        style={{ width: `${volumePercentage - (volumePercentage * successRate) / 100}%` }}
                        title="Pending/Rejected"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {day.completed} completed · {day.rejected} rejected
                    </span>
                    <span className={`font-medium ${
                      successRate >= 80 ? 'text-green-400' :
                      successRate >= 50 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {successRate.toFixed(0)}% success
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No activity data available for this period</p>
          </div>
        )}
      </GlassCard>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-white text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            {analytics.completedPayments} of {analytics.totalPayments} approved
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Processing Time</p>
              <p className="text-white text-2xl font-bold">
                {analytics.averageVerificationTime.toFixed(1)}h
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">From submission to completion</p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Rejection Rate</p>
              <p className="text-white text-2xl font-bold">
                {((analytics.rejectedPayments / analytics.totalPayments) * 100 || 0).toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-sm">{analytics.rejectedPayments} payments rejected</p>
        </GlassCard>
      </div>
    </div>
  );
};
