Agent: infra

Goal: Design and implement a secure and automated deployment pipeline to build, test and deploy application components (backend, frontend, services) to your chosen cloud platform (e.g., Google Cloud Run, AWS Fargate, Azure Container Apps). Ensure the pipeline uses short‑lived credentials via Workload Identity or another keyless method, and deploys only when tests pass and after manual approval.

Steps:
- Create Dockerfiles for backend and frontend (if applicable) that use multi‑stage builds for optimal image size.
- Configure a build pipeline using a cloud provider’s CI/CD service (e.g., Google Cloud Build YAML, GitHub Actions). Steps should include:
  - Checkout source code.
  - Authenticate to the cloud provider using OIDC or Workload Identity Federation.
  - Build Docker images and push to a container registry (e.g., Artifact Registry, ECR).
  - Run tests and linters to ensure quality.
  - Deploy images to a managed service like Cloud Run or Fargate with minimal privileges.
- Ensure deployment occurs only on selected branches (e.g., main) and optionally requires manual approval (e.g., GitHub environments, Cloud Build manual approval step).
- Document environment and service configuration (regions, service names, memory/CPU settings, concurrency) in YAML files.

Acceptance Criteria:
- Dockerfiles exist for all deployable components with build instructions.
- A pipeline configuration file exists (e.g., `cloudbuild.yaml` or `.github/workflows/deploy.yml`) that authenticates via keyless methods, builds images, runs tests, and deploys to the target service.
- Deployment is gated behind passing tests and manual approval if configured.
- README or docs include instructions on how to trigger the pipeline and monitor deployments.
