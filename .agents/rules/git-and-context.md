---
trigger: model_decision
description: "Apply these guidelines whenever creating git commits, managing branches or worktrees, updating CONTEXT.md or ADRs, or handing off session state."
---

# Git & Context Rules

1. Use Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`) with an imperative summary.
2. Keep every commit atomic and bisectable: one logical change per commit, never mixing structural refactoring or formatting noise with behavioral changes.
3. Never run destructive git commands (`git push --force`, `git reset --hard`, `git clean -f`, `git branch -D`, `git checkout -- .`, `git restore .`) without explicit user confirmation (enforced via interactive `ask` hook guard).
4. Never commit `.env` files, secrets, temporary debug scripts, or `.scratch/` ephemeral files.
5. Keep `@CONTEXT.md` strictly as a living domain glossary and user-defined module boundary map—track active Sprint execution in `docs/sprint/SPRINT.md` and never dump raw task checklists into `@CONTEXT.md`.
6. Record Architectural Decision Records in `docs/adr/NNNN-<slug>.md` only when a decision is hard to reverse, surprising without context, and the result of a genuine trade-off.
7. Store cross-session handoff state in `.scratch/handoff.md` with a single runnable immediate next action.
