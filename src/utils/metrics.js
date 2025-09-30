const logger = require('./logger');

/**
 * In-memory metrics collection for monitoring
 * This could be extended to use Prometheus, StatsD, or other metrics systems
 */
class MetricsCollector {
  constructor() {
    this.metrics = {
      counters: new Map(),
      histograms: new Map(),
      gauges: new Map(),
      timers: new Map()
    };

    this.startTime = Date.now();
  }

  /**
   * Increment a counter metric
   */
  incrementCounter(name, labels = {}, value = 1) {
    const key = this._getKey(name, labels);
    const current = this.metrics.counters.get(key) || 0;
    this.metrics.counters.set(key, current + value);

    logger.debug('Counter incremented', {
      metric: name,
      labels,
      value,
      newTotal: current + value,
      component: 'metrics'
    });
  }

  /**
   * Set a gauge metric (current value)
   */
  setGauge(name, value, labels = {}) {
    const key = this._getKey(name, labels);
    this.metrics.gauges.set(key, {
      value,
      timestamp: Date.now()
    });

    logger.debug('Gauge set', {
      metric: name,
      labels,
      value,
      component: 'metrics'
    });
  }

  /**
   * Record a histogram value (for latencies, sizes, etc.)
   */
  recordHistogram(name, value, labels = {}) {
    const key = this._getKey(name, labels);
    const existing = this.metrics.histograms.get(key) || [];
    existing.push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 values to prevent memory issues
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.metrics.histograms.set(key, existing);

    logger.debug('Histogram recorded', {
      metric: name,
      labels,
      value,
      component: 'metrics'
    });
  }

  /**
   * Start a timer
   */
  startTimer(name, labels = {}) {
    const key = this._getKey(name, labels);
    const timerId = `${key}_${Date.now()}`;

    this.metrics.timers.set(timerId, {
      name,
      labels,
      startTime: Date.now()
    });

    return timerId;
  }

  /**
   * End a timer and record the duration
   */
  endTimer(timerId) {
    const timer = this.metrics.timers.get(timerId);
    if (!timer) {
      logger.warn('Timer not found', { timerId, component: 'metrics' });
      return;
    }

    const duration = Date.now() - timer.startTime;
    this.recordHistogram(`${timer.name}_duration`, duration, timer.labels);
    this.metrics.timers.delete(timerId);

    return duration;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      counters: this._serializeCounters(),
      gauges: this._serializeGauges(),
      histograms: this._serializeHistograms()
    };

    return snapshot;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.counters.clear();
    this.metrics.histograms.clear();
    this.metrics.gauges.clear();
    this.metrics.timers.clear();

    logger.info('Metrics reset', { component: 'metrics' });
  }

  // Private helper methods
  _getKey(name, labels) {
    const labelStr = Object.keys(labels)
      .sort()
      .map(key => `${key}=${labels[key]}`)
      .join(',');

    return labelStr ? `${name}{${labelStr}}` : name;
  }

  _serializeCounters() {
    const result = {};
    for (const [key, value] of this.metrics.counters) {
      result[key] = value;
    }
    return result;
  }

  _serializeGauges() {
    const result = {};
    for (const [key, data] of this.metrics.gauges) {
      result[key] = {
        value: data.value,
        timestamp: new Date(data.timestamp).toISOString()
      };
    }
    return result;
  }

  _serializeHistograms() {
    const result = {};
    for (const [key, values] of this.metrics.histograms) {
      if (values.length === 0) continue;

      const nums = values.map(v => v.value).sort((a, b) => a - b);
      const sum = nums.reduce((acc, val) => acc + val, 0);
      const count = nums.length;

      result[key] = {
        count,
        sum,
        min: nums[0],
        max: nums[nums.length - 1],
        avg: sum / count,
        p50: this._percentile(nums, 0.5),
        p95: this._percentile(nums, 0.95),
        p99: this._percentile(nums, 0.99)
      };
    }
    return result;
  }

  _percentile(sortedArray, percentile) {
    const index = Math.ceil(sortedArray.length * percentile) - 1;
    return sortedArray[Math.max(0, index)];
  }
}

// Create global metrics instance
const metrics = new MetricsCollector();

// Standard application metrics
const ApplicationMetrics = {
  // HTTP metrics
  httpRequests: (method, status, route) =>
    metrics.incrementCounter('http_requests_total', { method, status, route }),

  httpDuration: (method, route, duration) =>
    metrics.recordHistogram('http_request_duration_ms', duration, { method, route }),

  // Business metrics
  mintRequest: (chainId) =>
    metrics.incrementCounter('mint_requests_total', { chain_id: chainId }),

  redeemRequest: (paymentMethod) =>
    metrics.incrementCounter('redeem_requests_total', { payment_method: paymentMethod }),

  webhookReceived: (provider, eventType) =>
    metrics.incrementCounter('webhooks_received_total', { provider, event_type: eventType }),

  // System metrics
  databaseConnections: (count) =>
    metrics.setGauge('database_connections_active', count),

  memoryUsage: () => {
    const usage = process.memoryUsage();
    metrics.setGauge('memory_heap_used_bytes', usage.heapUsed);
    metrics.setGauge('memory_heap_total_bytes', usage.heapTotal);
    metrics.setGauge('memory_rss_bytes', usage.rss);
  },

  // Performance metrics
  databaseQuery: (operation, duration) =>
    metrics.recordHistogram('database_query_duration_ms', duration, { operation }),

  blockchainCall: (network, method, duration) =>
    metrics.recordHistogram('blockchain_call_duration_ms', duration, { network, method })
};

// Collect system metrics every 30 seconds
if (process.env.NODE_ENV !== 'test') {
  setInterval(() => {
    ApplicationMetrics.memoryUsage();
  }, 30000);
}

module.exports = {
  metrics,
  ApplicationMetrics
};