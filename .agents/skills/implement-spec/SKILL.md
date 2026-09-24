---
name: implement-spec
description: >-
  Implements an entire specification in code using subagents and a task graph of tickets.
  Use when the user asks to implement a spec, execute a planned specification, or build a feature from a spec.
---

You have been provided a spec. This spec should have tickets associated with it, describing how to implement the spec.

The goal is a PR which implements the entire spec on a single branch.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for **maximum concurrency**.

## Steps

1. Read the spec and tickets. Inspect workspace rules: [architecture-and-flow.md](../../rules/architecture-and-flow.md), [production-integrity.md](../../rules/production-integrity.md), and [coding-standards.md](../../rules/coding-standards.md). Synchronize task DAG via `node bin/cli.mjs tasks sync` if tickets are stored under `.scratch/<feature-slug>/issues/`.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in a directory outside the repo, accessible by all future subagents. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create a branch, and a draft PR. The PR should be marked as 'closing' the spec issue and tickets.

4. Use **implementer subagents** to implement each ticket on the current DAG frontier via `invoke_subagent` with `Workspace: "branch"` (or `"share"`):
   ```json
   invoke_subagent({
     "Subagents": [
       {
         "Role": "Ticket Implementer: <ticket-title>",
         "TypeName": "self",
         "Workspace": "branch",
         "Model": "flash",
         "Prompt": "<ticket details>\n\nStrict Constraints:\n- Adhere strictly to production-integrity.md: ZERO dummy data, mock stubs, or fake services.\n- Adhere to architecture-and-flow.md: preserve domain purity and respect module seams.\n- Execute the ticket's verificationCmd and ensure all tests pass before completing.\n- Make atomic conventional commits."
       }
     ]
   })
   ```

5. Once an **implementer subagent** completes, verify that automated tests pass, merge its work to the PR branch, and mark the ticket completed (`node bin/cli.mjs tasks complete <ticket-id>`).

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets concurrently.

7. Once all tickets are complete, run `code-review` on the PR branch. Fix all issues raised by the code review.

8. Mark the PR as ready for review.

9. Clean up all **implementer subagent** worktrees.
