Agent: master

Goal:
Incorporate context engineering best practices into the project to optimize Claude Code performance and maintainability.

Steps:
- Review the guidelines in docs/context_engineering.md.
- Summarize key principles such as file organization, context compression, memory summarization, secret management, and multi-agent workflows.
- Update .claude/system.md and relevant tasks to reflect these practices where applicable.
- Propose modifications to the agentic loop, tasks, and hooks to support context management (e.g., memory summarization after each iteration, context resets between tasks).
- Add references or links to docs/context_engineering.md in appropriate README or system prompts.

Acceptance criteria:
- A summary of context engineering principles is added to the system.md or relevant doc.
- The project structure and tasks incorporate context engineering guidelines.
- The memory file is actively updated after each iteration as per guidelines.
- No existing functionality is removed or duplicated; enhancements complement existing tasks and workflows.
