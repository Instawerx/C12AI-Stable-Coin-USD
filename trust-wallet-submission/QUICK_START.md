# 🚀 Trust Wallet Submission - Quick Start

**Goal**: Get your C12USD icon visible in Trust Wallet and MetaMask

**Time Required**: 1 hour + 3-7 days review

---

## ⚡ QUICK STEPS

### 1. Optimize Icon (15 min) - DO THIS FIRST

**Your icon is currently 1.5MB. It MUST be < 100KB.**

1. Open your browser
2. Go to: **https://www.iloveimg.com/resize-image/resize-png**
3. Click "Select images"
4. Upload: `C:\Users\tabor\Downloads\C12 USD Logo Clear.png`
5. Select "Resize by pixels"
6. Enter: **256** x **256**
7. Check "Maintain aspect ratio"
8. Click "Resize images"
9. Download result
10. Save as: `c12usd-256-uncompressed.png`

11. Go to: **https://tinypng.com/**
12. Upload the 256x256 image you just created
13. Wait for compression
14. Download result
15. **Check file size** (should be < 100KB)
16. Save as: `logo.png`

17. Copy to both directories:
   ```bash
   copy logo.png "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png"
   copy logo.png "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png"
   ```

### 2. Fork Trust Wallet Repo (5 min)

1. Go to: https://github.com/trustwallet/assets
2. Click "Fork" (top right)
3. Wait for fork to complete
4. You'll be redirected to your fork

### 3. Clone Your Fork (5 min)

Open Git Bash or Command Prompt:

```bash
cd C:\Users\tabor\Downloads
git clone https://github.com/YOUR_USERNAME/assets.git
cd assets
```

Replace `YOUR_USERNAME` with your GitHub username.

### 4. Add BSC Files (5 min)

```bash
# Navigate to BSC assets
cd blockchains/smartchain/assets

# Create directory for your token
mkdir 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
cd 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58

# Copy logo
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png" logo.png

# Copy info.json
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\info.json" info.json

# Verify
dir
```

### 5. Add Polygon Files (5 min)

```bash
# Navigate to Polygon assets
cd ../../../../blockchains/polygon/assets

# Create directory for your token
mkdir 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
cd 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

# Copy logo
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png" logo.png

# Copy info.json
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\info.json" info.json

# Verify
dir
```

### 6. Commit & Push (5 min)

```bash
# Go back to root
cd ../../../../

# Add files
git add .

# Commit
git commit -m "Add C12USD stablecoin (BSC + Polygon)"

# Push to your fork
git push origin master
```

### 7. Create Pull Request (10 min)

1. Go to your fork: `https://github.com/YOUR_USERNAME/assets`
2. Click "Pull requests" tab
3. Click "New pull request"
4. Click "Create pull request"

**Title**:
```
Add C12USD stablecoin (BSC + Polygon)
```

**Description** (copy this):
```
## Overview
Adding C12USD, a USD-pegged stablecoin with cross-chain capabilities via LayerZero

## Token Information
- Name: C12USD
- Symbol: C12USD
- Decimals: 18
- Type: Stablecoin
- Chains: BSC (56) + Polygon (137)

## Contract Addresses
- BSC: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
- Polygon: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

## Verification
- [x] Logo is 256x256 PNG < 100KB
- [x] info.json follows schema
- [x] Contracts deployed and active
- [x] Token has supply (100M on each chain)

## Links
- BSCScan: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
- PolygonScan: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
- Website: https://c12ai.com

## Features
- LayerZero V2 cross-chain transfers
- ERC-3156 Flash Loans (0.05% fee)
- EIP-2612 Permit functionality
- 200M total supply minted
```

5. Click "Create pull request"
6. Wait for automated checks
7. Monitor for reviewer feedback

### 8. Wait for Approval (3-7 days)

- Check your email for GitHub notifications
- Respond quickly to any feedback
- Once merged, icon goes live within 24 hours

---

## ✅ Checklist

Before submitting, verify:

- [ ] Icon is 256x256 pixels
- [ ] Icon file size < 100KB
- [ ] Icon is PNG format
- [ ] Icon has transparent background
- [ ] Both logo.png files copied correctly
- [ ] Both info.json files copied correctly
- [ ] Contract addresses are correct (checksum format)
- [ ] All URLs work
- [ ] Committed and pushed to your fork
- [ ] Created pull request with description

---

## 🆘 Need Help?

**If stuck on icon optimization**:
- See: `SUBMISSION_INSTRUCTIONS.md` for detailed steps
- Tool: https://tinypng.com/ for compression
- Target: < 100KB file size

**If stuck on Git**:
- Install Git: https://git-scm.com/downloads
- Tutorial: https://guides.github.com/activities/hello-world/

**If PR rejected**:
- Read reviewer feedback carefully
- Make requested changes
- Push updates to your fork
- PR will auto-update

---

## 🎯 Expected Result

Once merged, your C12USD icon will appear automatically in:
- Trust Wallet (when adding token)
- MetaMask (when importing token)
- 1inch aggregator
- Uniswap interface
- PancakeSwap interface
- Many other DeFi platforms

**This is worth the effort - it's THE standard for token icons!**

---

*Follow: trust-wallet-submission/SUBMISSION_INSTRUCTIONS.md for detailed guide*