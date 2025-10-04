'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../../../shared/components/ui/GlassCard';
import { GlassButton } from '../../../../shared/components/ui/GlassButton';
import { SimpleLineChart } from './SimpleLineChart';
import { NewsPanel } from './NewsPanel';
import { alphaVantageService, type ChartDataPoint, type NewsArticle } from '../../../lib/financial/alphaVantageService';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { Badge } from '../../../../shared/components/ui/Badge';

interface DynamicChartBoxProps {
  defaultAsset?: string;
  defaultTimeframe?: string;
  showNews?: boolean;
  height?: number;
}

const ASSETS = [
  { symbol: 'BTC/USD', name: 'Bitcoin' },
  { symbol: 'ETH/USD', name: 'Ethereum' },
  { symbol: 'BNB/USD', name: 'BNB' },
  { symbol: 'MATIC/USD', name: 'Polygon' },
  { symbol: 'SPY', name: 'S&P 500' },
];

const TIMEFRAMES = [
  { value: '60min', label: '1H' },
  { value: 'daily', label: '1D' },
];

export const DynamicChartBox: React.FC<DynamicChartBoxProps> = ({
  defaultAsset = 'BTC/USD',
  defaultTimeframe = 'daily',
  showNews = true,
  height = 400,
}) => {
  const [selectedAsset, setSelectedAsset] = useState(defaultAsset);
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);

  const fetchChartData = async () => {
    setLoadingChart(true);
    try {
      const data = await alphaVantageService.getChartData(selectedAsset, timeframe);
      if (data && data.length > 0) {
        setChartData(data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchNewsData = async () => {
    setLoadingNews(true);
    try {
      const data = await alphaVantageService.getNewsData(['cryptocurrency', 'blockchain'], 10);
      if (data && data.length > 0) {
        setNewsData(data);
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedAsset, timeframe]);

  useEffect(() => {
    if (showNews) {
      fetchNewsData();
    }
  }, [showNews]);

  const handleRefresh = () => {
    fetchChartData();
    if (showNews) fetchNewsData();
  };

  const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const priceChange =
    chartData.length > 1
      ? ((chartData[chartData.length - 1].close - chartData[0].close) / chartData[0].close) * 100
      : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className={`grid ${showNews ? 'lg:grid-cols-[1fr_400px]' : 'grid-cols-1'} gap-6`}>
      {/* Chart Panel */}
      <GlassCard className="p-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Asset Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ASSETS.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>

            {/* Timeframe */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    timeframe === tf.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Chart Type */}
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === 'area'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Area
              </button>
            </div>
          </div>

          {/* Price & Refresh */}
          <div className="flex items-center gap-4">
            {currentPrice > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  ${currentPrice.toLocaleString()}
                </div>
                <div
                  className={`text-sm flex items-center gap-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
                  {isPositive ? '+' : ''}
                  {priceChange.toFixed(2)}%
                </div>
              </div>
            )}
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loadingChart}
            >
              <RefreshCw className={`w-4 h-4 ${loadingChart && 'animate-spin'}`} />
            </GlassButton>
          </div>
        </div>

        {/* Chart */}
        {loadingChart ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : (
          <SimpleLineChart data={chartData} type={chartType} height={height} />
        )}
      </GlassCard>

      {/* News Panel */}
      {showNews && (
        <GlassCard className="p-6">
          {loadingNews ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <NewsPanel
              articles={newsData}
              onArticleClick={(article) => window.open(article.url, '_blank')}
            />
          )}
        </GlassCard>
      )}
    </div>
  );
};
