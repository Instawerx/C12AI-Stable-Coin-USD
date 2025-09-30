const winston = require('winston');

// Import Sentry utilities (will be null if not initialized)
let sentryUtils;
try {
  sentryUtils = require('./sentry');
} catch (error) {
  sentryUtils = null;
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

// Create custom format
const format = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.colorize({ all: true })
);

// Create console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return log;
  })
);

// Create transports
const transports = [];

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: consoleFormat
    })
  );
}

// File transport for production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: process.env.LOG_LEVEL || 'info',
      format: format,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// Always add console in production for container logs
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  levels,
  format,
  transports,
  exitOnError: false
});

// Add custom methods for structured logging with correlation IDs
logger.logRequest = (req, res, duration) => {
  const correlationId = req.correlationId || req.headers['x-correlation-id'] || req.headers['x-request-id'];
  logger.info('HTTP Request', {
    correlationId,
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    component: 'http-server'
  });
};

logger.logTransaction = (type, data, correlationId) => {
  logger.info(`Transaction: ${type}`, {
    correlationId,
    transactionType: type,
    component: 'transaction',
    ...data
  });
};

logger.logWebhook = (provider, eventType, data, correlationId) => {
  logger.info(`Webhook: ${provider}`, {
    correlationId,
    provider,
    eventType,
    component: 'webhook',
    ...data
  });
};

logger.logError = (error, context = {}, correlationId) => {
  logger.error('Error occurred', {
    correlationId,
    message: error.message,
    stack: error.stack,
    component: context.component || 'unknown',
    ...context
  });

  // Also send critical errors to Sentry
  if (sentryUtils && (error.severity === 'high' || context.financial || context.critical)) {
    sentryUtils.captureFinancialError(error, {
      ...context,
      correlationId,
      severity: error.severity || 'medium'
    });
  }
};

logger.logPerformance = (operation, duration, metadata = {}, correlationId) => {
  logger.info(`Performance: ${operation}`, {
    correlationId,
    operation,
    duration: `${duration}ms`,
    component: 'performance',
    ...metadata
  });
};

logger.logSecurityEvent = (eventType, details, correlationId) => {
  logger.warn(`Security Event: ${eventType}`, {
    correlationId,
    eventType,
    component: 'security',
    ...details
  });
};

module.exports = logger;