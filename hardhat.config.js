require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const BSC_RPC = process.env.BSC_RPC || "";
const POLYGON_RPC = process.env.POLYGON_RPC || "";
const PRIVATE_KEY = process.env.OPS_SIGNER_PRIVATE_KEY || "0x" + "0".repeat(64);

module.exports = {
  networks: {
    hardhat: {
      chainId: 31337
    },
    bsc: {
      url: BSC_RPC || "https://bsc-dataseed1.binance.org/",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 56,
      gasPrice: 5000000000, // 5 gwei
      gas: 8000000,         // 8M gas limit
      timeout: 60000        // 60 second timeout
    },
    polygon: {
      url: POLYGON_RPC,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 30000000000
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 97
    },
    polygonMumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001
    }
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v5"
  },
  etherscan: {
    apiKey: {
      // Etherscan Multichain API V2 - Single key for all networks
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      bsc: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.ETHERSCAN_API_KEY || "",
      bscTestnet: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.ETHERSCAN_API_KEY || "",

      // Legacy fallback (deprecated)
      // bsc: process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || "",
      // polygon: process.env.POLYGONSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.bscscan.com/api",
          browserURL: "https://bscscan.com"
        }
      },
      {
        network: "polygon",
        chainId: 137,
        urls: {
          apiURL: "https://api.polygonscan.com/api",
          browserURL: "https://polygonscan.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD"
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  mocha: {
    timeout: 40000
  }
};