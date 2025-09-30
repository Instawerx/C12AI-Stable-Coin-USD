// Role Verification Script
// Comprehensive role inspection and validation

const { ethers } = require("hardhat");
const { ROLES } = require('./role-management');

const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
const GATEWAY_ADDRESS = process.env.GATEWAY_ADDRESS || "0x0000000000000000000000000000000000000000";

class RoleVerifier {
  constructor(tokenAddress, gatewayAddress) {
    this.tokenAddress = tokenAddress;
    this.gatewayAddress = gatewayAddress;
    this.token = null;
    this.gateway = null;
  }

  async initialize() {
    console.log("🔍 INITIALIZING ROLE VERIFIER");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (this.tokenAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("TOKEN_ADDRESS not provided");
    }

    if (this.gatewayAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("GATEWAY_ADDRESS not provided");
    }

    const TokenFactory = await ethers.getContractFactory("C12USDTokenEnhanced");
    const GatewayFactory = await ethers.getContractFactory("MintRedeemGateway");

    this.token = TokenFactory.attach(this.tokenAddress);
    this.gateway = GatewayFactory.attach(this.gatewayAddress);

    console.log(`📄 Token Contract: ${this.tokenAddress}`);
    console.log(`🚪 Gateway Contract: ${this.gatewayAddress}`);
  }

  async getRoleMembers(contract, roleHash) {
    try {
      const memberCount = await contract.getRoleMemberCount(roleHash);
      const members = [];

      for (let i = 0; i < memberCount; i++) {
        const member = await contract.getRoleMember(roleHash, i);
        members.push(member);
      }

      return members;
    } catch (error) {
      return [];
    }
  }

  async displayTokenRoles() {
    console.log("\n🪙 C12USD TOKEN ROLES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (const [roleName, roleHash] of Object.entries(ROLES.TOKEN)) {
      console.log(`\n🔑 ${roleName}:`);
      const members = await this.getRoleMembers(this.token, roleHash);

      if (members.length === 0) {
        console.log("   ❌ No members assigned");
      } else {
        members.forEach((member, index) => {
          console.log(`   ${index + 1}. ${member}`);
        });
      }
    }
  }

  async displayGatewayRoles() {
    console.log("\n🚪 MINT/REDEEM GATEWAY ROLES");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    for (const [roleName, roleHash] of Object.entries(ROLES.GATEWAY)) {
      console.log(`\n🔑 ${roleName}:`);
      const members = await this.getRoleMembers(this.gateway, roleHash);

      if (members.length === 0) {
        console.log("   ❌ No members assigned");
      } else {
        members.forEach((member, index) => {
          console.log(`   ${index + 1}. ${member}`);
        });
      }
    }
  }

  async checkCriticalRoles() {
    console.log("\n🛡️ CRITICAL ROLE VALIDATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const criticalChecks = [];

    // Check if each critical role has at least one member
    const criticalRoles = [
      { contract: this.token, role: ROLES.TOKEN.DEFAULT_ADMIN_ROLE, name: "Token Admin" },
      { contract: this.token, role: ROLES.TOKEN.MINTER_ROLE, name: "Token Minter" },
      { contract: this.token, role: ROLES.TOKEN.PAUSER_ROLE, name: "Token Pauser" },
      { contract: this.gateway, role: ROLES.GATEWAY.DEFAULT_ADMIN_ROLE, name: "Gateway Admin" },
      { contract: this.gateway, role: ROLES.GATEWAY.SIGNER_ROLE, name: "Gateway Signer" }
    ];

    for (const check of criticalRoles) {
      const members = await this.getRoleMembers(check.contract, check.role);
      const hasMember = members.length > 0;

      criticalChecks.push({
        name: check.name,
        status: hasMember,
        count: members.length
      });

      console.log(`   ${hasMember ? '✅' : '❌'} ${check.name}: ${members.length} member(s)`);
    }

    const allCriticalRolesCovered = criticalChecks.every(check => check.status);
    return allCriticalRolesCovered;
  }

  async checkContractPermissions() {
    console.log("\n🔗 CONTRACT PERMISSION VALIDATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // Check if gateway can mint tokens
      const MINTER_ROLE = await this.token.MINTER_ROLE();
      const BURNER_ROLE = await this.token.BURNER_ROLE();

      const canMint = await this.token.hasRole(MINTER_ROLE, this.gatewayAddress);
      const canBurn = await this.token.hasRole(BURNER_ROLE, this.gatewayAddress);

      console.log(`   ${canMint ? '✅' : '❌'} Gateway can mint tokens`);
      console.log(`   ${canBurn ? '✅' : '❌'} Gateway can burn tokens`);

      return canMint && canBurn;
    } catch (error) {
      console.log(`   ❌ Permission check failed: ${error.message}`);
      return false;
    }
  }

  async checkContractStatus() {
    console.log("\n📊 CONTRACT STATUS CHECK");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // Check token status
      const tokenPaused = await this.token.paused();
      const circuitBreakerTripped = await this.token.circuitBreakerTripped();
      const totalSupply = await this.token.totalSupply();
      const maxSupply = await this.token.PILOT_MAX_SUPPLY();

      console.log(`   Token Paused: ${tokenPaused ? '🔴 YES' : '🟢 NO'}`);
      console.log(`   Circuit Breaker: ${circuitBreakerTripped ? '🔴 TRIPPED' : '🟢 NORMAL'}`);
      console.log(`   Total Supply: ${ethers.utils.formatEther(totalSupply)} C12USD`);
      console.log(`   Max Supply: ${ethers.utils.formatEther(maxSupply)} C12USD`);

      // Check gateway status
      const gatewayPaused = await this.gateway.paused();
      console.log(`   Gateway Paused: ${gatewayPaused ? '🔴 YES' : '🟢 NO'}`);

      // Check ownership
      const tokenOwner = await this.token.owner();
      console.log(`   Token Owner: ${tokenOwner}`);

      return {
        tokenPaused,
        gatewayPaused,
        circuitBreakerTripped,
        totalSupply: ethers.utils.formatEther(totalSupply),
        maxSupply: ethers.utils.formatEther(maxSupply),
        tokenOwner
      };
    } catch (error) {
      console.log(`   ❌ Status check failed: ${error.message}`);
      return null;
    }
  }

  async generateSecurityReport() {
    console.log("\n📋 SECURITY ANALYSIS REPORT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const report = {
      timestamp: new Date().toISOString(),
      contracts: {
        token: this.tokenAddress,
        gateway: this.gatewayAddress
      },
      security: {
        criticalRolesCovered: false,
        contractPermissionsValid: false,
        operationalStatus: 'unknown'
      },
      recommendations: []
    };

    // Perform checks
    report.security.criticalRolesCovered = await this.checkCriticalRoles();
    report.security.contractPermissionsValid = await this.checkContractPermissions();

    const status = await this.checkContractStatus();
    if (status) {
      report.security.operationalStatus = status.tokenPaused || status.gatewayPaused ? 'paused' : 'operational';
    }

    // Generate recommendations
    if (!report.security.criticalRolesCovered) {
      report.recommendations.push("⚠️  Assign members to all critical roles");
    }

    if (!report.security.contractPermissionsValid) {
      report.recommendations.push("⚠️  Fix contract permission issues");
    }

    if (status && (status.tokenPaused || status.gatewayPaused)) {
      report.recommendations.push("ℹ️  Contracts are paused - unpause when ready");
    }

    // Display report
    console.log(`\n📊 OVERALL SECURITY SCORE:`);
    const securityScore = [
      report.security.criticalRolesCovered,
      report.security.contractPermissionsValid,
      report.security.operationalStatus === 'operational'
    ].filter(Boolean).length;

    console.log(`   ${securityScore}/3 checks passed`);

    if (securityScore === 3) {
      console.log("   🟢 EXCELLENT - All security checks passed");
    } else if (securityScore === 2) {
      console.log("   🟡 GOOD - Minor issues to address");
    } else {
      console.log("   🔴 NEEDS ATTENTION - Critical issues found");
    }

    if (report.recommendations.length > 0) {
      console.log("\n📋 RECOMMENDATIONS:");
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    return report;
  }
}

async function main() {
  console.log("🔍 C12USD ROLE VERIFICATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const verifier = new RoleVerifier(TOKEN_ADDRESS, GATEWAY_ADDRESS);
    await verifier.initialize();

    // Display all role assignments
    await verifier.displayTokenRoles();
    await verifier.displayGatewayRoles();

    // Generate security report
    const report = await verifier.generateSecurityReport();

    // Save report to file
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '..', 'deployments', 'role-verification-report.json');

    const deploymentDir = path.dirname(reportPath);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);

    console.log("\n✅ VERIFICATION COMPLETED");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.error("\n🔍 Common issues:");
    console.error("- Invalid contract addresses");
    console.error("- Network connectivity issues");
    console.error("- Contract not deployed");
    console.error("- Insufficient permissions");
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  RoleVerifier
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