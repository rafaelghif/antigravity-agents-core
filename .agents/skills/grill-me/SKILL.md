---
name: grill-me
description: Interviews the user one question at a time to settle architecture, production quality attributes, domain language, data contracts, and failure modes, then writes a durable Discovery Decision Record with stable decision IDs for downstream specs, tickets, and domain models. Use when architecture, stack, requirements, or production constraints are undecided or need stress-testing, even if the user never says discovery.
---

# Grill Me (Decision-Grade Discovery & 6-Pillar Stress-Test)

Interview the user relentlessly until every branch of the design tree is settled. Never force a static architecture or pre-baked stack—let the user define what they want, then **critically stress-test their choices** against `@AGENTS.md` §3 (**The 6 Engineering Pillars**).

The output of this skill is **not** a chat summary. It is a durable **Discovery Decision Record (DDR)** at `docs/discovery/<feature-slug>.md` that `/to-spec`, `/to-tickets`, and `/domain-modeling` consume. A decision that exists only in chat is an invitation for downstream hallucination.

## Decision tree

1. **Is the missing information a codebase fact or a user-defined architecture/product decision?**
   - **Codebase fact** (something already committed in the workspace) → Never ask the user. Inspect the repo directly or delegate to `codebase-investigator`, then cite the exact `path:line`.
   - **Architecture, stack, folder layout, domain rule, or product decision** → Never impose a static template. Put it on the question frontier so the user defines it.
2. **Does the user's premise or chosen architecture fail any of the 6 Pillars or violate YAGNI?**
   - **Yes** → Roast and push back immediately (`[Roast / Premise Flaw] → [Production Failure Mode] → [Superior Alternative]`). A grilling session with zero pushback is useless.
   - **No** → Proceed to step 3.
3. **Is the question grillable (answerable by reasoning) or ungrillable (needs a quick prototype spike to react to)?**
   - **Ungrillable** → Stop grilling that branch and propose a quarantined throwaway spike. Record the spike result as evidence; never merge it as production code.
   - **Grillable** → Ask it using the interview protocol below.
4. **Is the decision frontier empty (all architecture, domain, data, quality, and failure branches settled or explicitly deferred)?**
   - **No** → Continue the interview. Never route downstream with an unresolved blocking decision.
   - **Yes** → Write the DDR, confirm it with the user, then route to the next workflow step.

## Input / Output Contract

- **Inputs**: user answers, repository facts (`path:line`), existing `CONTEXT.md`, `docs/adr/`, `specs/`, and prior discovery records.
- **Output**: `docs/discovery/<feature-slug>.md` using [resources/discovery-record-template.md](resources/discovery-record-template.md).
- **Stable IDs**: every settled decision gets `DEC-###`; every open question gets `OQ-###`; every assumption gets `ASM-###`. Downstream artifacts cite these IDs.
- **Completion gate**: every required section is filled with a decision, a cited repo fact, or an explicit `OPEN`/`N/A` plus rationale. No blank section, no silent default, no invented requirement.

## Interview protocol (follow in order, one question at a time)

1. **Foundations**: architecture, module/folder topology, runtime/stack, persistence, deployment target, and operational ownership—unless already settled in the repo.
2. **Production quality frontier**: expected load, latency/availability budgets, tenancy and authorization model, data sensitivity, failure tolerance, recovery objectives, and rollback constraints.
3. **Domain frontier**: canonical terms, bounded contexts, invariants, state machines, ownership boundaries, and illegal states. Ask for concrete boundary scenarios, not adjectives.
4. **Data and interface frontier**: request/response shapes, events, idempotency, versioning, pagination, retention, and migration/rollback expectations.
5. **Failure and observability frontier**: dependency timeouts, retry/degradation policy, consistency boundaries, logs/metrics/alerts, and the runbook owner.
6. **Test frontier**: the public seams where behavior is proven, the exact verification command, boundary cases, authorization cases, duplicate-request cases, and failure injection.
7. **Adversarial pass**: stress-test the settled design against all 6 Pillars. Record rejected options and why they lost.
8. **Decision record write**: populate the DDR, present a compact summary to the user, resolve corrections, and only then route.

## Anti-hallucination rules (non-negotiable)

- **Never invent** an answer, number, term, schema, endpoint, table, error code, limit, third-party API, or verification command. If the user did not say it and the repo does not prove it, it is not a fact.
- **Inspect, don't ask** when the answer is already in the repository. Cite `path:line`.
- **Ask, don't infer** when the answer is a product or architecture decision. Silence is not consent.
- **Mark uncertainty explicitly**: `OQ-###` for an open question, `ASM-###` for an approved assumption with a validation step. Never hide an unknown behind confident prose.
- **No appeal to "standard practice"**: a best-practice claim needs a live primary source (`/research` or `search_web`) or explicit user approval recorded as a decision.
- **No premature routing**: a blocking `OQ` must be resolved or explicitly deferred with owner, risk, and compensating control before `/to-spec` or `/to-tickets`.

## Routing after the DDR is confirmed

- New architecture, module boundaries, or domain terms settled → `/domain-modeling` (update `CONTEXT.md` + ADR when the 3 gates hold).
- Module interfaces and boundary seams need design → `/codebase-design`.
- Multi-session feature needing a written spec → `/to-spec` (which must read the DDR first).
- Feature needing a Sprint Wave Board and production-grade vertical tickets → `/to-tickets` (which must read the spec and DDR first).
- Small, single-slice change ready to build immediately → `/implement` (or `/tdd`), still subject to the full production quality bar.
- Long conversation needing a fresh session window → `/handoff`.
