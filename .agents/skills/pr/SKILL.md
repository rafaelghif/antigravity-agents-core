---
name: pr
description: Writes a pull request description with a visual summary, blast radius, door reversibility classification, and before/after verification evidence. Use when opening or updating a pull request or when the user invokes /pr.
---

# Pull Request (PR)

Generate a high-signal Pull Request description starting directly at the `## Summary` heading with zero preamble, using [resources/pr-template.md](resources/pr-template.md).

## Decision tree

1. **Have the changes on the current branch been verified against the test suite?**
   - **No** → Run the test suite and typechecker via `run_command` first so the `## Evidence` section contains real command output rather than an unverified claim.
   - **Yes** → Proceed to step 2.
2. **Does the PR include an irreversible change (destructive DB migration, public API contract break, or data deletion)?**
   - **Yes** → Classify as a **One-Way Door** and explicitly document the rollback/mitigation plan.
   - **No** → Classify as a **Two-Way Door** (safely revertible via `git revert`).

## PR authoring workflow

1. **Inspect the branch diff**:
   - Run `git log <base>..HEAD --oneline` and `git diff <base>...HEAD --stat` via `run_command`.
2. **Draft the visual summary**:
   - Include a compact `mermaid` flowchart or sequence diagram showing what changed so a reviewer understands the PR before opening the diff.
3. **Provide concrete before/after evidence**:
   - Populate [resources/pr-template.md](resources/pr-template.md) with actual test/CLI output or before/after behavior proof.
