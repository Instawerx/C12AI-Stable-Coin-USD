Agent: contracts

Goal: Establish a robust testing suite and continuous integration pipeline that ensures code quality across the project (backend, contracts, frontend). Implement unit tests with a high coverage threshold and configure a CI workflow (e.g., GitHub Actions) to run tests and static analysis on every commit.

Steps:
- Choose a testing framework appropriate for each layer: Hardhat test or viem/chai for smart contracts, Jest for Node.js backend, and React Testing Library for frontend components.
- Write initial unit tests for the sample contract (e.g., `ExampleToken`) covering deployment, basic transfers, pausing/unpausing, and access control. Achieve at least 90% coverage.
- Add tests for backend utility functions or API endpoints if applicable.
- Configure a CI pipeline using GitHub Actions or another provider that runs on push and pull requests. The pipeline should:
  - Install dependencies.
  - Run linters (e.g., eslint, prettier, solhint).
  - Run unit tests and report coverage results.
  - Fail the build if tests fail or coverage drops below a threshold.
- Include a badge in the README for build status and coverage (optional).

Acceptance Criteria:
- A test suite is present and runnable via `pnpm test` or equivalent for all subprojects.
- Coverage reports show ≥ 90% for the sample contract and any backend utils.
- A CI workflow file exists under `.github/workflows/` that installs dependencies, runs linters, executes tests, and enforces coverage thresholds.
- The pipeline runs automatically on pushes and pull requests.
