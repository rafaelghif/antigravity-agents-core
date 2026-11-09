---
name: to-spec
description: Converts a confirmed Discovery Decision Record into an enterprise-grade technical specification with measurable NFR budgets, security and failure contracts, explicit public seams, stable requirement IDs, and requirement-to-test traceability. Use after grill-me or whenever a feature, PRD, or architecture needs a production-ready spec instead of an MVP prototype plan.
---

# To Spec (Enterprise-Grade Technical Specification)

Convert a confirmed **Discovery Decision Record (DDR)** into a durable, production-ready specification at `specs/<feature-slug>.md` (or an Antigravity Implementation Plan artifact via `/plan`). The spec is the quality contract every ticket, seam, and test inherits. A spec that cannot cite where each statement came from is a hallucination factory.

This skill **expands** the DDR into implementable detail. It does not re-interview the user, reopen settled decisions, or invent missing requirements.

## Input / Output Contract

- **Required input**: `docs/discovery/<feature-slug>.md` (the DDR written by `/grill-me`). If it is missing, stop and ask whether discovery already happened. Do not fabricate a DDR from the spec template.
- **Supporting inputs**: `CONTEXT.md`, `docs/adr/`, existing `specs/`, and repository code. Read each relevant file end-to-end.
- **Output**: `specs/<feature-slug>.md` using [resources/spec-template.md](resources/spec-template.md), with `Status: draft` until every production gate passes.
- **No silent defaults**: every section is `KNOWN` (source cited), `OPEN` (blocking question), `ASSUMED` (approved assumption), or `N/A` (one-line rationale).

## Source Priority (highest wins)

1. An explicit instruction from the user in this session.
2. A confirmed `DEC-###` in the DDR.
3. `CONTEXT.md` invariants and `docs/adr/` decisions.
4. Repository code and configuration (`path:line`).
5. A live primary source from `/research` for external APIs or platform behavior.
6. A recorded `ASM-###` assumption—never an unmarked guess.

If two sources conflict, stop and surface the contradiction. Never silently pick the one that makes the spec easier to write.

## Decision tree

1. **Does a confirmed DDR exist for this feature?**
   - **No** → Stop. Run `/grill-me` or ask whether discovery is already complete. A spec without a DDR is unsourced guessing.
   - **Yes** → Proceed to step 2.
2. **Are any blocking `OQ-###` items still open (data model, auth boundary, NFR target, failure mode, seam, or verification command)?**
   - **Yes** → Do not fill the field with plausible prose. Ask the targeted question or return to `/grill-me`; record the resolution in the DDR first.
   - **No** → Proceed to step 3.
3. **Can every required spec section be mapped to a DDR decision, a repo fact, or an approved assumption?**
   - **No** → Build the Fact Ledger below and resolve each gap before writing.
   - **Yes** → Proceed to step 4.
4. **Are the public test seams and exact verification command confirmed?**
   - **No** → Propose the minimum seams and the runnable command; confirm with the user.
   - **Yes** → Write the spec and run the validation loop.

## Step 1 — Build the Fact Ledger before writing prose

Read the DDR end-to-end first. Then create an internal ledger:

| Spec field | Status | Source | Action |
| :--- | :--- | :--- | :--- |
| `REQ-###` | `KNOWN` | `DEC-003` | Copy the exact behavior and acceptance criteria. |
| `NFR-###` | `OPEN` | `OQ-004` | Ask for the numeric budget before writing. |
| `SEC-###` | `ASSUMED` | `ASM-002` | Record the assumption, risk, and validation step. |
| `ERR-###` | `N/A` | `DEC-007` | Add the one-line rationale. |

Rules:

- `KNOWN` requires a source. No source means `OPEN`, not confidence.
- `OPEN` in a ticket-blocking field means the spec is `draft` and cannot route to `/to-tickets`.
- `ASSUMED` requires explicit user approval and a validation step; otherwise it is still `OPEN`.
- `N/A` requires a rationale, not an empty section.

## Step 2 — Map every DDR section into the spec

| DDR section | Spec section | Mapping rule |
| :--- | :--- | :--- |
| §1 Problem, Goal, Metrics | §1 Problem & Goal | Copy exact metrics and measurement methods; no rounded numbers. |
| §2 Actors & Journeys | §4 Functional Requirements | Turn each critical journey into `REQ-###` with Given/When/Then. |
| §3 Architecture & Topology | §3 Domain Model, §7 Contracts | Preserve module boundaries and ownership constraints. |
| §4 Domain Language & Invariants | §3 Domain Model & State Machine | Copy exact `INV-###`, states, forbidden transitions, and illegal states. |
| §5 Data & Interface Contracts | §7 Data & Interface Contracts | Copy schemas, versioning, idempotency, and error taxonomy. |
| §6 Quality Attributes | §5 Non-Functional Requirements | Copy exact budgets, units, measurement methods, and failure behavior. |
| §7 Security & Privacy | §6 Security, Privacy & Abuse Cases | Copy threat/control/verification; add no unapproved control. |
| §8 Failure & Observability | §9 Failure Modes, §10 Observability | Copy timeouts, retries, degradation, logs, metrics, and alerts. |
| §9 Migration & Rollback | §8 Persistence, Migration & Rollback | Copy expand/migrate/contract, rollback trigger, RTO/RPO. |
| §10 Test Seams & Verification | §11 Test Strategy | Copy exact seams, command, boundary matrix, and mutation checks. |
| §11 Assumptions & Open Questions | §14 Assumptions, Risks & Questions | Every `OQ-###` and `ASM-###` appears; no silent drops. |
| §12 Rejected Options | §14 or ADR | Preserve why alternatives lost; do not reintroduce a rejected option. |

## Step 3 — Write the production-grade spec

A spec is not production-ready until every category below is explicit. Mark a genuinely inapplicable category `N/A` with a one-line rationale; never leave it blank or hand-wave it.

1. **Functional requirements** — `REQ-###` with observable Given/When/Then acceptance criteria, priority, and `Source`.
2. **Domain invariants and state machine** — `INV-###` from `CONTEXT.md`/DDR, allowed/forbidden transitions, and illegal states made unrepresentable.
3. **Measurable NFR budgets** — `NFR-###` for latency percentiles, throughput, memory/queue bounds, availability, durability/RPO/RTO, and cost where relevant. Every budget needs a measurement method and failure behavior.
4. **Security, privacy, and abuse cases** — `SEC-###` for authentication, authorization (including cross-tenant BOLA/IDOR), input parsing, rate limits, secrets, PII classification/retention, and SSRF/injection surfaces.
5. **Data and interface contracts** — request/response schemas, versioning, pagination, idempotency keys, and an error contract `ERR-###` with recovery behavior.
6. **Persistence, migration, and rollback** — expand-migrate-contract sequencing, backfill strategy, indexes, constraints, rollback proof, and zero-downtime constraints.
7. **Failure modes and resilience** — explicit timeouts, bounded retries with backoff and jitter, circuit breakers only where failure amplification is real, degradation behavior, and consistency boundaries.
8. **Observability and operability** — structured logs with trace context, metrics, alerts, dashboards, runbook, configuration/secrets source, readiness checks, and graceful shutdown.
9. **Test strategy** — public seams, test layers, boundary matrix (`N-1`, `N`, `N+1`, empty/nil/max), unauthorized access, duplicate idempotency, failure injection, and mutation falsifiability.
10. **Rollout and compatibility** — backward compatibility, feature flags, canary strategy, rollback trigger, and data-retention implications.

**Anti-MVP rule**: `MVP` means the smallest complete, deployable, production-safe slice. It never authorizes omitted validation, authorization, tests, observability, migrations, or hardening. Any capability deliberately deferred must appear under **Out of Scope** with its production risk and the compensating control that keeps the current slice safe to deploy.

## Step 4 — Anti-hallucination rules (non-negotiable)

- **Never invent** an endpoint, table, column, field, error code, status code, limit, latency number, dependency, package, or verification command. If it is not in the DDR, the repo, or a live primary source, it is `OPEN`.
- **Do not infer business rules from names**: a variable called `isAdmin` does not prove the authorization model. Inspect the code and cite `path:line`, or ask.
- **Do not upgrade language**: "probably", "should", "typically", and "best practice" are not requirements. Require a decision, a number, or a test.
- **Do not copy illustrative examples** from templates into the spec as if they were project facts. Examples are shape guidance only.
- **Do not invent tests**: use the exact public seam and verification command confirmed in the DDR. If the command is unknown, ask.
- **Do not fill a blocking field with prose**: unresolved means `OPEN` and the spec stays `draft`.
- **Do not silently drop a DDR decision**: every `DEC-###` in scope maps to a spec section or an explicit non-goal.
- **External behavior**: for third-party APIs or platform features, use the `research` skill and cite the primary source. Parametric memory is stale by default.

## Step 5 — Specification validation loop (must pass before routing)

- Every `REQ-###` cites a `DEC-###`, user instruction, or repo fact, and maps to at least one public seam and one automated test.
- Every `INV-###` has at least one forbidden-transition or boundary test.
- Every `NFR-###` has a numeric budget, unit, measurement method, and failure behavior.
- Every `SEC-###` has an authorization or abuse-case test.
- Every `ERR-###` has an owner and a documented recovery path.
- Every `OQ-###` and `ASM-###` from the DDR appears in §14 with a status.
- No vague qualifier (`fast`, `secure`, `robust`, `minimal`, `for now`, `later`, `TODO`) remains without a number, test, or explicit risk record.
- No ticket-blocking field is `OPEN`. If any is, keep `Status: draft` and list the blockers.
- **Readiness verdict**: write `READY FOR TICKETS` only when every gate above passes. Otherwise write `NOT READY` with the exact blocking IDs.

## Step 6 — Route the next step

- If the spec is `READY FOR TICKETS` and spans multiple sessions or slices, recommend `/to-tickets`.
- If the spec is `READY FOR TICKETS` and is small enough for one session, recommend `/implement`.
- If the spec is `NOT READY`, do not route to implementation; resolve the listed blockers or return to `/grill-me`.

Use [resources/spec-example.md](resources/spec-example.md) only as a shape reference for detail level and provenance—never copy its domain facts.
