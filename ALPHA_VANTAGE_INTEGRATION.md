# Alpha Vantage Integration - Stock Tickers & Charts

**Date:** October 3, 2025
**Status:** MCP Server Connected ✅
**API Key:** XUGSP5IJJNF525RF

---

## 🎯 Overview

Alpha Vantage MCP integration provides real-time and historical financial data for stocks, forex, and cryptocurrencies. This enables C12USD to display:
- Real-time crypto prices (BTC, ETH, etc.)
- Market charts and analytics
- Currency conversion rates
- Trading volume data

---

## 🔗 MCP Server Details

**Server Type:** HTTP MCP
**URL:** `https://mcp.alphavantage.co/mcp?apikey=XUGSP5IJJNF525RF`
**Status:** ✅ Connected

**Configuration Location:** `C:\Users\tabor\.claude.json`

---

## 📊 Available Data Sources

### 1. **Cryptocurrency Data**
- Real-time crypto prices
- Historical price data
- Trading volume
- Market cap data
- Supported coins: BTC, ETH, USDT, USDC, BNB, MATIC, etc.

### 2. **Forex/Currency Data**
- USD exchange rates
- Currency conversion
- Real-time FX rates
- Historical FX data

### 3. **Stock Market Data**
- Stock quotes
- Historical prices
- Trading volumes
- Technical indicators

### 4. **Technical Indicators**
- Moving averages (SMA, EMA)
- RSI (Relative Strength Index)
- MACD
- Bollinger Bands
- More indicators available

---

## 🎨 Planned Implementations

### Phase 1: Dashboard Price Widgets (High Priority)
**Where:** User Dashboard, Landing Page

**Components to Create:**
1. **CryptoPriceWidget** - Show current BTC, ETH, BNB, MATIC prices
2. **USDExchangeWidget** - USD value tracker
3. **C12USDPegIndicator** - Show C12USD maintaining $1.00 peg

**Example:**
```tsx
<GlassCard className="p-4">
  <div className="flex items-center justify-between">
    <span>BTC/USD</span>
    <span className="text-2xl font-bold">$45,234</span>
    <Badge variant="success">+2.3%</Badge>
  </div>
</GlassCard>
```

---

### Phase 2: Interactive Charts (Medium Priority)
**Where:** Analytics page, Token detail pages

**Chart Library:** Use Recharts or Chart.js with Alpha Vantage data

**Components to Create:**
1. **TokenPriceChart** - Line/candlestick chart for token prices
2. **VolumeChart** - Bar chart for trading volume
3. **ComparisonChart** - Compare C12USD stability vs volatile crypto

**Features:**
- Time range selectors (24H, 7D, 30D, 90D, 1Y)
- Real-time updates
- Interactive tooltips
- Zoom and pan
- Export chart data

**Example:**
```tsx
<TokenPriceChart
  symbol="BTC"
  timeRange="7D"
  showVolume={true}
  interactive={true}
/>
```

---

### Phase 3: Market Data Tables (Low Priority)
**Where:** Markets page (new page)

**Components:**
1. **CryptoMarketTable** - List of crypto prices
2. **TrendingCoins** - Top gainers/losers
3. **MarketOverview** - Overall market stats

---

## 🛠️ Technical Implementation

### Installation

```bash
cd frontend/user
npm install recharts axios
# or
npm install chart.js react-chartjs-2
```

### API Integration Service

Create `frontend/user/src/lib/alphaVantageService.ts`:

```typescript
const ALPHA_VANTAGE_API_KEY = 'XUGSP5IJJNF525RF';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

// Get real-time crypto price
export async function getCryptoPrice(symbol: string): Promise<CryptoPrice> {
  const response = await fetch(
    `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  const data = await response.json();

  // Parse and return data
  return {
    symbol,
    price: parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']),
    change24h: 0, // Calculate from time series
    volume: 0,
    marketCap: 0,
  };
}

// Get historical data for charts
export async function getHistoricalData(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
) {
  const functionMap = {
    daily: 'DIGITAL_CURRENCY_DAILY',
    weekly: 'DIGITAL_CURRENCY_WEEKLY',
    monthly: 'DIGITAL_CURRENCY_MONTHLY',
  };

  const response = await fetch(
    `${BASE_URL}?function=${functionMap[interval]}&symbol=${symbol}&market=USD&apikey=${ALPHA_VANTAGE_API_KEY}`
  );
  const data = await response.json();

  return data;
}

// Get multiple crypto prices (BTC, ETH, BNB, MATIC)
export async function getMultipleCryptoPrices() {
  const symbols = ['BTC', 'ETH', 'BNB', 'MATIC'];
  const promises = symbols.map(symbol => getCryptoPrice(symbol));
  const results = await Promise.all(promises);

  return results;
}
```

### Example Component: CryptoPriceWidget

```tsx
// frontend/user/src/components/CryptoPriceWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { getCryptoPrice } from '../lib/alphaVantageService';

interface CryptoPriceWidgetProps {
  symbol: string;
  name: string;
  icon?: string;
}

export const CryptoPriceWidget: React.FC<CryptoPriceWidgetProps> = ({
  symbol,
  name,
  icon,
}) => {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrice();
    // Refresh every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  const fetchPrice = async () => {
    try {
      const data = await getCryptoPrice(symbol);
      setPrice(data.price);
      setChange(data.change24h);
    } catch (error) {
      console.error('Error fetching price:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="animate-pulse flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <div>
            <div className="font-semibold">{symbol}</div>
            <div className="text-xs text-text-secondary">{name}</div>
          </div>
        </div>
        <button
          onClick={fetchPrice}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">
          ${price?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>

        <Badge variant={change >= 0 ? 'success' : 'danger'}>
          {change >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change >= 0 ? '+' : ''}
          {change.toFixed(2)}%
        </Badge>
      </div>
    </GlassCard>
  );
};
```

---

## 📍 Integration Points

### 1. **User Dashboard** (`frontend/user/src/app/app/dashboard/page.tsx`)
Add crypto price widgets below the portfolio section:

```tsx
{/* Market Overview */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <CryptoPriceWidget symbol="BTC" name="Bitcoin" icon="₿" />
  <CryptoPriceWidget symbol="ETH" name="Ethereum" icon="Ξ" />
  <CryptoPriceWidget symbol="BNB" name="BNB" icon="◈" />
  <CryptoPriceWidget symbol="MATIC" name="Polygon" icon="◆" />
</div>
```

### 2. **Landing Page** (`frontend/user/src/app/page.tsx`)
Add market stats section:

```tsx
{/* Live Market Data */}
<section className="py-16 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8">
      Live Crypto Market
    </h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Price widgets here */}
    </div>
  </div>
</section>
```

### 3. **Analytics Page** (New)
Create `frontend/user/src/app/app/analytics/page.tsx`:
- Full-page charts
- Multiple timeframes
- Technical indicators
- Export functionality

### 4. **Admin Dashboard** (`frontend/src/pages/admin/analytics.tsx`)
- Market correlation data
- C12USD peg monitoring
- Trading volume analytics

---

## 🎯 Use Cases for C12USD

### 1. **Demonstrate Stability**
Show C12USD maintaining $1.00 peg compared to volatile BTC/ETH:
```
BTC: $45,234 (-5.2%) ⬇️
ETH: $2,876 (-3.8%) ⬇️
C12USD: $1.00 (0.0%) ✅ STABLE
```

### 2. **Market Context**
Help users understand when to convert crypto to stable value:
- "BTC down 10%? Convert to C12USD to preserve value"
- "Market volatile? Park funds in C12USD"

### 3. **Transparent Pricing**
Show real-time USD value for C12DAO token pricing:
- C12DAO: $3.30 (updates based on market conditions)

### 4. **Investment Insights**
For DAO members, show portfolio performance vs crypto market:
- "Your C12USD portfolio is 0% volatile vs BTC -15%"

---

## 🚧 Rate Limits & Considerations

### Alpha Vantage Free Tier
- **5 API calls per minute**
- **500 calls per day**

### Optimization Strategies
1. **Cache responses** - Store prices for 60 seconds
2. **Batch requests** - Group multiple symbol requests
3. **Use time series wisely** - Load charts on-demand
4. **WebSocket fallback** - For high-frequency updates, consider other providers

### Example Caching:
```typescript
const priceCache = new Map<string, { price: number; timestamp: number }>();

function getCachedPrice(symbol: string) {
  const cached = priceCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < 60000) {
    return cached.price;
  }
  return null;
}
```

---

## 📦 Required NPM Packages

```json
{
  "dependencies": {
    "recharts": "^2.12.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/recharts": "^1.8.29"
  }
}
```

---

## 🔐 Security Notes

1. **API Key Protection**
   - Store in environment variables for production
   - Use `.env.local` for development
   - Never commit API keys to git

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Queue requests to avoid hitting limits
   - Show loading states during fetches

3. **Error Handling**
   - Graceful fallbacks for failed requests
   - Show cached data if API is down
   - User-friendly error messages

---

## 🚀 Next Steps

1. ✅ **MCP Server Connected**
2. ⏳ **Install chart libraries** - `npm install recharts axios`
3. ⏳ **Create Alpha Vantage service** - `lib/alphaVantageService.ts`
4. ⏳ **Build CryptoPriceWidget** - `components/CryptoPriceWidget.tsx`
5. ⏳ **Add to Dashboard** - Integrate widgets
6. ⏳ **Create charts page** - Full analytics
7. ⏳ **Test and optimize** - Rate limiting, caching

---

## 📚 Documentation Links

- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Crypto API Endpoints](https://www.alphavantage.co/documentation/#digital-currency)
- [Technical Indicators](https://www.alphavantage.co/documentation/#technical-indicators)
- [Recharts Documentation](https://recharts.org/)

---

**Status:** Ready for implementation! 🎉

The Alpha Vantage MCP server is connected and ready to provide real-time financial data for your C12USD platform.
