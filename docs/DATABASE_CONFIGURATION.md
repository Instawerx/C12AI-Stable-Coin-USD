# C12USD Database Configuration Documentation

## Overview
This document details the production database configuration for the C12USD stablecoin project on Google Cloud Platform.

## Database Instances

### Primary Production Database
- **Instance Name**: `c12usd-db-prod`
- **Engine**: PostgreSQL 16
- **Tier**: `db-custom-2-7680` (2 vCPUs, 7.5GB RAM)
- **Region**: `us-central1`
- **Zone**: `us-central1-a`

### Database Access
- **Public IP**: `34.10.34.118`
- **Private IP**: `34.171.213.200`
- **Authorized Networks**: `0.0.0.0/0` (configured for Cloud Run access)

## Database Configuration

### Database Users
- **Application User**: `c12usd_user`
  - **Password**: `C12USD_SecurePass_2024!`
  - **Privileges**: Read/Write access to `c12usd_production` database
  - **Purpose**: Used by the C12USD backend application

### Database Schema
- **Production Database**: `c12usd_production`
- **Character Set**: UTF-8
- **Collation**: Default PostgreSQL collation

## Backup Configuration

### Automated Backups
- **Backup Start Time**: 03:00 UTC (off-peak hours)
- **Backup Retention**: 30 days
- **Point-in-Time Recovery**: Enabled
- **Transaction Log Retention**: 7 days
- **Backup Storage**: Cloud Storage (STANDARD tier)

### Maintenance Windows
- **Day**: Sunday
- **Time**: 04:00 UTC
- **Duration**: Automatic (typically 1-2 hours)

## Monitoring and Alerts

### Notification Channels
- **Email Alerts**: `admin@carnival12.com`
- **Channel ID**: `projects/c12ai-dao/notificationChannels/14643708266912344056`

### Monitoring Metrics
- Database CPU utilization
- Memory usage
- Connection count
- Query performance
- Backup status

## Security Configuration

### Network Security
- **SSL/TLS**: Enforced for all connections
- **Authorized Networks**: Configured for Cloud Run service access
- **Private IP**: Available for VPC-native connections

### Access Control
- **IAM Integration**: Enabled
- **Database Authentication**: PostgreSQL native users
- **Service Account**: `c12usd-production-cloudsql@c12ai-dao.iam.gserviceaccount.com`

## Connection Strings

### Production Connection
```
postgresql://c12usd_user:C12USD_SecurePass_2024!@34.10.34.118:5432/c12usd_production
```

### Environment Variables
```
DATABASE_URL=postgresql://c12usd_user:C12USD_SecurePass_2024!@34.10.34.118:5432/c12usd_production
DB_HOST=34.10.34.118
DB_PORT=5432
DB_NAME=c12usd_production
DB_USER=c12usd_user
DB_PASSWORD=C12USD_SecurePass_2024!
```

## Performance Optimization

### Instance Sizing
- **Current Tier**: `db-custom-2-7680` (cost-optimized for startup)
- **Scaling Strategy**: Monitor usage and scale up as needed
- **Cost Optimization**: Automated backup scheduling during off-peak hours

### Connection Pooling
- **Recommended**: Use PgBouncer or similar for production workloads
- **Max Connections**: Default PostgreSQL limit (100)
- **Connection Timeout**: 30 seconds

## Disaster Recovery

### High Availability
- **Regional Persistence**: us-central1
- **Automatic Failover**: Configured
- **Read Replicas**: Can be added for read scaling

### Backup Strategy
- **Automated Daily Backups**: 03:00 UTC
- **Point-in-Time Recovery**: 7-day window
- **Cross-Region Backup**: Can be configured for additional redundancy

## Cost Management

### Current Configuration Cost Estimate
- **Instance**: ~$50-70/month (db-custom-2-7680)
- **Backup Storage**: ~$5-10/month (depending on data size)
- **Network Egress**: Variable based on traffic

### Cost Optimization Recommendations
1. Monitor actual usage and right-size instance
2. Implement connection pooling to reduce connection overhead
3. Use scheduled backups during off-peak hours
4. Consider read replicas only when read traffic justifies the cost

## Operations

### Regular Maintenance Tasks
1. **Weekly**: Review performance metrics
2. **Monthly**: Analyze backup success rate
3. **Quarterly**: Review and optimize instance sizing
4. **As Needed**: Update security patches (handled automatically)

### Emergency Contacts
- **Primary**: admin@carnival12.com
- **Project**: c12ai-dao
- **Region**: us-central1

## Next Steps

### Immediate Actions Required
1. ✅ Configure authorized networks for Cloud Run access
2. ✅ Create application database user with proper privileges
3. ✅ Set up monitoring and alerting with admin@carnival12.com
4. 🔄 Test database connectivity from Cloud Run service
5. ⏳ Implement connection pooling in application
6. ⏳ Set up additional read replicas if needed

### Future Enhancements
- Implement database encryption at rest (if not already enabled)
- Set up cross-region read replicas for global access
- Implement automated performance tuning
- Add database query monitoring and optimization

---
**Last Updated**: 2025-09-28
**Contact**: admin@carnival12.com
**Project**: C12USD Stablecoin - c12ai-dao