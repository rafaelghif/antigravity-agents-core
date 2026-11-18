---
trigger: glob
globs: "*.test.*, *.spec.*, **/*.test.*, **/*.spec.*, **/*_test.go, **/*_test.py, **/test_*.py, **/tests/**, **/__tests__/**, **/fixtures/**, **/mocks/**"
description: "Public-seam testing, hermetic execution, boundary coverage, and anti-test-tampering rules."
---

# Testing Rules

1. **Test Observable Behavior at Public Seams**: Exercise modules through their exported/public interface (API route, CLI command, exported function, rendered UI role/text). Never assert on private methods, internal state fields, or internal helper call counts.
2. **Hermetic & Deterministic Isolation**:
   - Tests must pass in any execution order and in parallel with zero shared mutable state (`tenantId = randomUUID()` / isolated fixtures per test).
   - Never use wall-clock `sleep(1000)` delays; use virtual timers (`fakeTimers`) or bounded condition polling.
3. **Seam-Level Fakes Over SUT Mocking**:
   - Never mock or spy-stub the System-Under-Test (SUT) or pure domain logic. Restrict test doubles strictly to outer I/O boundaries (third-party HTTP APIs, mailers, clock, physical network).
4. **Required Edge & Security Matrix**:
   - Happy path + `N-1`, `N`, `N+1` boundary thresholds.
   - Empty, `null`/`nil`, malformed, and max-length inputs.
   - Unauthorized / cross-tenant access (`401`/`403`/`404` with zero data leakage).
   - Duplicate idempotency keys (same response, zero duplicate side effects).
   - At least one injected dependency failure mode.
5. **Mutation Falsifiability**: Removing or breaking a core domain invariant or auth check must turn at least one test red.
6. **Anti-Test-Tampering & Closed-Loop Exit Proof**:
   - Existing tests are sacred contracts. When a test fails, fix production code—never edit assertions to make a broken implementation pass.
   - Strictly banned: `.skip`, `.only`, `xit`, `xdescribe`, `@pytest.mark.skip`, `@pytest.mark.xfail`, `@unittest.skip`, `t.Skip()`, commenting out assertions, empty `try/catch` swallowing assertions, or tautological assertions (`expect(true).toBe(true)`, `assert.ok(true)`, `toBeDefined()`).
   - **Specification Conflict Protocol**: If an existing test genuinely contradicts an updated spec or user requirement, STOP, cite `file:line`, explain the conflict, and obtain explicit user approval via `ask_question` before changing the test.
   - Run the full test suite via `run_command` after the final edit and verify exit code `0`.
