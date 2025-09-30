import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount, useChainId } from 'wagmi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DollarSign, AlertCircle, CheckCircle, CreditCard, Smartphone, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiService, handleApiError } from '@/lib/api';
import { ContractHelpers } from '@/lib/contracts';

interface RedeemFormData {
  usdAmount: string;
  payoutMethod: 'stripe' | 'cashapp';
  payoutDestination?: string;
}

const RedeemForm: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [redemptionId, setRedemptionId] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RedeemFormData>({
    defaultValues: {
      payoutMethod: 'stripe',
    },
  });

  // Fetch user limits
  const { data: userLimits, isLoading: limitsLoading } = useQuery({
    queryKey: ['userLimits', address, chainId],
    queryFn: () => address ? ApiService.getUserLimits(address) : null,
    enabled: !!address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Redemption mutation
  const redeemMutation = useMutation({
    mutationFn: ApiService.requestRedemption,
    onSuccess: (data) => {
      setRedemptionId(data.redemptionId);
      toast.success('Redemption request submitted successfully!');
    },
    onError: (error) => {
      console.error('Redemption error:', error);
      toast.error(handleApiError(error));
    },
  });

  const watchAmount = watch('usdAmount');
  const watchPayoutMethod = watch('payoutMethod');

  const onSubmit = async (data: RedeemFormData) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!ContractHelpers.isValidAmount(data.usdAmount)) {
      toast.error('Invalid amount');
      return;
    }

    const usdAmount = parseFloat(data.usdAmount);

    // Check if user has sufficient balance
    const chainBalance = userLimits?.tokenBalances[chainId.toString()];
    const availableBalance = parseFloat(chainBalance?.balance || '0');

    if (usdAmount > availableBalance) {
      toast.error(`Insufficient balance. Available: ${availableBalance} C12USD`);
      return;
    }

    // Check daily limits
    if (userLimits && usdAmount > userLimits.dailyLimits.remaining) {
      toast.error(`Daily limit exceeded. Remaining: $${userLimits.dailyLimits.remaining}`);
      return;
    }

    redeemMutation.mutate({
      userWallet: address,
      usdAmount,
      chainId,
      payoutMethod: data.payoutMethod,
      payoutDestination: data.payoutDestination,
      expectedTokenAmount: ContractHelpers.parseTokenAmount(data.usdAmount).toString(),
    });
  };

  const isLoading = redeemMutation.isPending || limitsLoading;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary-400" />
          <span>Redeem C12USD</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Convert your C12USD tokens back to USD
        </p>
      </div>

      <div className="card-body space-y-4">
        {/* User Limits Display */}
        {userLimits && (
          <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Available Balance</span>
              <span className="text-sm font-semibold text-primary-400">
                {userLimits.tokenBalances[chainId.toString()]?.balance || '0'} C12USD
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Daily Limit Remaining</span>
              <span className="text-sm font-semibold text-success-400">
                ${userLimits.dailyLimits.remaining.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-success-500 to-success-600 h-2 rounded-full"
                style={{
                  width: `${(userLimits.dailyLimits.remaining / userLimits.dailyLimits.limit) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {!redemptionId ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <div>
              <label htmlFor="usdAmount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Redeem (USD)
              </label>
              <input
                type="text"
                id="usdAmount"
                placeholder="0.00"
                className={`
                  w-full px-3 py-2 bg-gray-800 border rounded-md text-white placeholder-gray-400
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  ${errors.usdAmount ? 'border-danger-500' : 'border-gray-600'}
                `}
                {...register('usdAmount', {
                  required: 'Amount is required',
                  validate: (value) => {
                    if (!ContractHelpers.isValidAmount(value)) return 'Invalid amount';
                    const amount = parseFloat(value);
                    if (amount <= 0) return 'Amount must be greater than 0';
                    if (userLimits) {
                      const available = parseFloat(userLimits.tokenBalances[chainId.toString()]?.balance || '0');
                      if (amount > available) return 'Insufficient balance';
                      if (amount > userLimits.dailyLimits.remaining) return 'Exceeds daily limit';
                      if (amount > userLimits.pilotLimits.perTransactionLimit) return 'Exceeds per-transaction limit';
                    }
                    return true;
                  }
                })}
                disabled={isLoading}
              />
              {errors.usdAmount && (
                <p className="mt-1 text-sm text-danger-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.usdAmount.message}</span>
                </p>
              )}
              {watchAmount && ContractHelpers.isValidAmount(watchAmount) && (
                <p className="mt-1 text-sm text-gray-400">
                  You will receive: ${watchAmount} USD
                </p>
              )}
            </div>

            {/* Payout Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Payout Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    value="stripe"
                    {...register('payoutMethod', { required: 'Please select a payout method' })}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${watchPayoutMethod === 'stripe'
                      ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                    }
                  `}>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-primary-400" />
                      <div>
                        <div className="font-medium text-white">Bank Transfer</div>
                        <div className="text-xs text-gray-400">via Stripe</div>
                      </div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    value="cashapp"
                    {...register('payoutMethod', { required: 'Please select a payout method' })}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${watchPayoutMethod === 'cashapp'
                      ? 'border-primary-500 bg-primary-900 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                    }
                  `}>
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-success-400" />
                      <div>
                        <div className="font-medium text-white">Cash App</div>
                        <div className="text-xs text-gray-400">Instant transfer</div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.payoutMethod && (
                <p className="mt-1 text-sm text-danger-400 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.payoutMethod.message}</span>
                </p>
              )}
            </div>

            {/* Payout Destination (optional) */}
            <div>
              <label htmlFor="payoutDestination" className="block text-sm font-medium text-gray-300 mb-2">
                Payout Destination (Optional)
              </label>
              <input
                type="text"
                id="payoutDestination"
                placeholder={watchPayoutMethod === 'cashapp' ? '$username or phone' : 'bank@email.com'}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400
                          focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('payoutDestination')}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use your default {watchPayoutMethod === 'cashapp' ? 'Cash App' : 'bank'} account
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !address}
              className="btn btn-primary w-full flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Processing Redemption...</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  <span>Request Redemption</span>
                </>
              )}
            </button>
          </form>
        ) : (
          // Redemption Success State
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Redemption Submitted!</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your redemption request has been submitted successfully.
              </p>
              <div className="bg-gray-900 bg-opacity-50 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Redemption ID</div>
                <div className="font-mono text-sm text-primary-400">{redemptionId}</div>
              </div>
            </div>
            <button
              onClick={() => {
                setRedemptionId('');
                redeemMutation.reset();
              }}
              className="btn btn-outline w-full"
            >
              Create Another Redemption
            </button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Processing time: 5-10 minutes for verification</p>
          <p>• Tokens will be burned after successful payout</p>
          <p>• Contact support if you don't receive payout within 24h</p>
        </div>
      </div>
    </div>
  );
};

export default RedeemForm;