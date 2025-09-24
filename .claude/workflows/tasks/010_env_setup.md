Agent: infra

Goal: Prepare the development environment and necessary tooling for a generic project using Claude Code. Ensure all core dependencies are installed, configure authentication with your chosen cloud provider (e.g., Google Cloud, AWS, Azure) using secure methods, and provide templates for environment variables.

Steps:
- Install core tooling such as Node.js (recommend LTS), package managers (pnpm or npm), Python (if needed), and the Claude Code CLI.
- Install any cloud provider CLI (e.g., gcloud, aws, az), authenticate via Workload Identity Federation or OAuth (avoid static keys), and enable necessary services.
- Create a `.env.example` file documenting required environment variables (project IDs, region, RPC URLs, private key placeholders, etc.).
- Set up local emulators for services like Firestore or other databases if available.
- Document installation commands and required versions in the README or a `docs/setup.md`.

Acceptance Criteria:
- A `.env.example` file exists with placeholder values and comments describing each variable.
- The repository contains a `docs/setup.md` or section in README documenting installation steps and CLI configuration.
- Authentication is configured without storing long‑lived secret keys in the repository.
