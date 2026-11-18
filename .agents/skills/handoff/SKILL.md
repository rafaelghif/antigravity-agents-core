---
name: handoff
description: Checkpoints current ticket, verification evidence, downstream contracts, and single immediate next action into git-tracked docs/sprint/HANDOFF.md, docs/sprint/SPRINT.md, and local .scratch/handoff.md so sessions or other computers can resume seamlessly. Use after finishing a ticket or ending a session.
---

# Handoff (Cross-Session & Cross-Machine Continuity)

Persist complete resume state after every ticket or session end using [resources/handoff-template.md](resources/handoff-template.md) so a fresh session—or a different machine after `git pull`—resumes immediately without losing context.

## Decision tree

1. **Are you handing off after completing a ticket that passed verification and `/code-review`?**
   - **Yes** → Update `CONTEXT.md` (if new seams/primitives/config vars were added), update the ticket's completion log, update `docs/sprint/SPRINT.md`, write `docs/sprint/HANDOFF.md` (git-tracked for cross-machine resume) + mirror `.scratch/handoff.md`, and execute/propose **one atomic handover commit** (committing only when authorized in this session).
   - **No (stopping mid-ticket / token budget low)** → Record completed steps, remaining steps, exact failing/passing test output, and modified file list in `.scratch/handoff.md` (and `docs/sprint/HANDOFF.md` if tracking sprint in git).
2. **Are there any secrets, tokens, or `.env` values in the handover notes?**
   - **Yes** → Never write secret values; record only variable names and redact any captured trace values with `<REDACTED>`.

## Handoff workflow

1. Inspect `git status -sb` and `git log -3 --oneline` via `run_command`, plus `docs/sprint/SPRINT.md` if present.
2. Populate [resources/handoff-template.md](resources/handoff-template.md) into `docs/sprint/HANDOFF.md` (for sprint/cross-machine continuity) and `.scratch/handoff.md` (for local session resume).
3. Include **Downstream Seam & Config Notes**, **Falsified Approaches**, and **exactly one** concrete runnable command under `## 5. Immediate Next Session Action`.
4. If commits are authorized in this session, commit the ticket + `CONTEXT.md` + `docs/sprint/*` cleanly with Conventional Commits (`feat(scope): ... (#NN)`); otherwise output the exact ready-to-run `git add` / `git commit` command for user approval.
