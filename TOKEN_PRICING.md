# 💰 C12 Token Pricing Structure

**Version:** 1.0
**Last Updated:** October 2, 2025
**Status:** Active

---

## 📊 Official Pricing

### C12USD (Stablecoin)
```
Price:      $1.00 USD per token
Ratio:      1:1 USD backed
Minimum:    $10.00
Maximum:    Unlimited
Decimals:   18
```

**Characteristics:**
- Fully collateralized stablecoin
- 1:1 redemption guarantee
- Proof of Reserve backed
- Cross-chain compatible (BSC, Polygon)

---

### C12DAO (Governance Token)
```
Price:      $3.30 USD per token
Symbol:     💧 (Blue-Pink Gradient Droplet)
Minimum:    1 token ($3.30)
Maximum:    Unlimited
Decimals:   18
Supply:     1,000,000,000 (1 Billion total)
Minted:     600,000,000 (60% - Admin 400M, Treasury 200M)
Available:  400,000,000 (40% for public)
```

**Characteristics:**
- Governance voting power
- DAO membership benefits
- Staking rewards eligibility
- Treasury participation
- Multi-tier membership access

---

## 🧮 Pricing Formulas

### For User Purchase Interface:

```typescript
// C12USD Calculation
const calculateC12USD = (usdAmount: number) => {
  const tokenAmount = usdAmount / 1.00; // 1:1 ratio
  return {
    usdAmount,
    tokenAmount,
    pricePerToken: 1.00,
    total: usdAmount
  };
};

// C12DAO Calculation
const calculateC12DAO = (usdAmount: number) => {
  const pricePerToken = 3.30;
  const tokenAmount = usdAmount / pricePerToken;
  return {
    usdAmount,
    tokenAmount,
    pricePerToken,
    total: usdAmount
  };
};

// Reverse calculation (tokens to USD)
const calculateUSDFromTokens = (tokenAmount: number, tokenType: 'C12USD' | 'C12DAO') => {
  const price = tokenType === 'C12USD' ? 1.00 : 3.30;
  return tokenAmount * price;
};
```

---

## 💳 Payment Examples

### Example 1: Buy C12USD
```
User pays:        $100.00
Receives:         100.00 C12USD
Exchange rate:    1:1
```

### Example 2: Buy C12DAO
```
User pays:        $100.00
Receives:         30.303030... C12DAO
Exchange rate:    $3.30 per token
Rounded display:  30.30 C12DAO
```

### Example 3: Buy C12DAO (exact tokens)
```
User wants:       10 C12DAO
User pays:        $33.00
Exchange rate:    $3.30 per token
```

---

## 🎯 Minimum Purchase Requirements

### C12USD
- Minimum purchase: **$10.00** = 10 C12USD
- Recommended minimum: $50.00 (to offset gas fees)

### C12DAO
- Minimum purchase: **$3.30** = 1 C12DAO
- Recommended minimum: $33.00 (10 tokens)

---

## 💵 Fee Structure

### Manual Payments (Cash App / Stablecoin)
```
Payment Processing Fee:  0% (No additional fees)
Gas Fee:                Covered by C12 (included in price)
Total User Cost:        Exact USD amount only
```

### Future Automated Payments (Stripe)
```
Stripe Processing Fee:  2.9% + $0.30
Example: $100 purchase = $102.90 + $0.30 = $103.20 total
```

---

## 📈 Price Updates

### C12USD
- **Fixed at $1.00** - Never changes (stablecoin peg)
- Maintained through reserve backing

### C12DAO
- **Current: $3.30**
- Subject to market conditions
- May adjust based on:
  - Treasury value
  - Market demand
  - DAO governance decisions
  - Liquidity pool pricing (when available)

### Price Update Process:
1. Admin updates `TOKEN_PRICING.md`
2. Update `SystemConfig` in database:
   ```
   Key: "C12DAO_PRICE_USD"
   Value: "3.30"
   ```
3. Frontend reads from SystemConfig for real-time pricing
4. Announce price change 24 hours before effective

---

## 🔗 Integration Points

### Database Configuration
```sql
-- SystemConfig table entries
INSERT INTO system_config (key, value, description)
VALUES
  ('C12USD_PRICE_USD', '1.00', 'C12USD price in USD (fixed)'),
  ('C12DAO_PRICE_USD', '3.30', 'C12DAO price in USD (current market)'),
  ('MIN_PURCHASE_USD', '10.00', 'Minimum purchase amount'),
  ('MAX_PURCHASE_USD', '50000.00', 'Maximum purchase amount (KYC required above)');
```

### Frontend Constants
```typescript
// src/lib/pricing.ts

export const PRICING = {
  C12USD: {
    priceUSD: 1.00,
    symbol: 'C12USD',
    icon: '💵',
    decimals: 18,
    minPurchase: 10.00,
  },
  C12DAO: {
    priceUSD: 3.30,
    symbol: 'C12DAO',
    icon: '💧',
    decimals: 18,
    minPurchase: 3.30,
  },
} as const;

export const getTokenPrice = async (tokenType: 'C12USD' | 'C12DAO'): Promise<number> => {
  // Fetch from SystemConfig for real-time pricing
  const config = await firestore.collection('system_config')
    .doc(`${tokenType}_PRICE_USD`)
    .get();

  return parseFloat(config.data()?.value || PRICING[tokenType].priceUSD);
};
```

---

## 📊 Market Data Display

### Dashboard Display Format:
```
C12USD: $1.00 USD (Fixed)
C12DAO: $3.30 USD (24h: +0.00%)
```

### Purchase Preview Format:
```
Amount to pay:     $100.00
You will receive:  30.30 C12DAO
Price per token:   $3.30
Delivery chain:    BSC
```

---

## ⚠️ Important Notes

1. **C12USD Peg Stability:**
   - Maintained at exactly $1.00
   - Backed by USD reserves
   - Proof of Reserve verified hourly
   - Reserve ratio must stay ≥ 1.0000

2. **C12DAO Price Volatility:**
   - Price may fluctuate based on market
   - Current price: $3.30 (manual sales)
   - Future: DEX pricing will determine market rate
   - Manual sales price reviewed weekly

3. **Gas Fee Coverage:**
   - All blockchain gas fees included in purchase price
   - No surprise fees for users
   - Admin wallet covers distribution costs

4. **Rounding:**
   - Display token amounts to 2 decimal places for UX
   - Store full 18 decimal precision on-chain
   - Example: 30.303030303030303030 displayed as 30.30

---

**PRICING AUTHORITY:** C12 Finance Team
**LAST REVIEW:** October 2, 2025
**NEXT REVIEW:** October 9, 2025

---

*For pricing changes, update this document and the `system_config` table, then notify all users via announcement.*
