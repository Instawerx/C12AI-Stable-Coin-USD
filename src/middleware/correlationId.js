const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Correlation ID middleware to add unique request tracking
 */
function correlationIdMiddleware(req, res, next) {
  // Check for existing correlation ID in headers
  const existingId = req.headers['x-correlation-id'] || req.headers['x-request-id'];

  // Generate new ID if none exists
  const correlationId = existingId || uuidv4();

  // Add to request object
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Store in async local storage context (for deeper tracing)
  req.context = { correlationId };

  next();
}

/**
 * Request logging middleware with performance timing
 */
function requestLoggerMiddleware(req, res, next) {
  const startTime = Date.now();

  // Log request start
  logger.info('Request started', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    component: 'http-server'
  });

  // Override res.end to capture response timing
  const originalEnd = res.end;

  res.end = function(chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - startTime;

    // Log request completion
    logger.logRequest(req, res, duration);

    // Call original end method
    originalEnd.call(res, chunk, encoding);
  };

  next();
}

/**
 * Error logging middleware
 */
function errorLoggerMiddleware(err, req, res, next) {
  logger.logError(err, {
    component: 'error-handler',
    method: req.method,
    url: req.url,
    ip: req.ip
  }, req.correlationId);

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      correlationId: req.correlationId,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = {
  correlationIdMiddleware,
  requestLoggerMiddleware,
  errorLoggerMiddleware
};