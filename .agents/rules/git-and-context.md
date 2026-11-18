---
trigger: model_decision
description: "Apply whenever creating git commits, managing branches or worktrees, updating CONTEXT.md or ADRs, or writing cross-session/cross-machine handoffs."
---

# Git, CONTEXT.md & Cross-Machine Handover Rules

1. **Conventional Commits (English Only)**: Use `feat:`, `fix:`, `refactor:`, `perf:`, `test:`, `docs:`, `chore:` with imperative English summaries. Keep commits atomic (one ticket or one pure refactor per commit).
2. **Explicit Consent**: Create commits or push only when authorized in this session; otherwise leave a green working tree and propose the exact commit message and file list. Never push directly to `main`/`master` without explicit confirmation (guarded by `.agents/git-guard.cjs`).
3. **Secrets & Ephemeral Exclusions**: Never commit `.env`, `.agents/mcp.env`, keystores/certificates, credentials, or `.scratch/` files.
4. **Keep `CONTEXT.md` Operational**: Maintain `CONTEXT.md` as the verified Codebase Index (stack, commands, config/logging seams, shared UI, shared utils) + Domain Invariant Registry. Update it whenever a ticket introduces new shared primitives, config vars, or seams.
5. **Cross-Machine & Cross-Session Handover**:
   - Store durable, git-tracked handover state in `docs/sprint/HANDOFF.md` + `docs/sprint/SPRINT.md` + ticket completion logs so resuming on another computer via `git pull` has full context.
   - Mirror/store local uncommitted WIP state in `.scratch/handoff.md`.
6. **ADRs & DDRs**: Record ADRs in `docs/adr/NNNN-<slug>.md` when a decision passes all 3 ADR gates; keep Discovery Decision Records in `docs/discovery/<feature-slug>.md`.
