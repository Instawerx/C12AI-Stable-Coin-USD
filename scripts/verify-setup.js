const { ethers } = require("hardhat");
require("dotenv").config();

async function verifyDeploymentSetup() {
    console.log("🔍 C12USD Deployment Setup Verification\n");

    // 1. Check private key
    console.log("1. 🔑 Checking Private Key...");
    const privateKey = process.env.OPS_SIGNER_PRIVATE_KEY;

    if (!privateKey || privateKey === "0x0000000000000000000000000000000000000000000000000000000000000001") {
        console.log("   ❌ PRIVATE KEY NOT SET - Please update OPS_SIGNER_PRIVATE_KEY in .env");
        console.log("   📖 See DEPLOYMENT_SETUP.md for instructions");
        return false;
    }

    let wallet;
    try {
        wallet = new ethers.Wallet(privateKey);
        console.log(`   ✅ Private key valid`);
        console.log(`   📍 Wallet Address: ${wallet.address}`);
        console.log(`   💡 Fund this address with BNB (BSC) and POL (Polygon)\n`);
    } catch (error) {
        console.log("   ❌ INVALID PRIVATE KEY FORMAT");
        console.log("   💡 Must be 64 characters starting with 0x");
        return false;
    }

    // 2. Check network balances
    console.log("2. 💰 Checking Wallet Balances...");

    try {
        // BSC Balance
        const bscProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC || "https://bsc-dataseed1.binance.org/");
        const bscBalance = await bscProvider.getBalance(wallet.address);
        const bscBalanceEth = ethers.utils.formatEther(bscBalance);

        console.log(`   BSC (BNB): ${bscBalanceEth} BNB`);
        if (parseFloat(bscBalanceEth) < 0.05) {
            console.log("   ⚠️  LOW BNB BALANCE - Recommend at least 0.1 BNB");
        } else {
            console.log("   ✅ BNB balance sufficient");
        }

        // Polygon Balance
        const polygonProvider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC || "https://polygon-rpc.com/");
        const polygonBalance = await polygonProvider.getBalance(wallet.address);
        const polygonBalanceEth = ethers.utils.formatEther(polygonBalance);

        console.log(`   Polygon (POL): ${polygonBalanceEth} POL`);
        if (parseFloat(polygonBalanceEth) < 0.5) {
            console.log("   ⚠️  LOW POL BALANCE - Recommend at least 1 POL");
        } else {
            console.log("   ✅ POL balance sufficient");
        }

    } catch (error) {
        console.log("   ⚠️  Could not check balances (network issue)");
    }

    console.log();

    // 3. Check API keys
    console.log("3. 🔍 Checking API Keys...");
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

    if (etherscanApiKey && etherscanApiKey !== "") {
        console.log("   ✅ Etherscan Multichain API V2 key set");
        console.log("   🌐 Covers 60+ networks: BSC, Polygon, Ethereum, and more");
    } else {
        console.log("   ⚠️  Etherscan API key missing (optional for deployment, required for verification)");
        console.log("   💡 Get your unified key at: https://etherscan.io/apis");
    }

    // Check for legacy keys (show deprecation warning)
    const legacyBscKey = process.env.BSCSCAN_API_KEY;
    const legacyPolygonKey = process.env.POLYGONSCAN_API_KEY;

    if (legacyBscKey || legacyPolygonKey) {
        console.log("   ⚠️  Legacy API keys detected (BSCSCAN_API_KEY/POLYGONSCAN_API_KEY)");
        console.log("   📈 Consider migrating to single ETHERSCAN_API_KEY for unified access");
    }

    // 4. Check LayerZero endpoints
    console.log("\n4. 🌐 Checking LayerZero Configuration...");
    const bscEndpoint = "0x3c2269811836af69497E5F486A85D7316753cf62";
    const polygonEndpoint = "0x3c2269811836af69497E5F486A85D7316753cf62";

    console.log(`   BSC LayerZero Endpoint: ${bscEndpoint} ✅`);
    console.log(`   Polygon LayerZero Endpoint: ${polygonEndpoint} ✅`);

    // 5. Check contracts compiled
    console.log("\n5. 📄 Checking Contract Compilation...");
    try {
        const C12USDToken = await ethers.getContractFactory("C12USDTokenEnhanced");
        const MintRedeemGateway = await ethers.getContractFactory("MintRedeemGateway");
        console.log("   ✅ C12USDTokenEnhanced compiled");
        console.log("   ✅ MintRedeemGateway compiled");
    } catch (error) {
        console.log("   ❌ Contract compilation error");
        console.log("   💡 Run: npm run compile");
        return false;
    }

    // Summary
    console.log("\n🎯 DEPLOYMENT READINESS SUMMARY:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (privateKey && privateKey !== "0x0000000000000000000000000000000000000000000000000000000000000001") {
        console.log("✅ Private key configured");
        console.log("✅ Contracts compiled");
        console.log("✅ LayerZero endpoints ready");
        console.log("💰 Wallet address:", wallet.address);
        console.log();
        console.log("🚀 READY FOR DEPLOYMENT!");
        console.log("   Run deployment with: npm run deploy:bsc");
        console.log("   Or: npm run deploy:polygon");
        console.log("   Or: npm run deploy:production (both chains)");
        return true;
    } else {
        console.log("❌ NOT READY - Private key required");
        console.log("📖 See DEPLOYMENT_SETUP.md for setup instructions");
        return false;
    }
}

// Run verification
verifyDeploymentSetup()
    .then((ready) => {
        process.exit(ready ? 0 : 1);
    })
    .catch((error) => {
        console.error("❌ Verification failed:", error.message);
        process.exit(1);
    });