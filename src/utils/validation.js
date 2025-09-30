const logger = require('./logger');

/**
 * Required environment variables for the C12USD backend
 */
const REQUIRED_ENV_VARS = [
  // Database
  { name: 'DATABASE_URL', description: 'PostgreSQL connection string' },

  // Blockchain RPCs
  { name: 'BSC_RPC', description: 'Binance Smart Chain RPC URL' },
  { name: 'POLYGON_RPC', description: 'Polygon RPC URL' },

  // Signing
  { name: 'OPS_SIGNER_PRIVATE_KEY', description: 'Operations signer private key (without 0x)' },

  // Payment processors
  { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret key' },
  { name: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret' },
  { name: 'CASHAPP_CLIENT_ID', description: 'Cash App client ID' },
  { name: 'CASHAPP_CLIENT_SECRET', description: 'Cash App client secret' },
  { name: 'CASHAPP_WEBHOOK_SECRET', description: 'Cash App webhook signing secret' },

  // Contract addresses
  { name: 'BSC_TOKEN_ADDRESS', description: 'C12USD token address on BSC' },
  { name: 'BSC_GATEWAY_ADDRESS', description: 'MintRedeemGateway address on BSC' },
  { name: 'POLYGON_TOKEN_ADDRESS', description: 'C12USD token address on Polygon' },
  { name: 'POLYGON_GATEWAY_ADDRESS', description: 'MintRedeemGateway address on Polygon' },

  // Transaction limits
  { name: 'MAX_TRANSACTION_LIMIT', description: 'Maximum transaction limit in USD (no daily limits)' },

  // PoR settings
  { name: 'POR_UPDATE_INTERVAL_HOURS', description: 'Proof of Reserves update interval in hours' }
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = [
  { name: 'NODE_ENV', default: 'development', description: 'Node environment' },
  { name: 'PORT', default: '3000', description: 'Server port' },
  { name: 'LOG_LEVEL', default: 'info', description: 'Logging level' },
  { name: 'CORS_ORIGIN', default: 'http://localhost:3000', description: 'CORS allowed origins (comma-separated)' },
  { name: 'RATE_LIMIT_WINDOW_MS', default: '900000', description: 'Rate limit window in milliseconds' },
  { name: 'RATE_LIMIT_MAX', default: '1000', description: 'Maximum requests per window' },
  { name: 'JWT_SECRET', default: null, description: 'JWT signing secret (if using authentication)' },
  { name: 'REDIS_URL', default: null, description: 'Redis URL for caching (optional)' }
];

/**
 * Validate all required environment variables are present
 * @returns {Object} Validation result with isValid boolean and errors array
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar.name]) {
      errors.push(`Missing required environment variable: ${envVar.name} (${envVar.description})`);
    }
  }

  // Set defaults for optional variables and warn about important missing ones
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar.name] && envVar.default) {
      process.env[envVar.name] = envVar.default;
      warnings.push(`Using default value for ${envVar.name}: ${envVar.default}`);
    } else if (!process.env[envVar.name] && !envVar.default) {
      warnings.push(`Optional environment variable not set: ${envVar.name} (${envVar.description})`);
    }
  }

  // Additional validations
  if (process.env.OPS_SIGNER_PRIVATE_KEY) {
    const privateKey = process.env.OPS_SIGNER_PRIVATE_KEY;

    // Check if private key starts with 0x (should not)
    if (privateKey.startsWith('0x')) {
      errors.push('OPS_SIGNER_PRIVATE_KEY should not include 0x prefix');
    }

    // Check if private key is the right length (64 hex characters)
    if (privateKey.length !== 64) {
      errors.push('OPS_SIGNER_PRIVATE_KEY should be 64 hex characters (32 bytes)');
    }

    // Check if it's a placeholder
    if (privateKey === '0000000000000000000000000000000000000000000000000000000000000000') {
      errors.push('OPS_SIGNER_PRIVATE_KEY appears to be a placeholder value');
    }
  }

  // Validate URLs
  const urlVars = ['DATABASE_URL', 'BSC_RPC', 'POLYGON_RPC', 'REDIS_URL'];
  for (const urlVar of urlVars) {
    if (process.env[urlVar]) {
      try {
        new URL(process.env[urlVar]);
      } catch (error) {
        if (urlVar !== 'REDIS_URL') { // REDIS_URL is optional
          errors.push(`Invalid URL format for ${urlVar}: ${error.message}`);
        }
      }
    }
  }

  // Validate addresses (should be 42 characters starting with 0x)
  const addressVars = ['BSC_TOKEN_ADDRESS', 'BSC_GATEWAY_ADDRESS', 'POLYGON_TOKEN_ADDRESS', 'POLYGON_GATEWAY_ADDRESS'];
  for (const addressVar of addressVars) {
    if (process.env[addressVar]) {
      const address = process.env[addressVar];
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        errors.push(`Invalid Ethereum address format for ${addressVar}: ${address}`);
      }
    }
  }

  // Validate numeric values
  const numericVars = [
    { name: 'MAX_TRANSACTION_LIMIT', min: 1, max: 1000000 },
    { name: 'POR_UPDATE_INTERVAL_HOURS', min: 1, max: 168 }, // 1 week max
    { name: 'PORT', min: 1, max: 65535 },
    { name: 'RATE_LIMIT_WINDOW_MS', min: 1000, max: 3600000 }, // 1 second to 1 hour
    { name: 'RATE_LIMIT_MAX', min: 1, max: 100000 }
  ];

  for (const numVar of numericVars) {
    if (process.env[numVar.name]) {
      const value = parseInt(process.env[numVar.name], 10);
      if (isNaN(value)) {
        errors.push(`${numVar.name} must be a valid number`);
      } else if (value < numVar.min || value > numVar.max) {
        errors.push(`${numVar.name} must be between ${numVar.min} and ${numVar.max}`);
      }
    }
  }

  // Log results
  if (warnings.length > 0) {
    warnings.forEach(warning => logger.warn(warning));
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:', { errors });
  } else {
    logger.info('Environment validation passed', {
      requiredVars: REQUIRED_ENV_VARS.length,
      optionalVars: OPTIONAL_ENV_VARS.length,
      warnings: warnings.length
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate example .env file content
 */
function generateEnvExample() {
  let content = '# C12USD Backend Environment Configuration\n\n';

  content += '# =================================\n';
  content += '# DATABASE CONFIGURATION\n';
  content += '# =================================\n\n';
  content += '# PostgreSQL connection string\n';
  content += 'DATABASE_URL="postgresql://user:password@localhost:5432/c12usd"\n\n';

  content += '# =================================\n';
  content += '# BLOCKCHAIN CONFIGURATION\n';
  content += '# =================================\n\n';
  content += '# Binance Smart Chain RPC URL\n';
  content += 'BSC_RPC="https://bsc-dataseed1.binance.org/"\n\n';
  content += '# Polygon RPC URL\n';
  content += 'POLYGON_RPC="https://polygon-rpc.com/"\n\n';

  content += '# Contract addresses (deploy contracts first)\n';
  content += 'BSC_TOKEN_ADDRESS="0x0000000000000000000000000000000000000000"\n';
  content += 'BSC_GATEWAY_ADDRESS="0x0000000000000000000000000000000000000000"\n';
  content += 'POLYGON_TOKEN_ADDRESS="0x0000000000000000000000000000000000000000"\n';
  content += 'POLYGON_GATEWAY_ADDRESS="0x0000000000000000000000000000000000000000"\n\n';

  content += '# =================================\n';
  content += '# SECURITY CONFIGURATION\n';
  content += '# =================================\n\n';
  content += '# Operations signer private key (64 hex characters, no 0x prefix)\n';
  content += '# NEVER commit this to git - use environment-specific values\n';
  content += 'OPS_SIGNER_PRIVATE_KEY="0000000000000000000000000000000000000000000000000000000000000000"\n\n';

  content += '# =================================\n';
  content += '# PAYMENT PROCESSOR CONFIGURATION\n';
  content += '# =================================\n\n';
  content += '# Stripe configuration\n';
  content += 'STRIPE_SECRET_KEY="sk_test_..."\n';
  content += 'STRIPE_WEBHOOK_SECRET="whsec_..."\n\n';
  content += '# Cash App configuration\n';
  content += 'CASHAPP_CLIENT_ID="your-client-id"\n';
  content += 'CASHAPP_CLIENT_SECRET="your-client-secret"\n';
  content += 'CASHAPP_WEBHOOK_SECRET="your-webhook-secret"\n\n';

  content += '# =================================\n';
  content += '# TRANSACTION LIMITS\n';
  content += '# =================================\n\n';
  content += '# Maximum transaction limit in USD (no daily limits for USD/stablecoin purchases)\n';
  content += 'MAX_TRANSACTION_LIMIT="1000000"\n\n';

  content += '# =================================\n';
  content += '# PROOF OF RESERVES\n';
  content += '# =================================\n\n';
  content += '# How often to update PoR in hours\n';
  content += 'POR_UPDATE_INTERVAL_HOURS="24"\n\n';

  content += '# =================================\n';
  content += '# SERVER CONFIGURATION (Optional)\n';
  content += '# =================================\n\n';
  content += '# Node environment (development, staging, production)\n';
  content += 'NODE_ENV="development"\n\n';
  content += '# Server port\n';
  content += 'PORT="3000"\n\n';
  content += '# Logging level (error, warn, info, debug)\n';
  content += 'LOG_LEVEL="info"\n\n';
  content += '# CORS allowed origins (comma-separated)\n';
  content += 'CORS_ORIGIN="http://localhost:3000,http://localhost:3001"\n\n';
  content += '# Rate limiting\n';
  content += 'RATE_LIMIT_WINDOW_MS="900000"  # 15 minutes\n';
  content += 'RATE_LIMIT_MAX="1000"\n\n';
  content += '# Redis for caching (optional)\n';
  content += 'REDIS_URL="redis://localhost:6379"\n\n';
  content += '# JWT secret for authentication (if implemented)\n';
  content += 'JWT_SECRET="your-jwt-secret-key"\n';

  return content;
}

/**
 * Check if we're missing critical environment variables and prompt user
 */
function checkEnvironmentOrExit() {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    logger.error('\n🚨 ENVIRONMENT CONFIGURATION REQUIRED 🚨\n');
    logger.error('The following environment variables are missing:\n');

    validation.errors.forEach((error, index) => {
      logger.error(`${index + 1}. ${error}`);
    });

    logger.error('\n📝 To fix this:');
    logger.error('1. Copy .env.example to .env');
    logger.error('2. Fill in the required values');
    logger.error('3. Restart the server');
    logger.error('\n💡 You can generate a template .env.example by running:');
    logger.error('   node -e "console.log(require(\'./src/utils/validation\').generateEnvExample())" > .env.example');

    process.exit(1);
  }
}

module.exports = {
  validateEnvironment,
  generateEnvExample,
  checkEnvironmentOrExit,
  REQUIRED_ENV_VARS,
  OPTIONAL_ENV_VARS
};