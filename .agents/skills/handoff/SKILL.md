---
name: handoff
description: Checkpoints current ticket, verification evidence, unblocked queue, machine preconditions, downstream contracts, and single immediate next action into git-tracked docs/sprint/HANDOFF.md, docs/sprint/SPRINT.md, and local .scratch/handoff.md after every ticket or session end. Use after finishing each ticket or ending a session.
---

# Handoff (Mandatory Per-Ticket & Cross-Machine Continuity)

Persist complete, machine-portable resume state **after every single ticket** (or mid-ticket stop) using [resources/handoff-template.md](resources/handoff-template.md) so a fresh session—or a completely different computer after `git pull`—resumes immediately without losing context.

## Decision tree

1. **Are you handing off after completing 1 ticket that passed verification and `/code-review`?**
   - **Yes** → Never batch or defer handover across multiple tickets:
     1. Update the ticket (`Status: done`, checklist, verification output).
     2. Immediately update `docs/sprint/SPRINT.md` and **immediately unblock** any downstream tickets (`blocked` → `ready`) whose `Blocked by` dependencies are now all `done`.
     3. Update `CONTEXT.md` (if new seams/primitives/config vars were added) and `docs/learnings/LESSONS.md` (`/self-learn` if a new durable lesson surfaced).
     4. Write `docs/sprint/HANDOFF.md` + mirror `.scratch/handoff.md`, and execute/propose **one atomic handover commit** (committing only when authorized in this session).
   - **No (stopping mid-ticket / context budget low)** → Record `in-progress` state, completed steps, remaining steps, exact failing/passing command output, and modified files in `.scratch/handoff.md` and `docs/sprint/HANDOFF.md`.
2. **Are there any secrets, tokens, or `.env` values in the handover notes?**
   - **Yes** → Never write secret values; record only environment variable names and redact any captured trace values with `<REDACTED>`.

## Handoff workflow

1. Capture `git status -sb` and `git diff --stat` (plus `git log -3 --oneline`) via `run_command`.
2. Populate all 6 sections of [resources/handoff-template.md](resources/handoff-template.md) into `docs/sprint/HANDOFF.md` and `.scratch/handoff.md`.
3. Verify **Environment & Toolchain Preconditions**, **Unblocked Ready Queue**, **Falsified Approaches**, and **exactly one** runnable command under `## 6. Immediate Next Session Action`.
4. If commits are authorized in this session, commit the ticket + `CONTEXT.md` + `docs/learnings/*` + `docs/sprint/*` cleanly with Conventional Commits (`feat(scope): ... (#NN)`); otherwise output the exact ready-to-run `git add` / `git commit` command for user approval.
