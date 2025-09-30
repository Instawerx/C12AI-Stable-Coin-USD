# 🏦 Trust Wallet Assets Submission Instructions

## 📋 Overview

This guide will walk you through submitting your C12USD icon to the Trust Wallet Assets repository, which will make it visible in:
- Trust Wallet
- MetaMask
- 1inch
- Many other DeFi platforms and aggregators

**Estimated Time**: 30-45 minutes
**Review Time**: 3-7 days

---

## ⚠️ BEFORE YOU START

### Prerequisites Checklist

- [ ] **Icon optimized to 256x256px and < 100KB**
  - Current file: `C:\Users\tabor\Downloads\C12 USD Logo Clear.png` (1.5MB)
  - **Must resize and compress first!**

- [ ] **GitHub account created**
  - Go to: https://github.com/signup if you don't have one

- [ ] **Git installed on your computer**
  - Download: https://git-scm.com/downloads

---

## 🎨 STEP 1: Optimize Your Icon (REQUIRED)

Your current icon is **1.5MB** and needs to be **< 100KB**.

### Option A: Online Tools (Easiest)

1. **Resize**:
   - Go to: https://www.iloveimg.com/resize-image/resize-png
   - Upload: `C:\Users\tabor\Downloads\C12 USD Logo Clear.png`
   - Set dimensions: 256 x 256 pixels
   - Keep "Maintain aspect ratio" checked
   - Download result

2. **Compress**:
   - Go to: https://tinypng.com/
   - Upload the 256x256 version
   - Download compressed version
   - **Verify file size is < 100KB**

3. **Save as**:
   - `C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png`
   - `C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png`

### Option B: Use Photoshop/GIMP

1. Open `C12 USD Logo Clear.png`
2. Image → Image Size → 256x256px
3. File → Export As → PNG
4. Choose "Save for Web" with compression
5. Save in both directories above

---

## 🔧 STEP 2: Fork Trust Wallet Repository

1. **Go to Trust Wallet Assets**:
   - URL: https://github.com/trustwallet/assets

2. **Fork the Repository**:
   - Click the "Fork" button (top right)
   - This creates a copy in your GitHub account
   - Wait for fork to complete

3. **Clone Your Fork**:
   ```bash
   cd C:\Users\tabor\Downloads
   git clone https://github.com/YOUR_USERNAME/assets.git
   cd assets
   ```
   Replace `YOUR_USERNAME` with your GitHub username

---

## 📁 STEP 3: Add BSC Token Files

1. **Navigate to BSC directory**:
   ```bash
   cd blockchains\smartchain\assets
   ```

2. **Create token directory**:
   ```bash
   mkdir 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
   cd 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
   ```

3. **Copy files**:
   ```bash
   # Copy logo
   copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png" logo.png

   # Copy info.json
   copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\info.json" info.json
   ```

4. **Verify files**:
   ```bash
   dir
   ```
   Should show:
   - `logo.png` (< 100KB)
   - `info.json`

---

## 📁 STEP 4: Add Polygon Token Files

1. **Navigate to Polygon directory**:
   ```bash
   cd ..\..\..
   cd blockchains\polygon\assets
   ```

2. **Create token directory**:
   ```bash
   mkdir 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
   cd 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
   ```

3. **Copy files**:
   ```bash
   # Copy logo
   copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png" logo.png

   # Copy info.json
   copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\info.json" info.json
   ```

4. **Verify files**:
   ```bash
   dir
   ```
   Should show:
   - `logo.png` (< 100KB)
   - `info.json`

---

## 🚀 STEP 5: Commit and Push Changes

1. **Navigate back to root**:
   ```bash
   cd ..\..\..\..
   ```

2. **Check status**:
   ```bash
   git status
   ```
   Should show new files in smartchain and polygon directories

3. **Add files**:
   ```bash
   git add blockchains/smartchain/assets/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58/
   git add blockchains/polygon/assets/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811/
   ```

4. **Commit changes**:
   ```bash
   git commit -m "Add C12USD stablecoin (BSC + Polygon)"
   ```


5. **Push to your fork**:
   ```bash
   git push origin master
   ```

---

## 📝 STEP 6: Create Pull Request

1. **Go to your fork on GitHub**:
   - URL: `https://github.com/YOUR_USERNAME/assets`

2. **Create Pull Request**:
   - Click "Pull requests" tab
   - Click "New pull request"
   - Click "Create pull request"

3. **Fill PR details**:

   **Title**:
   ```
   Add C12USD stablecoin (BSC + Polygon)
   ```

   **Description**:
   ```
   ## Overview
   Adding C12USD, a USD-pegged stablecoin with cross-chain capabilities

   ## Token Information
   - Name: C12USD
   - Symbol: C12USD
   - Type: Stablecoin
   - Chains: BSC (56) + Polygon (137)

   ## Contract Addresses
   - BSC: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
   - Polygon: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

   ## Verification
   - [x] Logo is 256x256 PNG < 100KB
   - [x] info.json follows schema
   - [x] Contracts verified on explorers
   - [x] Active and operational

   ## Links
   - Website: https://c12ai.com
   - BSCScan: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
   - PolygonScan: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
   - Documentation: https://github.com/carnival12/C12USD

   ## Features
   - LayerZero V2 cross-chain transfers
   - ERC-3156 Flash Loans
   - EIP-2612 Permit functionality
   - Role-based access control
   ```

4. **Submit Pull Request**:
   - Click "Create pull request"
   - Wait for automated checks to pass
   - Wait for Trust Wallet team review (3-7 days)

---

## ✅ STEP 7: Monitor Your PR

1. **Check PR Status**:
   - Go to: https://github.com/trustwallet/assets/pulls
   - Find your PR
   - Monitor for comments/feedback

2. **Respond to Feedback**:
   - If reviewers request changes, make them
   - Push updates to your fork
   - PR will auto-update

3. **Wait for Approval**:
   - Usually takes 3-7 days
   - You'll get email notification when merged

---Can we make sure our Docker and

## 🎉 STEP 8: Verify Listing

Once your PR is merged:

1. **Clear Cache** (wait 24 hours after merge):
   - Close and reopen Trust Wallet
   - Clear MetaMask cache

2. **Check Visibility**:
   - Add C12USD token in Trust Wallet
   - Add C12USD token in MetaMask
   - Icon should appear automatically

3. **Test on Platforms**:
   - 1inch
   - Uniswap
   - PancakeSwap
   - CoinGecko (if listed)

---

## 🚨 Common Issues & Solutions

### Issue: "Logo file too large"
**Solution**: Logo must be < 100KB
- Use https://tinypng.com/ to compress
- Try reducing to 128x128 if needed
- Use PNG-8 instead of PNG-24

### Issue: "info.json validation failed"
**Solution**: Check JSON format
- Use https://jsonlint.com/ to validate
- Ensure all required fields present
- Check for trailing commas

### Issue: "Contract not verified"
**Solution**: Verify contract first
```bash
npx hardhat verify --network bsc 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
npx hardhat verify --network polygon 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
```

### Issue: "PR rejected - duplicate"
**Solution**: Check if token already listed
- Search repository for your address
- If found, update existing entry instead

### Issue: "Git push failed - permission denied"
**Solution**: Check GitHub credentials
- Use Personal Access Token instead of password
- Configure Git: `git config --global credential.helper wincred`

---

## 📋 Pre-Submission Checklist

Before creating PR, verify:

- [ ] Logo is exactly 256x256 pixels
- [ ] Logo file size < 100KB
- [ ] Logo has transparent background
- [ ] Logo is PNG format
- [ ] info.json is valid JSON
- [ ] All contract addresses correct
- [ ] Website URL works
- [ ] Explorer URLs work
- [ ] Contracts verified on explorers
- [ ] Token has actual supply (not 0)
- [ ] Token is actively traded

---

## 🔗 Helpful Resources

**Trust Wallet Assets Repository**:
- Main repo: https://github.com/trustwallet/assets
- Contributing guide: https://github.com/trustwallet/assets/blob/master/contributing.md
- Asset requirements: https://github.com/trustwallet/assets/blob/master/asset_requirements.md

**Tools**:
- Image resizer: https://www.iloveimg.com/resize-image/resize-png
- Image compressor: https://tinypng.com/
- JSON validator: https://jsonlint.com/
- Git download: https://git-scm.com/downloads

**Your Contract Info**:
- BSC: `0x6fa920C5c676ac15AF6360D9D755187a6C87bd58`
- Polygon: `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`
- Treasury: `0x7903c63CB9f42284d03BC2a124474760f9C1390b`

---

## 💡 Pro Tips

1. **Be Patient**: Trust Wallet team reviews hundreds of PRs
2. **Be Responsive**: Respond quickly to any feedback
3. **Follow Guidelines**: Read their contributing guide carefully
4. **Be Professional**: Use clear, professional language
5. **Test Locally**: Validate your files before submitting

---

## 📞 Need Help?

**Trust Wallet Support**:
- GitHub Issues: https://github.com/trustwallet/assets/issues
- Discord: Check their GitHub for invite link

**Your Project Files**:
- BSC info.json: `trust-wallet-submission/bsc/info.json`
- Polygon info.json: `trust-wallet-submission/polygon/info.json`
- This guide: `trust-wallet-submission/SUBMISSION_INSTRUCTIONS.md`

---

## 🎯 Expected Timeline

| Step | Duration |
|------|----------|
| Icon optimization | 15 minutes |
| Fork & clone repo | 10 minutes |
| Add files | 10 minutes |
| Create PR | 10 minutes |
| Automated checks | 5 minutes |
| Team review | **3-7 days** |
| Icon goes live | 24 hours after merge |

**Total Time to Live**: ~4-8 days

---

## ✅ Success!

Once your PR is merged, your C12USD icon will appear in:
- ✅ Trust Wallet
- ✅ MetaMask
- ✅ 1inch
- ✅ Uniswap interface
- ✅ PancakeSwap interface
- ✅ Many other platforms

**This is the single most important step for token visibility!**

---

*Last Updated: September 30, 2025*
*Questions? Check: docs/ICON_SETUP_GUIDE.md*