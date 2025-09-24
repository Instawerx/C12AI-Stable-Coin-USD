Agent: backend

Goal: Build the off‑chain integration necessary for the C12USD instant
circulation pilot.  This includes processing fiat payments, authorising
mints, recording transactions, publishing proof of reserves and
maintaining a ledger.

Steps:
1. **Webhook server**: Implement an Express (or Fastify) server
   exposing endpoints for Stripe (`/webhooks/stripe`) and Cash App
   (`/webhooks/cashapp`) events.  Validate webhook signatures and
   ignore duplicate events.  Persist each payment in a `receipts`
   table with fields for provider, provider ID, user wallet, USD
   amount, fees, chain ID, status and raw payload (see the ledger
   schema in the project documentation).
2. **Signer service**: Create a module that, given `(chainId, gateway
   address, offchainRef, user wallet, amount)`, produces an EIP‑191
   signature using the Ops signer key.  Store the key in an
   environment variable (`OPS_SIGNER_PRIVATE_KEY`) and never commit
   it to the repository.  Enforce per‑transaction and daily caps
   during the pilot.
3. **Mint integration**: Upon a successful payment, compute
   `offchainRef = keccak256(serialised_receipt_json)`, sign it via
   the signer service and call
   `MintRedeemGateway.mintWithSignature(...)` on the appropriate
   chain.  Update the receipt status to `minted` once the on‑chain
   transaction completes.
4. **Redeem integration**: Expose a REST endpoint (e.g. `POST
   /redeem`) that burns tokens on behalf of the user via
   `gateway.redeem(...)` and, once confirmed, initiates a payout via
   Stripe or Cash App.  Record the redemption in a `redemptions`
   table.
5. **PoR publisher**: Implement a periodic job that queries the
   reserve accounts (bank, Cash App, tokenised T‑Bills) and writes
   the aggregate reserves to the on‑chain PoR aggregator.  Update the
   `por_snapshots` table with each push.  Ensure the PoR update
   interval and stale data policies match those in the smart
   contract.
6. **Database**: Use Postgres or another relational database to
   persist receipts, redemptions and PoR snapshots.  Create a schema
   migration for the tables described in the ledger section of the
   README.  Use environment variables for the connection string.
7. **Configuration and secrets**: Extend `.env.example` with
   placeholders for all off‑chain integration variables: Stripe
   secret and webhook keys, Cash App access and webhook secrets,
   Ops signer key, database URL and pilot caps.  When this task
   executes, the agent should check that all required variables are
   defined.  If not, it must pause and prompt the user to supply
   them.  Never store secret keys in code or commit them to Git.
8. **Tests**: Write unit tests for each module (webhook handlers,
   signer service, PoR publisher) and integration tests that mock
   Stripe/Cash App events and verify that tokens are minted/burned
   correctly and that the database is updated.

Acceptance Criteria:
* The webhook server starts successfully and processes payment
  events, mints tokens on‑chain via the gateway and records
  receipts.
* The redeem handler burns tokens, triggers fiat payouts and
  records redemptions.
* The PoR publisher updates the on‑chain aggregator and persists
  snapshots in the database.
* `.env.example` lists all required off‑chain variables with clear
  comments, and tasks prompt the user to provide any missing
  information before proceeding.
* All tests pass with high coverage and CI is configured to run
  them automatically.
