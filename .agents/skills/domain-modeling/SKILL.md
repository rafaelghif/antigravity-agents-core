---
name: domain-modeling
description: Sharpens the ubiquitous domain language in CONTEXT.md, reconciles it against the confirmed Discovery Decision Record and existing specs, and records hard-to-reverse architectural decisions as ADRs with explicit invariants, state machines, ownership boundaries, failure modes, and production consequences. Use when defining domain concepts, resolving vocabulary conflicts, specifying state machines, or recording architecture decisions, even if the user never says domain modeling.
---

# Domain Modeling (Ubiquitous Language, Invariants & ADRs)

Actively build and sharpen the project's domain model by challenging fuzzy terminology, maintaining the invariant registry, updating `CONTEXT.md` inline, and recording consequential Architectural Decision Records (ADRs). The domain model is the source of truth that specs, tickets, and tests inherit—fuzzy terms and unrecorded invariants become production defects.

This skill **reconciles** the domain model; it does not invent one. When a DDR or spec already settled a term or rule, treat it as evidence to verify, not as an opening position to rewrite from taste.

## Input / Output Contract

- **Required inputs when they exist**: `docs/discovery/<feature-slug>.md` (DDR), `specs/<feature-slug>.md`, `CONTEXT.md`, `docs/adr/`, and the repository code. Read each relevant file end-to-end.
- **Outputs**: updated `CONTEXT.md` entries with stable IDs, a new or superseded ADR at `docs/adr/NNNN-<slug>.md` when the 3 gates hold, and an explicit propagation report naming every spec/ticket that must change.
- **No silent defaults**: every term, invariant, state machine, ownership rule, data class, NFR, and error code is `KNOWN` (source cited), `OPEN` (blocking question), `ASSUMED` (approved assumption), or `N/A` (one-line rationale).

## Source Priority (highest wins)

1. An explicit instruction from the user in this session.
2. A confirmed `DEC-###` in the DDR.
3. An accepted spec requirement or `ADR-####`.
4. `CONTEXT.md` and existing repository code (`path:line`).
5. A live primary source from `/research` for external platform behavior.
6. A recorded `ASM-###` assumption—never an unmarked guess.

If two sources conflict, stop and surface the contradiction instead of silently choosing a winner.

## Decision tree

1. **Did a domain term, entity definition, or bounded-context boundary settle or change?**
   - **Yes** → Reconcile it against `CONTEXT.md` and the DDR, then update `CONTEXT.md` immediately. Keep it a pure domain glossary, invariant registry, and boundary map (zero implementation details or task lists).
   - **No** → Proceed to step 2.
2. **Did an invariant, state transition, ownership/authorization rule, data classification, or quality attribute settle or change?**
   - **Yes** → Record it in `CONTEXT.md` with a stable ID (`INV-###`, `ST-###`, `POL-###`, `NFR-###`, `ERR-###`), then propagate to every affected spec and ticket. Never leave a domain rule trapped in chat.
   - **No** → Proceed to step 3.
3. **Does the change conflict with any existing `DEC-###`, spec requirement, ADR, `CONTEXT.md` entry, or code behavior?**
   - **Yes** → Stop. Present both statements with their sources, state the concrete production failure each would cause, and ask which is canonical. Update the losing artifact explicitly; never leave two contradictory truths.
   - **No** → Proceed to step 4.
4. **Does an architectural decision qualify for an ADR in `docs/adr/`?**
   Check the **3 ADR Gates**:
   - Gate 1: **Hard to reverse** (changing your mind later carries significant migration cost).
   - Gate 2: **Surprising without context** (a future engineer will ask *"why did they do it this way?"*).
   - Gate 3: **Result of a real trade-off** (genuine alternatives existed and one was chosen for specific reasons).
   - **All 3 gates hold** → Write `docs/adr/NNNN-<slug>.md` using [resources/adr-template.md](resources/adr-template.md).
   - **Any gate is missing** → Skip the ADR and record the reason in the propagation report.
5. **Does the decision change an existing invariant, public seam, or ticket contract?**
   - **Yes** → Propagate the change: search `specs/`, `docs/sprint/`, and `docs/adr/` end-to-end, then update the traceability matrix before implementation resumes.
   - **No** → Record the decision and stop.

## Modeling protocol

1. **Challenge against the existing glossary**:
   - When the user uses a term that conflicts with `CONTEXT.md`, a DDR `DEC-###`, or existing code entities, surface the contradiction immediately (`"CONTEXT.md defines X as ..., but DEC-007 and the code at path:line mean Y. Which is canonical?"`).
2. **Eliminate overloaded terms**:
   - Replace vague terms (`account`, `item`, `data`, `record`) with precise domain nouns (`Tenant`, `SubscriptionSeat`, `InvoiceLineItem`).
3. **Model state machines, not flag clusters**:
   - Define allowed and forbidden transitions. If two boolean flags can represent an impossible combination, collapse them into a discriminated union so the illegal state cannot exist.
4. **Make invariants testable**:
   - Every invariant gets an ID, a precise statement, and the boundary or forbidden-transition test that proves it. "The system must be consistent" is not an invariant.
5. **Record ownership and authorization boundaries**:
   - State which principal owns each aggregate, which tenant boundary applies, and which cross-tenant access must be impossible.
6. **Classify data and lifecycle**:
   - Record sensitivity (`public`, `internal`, `confidential`, `restricted`), retention, deletion, and audit requirements at the domain level.
7. **Record measurable quality attributes**:
   - Replace vague adjectives (`fast`, `scalable`, `secure`) with measurable constraints (latency percentiles, consistency model, durability, availability, recovery targets).
8. **Probe boundaries with edge-case scenarios**:
   - Test relationships using concrete boundary scenarios (partial refunds, multi-tenant ownership transfers, expired grace periods, duplicate commands, concurrent mutation).
9. **Propagate before proceeding**:
   - A renamed entity or changed invariant is a contract change. Use `grep_search` across `specs/`, `docs/sprint/`, `docs/adr/`, and code before declaring the model settled. Produce a propagation report:

   | Changed ID | Old Statement | New Statement | Affected Artifact | Required Action | Status |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | `INV-003` | `<old>` | `<new>` | `specs/<slug>.md` | Update requirement and test | `open` |

10. **Keep `CONTEXT.md` a registry, not a scratchpad**:
    - One canonical definition per term. No duplicate IDs, no implementation steps, no ticket status, and no unsourced prose.

## Anti-hallucination rules (non-negotiable)

- **Never invent a domain term, invariant, state, owner, tenant rule, data class, NFR, or error code.** If it is not in the DDR, spec, `CONTEXT.md`, ADR, or code, it is `OPEN`.
- **Never infer semantics from a name**: `isAdmin`, `status`, or `account` do not prove behavior. Cite the code (`path:line`) or ask.
- **Never silently resolve a conflict**: present both sources and the production consequence of each choice.
- **Never invent a standard**: a "best practice" claim needs a live primary source from `/research` or an explicit user decision recorded as `DEC-###`.
- **Never round or improve a number**: copy latency, retention, limits, and RTO/RPO verbatim.
- **Never record an assumption as a fact**: use `ASM-###` with a validation step and an owner.
- **Never copy template examples** into `CONTEXT.md` or an ADR as project facts.
- **Never redefine a settled `DEC-###`** without marking the old decision `superseded` and stating the migration impact.

## Validation gates (must pass before declaring the model settled)

- [ ] Every new or changed term has one canonical definition and a stable ID.
- [ ] Every invariant has a precise statement and a falsifiable boundary or forbidden-transition test.
- [ ] Every state machine names allowed transitions, forbidden transitions, trigger, and guard.
- [ ] Every aggregate names its owner/tenant rule and the cross-tenant access that must fail.
- [ ] Every data asset has a classification, retention rule, and audit requirement.
- [ ] Every quality attribute is numeric with a unit and a measurement method.
- [ ] Every conflict is resolved explicitly with both sources named.
- [ ] Every affected spec, ticket, ADR, and `CONTEXT.md` entry is updated or explicitly marked for update.
- [ ] No invented term, number, schema, or rule remains.

## Route after the model settles

- A settled feature needs a written spec → `/to-spec` (which consumes the DDR and `CONTEXT.md`).
- A ready spec needs vertical slices → `/to-tickets`.
- A module boundary or test seam is still fuzzy → `/codebase-design`.
- The change is isolated and ready to build → `/implement` or `/tdd`.
