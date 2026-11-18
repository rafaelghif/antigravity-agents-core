---
name: domain-modeling
description: Reconciles domain terminology, falsifiable invariants, sealed/union state machines, and ownership boundaries in CONTEXT.md across TypeScript, Dart, Go, Python, and Rust, and records costly-to-reverse architectural decisions as ADRs. Use when defining domain rules, resolving vocabulary conflicts, or evaluating an ADR.
---

# Domain Modeling (Ubiquitous Language, Invariants & 3-Gate ADRs)

Keep domain rules unambiguous, falsifiable, and impossible to violate across specs, tickets, code, and tests. Consult [references/modeling-checklist.md](references/modeling-checklist.md) and [examples/domain-invariant-example.md](examples/domain-invariant-example.md).

## Decision tree

1. **Does a term, invariant, or state machine conflict with `CONTEXT.md`, a DDR (`DEC-###`), a spec, an ADR, or existing code?**
   - **Yes** → **STOP.** Present both statements with exact `path:line` / ID citations and production consequences, then resolve via `ask_question`. Never silently pick one.
   - **No** → Proceed to step 2.
2. **Did a domain term, invariant, ownership rule, or state transition settle or change?**
   - **Yes** → Record it in `CONTEXT.md` §6–7 with a stable ID (`INV-###`, `ST-###`, `NFR-###`, `ERR-###`), then search `specs/`, `docs/sprint/`, and `docs/adr/` via `rg -n` and propagate updates before coding resumes.
   - **No** → Proceed to step 3.
3. **Does an architectural decision pass all 3 ADR Gates?**
   - Gate 1: **Costly to reverse** (significant data/API migration cost later).
   - Gate 2: **Non-obvious without context** (future engineers will ask *why*).
   - Gate 3: **Genuine trade-off** (viable alternatives were evaluated).
   - **All 3 hold** → Write `docs/adr/NNNN-<slug>.md` using [resources/adr-template.md](resources/adr-template.md).
   - **Any missing** → Skip ADR and keep rationale in the DDR or `CONTEXT.md`.

## Modeling protocol

1. **Read Upstream Sources End-to-End**: `CONTEXT.md`, `docs/discovery/<slug>.md`, `specs/<slug>.md`, `docs/adr/`, and relevant domain models.
2. **Eliminate Vague Nouns**: Replace overloaded terms (`item`, `data`, `status`, `account`) with bounded domain types (`InvoiceLineItem`, `TenantMember`).
3. **Make Illegal States Unrepresentable**: Collapse flag clusters into language-native sum types (TS discriminated unions, Dart 3 `sealed class`, Rust `enum`, Python `Literal` union, Go typed state interface) and visualize transitions with Mermaid `stateDiagram-v2` (entry/exit `[*]`) plus scoped bounded-context `erDiagram` (`PK`/`FK`) when entities or schemas change.
4. **Keep Invariants Falsifiable**: Every `INV-###` must specify the exact illegal state it forbids and the boundary/forbidden-transition test that catches regressions.
5. **Propagate Explicitly**: Emit a short propagation table (`Changed ID`, `Affected File`, `Required Action`, `Status`) before finishing.

## Anti-hallucination rules

- Never invent domain rules, tenant boundaries, budgets, or error codes; unknowns become `OPEN` (`OQ-###`).
- Never infer authorization semantics from a property name (`isAdmin`); inspect the actual enforcement code (`path:line`).
