// Initialize Sentry BEFORE importing anything else
const { initializeSentry, Sentry } = require('./utils/sentry');
initializeSentry();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('../generated/prisma');
const { createServer } = require('http');

// Import route modules
const webhookRoutes = require('./routes/webhooks');
const redeemRoutes = require('./routes/redeem');
const healthRoutes = require('./routes/health');
const porRoutes = require('./routes/por');

// Import services
const { startPoRPublisher } = require('./services/porPublisher');
const logger = require('./utils/logger');
const { validateEnvironment } = require('./utils/validation');
const { ApplicationMetrics } = require('./utils/metrics');
const {
  correlationIdMiddleware,
  requestLoggerMiddleware,
  errorLoggerMiddleware
} = require('./middleware/correlationId');

class C12USDServer {
  constructor() {
    this.app = express();
    this.server = null;
    this.prisma = new PrismaClient();
    this.isShuttingDown = false;
  }

  async initialize() {
    // Validate environment variables
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      logger.error('Environment validation failed:', envValidation.errors);
      process.exit(1);
    }

    logger.info('Environment validation passed');

    // Test database connection
    try {
      await this.prisma.$connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      process.exit(1);
    }

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupGracefulShutdown();

    return this;
  }

  setupMiddleware() {
    // Sentry request handler (must be first middleware)
    this.app.use(Sentry.Handlers.requestHandler());

    // Sentry tracing middleware (optional, for performance monitoring)
    this.app.use(Sentry.Handlers.tracingHandler());

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for API
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN ?
        process.env.CORS_ORIGIN.split(',').map(url => url.trim()) :
        ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Observability middleware
    this.app.use(correlationIdMiddleware);
    this.app.use(requestLoggerMiddleware);

    // Metrics middleware
    this.app.use((req, res, next) => {
      const start = Date.now();

      res.on('finish', () => {
        const duration = Date.now() - start;

        // Record HTTP metrics
        ApplicationMetrics.httpRequests(req.method, res.statusCode, req.route?.path || req.path);
        ApplicationMetrics.httpDuration(req.method, req.route?.path || req.path, duration);
      });

      next();
    });

    // Additional logging for debugging (can be removed in production)
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        logger.debug('Incoming request', {
          method: req.method,
          url: req.url,
          correlationId: req.correlationId,
          component: 'request-debug'
        });
        next();
      });
    }

    // Body parsing with webhook support
    this.app.use('/webhooks', express.raw({ type: 'application/json' }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Trust proxy for accurate IP addresses
    this.app.set('trust proxy', 1);
  }

  setupRoutes() {
    // Health check routes
    this.app.use('/', healthRoutes);

    // API routes
    this.app.use('/webhooks', webhookRoutes);
    this.app.use('/api', redeemRoutes);
    this.app.use('/api/por', porRoutes);

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        name: 'C12USD Backend API',
        version: '0.1.0',
        environment: process.env.NODE_ENV,
        endpoints: {
          health: {
            'GET /health': 'Basic health check',
            'GET /ready': 'Readiness check including database'
          },
          webhooks: {
            'POST /webhooks/stripe': 'Stripe payment webhooks',
            'POST /webhooks/cashapp': 'Cash App payment webhooks'
          },
          redeem: {
            'POST /api/redeem': 'Redeem tokens for fiat'
          },
          por: {
            'GET /api/por/latest': 'Latest proof of reserves',
            'POST /api/por/update': 'Update proof of reserves (internal)'
          }
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  setupErrorHandling() {
    // Use our enhanced error logging middleware
    this.app.use(errorLoggerMiddleware);

    // Sentry error handler (must be before any other error middleware)
    this.app.use(Sentry.Handlers.errorHandler());

    // Additional global error handler for uncaught exceptions
    this.app.use((err, req, res, next) => {
      logger.logError(err, {
        component: 'global-error-handler',
        method: req.method,
        url: req.url,
        ip: req.ip
      }, req.correlationId);

      // Record error metrics
      ApplicationMetrics.incrementCounter('errors_total', {
        type: err.name || 'UnknownError',
        endpoint: req.path
      });

      // Don't leak error details in production
      const isDev = process.env.NODE_ENV === 'development';

      res.status(err.status || 500).json({
        error: err.status === 400 ? 'Bad Request' : 'Internal Server Error',
        message: isDev ? err.message : 'An error occurred',
        timestamp: new Date().toISOString(),
        ...(isDev && { stack: err.stack })
      });
    });

    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', {
        promise: promise,
        reason: reason
      });
    });

    // Uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      this.gracefulShutdown();
    });
  }

  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach(signal => {
      process.on(signal, () => {
        logger.info(`Received ${signal}, starting graceful shutdown...`);
        this.gracefulShutdown();
      });
    });
  }

  async gracefulShutdown() {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    logger.info('Starting graceful shutdown...');

    try {
      // Stop accepting new connections
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        logger.info('HTTP server closed');
      }

      // Close database connections
      await this.prisma.$disconnect();
      logger.info('Database disconnected');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  async start() {
    const port = process.env.PORT || 3000;

    this.server = createServer(this.app);

    return new Promise((resolve, reject) => {
      this.server.listen(port, '0.0.0.0', (err) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`🚀 C12USD server running on port ${port}`);
          logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
          logger.info(`🔗 Health check: http://localhost:${port}/health`);
          logger.info(`📚 API docs: http://localhost:${port}/api/docs`);

          // Start background services
          startPoRPublisher();

          resolve(this.server);
        }
      });
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  async function startServer() {
    try {
      const server = new C12USDServer();
      await server.initialize();
      await server.start();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}

module.exports = C12USDServer;