Agent: frontend

Goal: Finalize the user interface, ensuring seamless integration of all components and translation support.

Steps:
- Integrate all pages and components developed in previous tasks into a cohesive user experience.
- Connect the UI to the backend API for user actions: deposits, withdrawals, balance display, and portfolio management.
- Implement authentication and authorization flows, using roles defined in Firestore (e.g., admin vs user).
- Ensure real-time updates using Firestore listeners or websockets for transaction status and balances.
- Add a settings/profile page where users can manage preferences, select language, and view transaction history.
- Conduct end-to-end tests covering typical user flows in multiple languages across devices.

Acceptance:
- All pages are connected; user can sign in, deposit tokens/ETH, view balances, and withdraw.
- UI properly reflects contract and Firestore data; multi-language translation works across the site.
- End-to-end tests pass, verifying flows in various languages and device sizes.
