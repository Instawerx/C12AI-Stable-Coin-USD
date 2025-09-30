import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw } from 'lucide-react';

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const MarketOverview: React.FC = () => {
  // Fetch crypto prices from CoinGecko API
  const { data: prices, isLoading, error, refetch } = useQuery<CryptoPrice[]>({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,matic-network,tether,usd-coin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'
      );
      if (!response.ok) throw new Error('Failed to fetch prices');

      const data = await response.json();

      return [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: data.bitcoin?.usd || 0,
          change24h: data.bitcoin?.usd_24h_change || 0,
          volume24h: data.bitcoin?.usd_24h_vol || 0,
          marketCap: data.bitcoin?.usd_market_cap || 0,
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: data.ethereum?.usd || 0,
          change24h: data.ethereum?.usd_24h_change || 0,
          volume24h: data.ethereum?.usd_24h_vol || 0,
          marketCap: data.ethereum?.usd_market_cap || 0,
        },
        {
          symbol: 'BNB',
          name: 'BNB',
          price: data.binancecoin?.usd || 0,
          change24h: data.binancecoin?.usd_24h_change || 0,
          volume24h: data.binancecoin?.usd_24h_vol || 0,
          marketCap: data.binancecoin?.usd_market_cap || 0,
        },
        {
          symbol: 'MATIC',
          name: 'Polygon',
          price: data['matic-network']?.usd || 0,
          change24h: data['matic-network']?.usd_24h_change || 0,
          volume24h: data['matic-network']?.usd_24h_vol || 0,
          marketCap: data['matic-network']?.usd_market_cap || 0,
        },
      ];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toLocaleString()}`;
  };

  const formatMarketCap = (cap: number): string => {
    if (cap >= 1e12) {
      return `$${(cap / 1e12).toFixed(2)}T`;
    }
    if (cap >= 1e9) {
      return `$${(cap / 1e9).toFixed(2)}B`;
    }
    return `$${(cap / 1e6).toFixed(2)}M`;
  };

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-primary-400" />
            <span>Market Overview</span>
          </h3>
        </div>
        <div className="card-body text-center py-8">
          <p className="text-gray-400 text-sm mb-4">Failed to load market data</p>
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

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-primary-400" />
          <span>Market Overview</span>
        </h3>
        <button
          onClick={() => refetch()}
          className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex justify-between items-center py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-12"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {prices?.map((crypto) => (
              <div
                key={crypto.symbol}
                className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-800 hover:bg-opacity-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {crypto.symbol.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{crypto.symbol}</div>
                    <div className="text-xs text-gray-400">{crypto.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-white">{formatPrice(crypto.price)}</div>
                  <div
                    className={`text-xs font-medium flex items-center justify-end space-x-1 ${
                      crypto.change24h >= 0 ? 'text-success-400' : 'text-danger-400'
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(crypto.change24h).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* C12USD Always 1:1 */}
        <div className="mt-2 pt-3 border-t border-gray-700">
          <div className="flex justify-between items-center py-3 px-3 rounded-lg bg-primary-900 bg-opacity-20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-white">C12USD</div>
                <div className="text-xs text-gray-400">Stablecoin</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-white">$1.00</div>
              <div className="text-xs text-gray-400 flex items-center justify-end space-x-1">
                <span className="inline-block w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
                <span>1:1 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
