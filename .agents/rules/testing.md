---
trigger: glob
globs: "*.test.*, *.spec.*, **/*.test.*, **/*.spec.*, **/*_test.go, **/*_test.py, **/test_*.py, **/tests/**"
description: "Public-seam testing, hermetic execution, and boundary coverage rules."
---

# Testing Conventions

* Test behavior exclusively through a module's public interface (**seam**); never assert on private functions, internal state variables, or internal helper call counts.
* Name tests after observable capabilities and conditions (`calculates prorated refund when subscription cancels mid-cycle`), not internal implementation names.
* Never mock pure domain logic or value objects; restrict test doubles (fakes, stubs, mocks) to external I/O boundaries (third-party HTTP APIs, clock, external queues).
* Keep unit tests hermetic and deterministic: never depend on wall-clock sleeps, unseeded randomness, shared mutable global state, or test execution order.
* Cover boundary conditions in every test suite: empty collections, zero/negative values, exact threshold boundaries (`N-1`, `N`, `N+1`), unauthorized tenant access, and duplicate idempotency retries.
