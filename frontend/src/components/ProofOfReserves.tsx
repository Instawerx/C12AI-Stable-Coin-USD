import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, TrendingUp, AlertCircle, RefreshCw, BarChart3, ExternalLink } from 'lucide-react';
import { ApiService, handleApiError } from '@/lib/api';

interface ProofOfReservesProps {
  detailed?: boolean;
}

const ProofOfReserves: React.FC<ProofOfReservesProps> = ({ detailed = false }) => {
  const { data: porData, isLoading, error, refetch } = useQuery({
    queryKey: ['por-latest'],
    queryFn: ApiService.getLatestPoR,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: porHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['por-history'],
    queryFn: () => ApiService.getPoRHistory(detailed ? 10 : 5),
    enabled: detailed,
  });

  const snapshot = porData?.snapshot;

  const getReserveRatioColor = (ratio: number) => {
    if (ratio >= 100) return 'text-success-400';
    if (ratio >= 90) return 'text-warning-400';
    return 'text-danger-400';
  };

  const getReserveRatioBackground = (ratio: number) => {
    if (ratio >= 100) return 'from-success-500 to-success-600';
    if (ratio >= 90) return 'from-warning-500 to-warning-600';
    return 'from-danger-500 to-danger-600';
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Proof of Reserves</span>
          </h3>
        </div>
        <div className="card-body">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-700 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Proof of Reserves</span>
          </h3>
        </div>
        <div className="card-body text-center py-8">
          <AlertCircle className="w-8 h-8 text-danger-400 mx-auto mb-3" />
          <h4 className="text-danger-400 font-medium mb-2">Unable to Load PoR Data</h4>
          <p className="text-gray-400 text-sm mb-4">
            {error ? handleApiError(error) : 'No PoR data available'}
          </p>
          <button
            onClick={() => refetch()}
            className="btn btn-outline btn-sm flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const reserveRatio = snapshot.reserveRatio;
  const lastUpdate = new Date(snapshot.createdAt);

  return (
    <div className="space-y-6">
      {/* Main PoR Card */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Proof of Reserves</span>
          </h3>
          <button
            onClick={() => refetch()}
            className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="card-body space-y-4">
          {/* Reserve Ratio Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold ${getReserveRatioColor(reserveRatio)}`}>
              {reserveRatio.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Reserve Ratio
            </p>
          </div>

          {/* Reserve Ratio Bar */}
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`bg-gradient-to-r ${getReserveRatioBackground(reserveRatio)} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(reserveRatio, 100)}%` }}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-center">
              <div className="w-px h-3 bg-gray-600" style={{ marginLeft: '100%', transform: 'translateX(-1px)' }} />
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                ${snapshot.totalReserves.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Reserves</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                ${snapshot.circulatingSupply.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Circulating</p>
            </div>
          </div>

          {/* Status and Last Update */}
          <div className="text-center pt-2 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className={`status-dot ${snapshot.status === 'PUBLISHED' ? 'status-online' : 'status-warning'}`} />
              <span className="text-sm text-gray-400 capitalize">
                {snapshot.status.toLowerCase()}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleDateString()} {lastUpdate.toLocaleTimeString()}
            </p>
            {snapshot.txHash && (
              <a
                href={`#`} // Would link to appropriate explorer
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center justify-center space-x-1 mt-1"
              >
                <span>View on blockchain</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Detailed View */}
      {detailed && (
        <>
          {/* Reserve Breakdown */}
          {snapshot.reserves?.breakdown && (
            <div className="card">
              <div className="card-header">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-primary-400" />
                  <span>Reserve Breakdown</span>
                </h4>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {snapshot.reserves.breakdown.map((reserve: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white capitalize">
                          {reserve.account.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-400">{reserve.percentage}% of total</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary-400">
                          ${reserve.amount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historical Data */}
          {porHistory && !historyLoading && (
            <div className="card">
              <div className="card-header">
                <h4 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <span>Recent History</span>
                </h4>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {porHistory.snapshots.slice(0, 5).map((item: any) => {
                    const date = new Date(item.createdAt);
                    return (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {date.toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {date.toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getReserveRatioColor(item.reserveRatio)}`}>
                            {item.reserveRatio.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            ${item.totalReserves.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProofOfReserves;