Agent: frontend

Goal: Build the initial client interface and integrate it with smart contracts and backend services. Create a minimal user experience with wallet connectivity (e.g., MetaMask via Ethers.js), simple forms or dashboards that invoke contract functions and call API endpoints, and display data from the database.

Steps:
- Set up a frontend framework (e.g., React, Next.js, or Vue) if not already present, using TypeScript where possible.
- Implement a wallet connector using Ethers v6 or a similar library. Provide functions for connecting and disconnecting MetaMask, checking network, and retrieving the user’s address.
- Create UI components/pages that interact with the sample token contract: display token balances, allow transfers/mint operations, and handle transaction confirmations/errors.
- Build basic screens to interact with backend API endpoints (e.g., deposit/withdraw tokens, display transaction history). Handle asynchronous states and error messaging.
- Style the UI minimally using a design system (e.g., Tailwind) and ensure responsiveness.
- Document the setup and how to run the frontend locally in a `README` section.

Acceptance Criteria:
- A working frontend skeleton is committed with wallet connectivity and contract interaction functions.
- UI components/pages exist to call contract functions and backend APIs with user feedback on success/failure.
- The frontend can be started with a single command (e.g., `pnpm dev`) and connects to the chosen testnet/backend.
- Documentation is updated to explain setup and configuration.
