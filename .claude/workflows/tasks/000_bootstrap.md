Agent: master

Goal: Set up the baseline structure for a new Claude Code project. Examine the repository and scaffold essential folders if missing (e.g., `.claude` directory, `context`, `hooks`, `workflows` and `tasks`). Produce a summary of current files and note any assumptions or missing components.

Steps:
- Inspect the current directory tree and describe the existing files and folders.
- If required directories (`.claude`, `docs`, `src`, etc.) or template files are absent, create them with placeholders.
- Draft an outline of subsequent tasks based on the project's needs.
- Update or create a README file with basic project description if necessary.

Acceptance Criteria:
- The repo contains a `.claude` folder with subfolders `commands`, `context`, `hooks` and `workflows`.
- A high-level summary of the repository structure is added to a `docs/BOOTSTRAP_REPORT.md` or the memory file.
- No business logic is implemented yet; only scaffolding and summaries.
