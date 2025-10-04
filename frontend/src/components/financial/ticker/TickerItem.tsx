'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TickerData } from '@/lib/financial/alphaVantageService';

interface TickerItemProps {
  data: TickerData;
  onClick?: () => void;
}

export const TickerItem: React.FC<TickerItemProps> = ({ data, onClick }) => {
  const isPositive = data.changePercent > 0.1;
  const isNegative = data.changePercent < -0.1;
  const isFlat = !isPositive && !isNegative;

  const colorClass = isPositive
    ? 'text-green-400'
    : isNegative
    ? 'text-red-400'
    : 'text-gray-400';

  const bgClass = isPositive
    ? 'bg-green-500/10'
    : isNegative
    ? 'bg-red-500/10'
    : 'bg-gray-500/10';

  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2 mx-2 rounded-lg ${bgClass} cursor-pointer hover:scale-105 transition-transform`}
      onClick={onClick}
    >
      {/* Symbol */}
      <span className="font-bold text-white text-sm">{data.symbol}</span>

      {/* Price */}
      <span className="font-mono text-sm text-white">
        ${data.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>

      {/* Change */}
      <div className={`flex items-center gap-1 ${colorClass}`}>
        {isPositive && <TrendingUp className="w-3 h-3" />}
        {isNegative && <TrendingDown className="w-3 h-3" />}
        {isFlat && <Minus className="w-3 h-3" />}
        <span className="text-xs font-medium">
          {data.changePercent > 0 ? '+' : ''}
          {data.changePercent.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
