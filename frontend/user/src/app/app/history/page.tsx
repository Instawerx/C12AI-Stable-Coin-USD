'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  Calendar,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassInput } from '../../../components/ui/GlassInput';
import { Badge } from '../../../components/ui/Badge';

// Mock transaction data
const mockTransactions = [
  {
    id: 'tx_001',
    type: 'mint',
    amount: '1000.00',
    token: 'C12USD',
    status: 'completed',
    network: 'BSC',
    paymentMethod: 'stripe',
    fee: '29.00',
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    blockNumber: 35678901,
    confirmations: 128,
    timestamp: '2024-01-15T14:30:00Z',
    from: null,
    to: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  },
  {
    id: 'tx_002',
    type: 'redeem',
    amount: '500.00',
    token: 'C12USD',
    status: 'pending',
    network: 'Polygon',
    paymentMethod: 'bank',
    fee: '2.50',
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
    blockNumber: null,
    confirmations: 0,
    timestamp: '2024-01-14T10:15:00Z',
    from: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
    to: null,
  },
  {
    id: 'tx_003',
    type: 'transfer',
    amount: '250.00',
    token: 'C12USD',
    status: 'completed',
    network: 'BSC',
    paymentMethod: null,
    fee: '0.05',
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    blockNumber: 35678856,
    confirmations: 173,
    timestamp: '2024-01-13T16:45:00Z',
    from: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
    to: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: 'tx_004',
    type: 'mint',
    amount: '750.00',
    token: 'C12USD',
    status: 'failed',
    network: 'Polygon',
    paymentMethod: 'cashapp',
    fee: '11.25',
    txHash: null,
    blockNumber: null,
    confirmations: 0,
    timestamp: '2024-01-12T09:20:00Z',
    from: null,
    to: '0x7903c63CB9f42284d03BC2a124474760f9C1390b',
  },
];

type TransactionStatus = 'all' | 'completed' | 'pending' | 'failed';
type TransactionType = 'all' | 'mint' | 'redeem' | 'transfer';

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-brand-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-brand-warning" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-brand-error" />;
      default:
        return <AlertCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <ArrowDownLeft className="w-4 h-4 text-brand-success" />;
      case 'redeem':
        return <ArrowUpRight className="w-4 h-4 text-brand-warning" />;
      case 'transfer':
        return <Send className="w-4 h-4 text-brand-primary" />;
      default:
        return <AlertCircle className="w-4 h-4 text-text-secondary" />;
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shortenHash = (hash: string | null) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const openBlockExplorer = (network: string, txHash: string | null) => {
    if (!txHash) return;

    const baseUrl = network === 'BSC'
      ? 'https://bscscan.com/tx/'
      : 'https://polygonscan.com/tx/';

    window.open(`${baseUrl}${txHash}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            View and manage all your C12USD transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton variant="secondary">
            <Download className="w-4 h-4" />
            Export CSV
          </GlassButton>
          <GlassButton
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </GlassButton>
        </div>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <GlassInput
            type="text"
            placeholder="Search by transaction ID, hash, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border-light"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TransactionStatus)}
                  className="w-full glass-card px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransactionType)}
                  className="w-full glass-card px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                >
                  <option value="all">All Types</option>
                  <option value="mint">Mint</option>
                  <option value="redeem">Redeem</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Transaction Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 text-center">
          <div className="text-2xl font-bold">{mockTransactions.length}</div>
          <div className="text-sm text-text-secondary">Total Transactions</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-2xl font-bold">
            {mockTransactions.filter(tx => tx.status === 'completed').length}
          </div>
          <div className="text-sm text-text-secondary">Completed</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-2xl font-bold">
            {mockTransactions.filter(tx => tx.status === 'pending').length}
          </div>
          <div className="text-sm text-text-secondary">Pending</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="text-2xl font-bold">
            $
            {mockTransactions
              .filter(tx => tx.status === 'completed')
              .reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
              .toFixed(2)
            }
          </div>
          <div className="text-sm text-text-secondary">Total Volume</div>
        </GlassCard>
      </div>

      {/* Transactions List */}
      <GlassCard className="overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-glass border-b border-border-light">
                <tr>
                  <th className="text-left p-4 font-medium">Transaction</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Network</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-border-light hover:bg-surface-glass/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{tx.type}</div>
                          <div className="text-sm text-text-secondary font-mono">
                            {tx.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium">${tx.amount}</div>
                      {tx.fee && (
                        <div className="text-sm text-text-secondary">
                          Fee: ${tx.fee}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <Badge
                          variant={
                            tx.status === 'completed' ? 'success' :
                            tx.status === 'pending' ? 'warning' : 'error'
                          }
                          size="sm"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                      {tx.confirmations > 0 && (
                        <div className="text-xs text-text-secondary mt-1">
                          {tx.confirmations} confirmations
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <Badge variant="secondary" size="sm">
                        {tx.network}
                      </Badge>
                      {tx.blockNumber && (
                        <div className="text-xs text-text-secondary mt-1">
                          Block {tx.blockNumber.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="text-sm">{formatDate(tx.timestamp)}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.txHash && (
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => openBlockExplorer(tx.network, tx.txHash)}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </GlassButton>
                        )}
                        {tx.txHash && (
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(tx.txHash!);
                              // toast.success('Hash copied to clipboard');
                            }}
                          >
                            Hash
                          </GlassButton>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-text-secondary opacity-50" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-text-secondary">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Your transaction history will appear here once you make your first transaction'
              }
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}