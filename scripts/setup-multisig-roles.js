// Multi-Sig Role Setup Script
// Easy configuration script for assigning roles to multi-sig wallets

const { ethers } = require("hardhat");
const { RoleManager, DEFAULT_MULTISIG_CONFIG } = require('./role-management');

// ═══════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION SECTION - UPDATE THESE ADDRESSES
// ═══════════════════════════════════════════════════════════════

const MULTISIG_CONFIG = {
  // 🏦 TREASURY MULTI-SIG (Admin - highest privileges)
  // Controls: Admin functions, flash loan parameters, major decisions
  treasury: "0x7903c63CB9f42284d03BC2a124474760f9C1390b", // Admin Multi-Sig

  // 🛠️ OPERATIONS MULTI-SIG (Treasurer - operational functions)
  // Controls: Daily minting/burning operations
  operations: "0x86111914504B82eF1c487241124C02f9D09325C4", // Treasurer Multi-Sig

  // 🛡️ SECURITY MULTI-SIG (BU Operator - security functions)
  // Controls: Emergency pausing, circuit breaker
  security: "0x77cbC45415d570Ff6BD672c784a86d8951501B19", // BU Operator Multi-Sig

  // 🚨 EMERGENCY CONTACT (Treasurer for emergency response)
  // Emergency response for critical situations
  emergency: "0x86111914504B82eF1c487241124C02f9D09325C4", // Treasurer as emergency contact

  // 🤖 AUTOMATED SIGNER (BU Operator for automated backend)
  // Handles automated mint/redeem signatures
  automatedSigner: "0x77cbC45415d570Ff6BD672c784a86d8951501B19", // BU Operator for automation

  // 👤 BACKUP OPERATOR (Admin as backup)
  // Backup for automated service
  backupOperator: "0x7903c63CB9f42284d03BC2a124474760f9C1390b", // Admin as backup operator
};

// ═══════════════════════════════════════════════════════════════
// 📋 CONTRACT ADDRESSES (Set via environment or update here)
// ═══════════════════════════════════════════════════════════════

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS || "0x0000000000000000000000000000000000000000";

async function validateConfiguration() {
  console.log("🔍 VALIDATING CONFIGURATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  let errors = [];

  // Check contract addresses
  if (TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    errors.push("❌ TOKEN_ADDRESS not set (use environment variable or update script)");
  }

  if (GATEWAY_ADDRESS === "0x0000000000000000000000000000000000000000") {
    errors.push("❌ GATEWAY_ADDRESS not set (use environment variable or update script)");
  }

  // Check multi-sig addresses
  const requiredRoles = ['treasury', 'operations', 'security'];
  for (const role of requiredRoles) {
    if (MULTISIG_CONFIG[role] === "0x0000000000000000000000000000000000000000") {
      errors.push(`❌ ${role} multi-sig address not configured`);
    }
  }

  if (errors.length > 0) {
    console.log("\n🚫 CONFIGURATION ERRORS:");
    errors.forEach(error => console.log(`   ${error}`));
    console.log("\n📖 Please update the configuration section in this script");
    console.log("💡 Or set environment variables: TOKEN_ADDRESS and GATEWAY_ADDRESS");
    return false;
  }

  console.log("✅ Configuration validation passed");
  return true;
}

async function displayRoleAssignmentPlan() {
  console.log("\n📋 ROLE ASSIGNMENT PLAN");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n🪙 C12USD TOKEN ROLES:");
  console.log(`   DEFAULT_ADMIN_ROLE → Treasury: ${MULTISIG_CONFIG.treasury}`);
  console.log(`   MINTER_ROLE → Operations: ${MULTISIG_CONFIG.operations}`);
  console.log(`   MINTER_ROLE → Automated: ${MULTISIG_CONFIG.automatedSigner}`);
  console.log(`   BURNER_ROLE → Operations: ${MULTISIG_CONFIG.operations}`);
  console.log(`   BURNER_ROLE → Automated: ${MULTISIG_CONFIG.automatedSigner}`);
  console.log(`   PAUSER_ROLE → Security: ${MULTISIG_CONFIG.security}`);
  console.log(`   PAUSER_ROLE → Emergency: ${MULTISIG_CONFIG.emergency}`);
  console.log(`   CIRCUIT_BREAKER_ROLE → Security: ${MULTISIG_CONFIG.security}`);
  console.log(`   CIRCUIT_BREAKER_ROLE → Emergency: ${MULTISIG_CONFIG.emergency}`);
  console.log(`   FLASH_LOAN_ADMIN_ROLE → Treasury: ${MULTISIG_CONFIG.treasury}`);

  console.log("\n🚪 MINT/REDEEM GATEWAY ROLES:");
  console.log(`   DEFAULT_ADMIN_ROLE → Treasury: ${MULTISIG_CONFIG.treasury}`);
  console.log(`   SIGNER_ROLE → Automated: ${MULTISIG_CONFIG.automatedSigner}`);
  console.log(`   SIGNER_ROLE → Backup: ${MULTISIG_CONFIG.backupOperator}`);
  console.log(`   PAUSER_ROLE → Security: ${MULTISIG_CONFIG.security}`);
  console.log(`   PAUSER_ROLE → Emergency: ${MULTISIG_CONFIG.emergency}`);
}

async function confirmProceed() {
  console.log("\n⚠️  IMPORTANT WARNINGS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔐 This will grant administrative roles to multi-sig wallets");
  console.log("🔑 Your deployer wallet will retain access until final transition");
  console.log("🧪 Test all multi-sig wallets BEFORE revoking deployer access");
  console.log("💾 Ensure you have backup access to all multi-sig wallets");

  // In production, you might want to add a confirmation prompt
  console.log("\n✅ Proceeding with role assignment...");
  return true;
}

async function executeRoleSetup() {
  console.log("\n🚀 EXECUTING ROLE SETUP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const [deployer] = await ethers.getSigners();
  const roleManager = new RoleManager(TOKEN_ADDRESS, GATEWAY_ADDRESS, deployer);

  await roleManager.initialize();
  await roleManager.displayCurrentRoles();

  const result = await roleManager.setupMultiSigRoles(MULTISIG_CONFIG);

  if (result.successCount === result.totalOperations) {
    console.log("\n🎉 ROLE SETUP COMPLETED SUCCESSFULLY!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ All roles assigned to multi-sig wallets");
    console.log("🔑 Deployer wallet still has access for testing");

    console.log("\n📋 NEXT STEPS:");
    console.log("1. 🧪 Test all multi-sig wallets can perform their functions");
    console.log("2. 🔍 Verify role assignments with: npm run verify:roles");
    console.log("3. 🏁 When ready, run: npm run finalize:roles");

    return true;
  } else {
    console.log("\n⚠️  PARTIAL SUCCESS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 ${result.successCount}/${result.totalOperations} operations completed`);
    console.log("🔍 Check logs above for specific failures");
    console.log("💡 Common issues: Invalid addresses, insufficient gas, network errors");

    return false;
  }
}

async function generatePostSetupGuide() {
  console.log("\n📖 POST-SETUP TESTING GUIDE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const guide = `
# Multi-Sig Testing Checklist

## 🏦 Treasury Multi-Sig Tests
- [ ] Can call setFlashLoanFee()
- [ ] Can grant/revoke roles
- [ ] Can transfer ownership
- [ ] All required signers can sign

## 🛠️ Operations Multi-Sig Tests
- [ ] Can call mintWithReceipt() via gateway
- [ ] Can call burnWithReceipt() via gateway
- [ ] All required signers can sign

## 🛡️ Security Multi-Sig Tests
- [ ] Can call pause() on token
- [ ] Can call pause() on gateway
- [ ] Can call tripCircuitBreaker()
- [ ] Can call resetCircuitBreaker()
- [ ] All required signers can sign

## 🤖 Automated Service Tests
- [ ] Can sign mint/redeem receipts
- [ ] Backend can call gateway functions
- [ ] Monitoring systems working

## 🔍 Verification Commands
\`\`\`bash
# Check all current role assignments
npm run verify:roles

# Test specific functions (with multi-sig)
npm run test:multisig

# Final transition (removes deployer access)
npm run finalize:roles
\`\`\`

## 🚨 Emergency Procedures
- Emergency contact: ${MULTISIG_CONFIG.emergency}
- Circuit breaker: Can be triggered by security multi-sig
- Recovery: Treasury multi-sig can reassign roles
`;

  console.log(guide);
}

async function main() {
  console.log("🔐 C12USD MULTI-SIG ROLE SETUP");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Validate configuration
    const isValid = await validateConfiguration();
    if (!isValid) {
      process.exit(1);
    }

    // Display plan
    await displayRoleAssignmentPlan();

    // Confirm proceed
    const shouldProceed = await confirmProceed();
    if (!shouldProceed) {
      console.log("🛑 Operation cancelled by user");
      process.exit(0);
    }

    // Execute role setup
    const success = await executeRoleSetup();
    if (!success) {
      console.log("❌ Role setup incomplete - review errors above");
      process.exit(1);
    }

    // Generate testing guide
    await generatePostSetupGuide();

  } catch (error) {
    console.error("❌ Role setup failed:", error.message);
    console.error("\n🔍 Troubleshooting:");
    console.error("- Check network connectivity");
    console.error("- Verify contract addresses");
    console.error("- Ensure sufficient gas");
    console.error("- Confirm wallet permissions");
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  MULTISIG_CONFIG,
  validateConfiguration,
  executeRoleSetup
};

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}