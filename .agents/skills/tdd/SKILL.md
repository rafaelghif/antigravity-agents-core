---
name: tdd
description: Drives multi-language behavioral changes (TS/JS, Dart/Flutter, Go, Python, Rust) through Red-Green-Refactor at public module seams with complete production behavior, performance checks, and zero test tampering. Use when building features test-first or writing unit, widget, or integration tests.
---

# Test-Driven Development (Multi-Language Public Seams)

Execute strict **Red → Green → Refactor** at public module seams so tests validate observable contracts and survive internal refactoring. Consult [references/stack-test-patterns.md](references/stack-test-patterns.md) and [examples/tdd-seam-example.md](examples/tdd-seam-example.md).

## Decision tree

1. **Does the planned test reach into private methods, internal state fields, or internal helper call counts?**
   - **Yes** → Rewrite the test to invoke only the **public seam** (API route, CLI, exported function/use-case, or rendered widget/DOM role) and assert observable outputs or errors.
   - **No** → Proceed to step 2.
2. **Does the module mix pure domain logic with external I/O (DB, HTTP, storage, clock)?**
   - **Yes** → Keep pure rules isolated for zero-mock unit tests; test adapters separately at their integration seam with outer-boundary fakes only.
   - **No** → Run the Red → Green → Refactor loop below.

## Cycle

1. **RED**: Write one failing test named after the observable capability. Run the repo's real test runner (`npm test`, `flutter test`, `dart test`, `go test ./...`, `pytest`, `cargo test`) and confirm it fails for the expected behavioral reason.
2. **GREEN**: Implement the smallest **complete production behavior**—never a happy-path stub. Include real boundary parsing, authorization, config/logging seams, error wrapping, disposal, and optimal complexity. Never `.skip`, `skip: true`, weaken assertions, or mock the System-Under-Test.
3. **REFACTOR**: Remove duplication, reuse shared UI/helpers, flatten nesting with guard clauses, and re-run the test suite to stay green.

## Mandatory coverage floor

Verify tests cover: happy path, `N-1`/`N`/`N+1` boundaries, empty/null/malformed inputs, unauthorized/cross-tenant access (`401`/`403`/`404`), duplicate idempotency (if mutating), and at least one external failure/timeout case.
