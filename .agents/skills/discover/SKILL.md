---
name: discover
description: Interviews the user to resolve ambiguous requirements, PRDs, UI states, architecture, domain invariants, and failure modes, then writes a grounded Discovery Decision Record (docs/discovery/<slug>.md) with stable DEC/OQ/ASM IDs. Use when requirements, tickets, PRDs, or architecture are incomplete or need stress-testing before writing specs, tickets, or code (pairs with built-in /grill-me).
---

# Discover (Ambiguity Resolution & 6-Pillar Interview)

Resolve every ambiguity and stress-test architectural choices **before** specs, tickets, or code are written. Persist settled decisions in `docs/discovery/<feature-slug>.md` using [resources/discovery-record-template.md](resources/discovery-record-template.md) (pairs naturally with Antigravity's built-in `/grill-me`).

## Decision tree

1. **Is the missing fact already answered in the repository (`CONTEXT.md`, manifests, existing code)?**
   - **Yes** → Inspect the repo directly (or via `codebase-investigator`) and cite `path:line`. Never ask the user what the codebase already proves.
   - **No** → Proceed to step 2.
2. **Does the user's premise or proposed design violate YAGNI, security, concurrency, or scalability?**
   - **Yes** → Push back immediately (`[Premise Flaw] -> [Production Failure Mode] -> [Concrete Alternative]`) before accepting it as a decision.
   - **No** → Proceed to step 3.
3. **Are any behavior-changing questions still open?**
   - **Yes** → Interview via `ask_question` (one focused branch or tight blocking batch with `(Recommended)` first) until all blocking `OQ-###` items are settled or explicitly deferred.
   - **No** → Write/confirm `docs/discovery/<feature-slug>.md` and route downstream.

## Discovery frontier (audit in order; skip genuinely `N/A` areas)

1. **Problem, Scope & Non-Goals**: Exact outcome, actors, and what is explicitly out of scope.
2. **Existing Codebase Reuse**: Which existing UI primitives, API clients, schemas, and domain modules from `CONTEXT.md` will be reused or extended.
3. **Architecture & Boundaries**: Topology, module ownership, public seams, and external dependencies (never impose static layouts or monorepos without user approval).
4. **Domain Rules & Illegal States**: Canonical terms, invariants (`INV-###`), state transitions (`ST-###`), and tenant/owner authorization rules.
5. **UI / UX States (if UI)**: Loading, empty, validation error, server error, optimistic/disabled states, and responsive behavior.
6. **Data, Security & Failures**: Payload schemas, idempotency, concurrency locks, timeouts/retries, error responses (`ERR-###`), and migrations/rollback.
7. **Verification**: Exact test seams and runnable verification command.

## Anti-hallucination rules

- Never invent numbers, endpoints, table schemas, error codes, or commands. Settled decisions get `DEC-###`, unknowns become `OQ-###` (`OPEN`), and approved assumptions become `ASM-###` with a validation check.
- Never proceed to `/to-spec` or `/to-tickets` while a blocking `OQ-###` remains unresolved.

## Route after confirmation

- New domain terms, invariants, or 3-gate architecture decisions → `/domain-modeling`.
- Non-trivial module seams → `/codebase-design`.
- Multi-session feature needing a formal spec → `/to-spec`.
- Ready spec needing vertical slices → `/to-tickets`.
- Small single-slice task ready to build → `/implement`.
