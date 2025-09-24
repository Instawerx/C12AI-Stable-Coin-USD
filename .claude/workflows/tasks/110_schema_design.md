Agent: database
Goal: Design and implement the data model for your project.
Steps:
- Identify the core entities your application requires (e.g. users, portfolios, transactions, tokens, contracts, translations) and define collections and fields for each in Firestore (or your chosen database).
- Determine the necessary indexes to support your expected queries and update the `firestore.indexes.json` file accordingly.
- Update `firestore.rules` or equivalent access policies to enforce least‑privilege access based on user roles and document fields.
- Implement data access helpers or DAOs to abstract Firestore operations and maintain consistency.
- Write unit tests to validate CRUD operations and queries, including edge cases and performance considerations.
- Document the data model with an ER diagram or a markdown table describing collections, fields, types, and relationships.
Acceptance:
- Collections and indexes are defined and deploy without errors to the local emulator or test environment.
- Security rules correctly enforce permissions for each role and data type.
- Data access helpers function as intended and all tests pass.
- Model documentation clearly explains the design and reasoning behind it.
