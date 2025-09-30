Agent: sre

Goal: Implement observability across all services, including structured logging, metrics, tracing, and alerting. Configure dashboards and alerts to monitor application health (latency, error rates, resource usage) and set budgets or quotas to control costs.

Steps:
- Integrate a logging library (e.g., Winston for Node.js) and ensure logs are structured (JSON) with fields for timestamp, severity, component, correlation IDs, etc.
- Enable application performance monitoring and tracing using OpenTelemetry or a cloud provider’s native solution. Export traces and metrics to a centralized backend (e.g., Cloud Logging & Monitoring, AWS CloudWatch).
- Create a `/healthz` endpoint and optionally a `/readiness` or `/liveness` probe for services. Ensure the deployment pipeline sets up health checks.
- Configure alerting policies for error rates, latency, CPU/memory thresholds, and budget consumption using the cloud provider’s monitoring tools. Document error budget policies.
- Set up dashboards to visualise key metrics and logs for each component (backend, frontend, contracts where possible). Provide links or instructions for accessing dashboards.

Acceptance Criteria:
- Services emit structured logs and traces that are viewable in a central console.
- Health and readiness endpoints exist and are configured in deployment definitions.
- Alerting policies and budgets are configured, with at least one example alert.
- A document or README section describes how to view logs, metrics, and dashboards.
