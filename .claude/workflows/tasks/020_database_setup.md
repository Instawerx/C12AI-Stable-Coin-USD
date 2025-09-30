Agent: infra

Goal: Initialise a secure and scalable database layer for the project. Create a new database instance in your cloud provider (e.g., Firestore, DynamoDB, SQL) with least‑privilege access, define base collections/tables, and implement security rules that deny all by default while permitting appropriate reads/writes based on authentication and role claims.

Steps:
- Create a database instance or project (e.g., Firestore in Native mode) within your cloud environment.
- Enable necessary APIs/services and assign service accounts with minimal permissions.
- Write a `database.rules` or equivalent security configuration that sets `rules_version = '2'` and denies all access by default. Add rules for a sample collection (e.g., `users/{uid}`) allowing the owner to read/write their own document, and sample administrative collections with role‑based read/write.
- Provide an `indexes.json` file specifying any composite indexes required for anticipated queries.
- Include a `database.json` or `firebase.json` snippet for deployment instructions.
- Document local testing via emulators.

Acceptance Criteria:
- Database is initialised and necessary services/APIs are enabled.
- A security rules file exists with default deny and example allow clauses.
- An indexes file exists even if empty.
- Deployment instructions for rules and indexes are documented.
