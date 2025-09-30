import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Send, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContractAddress, getContractABI, ContractHelpers } from '@/lib/contracts';
import { getChainConfig } from '@/lib/wagmi';

interface TransferFormData {
  recipient: string;
  amount: string;
}

const TransferForm: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const chainConfig = getChainConfig(chainId);
  const tokenAddress = getContractAddress(chainId, 'token');

  const [txHash, setTxHash] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<TransferFormData>();

  const { writeContract, isPending: isWriting, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  const watchAmount = watch('amount');

  const onSubmit = async (data: TransferFormData) => {
    if (!tokenAddress || !address) {
      toast.error('Wallet not connected or contract not available');
      return;
    }

    if (!ContractHelpers.isValidAmount(data.amount)) {
      toast.error('Invalid amount');
      return;
    }

    try {
      const parsedAmount = ContractHelpers.parseTokenAmount(data.amount);

      await writeContract({
        address: tokenAddress as `0x${string}`,
        abi: getContractABI('token'),
        functionName: 'transfer',
        args: [data.recipient as `0x${string}`, parsedAmount],
      });

      setTxHash('pending');
      toast.success('Transfer transaction submitted!');

    } catch (error: any) {
      console.error('Transfer error:', error);
      toast.error(ContractHelpers.formatError(error));
    }
  };

  // Reset form when transaction is confirmed
  React.useEffect(() => {
    if (isConfirmed) {
      reset();
      setTxHash('');
      toast.success('Transfer completed successfully!');
    }
  }, [isConfirmed, reset]);

  const isLoading = isWriting || isConfirming;
  const txUrl = txHash && chainConfig ? ContractHelpers.getTransactionUrl(chainId, txHash) : null;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Send className="w-5 h-5 text-primary-400" />
          <span>Transfer C12USD</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Send C12USD tokens to another address
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-4">
        {/* Recipient Address */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            placeholder="0x..."
            className={`
              w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.recipient ? 'border-danger-500' : 'border-gray-600'}
            `}
            {...register('recipient', {
              required: 'Recipient address is required',
              pattern: {
                value: /^0x[a-fA-F0-9]{40}$/,
                message: 'Invalid Ethereum address'
              }
            })}
            disabled={isLoading}
          />
          {errors.recipient && (
            <p className="mt-1 text-sm text-danger-400 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.recipient.message}</span>
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount (C12USD)
          </label>
          <input
            type="text"
            id="amount"
            placeholder="0.00"
            className={`
              w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400
              focus:ring-2 focus:ring-primary-500 focus:border-transparent
              ${errors.amount ? 'border-danger-500' : 'border-gray-600'}
            `}
            {...register('amount', {
              required: 'Amount is required',
              validate: (value) => ContractHelpers.isValidAmount(value) || 'Invalid amount'
            })}
            disabled={isLoading}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-danger-400 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.amount.message}</span>
            </p>
          )}
          {watchAmount && ContractHelpers.isValidAmount(watchAmount) && (
            <p className="mt-1 text-sm text-gray-400">
              USD Value: ${watchAmount} (1:1 peg)
            </p>
          )}
        </div>

        {/* Transaction Status */}
        {writeError && (
          <div className="bg-danger-900 bg-opacity-20 border border-danger-700 rounded-md p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-danger-400 font-medium">Transaction Failed</h4>
                <p className="text-danger-300 text-sm mt-1">
                  {ContractHelpers.formatError(writeError)}
                </p>
              </div>
            </div>
          </div>
        )}

        {txHash && (
          <div className="bg-primary-900 bg-opacity-20 border border-primary-700 rounded-md p-3">
            <div className="flex items-start space-x-2">
              {isConfirming ? (
                <div className="w-5 h-5 border-2 border-primary-400 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="text-primary-400 font-medium">
                  {isConfirming ? 'Transaction Confirming...' : 'Transaction Confirmed!'}
                </h4>
                <p className="text-primary-300 text-sm mt-1 font-mono">
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </p>
                {txUrl && (
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-primary-400 hover:text-primary-300 text-sm mt-2"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !tokenAddress}
          className="btn btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              <span>
                {isWriting ? 'Preparing Transaction...' : 'Confirming...'}
              </span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Transfer</span>
            </>
          )}
        </button>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Transfers are processed immediately on-chain</p>
          <p>• Gas fees apply for blockchain transactions</p>
          <p>• Double-check recipient address before sending</p>
        </div>
      </form>
    </div>
  );
};

export default TransferForm;