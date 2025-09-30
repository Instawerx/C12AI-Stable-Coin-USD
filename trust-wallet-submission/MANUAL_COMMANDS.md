# 📝 Manual Command Reference

If you prefer to run commands manually instead of using the batch script, follow these steps:

---

## ✅ PREREQUISITES CHECK

Your files are ready:
- ✅ `bsc/logo.png` - 9.5KB (perfect!)
- ✅ `bsc/info.json` - Ready
- ✅ `polygon/logo.png` - 9.5KB (perfect!)
- ✅ `polygon/info.json` - Ready

---

## 🔧 STEP-BY-STEP COMMANDS

### Step 1: Fork on GitHub (Browser)

1. Open browser and go to: **https://github.com/trustwallet/assets**
2. Click **"Fork"** button (top right)
3. Wait for fork to complete
4. Note your GitHub username from the URL

---

### Step 2: Clone Your Fork

```bash
# Navigate to Downloads folder
cd C:\Users\tabor\Downloads

# Clone YOUR fork (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/assets.git

# Enter the repository
cd assets
```

---

### Step 3: Create BSC Directory

```bash
# Navigate to BSC assets folder
cd blockchains/smartchain/assets

# Create directory with your contract address
mkdir 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58

# Enter the directory
cd 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
```

---

### Step 4: Copy BSC Files

```bash
# Copy logo
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\logo.png" logo.png

# Copy info.json
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\bsc\info.json" info.json

# Verify files are there
dir
```

You should see:
- `logo.png` (9,692 bytes)
- `info.json` (~1KB)

---

### Step 5: Create Polygon Directory

```bash
# Go back to root
cd ../../../

# Navigate to Polygon assets folder
cd blockchains/polygon/assets

# Create directory with your contract address
mkdir 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

# Enter the directory
cd 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
```

---

### Step 6: Copy Polygon Files

```bash
# Copy logo
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\logo.png" logo.png

# Copy info.json
copy "C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\polygon\info.json" info.json

# Verify files are there
dir
```

You should see:
- `logo.png` (9,692 bytes)
- `info.json` (~1KB)

---

### Step 7: Check Status

```bash
# Go back to repository root
cd ../../../../

# Check what changed
git status
```

You should see:
```
Untracked files:
  blockchains/smartchain/assets/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58/
  blockchains/polygon/assets/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811/
```

---

### Step 8: Add Files to Git

```bash
# Add all changes
git add .

# OR add specific directories
git add blockchains/smartchain/assets/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58/
git add blockchains/polygon/assets/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811/
```

---

### Step 9: Commit Changes

```bash
git commit -m "Add C12USD stablecoin (BSC + Polygon)"
```

---

### Step 10: Push to GitHub

```bash
git push origin master
```

**If authentication fails:**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select "repo" scope
4. Generate token
5. Copy token
6. Use token as password when prompted

---

### Step 11: Create Pull Request (Browser)

1. Go to: **https://github.com/YOUR_USERNAME/assets**
2. You'll see: "Your recently pushed branches"
3. Click **"Compare & pull request"**

**OR manually:**
1. Click "Pull requests" tab
2. Click "New pull request"
3. Select: base repository: `trustwallet/assets` base: `master`
4. Select: head repository: `YOUR_USERNAME/assets` compare: `master`
5. Click "Create pull request"

---

### Step 12: Fill Pull Request Form

**Title:**
```
Add C12USD stablecoin (BSC + Polygon)
```

**Description:**
Copy from: `PR_TEMPLATE.txt`

Or use this short version:
```
Adding C12USD, a USD-pegged stablecoin with LayerZero cross-chain capabilities.

Chains: BSC + Polygon
BSC: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
Polygon: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

BSCScan: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
PolygonScan: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

Logo: 256x256 PNG, 9.5KB
Supply: 100M on each chain
```

---

### Step 13: Submit & Monitor

1. Click "Create pull request"
2. Wait for automated checks (5-10 minutes)
3. Monitor PR for reviewer comments
4. Check your email for notifications
5. Respond quickly to any feedback

**Expected timeline:**
- Automated checks: 5-10 minutes
- Team review: 3-7 days
- Icon goes live: 24 hours after merge

---

## 🚨 Troubleshooting

### "fatal: destination path 'assets' already exists"
**Solution:** Delete existing assets folder or use different name
```bash
cd C:\Users\tabor\Downloads
rmdir /s assets
git clone https://github.com/YOUR_USERNAME/assets.git
```

### "Permission denied (publickey)"
**Solution:** Use HTTPS instead of SSH
```bash
git clone https://github.com/YOUR_USERNAME/assets.git
```

### "Authentication failed"
**Solution:** Create Personal Access Token
1. https://github.com/settings/tokens
2. Generate new token
3. Use token as password

### "Cannot create directory"
**Solution:** Directory might exist, try:
```bash
cd blockchains/smartchain/assets/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
```

### "Working tree has modifications"
**Solution:** Check status and commit
```bash
git status
git add .
git commit -m "Add C12USD stablecoin"
```

---

## ✅ Success Checklist

Before submitting PR, verify:

- [ ] Forked trustwallet/assets repository
- [ ] Cloned your fork locally
- [ ] Created BSC directory: `blockchains/smartchain/assets/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58/`
- [ ] Copied BSC logo.png (9.5KB)
- [ ] Copied BSC info.json
- [ ] Created Polygon directory: `blockchains/polygon/assets/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811/`
- [ ] Copied Polygon logo.png (9.5KB)
- [ ] Copied Polygon info.json
- [ ] Committed changes
- [ ] Pushed to your fork
- [ ] Created Pull Request
- [ ] Used PR template for description

---

## 📞 Need Help?

**Check files:**
```bash
# Verify BSC files
ls -la C:\Users\tabor\Downloads\assets\blockchains\smartchain\assets\0x6fa920C5c676ac15AF6360D9D755187a6C87bd58\

# Verify Polygon files
ls -la C:\Users\tabor\Downloads\assets\blockchains\polygon\assets\0xD85F049E881D899Bd1a3600A58A08c2eA4f34811\
```

**Your prepared files location:**
```
C:\Users\tabor\Downloads\C12USD_project\C12USD\trust-wallet-submission\
├── bsc\
│   ├── logo.png (9.5KB) ✅
│   └── info.json ✅
├── polygon\
│   ├── logo.png (9.5KB) ✅
│   └── info.json ✅
├── EXECUTE_NOW.bat (automated script)
├── PR_TEMPLATE.txt (PR description)
└── MANUAL_COMMANDS.md (this file)
```

---

## 🎯 Quick Reference

**Your Contract Addresses:**
- BSC: `0x6fa920C5c676ac15AF6360D9D755187a6C87bd58`
- Polygon: `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`

**Repository:**
- Trust Wallet: https://github.com/trustwallet/assets
- Your Fork: https://github.com/YOUR_USERNAME/assets

**Explorers:**
- BSCScan: https://bscscan.com/token/0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
- PolygonScan: https://polygonscan.com/token/0xD85F049E881D899Bd1a3600A58A08c2eA4f34811

---

*Good luck with your submission!* 🚀