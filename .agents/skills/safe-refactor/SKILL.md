---
name: safe-refactor
description: Restructure code while preserving external behavior, improving DRY, and enhancing human-readability. Use when handling extraction, consolidation, ownership moves, reducing cyclomatic complexity, or cleanup where verification must bracket structural edits.
---

# Safe Refactoring Protocol

A rigorous, zero-regression protocol for restructuring code while strictly preserving external behavior. Operates on the principle of **bracketed verification**: establishing a green baseline before touching code, making small verifiable micro-transformations, and proving behavioral equivalence at every step.

---

## 1. Core Principles

- **Zero Behavioral Change**: Public interfaces, data contracts, status codes, and error invariants must remain strictly identical.
- **No Scope Creep**: Refactoring never introduces new features, changes business rules, or adds speculative abstractions.
- **Atomic Micro-Steps**: Make one targeted transformation at a time (extract function, flatten conditional, consolidate duplicate).
- **Continuous Automated Proof**: Run tests before starting, between every micro-step, and at completion.

---

## 2. Five-Phase Refactoring Lifecycle

```
Phase 1: Baseline Proof  ──►  Phase 2: Seam Boundary  ──►  Phase 3: Micro-Transformations
                                                                     │ (DRY / Readability)
                                                                     ▼
Phase 5: Verification Gate ◄── Phase 4: Step Verification ◄──────────┘
```

### Phase 1: Techstack Discovery & Baseline Proof
Before modifying any file:
1. **Techstack Discovery**: Inspect project manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) and directory topology per [architecture-and-flow.md](../../rules/architecture-and-flow.md).
2. **Identify Test Runner**: Detect host test command (`npm test`, `go test ./...`, `pytest`, `cargo test`, `make test`).
3. **Execute Baseline Test**: Run tests via `run_command`. If tests fail initially, **STOP**. Do not refactor broken code. Fix or establish a green baseline first.

### Phase 2: Seam & Invariance Boundary
1. Identify the public boundary (the seam) where callers interact with the module.
2. Explicitly enumerate what must NOT change:
   - Exported function/class signatures and return types.
   - Error types, exceptions, and failure codes.
   - Input validation contracts and side-effect guarantees.
3. If public interfaces must change, stop and clarify with the user via `ask_question`.

### Phase 3: Micro-Step Transformations (DRY & Clean Code)
Execute structural improvements in atomic increments using targeted `replace_file_content` calls:

1. **Intention-Revealing Naming**:
   - Rename ambiguous variables, parameters, or functions to describe business intent (e.g., `calc(d)` $\rightarrow$ `calculateDiscountMultiplier(orderData)`).
2. **Flatten Control Flow (Guard Clauses)**:
   - Convert nested `if/else` ladders into early returns / guard clauses.
   - Handle edge cases, null checks, and invalid inputs upfront.
3. **DRY Extraction & Consolidation**:
   - Identify duplicated logic or copy-pasted blocks.
   - Extract into a single pure, testable helper function or domain module.
   - Ensure the extracted function has a single, well-defined responsibility.
4. **Deepening Modules (Codebase Design)**:
   - Hide implementation complexity behind a narrow, simple interface.
   - Eliminate shallow wrappers and unnecessary middle-man pass-throughs.
5. **Standard Library Leverage (Ponytail Ladder)**:
   - Replace hand-rolled algorithms with standard library or existing framework utilities.

### Phase 4: Immediate Step Verification
After every single edit:
1. Run the test suite via `run_command`.
2. If any test fails, immediately fix the regression or revert the micro-step.
3. Check language diagnostics or typecheckers (`tsc --noEmit`, `mypy`, `go vet`, `cargo check`).

### Phase 5: Verification Gate & Stop Condition
1. Run the full automated test suite: all tests must pass 100%.
2. Run quality checks via `node bin/cli.mjs quality` and `node bin/cli.mjs analyze` (or project linters).
3. Review `git diff` to confirm that:
   - The diff contains only structural improvements (DRY, readability, module depth).
   - No commented-out dead code, temporary debug logs, or dummy mocks remain.
4. Stop and report concise summary of transformations made and verification proof.
