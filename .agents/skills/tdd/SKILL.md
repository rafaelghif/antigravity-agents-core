---
name: tdd
description: Drives code changes through the Red-Green-Refactor test-driven development loop at public module seams with production-grade completion criteria. Use when building features test-first, writing unit or integration tests, or practicing red-green-refactor, even when the change looks small enough for an MVP.
---

# Test-Driven Development (TDD)

Follow the strict **Red → Green → Refactor** loop on every behavioral increment, testing exclusively through public module seams.

## Decision tree

1. **Does the test reach into private functions, internal state variables, or internal helper call counts?**
   - **Yes** → Rewrite the test to invoke only the module's **public seam** and assert on observable outputs or returned errors.
   - **No** → Proceed to step 2.
2. **Does the module mix pure domain calculations with external I/O (DB, HTTP, filesystem)?**
   - **Yes** → Extract the pure calculation so 80%+ of boundary cases run in zero-mock unit tests; test the I/O adapter separately with one focused integration test.
   - **No** → Run the Red-Green-Refactor cycle below.

## The Red → Green → Refactor cycle

1. **RED (Write one failing test)**:
   - Write a single test named after the observable capability (`calculates prorated refund when subscription cancels mid-cycle`).
   - Run the test via `run_command` and verify it **fails for the expected behavioral reason** (not a syntax or import error).
2. **GREEN (Smallest complete production behavior)**:
   - Write the minimum genuine production code needed to make the failing test pass **without cutting production corners**. "Minimum" means no speculative features—not missing boundary validation, authorization, error handling, transactional integrity, idempotency, or observability required by the acceptance criteria.
   - **Zero Test Tampering**: Never weaken, skip (`.skip`), or alter the test during the Green phase to manufacture a pass—production logic must satisfy the test contract.
   - Re-run the test and confirm it turns green.
3. **REFACTOR (Clean while green)**:
   - Eliminate duplication, flatten nested conditionals into guard clauses, and sharpen identifier names while keeping all tests green.
   - Never add new behavior during the Refactor phase.

## Production guardrails

- A green happy-path test does not make a slice production-ready. The same seam must also cover `N-1`/`N`/`N+1` boundaries, unauthorized access, duplicate idempotency, and at least one failure mode before the slice is considered done.
- Never place a mock store, dummy token, fake data, artificial delay, or deferred `TODO` in production code to make a test pass.
- If the test contract itself is wrong, stop and obtain explicit user approval before changing it; fix production logic, never weaken the assertion.
