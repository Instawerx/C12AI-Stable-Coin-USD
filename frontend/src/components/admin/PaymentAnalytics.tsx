import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { Badge } from '../../../shared/components/ui/Badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  totalVolume: number;
  totalTransactions: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  avgProcessingTime: number;
  conversionRate: number;
  topTokens: { name: string; count: number; volume: number }[];
  topPaymentMethods: { name: string; count: number }[];
  recentActivity: { date: string; approved: number; rejected: number }[];
}

export const PaymentAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // const functions = getFunctions();
        // const getAnalytics = httpsCallable(functions, 'manualPayments-getAnalytics');
        // const result = await getAnalytics({ timeRange });

        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 500));
        setAnalytics(getMockAnalytics());
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(getMockAnalytics());
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading || !analytics) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center gap-3 text-white">
          <Activity className="w-6 h-6 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Time Range:</span>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            ${analytics.totalVolume.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total Volume</div>
          <div className="mt-2 text-xs text-green-400">+12.5% vs last period</div>
        </GlassCard>

        {/* Total Transactions */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analytics.totalTransactions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Transactions</div>
          <div className="mt-2 text-xs text-green-400">+8.3% vs last period</div>
        </GlassCard>

        {/* Conversion Rate */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analytics.conversionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Approval Rate</div>
          <div className="mt-2 text-xs text-gray-400">
            {analytics.approvedCount} approved / {analytics.rejectedCount} rejected
          </div>
        </GlassCard>

        {/* Avg Processing Time */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <TrendingDown className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analytics.avgProcessingTime.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-400">Avg Processing Time</div>
          <div className="mt-2 text-xs text-green-400">-15% vs last period</div>
        </GlassCard>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-white">Top Tokens</h3>
          </div>
          <div className="space-y-4">
            {analytics.topTokens.map((token, index) => {
              const total = analytics.topTokens.reduce((sum, t) => sum + t.volume, 0);
              const percentage = (token.volume / total) * 100;

              return (
                <div key={token.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'primary' : 'secondary'}>{token.name}</Badge>
                      <span className="text-sm text-gray-400">{token.count} purchases</span>
                    </div>
                    <span className="text-white font-medium">${token.volume.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-purple-500'
                      } rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of volume</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Payment Methods */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-semibold text-white">Payment Methods</h3>
          </div>
          <div className="space-y-4">
            {analytics.topPaymentMethods.map((method, index) => {
              const total = analytics.topPaymentMethods.reduce((sum, m) => sum + m.count, 0);
              const percentage = (method.count / total) * 100;

              return (
                <div key={method.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{method.name}</span>
                    <span className="text-gray-400">{method.count} transactions</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        index === 0 ? 'bg-green-500' : 'bg-blue-500'
                      } rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% of transactions</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity Timeline */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {analytics.recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-gray-400 text-sm">{activity.date}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">{activity.approved}</span>
                  <span className="text-gray-500 text-sm">approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{activity.rejected}</span>
                  <span className="text-gray-500 text-sm">rejected</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-400">{analytics.pendingCount}</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Approved</div>
              <div className="text-2xl font-bold text-green-400">{analytics.approvedCount}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Rejected</div>
              <div className="text-2xl font-bold text-red-400">{analytics.rejectedCount}</div>
            </div>
            <XCircle className="w-8 h-8 text-red-400 opacity-50" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

// Mock analytics data
function getMockAnalytics(): AnalyticsData {
  return {
    totalVolume: 125000,
    totalTransactions: 342,
    pendingCount: 12,
    approvedCount: 298,
    rejectedCount: 32,
    avgProcessingTime: 2.3,
    conversionRate: 90.3,
    topTokens: [
      { name: 'C12USD', count: 245, volume: 98500 },
      { name: 'C12DAO', count: 97, volume: 26500 },
    ],
    topPaymentMethods: [
      { name: 'Cash App', count: 198 },
      { name: 'Stablecoin', count: 144 },
    ],
    recentActivity: [
      { date: 'Oct 3, 2025', approved: 15, rejected: 2 },
      { date: 'Oct 2, 2025', approved: 23, rejected: 3 },
      { date: 'Oct 1, 2025', approved: 18, rejected: 1 },
      { date: 'Sep 30, 2025', approved: 21, rejected: 4 },
      { date: 'Sep 29, 2025', approved: 19, rejected: 2 },
    ],
  };
}
