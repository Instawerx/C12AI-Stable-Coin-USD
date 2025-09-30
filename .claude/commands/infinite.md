---
name: infinite
description: Run the agentic loop defined in this repository
---

Use this command to run the agentic loop.

At each step the loop should:

1. Re-read `.claude/system.md` and the task definition files to understand the next goal.
2. Plan the minimal work needed to advance toward the goal.
3. Execute the plan using the tools available to the current agent.
4. Run any tests defined for the project and summarise the results.
5. Commit changes to the repository and append a summary of what was done to `.claude/context/memory.md`.

The loop should stop if all tasks are completed, if tests fail and cannot be resolved, or if human input is required.
