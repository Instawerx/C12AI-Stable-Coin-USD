'use client';

import React, { useEffect, useState } from 'react';
import { TickerItem } from './TickerItem';
import { alphaVantageService, type TickerData } from '@/lib/financial/alphaVantageService';
import { Loader2 } from 'lucide-react';

interface MarketTickerProps {
  assets?: string[];
  updateInterval?: number;
  scrollSpeed?: number;
  onAssetClick?: (symbol: string) => void;
}

const DEFAULT_ASSETS = [
  'BTC/USD',
  'ETH/USD',
  'BNB/USD',
  'MATIC/USD',
  'SPY',
  'QQQ',
  'GLD',
  'USDT',
];

export const MarketTicker: React.FC<MarketTickerProps> = ({
  assets = DEFAULT_ASSETS,
  updateInterval = 1800000, // 30 minutes
  scrollSpeed = 50,
  onAssetClick,
}) => {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const fetchTickerData = async () => {
    try {
      const data = await alphaVantageService.getTickerData(assets);
      if (data && data.length > 0) {
        setTickerData(data);
      }
    } catch (error) {
      console.error('Error fetching ticker data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTickerData();

    // Setup interval for updates
    const interval = setInterval(() => {
      if (!isPaused) fetchTickerData();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [assets, updateInterval, isPaused]);

  if (loading) {
    return (
      <div className="w-full h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        <span className="ml-2 text-sm text-gray-400">Loading market data...</span>
      </div>
    );
  }

  if (tickerData.length === 0) {
    return (
      <div className="w-full h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-center">
        <span className="text-sm text-gray-400">Market data unavailable</span>
      </div>
    );
  }

  // Calculate animation duration based on content width and scroll speed
  const itemWidth = 200; // Approximate width per item
  const totalWidth = tickerData.length * itemWidth;
  const duration = totalWidth / scrollSpeed;

  return (
    <div className="w-full h-12 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 overflow-hidden relative">
      <div
        className="flex items-center h-full"
        style={{
          animation: isPaused ? 'none' : `scroll ${duration}s linear infinite`,
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* First set */}
        {tickerData.map((item) => (
          <TickerItem
            key={item.symbol}
            data={item}
            onClick={() => onAssetClick?.(item.symbol)}
          />
        ))}

        {/* Duplicate for seamless loop */}
        {tickerData.map((item) => (
          <TickerItem
            key={`${item.symbol}-dup`}
            data={item}
            onClick={() => onAssetClick?.(item.symbol)}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
