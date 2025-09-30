# C12USD Stablecoin Project

This repository is derived from the **Claude Code Project Template** and tailored to implement
the **C12AI DAO stablecoin (C12USD)**.  It contains everything needed to build an
**Instant Circulation Pilot** of C12USD on **BSC and Polygon**, using
LayerZero for cross‑chain transfers, Chainlink Proof‑of‑Reserve for solvency,
and off‑chain rails via Stripe and Cash App.  The goal of this pilot is to
prove the end‑to‑end mint, bridge, redeem and monitoring flow with a very
small reserve ($50 per chain) before committing significant capital.

## Overview

* **Peg:** 1:1 USD with fully backed reserves held in bank and Cash App.
* **Cross‑chain:** Native omnichain token using LayerZero OFT v2 on both
  BSC and Polygon.  A single supply is maintained across chains.
* **Security:** Smart contracts are based on OpenZeppelin and audited
  patterns, include a Chainlink Proof‑of‑Reserve circuit breaker, and allow
  mint/burn only via a DAO‑controlled gateway.  Guardians can pause
  operations if reserves fall below supply.
* **Fiat rails:** Minting only occurs after USD is credited via Stripe or
  Cash App.  Redeeming burns tokens first, then pays out USD.
* **Off‑chain:** A webhook server processes payments, a signer service
  authorises mints, a database records receipts/redemptions, and a PoR
  publisher pushes reserve balances on‑chain.

This project uses **Claude Code** to orchestrate development across
multiple agents.  It leverages the latest features documented in
Anthropic’s changelog (v1.0.123 as of Aug 2025), including
slash commands and the optional `think` tool for complex reasoning.

## Getting started

1. **Clone or initialise this project** (if starting from the template) and
   ensure Node.js 16+, pnpm or npm, and the Anthropic CLI are installed.
2. **Install Claude Code** globally: `npm install -g @anthropic-ai/claude-code`.
3. **Populate `.claude/system.md`** with a high‑level description of the
   C12USD pilot—its objectives, constraints and security requirements.  Avoid
   long lists of rules here; use task files and context docs instead.
4. **Define agents** in `.claude/workflows/agents.yaml`.  Suggested roles:
   - `infra`: prepare environment, install dependencies, configure CI.
   - `contracts`: implement and test smart contracts.
   - `backend`: build the webhook server, signer and PoR publisher.
   - `frontend`: build mint/redeem/bridge UI and dashboard.
   - `sre`: set up monitoring, alerts and observability.
5. **Plan tasks** by copying `project.template.yaml` to
   `.claude/workflows/project.c12usd.yaml` and editing the iteration order
   (see below).  Each YAML file declares the entry task (`000_bootstrap.md`),
   the sequence of tasks, and project policies (e.g. fail fast, require
   tests to pass).  Use plan mode (`/model`) before executing non‑trivial
   tasks to let Claude propose the next step.
6. **Update tasks** under `.claude/workflows/tasks/` to reflect the
   requirements of C12USD.  For example:
   - Adapt `010_env_setup.md` to install Node.js, Hardhat, LayerZero OFT
     packages, Chainlink contracts, and create a `.env.example` with
     placeholders for RPC URLs, private keys, API keys and other secrets.
   - Modify `030_contract_scaffold.md` to initialise a Hardhat project,
     scaffold the C12USD contracts (`C12AIStableUSD.sol`,
     `MintRedeemGateway.sol`, `Treasury.sol`), configure networks for
     BSC and Polygon via environment variables, and write deployment
     scripts.  Include instructions to prompt the user for DAO multisig
     addresses, LayerZero endpoints and Chainlink feed addresses before
     deployment.
   - Write tests in `040_tests_and_ci.md` to cover minting, burning,
     PoR enforcement, bridging and meta‑transactions.  Configure GitHub
     Actions to run tests and solhint/ESLint on every commit.
   - Modify or add tasks (`055_offchain_integration.md`) to implement
     the webhook server, signer and PoR publisher.  Ensure these tasks
     prompt the user to supply their Stripe and Cash App API keys, DB
     connection string and signer key via environment variables.  The
     agent should pause and request the information if not provided.
   - Adjust `060_frontend_integration.md` to build a Next.js interface
     with wallet connect, mint/redeem/bridge flows and a dashboard
     showing circulating supply and reserves.
   - Use `070_observability.md` to set up logging, monitoring and
     subgraphs/Dune dashboards.  Add an alert policy for PoR staleness or
     supply mismatches.
   - Use `130_context_engineering.md` to summarise decisions and
     compress context into `.claude/context/memory.md` after each
     iteration.
7. **Prompt for secrets**.  Claude Code should *stop* and prompt you to
   provide critical information (wallet addresses, RPC URLs, private
   keys, Stripe/Cash App API keys) before proceeding with deployment or
   integration tasks.  Use the `think` tool when necessary to
   double‑check that all required variables are present.  Do not embed
   secrets in source files or tasks; instead, store them in a
   `.env` file loaded by scripts or pass them at runtime.
8. **Secure workflow**.  Use environment variables and secret
   management rather than hard‑coding sensitive data.  Configure the
   `pretool.sh` hook to export environment variables (e.g. `source
   .env`) and the `posttool.sh` hook to append a summary of each
   iteration to `.claude/context/memory.md`.  Use Workload Identity
   Federation or OIDC for cloud authentication if needed.
9. **Run Claude Code**.  Launch the agentic loop via the defined
   slash command (default `/infinite`) from the repository root:

   ```bash
   claude --repo-dir .
   ```

   Use plan mode (`/model`) or the `think` tool to reason before taking
   actions.  The agent will follow the iteration order defined in
   `project.c12usd.yaml`, running tasks sequentially and prompting you
   when needed.

## Iteration order

The `project.c12usd.yaml` file defines the order in which tasks are executed
by Claude Code for this project.  A recommended sequence is:

```yaml
version: 1
name: "C12USD Stablecoin Pilot"
slash_command: "/project:c12usd"
entry_task: "000_bootstrap.md"
iteration_order:
  - "010_env_setup.md"
  - "020_database_setup.md"
  - "030_contract_scaffold.md"
  - "040_tests_and_ci.md"
  - "050_deployment_pipeline.md"
  - "055_offchain_integration.md"
  - "060_frontend_integration.md"
  - "070_observability.md"
  - "080_custom_contract.md"
  - "090_backend_integration.md"
  - "110_schema_design.md"
  - "120_frontend_completion.md"
  - "130_context_engineering.md"
policies:
  max_iterations: 1
  fail_fast: true
  require_tests_green: true
  require_secure_rules: true
hooks:
  pre:
    - ".claude/hooks/pretool.sh"
  post:
    - ".claude/hooks/posttool.sh"
```

Feel free to reorder or add tasks as needed.  Ensure that each
non‑trivial task includes clear acceptance criteria and prompts the
agent to request missing information from the user.

## Environment variables

Create a `.env.example` file at the root of the project with placeholder
values for all required environment variables.  For example:

```dotenv
# RPC URLs for each chain
BSC_RPC=
POLYGON_RPC=

# LayerZero endpoints (v2) and environment IDs
LZ_ENDPOINT_BSC=
LZ_ENDPOINT_POLYGON=
LZ_EID_BSC=
LZ_EID_POLYGON=

# Chainlink PoR feeds
POR_FEED_BSC=
POR_FEED_POLYGON=
POR_TOLERANCE_BPS=10

# DAO multisig addresses
SAFE_BSC=
SAFE_POLYGON=

# Signer private key (Ops signer) – used only for signing receipts
OPS_SIGNER_PRIVATE_KEY=

# Stripe credentials
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cash App credentials
CASHAPP_ACCESS_TOKEN=
CASHAPP_WEBHOOK_SECRET=

# Database connection (Postgres)
DATABASE_URL=

# Explorer API keys (optional)
BSCSCAN_API_KEY=
POLYGONSCAN_API_KEY=

# Treasury and transaction limits
TREASURY_INITIAL_MINT=100000000
INITIAL_LIQUIDITY_POOL=100
MAX_TRANSACTION_LIMIT=1000000
# NO daily limits for USD/stablecoin purchases

# Forwarder addresses for meta‑transactions
FORWARDER_ADDRESS_BSC=
FORWARDER_ADDRESS_POLYGON=

# Defining the slash command used to start the project
CLAUDE_SLASH_COMMAND=/project:c12usd
```

Copy this file to `.env` and fill in the actual values before running
deployment scripts.  The agent will read these variables via the
`pretool.sh` hook.

## Notes on using Claude Code effectively

The Claude Code changelog indicates that starting from version 1.0.120,
planning mode (`/model plan`) and the new `think` tool enable richer
deliberation before tool use.  Use these features when the next
execution step is complex or requires confirmation from the user.

When you define a new slash command (as shown in the YAML above), you
must update `.claude/commands/` accordingly.  A typical slash command
invokes the agentic loop with extended thinking or planning enabled.

Always summarise the outcome of each iteration in
`.claude/context/memory.md` so that future runs can recall prior
decisions.  Compress old context when it grows large, focusing on key
decisions and unresolved issues.
