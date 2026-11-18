---
name: code-review
description: Audits diffs, branches, or completed tickets across specification fidelity, configurability, structured logging, security/credential hygiene, performance optimization, shared UI/DRY reuse, modularity, and test integrity. Use after implementing a ticket or reviewing a PR.
---

# Code Review (Industrial 2-Axis & Post-Ticket Audit)

Audit the diff (`git diff` or branch diff) against **Specification Fidelity** and **Industrial Engineering Standards** using [references/review-rubric.md](references/review-rubric.md).

## Decision tree

1. **Is the target diff (`git status` / `git diff`) resolved and non-empty?**
   - **No** → Inspect `git status` and `git diff` via `run_command`, or ask the user for the base ref.
   - **Yes** → Proceed to step 2.
2. **Are you reviewing your own ticket implementation or a multi-module diff?**
   - **Yes** → Run `node .agents/skills/implement/scripts/audit-diff.mjs` first, then delegate read-only audits via `invoke_subagent` to `adversarial-reviewer` (and `security-auditor` / `architecture-planner` when auth, secrets, schemas, or module boundaries change).
   - **No** → Execute the review workflow below directly.

## Review workflow

1. **Inspect Diff & Sibling Callers**:
   - Capture `git diff` via `run_command`.
   - For every modified exported symbol, widget/component prop, or schema, run `rg -n` to confirm unchanged callers remain valid.
2. **Audit Against [references/review-rubric.md](references/review-rubric.md)**:
   - Specification & ambiguity fidelity (zero invented endpoints/fields/assumptions).
   - Configurability & structured logging (`traceId`, `<REDACTED>` secrets/PII, zero hardcoded URLs/magic constants, zero stray `print`/`console.log`).
   - Security & credential leak hygiene (zero embedded secrets, BOLA/IDOR `tenant_id` scoping, atomic locks, SSRF/path guards).
   - Performance & resource lifecycle (zero N+1, optimal data structures, virtualization/pagination, isolate/worker offload, `dispose()`/`close()`).
   - Shared UI & DRY reuse (`Reuse → Extend → Compose → Create`, design tokens).
   - Modularity, maintainability & test integrity (zero `.skip`, `skip: true`, SUT mocks, weak assertions, or production fakes).
3. **Report Ranked Findings**:
   - Group by `🔴 Blocking`, `🟡 Structural`, and `🟢 Nit` with exact verified `file:line` citations and concrete fixes.
   - Conclude with **`APPROVE`**, **`APPROVE WITH NITS`**, or **`REQUEST CHANGES`**.
