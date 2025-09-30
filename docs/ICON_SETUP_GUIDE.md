# 🎨 C12USD Token Icon Setup Guide

## 📋 Overview

This guide will help you properly set up your C12USD token icon for maximum visibility across wallets, DEXes, and blockchain explorers.

**Your Icon**: Blue water droplet in circle (represents liquidity + stability)
**Original File**: `C:\Users\tabor\Downloads\C12 USD Logo Clear.png` (1.5MB)

---

## ⚠️ Current Status

- ✅ Original icon acquired
- ❌ Needs optimization (currently 1.5MB, must be < 100KB)
- ❌ Needs multiple sizes generated
- ❌ Not yet submitted to Trust Wallet
- ❌ Not yet added to token lists

---

## 🎯 Step 1: Optimize Icon (Required)

### Option A: Use Online Tool (Easiest)

1. **Go to**: https://www.iloveimg.com/resize-image/resize-png

2. **Upload**: `C:\Users\tabor\Downloads\C12 USD Logo Clear.png`

3. **Create these sizes**:
   - **256x256px** (main - for Trust Wallet)
   - **128x128px** (medium)
   - **64x64px** (small)
   - **32x32px** (favicon)

4. **Save as**:
   - `C12USD_project\C12USD\assets\icons\c12usd-256.png`
   - `C12USD_project\C12USD\assets\icons\c12usd-128.png`
   - `C12USD_project\C12USD\assets\icons\c12usd-64.png`
   - `C12USD_project\C12USD\assets\icons\c12usd-32.png`

5. **Compress** (if files > 100KB):
   - Use: https://tinypng.com/
   - Upload all files
   - Download compressed versions
   - **Target**: Each file < 100KB

### Option B: Use Photoshop/GIMP

1. Open `C12 USD Logo Clear.png`
2. Image → Image Size → 256x256px
3. Maintain transparent background
4. Export as PNG-8 with transparency
5. Repeat for other sizes

---

## 🏦 Step 2: Submit to Trust Wallet Assets (Most Important)

**Why**: Trust Wallet's repository is used by MetaMask, many DEXes, and aggregators.

### Instructions:

1. **Fork Repository**:
   - Go to: https://github.com/trustwallet/assets
   - Click "Fork" to create your own copy

2. **Add BSC Icon**:
   ```
   Navigate to: blockchains/smartchain/assets/
   Create folder: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58/
   Add file: logo.png (your 256x256 version)
   Create file: info.json
   ```

   **info.json content**:
   ```json
   {
     "name": "C12USD",
     "type": "BEP20",
     "symbol": "C12USD",
     "decimals": 18,
     "website": "https://c12ai.com",
     "description": "C12USD is a USD-pegged stablecoin powered by C12AI DAO with cross-chain capabilities via LayerZero",
     "explorer": "https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
     "status": "active",
     "id": "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
     "links": [
       {
         "name": "twitter",
         "url": "https://twitter.com/c12ai"
       },
       {
         "name": "telegram",
         "url": "https://t.me/c12ai"
       }
     ],
     "tags": [
       "stablecoin",
       "defi"
     ]
   }
   ```

3. **Add Polygon Icon**:
   ```
   Navigate to: blockchains/polygon/assets/
   Create folder: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811/
   Add file: logo.png (your 256x256 version)
   Create file: info.json (similar to above, change explorer URL)
   ```

4. **Create Pull Request**:
   - Commit changes with message: "Add C12USD token (BSC + Polygon)"
   - Push to your fork
   - Create PR to Trust Wallet's main repository
   - Wait for review (usually 3-7 days)

---

## 📝 Step 3: Create Token List

Create file: `C12USD_project\C12USD\token-lists\c12usd.tokenlist.json`

```json
{
  "name": "C12USD Stablecoin",
  "timestamp": "2025-09-30T00:00:00.000Z",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "logoURI": "https://raw.githubusercontent.com/YOUR_GITHUB/C12USD/main/assets/icons/c12usd-256.png",
  "keywords": ["stablecoin", "defi", "layerzero", "cross-chain"],
  "tokens": [
    {
      "chainId": 56,
      "address": "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58",
      "name": "C12USD",
      "symbol": "C12USD",
      "decimals": 18,
      "logoURI": "https://raw.githubusercontent.com/YOUR_GITHUB/C12USD/main/assets/icons/c12usd-256.png",
      "extensions": {
        "bridgeInfo": {
          "137": {
            "tokenAddress": "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811"
          }
        }
      }
    },
    {
      "chainId": 137,
      "address": "0xD85F049E881D899Bd1a3600A58A08c2eA4f34811",
      "name": "C12USD",
      "symbol": "C12USD",
      "decimals": 18,
      "logoURI": "https://raw.githubusercontent.com/YOUR_GITHUB/C12USD/main/assets/icons/c12usd-256.png",
      "extensions": {
        "bridgeInfo": {
          "56": {
            "tokenAddress": "0x6fa920C5c676ac15AF6360D9D755187a6C87bd58"
          }
        }
      }
    }
  ]
}
```

**Host this file**:
- Push to GitHub repository
- Access via raw URL
- Add to Uniswap interface

---

## 🌐 Step 4: Submit to Explorers

### BSCScan
1. Go to: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
2. Click "Update Token Info"
3. Upload 256x256 icon
4. Fill in token details

### PolygonScan
1. Go to: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
2. Click "Update Token Info"
3. Upload 256x256 icon
4. Fill in token details

---

## 💻 Step 5: Update Frontend

### Add Icons to Frontend

Copy icons to frontend:
```bash
cp assets/icons/c12usd-*.png frontend/user/public/icons/
```

### Update Wagmi Configuration

Edit: `frontend/user/src/lib/wagmi.ts`

```typescript
// Add icon URLs
export const TOKEN_ICONS = {
  [bsc.id]: '/icons/c12usd-256.png',
  [polygon.id]: '/icons/c12usd-256.png',
} as const;

// Update CONTRACT_ADDRESSES to include icon
export const CONTRACT_ADDRESSES = {
  [bsc.id]: {
    token: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
    gateway: '0x8303Ac615266d5b9940b74332503f25D092F5f13',
    icon: TOKEN_ICONS[bsc.id],
  },
  [polygon.id]: {
    token: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811',
    gateway: '0xF3a23bbebC06435dF16370F879cD808c408f702D',
    icon: TOKEN_ICONS[polygon.id],
  },
} as const;
```

### Add to Token Display Components

```tsx
// Example usage in component
import { TOKEN_ICONS } from '@/lib/wagmi';
import { useChainId } from 'wagmi';
import Image from 'next/image';

export function TokenDisplay() {
  const chainId = useChainId();
  const iconUrl = TOKEN_ICONS[chainId];

  return (
    <div className="flex items-center gap-2">
      <Image
        src={iconUrl}
        alt="C12USD"
        width={32}
        height={32}
        className="rounded-full"
      />
      <span>C12USD</span>
    </div>
  );
}
```

---

## 📢 Step 6: Submit to Price Aggregators

### CoinGecko
1. Go to: https://www.coingecko.com/en/coins/new
2. Fill out application
3. Upload icon (256x256)
4. Provide contract addresses
5. Wait for approval (2-4 weeks)

### CoinMarketCap
1. Go to: https://coinmarketcap.com/request/
2. Fill out application
3. Upload icon (256x256)
4. Provide contract addresses
5. Wait for approval (1-3 weeks)

---

## ✅ Verification Checklist

- [ ] Icon optimized to < 100KB
- [ ] Multiple sizes created (256, 128, 64, 32)
- [ ] Submitted to Trust Wallet Assets (BSC)
- [ ] Submitted to Trust Wallet Assets (Polygon)
- [ ] Token list created and hosted
- [ ] Icon added to frontend
- [ ] Submitted to BSCScan
- [ ] Submitted to PolygonScan
- [ ] Applied to CoinGecko
- [ ] Applied to CoinMarketCap

---

## 📊 Timeline

| Task | Time Required | Status |
|------|---------------|--------|
| Optimize icon | 10 minutes | ⏳ Pending |
| Trust Wallet PR | 3-7 days review | ⏳ Pending |
| BSCScan update | 1-2 days | ⏳ Pending |
| PolygonScan update | 1-2 days | ⏳ Pending |
| Frontend integration | 30 minutes | ⏳ Pending |
| CoinGecko listing | 2-4 weeks | ⏳ Pending |
| CMC listing | 1-3 weeks | ⏳ Pending |

---

## 🔗 Important Links

**Your Contracts:**
- BSC: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
- Polygon: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

**Submission Portals:**
- Trust Wallet: https://github.com/trustwallet/assets
- CoinGecko: https://www.coingecko.com/en/coins/new
- CoinMarketCap: https://coinmarketcap.com/request/

**Tools:**
- Image Resizer: https://www.iloveimg.com/resize-image/resize-png
- Image Compressor: https://tinypng.com/
- Token List Validator: https://tokenlists.org/

---

## 🚀 Quick Start

**Do this right now:**

1. Open https://www.iloveimg.com/resize-image/resize-png
2. Upload your icon
3. Resize to 256x256px
4. Download and compress at https://tinypng.com/
5. Save as `c12usd-256.png`
6. Fork Trust Wallet Assets repo
7. Submit PR with your icon

**This will get your icon displaying in most wallets within a week!**

---

*Last Updated: 2025-09-30*
*Contact: admin@carnival12.com*