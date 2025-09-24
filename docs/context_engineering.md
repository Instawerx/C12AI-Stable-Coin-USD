# Context Engineering Guidelines

This document distills best practices from advanced Claude Code usage and the context-engineering-intro guide.

## Optimizing the System Prompt
- Keep `.claude/system.md` concise, focusing on objectives and constraints. Put all project-specific details into tasks, docs, or context files.
- Use subagent system prompts for specialized roles; inherit from the master system prompt when possible.

## File Placement and Reusability
- Store reusable definitions, context guidelines, and templates in `docs/` or `.claude/context/` rather than repeating them in tasks.
- Place agent configuration under `.claude/workflows/` and tasks under `.claude/workflows/tasks/`. Keep each task self-contained.

## Permission Management
- Use environment variables and secret managers for credentials. Avoid embedding secrets in code or tasks.
- For GitHub operations, use Workload Identity Federation or GitHub OIDC rather than long-lived tokens.

## Memory Summarisation
- After each iteration, append a brief summary of changes, decisions, test outcomes, and unresolved issues to `.claude/context/memory.md`. Use bullet points and avoid code.
- Compress context summaries when memory grows large; retain key decisions and links to commits.

## Multi-Agent Workflows
- Define separate agents for different domains (e.g. infra, contracts, backend, frontend, db, sre) in `agents.yaml`.
- Use the master agent to orchestrate tasks and maintain high-level goals. Subagents should report progress back to the master.

## Integration and Observability
- Align your hooks (`pretool.sh`, `posttool.sh`) to set up environment and summarise results.
- Incorporate logging and monitoring at each step to trace agent actions and detect issues early.

Refer back to this document whenever modifying system prompts, creating new tasks, or designing complex workflows.
