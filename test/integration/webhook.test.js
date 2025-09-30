const { expect } = require('chai');
const request = require('supertest');
const { ethers } = require('ethers');
const C12USDServer = require('../../src/server');

describe('Webhook Integration Tests', function () {
  let app;
  let server;

  before(async function () {
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/c12usd_test';
    process.env.OPS_SIGNER_PRIVATE_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    process.env.CASHAPP_WEBHOOK_SECRET = 'test_cashapp_secret';
    process.env.BSC_RPC = 'https://bsc-dataseed1.binance.org/';
    process.env.POLYGON_RPC = 'https://polygon-rpc.com/';
    process.env.PILOT_DAILY_MINT_LIMIT = '1000';
    process.env.PILOT_PER_TX_LIMIT = '100';

    // Initialize server
    const serverInstance = new C12USDServer();
    app = await serverInstance.initialize();
    server = serverInstance.app;
  });

  after(async function () {
    // Cleanup
    if (server) {
      await server.close();
    }
  });

  describe('Health Endpoints', function () {
    it('should return health status', async function () {
      const res = await request(server)
        .get('/health')
        .expect(200);

      expect(res.body).to.have.property('status', 'healthy');
      expect(res.body).to.have.property('version');
    });

    it('should return readiness status', async function () {
      const res = await request(server)
        .get('/ready')
        .expect(200);

      expect(res.body).to.have.property('status');
      expect(res.body).to.have.property('checks');
    });
  });

  describe('Stripe Webhooks', function () {
    it('should reject webhook without signature', async function () {
      await request(server)
        .post('/webhooks/stripe')
        .send({ test: 'data' })
        .expect(400);
    });

    it('should reject webhook with invalid signature', async function () {
      await request(server)
        .post('/webhooks/stripe')
        .set('stripe-signature', 'invalid_signature')
        .send({ test: 'data' })
        .expect(400);
    });

    // Note: Full webhook testing would require valid signatures
    // This would be implemented with proper test fixtures
  });

  describe('Cash App Webhooks', function () {
    it('should reject webhook without signature', async function () {
      await request(server)
        .post('/webhooks/cashapp')
        .send({ test: 'data' })
        .expect(400);
    });

    it('should reject webhook with invalid signature', async function () {
      await request(server)
        .post('/webhooks/cashapp')
        .set('x-cashapp-signature', 'invalid_signature')
        .send({ test: 'data' })
        .expect(400);
    });
  });

  describe('API Documentation', function () {
    it('should serve API documentation', async function () {
      const res = await request(server)
        .get('/api/docs')
        .expect(200);

      expect(res.body).to.have.property('name', 'C12USD Backend API');
      expect(res.body).to.have.property('endpoints');
    });
  });

  describe('PoR Endpoints', function () {
    it('should return PoR service status', async function () {
      const res = await request(server)
        .get('/api/por/status')
        .expect(200);

      expect(res.body).to.have.property('service', 'PoR Publisher');
      expect(res.body).to.have.property('isRunning');
    });
  });
});