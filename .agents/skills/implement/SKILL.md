---
name: implement
description: Builds a single Scrum Sprint ticket or specification slice end-to-end from Definition of Ready (DoR) check and TDD seam loop to Definition of Done (DoD), atomic commit, and Sprint Board handover update. Use when implementing a ticket, building a feature slice, or when the user invokes /implement.
---

# Implement (Scrum Ticket Execution & DoR/DoD Loop)

Build **one unblocked Scrum ticket or vertical specification slice** into production code, test-first, from Definition of Ready (DoR) to Definition of Done (DoD) and Sprint Board synchronization.

## Decision tree

1. **Were multiple tickets passed or is the spec still unsplit for a multi-session build?**
   - **Yes** → Implement **only one unblocked ticket** per run (check `docs/sprint/SPRINT.md` for the next `ready` ticket in the active Wave). If the spec is too large for one session and has no Sprint Board yet, recommend `/to-tickets` first.
   - **No** → Proceed to step 2.
2. **Does the ticket pass Definition of Ready (all `Blocked by` tickets are `done` and public seams are confirmed)?**
   - **No** → If blocked by an unfinished ticket, alert the user and point to the blocking ticket first. If the public seam is unconfirmed, propose the seam signature and confirm with the user before coding.
   - **Yes** → Execute the 4 implementation steps below.

## Implementation workflow

1. **Start Ticket & Lock Focus**:
   - Read `@CONTEXT.md`, `docs/sprint/SPRINT.md` (if present), and the target ticket (`docs/sprint/tickets/<NN>-<slug>.md`), including any `Downstream Handover Notes` from parent tickets.
   - Mark the ticket status as `in-progress` and restate the exact `In-Scope` behavior and public seam you are building.
2. **Execute Sub-Tasks at the Seam (Fast TDD Inner Loop)**:
   - Follow the ticket's `## 4. Execution Plan (Red → Green → Refactor Sub-Tasks)` and the `tdd` skill.
   - Run the **single test file** and **typechecker** repeatedly during implementation to keep feedback under a few seconds.
3. **Definition of Done (DoD) Verification Gate**:
   - When all acceptance criteria for the slice pass in the single test file, run the **full test suite**, typechecker, and linter via `run_command`.
4. **Atomic Commit & Cross-Session Sprint Sync**:
   - Check off completed sub-tasks and acceptance criteria (`[x]`) in the ticket file.
   - Create a single atomic Conventional Commit (`feat(scope): ... (#NN)`) containing only this vertical slice.
   - Record the commit SHA, verification status, and `Downstream Handover Notes` in the ticket's `## 6. Session Handover & Completion Log`.
   - Update `docs/sprint/SPRINT.md`: set this ticket to `done` (with commit SHA), promote newly unblocked downstream tickets from `blocked` to `ready`, and state the next recommended ticket for the next session.
