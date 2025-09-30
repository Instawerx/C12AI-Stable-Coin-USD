import React from 'react';
import { useAccount, useChainId, useReadContract, useBalance } from 'wagmi';
import { PieChart, TrendingUp, DollarSign, Wallet, Activity } from 'lucide-react';
import { getContractAddress, getContractABI, ContractHelpers } from '@/lib/contracts';
import { getChainConfig } from '@/lib/wagmi';

const PortfolioAnalytics: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const tokenAddress = getContractAddress(chainId, 'token');
  const chainConfig = getChainConfig(chainId);

  // Read C12USD balance
  const { data: c12usdBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  });

  // Read native token balance (BNB/MATIC/ETH)
  const { data: nativeBalance } = useBalance({
    address: address,
  });

  const c12usdAmount = c12usdBalance ? parseFloat(ContractHelpers.formatTokenAmount(c12usdBalance as bigint)) : 0;
  const nativeAmount = nativeBalance ? parseFloat(nativeBalance.formatted) : 0;

  // Mock prices for demonstration (in production, fetch from API)
  const nativePrices: Record<number, number> = {
    56: 600,   // BSC (BNB price)
    137: 0.85, // Polygon (MATIC price)
    1: 3500,   // Ethereum (ETH price)
  };

  const nativePrice = nativePrices[chainId] || 0;
  const nativeValue = nativeAmount * nativePrice;
  const c12usdValue = c12usdAmount; // 1:1 with USD

  const totalValue = nativeValue + c12usdValue;

  const c12usdPercentage = totalValue > 0 ? (c12usdValue / totalValue) * 100 : 0;
  const nativePercentage = totalValue > 0 ? (nativeValue / totalValue) * 100 : 0;

  // Mock P&L data (in production, calculate from transaction history)
  const mockPnLData = {
    totalPnL: 1250.50,
    pnlPercentage: 12.5,
    realizedPnL: 850.25,
    unrealizedPnL: 400.25,
  };

  if (!address) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-primary-400" />
            <span>Portfolio Analytics</span>
          </h3>
        </div>
        <div className="card-body text-center py-8">
          <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-primary-400" />
          <span>Portfolio Analytics</span>
        </h3>
      </div>

      <div className="card-body space-y-6">
        {/* Total Portfolio Value */}
        <div className="text-center pb-4 border-b border-gray-700">
          <div className="text-3xl font-bold text-white">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-gray-400 mt-1">Total Portfolio Value</p>
        </div>

        {/* P&L Summary */}
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Total P&L</span>
            <div className={`text-lg font-bold ${mockPnLData.totalPnL >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              {mockPnLData.totalPnL >= 0 ? '+' : ''}${mockPnLData.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Overall Return</span>
            <div className={`flex items-center space-x-1 text-sm font-medium ${mockPnLData.pnlPercentage >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
              <TrendingUp className={`w-4 h-4 ${mockPnLData.pnlPercentage < 0 ? 'rotate-180' : ''}`} />
              <span>{mockPnLData.pnlPercentage >= 0 ? '+' : ''}{mockPnLData.pnlPercentage.toFixed(2)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <div className="text-xs text-gray-400 mb-1">Realized P&L</div>
              <div className="text-sm font-semibold text-white">
                ${mockPnLData.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Unrealized P&L</div>
              <div className="text-sm font-semibold text-white">
                ${mockPnLData.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Asset Allocation</h4>

          {/* C12USD */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-white">C12USD</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  ${c12usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400">{c12usdPercentage.toFixed(1)}%</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${c12usdPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Native Token */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-white">{chainConfig?.currency || 'Native'}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  ${nativeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400">{nativePercentage.toFixed(1)}%</div>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${nativePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Holdings Details */}
        <div className="pt-4 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Holdings</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">C12USD</div>
                  <div className="text-xs text-gray-400">Stablecoin</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {c12usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-400">
                  ${c12usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {chainConfig?.currency || 'Native'}
                  </div>
                  <div className="text-xs text-gray-400">{chainConfig?.name || 'Network'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {nativeAmount.toFixed(4)}
                </div>
                <div className="text-xs text-gray-400">
                  ${nativeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;
