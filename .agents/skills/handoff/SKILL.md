---
name: handoff
description: Checkpoints current Scrum Sprint progress, active ticket state, downstream seam notes, and the single immediate next action into .scratch/handoff.md and docs/sprint/SPRINT.md. Use when ending a session, switching context, or handing off work to a fresh session.
---

# Handoff (Multi-Session Continuity)

Checkpoint active session state into `.scratch/handoff.md` (and sync `docs/sprint/SPRINT.md` if present) using [resources/handoff-template.md](resources/handoff-template.md).

## Decision tree

1. **Are there uncommitted functional changes passing full verification and satisfying the current ticket DoD?**
   - **Yes** → If commits were authorized in this session, create an atomic Conventional Commit and log the SHA. Otherwise leave the tree green and record the ready file list + proposed commit message.
   - **No (WIP)** → Record completed steps, remaining steps, and exact failing/passing test output in both the ticket file and `.scratch/handoff.md`.
2. **Did codebase index facts, shared components, or domain invariants change?**
   - **Yes** → Update `CONTEXT.md` (or `docs/adr/`) first so durable facts are not trapped in ephemeral `.scratch/handoff.md`.
   - **No** → Write `.scratch/handoff.md`.

## Workflow

1. Run `git status -sb` and `git log -3 --oneline` via `run_command`, and read `docs/sprint/SPRINT.md` if present.
2. Populate [resources/handoff-template.md](resources/handoff-template.md) with file links (no large code dumps), **Downstream Seam & Contract Notes**, **Falsified Approaches**, redacted secrets (`<REDACTED>`), and **one** runnable next-session command (`/implement docs/sprint/tickets/<NN>-<slug>.md`).
