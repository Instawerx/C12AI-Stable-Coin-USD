# C12USD Production Deployment Checklist

## 🔍 Pre-Deployment Audit Summary

### ✅ LayerZero Configuration
- **BSC Mainnet**: `0x3c2269811836af69497E5F486A85D7316753cf62` (EID: 30102)
- **Polygon Mainnet**: `0x3c2269811836af69497E5F486A85D7316753cf62` (EID: 30109)
- **Ethereum Mainnet**: `0x1a44076050125825900e736c501f859c50fE728c` (EID: 30101)
- All endpoints verified as official LayerZero V2 addresses

### ✅ Contract Updates Applied
- Updated contract function names (`pilotMint` → `mintWithReceipt`, `pilotBurn` → `burnWithReceipt`)
- New treasury strategy with 100M initial mint
- Transaction limits updated (1M C12USD per transaction)
- Daily limits removed for USD/stablecoin purchases

---

## 🚨 CRITICAL - Replace ALL Placeholder Values

### 🔐 Production Environment Variables (.env.production)

#### **Database Configuration**
```bash
DATABASE_URL="postgresql://c12usd_user:REPLACE_WITH_SECURE_PASSWORD@CLOUD_SQL_PRIVATE_IP:5432/c12usd_production?sslmode=require"
SHADOW_DATABASE_URL="postgresql://c12usd_user:REPLACE_WITH_SECURE_PASSWORD@CLOUD_SQL_PRIVATE_IP:5432/c12usd_shadow?sslmode=require"
```
**Action Required:** Generate secure database passwords, get Cloud SQL IP

#### **Smart Contract Addresses** (Deploy first)
```bash
BSC_TOKEN_ADDRESS=REPLACE_AFTER_DEPLOYMENT
BSC_GATEWAY_ADDRESS=REPLACE_AFTER_DEPLOYMENT
POLYGON_TOKEN_ADDRESS=REPLACE_AFTER_DEPLOYMENT
POLYGON_GATEWAY_ADDRESS=REPLACE_AFTER_DEPLOYMENT
ETH_TOKEN_ADDRESS=REPLACE_AFTER_DEPLOYMENT
ETH_GATEWAY_ADDRESS=REPLACE_AFTER_DEPLOYMENT
```
**Action Required:** Deploy contracts and update with real addresses

#### **Critical Security Keys**
```bash
OPS_SIGNER_PRIVATE_KEY=REPLACE_WITH_PRODUCTION_PRIVATE_KEY
JWT_SECRET=REPLACE_WITH_SECURE_JWT_SECRET
BACKUP_ENCRYPTION_KEY=REPLACE_WITH_BACKUP_ENCRYPTION_KEY
```
**Action Required:** Generate secure private keys (use hardware wallet for ops signer)

#### **Payment Processor Keys**
```bash
# Stripe Production Keys
STRIPE_SECRET_KEY=REPLACE_WITH_PRODUCTION_KEY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_PRODUCTION_WEBHOOK_SECRET
STRIPE_PUBLISHABLE_KEY=REPLACE_WITH_PRODUCTION_PUBLISHABLE_KEY

# Cash App Production Keys
CASHAPP_CLIENT_ID=REPLACE_WITH_PRODUCTION_CLIENT_ID
CASHAPP_CLIENT_SECRET=REPLACE_WITH_PRODUCTION_CLIENT_SECRET
CASHAPP_ACCESS_TOKEN=REPLACE_WITH_PRODUCTION_ACCESS_TOKEN
CASHAPP_WEBHOOK_SECRET=REPLACE_WITH_PRODUCTION_WEBHOOK_SECRET
```
**Action Required:** Setup production Stripe and Cash App accounts

#### **External Service Keys**
```bash
SENTRY_DSN=REPLACE_WITH_SENTRY_DSN
NEW_RELIC_LICENSE_KEY=REPLACE_WITH_NEW_RELIC_KEY
SMTP_USER=REPLACE_WITH_SMTP_USER
SMTP_PASS=REPLACE_WITH_SMTP_PASSWORD
DISCORD_WEBHOOK_URL=REPLACE_WITH_DISCORD_WEBHOOK
SLACK_WEBHOOK_URL=REPLACE_WITH_SLACK_WEBHOOK
```
**Action Required:** Setup monitoring, email, and notification services

---

## 💰 Treasury Wallet Configuration

### Multi-Signature Treasury Setup Required

**Treasury Requirements:**
- **Initial Mint**: 100,000,000 C12USD tokens
- **Multi-sig**: Minimum 3-of-5 signature requirement
- **Hardware Security**: Use hardware wallets for all signers
- **Geographic Distribution**: Signers in different locations
- **Role Separation**: No single person controls majority

**Recommended Treasury Addresses Needed:**
1. **Main Treasury**: Multi-sig for 100M token custody
2. **Operations Wallet**: Daily operations (lower privileges)
3. **Emergency Pause**: Circuit breaker controls
4. **Liquidity Pool**: Initial $100 for each DEX
5. **Reserve Backing**: USD reserves (separate custody)

**Action Required:** Create and configure multi-signature wallets

---

## 📋 Deployment Steps Checklist

### Phase 1: Infrastructure Setup
- [ ] **Setup Google Cloud Project**
  - [ ] Create GCP project: `c12ai-dao`
  - [ ] Enable required APIs (Cloud SQL, IAM, etc.)
  - [ ] Configure VPC and firewall rules

- [ ] **Database Setup**
  - [ ] Deploy Cloud SQL PostgreSQL instance
  - [ ] Create databases: `c12usd_production`, `c12usd_shadow`
  - [ ] Configure SSL certificates
  - [ ] Setup automated backups

- [ ] **Secret Management**
  - [ ] Store all sensitive values in Google Secret Manager
  - [ ] Never store secrets in environment files
  - [ ] Configure service account access

### Phase 2: Treasury & Wallet Setup
- [ ] **Create Multi-Sig Treasury**
  - [ ] Generate 5 hardware wallet addresses
  - [ ] Setup 3-of-5 multi-signature wallet
  - [ ] Test signing and transaction execution
  - [ ] Document recovery procedures

- [ ] **Prepare Initial Liquidity**
  - [ ] Acquire $200 USDC ($100 per chain)
  - [ ] Prepare Uniswap and PancakeSwap pool creation
  - [ ] Calculate initial token ratios

### Phase 3: Contract Deployment
- [ ] **BSC Mainnet Deployment**
  - [ ] Deploy C12USDTokenEnhanced contract
  - [ ] Deploy MintRedeemGateway contract
  - [ ] Execute treasury mint (100M tokens)
  - [ ] Configure contract permissions and roles
  - [ ] Verify contracts on BSCScan

- [ ] **Polygon Mainnet Deployment**
  - [ ] Deploy C12USDTokenEnhanced contract
  - [ ] Deploy MintRedeemGateway contract
  - [ ] Execute treasury mint (100M tokens)
  - [ ] Configure contract permissions and roles
  - [ ] Verify contracts on PolygonScan

- [ ] **Cross-Chain Configuration**
  - [ ] Configure LayerZero peer connections
  - [ ] Set trusted remotes for both chains
  - [ ] Test cross-chain message passing
  - [ ] Verify omnichain functionality

### Phase 4: Initial Liquidity Setup
- [ ] **Create DEX Pools**
  - [ ] PancakeSwap: Add C12USD/USDC liquidity ($100)
  - [ ] Uniswap V3: Add C12USD/USDC liquidity ($100)
  - [ ] Set appropriate fee tiers and ranges
  - [ ] Lock initial liquidity for security

### Phase 5: Backend & API Deployment
- [ ] **Deploy Backend Services**
  - [ ] Deploy webhook servers on Google Cloud Run
  - [ ] Configure payment processor webhooks
  - [ ] Deploy Proof of Reserves publisher
  - [ ] Setup monitoring and alerting

- [ ] **API Configuration**
  - [ ] Configure rate limiting
  - [ ] Setup CORS policies
  - [ ] Enable HTTPS and security headers
  - [ ] Test all endpoints

### Phase 6: Frontend Deployment
- [ ] **Frontend Application**
  - [ ] Deploy React application to CDN
  - [ ] Configure wallet connections
  - [ ] Test mint/redeem/bridge functionality
  - [ ] Verify dashboard metrics

### Phase 7: Testing & Validation
- [ ] **End-to-End Testing**
  - [ ] Test USD deposit → C12USD mint flow
  - [ ] Test C12USD redeem → USD withdrawal flow
  - [ ] Test cross-chain transfers (BSC ↔ Polygon)
  - [ ] Test flash loan functionality
  - [ ] Verify all security controls

- [ ] **Load Testing**
  - [ ] Stress test backend services
  - [ ] Verify database performance
  - [ ] Test high-volume scenarios
  - [ ] Monitor gas usage patterns

---

## 🔒 Security Checklist

### Smart Contract Security
- [ ] **Audit Reports**
  - [ ] Complete 2+ independent security audits
  - [ ] Address all critical and high-risk findings
  - [ ] Publish audit reports publicly
  - [ ] Setup continuous security monitoring

- [ ] **Access Controls**
  - [ ] Verify all role assignments
  - [ ] Test emergency pause functionality
  - [ ] Validate circuit breaker mechanisms
  - [ ] Confirm multi-signature requirements

### Operational Security
- [ ] **Key Management**
  - [ ] All production keys in hardware wallets
  - [ ] Secure backup and recovery procedures
  - [ ] Geographic distribution of signers
  - [ ] Regular key rotation schedule

- [ ] **Infrastructure Security**
  - [ ] Enable all GCP security features
  - [ ] Configure VPC firewall rules
  - [ ] Setup intrusion detection
  - [ ] Enable comprehensive audit logging

---

## 📊 Post-Deployment Monitoring

### Technical Monitoring
- [ ] **Smart Contract Events**
  - [ ] Monitor all mint/burn operations
  - [ ] Track flash loan usage and fees
  - [ ] Alert on circuit breaker activations
  - [ ] Monitor cross-chain message delivery

- [ ] **System Health**
  - [ ] Backend service uptime monitoring
  - [ ] Database performance metrics
  - [ ] Payment processor webhook delivery
  - [ ] LayerZero message success rates

### Financial Monitoring
- [ ] **Reserve Tracking**
  - [ ] Real-time USD reserve balance
  - [ ] Automated over-collateralization alerts
  - [ ] Daily reconciliation procedures
  - [ ] Monthly third-party attestation

- [ ] **Token Metrics**
  - [ ] Circulating supply tracking
  - [ ] DEX liquidity monitoring
  - [ ] Flash loan volume and fees
  - [ ] Cross-chain transfer volumes

---

## 🚨 Emergency Procedures

### Circuit Breaker Activation
1. **Immediate Actions**
   - Pause all mint/redeem operations
   - Disable flash loans
   - Block cross-chain transfers
   - Notify all stakeholders

2. **Investigation Protocol**
   - Identify root cause
   - Assess financial impact
   - Document incident timeline
   - Coordinate with auditors if needed

3. **Recovery Process**
   - Address underlying issue
   - Multi-sig approval for restart
   - Gradual re-activation
   - Post-incident review

### Emergency Contacts
- **Technical Team**: [Contact Information]
- **Treasury Signers**: [Contact Information]
- **Legal Counsel**: [Contact Information]
- **Audit Partners**: [Contact Information]

---

## ✅ Go-Live Checklist

### Final Validation (Complete ALL items)
- [ ] All placeholder values replaced with production values
- [ ] Treasury multi-sig wallet created and tested
- [ ] Contracts deployed and verified on both chains
- [ ] Initial liquidity provided to DEX pools
- [ ] Backend services deployed and monitored
- [ ] Frontend application live and functional
- [ ] End-to-end user journey tested
- [ ] Emergency procedures documented and tested
- [ ] Team trained on operational procedures
- [ ] Monitoring and alerting systems active

### Launch Approval Required
- [ ] **Technical Lead Sign-off**: ___________________
- [ ] **Security Lead Sign-off**: ___________________
- [ ] **Treasury Manager Sign-off**: ___________________
- [ ] **Legal/Compliance Sign-off**: ___________________

---

## 📞 Support Information

**Technical Support**: technical@c12usd.com
**Documentation**: https://docs.c12usd.com
**Status Page**: https://status.c12usd.com
**GitHub Issues**: https://github.com/c12ai-dao/c12usd/issues

---

**Last Updated**: January 2025
**Version**: 1.0
**Next Review**: Pre-Launch