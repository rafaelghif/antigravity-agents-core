---
name: domain-modeling
description: Reconciles domain terminology, invariants, state machines, and ownership boundaries in CONTEXT.md against Discovery Decision Records and specs, and records hard-to-reverse architectural decisions as ADRs. Use when defining domain concepts, resolving vocabulary conflicts, specifying state machines, or evaluating an ADR.
---

# Domain Modeling (Ubiquitous Language, Invariants & 3-Gate ADRs)

Maintain canonical domain definitions, falsifiable invariants (`INV-###`), state machines (`ST-###`), and ADRs (`docs/adr/NNNN-<slug>.md`) without inventing unsourced business rules.

## Decision tree

1. **Does a new term, invariant, or state machine conflict with `CONTEXT.md`, a DDR (`DEC-###`), a spec, an ADR, or existing code?**
   - **Yes** → **STOP.** Present both definitions with exact `path:line` / ID sources and their production consequence, then resolve via `ask_question`. Never silently pick one.
   - **No** → Proceed to step 2.
2. **Did a domain term, invariant, ownership rule, or state transition settle or change?**
   - **Yes** → Record it in `CONTEXT.md` §6–7 with a stable ID (`INV-###`, `ST-###`, `NFR-###`, `ERR-###`), then search `specs/`, `docs/sprint/`, and `docs/adr/` via `rg -n` (or search tool) to propagate updates before implementation resumes.
   - **No** → Proceed to step 3.
3. **Does an architectural decision pass all 3 ADR Gates?**
   - Gate 1: **Costly to reverse** (significant migration cost later).
   - Gate 2: **Non-obvious without context** (future engineers will ask *why*).
   - Gate 3: **Genuine trade-off** (real alternatives existed).
   - **All 3 hold** → Write `docs/adr/NNNN-<slug>.md` using [resources/adr-template.md](resources/adr-template.md).
   - **Any missing** → Skip ADR and keep the rationale in the DDR or `CONTEXT.md`.

## Modeling protocol

1. **Read Upstream Sources End-to-End**: `CONTEXT.md`, `docs/discovery/<slug>.md`, `specs/<slug>.md`, `docs/adr/`, and relevant domain files.
2. **Eliminate Overloaded Nouns**: Replace ambiguous labels (`item`, `data`, `record`) with canonical bounded nouns (`InvoiceLineItem`, `SubscriptionSeat`).
3. **Collapse Flag Clusters into State Machines**: Define allowed transitions, forbidden transitions, triggers, and guards so illegal combinations cannot exist.
4. **Keep Invariants Falsifiable**: Every `INV-###` must map to a boundary or forbidden-transition test.
5. **Propagate Changes Explicitly**: Emit a short propagation table (`Changed ID`, `Affected File`, `Required Update`, `Status`) before concluding.

## Anti-hallucination rules

- Never invent domain terms, invariants, tenant rules, numeric budgets, or error codes; unknowns become `OPEN` (`OQ-###`).
- Never infer business semantics solely from variable names (`isAdmin`); inspect the actual enforcement code and cite `path:line`.
