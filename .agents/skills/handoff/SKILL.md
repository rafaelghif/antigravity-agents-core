---
name: handoff
description: Checkpoints current Scrum Sprint progress, active ticket state, downstream seam notes, and the single immediate next action into .scratch/handoff.md and docs/sprint/SPRINT.md. Use when ending a session, switching context, or handing off work to a fresh agent session.
---

# Handoff (Multi-Session Scrum & Context Continuity)

Checkpoint the active session state into `.scratch/handoff.md` (and sync `docs/sprint/SPRINT.md` if present) using [resources/handoff-template.md](resources/handoff-template.md) so the next session can resume in seconds with zero context loss.

## Decision tree

1. **Are there uncommitted functional changes in `git status` that already pass tests and satisfy the current ticket's DoD?**
   - **Yes** → Commit them with an atomic Conventional Commit and update the ticket's `Completion Log` before writing the handoff.
   - **No (stopping mid-ticket / WIP)** → Explicitly record the completed sub-tasks, remaining sub-tasks, and current failing/passing test state in both the ticket file and `.scratch/handoff.md`.
2. **Did domain glossary terms or architectural decisions settle during this session?**
   - **Yes** → Update `CONTEXT.md` (or `docs/adr/`) first so permanent domain knowledge is never trapped in ephemeral handoff notes.
   - **No** → Proceed to the handoff workflow below.

## Handoff workflow

1. **Inspect Git & Sprint State**:
   - Run `git status -sb` and `git log -3 --oneline` via `run_command`.
   - Read `docs/sprint/SPRINT.md` (if present) to verify ticket statuses (`done`, `in-progress`, `ready`, `blocked`) and active Wave progress.
2. **Write `.scratch/handoff.md`**:
   - Populate [resources/handoff-template.md](resources/handoff-template.md).
   - Link directly to `docs/sprint/SPRINT.md`, active ticket files (`docs/sprint/tickets/<NN>-<slug>.md`), and modified code files rather than pasting large file dumps.
   - Document **Downstream Seam & Contract Notes** (exact exported functions, types, or invariants introduced in this session that the next ticket depends on) and **Falsified Approaches** (dead-ends the next session must not repeat).
   - Redact any credentials, tokens, or secrets as `<REDACTED>`.
   - Specify **exactly one** concrete, runnable command or ticket invocation (`/implement docs/sprint/tickets/<NN>-<slug>.md`) under `## 5. Immediate Next Session Action`.
