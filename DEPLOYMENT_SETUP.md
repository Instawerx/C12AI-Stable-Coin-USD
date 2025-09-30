# 🔐 C12USD Production Deployment - Key Setup Guide

## 📁 **Key Placement Locations**

### **1. Main Environment File (.env)**
**Location**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\.env`
**Current Status**: Contains test keys - REPLACE THESE

### **2. Production Environment File (.env.production)**
**Location**: `C:\Users\tabor\Downloads\C12USD_project\C12USD\.env.production`
**Current Status**: Contains placeholder values - REPLACE THESE

---

## 🔑 **CRITICAL KEYS TO REPLACE**

### **1. BLOCKCHAIN PRIVATE KEY (MOST IMPORTANT)**
```bash
# In .env file, replace this line:
OPS_SIGNER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

# With your real MetaMask private key:
OPS_SIGNER_PRIVATE_KEY=0xYOUR_REAL_64_CHARACTER_PRIVATE_KEY_HERE
```

**⚠️ How to get your private key from MetaMask:**
1. Open MetaMask extension
2. Click the 3 dots menu → Account Details
3. Click "Show private key"
4. Enter your MetaMask password
5. Copy the 64-character hex string (starts with 0x)

### **2. API KEY FOR CONTRACT VERIFICATION (SIMPLIFIED!)**
```bash
# In .env file, add this single line:
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_V2_MULTICHAIN_API_KEY_HERE
```

**🎯 NEW: One API Key for 60+ Networks!**
- **Etherscan Multichain API V2**: Visit https://etherscan.io/apis → Register → Generate API Key
- **Covers ALL networks**: BSC, Polygon, Ethereum, Arbitrum, Optimism, and 60+ more
- **Replaces**: BSCScan, PolygonScan, and other individual network API keys
- **Migration deadline**: May 31, 2025 (V1 APIs will be discontinued)

### **3. PAYMENT PROVIDER KEYS (For Live Operations)**
```bash
# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY

# Cash App (get from Cash App Developer Portal)
CASHAPP_CLIENT_ID=YOUR_PRODUCTION_CLIENT_ID
CASHAPP_CLIENT_SECRET=YOUR_PRODUCTION_CLIENT_SECRET
CASHAPP_ACCESS_TOKEN=YOUR_PRODUCTION_ACCESS_TOKEN
CASHAPP_WEBHOOK_SECRET=YOUR_PRODUCTION_WEBHOOK_SECRET
```

---

## 💰 **WALLET FUNDING REQUIREMENTS**

Your wallet address needs to be funded with:
- **BSC Network**: 0.1 BNB (~$102)
- **Polygon Network**: 1 POL (~$0.46)

**Your wallet address** (derived from private key): Will be shown after you provide the key

---

## 🛡️ **SECURITY NOTES**

1. **NEVER commit .env files to git**
2. **NEVER share your private key**
3. **Use a dedicated deployment wallet** (not your main wallet)
4. **Keep backups of your keys in secure password manager**
5. **Test on testnets first if unsure**

---

## 🚀 **DEPLOYMENT PROCESS**

1. **Replace the keys in .env file**
2. **Fund your wallet with BNB and POL**
3. **Run verification**: `npm run verify-setup`
4. **Deploy**: I'll execute the deployment commands

---

## 📝 **QUICK SETUP CHECKLIST**

- [ ] Export private key from MetaMask
- [ ] Replace OPS_SIGNER_PRIVATE_KEY in .env
- [ ] Get BSCScan API key
- [ ] Get PolygonScan API key
- [ ] Fund wallet with 0.1 BNB + 1 POL
- [ ] Ready to deploy!

**Next Step**: Open the .env file and replace the keys, then let me know when ready!