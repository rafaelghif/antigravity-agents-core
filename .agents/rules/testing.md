---
trigger: glob
globs: "*.test.*, *.spec.*, **/*.test.*, **/*.spec.*, **/*_test.go, **/*_test.py, **/test_*.py, **/tests/**, **/__tests__/**, **/fixtures/**, **/mocks/**"
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
6. **Anti-Premature Completion & Closed-Loop Exit Proof ("Zero Mudah Puas")**:
   - Never declare testing complete or stop execution until the entire test suite and compiler pass with exit code 0.
   - The harness quality gate (`quality-gate-stop-sensor`) rejects termination if uncommitted modifications fail the test runner.
   - Inspect `git status --porcelain` to verify working tree cleanliness and ensure no dangling temporary fixtures or broken sibling tests remain.
7. **Anti-Test-Tampering & Contract Inviolability ("Fix Logic, Never Cheat Tests")**:
   - **Behavioral Contract Sanctity**: Existing unit tests are behavioral specifications and regression locks. When a test fails during development or debugging, it proves a defect in production logic—never an excuse to modify, weaken, or bypass the test.
   - **Strict Prohibition of Test Bypassing**:
     - Never add test-disabling flags or modifiers: `.skip`, `.only`, `xit`, `xdescribe`, `it.skip`, `test.skip`, `describe.skip`, `@pytest.mark.skip`, `@pytest.mark.xfail`, `@unittest.skip`, or `t.Skip()`.
     - Never comment out failing assertions or test suites (`// expect(...)`, `/* it(...) */`, `# assert`).
     - Never catch assertion exceptions inside test blocks to suppress failures (`try { ... } catch (e) {}`).
   - **Zero Assertion Dilution & Tautological Checks**:
     - Never replace specific value assertions with trivial existential checks (`expect(res.amount).toBe(100)` -> `expect(res).toBeDefined()`).
     - Never write tautological assertions (`expect(true).toBe(true)`, `assert.ok(true)`).
   - **Zero System-Under-Test (SUT) Mocking**:
     - Never mock, stub, or spy-override the actual function, class, or module being tested. Test doubles belong strictly at outer boundary seams (network, database, clock).
   - **Specification Conflict Protocol**:
     - If an existing test has a provable bug that directly contradicts an explicit user requirement or updated PRD, do NOT silently edit the test. Document the exact contradiction with line numbers, propose the correction, and obtain explicit user authorization via `ask_question` before modifying test expectations.
