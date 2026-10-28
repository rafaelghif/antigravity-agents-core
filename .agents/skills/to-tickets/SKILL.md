---
name: to-tickets
description: Decomposes a specification or plan into a Scrum Sprint Board (Execution Waves DAG) and session-sized vertical tracer-bullet tickets with Definition of Ready (DoR), Definition of Done (DoD), and cross-session handover logs. Use when breaking a spec or multi-step feature into buildable vertical slices or sprint tickets.
---

# To Tickets (Technical Scrum & Vertical Wave Slicing)

Break a specification or plan into an ordered **Scrum Sprint Board (`docs/sprint/SPRINT.md`)** and **session-sized vertical tracer-bullet tickets (`docs/sprint/tickets/<NN>-<slug>.md`)** organized by **Execution Waves (DAG)** so work is effortless to execute across single or multiple sessions.

## Decision tree

1. **Does the codebase need structural prefactoring before feature slices can land cleanly?**
   - **Yes** → Put a pure behavior-preserving **Prefactoring** ticket at `#01` (`Wave 1`, `Blocked by: None`) so refactoring is never mixed into feature tickets.
   - **No** → Proceed to step 2.
2. **Is the work a wide mechanical change (renaming a column or shared contract across many callers) where no vertical slice can land green alone?**
   - **Yes** → Sequence tickets across waves as **Wave 1: Expand → Wave 2: Migrate Batches → Wave 3: Contract**.
   - **No** → Draft vertical tracer-bullet slices below.
3. **Does any proposed ticket exceed 1 focused session (`XL` size, >1 independent behavior, or >4 modules)?**
   - **Yes** → Split it into smaller vertical slices (`S` or `M`) before presenting to the user.
   - **No** → Proceed to step 4.
4. **Has the user approved the proposed Sprint Wave Board and `Blocked by` edges?**
   - **No** → Present the Sprint Wave summary (`Wave`, `Ticket #`, `Size`, `Blocked by`, `Demoable Outcome`) and confirm with the user first.
   - **Yes** → Write `docs/sprint/SPRINT.md` using [resources/sprint-board-template.md](resources/sprint-board-template.md) and each ticket to `docs/sprint/tickets/<NN>-<slug>.md` using [resources/ticket-template.md](resources/ticket-template.md) (or `.scratch/sprint/` if the user requests local-only gitignored tracking).

## Scrum Slicing & Wave Protocol

1. **Vertical Tracer Bullets + Execution Waves (DAG)**:
   - Every ticket must cut a narrow, complete path through all required layers (schema, core logic, entry seam, automated test) and answer *"what behavior can I demo or verify when this ticket is done?"*
   - Group tickets into **Execution Waves**:
     - **Wave 1**: Tickets with `Blocked by: None` (can start immediately or run in parallel).
     - **Wave 2**: Tickets blocked only by Wave 1 tickets.
     - **Wave N**: Tickets blocked by Wave N-1 tickets.
2. **Enforce Definition of Ready (DoR)**:
   - A ticket can only be marked `ready` if it has: (a) a single clear objective sized `S` or `M` (completable in 1 session), (b) explicit `In-Scope` vs `Out-of-Scope` boundaries, (c) a concrete public seam under test, (d) ordered `Red → Green → Refactor` sub-tasks, and (e) an exact verification command + `Given/When/Then` acceptance criteria.
3. **Cross-Session Continuity & Handover Built-In**:
   - Every ticket includes a `## 6. Session Handover & Completion Log` section so when a session completes a ticket, it records the commit SHA and any contract/seam notes needed by downstream tickets in the next session.
