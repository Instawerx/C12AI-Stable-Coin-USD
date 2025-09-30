# C12USD Architecture Documentation

## 🏗 System Overview

C12USD is a cross-chain USD-pegged stablecoin built with LayerZero technology, featuring comprehensive backend services, modern frontend interfaces, and enterprise-grade observability.

## 📋 Project Structure

```
C12USD/
├── .claude/                        # Claude Code Configuration
│   ├── system.md                   # Master agent configuration
│   ├── context/
│   │   ├── memory.md              # Compressed iteration summaries
│   │   └── optimization.md        # Context engineering implementation
│   └── workflows/
│       └── tasks/                 # Self-contained task specifications (13 tasks)
│
├── contracts/                      # Smart Contracts Layer
│   ├── C12USDToken.sol            # LayerZero OFT implementation
│   ├── MintRedeemGateway.sol      # Signature-based gateway
│   └── README.md                  # Contract documentation
│
├── src/                           # Backend Services Layer
│   ├── routes/                    # API endpoints
│   │   ├── health.js             # Health checks with observability
│   │   ├── webhooks.js           # Payment provider integration
│   │   ├── redeem.js             # USD redemption API
│   │   └── por.js                # Proof of reserves API
│   ├── services/                 # Business logic
│   │   ├── mintService.js        # Token minting orchestration
│   │   ├── redeemService.js      # Redemption processing
│   │   ├── signerService.js      # EIP-191 message signing
│   │   └── porPublisher.js       # Reserve monitoring
│   ├── middleware/               # Request processing
│   │   └── correlationId.js      # Distributed tracing
│   ├── utils/                    # Utilities
│   │   ├── logger.js             # Structured logging (Winston)
│   │   ├── metrics.js            # Custom metrics collection
│   │   └── validation.js         # Environment validation
│   └── server.js                 # Express application
│
├── frontend/                      # Frontend Application Layer
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Layout.tsx        # App layout with i18n
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── TokenBalance.tsx  # Web3 balance display
│   │   │   ├── TransferForm.tsx  # Token transfers
│   │   │   ├── RedeemForm.tsx    # USD redemption
│   │   │   ├── ProofOfReserves.tsx # Reserve monitoring
│   │   │   ├── TransactionHistory.tsx # Transaction list
│   │   │   ├── LanguageSwitcher.tsx # I18n language switcher
│   │   │   └── I18nProvider.tsx  # Localization provider
│   │   ├── lib/                  # Frontend utilities
│   │   │   ├── api.ts            # Backend API integration
│   │   │   ├── contracts.ts      # Web3 contract helpers
│   │   │   ├── wagmi.ts          # Web3 configuration
│   │   │   └── i18n.ts           # Internationalization setup
│   │   ├── locales/              # Translation resources
│   │   │   ├── en/               # English translations
│   │   │   │   ├── common.json   # Common terms
│   │   │   │   └── dashboard.json # Dashboard-specific
│   │   │   └── es/               # Spanish translations
│   │   │       ├── common.json   # Common terms
│   │   │       └── dashboard.json # Dashboard-specific
│   │   ├── styles/
│   │   │   └── globals.css       # Tailwind CSS + custom styles
│   │   └── pages/                # Next.js pages
│   │       ├── _app.tsx          # App wrapper with providers
│   │       ├── _document.tsx     # HTML document structure
│   │       └── index.tsx         # Dashboard page
│   ├── public/                   # Static assets
│   ├── next.config.js            # Next.js configuration
│   └── tailwind.config.js        # Tailwind CSS configuration
│
├── prisma/                        # Database Layer
│   ├── schema.prisma             # Database schema definition
│   ├── migrations/               # Database migrations
│   └── seed.js                   # Initial data seeding
│
├── test/                         # Testing Layer
│   ├── C12USDToken.test.js       # Smart contract tests
│   ├── MintRedeemGateway.test.js # Gateway contract tests
│   └── integration/              # Integration tests
│
├── monitoring/                    # Observability Configuration
│   ├── alerting.yaml             # Alert policies
│   └── dashboard.json            # Monitoring dashboard
│
├── deployment/                    # Deployment Configuration
│   ├── docker/                   # Container definitions
│   ├── kubernetes/               # K8s manifests
│   └── terraform/                # Infrastructure as code
│
├── scripts/                      # Automation Scripts
│   ├── deploy.js                 # Contract deployment
│   └── setup.js                  # Environment setup
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This document
│   ├── OBSERVABILITY.md          # Monitoring guide
│   ├── LOCALIZATION.md           # I18n implementation
│   ├── context_engineering.md    # Context optimization guide
│   └── setup.md                  # Development setup
│
├── .env.example                  # Environment template
├── package.json                  # Dependencies and scripts
├── hardhat.config.js             # Blockchain development config
└── README.md                     # Project overview
```

## 🏛 Architecture Layers

### 1. Smart Contracts Layer (Blockchain)
- **C12USDToken**: LayerZero OFT with cross-chain functionality
- **MintRedeemGateway**: Signature-based authorization for minting/redeeming
- **Security**: Role-based access control, circuit breakers, pause functionality
- **Networks**: BSC and Polygon mainnet support

### 2. Backend Services Layer (Node.js + Express)
- **API Gateway**: RESTful endpoints for frontend integration
- **Business Logic**: Mint/redeem orchestration, reserve monitoring
- **Payment Integration**: Stripe and Cash App webhook processing
- **Authentication**: EIP-191 signature verification
- **Database**: PostgreSQL with Prisma ORM

### 3. Frontend Application Layer (Next.js + React)
- **Web3 Integration**: Wagmi + RainbowKit for wallet connectivity
- **User Interface**: Responsive dashboard with Tailwind CSS
- **Internationalization**: English/Spanish support with react-i18next
- **State Management**: React Query for API and contract state
- **Routing**: Next.js App Router with dynamic routes

### 4. Database Layer (PostgreSQL + Prisma)
- **Schema**: Financial data with ACID compliance
- **Models**: Users, receipts, redemptions, reserves, audit logs
- **Migrations**: Version-controlled schema changes
- **Security**: Role-based access with default-deny rules

### 5. Observability Layer (Monitoring + Logging)
- **Structured Logging**: Winston with correlation IDs
- **Metrics Collection**: Custom metrics with Prometheus format
- **Health Monitoring**: Readiness and liveness probes
- **Alerting**: Critical and warning thresholds
- **Dashboards**: Real-time system and business metrics

## 🔄 Data Flow Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Backend   │───▶│  Blockchain │
│  (Next.js)  │    │  (Express)  │    │   (Web3)    │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │            ┌─────────────┐           │
       │           │  Database   │           │
       └──────────▶│ (PostgreSQL)│◀──────────┘
                   └─────────────┘
                          │
                   ┌─────────────┐
                   │ Observability│
                   │ (Monitoring) │
                   └─────────────┘
```

### Request Flow Example: Token Redemption

1. **Frontend**: User submits redemption form
2. **Validation**: Client-side validation with react-hook-form
3. **API Call**: POST to `/api/redeem` with user signature
4. **Backend Processing**:
   - Validate EIP-191 signature
   - Check user limits and balances
   - Create redemption record in database
   - Trigger payment processing
5. **Blockchain Interaction**:
   - Submit burn transaction to contract
   - Wait for confirmation
   - Update database with transaction hash
6. **Response**: Return redemption ID to frontend
7. **Observability**: Log transaction with correlation ID

## 🔐 Security Architecture

### Authentication & Authorization
- **Web3 Wallet**: MetaMask/WalletConnect integration
- **Message Signing**: EIP-191 for API authentication
- **Role-Based Access**: Admin/user permissions
- **API Keys**: Service-to-service authentication

### Smart Contract Security
- **Access Control**: OpenZeppelin role-based permissions
- **Circuit Breakers**: Emergency pause functionality
- **Signature Verification**: ECDSA validation for minting
- **Audit Trails**: Comprehensive event logging

### Infrastructure Security
- **Secret Management**: Environment variables + cloud secrets
- **Network Security**: VPC isolation, firewall rules
- **TLS Encryption**: End-to-end encrypted communications
- **Database Security**: Connection encryption, access controls

## 🌍 Scalability Considerations

### Horizontal Scaling
- **Stateless Services**: Backend designed for multi-instance deployment
- **Database Optimization**: Read replicas, connection pooling
- **CDN Integration**: Static asset delivery
- **Load Balancing**: Multiple backend instances

### Performance Optimization
- **Caching**: Redis for session data and API responses
- **Database Indexing**: Optimized queries with proper indexes
- **Code Splitting**: Frontend bundle optimization
- **Lazy Loading**: On-demand component loading

### Cross-Chain Architecture
- **LayerZero Integration**: Native cross-chain token transfers
- **Multi-Network Support**: BSC and Polygon with easy expansion
- **Gas Optimization**: Efficient contract interactions
- **Bridge Monitoring**: Cross-chain transaction tracking

## 📊 Monitoring & Observability

### Application Metrics
- **Business KPIs**: Mint/redeem volumes, reserve ratios
- **Technical Metrics**: Response times, error rates, throughput
- **Infrastructure**: CPU, memory, disk usage
- **Custom Dashboards**: Real-time visualization

### Logging Strategy
- **Structured Logs**: JSON format with correlation IDs
- **Log Levels**: Debug, info, warn, error with proper routing
- **Centralized Collection**: Cloud logging aggregation
- **Search & Analysis**: Log query and alerting

### Health Monitoring
- **Readiness Probes**: Database connectivity, service health
- **Liveness Probes**: Application responsiveness
- **Dependency Checks**: External service availability
- **SLO Monitoring**: 99.9% uptime targets

## 🚀 Deployment Architecture

### Containerization
- **Docker**: Multi-stage builds for optimization
- **Security**: Non-root containers, minimal base images
- **Registry**: Secure container image storage
- **Scanning**: Vulnerability assessment

### Kubernetes Orchestration
- **Deployments**: Rolling updates, rollback capability
- **Services**: Load balancing and service discovery
- **ConfigMaps/Secrets**: Configuration management
- **Ingress**: TLS termination and routing

### CI/CD Pipeline
- **Testing**: Automated unit, integration, and E2E tests
- **Security**: Static analysis, dependency scanning
- **Deployment**: Staged rollouts with approval gates
- **Monitoring**: Post-deployment validation

## 🔧 Development Workflow

### Local Development
1. **Environment Setup**: Docker Compose for local services
2. **Database**: Local PostgreSQL with test data
3. **Blockchain**: Hardhat network for contract testing
4. **Frontend**: Next.js development server with hot reload

### Testing Strategy
- **Unit Tests**: Jest for business logic
- **Integration Tests**: API endpoint validation
- **Contract Tests**: Hardhat for smart contract testing
- **E2E Tests**: Cypress for user flow validation

### Code Quality
- **Linting**: ESLint for code standards
- **Formatting**: Prettier for consistent style
- **Type Safety**: TypeScript for compile-time validation
- **Security**: Automated vulnerability scanning

This architecture provides a robust, scalable, and maintainable foundation for the C12USD stablecoin platform, with comprehensive observability and security measures throughout the stack.