import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Filter,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { ApiService, handleApiError } from '@/lib/api';
import { ContractHelpers } from '@/lib/contracts';
import { getChainConfig } from '@/lib/wagmi';

interface Transaction {
  id: string;
  type: 'transfer' | 'mint' | 'redeem';
  hash?: string;
  amount: string;
  fromAddress?: string;
  toAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  chainId: number;
  gasUsed?: string;
  gasPrice?: string;
}

const TransactionHistoryEnhanced: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);

  const [filter, setFilter] = useState<'all' | 'transfer' | 'mint' | 'redeem'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Fetch transaction history
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transaction-history', address, chainId, filter],
    queryFn: async () => {
      if (!address) return null;
      try {
        const result = await ApiService.getRedemptionHistory(address);
        return result.redemptions.map(r => ({
          id: r.redemptionId,
          type: 'redeem' as const,
          hash: r.txHash,
          amount: r.usdAmount.toString(),
          status: r.status.toLowerCase() as 'pending' | 'confirmed' | 'failed',
          createdAt: r.createdAt,
          chainId: r.chainId
        }));
      } catch (error) {
        console.error('Failed to fetch transaction history:', error);
        return [];
      }
    },
    enabled: !!address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <RefreshCw className="w-4 h-4 text-warning-400 animate-spin" />;
    }

    switch (type) {
      case 'transfer':
        return <ArrowUpRight className="w-4 h-4 text-primary-400" />;
      case 'mint':
        return <ArrowDownLeft className="w-4 h-4 text-success-400" />;
      case 'redeem':
        return <DollarSign className="w-4 h-4 text-danger-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-success-400';
      case 'pending':
        return 'text-warning-400';
      case 'failed':
        return 'text-danger-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTransactionDescription = (tx: Transaction) => {
    const { type, fromAddress, toAddress, amount } = tx;
    const formattedAmount = parseFloat(amount).toLocaleString();

    switch (type) {
      case 'transfer':
        if (fromAddress?.toLowerCase() === address?.toLowerCase()) {
          return `Sent ${formattedAmount} C12USD to ${toAddress?.slice(0, 6)}...${toAddress?.slice(-4)}`;
        } else {
          return `Received ${formattedAmount} C12USD from ${fromAddress?.slice(0, 6)}...${fromAddress?.slice(-4)}`;
        }
      case 'mint':
        return `Minted ${formattedAmount} C12USD`;
      case 'redeem':
        return `Redeemed ${formattedAmount} C12USD to USD`;
      default:
        return `${formattedAmount} C12USD transaction`;
    }
  };

  const filteredTransactions = transactions?.filter((tx: Transaction) => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = searchTerm === '' ||
      tx.hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  }) || [];

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Export functions
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Hash', 'From', 'To'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.createdAt).toLocaleString(),
      tx.type,
      tx.amount,
      tx.status,
      tx.hash || '',
      'fromAddress' in tx ? tx.fromAddress || '' : '',
      'toAddress' in tx ? tx.toAddress || '' : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `c12usd-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!address) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Connect your wallet to view transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="card">
        <div className="card-header flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Transaction History</h2>
            <button
              onClick={() => refetch()}
              className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by hash or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm w-full
                          focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="transfer">Transfers</option>
              <option value="mint">Mints</option>
              <option value="redeem">Redemptions</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredTransactions.length === 0}
              className="btn btn-outline btn-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-danger-400 mx-auto mb-3" />
              <h4 className="text-danger-400 font-medium mb-2">Failed to Load History</h4>
              <p className="text-gray-400 text-sm mb-4">
                {handleApiError(error)}
              </p>
              <button
                onClick={() => refetch()}
                className="btn btn-outline btn-sm flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <h4 className="text-gray-400 font-medium mb-2">No Transactions Found</h4>
              <p className="text-gray-500 text-sm">
                {searchTerm || filter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your transactions will appear here once you start using C12USD'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTransactions.map((tx: Transaction) => {
                const txUrl = tx.hash && chainConfig ?
                  ContractHelpers.getTransactionUrl(chainId, tx.hash) : null;

                return (
                  <div
                    key={tx.id}
                    className="flex items-center space-x-4 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    {/* Transaction Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                        {getTransactionIcon(tx.type, tx.status)}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {getTransactionDescription(tx)}
                        </p>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
                          <span>{new Date(tx.createdAt).toLocaleTimeString()}</span>
                          {tx.hash && (
                            <span className="font-mono">
                              {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                            </span>
                          )}
                        </div>

                        {txUrl && (
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 text-xs flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !isLoading && !error && filteredTransactions.length > 0 && (
          <div className="card-footer flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        currentPage === pageNumber
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="card-header flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="card-body space-y-4">
              {/* Transaction Type & Status */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    {getTransactionIcon(selectedTx.type, selectedTx.status)}
                  </div>
                  <div>
                    <div className="font-medium text-white capitalize">{selectedTx.type}</div>
                    <div className={`text-sm ${getStatusColor(selectedTx.status)} capitalize`}>
                      {selectedTx.status}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {parseFloat(selectedTx.amount).toLocaleString()} C12USD
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Transaction Hash</span>
                  <div className="flex items-center space-x-2">
                    {selectedTx.hash ? (
                      <>
                        <span className="text-sm font-mono text-white">
                          {selectedTx.hash.slice(0, 10)}...{selectedTx.hash.slice(-8)}
                        </span>
                        <button
                          onClick={() => copyTransactionHash(selectedTx.hash!)}
                          className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
                        >
                          {copiedHash ? (
                            <CheckCircle2 className="w-4 h-4 text-success-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">N/A</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Date & Time</span>
                  <span className="text-sm text-white">
                    {new Date(selectedTx.createdAt).toLocaleString()}
                  </span>
                </div>

                {selectedTx.fromAddress && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm text-gray-400">From</span>
                    <span className="text-sm font-mono text-white">
                      {selectedTx.fromAddress.slice(0, 10)}...{selectedTx.fromAddress.slice(-8)}
                    </span>
                  </div>
                )}

                {selectedTx.toAddress && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm text-gray-400">To</span>
                    <span className="text-sm font-mono text-white">
                      {selectedTx.toAddress.slice(0, 10)}...{selectedTx.toAddress.slice(-8)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Network</span>
                  <span className="text-sm text-white">
                    {chainConfig?.name || `Chain ID: ${selectedTx.chainId}`}
                  </span>
                </div>

                {selectedTx.gasUsed && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm text-gray-400">Gas Used</span>
                    <span className="text-sm text-white">{selectedTx.gasUsed}</span>
                  </div>
                )}

                {selectedTx.gasPrice && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-400">Gas Price</span>
                    <span className="text-sm text-white">{selectedTx.gasPrice} Gwei</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedTx.hash && chainConfig && (
                <div className="pt-4">
                  <a
                    href={ContractHelpers.getTransactionUrl(chainId, selectedTx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <span>View on {chainConfig.name} Explorer</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistoryEnhanced;
