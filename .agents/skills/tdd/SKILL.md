---
name: tdd
description: Drives behavioral code changes through a strict Red-Green-Refactor loop at public module seams with complete production behavior and zero test tampering. Use when building features test-first or writing unit/integration tests.
---

# Test-Driven Development (TDD)

Follow **Red → Green → Refactor** at public module seams so tests verify observable contracts and survive internal refactoring.

## Decision tree

1. **Does the planned test access private methods, internal state, or internal helper call counts?**
   - **Yes** → Rewrite it to call only the module's **public seam** and assert on observable outputs, state effects, or returned errors.
   - **No** → Proceed to step 2.
2. **Does the module mix pure domain logic with external I/O (DB, HTTP, filesystem)?**
   - **Yes** → Keep pure rules in pure functions for fast zero-mock unit tests; test the I/O adapter separately at its integration seam.
   - **No** → Run the Red → Green → Refactor loop below.

## Cycle

1. **RED**: Write one failing test named after the observable behavior. Run it via `run_command` and confirm it fails for the expected behavioral reason (not a syntax/import error).
2. **GREEN**: Write the smallest **complete production behavior** that makes the test pass—never a happy-path stub. Include required boundary parsing, authorization, error mapping, and idempotency. Never modify/weaken/skip the test to pass.
3. **REFACTOR**: Deduplicate helpers, flatten nesting with guard clauses, and verify shared UI/utility reuse while keeping tests green. Add no new behavior in this step.

## Coverage floor

Before finishing a seam, verify tests cover: happy path, `N-1`/`N`/`N+1` boundaries, empty/malformed inputs, unauthorized/cross-tenant access (`401`/`403`/`404`), duplicate idempotency (if mutating), and at least one failure mode.
