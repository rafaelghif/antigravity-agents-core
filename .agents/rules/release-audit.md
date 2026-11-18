---
trigger: manual
description: "Pre-release production readiness and deep security/architecture audit rubric."
---

# Release & Production Readiness Audit Rubric

> Activation: `trigger: manual` (`@`-mention in Antigravity App/IDE, or explicitly request a release audit in CLI).

1. **Zero Production Fakes**: Confirm zero `mock*`, `fake*`, `dummy*`, or deferred `TODO` stubs exist in production paths.
2. **DRY & Shared UI Compliance**: Confirm no duplicate UI primitives, parallel formatters/fetchers, or hardcoded theme values were introduced.
3. **Schema & Migration Safety**: Confirm migrations follow Expand-Migrate-Contract, create indexes `CONCURRENTLY` outside transactions, and have tested rollback paths.
4. **Security & Tenant Isolation**: Confirm boundary input parsing, `tenant_id`/owner query scoping (BOLA/IDOR), and secret redaction (`<REDACTED>`).
5. **Concurrency & Idempotency**: Confirm mutating endpoints enforce idempotency keys and atomic DB locks/versions.
6. **Public Seam & Performance Verification**: Confirm build, typecheck, lint, full test suite, and `NFR-###` checks (`/perf-audit`) pass via `run_command` with exit code `0` and zero test tampering.
7. **Supply Chain, Secret Scanning & Ops Compliance**: Confirm pinned lockfiles, SBOM/license & dependency audit (`npm audit --omit=dev` / `pip-audit` / `govulncheck`), CI `gitleaks` secret scan, updated `OpenAPI`/contract docs, and active Runbook + rollback SOP.
