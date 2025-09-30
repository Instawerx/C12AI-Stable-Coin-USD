#!/usr/bin/env node

/**
 * C12USD Environment Variables Validation Script
 * Validates all environment variables across development, staging, and production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Required environment variables by category
const requiredEnvVars = {
  blockchain: {
    BSC_RPC: 'BSC RPC endpoint URL',
    POLYGON_RPC: 'Polygon RPC endpoint URL',
    BSC_TOKEN_ADDRESS: 'BSC token contract address',
    BSC_GATEWAY_ADDRESS: 'BSC gateway contract address',
    POLYGON_TOKEN_ADDRESS: 'Polygon token contract address',
    POLYGON_GATEWAY_ADDRESS: 'Polygon gateway contract address',
    LZ_ENDPOINT_BSC: 'LayerZero endpoint for BSC',
    LZ_ENDPOINT_POLYGON: 'LayerZero endpoint for Polygon',
    LZ_EID_BSC: 'LayerZero endpoint ID for BSC',
    LZ_EID_POLYGON: 'LayerZero endpoint ID for Polygon'
  },
  database: {
    DATABASE_URL: 'PostgreSQL connection string'
  },
  payment: {
    STRIPE_SECRET_KEY: 'Stripe secret key',
    STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
    CASHAPP_CLIENT_ID: 'Cash App client ID',
    CASHAPP_CLIENT_SECRET: 'Cash App client secret',
    CASHAPP_ACCESS_TOKEN: 'Cash App access token',
    CASHAPP_WEBHOOK_SECRET: 'Cash App webhook secret'
  },
  security: {
    OPS_SIGNER_PRIVATE_KEY: 'Operations signer private key',
    JWT_SECRET: 'JWT signing secret'
  },
  server: {
    NODE_ENV: 'Node environment (development/staging/production)',
    PORT: 'Server port',
    LOG_LEVEL: 'Logging level',
    CORS_ORIGIN: 'CORS allowed origins'
  },
  monitoring: {
    SENTRY_DSN: 'Sentry error tracking DSN',
    NEW_RELIC_LICENSE_KEY: 'New Relic license key',
    NEW_RELIC_APP_NAME: 'New Relic application name'
  },
  gcp: {
    GCP_PROJECT_ID: 'Google Cloud Project ID',
    GCP_REGION: 'Google Cloud Region',
    GCP_ZONE: 'Google Cloud Zone'
  }
};

// Critical secrets that should NEVER be in plaintext
const criticalSecrets = [
  'OPS_SIGNER_PRIVATE_KEY',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CASHAPP_CLIENT_SECRET',
  'CASHAPP_ACCESS_TOKEN',
  'CASHAPP_WEBHOOK_SECRET'
];

// Test values that should not be in production
const testValues = [
  'test_',
  'example_',
  'placeholder_',
  'REPLACE_',
  'sk_test_',
  'pk_test_',
  '0x0000000000000000000000000000000000000001',
  '0x0000000000000000000000000000000000000002'
];

class EnvValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colorMap = {
      error: colors.red,
      warning: colors.yellow,
      success: colors.green,
      info: colors.blue
    };

    console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);

    switch (type) {
      case 'error':
        this.errors.push(message);
        break;
      case 'warning':
        this.warnings.push(message);
        break;
      default:
        this.info.push(message);
    }
  }

  parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.log(`Environment file not found: ${filePath}`, 'warning');
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};

    content.split('\n').forEach((line, index) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          vars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        } else if (line.includes('=')) {
          this.log(`Malformed line in ${filePath}:${index + 1}: ${line}`, 'warning');
        }
      }
    });

    return vars;
  }

  validateEnvironment(envName, envVars) {
    this.log(`\n=== Validating ${envName.toUpperCase()} Environment ===`, 'info');

    let categoryErrors = 0;
    let categoryWarnings = 0;

    Object.entries(requiredEnvVars).forEach(([category, vars]) => {
      this.log(`\n--- ${category.toUpperCase()} Variables ---`, 'info');

      Object.entries(vars).forEach(([key, description]) => {
        if (!envVars[key]) {
          this.log(`❌ MISSING: ${key} (${description})`, 'error');
          categoryErrors++;
        } else {
          const value = envVars[key];

          // Check for test/placeholder values in production
          if (envName === 'production') {
            const hasTestValue = testValues.some(testVal =>
              value.toLowerCase().includes(testVal.toLowerCase())
            );

            if (hasTestValue) {
              this.log(`❌ PRODUCTION ERROR: ${key} contains test/placeholder value: ${value.substring(0, 20)}...`, 'error');
              categoryErrors++;
            }
          }

          // Check critical secrets
          if (criticalSecrets.includes(key)) {
            if (envName === 'production' && value.length < 32) {
              this.log(`⚠️  WARNING: ${key} appears to be too short for production use`, 'warning');
              categoryWarnings++;
            }

            // Mask secret in logs
            const maskedValue = value.length > 8 ?
              `${value.substring(0, 4)}...${value.substring(value.length - 4)}` :
              '***masked***';
            this.log(`✅ PRESENT: ${key} = ${maskedValue}`, 'success');
          } else {
            this.log(`✅ PRESENT: ${key} = ${value}`, 'success');
          }
        }
      });
    });

    // Check for unexpected variables
    const allRequired = Object.values(requiredEnvVars).reduce((acc, vars) => ({...acc, ...vars}), {});
    const extraVars = Object.keys(envVars).filter(key => !allRequired[key]);

    if (extraVars.length > 0) {
      this.log(`\n--- Additional Variables (${extraVars.length}) ---`, 'info');
      extraVars.forEach(key => {
        this.log(`ℹ️  EXTRA: ${key} = ${envVars[key]}`, 'info');
      });
    }

    return { errors: categoryErrors, warnings: categoryWarnings };
  }

  validateSecretManagerIntegration() {
    this.log(`\n=== Validating Google Cloud Secret Manager Integration ===`, 'info');

    try {
      // Check if gcloud CLI is available
      execSync('gcloud --version', { stdio: 'ignore' });
      this.log('✅ Google Cloud SDK is installed', 'success');

      // Check current project
      const project = execSync('gcloud config get-value project', { encoding: 'utf8' }).trim();
      if (project === 'c12ai-dao') {
        this.log(`✅ Google Cloud project is correctly set: ${project}`, 'success');
      } else {
        this.log(`⚠️  WARNING: Expected project 'c12ai-dao', got '${project}'`, 'warning');
      }

      // List available secrets
      try {
        const secrets = execSync('gcloud secrets list --format="value(name)"', { encoding: 'utf8' });
        const secretList = secrets.trim().split('\n').filter(s => s);

        this.log(`✅ Found ${secretList.length} secrets in Secret Manager:`, 'success');
        secretList.forEach(secret => {
          this.log(`   - ${secret}`, 'info');
        });

        // Check if critical secrets exist
        criticalSecrets.forEach(secretKey => {
          const secretName = secretKey.toLowerCase().replace(/_/g, '-');
          if (secretList.includes(secretName)) {
            this.log(`✅ Critical secret found in Secret Manager: ${secretName}`, 'success');
          } else {
            this.log(`❌ MISSING critical secret in Secret Manager: ${secretName}`, 'error');
          }
        });

      } catch (error) {
        this.log('❌ ERROR: Unable to list secrets. Check permissions.', 'error');
      }

    } catch (error) {
      this.log('❌ ERROR: Google Cloud SDK not found or not authenticated', 'error');
    }
  }

  validateDatabaseConnection(envVars) {
    this.log(`\n=== Validating Database Connection ===`, 'info');

    if (!envVars.DATABASE_URL) {
      this.log('❌ ERROR: DATABASE_URL not found', 'error');
      return;
    }

    try {
      const url = new URL(envVars.DATABASE_URL);

      this.log(`✅ Database URL is valid`, 'success');
      this.log(`   Protocol: ${url.protocol}`, 'info');
      this.log(`   Host: ${url.hostname}`, 'info');
      this.log(`   Port: ${url.port || 'default'}`, 'info');
      this.log(`   Database: ${url.pathname.substring(1)}`, 'info');
      this.log(`   Username: ${url.username}`, 'info');
      this.log(`   Password: ${url.password ? '***masked***' : 'not set'}`, 'info');

      // Validate SSL mode for production
      const params = new URLSearchParams(url.search);
      const sslMode = params.get('sslmode');

      if (envVars.NODE_ENV === 'production' && sslMode !== 'require') {
        this.log('⚠️  WARNING: SSL mode should be "require" for production', 'warning');
      } else if (sslMode === 'require') {
        this.log('✅ SSL mode is correctly set to "require"', 'success');
      }

    } catch (error) {
      this.log(`❌ ERROR: Invalid DATABASE_URL format: ${error.message}`, 'error');
    }
  }

  validateNetworkEndpoints(envVars) {
    this.log(`\n=== Validating Network Endpoints ===`, 'info');

    const networkConfigs = {
      BSC: {
        rpc: envVars.BSC_RPC,
        endpoint: envVars.LZ_ENDPOINT_BSC,
        eid: envVars.LZ_EID_BSC
      },
      POLYGON: {
        rpc: envVars.POLYGON_RPC,
        endpoint: envVars.LZ_ENDPOINT_POLYGON,
        eid: envVars.LZ_EID_POLYGON
      }
    };

    Object.entries(networkConfigs).forEach(([network, config]) => {
      this.log(`\n--- ${network} Network ---`, 'info');

      if (config.rpc) {
        try {
          const url = new URL(config.rpc);
          this.log(`✅ ${network} RPC URL is valid: ${url.hostname}`, 'success');

          // Check if using testnet in production
          if (envVars.NODE_ENV === 'production' &&
              (url.hostname.includes('test') || url.hostname.includes('mumbai'))) {
            this.log(`❌ ERROR: Using testnet RPC in production: ${config.rpc}`, 'error');
          }
        } catch (error) {
          this.log(`❌ ERROR: Invalid ${network} RPC URL: ${config.rpc}`, 'error');
        }
      }

      if (config.endpoint) {
        if (config.endpoint.match(/^0x[a-fA-F0-9]{40}$/)) {
          this.log(`✅ ${network} LayerZero endpoint is valid address format`, 'success');
        } else {
          this.log(`❌ ERROR: Invalid ${network} LayerZero endpoint format`, 'error');
        }
      }

      if (config.eid) {
        const eid = parseInt(config.eid);
        if (eid > 0) {
          this.log(`✅ ${network} LayerZero EID is valid: ${eid}`, 'success');
        } else {
          this.log(`❌ ERROR: Invalid ${network} LayerZero EID: ${config.eid}`, 'error');
        }
      }
    });
  }

  generateReport() {
    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`ENVIRONMENT VALIDATION REPORT`, 'info');
    this.log(`${'='.repeat(60)}`, 'info');

    this.log(`Total Errors: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
    this.log(`Total Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');
    this.log(`Total Info Messages: ${this.info.length}`, 'info');

    if (this.errors.length > 0) {
      this.log(`\n--- CRITICAL ERRORS ---`, 'error');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }

    if (this.warnings.length > 0) {
      this.log(`\n--- WARNINGS ---`, 'warning');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'warning');
      });
    }

    const status = this.errors.length === 0 ? 'PASS' : 'FAIL';
    const statusColor = this.errors.length === 0 ? 'success' : 'error';

    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`OVERALL STATUS: ${status}`, statusColor);
    this.log(`${'='.repeat(60)}`, 'info');

    return this.errors.length === 0;
  }

  async run() {
    this.log('C12USD Environment Variables Validation', 'info');
    this.log(`Started at: ${new Date().toISOString()}`, 'info');

    // Validate each environment
    const environments = {
      development: '.env',
      production: '.env.production'
    };

    let allValid = true;

    Object.entries(environments).forEach(([envName, fileName]) => {
      const filePath = path.join(this.projectRoot, fileName);
      const envVars = this.parseEnvFile(filePath);

      if (Object.keys(envVars).length > 0) {
        const result = this.validateEnvironment(envName, envVars);

        // Additional validations for specific environments
        if (envName === 'production') {
          this.validateDatabaseConnection(envVars);
          this.validateNetworkEndpoints(envVars);
        }

        if (result.errors > 0) {
          allValid = false;
        }
      }
    });

    // Validate Secret Manager integration
    this.validateSecretManagerIntegration();

    // Generate final report
    const isValid = this.generateReport();

    process.exit(isValid ? 0 : 1);
  }
}

// Run the validator if this script is executed directly
if (require.main === module) {
  const validator = new EnvValidator();
  validator.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = EnvValidator;