---
name: tdd
description: Drives code changes through the Red-Green-Refactor test-driven development loop at public module seams. Use when building features test-first, writing unit or integration tests, or practicing red-green-refactor.
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
2. **GREEN (Minimal production code)**:
   - Write the minimum genuine production code needed to make the failing test pass.
   - Re-run the test and confirm it turns green.
3. **REFACTOR (Clean while green)**:
   - Eliminate duplication, flatten nested conditionals into guard clauses, and sharpen identifier names while keeping all tests green.
   - Never add new behavior during the Refactor phase.
