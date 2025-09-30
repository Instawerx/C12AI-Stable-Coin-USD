# C12USD Database Security Rules

This document outlines the security rules and access patterns for the C12USD database.

## Rule Version
Version: 2

## Default Policy
**DENY ALL BY DEFAULT** - All database access is denied unless explicitly allowed.

## Access Control Rules

### User Records
- **Read**: Users can only read their own user record
- **Write**: Users can only update their own email (address is immutable)
- **Admin**: System admins can read all user records for compliance

### Mint Receipts
- **Read**: Users can read their own mint receipts only
- **Write**: Only the signer service can create mint receipts
- **Update**: Only the signer service can update receipt status and blockchain data
- **Admin**: Compliance officers can read all mint receipts

### Redeem Receipts
- **Read**: Users can read their own redeem receipts only
- **Write**: Users can create redeem requests; only signer service can complete them
- **Update**: Only the signer service can update receipt status and payout data
- **Admin**: Compliance officers can read all redeem receipts

### Reserve Snapshots
- **Read**: Public read access for current snapshot (transparency)
- **Write**: Only the PoR publisher service can create snapshots
- **Historical**: Full historical data requires admin access

### Audit Logs
- **Read**: No user access; admin-only for compliance
- **Write**: Only system services can create audit logs
- **Retention**: Logs must be retained for 7 years for regulatory compliance

### System Config
- **Read**: Some config values are public (limits, fees)
- **Write**: Only system administrators can modify configuration
- **Audit**: All config changes must be logged

## Role-Based Access

### Anonymous Users
- Can read current reserve snapshot
- Can read public system configuration

### Authenticated Users
- Can read their own user record, mint receipts, and redeem receipts
- Can create redeem requests
- Can update their email address

### Signer Service
- Can create and update mint receipts
- Can update redeem receipts with blockchain data
- Can create audit logs for signing operations

### PoR Publisher Service
- Can create reserve snapshots
- Can read all necessary data for PoR calculations
- Can create audit logs for PoR operations

### Compliance Officers
- Can read all user data and transaction history
- Can read all audit logs
- Cannot modify any transactional data

### System Administrators
- Can modify system configuration
- Can manage user accounts in emergency situations
- All admin actions are audited

## Data Encryption

### At Rest
- All sensitive data encrypted using AES-256
- Database connections use TLS 1.3
- Payment data (Stripe/Cash App IDs) are encrypted

### In Transit
- All API connections require TLS 1.3
- No plain HTTP allowed
- Certificate pinning for all external integrations

## Compliance Requirements

### Data Retention
- Transaction records: 7 years minimum
- Audit logs: 7 years minimum
- User data: Until account deletion + 1 year

### Data Privacy
- Users can request data export (GDPR/CCPA)
- Users can request account deletion (with transaction history preserved)
- Geographic data restrictions enforced

### Audit Requirements
- All data access must be logged
- Failed authentication attempts logged
- Database schema changes require approval
- Regular security audits mandatory