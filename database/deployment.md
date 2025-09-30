# Database Deployment Instructions

## Prerequisites

1. **PostgreSQL Database**: Version 13+ recommended
   - For development: Use local PostgreSQL or Docker
   - For production: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)

2. **Environment Variables**:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/c12usd?schema=public"
   ```

## Local Development Setup

### Using Docker (Recommended)

1. **Start PostgreSQL container**:
   ```bash
   docker run --name c12usd-postgres \
     -e POSTGRES_DB=c12usd \
     -e POSTGRES_USER=c12usd \
     -e POSTGRES_PASSWORD=development \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Update .env file**:
   ```bash
   DATABASE_URL="postgresql://c12usd:development@localhost:5432/c12usd?schema=public"
   ```

### Manual PostgreSQL Setup

1. **Create database and user**:
   ```sql
   CREATE DATABASE c12usd;
   CREATE USER c12usd WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE c12usd TO c12usd;
   ```

2. **Update connection string** in `.env`

## Database Migration

### Initial Setup

1. **Generate Prisma client**:
   ```bash
   pnpm prisma generate
   ```

2. **Create initial migration**:
   ```bash
   pnpm prisma migrate dev --name init
   ```

3. **Verify migration**:
   ```bash
   pnpm prisma db push
   ```

### Subsequent Migrations

1. **After schema changes**:
   ```bash
   pnpm prisma migrate dev --name describe_your_changes
   ```

2. **Reset database (development only)**:
   ```bash
   pnpm prisma migrate reset
   ```

## Production Deployment

### Pre-deployment Checklist

- [ ] Database backup created
- [ ] Migration script reviewed
- [ ] Rollback plan prepared
- [ ] Security rules verified
- [ ] Performance indexes planned

### Migration Commands

1. **Deploy migrations**:
   ```bash
   pnpm prisma migrate deploy
   ```

2. **Generate production client**:
   ```bash
   pnpm prisma generate
   ```

### Post-deployment Verification

1. **Check schema**:
   ```bash
   pnpm prisma db pull
   ```

2. **Verify indexes**:
   ```sql
   \d+ users
   \d+ mint_receipts
   -- Check all table indexes
   ```

## Database Scripts

### Useful Prisma Commands

```bash
# View database in browser
pnpm prisma studio

# Introspect existing database
pnpm prisma db pull

# Format schema file
pnpm prisma format

# Validate schema
pnpm prisma validate

# Reset database (dev only)
pnpm prisma migrate reset
```

### Performance Monitoring

```sql
-- Monitor query performance
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public';
```

## Backup and Recovery

### Automated Backups

```bash
# Daily backup script
pg_dump -h localhost -U c12usd -d c12usd > backup_$(date +%Y%m%d).sql

# Weekly full backup with compression
pg_dump -h localhost -U c12usd -d c12usd | gzip > weekly_backup_$(date +%Y%m%d).sql.gz
```

### Recovery Process

```bash
# Restore from backup
psql -h localhost -U c12usd -d c12usd < backup_20241001.sql
```

## Security Configuration

### SSL/TLS Setup

```bash
# Production connection string with SSL
DATABASE_URL="postgresql://username:password@hostname:5432/c12usd?sslmode=require&sslcert=client.crt&sslkey=client.key&sslrootcert=ca.crt"
```

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE mint_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_receipts ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY user_own_receipts ON mint_receipts
    FOR ALL USING (user_id = current_setting('app.current_user_id'));
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

```sql
-- Analyze tables weekly
ANALYZE;

-- Vacuum tables daily
VACUUM (ANALYZE, VERBOSE);

-- Reindex monthly
REINDEX DATABASE c12usd;
```

### Performance Metrics

Monitor these key metrics:
- Connection count
- Query execution time
- Lock contention
- Index hit ratio
- Buffer cache hit ratio

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if PostgreSQL is running
2. **Permission denied**: Verify user permissions
3. **Migration failed**: Check for data conflicts
4. **Slow queries**: Analyze query plans and add indexes

### Debug Commands

```bash
# Check Prisma connection
pnpm prisma db execute --stdin < "SELECT 1;"

# View migration history
pnpm prisma migrate status

# Check database connection
psql $DATABASE_URL -c "SELECT version();"
```