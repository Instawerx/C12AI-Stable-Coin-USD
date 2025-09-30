const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

/**
 * Initialize Sentry for C12USD Backend
 * Configured specifically for financial applications with enhanced security
 */
function initializeSentry() {
  Sentry.init({
    // DSN from environment variable
    dsn: process.env.SENTRY_DSN,

    // Environment configuration
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || 'c12usd-backend@0.1.0',

    // Server configuration
    serverName: process.env.SERVER_NAME || 'c12usd-backend',

    // Integrations for Node.js and performance monitoring
    integrations: [
      // HTTP integration for Express
      new Sentry.Integrations.Http({ tracing: true }),

      // Express integration
      new Sentry.Integrations.Express({ app: undefined }), // Will be set later

      // Node.js profiling (optional, for performance insights)
      nodeProfilingIntegration(),

      // Database integration (Prisma)
      new Sentry.Integrations.Prisma({ client: undefined }), // Will be set after Prisma init
    ],

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Security and privacy settings for financial applications
    beforeSend(event, hint) {
      return sanitizeErrorData(event, hint);
    },

    beforeBreadcrumb(breadcrumb) {
      return sanitizeBreadcrumb(breadcrumb);
    },

    // Error filtering - don't send certain errors to Sentry
    beforeSendTransaction(event) {
      // Skip health check transactions
      if (event.transaction?.includes('/health') || event.transaction?.includes('/ready')) {
        return null;
      }
      return sanitizeTransactionData(event);
    },

    // Tag configuration for better organization
    initialScope: {
      tags: {
        component: 'backend',
        service: 'c12usd-stablecoin',
        blockchain: 'multi-chain'
      }
    },

    // Enhanced error capture
    captureUnhandledRejections: true,
    captureUncaughtExceptions: true,

    // Request data - be careful with financial data
    sendDefaultPii: false, // CRITICAL: Never send PII in financial apps
    maxBreadcrumbs: 50,
    maxValueLength: 1000,

    // Debug mode (only in development)
    debug: process.env.NODE_ENV === 'development',
  });
}

/**
 * Sanitize error data before sending to Sentry
 * Removes sensitive financial and crypto data
 */
function sanitizeErrorData(event, hint) {
  // Don't send events in test environment
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  // Remove sensitive headers
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['x-api-key'];
    delete event.request.headers['stripe-signature'];
    delete event.request.headers['x-cashapp-signature'];
    delete event.request.headers['cookie'];
  }

  // Sanitize request data
  if (event.request?.data) {
    event.request.data = sanitizeObject(event.request.data);
  }

  // Sanitize extra data
  if (event.extra) {
    event.extra = sanitizeObject(event.extra);
  }

  // Add custom tags for financial operations
  if (event.tags) {
    // Detect financial operation types
    const url = event.request?.url || '';
    const message = event.message || event.exception?.values?.[0]?.value || '';

    if (url.includes('/webhooks') || message.includes('webhook')) {
      event.tags.operation_type = 'webhook';
    } else if (url.includes('/redeem') || message.includes('redeem')) {
      event.tags.operation_type = 'redeem';
    } else if (message.includes('mint') || message.includes('Mint')) {
      event.tags.operation_type = 'mint';
    } else if (message.includes('layerzero') || message.includes('LayerZero')) {
      event.tags.operation_type = 'cross_chain';
    } else if (url.includes('/por') || message.includes('proof')) {
      event.tags.operation_type = 'proof_of_reserves';
    }

    // Detect payment providers
    if (message.includes('stripe') || message.includes('Stripe')) {
      event.tags.payment_provider = 'stripe';
    } else if (message.includes('cashapp') || message.includes('Cash App')) {
      event.tags.payment_provider = 'cashapp';
    }

    // Detect blockchain networks
    if (message.includes('BSC') || message.includes('56')) {
      event.tags.blockchain_network = 'bsc';
    } else if (message.includes('Polygon') || message.includes('137')) {
      event.tags.blockchain_network = 'polygon';
    }
  }

  return event;
}

/**
 * Sanitize breadcrumb data
 */
function sanitizeBreadcrumb(breadcrumb) {
  // Skip noisy breadcrumbs
  if (breadcrumb.category === 'http' && breadcrumb.data?.url?.includes('/health')) {
    return null;
  }

  // Sanitize breadcrumb data
  if (breadcrumb.data) {
    breadcrumb.data = sanitizeObject(breadcrumb.data);
  }

  return breadcrumb;
}

/**
 * Sanitize transaction data
 */
function sanitizeTransactionData(event) {
  // Add performance context
  if (event.contexts?.trace?.op) {
    event.tags = event.tags || {};
    event.tags.trace_operation = event.contexts.trace.op;
  }

  return event;
}

/**
 * Recursively sanitize objects to remove sensitive data
 */
function sanitizeObject(obj, depth = 0) {
  if (!obj || depth > 5) return obj; // Prevent infinite recursion

  const sensitiveKeys = [
    // Crypto and blockchain
    'privateKey', 'private_key', 'mnemonic', 'seed',
    'signature', 'publicKey', 'public_key',

    // API keys and tokens
    'apiKey', 'api_key', 'token', 'accessToken', 'access_token',
    'refreshToken', 'refresh_token', 'secret', 'webhook_secret',

    // Financial data
    'bankAccount', 'bank_account', 'accountNumber', 'account_number',
    'routingNumber', 'routing_number', 'ssn', 'social_security',
    'creditCard', 'credit_card', 'cardNumber', 'card_number',
    'cvv', 'cvc', 'expiryDate', 'expiry_date',

    // Personal information
    'password', 'pin', 'email', 'phone', 'address',
    'firstName', 'first_name', 'lastName', 'last_name',
    'dateOfBirth', 'date_of_birth',

    // Payment provider data
    'stripe_signature', 'cashapp_signature',
    'payment_method', 'customer_id'
  ];

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Custom error handler for financial operations
 */
function captureFinancialError(error, context = {}) {
  Sentry.withScope((scope) => {
    // Add financial operation context
    scope.setTag('error_category', 'financial');
    scope.setLevel('error');

    // Add operation context
    if (context.operation) {
      scope.setTag('financial_operation', context.operation);
    }

    if (context.amount) {
      scope.setContext('transaction', {
        amount_usd: context.amount,
        currency: 'USD'
      });
    }

    if (context.wallet) {
      scope.setContext('wallet', {
        address: context.wallet.substring(0, 6) + '...' + context.wallet.substring(-4) // Partially mask wallet
      });
    }

    if (context.chainId) {
      scope.setTag('chain_id', context.chainId.toString());
    }

    if (context.provider) {
      scope.setTag('payment_provider', context.provider);
    }

    // Set user context (without PII)
    if (context.userId) {
      scope.setUser({ id: context.userId });
    }

    // Add extra context
    Object.keys(context).forEach(key => {
      if (!['operation', 'amount', 'wallet', 'chainId', 'provider', 'userId'].includes(key)) {
        scope.setExtra(key, context[key]);
      }
    });

    Sentry.captureException(error);
  });
}

/**
 * Capture custom financial events
 */
function captureFinancialEvent(message, level = 'info', context = {}) {
  Sentry.withScope((scope) => {
    scope.setTag('event_category', 'financial');
    scope.setLevel(level);

    if (context.operation) {
      scope.setTag('financial_operation', context.operation);
    }

    Object.keys(context).forEach(key => {
      scope.setExtra(key, context[key]);
    });

    Sentry.captureMessage(message);
  });
}

/**
 * Performance monitoring for critical financial operations
 */
function startFinancialTransaction(name, op = 'financial') {
  return Sentry.startTransaction({
    name,
    op,
    tags: {
      category: 'financial'
    }
  });
}

module.exports = {
  initializeSentry,
  captureFinancialError,
  captureFinancialEvent,
  startFinancialTransaction,
  Sentry
};