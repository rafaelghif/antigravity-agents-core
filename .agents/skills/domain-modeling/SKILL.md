---
name: domain-modeling
description: Sharpens domain terminology in CONTEXT.md and records Architectural Decision Records (ADRs) in docs/adr/. Use when defining domain concepts, resolving vocabulary conflicts, updating CONTEXT.md, or recording architectural decisions.
---

# Domain Modeling

Actively build and sharpen the project's domain model by challenging fuzzy terminology, updating `CONTEXT.md` inline, and recording consequential Architectural Decision Records (ADRs).

## Decision tree

1. **Did a domain term, entity definition, or bounded context boundary settle or change?**
   - **Yes** → Update `CONTEXT.md` immediately. Keep `CONTEXT.md` strictly as a pure domain glossary and boundary map (zero implementation details or task lists).
   - **No** → Proceed to step 2.
2. **Does an architectural decision qualify for an ADR in `docs/adr/`?**
   Check the **3 ADR Gates**:
   - Gate 1: **Hard to reverse** (changing your mind later carries significant migration cost).
   - Gate 2: **Surprising without context** (a future engineer will ask *"why did they do it this way?"*).
   - Gate 3: **Result of a real trade-off** (genuine alternatives existed and one was chosen for specific reasons).
   - **All 3 gates hold** → Write `docs/adr/NNNN-<slug>.md` using [resources/adr-template.md](resources/adr-template.md).
   - **Any gate is missing** → Skip the ADR.

## Modeling protocol

1. **Challenge against the existing glossary**:
   - When the user uses a term that conflicts with `CONTEXT.md` or existing code entities, surface the contradiction immediately (`"CONTEXT.md defines X as ..., but you mean Y. Which should be canonical?"`).
2. **Eliminate overloaded terms**:
   - Replace vague terms (`account`, `item`, `data`, `record`) with precise domain nouns (`Tenant`, `SubscriptionSeat`, `InvoiceLineItem`).
3. **Probe boundaries with edge-case scenarios**:
   - Test relationships between domain concepts using concrete boundary scenarios (e.g., partial refunds, multi-tenant ownership transfers, expired grace periods).
