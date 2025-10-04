'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../../shared/components/ui/GlassCard';
import { GlassButton } from '../../../shared/components/ui/GlassButton';
import { Badge } from '../../../shared/components/ui/Badge';
import { rateLimitManager } from '../../lib/financial/rateLimitManager';
import { db } from '../../../shared/auth/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { AlertCircle, Activity, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface APICall {
  id: string;
  endpoint: string;
  cost: number;
  timestamp: any;
  totalUsage: number;
  remainingCalls: number;
}

interface APIUsageMonitorProps {
  userRoles?: string[];
  userId?: string;
}

export const APIUsageMonitor: React.FC<APIUsageMonitorProps> = ({ userRoles = [], userId }) => {
  const [stats, setStats] = useState(rateLimitManager.getUsageStats());
  const [recentCalls, setRecentCalls] = useState<APICall[]>([]);
  const [newLimit, setNewLimit] = useState(stats.limit);
  const [updating, setUpdating] = useState(false);

  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  // Update stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedStats = rateLimitManager.getUsageStats();
      setStats(updatedStats);
      setNewLimit(updatedStats.limit);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen to recent API calls
  useEffect(() => {
    const q = query(collection(db, 'apiUsage'), orderBy('timestamp', 'desc'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const calls = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as APICall[];
      setRecentCalls(calls);
    });

    return () => unsubscribe();
  }, []);

  const handleLimitChange = async () => {
    if (!isSuperAdmin) {
      toast.error('Only SUPER_ADMIN can change API limits');
      return;
    }

    if (newLimit < 25 || newLimit > 500) {
      toast.error('Limit must be between 25 and 500');
      return;
    }

    setUpdating(true);
    try {
      await rateLimitManager.updateAdminLimit(newLimit, userId || 'unknown');
      toast.success(`API limit updated to ${newLimit} calls/day`);
      setStats(rateLimitManager.getUsageStats());
    } catch (error) {
      toast.error('Failed to update API limit');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleOverrideToggle = async () => {
    if (!isSuperAdmin) {
      toast.error('Only SUPER_ADMIN can toggle override');
      return;
    }

    try {
      await rateLimitManager.toggleAdminOverride(!stats.adminOverride, userId || 'unknown');
      toast.success(`API override ${!stats.adminOverride ? 'enabled' : 'disabled'}`);
      setStats(rateLimitManager.getUsageStats());
    } catch (error) {
      toast.error('Failed to toggle override');
      console.error(error);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="w-6 h-6" />
          API Usage Monitor
        </h3>
        <Badge variant={stats.percentUsed > 80 ? 'error' : 'success'}>Alpha Vantage</Badge>
      </div>

      {/* Usage Progress */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-400">Daily Usage</span>
          <span className="text-sm font-mono text-white">
            {stats.used} / {stats.limit} calls
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stats.percentUsed > 80
                ? 'bg-red-500'
                : stats.percentUsed > 50
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(stats.percentUsed, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-400">
            Resets at {stats.resetTime.toLocaleTimeString()}
          </p>
          {stats.adminOverride && (
            <Badge variant="warning" className="text-xs">
              Override Active
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{stats.remaining}</p>
          <p className="text-xs text-gray-400">Remaining</p>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
          <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-400">{stats.used}</p>
          <p className="text-xs text-gray-400">Used Today</p>
        </div>
        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
          <AlertCircle className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-400">{stats.percentUsed.toFixed(0)}%</p>
          <p className="text-xs text-gray-400">Utilized</p>
        </div>
      </div>

      {/* Limit Adjustment (SUPER_ADMIN only) */}
      {isSuperAdmin && (
        <div className="border-t border-gray-700 pt-6 mb-6">
          <label className="block text-sm font-medium text-white mb-2">Adjust Daily Limit</label>
          <div className="flex gap-3">
            <input
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(Number(e.target.value))}
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="25"
              max="500"
            />
            <GlassButton onClick={handleLimitChange} disabled={updating}>
              {updating ? 'Updating...' : 'Update'}
            </GlassButton>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ⚠️ Changes affect all users immediately (Range: 25-500)
          </p>

          {/* Override Toggle */}
          <div className="mt-4">
            <GlassButton
              variant={stats.adminOverride ? 'danger' : 'primary'}
              onClick={handleOverrideToggle}
              className="w-full"
            >
              {stats.adminOverride ? 'Disable Override' : 'Enable Override'}
            </GlassButton>
            <p className="text-xs text-gray-400 mt-2">
              Override bypasses rate limits for all API calls
            </p>
          </div>
        </div>
      )}

      {/* Recent Usage Log */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent API Calls
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentCalls.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No recent calls</p>
          ) : (
            recentCalls.map((call) => (
              <div
                key={call.id}
                className="flex justify-between items-center text-sm py-2 px-3 bg-gray-800/30 rounded border border-gray-700/50"
              >
                <div>
                  <span className="font-mono text-blue-400">{call.endpoint}</span>
                  <span className="text-gray-500 ml-2 text-xs">
                    {call.timestamp?.toDate
                      ? call.timestamp.toDate().toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400">Cost: {call.cost}</span>
                  <br />
                  <span className="text-xs text-gray-500">{call.remainingCalls} left</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
};
