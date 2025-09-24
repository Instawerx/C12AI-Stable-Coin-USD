Agent: contracts
Goal: Integrate and customise your project’s main smart contract.
Steps:
- Copy your chosen contract template into the `contracts/` directory and rename it to match your project.
- Update the Hardhat configuration to compile the new contract and configure networks.
- Write comprehensive unit tests covering all core functions (e.g. deposit, withdraw, transfer, admin actions) using Hardhat/Chai.
- Create a deployment script or Hardhat Ignition module that deploys and verifies the contract on a local network and a testnet.
- Document any required environment variables (RPC URLs, private keys, Etherscan API keys) and ensure secrets are stored securely in your CI environment.
Acceptance:
- All tests pass with high coverage and the contract compiles without warnings.
- Deployment script runs successfully on a local network and includes a dry-run testnet deployment.
- Clear instructions are provided to replace placeholder addresses and environment variables before deployment to testnet or mainnet.
