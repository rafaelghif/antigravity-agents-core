---
trigger: glob
globs: "*.test.*, *.spec.*, **/*.test.*, **/*.spec.*, **/*_test.dart, **/*_test.go, **/*_test.py, **/test_*.py, **/*Test.kt, **/*Test.java, **/*Tests.swift, **/test/**, **/tests/**, **/integration_test/**, **/__tests__/**, **/fixtures/**, **/mocks/**"
description: "Multi-language public-seam testing, hermetic execution, boundary coverage, and anti-test-tampering rules."
---

# Testing Rules (Multi-Language)

1. **Test Observable Behavior at Public Seams**: Assert against public interfaces (HTTP routes, CLI commands, exported functions/use-cases, rendered widgets/UI via semantic locators or `find.byType`/`find.text`). Never test private methods or internal helper call counts.
2. **Hermetic & Deterministic Isolation**:
   - Each test must run independently and in parallel with zero shared mutable state (unique IDs/tenants per test, fresh dependency container/ProviderScope).
   - Ban arbitrary wall-clock `sleep` calls; use fake timers/clocks (`fakeTimers`, `fake_async`, `pumpAndSettle` with bounded duration) or deterministic async synchronization.
3. **Outer-Boundary Doubles Only (Never Mock the SUT)**:
   - Never mock or stub the class/function/widget under test. Restrict fakes/mocks (`mocktail`, `vi.fn`, HTTP fakes) strictly to outer I/O boundaries (network, DB, clock, device plugins).
4. **Mandatory Coverage Matrix**:
   - Happy path + `N-1`, `N`, `N+1` boundary thresholds.
   - Empty, `null`, malformed, and max-length inputs.
   - Unauthorized / cross-tenant access (`401`/`403`/`404` with zero data leakage).
   - Duplicate idempotency keys (identical output, zero duplicate side effects).
   - Injected external failure / timeout / offline mode.
5. **Mutation Falsifiability**: Removing or inverting a core domain rule or auth check must break at least one test.
6. **Anti-Test-Tampering & Closed-Loop Verification**:
   - Fix production code when tests fail—never weaken assertions, catch assertion failures, or add skip directives (`.skip`, `.only`, `xit`, `skip: true` in Dart `test(..., skip: ...)`, `@pytest.mark.skip`, `t.Skip()`, `@Ignore`).
   - Ban tautological checks (`expect(true).toBe(true)`, `expect(true, isTrue)`, `assert.ok(true)`).
   - If an existing test genuinely contradicts an updated spec, STOP, cite `file:line`, and get explicit user approval via `ask_question` before changing it.
   - Run the full real verification suite (`npm test` / `flutter test` / `dart test` / `go test ./...` / `pytest` / `cargo test`) after the final edit and confirm exit code `0`.
