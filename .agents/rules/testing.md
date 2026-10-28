---
trigger: glob
globs: "*.test.*, *.spec.*, **/*.test.*, **/*.spec.*, **/*_test.go, **/*_test.py, **/test_*.py, **/tests/**"
description: "Public-seam testing, hermetic execution, and boundary coverage rules."
---

# Testing Conventions (World-Class Reliability & Hermetic Verification)

1. **Test Observable Behavior at Public Seams**:
   - Test behavior exclusively through a module's public interface (**seam**). Never assert on private methods, internal state variables, or internal helper invocation counts. Tests that mirror internal implementation details create brittle test suites that break during refactoring.
2. **Deterministic & Hermetic Isolation**:
   - Tests must run independently and in parallel without cross-test state leakage or execution-order dependencies.
   - Use dynamic tenant IDs and ephemeral database fixtures per test case (`tenantId = randomUUID()`) to prevent shared-state collisions.
   - Ban wall-clock sleep delays (`sleep(1000)`); use deterministic virtual clock advancement (`fakeTimers`) or polling with exponential backoff on asynchronous conditions.
3. **Seam-Level Fakes Over Fine-Grained Mocks**:
   - Never mock internal domain calculations or value objects. Restrict test doubles exclusively to outer I/O boundaries (third-party payment gateways, external webhooks, physical network calls).
   - Prefer in-memory fakes implementing the full public seam interface over brittle call-by-call function mocks.
4. **Boundary Invariants & Mutation Coverage**:
   - Every public seam test suite must rigorously exercise edge cases:
     - Boundary thresholds (`N - 1`, `N`, `N + 1`).
     - Empty, nil, and maximum-length boundary payloads.
     - Unauthorized cross-tenant access attempts (asserting `403`/`404`).
     - Duplicate requests presenting identical idempotency keys (asserting identical cached response and zero duplicated side-effects).
5. **Mutation Test Validity**:
   - Ensure tests are falsifiable: if any line of core domain logic or authorization check is commented out, at least one test must turn **red**.
