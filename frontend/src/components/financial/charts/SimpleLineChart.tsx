'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { ChartDataPoint } from '@/lib/financial/alphaVantageService';
import { format } from 'date-fns';

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'area';
  height?: number;
  showVolume?: boolean;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  type = 'line',
  height = 400,
  showVolume = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">No chart data available</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map((point) => ({
    timestamp: point.timestamp.getTime(),
    date: format(point.timestamp, 'MMM dd HH:mm'),
    price: point.close,
    volume: point.volume,
  }));

  // Determine if price is trending up or down
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const isPositive = lastPrice >= firstPrice;

  const lineColor = isPositive ? '#00c853' : '#ff1744';
  const gradientId = `colorPrice${isPositive ? 'Up' : 'Down'}`;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#9e9e9e"
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              tickLine={{ stroke: '#9e9e9e' }}
            />
            <YAxis
              stroke="#9e9e9e"
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              tickLine={{ stroke: '#9e9e9e' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              labelStyle={{ color: '#9e9e9e' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              animationDuration={1000}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#9e9e9e"
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              tickLine={{ stroke: '#9e9e9e' }}
            />
            <YAxis
              stroke="#9e9e9e"
              tick={{ fill: '#9e9e9e', fontSize: 12 }}
              tickLine={{ stroke: '#9e9e9e' }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
              labelStyle={{ color: '#9e9e9e' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
