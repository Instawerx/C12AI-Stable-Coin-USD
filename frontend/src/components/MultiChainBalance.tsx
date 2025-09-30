import React, { useState } from 'react';
import { useAccount, useReadContract, useBalance } from 'wagmi';
import { Wallet, RefreshCw, ChevronDown, ChevronUp, Layers, TrendingUp } from 'lucide-react';
import { getContractABI, ContractHelpers } from '@/lib/contracts';

interface ChainBalance {
  chainId: number;
  chainName: string;
  symbol: string;
  tokenAddress: `0x${string}` | null;
  c12usdBalance: string;
  nativeBalance: string;
  totalValueUsd: number;
}

const MultiChainBalance: React.FC = () => {
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);

  // Chain configurations
  const chains = [
    {
      chainId: 56,
      chainName: 'BNB Smart Chain',
      symbol: 'BNB',
      tokenAddress: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS as `0x${string}` | null,
      nativePrice: 600,
    },
    {
      chainId: 137,
      chainName: 'Polygon',
      symbol: 'MATIC',
      tokenAddress: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS as `0x${string}` | null,
      nativePrice: 0.85,
    },
    {
      chainId: 1,
      chainName: 'Ethereum',
      symbol: 'ETH',
      tokenAddress: process.env.NEXT_PUBLIC_ETHEREUM_TOKEN_ADDRESS as `0x${string}` | null,
      nativePrice: 3500,
    },
  ];

  // Fetch balances for each chain
  const chainBalances: ChainBalance[] = chains.map((chain) => {
    // C12USD balance
    const { data: c12usdBalance } = useReadContract({
      chainId: chain.chainId,
      address: chain.tokenAddress!,
      abi: getContractABI('token'),
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !!chain.tokenAddress,
      },
    });

    // Native token balance
    const { data: nativeBalance } = useBalance({
      chainId: chain.chainId,
      address: address,
    });

    const c12usdAmount = c12usdBalance
      ? parseFloat(ContractHelpers.formatTokenAmount(c12usdBalance as bigint))
      : 0;

    const nativeAmount = nativeBalance ? parseFloat(nativeBalance.formatted) : 0;
    const nativeValue = nativeAmount * chain.nativePrice;
    const totalValueUsd = c12usdAmount + nativeValue;

    return {
      chainId: chain.chainId,
      chainName: chain.chainName,
      symbol: chain.symbol,
      tokenAddress: chain.tokenAddress,
      c12usdBalance: c12usdAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      nativeBalance: nativeAmount.toFixed(4),
      totalValueUsd,
    };
  });

  const totalBalanceAllChains = chainBalances.reduce(
    (sum, chain) => sum + chain.totalValueUsd,
    0
  );

  const refetchAll = () => {
    // In production, trigger refetch for all chain balances
    window.location.reload();
  };

  if (!address) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-primary-400" />
            <span>Multi-Chain Balance</span>
          </h3>
        </div>
        <div className="card-body text-center py-8">
          <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view multi-chain balances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-primary-400" />
          <span>Multi-Chain Balance</span>
        </h3>
        <button
          onClick={refetchAll}
          className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="card-body space-y-4">
        {/* Total Balance Across All Chains */}
        <div className="text-center pb-4 border-b border-gray-700">
          <div className="text-3xl font-bold text-white">
            ${totalBalanceAllChains.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-sm text-gray-400 mt-1">Total Balance (All Chains)</p>
        </div>

        {/* Chain Breakdown */}
        <div className="space-y-3">
          {chainBalances.map((chain, index) => (
            <div
              key={chain.chainId}
              className={`
                p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-all
                ${index === 0 && !isExpanded ? 'block' : index > 0 && !isExpanded ? 'hidden' : 'block'}
              `}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {chain.symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{chain.chainName}</div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <span>{chain.c12usdBalance} C12USD</span>
                      <span>•</span>
                      <span>
                        {chain.nativeBalance} {chain.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-white">
                    ${chain.totalValueUsd.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-gray-400">
                    {totalBalanceAllChains > 0
                      ? ((chain.totalValueUsd / totalBalanceAllChains) * 100).toFixed(1)
                      : 0}
                    % of total
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        totalBalanceAllChains > 0
                          ? (chain.totalValueUsd / totalBalanceAllChains) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-gray-400 hover:text-primary-400 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Show All Chains ({chains.length})</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {chainBalances.filter((c) => c.totalValueUsd > 0).length}
            </div>
            <p className="text-xs text-gray-400">Active Chains</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{chains.length}</div>
            <p className="text-xs text-gray-400">Supported Chains</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiChainBalance;
