Agent: contracts

Goal: Set up a smart contract development environment for the project. Initialise Hardhat (or your preferred framework) with TypeScript support, configure networks (local and testnet), and scaffold an example token contract using OpenZeppelin. Provide example scripts to deploy the contract to a local node and a public test network.

Steps:
- Initialise a new Hardhat project with TypeScript enabled.
- Install necessary dependencies such as `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`, and `dotenv`.
- Configure `hardhat.config.ts` with networks: `hardhat` (local), `localhost`, and one public testnet (e.g., Sepolia). Use environment variables for RPC URLs and private keys.
- Create a sample ERC20 token contract in `contracts/ExampleToken.sol` using OpenZeppelin’s `ERC20`, `Ownable`, and `Pausable` modules.
- Generate deployment scripts in TypeScript (e.g., `scripts/deploy.ts`) to deploy the token to the selected network.
- Compile the contract and ensure there are no errors.
- Provide a `README` section or comment explaining how to run a local Hardhat node and deploy the contract.

Acceptance Criteria:
- A Hardhat project is initialised with TypeScript configuration.
- `ExampleToken.sol` exists and compiles successfully.
- Deployment scripts exist and can deploy to both local and testnet networks when provided with RPC URL and private key.
- Dependencies are listed in `package.json` with install instructions.
