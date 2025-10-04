import { rateLimitManager } from './rateLimitManager';

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: Date;
}

interface ChartDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  sentiment: number;
  timestamp: Date;
  category: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class AlphaVantageService {
  private baseURL = 'https://www.alphavantage.co/query';
  private apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'demo';

  private getCacheKey(params: Record<string, string>): string {
    return `av_cache_${JSON.stringify(params)}`;
  }

  private getCacheDuration(functionName: string): number {
    const durations: Record<string, number> = {
      'GLOBAL_QUOTE': 1800000,           // 30 min (ticker data)
      'TIME_SERIES_INTRADAY': 14400000,  // 4 hours (chart data)
      'TIME_SERIES_DAILY': 14400000,     // 4 hours (daily data)
      'NEWS_SENTIMENT': 43200000,        // 12 hours (news)
      'DEFAULT': 1800000,                 // 30 min default
    };

    return durations[functionName] || durations.DEFAULT;
  }

  private cacheData<T>(params: Record<string, string>, data: T): void {
    try {
      const cacheKey = this.getCacheKey(params);
      const cacheEntry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: this.getCacheDuration(params.function || 'DEFAULT'),
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  private getCachedData<T>(params: Record<string, string>): T | null {
    try {
      const cacheKey = this.getCacheKey(params);
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const isExpired = Date.now() > entry.timestamp + entry.expiresIn;

      if (isExpired) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  private async fetchWithRateLimit<T>(
    params: Record<string, string>,
    priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
  ): Promise<T | null> {
    // Check cache first
    const cached = this.getCachedData<T>(params);
    if (cached) {
      console.log('Using cached data for:', params.function);
      return cached;
    }

    // Check rate limit
    const canCall = await rateLimitManager.canMakeCall(priority);

    if (!canCall) {
      console.warn('API rate limit reached, using cached data only');
      return null;
    }

    try {
      const url = new URL(this.baseURL);
      Object.entries(params).forEach(([key, value]) =>
        url.searchParams.append(key, value)
      );
      url.searchParams.append('apikey', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Check for API error messages
      if (data['Error Message'] || data['Note']) {
        console.error('Alpha Vantage API Error:', data['Error Message'] || data['Note']);
        return null;
      }

      // Record successful call
      await rateLimitManager.recordCall(params.function || 'UNKNOWN');

      // Cache response
      this.cacheData(params, data);

      return data as T;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }

  async getTickerData(symbols: string[]): Promise<TickerData[]> {
    const tickerData: TickerData[] = [];

    for (const symbol of symbols) {
      try {
        const data = await this.fetchWithRateLimit<any>(
          {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
          },
          'high'
        );

        if (data && data['Global Quote']) {
          const quote = data['Global Quote'];
          tickerData.push({
            symbol: quote['01. symbol'] || symbol,
            name: this.getAssetName(symbol),
            price: parseFloat(quote['05. price'] || '0'),
            change: parseFloat(quote['09. change'] || '0'),
            changePercent: parseFloat((quote['10. change percent'] || '0').replace('%', '')),
            volume: parseInt(quote['06. volume'] || '0'),
            lastUpdate: new Date(quote['07. latest trading day'] || Date.now()),
          });
        }
      } catch (error) {
        console.error(`Error fetching ticker for ${symbol}:`, error);
      }
    }

    return tickerData;
  }

  async getChartData(symbol: string, interval: string): Promise<ChartDataPoint[]> {
    const functionName = interval.includes('min') ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
    const params: Record<string, string> = {
      function: functionName,
      symbol,
      outputsize: 'compact',
    };

    if (functionName === 'TIME_SERIES_INTRADAY') {
      params.interval = interval;
    }

    const data = await this.fetchWithRateLimit<any>(params, 'medium');

    if (!data) return [];

    try {
      const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
      if (!timeSeriesKey) return [];

      const timeSeries = data[timeSeriesKey];
      const chartData: ChartDataPoint[] = [];

      Object.entries(timeSeries).forEach(([timestamp, values]: [string, any]) => {
        chartData.push({
          timestamp: new Date(timestamp),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        });
      });

      // Sort by timestamp (oldest first)
      return chartData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Error parsing chart data:', error);
      return [];
    }
  }

  async getNewsData(topics?: string[], limit: number = 10): Promise<NewsArticle[]> {
    const data = await this.fetchWithRateLimit<any>(
      {
        function: 'NEWS_SENTIMENT',
        topics: topics?.join(',') || 'cryptocurrency,blockchain',
        limit: limit.toString(),
        sort: 'LATEST',
      },
      'low'
    );

    if (!data || !data.feed) return [];

    try {
      return data.feed.map((article: any) => ({
        title: article.title,
        source: article.source,
        url: article.url,
        summary: article.summary,
        sentiment: parseFloat(article.overall_sentiment_score || '0'),
        timestamp: new Date(article.time_published),
        category: article.category_within_source || 'General',
      }));
    } catch (error) {
      console.error('Error parsing news data:', error);
      return [];
    }
  }

  private getAssetName(symbol: string): string {
    const names: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'BNB': 'BNB',
      'MATIC': 'Polygon',
      'SPY': 'S&P 500',
      'QQQ': 'NASDAQ',
      'GLD': 'Gold',
      'USDT': 'Tether',
    };

    return names[symbol] || symbol;
  }

  // Clear all cached data
  clearCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('av_cache_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Get cache status
  getCacheStatus(): { key: string; age: number; expires: number }[] {
    const cacheStatus: { key: string; age: number; expires: number }[] = [];

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('av_cache_')) {
          const data = localStorage.getItem(key);
          if (data) {
            const entry = JSON.parse(data);
            const age = Date.now() - entry.timestamp;
            const expires = entry.expiresIn - age;
            cacheStatus.push({
              key: key.replace('av_cache_', ''),
              age: Math.floor(age / 1000 / 60), // minutes
              expires: Math.floor(expires / 1000 / 60), // minutes
            });
          }
        }
      });
    } catch (error) {
      console.error('Error getting cache status:', error);
    }

    return cacheStatus;
  }
}

export const alphaVantageService = new AlphaVantageService();
export type { TickerData, ChartDataPoint, NewsArticle };
