---
trigger: model_decision
description: "Apply these guidelines whenever creating git commits, managing branches or worktrees, updating CONTEXT.md or ADRs, or handing off session state."
---

# Git & Context Rules

1. Use Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:`) with an imperative English summary. All commit messages, branch names, PR descriptions, and repository documentation must strictly be in English.
2. Keep every commit atomic and bisectable: one logical change per commit, never mixing structural refactoring or formatting noise with behavioral changes.
3. Create commits only when the user asked for a commit in this session. Otherwise finish with a green tree and propose the exact commit message and file list instead of committing on their behalf.
4. Never push directly to protected `main` or `master` branches (`git push origin main`, `git push -f origin main`) without explicit user confirmation. `.agents/hooks.json` enforces this guard with an interactive `ask` decision, while allowing local development operations (`checkout`, `commit`, `stash`, feature pushes) without friction.
5. Never commit `.env` files, secrets, temporary debug scripts, or `.scratch/` ephemeral files.
6. Keep `@CONTEXT.md` strictly as a living domain glossary and user-defined module boundary map—track active Sprint execution in `docs/sprint/SPRINT.md` and never dump raw task checklists into `@CONTEXT.md`.
7. Record Architectural Decision Records in `docs/adr/NNNN-<slug>.md` only when a decision is hard to reverse, surprising without context, and the result of a genuine trade-off.
8. Store cross-session handoff state in `.scratch/handoff.md` with a single runnable immediate next action.
