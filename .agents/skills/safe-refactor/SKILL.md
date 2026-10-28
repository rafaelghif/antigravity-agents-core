---
name: safe-refactor
description: Restructures code in atomic behavior-preserving steps verified by characterization and regression tests. Use when refactoring code, eliminating duplication, or deepening shallow modules without changing external behavior.
---

# Safe Refactor

Restructure internal code while preserving 100% of observable external behavior at every step.

## Decision tree

1. **Are you trying to change observable business behavior and restructure code in the same step?**
   - **Yes** → Separate into two commits: complete the pure behavior-preserving refactor first, then implement the behavioral change.
   - **No** → Proceed to step 2.
2. **Do passing automated tests already cover the public seam of the code being refactored?**
   - **No** → Write **Characterization Tests** at the public seam first and confirm they pass before modifying internals.
   - **Yes** → Proceed to step 3.

## Refactoring workflow

1. **Baseline & caller check**:
   - Run `grep_search` to map every caller of the target symbol across the workspace.
   - Run the typechecker and test suite via `run_command` to confirm a green baseline.
2. **Apply one atomic transformation at a time**:
   - Inline shallow pass-through wrappers or middle-man delegates.
   - Extract duplicated logic into a single pure helper.
   - Replace boolean flag clusters with a discriminated union.
   - Move methods exhibiting Feature Envy onto the module that owns the data.
3. **Bracketed verification**:
   - Run typecheck and tests immediately after each transformation. If verification fails and cannot be fixed within 30 seconds, revert (`git checkout -- <file>`) and take a smaller step.
