---
name: implement
description: >-
  Implements a piece of work based on a spec or set of tickets using TDD and code review.
  Use when the user asks to implement a feature, work through tickets, or code from a spec.
---

# World-Class Feature & Ticket Implementation Protocol

A rigorous 5-phase engineering protocol for turning specifications and tickets into world-class, human-readable, DRY, and test-backed production code.

---

## Phase 1: Architecture & Techstack Discovery

Before writing or editing any code, orient to the repository's topology and established patterns:

1. **Manifest Inspection**: Read package manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) via `view_file` to detect runtime, language version, frameworks, and installed dependencies.
2. **Topology & Seams**: Follow [architecture-and-flow.md](../../rules/architecture-and-flow.md). Map module boundaries and dependency directions (domain stays pure, dependencies point inward).
3. **Existing Patterns & Reuse (DRY)**: Search existing utilities, helpers, and schemas (`git grep` or `view_file`). Never re-invent a utility that already exists in the codebase.
4. **Domain Invariants**: Inspect `CONTEXT.md` (if present) to align terminology, entity names, and architectural decisions (ADRs).

---

## Phase 2: Seam Definition & Test-First Tracer Bullet (Red)

World-class engineering demands test-backed verification from the very first line of code:

1. **Define the Public Interface**: Agree on the function signature, class interface, or API contract. Keep the interface minimal and deep (see [codebase-design](../codebase-design/SKILL.md)).
2. **Write the Companion Test First**:
   - Create a dedicated test in the repo's test suite (`tests/`, `*_test.go`, `test_*.py`, `*.test.ts`).
   - Test through the public interface, asserting behavior against an independent expected value.
   - Include test cases for edge cases: empty inputs, zero/null values, boundary thresholds, and error modes.
3. **Execute & Confirm Red**:
   - Run the test file via `run_command`.
   - Confirm that the test fails cleanly for the intended reason (and not due to syntax or import crashes).

---

## Phase 3: Human-Readable & DRY Implementation (Green)

Write the minimum, production-grade code required to make the test pass cleanly:

1. **Intention-Revealing Naming**:
   - Names must be explicit and self-documenting.
   - Ban cryptic abbreviations (`usr_ctx`, `res_hndl_tmp`). Use clear, expressive names (`activeUserSession`, `checkoutResponseHandler`).
   - Functions are verb-noun actions (`calculateOrderTax`, `verifySecurityToken`).
2. **Flattened Control Flow (Guard Clauses)**:
   - Check invalid inputs and edge cases early and return immediately.
   - Keep the main "happy path" unindented. Avoid nested `if/else` ladders (maximum nesting depth: 2 to 3 levels).
3. **Explanatory Variables**:
   - Break complex boolean conditionals or calculations into named descriptive constants.
4. **Strict DRY Adherence**:
   - Do not duplicate logic, constants, or validation schemas. Extract shared shapes into single sources of truth.
5. **Zero Dummy/Mock in Production**:
   - Strictly adhere to [production-integrity.md](../../rules/production-integrity.md). Wire real types, genuine validation, and real error boundaries. No placeholder TODOs or fake returns.

---

## Phase 4: Refactor for Depth, Simplicity & Locality

Once green, polish the implementation to senior staff engineering standards:

1. **Single Responsibility (SRP)**:
   - Ensure each function does one thing at a single level of abstraction.
   - Decompose multi-step procedures into small, pure private helpers.
2. **Deep Module Leverage**:
   - Hide implementation details behind the minimal public interface. Callers should not need to understand internal mechanics.
3. **Code Commentary Integrity**:
   - Delete temporary debug logs (`console.log`, `print`).
   - Add comments only for *why* (non-obvious rationale, edge-case constraints, hardware/protocol specifics), never *what*.

---

## Phase 5: Automated Verification & Review Gate

Before concluding any implementation task:

1. **Run Full Test Suite**: Execute the project's test command via `run_command` to ensure zero regressions across the codebase.
2. **Typecheck & Linter**: Run the project's typechecker (`tsc --noEmit`, `mypy`, `go vet`, `cargo check`) if configured.
3. **Diff Review**: Inspect the git diff (`git diff`) against standards:
   - Run `node .agents/hooks/code-analyzer.cjs review` to verify zero security leaks or quality gate failures.
4. **Git Status & Cleanliness**: Check `git status` to ensure all untracked files are accounted for and no temporary files were left behind.
