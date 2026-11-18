---
name: to-tickets
description: Decomposes a readiness-passed specification into a Scrum Sprint Wave Board (docs/sprint/SPRINT.md) and codebase-grounded vertical tickets (docs/sprint/tickets/<NN>-<slug>.md) with reusable shared UI/helpers, source traceability, and acceptance criteria. Use when slicing a multi-session feature into deployable vertical increments.
---

# To Tickets (Codebase-Grounded Vertical Wave Slicing)

Slice a readiness-passed spec into an ordered **Sprint Board (`docs/sprint/SPRINT.md`)** using [resources/sprint-board-template.md](resources/sprint-board-template.md) and session-sized vertical tickets (`docs/sprint/tickets/<NN>-<slug>.md`) using [resources/ticket-template.md](resources/ticket-template.md).

## Decision tree

1. **Does this task fit cleanly in a single session without waves?**
   - **Yes** → Do not generate sprint paperwork. Route directly to `/implement`.
   - **No** → Proceed to step 2.
2. **Does `specs/<slug>.md` exist with `Readiness Verdict: READY FOR TICKETS` (or a clear confirmed PRD)?**
   - **No** → Stop. Resolve ambiguities via `/to-spec` or `ask_question` first. Never slice from a `draft` or vague PRD.
   - **Yes** → Proceed to step 3.
3. **Have you checked `CONTEXT.md` and searched the codebase for existing shared UI, hooks, utils, and touchpoints?**
   - **No** → Read `CONTEXT.md` (run `/index-project` if empty) and inspect existing modules first so tickets mandate real reuse.
   - **Yes** → Proceed to workflow below.
4. **Has the user approved the proposed Wave DAG (`Wave`, `Ticket #`, `Size`, `Source IDs`, `Blocked by`, `Outcome`)?**
   - **No** → Present the compact Wave summary and confirm via `ask_question` before writing ticket files.
   - **Yes** → Write the board and ticket files and run validation gates.

## Slicing workflow

1. **Build Coverage Ledger**:
   - Map every `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###` from the spec to at least one owning ticket, public seam, and test. An `OPEN` row blocks board creation.
2. **Ground Every Ticket in Existing Codebase**:
   - For each ticket, search the repo and explicitly list:
     - **Reusable Assets (`path:symbol`)**: existing UI primitives, tokens, hooks, helpers, schemas, and API clients to reuse or extend (banning duplicate components/helpers).
     - **Exact Touchpoints**: existing files to edit and sibling callers to check.
3. **Slice Vertically by Observable Behavior (Never by Layer)**:
   - Each ticket (`S` or `M`, ≤1 session) cuts through validation, authorization, domain rule, UI states (if UI), persistence, error mapping, and tests.
   - Reject layer-only tickets (`Add DB table`, `Wire UI later`, `Harden later`, `MVP`).
   - Security, validation, error handling, and tests ship inside the ticket that introduces the seam—never deferred.
   - Mark genuinely inapplicable checklist items `N/A — <reason>` instead of inventing filler.
4. **Order Waves (`Blocked by`)**:
   - Put pure behavior-preserving prefactoring at `#01` (`Wave 1`) if structural cleanup is needed first.
   - Derive `Blocked by` strictly from real data/contract dependencies (acyclic DAG).

## Anti-hallucination & validation gates

- Never invent endpoints, tables, error codes, limits, or verification commands not present in the spec or repo.
- Surface spec vs codebase contradictions to the user instead of silently choosing a winner.
- Before marking `Board Status: READY`: every spec ID has an owner, every ticket cites `Source Requirements` + `Source Decisions` + `Reusable Assets` + `Verification Command`, zero `OPEN` items exist on `ready` tickets, and `Blocked by` is acyclic.
