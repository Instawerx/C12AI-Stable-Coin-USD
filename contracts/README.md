# C12USD Smart Contracts

This directory contains the smart contracts for the C12USD stablecoin project.

## Contracts

### C12USDToken.sol
The main stablecoin contract implementing:
- **LayerZero OFT**: Cross-chain functionality using LayerZero's Omnichain Fungible Token standard
- **Role-based Access Control**: Separate roles for minting, burning, pausing, and circuit breaker operations
- **Circuit Breaker**: Emergency stop mechanism for security
- **Pilot Phase Limits**: Maximum supply of 100 USD worth of tokens for initial testing
- **Security Features**: Pausable transfers and reentrancy protection

Key features:
- ERC-20 compatible with cross-chain transfers
- Only authorized roles can mint/burn tokens
- Circuit breaker can pause all operations in emergencies
- Built-in supply cap for pilot phase

### MintRedeemGateway.sol
Gateway contract for secure mint/redeem operations:
- **Signature-based Authorization**: All operations require signed receipts from off-chain services
- **Nonce Protection**: Prevents replay attacks using unique nonces
- **Time-based Expiry**: Receipts expire after a set time
- **Role-based Access**: Separate signer and admin roles

Key features:
- Secure mint operations based on verified fiat deposits
- Secure redeem operations with signed burn authorizations
- Integration with payment processors (Stripe, Cash App)
- Comprehensive audit trail through events

## Architecture

The C12USD system uses a gateway pattern where:

1. **Off-chain Services** verify fiat payments and generate signed receipts
2. **MintRedeemGateway** validates signatures and executes operations
3. **C12USDToken** handles the actual minting/burning of tokens
4. **LayerZero** enables cross-chain transfers between BSC and Polygon

## Security Model

- **Multi-signature Wallet**: All admin operations require DAO approval
- **Role Separation**: Different keys for different operations
- **Circuit Breaker**: Can halt all operations if issues are detected
- **Time Locks**: Critical operations have time delays
- **Audit Logs**: All operations emit detailed events

## Deployment

See `scripts/deploy.js` for deployment configuration. The script:
- Deploys both contracts with proper initialization
- Sets up role permissions
- Configures LayerZero endpoints
- Saves deployment addresses for verification

## Testing

Contracts are designed to work with:
- **Local Development**: Hardhat network with mock LayerZero endpoint
- **Testnets**: BSC Testnet and Polygon Mumbai for integration testing
- **Mainnets**: BSC and Polygon for production deployment

## Integration

These contracts integrate with:
- **Database Layer**: PostgreSQL with transaction records
- **Payment Processors**: Stripe and Cash App for fiat rails
- **Monitoring**: Chainlink Proof of Reserve for solvency verification
- **Frontend**: Web3 interface for user interactions

## Compliance

The contracts implement:
- **Regulatory Compliance**: All operations are logged and auditable
- **KYC/AML Integration**: User verification through off-chain services
- **Geographic Restrictions**: Enforced through the gateway layer
- **Reporting**: Comprehensive transaction history and metrics