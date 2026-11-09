---
name: implement
description: Builds a single Scrum Sprint ticket or specification slice end-to-end with production-grade quality gates, from Definition of Ready through the TDD seam loop to an enterprise Definition of Done, atomic commit when authorized, and Sprint Board handover. Use when implementing a ticket, building a feature slice, or when the user invokes /implement, even if the request sounds small enough for an MVP.
---

# Implement (Scrum Ticket Execution & DoR/DoD Loop)

Build **one unblocked Scrum ticket or vertical specification slice** into production code, test-first, from Definition of Ready (DoR) to Definition of Done (DoD) and Sprint Board synchronization. A green test is necessary but not sufficient: the slice must be deployable to production without a later hardening phase.

## Production Quality Contract (Fast-Path and Ticketed Runs)

1. **Complete behavior, not a happy-path stub**: boundary parsing, authorization, transactions, idempotency, error mapping, and failure behavior are part of the slice.
2. **Traceability**: satisfy the ticket's `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###`; if the request has no ticket, state the requirement and seam before coding.
3. **Zero production fakes**: no mock stores, dummy tokens, fake data, artificial delays, or deferred `TODO` in `src/`.
4. **Observability**: structured logs with trace context, required metrics, and alert-worthy failure signals.
5. **Performance**: meet the measurable budget for latency-, throughput-, or memory-sensitive seams.
6. **Migration safety**: schema/contract changes use expand-migrate-contract with a rehearsed rollback.
7. **Test proof**: happy path, `N-1`/`N`/`N+1` boundaries, unauthorized access, duplicate idempotency, and at least one failure mode.
8. **Prototype quarantine**: throwaway spikes live outside production paths, are explicitly labeled, and never merge.

## Decision tree

1. **Is this a single focused feature slice or bugfix without multi-session sprint tickets?**
   - **Yes** → Execute the **Fast-Path Implementation**: Lock focus on the public seam, read relevant context end-to-end, execute the TDD inner loop (sub-tasks at the seam), apply the **Production Quality Contract**, run full verification, and present the atomic diff. Skip sprint board paperwork, never production safeguards.
   - **No** → Proceed to step 2 for Scrum Sprint ticket workflows.
2. **Were multiple tickets passed or is the spec still unsplit for a multi-session build?**
   - **Yes** → Implement **only one unblocked ticket** per run (check `docs/sprint/SPRINT.md` for the next `ready` ticket in the active Wave). If the spec is too large for one session and has no Sprint Board yet, recommend `/to-tickets` first.
   - **No** → Proceed to step 3.
3. **Does the ticket pass Definition of Ready (all `Blocked by` tickets are `done` and public seams are confirmed)?**
   - **No** → If blocked by an unfinished ticket, alert the user and point to the blocking ticket first. If the public seam is unconfirmed, propose the seam signature and confirm with the user before coding.
   - **Yes** → Execute the 4 implementation steps below.

## Implementation workflow

1. **Start Ticket & Lock Focus**:
   - Read `@CONTEXT.md`, `docs/sprint/SPRINT.md` (if present), and the target ticket (`docs/sprint/tickets/<NN>-<slug>.md`), including any `Downstream Handover Notes` from parent tickets.
   - Read the ticket's `Source Requirements`, `Source Decisions`, `Public Seam`, `Error Mapping`, and exact verification command end-to-end. If the ticket cites a source ID that does not exist in the spec or DDR, stop and fix the ticket before writing code.
   - Mark the ticket status as `in-progress` and restate the exact `In-Scope` behavior, public seam, and source IDs you are building.
2. **Execute Sub-Tasks at the Seam (Fast TDD Inner Loop)**:
   - Search existing directories (`components/`, `utils/`, `lib/`, `hooks/`) via `grep_search` before creating code; reuse or extend existing components and templates instead of authoring duplicate boilerplate.
   - Follow the ticket's `## 5. Execution Plan (Red → Green → Harden → Refactor)` and the `tdd` skill.
   - Implement the **smallest complete production behavior** that satisfies the acceptance criteria—never a happy-path stub. Include boundary parsing, authorization, transactional integrity, idempotency, error mapping, and observability for the behavior exactly as specified.
   - Run the **single test file** and **typechecker** repeatedly during implementation to keep feedback under a few seconds.
3. **Definition of Done (DoD) Verification Gate**:
   - When all acceptance criteria for the slice pass in the single test file, run the **full test suite**, typechecker, and linter via `run_command`.
   - **Production Gate Audit**: Verify authorization/tenancy, idempotency, failure behavior, observability, migration/rollback, and performance budget from the ticket's `## 6. Production Quality Checklist` (or the **Production Quality Contract** on a fast-path run).
   - **Test Integrity Audit**: Inspect `git diff` to ensure zero skipped tests (`.skip`, `xit`), zero weakened assertions, and verify that all behavioral changes reside in genuine production code.
   - **Zero-Debt Audit**: Inspect the diff for production mocks, stubs, fake data, artificial delays, `TODO` placeholders, and swallowed errors.
4. **Atomic Commit & Cross-Session Sprint Sync**:
   - Check off completed sub-tasks, acceptance criteria (`[x]`), and production quality gates in the ticket file.
   - If the user authorized commits in this session, create a single atomic Conventional Commit (`feat(scope): ... (#NN)`) containing only this vertical slice. Otherwise leave the tree green and record the proposed commit message and file list in the ticket log; do not commit on the user's behalf.
   - Record the commit SHA (or `pending user authorization`), verification status, production gates verified, and `Downstream Handover Notes` in the ticket's `## 9. Session Handover & Completion Log`.
   - Update `docs/sprint/SPRINT.md`: set this ticket to `done` (with the commit SHA, or `pending user authorization`), promote newly unblocked downstream tickets from `blocked` to `ready`, and state the next recommended ticket for the next session.
