# C12USD Platform - Developer Documentation & Memory

**Last Updated:** 2025-09-30
**Project:** C12USD - Cross-Chain Stablecoin & Banking Platform
**Vision:** Build the Bank of the Future - World's First Robotics & AI Banking Platform
**Unique Value:** Kraken Pro Clone + Full Digital Bank + Robotic Banking System

---

## 📋 Current Status Summary

### ✅ Completed (Phase 1 - Foundation)

#### 1. Infrastructure & Deployment
- ✅ Firebase Project Setup (`c12ai-dao-b3bbb`)
- ✅ Firebase Hosting Configuration
- ✅ Firebase Emulators (Auth: 9099, Firestore: 8080)
- ✅ Google Cloud Project Setup
- ✅ Next.js 14 Frontend (App Router)
- ✅ Development Environment

#### 2. Authentication System
- ✅ Firebase Authentication Integration
- ✅ Email/Password Login
- ✅ User Registration
- ✅ Google OAuth (configured)
- ✅ Facebook OAuth (configured)
- ✅ Auth Context Provider
- ✅ Protected Routes
- ✅ Session Management

#### 3. Web3 Wallet Integration
- ✅ Wagmi v2 Configuration
- ✅ RainbowKit Integration
- ✅ MetaMask Connection (ACTUAL wallet popup)
- ✅ Custom WalletButton Component
- ✅ Multi-Chain Support (BSC, Polygon, Ethereum)
- ✅ Network Switching
- ✅ Wallet State Management
- ✅ C12USD Logo Integration

#### 4. Smart Contracts
- ✅ C12USD Token (ERC-20)
  - BSC: `0x6fa920C5c676ac15AF6360D9D755187a6C87bd58`
  - Polygon: `0xD85F049E881D899Bd1a3600A58A08c2eA4f34811`
- ✅ LayerZero Gateway (Cross-chain bridge)
  - BSC: `0x8303Ac615266d5b9940b74332503f25D092F5f13`
  - Polygon: `0xF3a23bbebC06435dF16370F879cD808c408f702D`

#### 5. RPC Infrastructure
- ✅ Infura API Integration
- ✅ API Key: `5e02b184817644c2bb33c6002c3483de`
- ✅ BSC Mainnet RPC
- ✅ Polygon Mainnet RPC
- ✅ Ethereum Mainnet RPC
- ✅ Retry Logic & Fallbacks

#### 6. UI/UX Components
- ✅ Glass Morphism Design System
- ✅ GlassCard Component
- ✅ GlassButton Component
- ✅ GlassNavbar Component
- ✅ WalletButton Component (with logo)
- ✅ Responsive Design
- ✅ Dark Mode Support (partial)

---

## 🔧 Technical Stack

### Frontend
```json
{
  "framework": "Next.js 14.2.33",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "web3": "Wagmi v2 + RainbowKit v2",
  "ethereum": "Viem",
  "state": "React Query (@tanstack/react-query)",
  "auth": "Firebase Auth",
  "database": "Firestore",
  "icons": "Lucide React"
}
```

### Backend (Planned)
```json
{
  "runtime": "Node.js",
  "framework": "Express.js / Fastify",
  "deployment": "Google Cloud Run",
  "functions": "Firebase Cloud Functions",
  "database": "Firestore + PostgreSQL (for financial data)",
  "cache": "Redis",
  "queue": "Cloud Tasks / Bull",
  "storage": "Cloud Storage"
}
```

### Blockchain
```json
{
  "networks": ["BSC", "Polygon", "Ethereum"],
  "bridge": "LayerZero",
  "rpc": "Infura",
  "standards": ["ERC-20", "ERC-721", "ERC-1155"]
}
```

### DevOps
```json
{
  "hosting": "Firebase Hosting",
  "containers": "Google Cloud Run",
  "registry": "Artifact Registry",
  "ci_cd": "Cloud Build",
  "monitoring": "Cloud Monitoring",
  "logging": "Cloud Logging",
  "secrets": "Google Secret Manager"
}
```

---

## 📁 Project Structure

```
C12USD_project/
├── C12USD/                          # Main project root
│   ├── frontend/                    # Frontend applications
│   │   └── user/                    # User-facing app
│   │       ├── public/
│   │       │   ├── c12usd-logo.png
│   │       │   └── manifest.json
│   │       ├── src/
│   │       │   ├── app/
│   │       │   │   ├── layout.tsx
│   │       │   │   ├── page.tsx
│   │       │   │   ├── providers.tsx   # Wagmi, RainbowKit, React Query
│   │       │   │   ├── auth/
│   │       │   │   │   ├── login/
│   │       │   │   │   └── signup/
│   │       │   │   └── app/
│   │       │   │       └── dashboard/
│   │       │   ├── components/
│   │       │   │   └── ui/
│   │       │   │       ├── GlassButton.tsx
│   │       │   │       ├── GlassCard.tsx
│   │       │   │       ├── GlassNavbar.tsx
│   │       │   │       └── WalletButton.tsx
│   │       │   ├── contexts/
│   │       │   │   └── AuthContext.tsx
│   │       │   ├── hooks/
│   │       │   │   └── useMetaMask.ts
│   │       │   ├── lib/
│   │       │   │   ├── firebase.ts
│   │       │   │   └── wagmi.ts
│   │       │   └── styles/
│   │       │       └── globals.css
│   │       ├── .env.local
│   │       ├── package.json
│   │       └── tsconfig.json
│   │
│   ├── backend/                     # Backend services (to be built)
│   │   ├── api/                     # REST API
│   │   ├── functions/               # Cloud Functions
│   │   ├── services/                # Microservices
│   │   └── scripts/                 # Utility scripts
│   │
│   ├── contracts/                   # Smart contracts (existing)
│   │   ├── C12USD.sol
│   │   ├── LayerZeroGateway.sol
│   │   └── DAO/                     # DAO contracts (to be added)
│   │
│   ├── docs/                        # Documentation
│   │   ├── METAMASK_INTEGRATION_GUIDE.md
│   │   ├── METAMASK_CONNECTION_FIX.md
│   │   ├── WALLET_BUTTON_UPDATE.md
│   │   ├── LOGO_INTEGRATION_COMPLETE.md
│   │   └── MEMORY_DEVELOPER_DOCUMENTATION.md (this file)
│   │
│   └── firebase.json
│
└── Documentation & Planning (to be created)
    ├── WHITEPAPER.md
    ├── ROADMAP.md
    ├── BUILD_PLAN.md
    └── ARCHITECTURE.md
```

---

## 🔑 Important API Keys & Credentials

### Infura
```
API Key: 5e02b184817644c2bb33c6002c3483de

Endpoints:
- BSC: https://bsc-mainnet.infura.io/v3/5e02b184817644c2bb33c6002c3483de
- Polygon: https://polygon-mainnet.infura.io/v3/5e02b184817644c2bb33c6002c3483de
- Ethereum: https://mainnet.infura.io/v3/5e02b184817644c2bb33c6002c3483de

WebSocket:
- BSC: wss://bsc-mainnet.infura.io/ws/v3/5e02b184817644c2bb33c6002c3483de
- Polygon: wss://polygon-mainnet.infura.io/ws/v3/5e02b184817644c2bb33c6002c3483de
```

### Firebase
```
Project ID: c12ai-dao-b3bbb
Region: us-central1

API Key: AIzaSyCS_f1-nt1oE1MLQtNwA48SMkaLn5ERM4c
Auth Domain: c12ai-dao-b3bbb.firebaseapp.com
Storage Bucket: c12ai-dao-b3bbb.firebasestorage.app
Messaging Sender ID: 268788831367
App ID: 1:268788831367:web:40c645a16c754dfe3d9422

Emulators:
- Auth: http://127.0.0.1:9099
- Firestore: http://127.0.0.1:8080
```

### Google Cloud
```
Project: c12ai-dao-b3bbb
Project Number: 268788831367
Region: us-central1
```

### Smart Contract Addresses

#### BSC Mainnet (Chain ID: 56)
```
C12USD Token: 0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
Gateway: 0x8303Ac615266d5b9940b74332503f25D092F5f13
Explorer: https://bscscan.com
```

#### Polygon Mainnet (Chain ID: 137)
```
C12USD Token: 0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
Gateway: 0xF3a23bbebC06435dF16370F879cD808c408f702D
Explorer: https://polygonscan.com
```

---

## 🌐 URLs & Endpoints

### Development
```
Frontend: http://localhost:3001
Firebase Emulator UI: http://localhost:4000
Auth Emulator: http://127.0.0.1:9099
Firestore Emulator: http://127.0.0.1:8080
```

### Production (To Be Deployed)
```
Main Site: https://c12usd.com (to be configured)
Trading Platform: https://trade.c12usd.com (planned)
Admin Panel: https://admin.c12usd.com (planned)
DAO Portal: https://dao.c12usd.com (planned)
API: https://api.c12usd.com (planned)
```

---

## 📊 Database Schema (Firestore)

### Collections

#### users
```javascript
{
  uid: string,                    // Firebase Auth UID
  email: string,
  displayName: string,
  walletAddress?: string,         // Primary wallet
  wallets?: {                     // Multiple wallets
    [address: string]: {
      chain: string,
      addedAt: timestamp,
      isPrimary: boolean
    }
  },
  kycStatus: 'pending' | 'approved' | 'rejected',
  kycLevel: 1 | 2 | 3,           // KYC verification level
  accountType: 'individual' | 'business',
  balances: {                     // Fiat balances
    USD: number,
    EUR: number,
    // etc.
  },
  permissions: string[],
  createdAt: timestamp,
  updatedAt: timestamp,
  lastLogin: timestamp
}
```

#### transactions
```javascript
{
  id: string,
  userId: string,
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer' | 'swap',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  amount: number,
  currency: string,
  fromAddress?: string,
  toAddress?: string,
  txHash?: string,                // Blockchain tx hash
  chain?: string,
  fee: number,
  createdAt: timestamp,
  completedAt?: timestamp,
  metadata: {
    // Additional transaction-specific data
  }
}
```

#### trades
```javascript
{
  id: string,
  userId: string,
  orderType: 'market' | 'limit' | 'stop-loss' | 'take-profit',
  side: 'buy' | 'sell',
  pair: string,                   // e.g., 'BTC-USD'
  amount: number,
  price: number,
  filledAmount: number,
  averagePrice: number,
  status: 'open' | 'partial' | 'filled' | 'cancelled',
  fee: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  expiresAt?: timestamp
}
```

#### dao_proposals
```javascript
{
  id: string,
  proposalId: number,             // On-chain proposal ID
  title: string,
  description: string,
  proposer: string,               // Wallet address
  startBlock: number,
  endBlock: number,
  forVotes: number,
  againstVotes: number,
  status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed',
  actions: [                      // Executable actions
    {
      target: string,
      value: string,
      signature: string,
      calldata: string
    }
  ],
  createdAt: timestamp,
  executedAt?: timestamp
}
```

#### liquidity_pools
```javascript
{
  id: string,
  name: string,
  token0: string,                 // Token address
  token1: string,
  reserve0: string,               // BigNumber string
  reserve1: string,
  totalSupply: string,            // LP tokens
  fee: number,                    // Trading fee %
  apr: number,                    // Annual percentage rate
  volume24h: number,
  tvl: number,                    // Total value locked
  updatedAt: timestamp
}
```

---

## 🚀 Deployment Configuration

### Firebase Hosting
```json
{
  "hosting": {
    "public": "frontend/user/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Cloud Run (Backend Services)
```yaml
# Example: API Service
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: c12usd-api
spec:
  template:
    spec:
      containers:
      - image: gcr.io/c12ai-dao-b3bbb/api:latest
        env:
        - name: NODE_ENV
          value: production
        - name: INFURA_API_KEY
          valueFrom:
            secretKeyRef:
              name: infura-api-key
              key: latest
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```

---

## 📦 NPM Scripts

### Frontend
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "export": "next build && next export"
  }
}
```

### Backend (Planned)
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "deploy": "gcloud run deploy"
  }
}
```

---

## 🔐 Security Considerations

### Current Implementation
- ✅ Firebase Auth with secure sessions
- ✅ Environment variables for API keys
- ✅ HTTPS only (enforced by Firebase Hosting)
- ✅ CORS configuration
- ✅ Input validation (frontend)

### To Be Implemented
- ⏳ Rate limiting
- ⏳ API authentication (JWT)
- ⏳ KYC/AML compliance
- ⏳ 2FA (Two-Factor Authentication)
- ⏳ Withdrawal whitelisting
- ⏳ IP whitelisting for admin
- ⏳ Transaction signing verification
- ⏳ Audit logging
- ⏳ DDoS protection
- ⏳ Smart contract audits

---

## 🧪 Testing Strategy

### Current Status
- ✅ Manual testing in development
- ✅ Firebase emulators for local testing
- ✅ MetaMask integration tested

### To Be Implemented
- ⏳ Unit tests (Jest)
- ⏳ Integration tests
- ⏳ E2E tests (Playwright/Cypress)
- ⏳ Smart contract tests (Hardhat)
- ⏳ Load testing
- ⏳ Security testing
- ⏳ Penetration testing

---

## 📱 Mobile & Cross-Platform

### Flutter App (Planned)
```
Platform: iOS & Android
Framework: Flutter
Features:
- Native wallet integration
- Biometric authentication
- Push notifications
- QR code scanning
- Apple Wallet integration
- Google Pay integration
```

### Apple Wallet Integration
```
- C12USD card
- Transaction notifications
- Balance tracking
- Quick payments
```

---

## 🔄 CI/CD Pipeline

### Current
- Manual deployment
- Local testing

### Planned
```yaml
# Cloud Build Configuration
steps:
  # Install dependencies
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['install']
    dir: 'frontend/user'

  # Run tests
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['test']
    dir: 'frontend/user'

  # Build
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'frontend/user'

  # Deploy
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        firebase deploy --only hosting --project=c12ai-dao-b3bbb
```

---

## 📝 Environment Variables Reference

### Frontend (.env.local)
```bash
# Infura
NEXT_PUBLIC_INFURA_API_KEY=5e02b184817644c2bb33c6002c3483de

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id

# Contract Addresses
NEXT_PUBLIC_BSC_TOKEN_ADDRESS=0x6fa920C5c676ac15AF6360D9D755187a6C87bd58
NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS=0xD85F049E881D899Bd1a3600A58A08c2eA4f34811
NEXT_PUBLIC_BSC_GATEWAY_ADDRESS=0x8303Ac615266d5b9940b74332503f25D092F5f13
NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS=0xF3a23bbebC06435dF16370F879cD808c408f702D

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCS_f1-nt1oE1MLQtNwA48SMkaLn5ERM4c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=c12ai-dao-b3bbb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=c12ai-dao-b3bbb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=c12ai-dao-b3bbb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=268788831367
NEXT_PUBLIC_FIREBASE_APP_ID=1:268788831367:web:40c645a16c754dfe3d9422

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

### Backend (Planned)
```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=c12usd
POSTGRES_USER=c12admin
POSTGRES_PASSWORD=<secret>

# Redis
REDIS_URL=redis://localhost:6379

# External APIs
PLAID_CLIENT_ID=<secret>
PLAID_SECRET=<secret>
STRIPE_SECRET_KEY=<secret>
COINGECKO_API_KEY=<secret>

# Blockchain
PRIVATE_KEY=<secret>
INFURA_API_KEY=5e02b184817644c2bb33c6002c3483de

# JWT
JWT_SECRET=<secret>
JWT_EXPIRY=7d

# Email
SENDGRID_API_KEY=<secret>
FROM_EMAIL=noreply@c12usd.com

# KYC
ONFIDO_API_KEY=<secret>

# Environment
NODE_ENV=production
PORT=8080
```

---

## 🛠️ Development Workflow

### 1. Start Development Environment
```bash
# Terminal 1: Firebase Emulators
cd C12USD_project/C12USD
firebase emulators:start --project=c12ai-dao-b3bbb

# Terminal 2: Frontend Dev Server
cd C12USD_project/C12USD/frontend/user
npm run dev
```

### 2. Make Changes
- Edit files in `src/`
- Hot reload automatically updates
- Check browser console for errors

### 3. Test Locally
- Test in browser at http://localhost:3001
- Use Firebase Emulator UI at http://localhost:4000
- Test MetaMask integration

### 4. Commit & Deploy
```bash
# Commit changes
git add .
git commit -m "Description of changes"
git push

# Deploy (when ready)
npm run build
firebase deploy --only hosting
```

---

## 🆘 Troubleshooting

### Common Issues

#### 1. MetaMask Not Connecting
**Solution:** Check `providers.tsx` includes WagmiProvider and RainbowKitProvider

#### 2. Firebase Auth Error
**Solution:** Ensure emulators are running and `.env.local` has correct values

#### 3. Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### 4. Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
npm run dev -- -p 3002
```

---

## 📞 Support & Resources

### Documentation
- Firebase: https://firebase.google.com/docs
- Next.js: https://nextjs.org/docs
- Wagmi: https://wagmi.sh
- RainbowKit: https://www.rainbowkit.com
- Infura: https://docs.infura.io

### Community
- Discord: (to be created)
- Telegram: (to be created)
- Twitter: @C12AI_DAO

---

**Last Updated:** 2025-09-30
**Maintained By:** Development Team
**Next Review:** After each major milestone
