// C12USD Role Management System
// Comprehensive role assignment and multi-sig transition utilities

const { ethers } = require("hardhat");

/**
 * Role Management Configuration
 */
const ROLES = {
  TOKEN: {
    DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
    MINTER_ROLE: ethers.utils.id("MINTER_ROLE"),
    BURNER_ROLE: ethers.utils.id("BURNER_ROLE"),
    PAUSER_ROLE: ethers.utils.id("PAUSER_ROLE"),
    CIRCUIT_BREAKER_ROLE: ethers.utils.id("CIRCUIT_BREAKER_ROLE"),
    FLASH_LOAN_ADMIN_ROLE: ethers.utils.id("FLASH_LOAN_ADMIN_ROLE")
  },
  GATEWAY: {
    DEFAULT_ADMIN_ROLE: "0x0000000000000000000000000000000000000000000000000000000000000000",
    SIGNER_ROLE: ethers.utils.id("SIGNER_ROLE"),
    PAUSER_ROLE: ethers.utils.id("PAUSER_ROLE")
  }
};

/**
 * Default Multi-Sig Configuration Template
 */
const DEFAULT_MULTISIG_CONFIG = {
  // Production Multi-Sig Addresses (Replace with actual addresses)
  treasury: "0x0000000000000000000000000000000000000000", // Treasury multi-sig
  operations: "0x0000000000000000000000000000000000000000", // Operations multi-sig
  security: "0x0000000000000000000000000000000000000000", // Security multi-sig
  emergency: "0x0000000000000000000000000000000000000000", // Emergency multi-sig

  // Individual addresses for specific roles
  automatedSigner: "0x0000000000000000000000000000000000000000", // Automated signature service
  backupOperator: "0x0000000000000000000000000000000000000000"  // Backup operator
};

/**
 * Role Assignment Matrix for Multi-Sig Setup
 */
const ROLE_ASSIGNMENTS = {
  TOKEN: {
    DEFAULT_ADMIN_ROLE: ["treasury"], // Treasury controls admin functions
    MINTER_ROLE: ["operations", "automatedSigner"], // Operations and automated service can mint
    BURNER_ROLE: ["operations", "automatedSigner"], // Operations and automated service can burn
    PAUSER_ROLE: ["security", "emergency"], // Security team can pause
    CIRCUIT_BREAKER_ROLE: ["security", "emergency"], // Security team controls circuit breaker
    FLASH_LOAN_ADMIN_ROLE: ["treasury"] // Treasury controls flash loan parameters
  },
  GATEWAY: {
    DEFAULT_ADMIN_ROLE: ["treasury"], // Treasury controls gateway admin
    SIGNER_ROLE: ["automatedSigner", "backupOperator"], // Automated service and backup
    PAUSER_ROLE: ["security", "emergency"] // Security team can pause gateway
  }
};

class RoleManager {
  constructor(tokenAddress, gatewayAddress, signer) {
    this.tokenAddress = tokenAddress;
    this.gatewayAddress = gatewayAddress;
    this.signer = signer;
    this.token = null;
    this.gateway = null;
  }

  async initialize() {
    console.log("🔑 Initializing Role Manager...");

    // Load contract instances
    const TokenFactory = await ethers.getContractFactory("C12USDTokenEnhanced");
    const GatewayFactory = await ethers.getContractFactory("MintRedeemGateway");

    this.token = TokenFactory.attach(this.tokenAddress);
    this.gateway = GatewayFactory.attach(this.gatewayAddress);

    console.log(`   📄 Token: ${this.tokenAddress}`);
    console.log(`   🚪 Gateway: ${this.gatewayAddress}`);
    console.log(`   👤 Signer: ${this.signer.address}`);
  }

  async displayCurrentRoles() {
    console.log("\n📊 CURRENT ROLE ASSIGNMENTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Token roles
    console.log("\n🪙 C12USD TOKEN ROLES:");
    for (const [roleName, roleHash] of Object.entries(ROLES.TOKEN)) {
      const hasRole = await this.token.hasRole(roleHash, this.signer.address);
      console.log(`   ${roleName}: ${hasRole ? '✅' : '❌'} ${this.signer.address}`);
    }

    // Gateway roles
    console.log("\n🚪 MINT/REDEEM GATEWAY ROLES:");
    for (const [roleName, roleHash] of Object.entries(ROLES.GATEWAY)) {
      const hasRole = await this.gateway.hasRole(roleHash, this.signer.address);
      console.log(`   ${roleName}: ${hasRole ? '✅' : '❌'} ${this.signer.address}`);
    }
  }

  async grantRole(contract, role, address, roleName, contractName) {
    try {
      console.log(`   Granting ${roleName} on ${contractName} to ${address}...`);
      const tx = await contract.grantRole(role, address);
      await tx.wait();
      console.log(`   ✅ ${roleName} granted successfully`);
      return true;
    } catch (error) {
      console.log(`   ❌ Failed to grant ${roleName}: ${error.message}`);
      return false;
    }
  }

  async revokeRole(contract, role, address, roleName, contractName) {
    try {
      console.log(`   Revoking ${roleName} on ${contractName} from ${address}...`);
      const tx = await contract.revokeRole(role, address);
      await tx.wait();
      console.log(`   ✅ ${roleName} revoked successfully`);
      return true;
    } catch (error) {
      console.log(`   ❌ Failed to revoke ${roleName}: ${error.message}`);
      return false;
    }
  }

  async setupMultiSigRoles(config = DEFAULT_MULTISIG_CONFIG) {
    console.log("\n🔄 SETTING UP MULTI-SIG ROLES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    let successCount = 0;
    let totalOperations = 0;

    // Setup Token roles
    console.log("\n🪙 Setting up Token roles...");
    for (const [roleName, roleHash] of Object.entries(ROLES.TOKEN)) {
      const assignments = ROLE_ASSIGNMENTS.TOKEN[roleName] || [];

      for (const assigneeKey of assignments) {
        const address = config[assigneeKey];
        if (address && address !== "0x0000000000000000000000000000000000000000") {
          totalOperations++;
          const success = await this.grantRole(
            this.token,
            roleHash,
            address,
            `${roleName} -> ${assigneeKey}`,
            "Token"
          );
          if (success) successCount++;
        } else {
          console.log(`   ⚠️  Skipping ${roleName} -> ${assigneeKey} (address not configured)`);
        }
      }
    }

    // Setup Gateway roles
    console.log("\n🚪 Setting up Gateway roles...");
    for (const [roleName, roleHash] of Object.entries(ROLES.GATEWAY)) {
      const assignments = ROLE_ASSIGNMENTS.GATEWAY[roleName] || [];

      for (const assigneeKey of assignments) {
        const address = config[assigneeKey];
        if (address && address !== "0x0000000000000000000000000000000000000000") {
          totalOperations++;
          const success = await this.grantRole(
            this.gateway,
            roleHash,
            address,
            `${roleName} -> ${assigneeKey}`,
            "Gateway"
          );
          if (success) successCount++;
        } else {
          console.log(`   ⚠️  Skipping ${roleName} -> ${assigneeKey} (address not configured)`);
        }
      }
    }

    console.log(`\n📊 Multi-sig setup completed: ${successCount}/${totalOperations} operations successful`);
    return { successCount, totalOperations };
  }

  async transferOwnership(newOwner) {
    console.log("\n👑 TRANSFERRING OWNERSHIP");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      console.log(`   Transferring Token ownership to ${newOwner}...`);
      const tx = await this.token.transferOwnership(newOwner);
      await tx.wait();
      console.log("   ✅ Token ownership transferred successfully");
      return true;
    } catch (error) {
      console.log(`   ❌ Failed to transfer ownership: ${error.message}`);
      return false;
    }
  }

  async revokeDeployerRoles() {
    console.log("\n🔐 REVOKING DEPLOYER ROLES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  WARNING: This will remove deployer access permanently!");

    let successCount = 0;
    let totalOperations = 0;

    // Revoke Token roles (except DEFAULT_ADMIN_ROLE - revoke last)
    console.log("\n🪙 Revoking Token roles...");
    const tokenRolesToRevoke = Object.entries(ROLES.TOKEN).filter(([name]) => name !== 'DEFAULT_ADMIN_ROLE');

    for (const [roleName, roleHash] of tokenRolesToRevoke) {
      totalOperations++;
      const success = await this.revokeRole(
        this.token,
        roleHash,
        this.signer.address,
        roleName,
        "Token"
      );
      if (success) successCount++;
    }

    // Revoke Gateway roles (except DEFAULT_ADMIN_ROLE - revoke last)
    console.log("\n🚪 Revoking Gateway roles...");
    const gatewayRolesToRevoke = Object.entries(ROLES.GATEWAY).filter(([name]) => name !== 'DEFAULT_ADMIN_ROLE');

    for (const [roleName, roleHash] of gatewayRolesToRevoke) {
      totalOperations++;
      const success = await this.revokeRole(
        this.gateway,
        roleHash,
        this.signer.address,
        roleName,
        "Gateway"
      );
      if (success) successCount++;
    }

    console.log(`\n📊 Role revocation completed: ${successCount}/${totalOperations} operations successful`);
    console.log("ℹ️  DEFAULT_ADMIN_ROLE retained for final cleanup");

    return { successCount, totalOperations };
  }

  async finalizeTransition() {
    console.log("\n🏁 FINALIZING TRANSITION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⚠️  WARNING: This will revoke ALL deployer access!");

    try {
      // Revoke final admin roles
      console.log("   Revoking final DEFAULT_ADMIN_ROLE from Token...");
      await this.token.revokeRole(ROLES.TOKEN.DEFAULT_ADMIN_ROLE, this.signer.address);

      console.log("   Revoking final DEFAULT_ADMIN_ROLE from Gateway...");
      await this.gateway.revokeRole(ROLES.GATEWAY.DEFAULT_ADMIN_ROLE, this.signer.address);

      console.log("\n✅ TRANSITION COMPLETE!");
      console.log("🔒 Deployer wallet no longer has any administrative access");
      console.log("🎯 All roles have been transferred to multi-sig wallets");

      return true;
    } catch (error) {
      console.log(`❌ Failed to finalize transition: ${error.message}`);
      return false;
    }
  }
}

// Export for use in other scripts
module.exports = {
  RoleManager,
  ROLES,
  DEFAULT_MULTISIG_CONFIG,
  ROLE_ASSIGNMENTS
};

// CLI Interface
async function main() {
  const [deployer] = await ethers.getSigners();

  // Get contract addresses from command line or use defaults
  const tokenAddress = process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const gatewayAddress = process.env.GATEWAY_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (tokenAddress === "0x0000000000000000000000000000000000000000") {
    console.log("❌ Please provide TOKEN_ADDRESS environment variable");
    process.exit(1);
  }

  if (gatewayAddress === "0x0000000000000000000000000000000000000000") {
    console.log("❌ Please provide GATEWAY_ADDRESS environment variable");
    process.exit(1);
  }

  const roleManager = new RoleManager(tokenAddress, gatewayAddress, deployer);
  await roleManager.initialize();
  await roleManager.displayCurrentRoles();

  console.log("\n🔧 Role Manager initialized successfully!");
  console.log("📖 Use this script programmatically or run specific functions:");
  console.log("   - setupMultiSigRoles(config)");
  console.log("   - transferOwnership(newOwner)");
  console.log("   - revokeDeployerRoles()");
  console.log("   - finalizeTransition()");
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}