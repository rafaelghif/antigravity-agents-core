# Ticket #<NN>: <Ticket Title>

- **Wave**: `Wave <W>`
- **Size**: `S` | `M` (1 session max)
- **Status**: `ready` | `in-progress` | `in-review` | `done` | `blocked`
- **Blocked by**: `None` (or `#<MM>: <Blocking Ticket Title>`)
- **Unblocks**: `None` (or `#<KK>: <Downstream Ticket Title>`)
- **Spec / Context**: `specs/<feature-slug>.md` | `CONTEXT.md`

## 1. Objective & Why (Vertical Behavior)

Describe the end-to-end user or system behavior this ticket delivers and why it matters (never a horizontal single-layer task).

## 2. Scope Boundary (Session Focus)

- **In-Scope**: Exact capability delivered in this ticket.
- **Out-of-Scope**: Capabilities deferred to downstream tickets so this session stays focused.

## 3. Public Seam & Touchpoints

- **Primary Seam Under Test**: Exact public interface (endpoint, CLI command, or exported module function) where automated tests assert behavior.
- **Expected Touchpoints**: Modules/directories expected to be created or modified.

## 4. Execution Plan (Red → Green → Refactor Sub-Tasks)

- [ ] **Step 1 (Red)**: Write failing test at `<public seam>` covering happy path and boundary failures.
- [ ] **Step 2 (Green)**: Implement minimal production logic and boundary validation to pass the test.
- [ ] **Step 3 (Refactor & Verify)**: Clean up duplication, check callers via `grep_search`, and run full verification.

## 5. Acceptance Criteria & Verification

- **Verification Command**: `<exact runnable test & typecheck command>`
- [ ] **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>`.
- [ ] **Boundary / Error Check**: `<invalid input, unauthorized tenant, or race condition>` fails fast with zero side effects.
- [ ] **Definition of Done (DoD)**: All tests pass, linter/typecheck clean, atomic commit created, and `docs/sprint/SPRINT.md` updated.

## 6. Session Handover & Completion Log

- **Completed Commit SHA**: `<pending | short-sha>`
- **Verification Output**: `<pending | PASS summary>`
- **Downstream Handover Notes**: `<Contracts, types, or edge-case notes that the next session/ticket needs to know>`
