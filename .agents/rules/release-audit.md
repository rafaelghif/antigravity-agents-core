---
trigger: manual
description: "Pre-release production readiness and deep security/architecture audit rubric."
---

# Release & Production Readiness Audit Rubric

1. **Zero Production Fakes**: Confirm zero `mockUsers`, `fakeDb`, `"dummy_id"`, or `// TODO: implement later` artifacts exist in production paths.
2. **Schema & Migration Safety**: Confirm all database migrations follow expand-and-contract, create indexes non-blockingly (`CONCURRENTLY`), and have verified rollback paths.
3. **Security & Tenant Isolation**: Confirm every endpoint validates input schemas at the boundary, scopes queries by authenticated `tenant_id` (BOLA/IDOR), and redacts secrets (`<REDACTED>`).
4. **Concurrency & Idempotency**: Confirm all mutating operations enforce idempotency keys and use atomic database locks/versions rather than check-then-act in memory.
5. **Public Seam Verification**: Confirm build, typecheck, linter, and public-seam integration/unit tests pass via `run_command` with zero regressions.
