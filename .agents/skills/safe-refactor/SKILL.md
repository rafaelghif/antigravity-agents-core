---
name: safe-refactor
description: Restructures code in atomic behavior-preserving steps verified by characterization and regression tests. Use when refactoring code, eliminating duplication, or consolidating shared UI/helpers without changing external behavior.
---

# Safe Refactor

Restructure internal code and eliminate duplication while preserving 100% of observable external behavior at every step.

## Decision tree

1. **Are you trying to change observable behavior and restructure code in the same step?**
   - **Yes** → Separate into two passes/commits: land the behavior-preserving refactor first, then apply the behavioral change.
   - **No** → Proceed to step 2.
2. **Do passing automated tests cover the public seam of the code being refactored?**
   - **No** → Write characterization tests at the public seam and confirm they pass before changing internals.
   - **Yes** → Proceed to workflow below.

## Workflow

1. **Baseline & Caller Check**:
   - Search all callers of target symbols (`rg -n` via `run_command` or search tool).
   - Run the typechecker and test suite via `run_command` to verify a green baseline.
2. **Atomic Transformations**:
   - Extract duplicated UI/helpers/validators into existing shared modules.
   - Collapse shallow pass-through wrappers and replace boolean flag clusters with discriminated unions.
3. **Bracketed Verification**:
   - Run typecheck and tests immediately after each transformation. If a step breaks and cannot be fixed cleanly, revert only your own edit (via `edit_file` or `git stash push -- <file>`, never `git checkout -- .`) and take a smaller step.
