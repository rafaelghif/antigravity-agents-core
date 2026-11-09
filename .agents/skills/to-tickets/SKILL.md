---
name: to-tickets
description: Decomposes a production-grade specification and its confirming Discovery Decision Record into a Scrum Sprint Wave Board and session-sized vertical tickets with explicit source provenance, requirement traceability, quality gates, definition of ready, and enterprise definition of done. Use when a spec or multi-step feature must be sliced into deployable vertical increments instead of MVP prototype tasks.
---

# To Tickets (Traceable Scrum & Vertical Wave Slicing)

Break a production-grade specification into an ordered **Scrum Sprint Board (`docs/sprint/SPRINT.md`)** and **session-sized vertical tracer-bullet tickets (`docs/sprint/tickets/<NN>-<slug>.md`)** organized by **Execution Waves (DAG)**. Every ticket is a **deployable, production-safe vertical increment** that cites the exact requirement it satisfies—not a horizontal layer task and not an MVP scaffold.

A ticket is a contract, not a wish. If a ticket cannot cite the requirement, the seam, the error contract, and the verification command it inherits, it is not ready to exist.

## Input / Output Contract

- **Required inputs**:
  1. `specs/<feature-slug>.md` with `Readiness Verdict: READY FOR TICKETS`.
  2. `docs/discovery/<feature-slug>.md` (the confirmed Discovery Decision Record) for provenance of decisions the spec compressed.
- **Supporting inputs**: `CONTEXT.md`, `docs/adr/`, and the repository code for blast-radius facts. Read each relevant file end-to-end.
- **Outputs**: `docs/sprint/SPRINT.md` using [resources/sprint-board-template.md](resources/sprint-board-template.md) and one file per ticket at `docs/sprint/tickets/<NN>-<slug>.md` using [resources/ticket-template.md](resources/ticket-template.md). Use `.scratch/sprint/` only when the user explicitly requests local-only, gitignored tracking.
- **No silent defaults**: every ticket field is `KNOWN` (source cited), `OPEN` (blocking question), `ASSUMED` (approved assumption), or `N/A` (one-line rationale).

## Source Priority (highest wins)

1. An explicit instruction from the user in this session.
2. A `REQ-###` / `INV-###` / `NFR-###` / `SEC-###` / `ERR-###` in the readiness-passed spec.
3. A confirmed `DEC-###` in the DDR.
4. `CONTEXT.md` invariants and `docs/adr/` decisions.
5. Repository code and configuration (`path:line`).
6. A live primary source from `/research` for external APIs or platform behavior.
7. A recorded `ASM-###` assumption—never an unmarked guess.

If two sources conflict, stop and surface the contradiction. Never pick the interpretation that makes the ticket easier to write.

## Decision tree

1. **Is this a small or single-session task that does not span multiple sessions or waves?**
   - **Yes** → Do NOT generate a sprint board. Build directly via `/implement` or `/tdd` (Fast-Path), but still apply the **Production Quality Contract** below and cite the spec requirement IDs.
   - **No** → Proceed to step 2.
2. **Does the spec exist and carry `Readiness Verdict: READY FOR TICKETS`?**
   - **No** → Stop. Return to `/to-spec` and resolve the blocking `OQ-###`/`ASM-###` items. Never derive tickets from a `draft` spec or from chat memory.
   - **Yes** → Proceed to step 3.
3. **Can every in-scope spec ID be mapped to at least one ticket, seam, and test?**
   - **No** → Build the coverage ledger below. Unmapped IDs block the board; do not invent filler tickets.
   - **Yes** → Proceed to step 4.
4. **Does the codebase need structural prefactoring before feature slices can land cleanly?**
   - **Yes** → Put a pure behavior-preserving **Prefactoring** ticket at `#01` (`Wave 1`, `Blocked by: None`) so refactoring is never mixed into feature tickets.
   - **No** → Proceed to step 5.
5. **Is the work a wide mechanical change where no vertical slice can land green alone?**
   - **Yes** → Sequence the slices as **Wave 1: Expand → Wave 2: Migrate Batches → Wave 3: Contract**.
   - **No** → Proceed to step 6.
6. **Does any proposed ticket exceed one focused session, contain more than one independent behavior, touch more than four modules, or lack a single demoable outcome?**
   - **Yes** → Split it by observable behavior into `S` or `M` vertical slices before presenting the board. Never split by architectural layer.
   - **No** → Proceed to step 7.
7. **Has the user approved the proposed Sprint Wave Board and `Blocked by` edges?**
   - **No** → Present the Sprint Wave summary (`Wave`, `Ticket #`, `Size`, `Source IDs`, `Blocked by`, `Demoable Outcome`) and confirm first.
   - **Yes** → Write the board and tickets, then run the output validation gates below.

## Step 1 — Build the coverage ledger before writing tickets

Read the spec end-to-end, then the DDR. Create an internal ledger:

| Spec ID | Requirement summary | Owning ticket | Public seam | Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | <one line> | `#02` | `<seam>` | `<test>` | `covered` |
| `NFR-001` | <budget> | `#03` | `<seam>` | `<benchmark>` | `covered` |
| `SEC-002` | <threat> | `#02` | `<seam>` | `<authz test>` | `OPEN` |

Rules:

- Every `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###` in scope appears in the ledger.
- An ID may be owned by multiple tickets, but it must have at least one owner.
- An `OPEN` row blocks board creation; ask the user or return to `/to-spec`.
- A ticket with no source ID is invalid. Delete it or attach the requirement it actually serves.

## Step 2 — Derive tickets from behavior, not from layers

For each cohesive behavior in the spec:

1. **Name the observable outcome**: what production behavior can be demonstrated when the ticket is done?
2. **Attach the source IDs**: the exact `REQ-###` plus every `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###` the slice must satisfy.
3. **Identify the public seam**: the endpoint, CLI command, or exported module function where a test asserts behavior.
4. **Slice vertically**: the ticket must cut through parsing, authorization, domain rule, persistence, error mapping, observability, and its tests. If any of those is missing, the slice is incomplete.
5. **Size it**: `S` or `M`, one session, one demoable outcome. Split when it exceeds that.
6. **Place it in the DAG**: compute `Blocked by` from real data/contract/ordering dependencies, not from layer convention.
7. **Define the proof**: exact verification command plus Given/When/Then acceptance criteria.

**Ticket derivation anti-patterns (reject on sight)**:

- `Add database table` with no behavior, auth, or test.
- `Create repository` with no seam or demoable outcome.
- `Wire UI later` that defers error mapping or authorization.
- `Harden later` that moves security, idempotency, or tests out of the introducing ticket.
- `Handle edge cases` with no boundary matrix or `ERR-###` mapping.
- A ticket titled `MVP`, `prototype`, `wireframe`, or `temporary`.

## Production Quality Contract (applies to every ticket and fast-path slice)

Every ticket must carry the following, or explicitly mark it `N/A` with a one-line rationale. If the complete production behavior does not fit one session, split the behavior into smaller vertical slices—never split away the quality gates.

1. **Traceability**: The exact source IDs and the `DEC-###` provenance behind them.
2. **Public seam and contract**: The exact interface under test, input/output schema, and error mapping.
3. **Boundary parsing**: Zero-trust validation at ingress ("Parse, don't validate"), maximum payload bounds, and typed domain representation.
4. **Authorization**: Authentication and tenant/owner checks on every read and mutation, with an explicit BOLA/IDOR test.
5. **Transactional integrity**: Atomic mutations, idempotency keys for duplicate requests, and concurrency/optimistic-lock behavior.
6. **Failure behavior**: Timeouts, bounded retries with backoff and jitter, degradation, and explicit error wrapping with preserved causes.
7. **Observability**: Structured logs with trace context, required metrics, and alert-worthy failure signals.
8. **Performance budget**: A measurable budget when the seam is latency-, throughput-, or memory-sensitive.
9. **Migration and rollback**: For schema or contract changes, the expand-migrate-contract sequence and rollback proof.
10. **Test proof**: Falsifiable tests for the happy path, `N-1`/`N`/`N+1` boundaries, unauthorized access, duplicate idempotency, and at least one failure mode.

**No deferred hardening**: Security, data-integrity, correctness, and test proof belong to the ticket that introduces the seam. A separate hardening ticket is allowed only for non-safety improvements (performance tuning, cost, or developer experience), and only when the spec explicitly permits it and the intermediate state is safe to deploy. It may never defer authorization, validation, data integrity, failure handling, observability, or tests.

## Scrum Slicing & Wave Protocol

1. **Vertical Tracer Bullets + Execution Waves (DAG)**:
   - Every ticket cuts a narrow, complete path through all required layers (schema, domain logic, entry seam, automated test, observability).
   - Group tickets into **Execution Waves**: `Wave 1` has `Blocked by: None`; `Wave N` is blocked only by earlier waves.
   - **Wave exit gate**: Every ticket in the wave is `done`, the full verification command passes, no skipped or weakened tests remain, migrations are rehearsed, and no production mock or `TODO` is inside the wave's diff.
2. **Enforce Definition of Ready (DoR)**:
   - A ticket is `ready` only with: one `S`/`M` objective, explicit scope boundaries, source IDs, a concrete seam and contract, ordered `Red → Green → Harden → Refactor` sub-tasks, measurable security/failure/performance gates, Given/When/Then criteria, and the exact verification command.
3. **Ticket Hygiene (anti-mess)**:
   - One objective per ticket; the title states the outcome, not the layer.
   - IDs are unique and stable; `Blocked by` edges form an acyclic graph with no orphan or duplicate tickets.
   - Every ticket links to its spec requirement, source `DEC-###`, and the downstream contract it introduces.
   - Status transitions are atomic: `blocked → ready → in-progress → in-review → done`; never mark `done` while any DoD gate is open.
   - A spec change invalidates affected tickets explicitly; never silently mutate scope mid-wave.
   - A split ticket preserves its source IDs and downstream contracts.
4. **Cross-Session Continuity & Handover Built-In**:
   - Every ticket includes a `## 9. Session Handover & Completion Log` section so a completed session records the commit SHA, verification evidence, and exact contract/seam notes the next ticket depends on.

## Anti-hallucination rules (non-negotiable)

- **Never invent** a requirement, table, column, endpoint, error code, limit, latency number, dependency, or command. If it is not in the spec, the DDR, or the repo, it is `OPEN`.
- **Never derive behavior from a ticket title**: the title is a label, not a contract. The contract comes from the source ID.
- **Never create a filler ticket** to make the board look complete. An unmapped requirement is a blocker, not a job for a vague task.
- **Never assume a dependency**: `Blocked by` must reflect a real data, contract, or ordering constraint that you can name.
- **Never convert an `ASM-###` into a fact**: carry the assumption ID and its validation step into the ticket.
- **Never copy illustrative examples** from templates as if they were project facts.
- **Never quote a verification command you have not seen**: use the spec's exact command; if absent, `OPEN`.
- **Surface conflicts**: if the spec and DDR disagree, stop and resolve in the upstream artifact first.

## Output validation gates (must pass before presenting the board)

- [ ] Every in-scope spec ID appears in the coverage ledger and is owned by at least one ticket.
- [ ] Every ticket cites at least one source ID and its `DEC-###` provenance.
- [ ] Every ticket has a public seam, an error contract, a boundary matrix, and a verification command.
- [ ] Every ticket has authorization, idempotency/concurrency, failure, and observability gates—or `N/A` with a rationale.
- [ ] No ticket defers security, validation, data integrity, failure handling, observability, or tests.
- [ ] `Blocked by` edges are acyclic and reference existing ticket IDs only.
- [ ] No ticket exceeds one session or bundles independent behaviors.
- [ ] No `OPEN` field remains on a ticket marked `ready`.
- [ ] The board's traceability matrix matches the spec's traceability matrix, with ticket IDs filled in.
- [ ] The user has approved the wave plan and dependency edges.

If any gate fails, write `Board Status: NOT READY` with the blocking ticket IDs. Do not create files that claim readiness.

## Route after approval

- One unblocked ticket is ready → `/implement` (or `/tdd` for a focused behavioral loop).
- A ticket reveals an undefined domain rule → `/domain-modeling` before implementation.
- A ticket reveals an undefined seam or data contract → `/codebase-design` before implementation.
- The session is ending mid-wave → `/handoff`.
