import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getChainConfig } from '@/lib/wagmi';

interface ActivityItem {
  id: string;
  type: 'transfer' | 'redeem' | 'mint' | 'bridge';
  status: 'pending' | 'completed' | 'failed';
  amount: string;
  token: string;
  from?: string;
  to?: string;
  timestamp: Date;
  txHash?: string;
}

const RecentActivity: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  // Mock activity data (in production, fetch from API or blockchain)
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'transfer',
      status: 'completed',
      amount: '500.00',
      token: 'C12USD',
      to: '0x742d...8f4e',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      txHash: '0xabc123...',
    },
    {
      id: '2',
      type: 'mint',
      status: 'completed',
      amount: '1000.00',
      token: 'C12USD',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      txHash: '0xdef456...',
    },
    {
      id: '3',
      type: 'redeem',
      status: 'pending',
      amount: '250.00',
      token: 'C12USD',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      txHash: '0xghi789...',
    },
    {
      id: '4',
      type: 'bridge',
      status: 'completed',
      amount: '750.00',
      token: 'C12USD',
      from: 'BSC',
      to: 'Polygon',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      txHash: '0xjkl012...',
    },
  ];

  const getActivityIcon = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    if (status === 'pending') {
      return <Clock className="w-4 h-4 text-warning-400" />;
    }
    if (status === 'failed') {
      return <AlertCircle className="w-4 h-4 text-danger-400" />;
    }

    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-primary-400" />;
      case 'mint':
        return <ArrowDownLeft className="w-4 h-4 text-success-400" />;
      case 'redeem':
        return <ArrowUpRight className="w-4 h-4 text-purple-400" />;
      case 'bridge':
        return <RefreshCw className="w-4 h-4 text-blue-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityLabel = (activity: ActivityItem): string => {
    switch (activity.type) {
      case 'transfer':
        return `Sent to ${activity.to}`;
      case 'mint':
        return 'Minted C12USD';
      case 'redeem':
        return 'Redeemed to USD';
      case 'bridge':
        return `Bridged ${activity.from} → ${activity.to}`;
      default:
        return 'Unknown activity';
    }
  };

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center space-x-1 text-xs text-success-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center space-x-1 text-xs text-warning-400">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center space-x-1 text-xs text-danger-400">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
    }
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getExplorerUrl = (txHash: string): string => {
    const explorers: Record<number, string> = {
      56: 'https://bscscan.com/tx/',
      137: 'https://polygonscan.com/tx/',
      1: 'https://etherscan.io/tx/',
    };
    return `${explorers[chainId] || ''}${txHash}`;
  };

  if (!address) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <span>Recent Activity</span>
          </h3>
        </div>
        <div className="card-body text-center py-8">
          <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-400" />
          <span>Recent Activity</span>
        </h3>
        <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
          View All
        </button>
      </div>

      <div className="card-body">
        {mockActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${activity.status === 'completed' ? 'bg-gray-800' : ''}
                    ${activity.status === 'pending' ? 'bg-warning-900 bg-opacity-20' : ''}
                    ${activity.status === 'failed' ? 'bg-danger-900 bg-opacity-20' : ''}
                  `}>
                    {getActivityIcon(activity.type, activity.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white truncate">
                        {getActivityLabel(activity)}
                      </span>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{getTimeAgo(activity.timestamp)}</span>
                      {activity.txHash && chainConfig && (
                        <>
                          <span>•</span>
                          <a
                            href={getExplorerUrl(activity.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 hover:text-primary-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="font-mono">
                              {activity.txHash.slice(0, 6)}...{activity.txHash.slice(-4)}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-3">
                  <div className={`text-sm font-semibold ${
                    activity.type === 'transfer' || activity.type === 'redeem'
                      ? 'text-danger-400'
                      : 'text-success-400'
                  }`}>
                    {activity.type === 'transfer' || activity.type === 'redeem' ? '-' : '+'}
                    {activity.amount}
                  </div>
                  <div className="text-xs text-gray-400">{activity.token}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View on blockchain link */}
      {mockActivities.length > 0 && chainConfig && (
        <div className="card-footer">
          <a
            href={`${chainConfig.explorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center justify-center space-x-1 transition-colors"
          >
            <span>View all transactions on {chainConfig.name}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
