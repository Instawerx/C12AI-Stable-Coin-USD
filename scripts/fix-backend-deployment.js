const { execSync } = require('child_process');

console.log('🔧 C12USD Backend Deployment Fix Script');
console.log('=====================================');

// All required environment variables for Cloud Run
const envVars = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://c12usd_user:C12USD_SecurePass_2024!@34.10.34.118:5432/c12usd_production',
  BSC_RPC: 'https://bsc-dataseed1.binance.org/',
  POLYGON_RPC: 'https://polygon-rpc.com/',
  BSC_TOKEN_ADDRESS: '0x6fa920C5c676ac15AF6360D9D755187a6C87bd58',
  BSC_GATEWAY_ADDRESS: '0x8303Ac615266d5b9940b74332503f25D092F5f13',
  POLYGON_TOKEN_ADDRESS: '0xD85F049E881D899Bd1a3600A58A08c2eA4f34811',
  POLYGON_GATEWAY_ADDRESS: '0xF3a23bbebC06435dF16370F879cD808c408f702D',
  STRIPE_SECRET_KEY: 'sk_test_placeholder',
  STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
  CASHAPP_CLIENT_ID: 'placeholder_client_id',
  CASHAPP_CLIENT_SECRET: 'placeholder_client_secret',
  CASHAPP_WEBHOOK_SECRET: 'placeholder_webhook_secret',
  MAX_TRANSACTION_LIMIT: '1000000',
  POR_UPDATE_INTERVAL_HOURS: '24',
  LOG_LEVEL: 'debug'
};

try {
  console.log('📝 Getting OPS_SIGNER_PRIVATE_KEY from Secret Manager...');
  const opsSignerKey = execSync('gcloud secrets versions access latest --secret=ops_signer_key --project=c12ai-dao', { encoding: 'utf8' }).trim();
  envVars.OPS_SIGNER_PRIVATE_KEY = opsSignerKey;
  console.log('✅ Retrieved OPS_SIGNER_PRIVATE_KEY');

  // Build environment variable string
  const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');

  console.log('\n🚀 Updating Cloud Run service with all environment variables...');
  console.log('Environment variables being set:');
  Object.keys(envVars).forEach(key => {
    const value = key.includes('PRIVATE_KEY') ? '[REDACTED]' : envVars[key];
    console.log(`  ${key}=${value}`);
  });

  const updateCommand = `gcloud run services update c12usd-backend-prod \
    --region=us-central1 \
    --project=c12ai-dao \
    --port=8080 \
    --set-env-vars="${envString}" \
    --memory=2Gi \
    --cpu=1 \
    --timeout=600 \
    --max-instances=10 \
    --cpu-boost \
    --execution-environment=gen2`;

  console.log('\n🔄 Executing update command...');
  execSync(updateCommand, { stdio: 'inherit' });

  console.log('\n✅ Cloud Run service updated successfully!');
  console.log('\n🔍 Checking service status...');

  // Wait a moment for the deployment to process
  setTimeout(() => {
    try {
      const statusCommand = 'gcloud run services describe c12usd-backend-prod --region=us-central1 --project=c12ai-dao --format="value(status.url,status.conditions[0].message)"';
      const result = execSync(statusCommand, { encoding: 'utf8' });
      console.log('Service status:', result);
    } catch (error) {
      console.log('Status check failed:', error.message);
    }
  }, 5000);

} catch (error) {
  console.error('❌ Failed to update Cloud Run service:', error.message);
  process.exit(1);
}