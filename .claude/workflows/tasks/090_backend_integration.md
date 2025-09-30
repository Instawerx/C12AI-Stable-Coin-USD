Agent: backend
Goal: Build and integrate a backend API that connects your smart contracts with your database and frontend.
Steps:
- Scaffold a backend service using Node.js with Express (or your preferred framework) and initialise package management.
- Implement API routes that call smart contract functions (e.g. deposit, withdraw, balanceOf) via Ethers.js.
- Integrate the Firestore Admin SDK (or your chosen database SDK) to store user data, transaction logs, and other metadata.
- Ensure data consistency between the on-chain state and the database by writing transactional logic where appropriate.
- Write integration tests to verify each API endpoint interacts correctly with both the smart contract and the database.
- Document required environment variables (e.g. RPC URLs, private keys, database credentials) and include a `.env.example` file.
Acceptance:
- All API routes behave as expected, returning correct data and handling errors gracefully.
- Integration tests pass, confirming that contract calls and database writes occur as designed.
- The backend runs locally and includes instructions for deploying to your chosen server or cloud service.
