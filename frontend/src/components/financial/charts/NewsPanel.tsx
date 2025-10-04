'use client';

import React from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import type { NewsArticle } from '../../../lib/financial/alphaVantageService';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '../../../../shared/components/ui/Badge';

interface NewsPanelProps {
  articles: NewsArticle[];
  onArticleClick?: (article: NewsArticle) => void;
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ articles, onArticleClick }) => {
  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.25) {
      return <Badge variant="success">🟢 Bullish</Badge>;
    } else if (sentiment < -0.25) {
      return <Badge variant="error">🔴 Bearish</Badge>;
    } else {
      return <Badge variant="default">⚪ Neutral</Badge>;
    }
  };

  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Newspaper className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No news available</p>
        <p className="text-xs mt-1">Check back later for market updates</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          Market News
        </h3>
        <Badge variant="default" className="text-xs">
          {articles.length} articles
        </Badge>
      </div>

      {articles.map((article, index) => (
        <div
          key={index}
          className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-blue-500/50 transition-colors cursor-pointer group"
          onClick={() => onArticleClick?.(article)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-400">{article.source}</span>
            {getSentimentBadge(article.sentiment)}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {article.title}
          </h4>

          {/* Summary */}
          <p className="text-xs text-gray-400 line-clamp-3 mb-3">{article.summary}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDistanceToNow(article.timestamp, { addSuffix: true })}</span>
            <div className="flex items-center gap-1 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Read more</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>

          {/* Category */}
          {article.category && (
            <div className="mt-2 pt-2 border-t border-gray-700/50">
              <span className="text-xs text-gray-500">{article.category}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
