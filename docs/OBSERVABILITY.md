# C12USD Observability Guide

This document describes the comprehensive observability implementation for the C12USD stablecoin system, including structured logging, metrics collection, health monitoring, alerting, and dashboards.

## 🎯 Overview

The C12USD observability stack provides:

- **Structured Logging** with correlation IDs for request tracing
- **Custom Metrics** for business and system monitoring
- **Health Endpoints** for service discovery and load balancing
- **Alerting Policies** for proactive incident response
- **Monitoring Dashboards** for real-time visibility
- **Performance Monitoring** for optimization insights

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Logging &     │───▶│   Monitoring    │
│   (Express.js)  │    │   Metrics       │    │   Backend       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └─────────────▶│  Health Checks  │◀────────────┘
                        └─────────────────┘
                                │
                        ┌─────────────────┐
                        │   Alerting &    │
                        │   Dashboards    │
                        └─────────────────┘
```

## 🔍 Structured Logging

### Implementation

The application uses **Winston** for structured JSON logging with the following features:

- **Correlation IDs**: Every request gets a unique identifier for distributed tracing
- **Component Tagging**: Each log entry includes the originating component
- **Severity Levels**: Error, Warn, Info, Debug with appropriate routing
- **Context Enrichment**: Automatic addition of metadata (IP, user agent, timestamps)

### Log Format

```json
{
  "timestamp": "2024-09-24T15:30:00.000Z",
  "level": "info",
  "message": "HTTP Request",
  "correlationId": "req_1234567890abcdef",
  "method": "POST",
  "url": "/api/redeem",
  "statusCode": 200,
  "duration": "245ms",
  "component": "http-server",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.100"
}
```

### Usage Examples

```javascript
const logger = require('./utils/logger');

// HTTP request logging (automatic via middleware)
logger.logRequest(req, res, duration);

// Business transaction logging
logger.logTransaction('mint', {
  amount: '100.00',
  chainId: 56,
  userWallet: '0x...'
}, req.correlationId);

// Error logging with context
logger.logError(error, {
  component: 'redeem-service',
  userId: user.id
}, req.correlationId);

// Performance monitoring
logger.logPerformance('database_query', 150, {
  query: 'getUserLimits'
}, req.correlationId);

// Security events
logger.logSecurityEvent('suspicious_activity', {
  reason: 'multiple_failed_attempts',
  ip: req.ip
}, req.correlationId);
```

### Log Levels

- **ERROR**: Application errors, failures, exceptions
- **WARN**: Warning conditions, security events, performance issues
- **INFO**: Normal application flow, HTTP requests, business transactions
- **DEBUG**: Detailed debugging information (development only)

## 📈 Metrics Collection

### Custom Metrics System

The application includes a built-in metrics collection system (`src/utils/metrics.js`) that tracks:

#### HTTP Metrics
- Request count by method/status/route
- Response latency percentiles (50th, 95th, 99th)
- Error rates and types

#### Business Metrics
- Mint requests by chain ID
- Redeem requests by payment method
- Webhook events by provider
- Transaction volumes and success rates

#### System Metrics
- Memory usage (heap used/total, RSS)
- Database connection pool status
- Query performance by operation type
- Blockchain call latencies

### Metrics API Endpoints

#### `/metrics` - JSON Format
Comprehensive metrics in JSON format for application monitoring:

```bash
curl http://localhost:3001/metrics
```

```json
{
  "timestamp": "2024-09-24T15:30:00.000Z",
  "database": {
    "total_receipts": 1250,
    "total_redemptions": 890,
    "receipts_24h": 45,
    "redemptions_24h": 32,
    "total_mint_usd": 125000.50,
    "total_redeem_usd": 89750.25,
    "query_duration_ms": 25
  },
  "system": {
    "uptime_seconds": 86400,
    "memory_usage_mb": 245,
    "node_version": "v18.17.0",
    "environment": "production"
  },
  "application": {
    "counters": {
      "http_requests_total{method=GET,status=200,route=/health}": 1450,
      "mint_requests_total{chain_id=56}": 125,
      "redeem_requests_total{payment_method=stripe}": 89
    },
    "histograms": {
      "http_request_duration_ms{method=POST,route=/api/redeem}": {
        "count": 89,
        "sum": 22340,
        "avg": 251.0,
        "p50": 235,
        "p95": 450,
        "p99": 680
      }
    }
  }
}
```

#### `/metrics/prometheus` - Prometheus Format
Metrics in Prometheus format for integration with monitoring systems:

```bash
curl http://localhost:3001/metrics/prometheus
```

```
# HELP c12usd_uptime_seconds Total uptime of the service
# TYPE c12usd_uptime_seconds gauge
c12usd_uptime_seconds 86400

# HELP c12usd_memory_heap_used_bytes Current heap memory usage
# TYPE c12usd_memory_heap_used_bytes gauge
c12usd_memory_heap_used_bytes 256901120

# HELP c12usd_http_requests_total Application counter
# TYPE c12usd_http_requests_total counter
c12usd_http_requests_total{method="GET",status="200",route="/health"} 1450
```

## 🏥 Health Monitoring

### Health Check Endpoints

#### `/health` - Basic Health Check
Lightweight endpoint for load balancer health checks:

```json
{
  "status": "healthy",
  "timestamp": "2024-09-24T15:30:00.000Z",
  "uptime": 86400,
  "version": "0.1.0",
  "environment": "production"
}
```

#### `/ready` - Readiness Check
Comprehensive readiness check including all dependencies:

```json
{
  "timestamp": "2024-09-24T15:30:00.000Z",
  "status": "ready",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": "15ms"
    },
    "memory": {
      "status": "healthy",
      "rss": "256MB",
      "heapUsed": "180MB",
      "heapTotal": "220MB"
    },
    "environment": {
      "status": "healthy",
      "nodeEnv": "production",
      "nodeVersion": "v18.17.0"
    },
    "uptime": {
      "status": "healthy",
      "uptime": 86400,
      "startTime": "2024-09-23T15:30:00.000Z"
    }
  }
}
```

### Kubernetes Health Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

## 🚨 Alerting Configuration

### Alert Policies

The system includes comprehensive alerting policies defined in `monitoring/alerting.yaml`:

#### Critical Alerts
- **Database Down**: Alert when database health check fails
- **High Error Rate**: Alert when error rate > 5% for 5 minutes
- **Reserve Ratio Low**: Alert when reserve ratio < 95%
- **Security Events**: Alert on any security-related events

#### Warning Alerts
- **High Latency**: Alert when 95th percentile latency > 2 seconds
- **Memory Usage**: Alert when memory usage > 80%
- **Volume Anomaly**: Alert on unusual transaction volumes
- **Budget Alert**: Alert when 80% of monthly budget consumed

#### SLO Monitoring
- **Uptime SLO**: Alert when uptime falls below 99%
- **Latency SLO**: Alert when 95th percentile exceeds SLA

### Notification Channels

```yaml
notificationChannels:
  - email-alerts: dev-team@c12ai.com
  - slack-alerts: #c12usd-alerts
  - pager-duty: critical incidents only
  - security-alerts: security@c12ai.com
  - finance-alerts: finance@c12ai.com
```

## 📋 Monitoring Dashboards

### Main Dashboard Components

The monitoring dashboard (`monitoring/dashboard.json`) includes:

1. **HTTP Request Rate**: Real-time request volume
2. **Error Rate %**: Error percentage with threshold alerts
3. **Response Latency**: 95th percentile latency by endpoint
4. **Memory Usage**: Heap memory consumption
5. **Database Connections**: Active connection pool status
6. **Business Metrics**: Mint/redeem request rates
7. **Reserve Ratio**: Real-time collateral ratio monitoring
8. **Webhook Success Rate**: Payment webhook processing
9. **Database Query Performance**: Query latency by operation
10. **Security Events**: Timeline of security-related events

### Dashboard Access

- **Google Cloud Monitoring**: https://console.cloud.google.com/monitoring
- **Custom Dashboard**: Import `monitoring/dashboard.json`
- **Grafana**: Compatible with Prometheus metrics endpoint

## 🔧 Configuration

### Environment Variables

```bash
# Logging Configuration
LOG_LEVEL=info                    # debug, info, warn, error
NODE_ENV=production              # development, production

# Monitoring Configuration
METRICS_ENABLED=true
CORRELATION_ID_HEADER=x-correlation-id

# Health Check Configuration
HEALTH_CHECK_INTERVAL=30s
DATABASE_TIMEOUT=5000

# Alerting Configuration
ALERT_EMAIL=alerts@c12ai.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
PAGERDUTY_INTEGRATION_KEY=your_key_here
```

### Cloud Logging Integration

For Google Cloud deployments:

```javascript
// Add to winston transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}
```

Logs will automatically appear in:
- **Cloud Logging**: https://console.cloud.google.com/logs
- **Log Explorer**: Filter by `resource.type="cloud_run_revision"`

## 📊 Key Performance Indicators (KPIs)

### Availability SLIs/SLOs

- **Availability SLO**: 99.9% uptime (8.77 hours downtime/year)
- **Latency SLO**: 95% of requests < 500ms
- **Error Rate SLO**: < 0.1% error rate

### Business Metrics

- **Mint Success Rate**: > 99.5%
- **Redeem Processing Time**: < 5 minutes average
- **Reserve Ratio**: Always > 100%
- **Webhook Processing**: < 30 seconds end-to-end

### Technical Metrics

- **Database Response Time**: < 100ms for 95% of queries
- **Memory Usage**: < 80% of allocated
- **CPU Usage**: < 70% average

## 🛠 Operational Procedures

### Viewing Logs

#### Development
```bash
# View real-time logs
npm run dev

# View specific component logs
grep "component.*redeem-service" logs/combined.log

# View error logs only
grep "level.*error" logs/error.log
```

#### Production
```bash
# View Cloud Run logs
gcloud logs read --service=c12usd-backend --limit=100

# Follow real-time logs
gcloud logs tail --service=c12usd-backend

# Filter by correlation ID
gcloud logs read --filter='jsonPayload.correlationId="req_1234567890"'

# Search for errors
gcloud logs read --filter='severity>=ERROR' --limit=50
```

### Investigating Issues

#### High Error Rate Alert

1. **Check Error Logs**:
   ```bash
   gcloud logs read --filter='severity=ERROR AND timestamp>="2024-09-24T15:00:00Z"'
   ```

2. **Analyze Metrics**:
   ```bash
   curl https://your-service.com/metrics | jq '.application.counters' | grep error
   ```

3. **Check Dependencies**:
   ```bash
   curl https://your-service.com/ready
   ```

#### Database Performance Issues

1. **Check Query Metrics**:
   ```bash
   curl https://your-service.com/metrics | jq '.application.histograms' | grep database
   ```

2. **Analyze Slow Queries**:
   ```bash
   gcloud logs read --filter='jsonPayload.component="performance" AND jsonPayload.operation~"database"'
   ```

#### Security Event Investigation

1. **View Security Logs**:
   ```bash
   gcloud logs read --filter='jsonPayload.component="security"'
   ```

2. **Analyze Patterns**:
   ```bash
   gcloud logs read --filter='jsonPayload.eventType="suspicious_activity"' --limit=100
   ```

### Performance Optimization

#### Identifying Bottlenecks

1. **Latency Analysis**:
   - Check 95th percentile latencies in dashboard
   - Identify slow endpoints in metrics
   - Analyze correlation between load and latency

2. **Resource Usage**:
   - Monitor memory growth patterns
   - Check CPU usage during peak times
   - Analyze database connection pool utilization

3. **Business Impact**:
   - Monitor mint/redeem success rates
   - Track reserve ratio stability
   - Analyze webhook processing delays

## 🚀 Deployment Integration

### CI/CD Integration

The observability stack integrates with the deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Deploy with Health Checks
  run: |
    # Deploy application
    gcloud run deploy c12usd-backend --image $IMAGE_URL

    # Wait for deployment to be ready
    timeout 300 bash -c 'until curl -f https://your-service.com/ready; do sleep 5; done'

    # Verify metrics endpoint
    curl -f https://your-service.com/metrics/prometheus > /dev/null

    # Set up monitoring
    gcloud monitoring dashboards create --config-from-file=monitoring/dashboard.json
```

### Rollback Procedures

If deployment health checks fail:

```bash
# Check current deployment health
curl https://your-service.com/ready

# View recent error logs
gcloud logs read --service=c12usd-backend --filter='severity>=ERROR' --limit=20

# Rollback to previous version
gcloud run services replace-traffic c12usd-backend --to-revisions=PREVIOUS=100

# Verify rollback health
curl https://your-service.com/health
```

## 📚 Best Practices

### Logging Best Practices

1. **Use Correlation IDs**: Always include correlation IDs for request tracing
2. **Structured Data**: Log in JSON format for better searchability
3. **Appropriate Levels**: Use correct log levels (ERROR for actual errors only)
4. **Sensitive Data**: Never log secrets, keys, or PII
5. **Performance**: Avoid excessive logging in hot code paths

### Metrics Best Practices

1. **Meaningful Names**: Use descriptive metric names with units
2. **Consistent Labels**: Use consistent label naming across metrics
3. **Cardinality Control**: Avoid high-cardinality labels (like user IDs)
4. **Business Focus**: Include business-relevant metrics, not just technical ones
5. **Historical Data**: Preserve historical data for trend analysis

### Alerting Best Practices

1. **Actionable Alerts**: Only alert on conditions requiring human intervention
2. **Alert Fatigue**: Avoid too many low-priority alerts
3. **Clear Context**: Include relevant context in alert messages
4. **Escalation**: Define clear escalation paths for different severity levels
5. **Documentation**: Link alerts to runbooks for resolution steps

## 🔍 Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Check memory metrics
curl https://your-service.com/metrics | jq '.system.memory_usage_mb'

# Analyze heap dump (if needed)
kill -USR2 <nodejs-pid>  # Triggers heap snapshot
```

#### Slow Database Queries
```bash
# Check database query metrics
curl https://your-service.com/metrics | jq '.application.histograms | to_entries | map(select(.key | contains("database")))'

# Enable query logging temporarily
export DEBUG_QUERIES=true
```

#### Missing Correlation IDs
```bash
# Check middleware setup in server.js
grep -n "correlationIdMiddleware" src/server.js

# Verify header forwarding
curl -H "x-correlation-id: test-123" https://your-service.com/health
```

## 📞 Support

### Contact Information

- **Development Team**: dev-team@c12ai.com
- **Security Issues**: security@c12ai.com
- **Infrastructure**: ops@c12ai.com
- **Emergency**: Use PagerDuty escalation

### Resources

- **Runbooks**: `docs/runbooks/`
- **Architecture**: `docs/architecture.md`
- **API Documentation**: `https://your-service.com/api/docs`
- **Status Page**: `https://status.c12ai.com`

---

This observability implementation provides comprehensive monitoring, alerting, and debugging capabilities for the C12USD stablecoin system. Regular review and updates of monitoring configurations ensure continued effectiveness as the system evolves.