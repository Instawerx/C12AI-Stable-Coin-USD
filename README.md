# Claude Code Project Template

This repository is a **blank starter template** for projects that use [Claude Code](https://docs.anthropic.com/claude-code) to orchestrate development across multiple agents and domains.  It contains a ready‑made `.claude` directory with example agents, tasks, hooks, and context files, plus guidelines on how to customize the template for your own needs.

## What’s included

```
claude-template/
  .claude/
    commands/
      infinite.md          # defines a custom slash command to run an agentic loop
    context/
      memory.md            # a file used by Claude to persist context between iterations
    hooks/
      pretool.sh           # runs before each tool invocation (stub: customise to set env vars)
      posttool.sh          # runs after each tool invocation (stub: customise to summarise results)
    workflows/
      agents.yaml          # defines the roles and tools available to your agents
      project.template.yaml# describes the entry task and iteration order (rename and customise)
      tasks/               # a collection of example task definitions
        000_bootstrap.md
        010_env_setup.md
        020_database_setup.md
        030_contract_scaffold.md
        040_tests_and_ci.md
        050_deployment_pipeline.md
        060_frontend_integration.md
        070_observability.md
        080_custom_contract.md
        090_backend_integration.md
        100_localisation.md
        110_schema_design.md
        120_frontend_completion.md
        130_context_engineering.md
  docs/
    context_engineering.md # high‑level guidelines for compressing context and structuring projects
```

None of the tasks in this template are specific to the **QUANT‑AI** project.  They are deliberately generic and meant to be modified for your own application.  Feel free to rename, reorder, add or remove tasks.

## Getting started

1. **Clone or fork this repository** into a new project:

   ```bash
   git clone https://github.com/<your‑username>/<your‑new‑project>.git
   cd <your‑new‑project>
   ```

2. **Install Claude Code** and its prerequisites if you haven’t already.  You’ll need Node.js (16+), `npm` or `pnpm`, and the [Anthropic CLI](https://docs.anthropic.com/claude-code/quickstart).  You can install the CLI globally via npm:

   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

3. **Update `.claude/system.md`** with a high‑level description of your project: its objectives, constraints, and any non‑negotiable security or quality requirements.  The current file contains placeholders you should replace.

4. **Define your agents** in `.claude/workflows/agents.yaml`.  Each agent should have an `id`, a descriptive `role`, and a list of `tools` (e.g. `git`, `bash`, `node`, `docker`, `firebase`).  Add or remove agents as needed.

5. **Plan your iteration order** by editing `.claude/workflows/project.template.yaml`.  Set `entry_task` to your first task (usually `000_bootstrap.md`) and list subsequent tasks in `iteration_order`.  You can group tasks for concurrency or enforce strict sequencing.

6. **Write or adapt tasks** under `.claude/workflows/tasks/`.  Each Markdown file describes a single discrete goal.  A typical task includes:
   - An **agent** field specifying which agent should execute it.
   - A **Goal** that describes the desired outcome.
   - A **Steps** list outlining what the agent should do.
   - An **Acceptance** section listing success criteria.
   - Optional **Notes** for context or cautionary details.

7. **Populate `docs/context_engineering.md`** with guidelines relevant to your project.  This template provides a summary of context‑engineering best practices: how to optimise system prompts, structure files for reusability, compress memory summaries, and manage multi‑agent workflows.  Extend or modify these notes as you learn what works best.

8. **Customise hooks**.  The stub scripts in `.claude/hooks/` simply return `{ "ok": true }`.  You can extend them to perform actions such as setting environment variables, fetching secrets from a secret manager, running tests, or appending a summary of each iteration to `.claude/context/memory.md`.

9. **Run Claude Code**.  From your project root, start the CLI:

   ```bash
   claude --repo-dir .
   ```

   Use the slash command defined in `.claude/commands/infinite.md` (default `/infinite`) to kick off the agentic loop.  Claude Code will read the project configuration and tasks, propose plans, run tools, and commit changes according to your rules.

10. **Iterate and deploy**.  Adjust tasks and agents as your project evolves.  Add tests, CI workflows, and deployment steps appropriate to your stack.  Before deploying production code, ensure you remove or replace any placeholder secrets and confirm your agents have performed thorough testing.

## Contributing your own template

If you add new patterns or improve the workflow, consider contributing back by opening a pull request.  Please remove any sensitive information and ensure the template remains broadly applicable.
