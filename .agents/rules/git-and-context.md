---
trigger: model_decision
description: "Apply whenever creating git commits, managing branches or worktrees, updating CONTEXT.md or ADRs, or writing session handoffs."
---

# Git, CONTEXT.md & Artifact Rules

1. **Conventional Commits (English Only)**: Use `feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:` with imperative English summaries. Keep commits atomic and bisectable (do not mix behavior changes with unrelated refactors).
2. **Explicit Consent**: Create commits only when requested in this session; otherwise leave a green working tree and propose the exact commit message and file list. Never push directly to `main`/`master` without explicit confirmation (enforced by `.agents/git-guard.cjs`).
3. **Secrets & Ephemeral Exclusions**: Never commit `.env`, `.agents/mcp.env`, credentials, or `.scratch/` files.
4. **Keep `CONTEXT.md` Operational**: Maintain `CONTEXT.md` as the concrete Codebase Index (stack, commands, shared UI, shared utils, seams) + Domain Invariant Registry. Track Sprint execution in `docs/sprint/SPRINT.md`, never in `CONTEXT.md`.
5. **ADRs & DDRs**: Record ADRs in `docs/adr/NNNN-<slug>.md` only when a decision is costly to reverse, non-obvious without context, and resolves a real trade-off. Keep Discovery Decision Records in `docs/discovery/<feature-slug>.md` (`DEC-###`).
6. **Session Handoff**: Store cross-session handover state in `.scratch/handoff.md` with one concrete next action.
