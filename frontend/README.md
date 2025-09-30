# C12USD Frontend

A modern Next.js frontend for the C12USD cross-chain stablecoin platform, built with TypeScript, Wagmi, and Tailwind CSS.

## 🚀 Features

- **Web3 Integration**: Wallet connection with RainbowKit and Wagmi
- **Multi-chain Support**: BSC and Polygon networks
- **Token Management**: Balance display, transfers, and redemptions
- **Real-time Data**: Live updates using React Query
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Proof of Reserves**: Live reserve monitoring and historical data

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- BSC or Polygon network access

## 🛠 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard with tabs
│   │   ├── TokenBalance.tsx # Token balance display
│   │   ├── TransferForm.tsx # Token transfer form
│   │   ├── RedeemForm.tsx   # USD redemption form
│   │   ├── ProofOfReserves.tsx # Reserve monitoring
│   │   ├── TransactionHistory.tsx # Transaction list
│   │   └── Layout.tsx       # App layout wrapper
│   ├── lib/                 # Utilities and configuration
│   │   ├── api.ts          # Backend API integration
│   │   ├── contracts.ts    # Contract ABIs and helpers
│   │   └── wagmi.ts        # Web3 configuration
│   ├── pages/              # Next.js pages
│   │   ├── _app.tsx        # App wrapper with providers
│   │   ├── _document.tsx   # HTML document structure
│   │   └── index.tsx       # Home page
│   └── styles/             # Global styles
│       └── globals.css     # Tailwind CSS and custom styles
├── public/                 # Static assets
├── next.config.js         # Next.js configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the frontend directory:

```bash
# Wallet Connect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# API Base URL (your backend server)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Chain Configuration
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org/
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com/

# Contract Addresses (deployed contracts)
NEXT_PUBLIC_BSC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_BSC_GATEWAY_ADDRESS=0x...
NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS=0x...
```

### Chain Configuration

The app supports BSC and Polygon networks. Chain configurations are defined in `src/lib/wagmi.ts`:

```typescript
export const SUPPORTED_CHAINS = [
  {
    id: 56,
    name: 'BSC Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_BSC_RPC_URL!] } },
    blockExplorers: { default: { name: 'BSCScan', url: 'https://bscscan.com' } },
  },
  // ... more chains
];
```

### Contract Integration

Contract addresses and ABIs are managed in `src/lib/contracts.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  56: { // BSC
    token: process.env.NEXT_PUBLIC_BSC_TOKEN_ADDRESS!,
    gateway: process.env.NEXT_PUBLIC_BSC_GATEWAY_ADDRESS!,
  },
  137: { // Polygon
    token: process.env.NEXT_PUBLIC_POLYGON_TOKEN_ADDRESS!,
    gateway: process.env.NEXT_PUBLIC_POLYGON_GATEWAY_ADDRESS!,
  },
};
```

## 🎨 UI Components

### Dashboard
- Tab-based navigation (Overview, Transfer, Redeem, History, Reserves)
- Network detection and wallet status
- Quick action buttons

### TokenBalance
- Real-time balance display with 1:1 USD peg
- Pilot supply tracking with progress bar
- Contract interaction via Wagmi hooks

### TransferForm
- Send C12USD tokens to any address
- Form validation with React Hook Form
- Transaction monitoring and confirmations

### RedeemForm
- Convert C12USD back to USD
- Backend API integration for redemption requests
- Support for Stripe (bank transfer) and Cash App payouts

### ProofOfReserves
- Live reserve ratio monitoring
- Historical data visualization
- Reserve breakdown by account type

### TransactionHistory
- Paginated transaction list
- Filter by transaction type
- Real-time status updates

## 🌐 API Integration

The frontend integrates with the backend API for:

- User limits and KYC status
- Redemption requests
- Transaction history
- Proof of reserves data

API service is centralized in `src/lib/api.ts`:

```typescript
export const ApiService = {
  getUserLimits: (address: string) =>
    fetch(`${API_BASE_URL}/api/users/${address}/limits`).then(r => r.json()),

  requestRedemption: (data: RedemptionRequest) =>
    fetch(`${API_BASE_URL}/api/redemptions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // ... more endpoints
};
```

## 📱 Responsive Design

The UI is built with mobile-first responsive design:

- **Mobile (320px+)**: Single column layout, collapsible navigation
- **Tablet (768px+)**: Two-column forms, expanded navigation
- **Desktop (1024px+)**: Three-column dashboard, full feature set

Custom breakpoints and utilities in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        '3xl': '1600px',
      },
      // ... custom theme
    }
  }
}
```

## 🌐 Internationalization (i18n)

Full internationalization support with react-i18next:

- **Multi-language Support**: English (default) and Spanish
- **Dynamic Language Switching**: LanguageSwitcher component with persistent preferences
- **Organized Translations**: Namespace-based organization (common, dashboard)
- **Locale-aware Formatting**: Numbers, currencies, and dates

Translation usage:

```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation(['common', 'dashboard']);
  return <h1>{t('dashboard:title')}</h1>;
};
```

Language files in `src/locales/`:
```
locales/
├── en/
│   ├── common.json      # Common UI elements
│   └── dashboard.json   # Dashboard-specific terms
└── es/
    ├── common.json      # Spanish translations
    └── dashboard.json   # Spanish dashboard terms
```

## 🎭 Animations and UX

Enhanced user experience with:

- **Fade-in animations** for component transitions
- **Loading states** with skeleton screens and shimmer effects
- **Hover effects** with subtle transforms and glows
- **Success animations** for completed actions
- **Error handling** with user-friendly messages
- **Responsive Design** with mobile-first approach

Custom animation classes in `globals.css`:

```css
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-slide-in { animation: slide-in 0.3s ease-out; }
.animate-shimmer { animation: shimmer 2s infinite; }
.hover-lift { @apply hover:transform hover:-translate-y-1; }
.hover-glow { @apply hover:shadow-lg hover:shadow-primary-500/30; }
.balance-pulse { animation: pulse-success 3s infinite; }
```

## 🧪 Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Lint code
npm run lint

# Type checking
npm run type-check

# Build production
npm run build
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting (configured in VSCode)

### Testing

```bash
# Run component tests
npm run test

# Run E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run export  # Static export if needed
```

### Environment Setup

1. Set up environment variables for production
2. Configure CORS for your backend API
3. Set up SSL certificates for HTTPS
4. Configure Web3 provider endpoints

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Monitoring and Analytics

### Error Tracking
- Frontend error boundaries
- API error handling with user feedback
- Transaction failure recovery

### Performance Monitoring
- Next.js performance metrics
- Web3 connection monitoring
- API response time tracking

## 🛡 Security Considerations

- **No Private Keys**: Never store private keys in frontend
- **Input Validation**: All user inputs are validated
- **HTTPS Only**: Enforce secure connections
- **Content Security Policy**: Configured in next.config.js
- **Dependency Auditing**: Regular npm audit checks

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.