import React from 'react';
import { useAccount, useChainId, useReadContract } from 'wagmi';
import { Wallet, RefreshCw, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { getContractAddress, getContractABI, ContractHelpers } from '@/lib/contracts';

const TokenBalance: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const tokenAddress = getContractAddress(chainId, 'token');

  // Read token balance
  const { data: balance, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    },
  });

  // Read token info
  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'symbol',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: totalSupply } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'totalSupply',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: pilotMaxSupply } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'PILOT_MAX_SUPPLY',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const { data: remainingSupply } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: getContractABI('token'),
    functionName: 'remainingPilotSupply',
    query: {
      enabled: !!tokenAddress,
    },
  });

  const formattedBalance = balance ? ContractHelpers.formatTokenAmount(balance as bigint) : '0';
  const formattedTotalSupply = totalSupply ? ContractHelpers.formatTokenAmount(totalSupply as bigint) : '0';
  const formattedMaxSupply = pilotMaxSupply ? ContractHelpers.formatTokenAmount(pilotMaxSupply as bigint) : '0';
  const formattedRemainingSupply = remainingSupply ? ContractHelpers.formatTokenAmount(remainingSupply as bigint) : '0';

  const supplyPercentage = totalSupply && pilotMaxSupply
    ? Number((totalSupply as bigint) * 100n / (pilotMaxSupply as bigint))
    : 0;

  if (!address) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <Wallet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view token balance</p>
        </div>
      </div>
    );
  }

  if (!tokenAddress) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <AlertCircle className="w-12 h-12 text-warning-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Contract Not Deployed</h3>
          <p className="text-gray-400">C12USD token contract is not deployed on this network.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary-400" />
          <h2 className="text-xl font-bold text-white">Token Balance</h2>
        </div>
        <button
          onClick={() => refetchBalance()}
          className="p-2 text-gray-400 hover:text-primary-400 transition-colors"
          disabled={balanceLoading}
        >
          <RefreshCw className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="card-body space-y-6">
        {/* Main Balance Display */}
        <div className="text-center">
          {balanceLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-24 mx-auto"></div>
            </div>
          ) : balanceError ? (
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-danger-400 mx-auto mb-2" />
              <p className="text-danger-400 text-sm">Failed to load balance</p>
            </div>
          ) : (
            <>
              <div className="balance-display text-3xl sm:text-4xl balance-pulse">
                {formattedBalance}
              </div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                {(symbol as string) || 'C12USD'} Balance
              </p>
            </>
          )}
        </div>

        {/* Balance Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              ${formattedBalance}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">USD Value</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {Number(formattedBalance).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Tokens</p>
          </div>
        </div>

        {/* Pilot Supply Information */}
        <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Pilot Supply</span>
            <span className="text-xs text-primary-400 font-medium">
              {supplyPercentage.toFixed(1)}% Used
            </span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(supplyPercentage, 100)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold text-white">{formattedTotalSupply}</div>
              <div className="text-gray-400">Minted</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">{formattedRemainingSupply}</div>
              <div className="text-gray-400">Remaining</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">{formattedMaxSupply}</div>
              <div className="text-gray-400">Max Supply</div>
            </div>
          </div>
        </div>

        {/* Token Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Contract:</span>
            <span className="font-mono">{tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span>Symbol:</span>
            <span>{(symbol as string) || 'C12USD'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenBalance;