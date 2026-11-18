# Discovery Audit Checklist (Multi-Stack)

Walk through every applicable dimension below during `/discover` (skip only genuinely `N/A` areas with an explicit reason):

1. **Scope, Actors & Non-Goals**:
   - Exact capability, target user roles, and explicit out-of-scope items.
2. **Existing Codebase Reuse (`CONTEXT.md`)**:
   - Which existing UI primitives/widgets, theme tokens, HTTP clients, auth guards, and helpers are reused or extended.
3. **Architecture, Modularity & Upgradeability**:
   - Feature-first / modular boundaries, dependency inversion seams for external APIs/DBs/storage, plain imports vs existing aliases.
   - Live-researched (`search_web` 2026) framework idioms and maintained library versions (e.g., Riverpod/BLoC, Next/React, Go stdlib, FastAPI).
4. **Configurability & Secret Hygiene**:
   - Exact environment / `--dart-define` / config keys required (no hardcoded URLs, limits, or secrets; server secrets kept off mobile/client binaries).
5. **Security, Authorization & Abuse Cases**:
   - AuthN/AuthZ model, `tenant_id` / owner query scoping (BOLA/IDOR), strict boundary parsing, idempotency keys, rate limits, PII classification/retention.
6. **UI / UX States (Web & Mobile)**:
   - Loading, empty, validation errors, server/offline error recovery, optimistic vs disabled in-flight state, responsive layout, controller disposal.
7. **Performance & Scaling Budgets**:
   - Expected load/dataset size, pagination/virtualization (`ListView.builder` / cursor pagination), N+1 prevention, caching/TTL, isolate/worker offloading, latency targets (`NFR-###`).
8. **Observability, Failure Modes & Migrations**:
   - Structured log events (`traceId`, `<REDACTED>` secrets/PII), dependency timeouts/retries/fallback, Expand-Migrate-Contract schema changes & rollback triggers.
9. **Test Seams & Verification**:
   - Exact public seams, runnable verification command (`flutter test` / `npm test` / `go test` / `pytest`), boundary matrix, auth/idempotency/failure tests.
