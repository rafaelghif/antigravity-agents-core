# Spec: <Feature Title>

- **Status**: `draft` | `ready-for-tickets` | `accepted` | `superseded by <spec>`
- **Feature Slug**: `<feature-slug>`
- **DDR**: `docs/discovery/<feature-slug>.md`
- **Quality Bar**: `production` (enterprise-grade; MVP/prototype shortcuts forbidden)
- **Owner**: `<name or role>`
- **Verification Command**: `<exact test + typecheck + lint command>`
- **Readiness Verdict**: `NOT READY` | `READY FOR TICKETS` (with blocking IDs when not ready)

## How to fill this template (LLM rules)

1. **Never invent**: copy each fact from a `DEC-###`, a repository `path:line`, or a live primary source. If the source is missing, write `OPEN` and add an `OQ-###`.
2. **Every table row carries a `Source`**: `DEC-###`, `INV-###`, `NFR-###`, `SEC-###`, `ERR-###`, `path:line`, or a primary-source URL. A row without provenance is invalid.
3. **Copy numbers verbatim**: latency budgets, limits, retention periods, timeouts, and throughput targets must not be rounded or "improved".
4. **Use one ID per fact**: `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, `ERR-###`. Downstream tickets and tests cite these IDs.
5. **No vague qualifier survives**: `fast`, `secure`, `robust`, `scalable`, `minimal`, `for now`, and `later` must become a number, a test, or an explicit accepted risk.
6. **Mark inapplicable sections `N/A` with a one-line rationale**: never leave a blank section or delete a required heading.
7. **Examples are shape only**: `resources/spec-example.md` is illustrative. Never copy its refund facts into a real spec.
8. **A spec with an unresolved ticket-blocking field stays `draft`**: do not soften a blocker into confident prose.

---

## 1. Problem & Goal

- **Problem**: <concrete user or system problem being solved> (`Source: DEC-### / path:line`)
- **Goal**: <observable capability unlocked when this spec is complete> (`Source: DEC-###`)
- **Success Metric**: <metric, exact target, measurement method> (`Source: DEC-###`)

## 2. Scope & Explicit Non-Goals

- **In Scope**: <capabilities this spec delivers, each citing `REQ-###`>
- **Out of Scope**: <concrete capabilities deliberately refused>. For each deferred item, state the production risk and the compensating control that keeps the current slice safe to deploy. (`Source: DEC-###`)

## 3. Domain Model, Invariants & State Machine

- **Bounded Context**: <which domain boundary owns this behavior> (`Source: DDR §4 / path:line`)
- **Entities & Value Objects**: <exact domain types using `CONTEXT.md` vocabulary> (`Source: CONTEXT.md`)
- **Invariants**: `INV-###` statements that must always hold, including concurrency, precision, tenancy, and lifecycle invariants.

| ID | Invariant | Forbidden State / Transition | Enforced By | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-001` | <precise, falsifiable statement> | <what must be impossible> | <domain rule or constraint> | `DEC-###` / `path:line` |

| State | Allowed Transitions | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- |
| `<state>` | `<next states>` | `<illegal states>` | `<condition>` (`Source: ST-###`) |

- **Illegal States**: <how the model makes invalid combinations unrepresentable> (`Source: DEC-###`)

## 4. Functional Requirements & Acceptance Criteria

| ID | Requirement | Given / When / Then | Priority | Source |
| :--- | :--- | :--- | :---: | :--- |
| `REQ-001` | <observable behavior> | **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>` | `must` | `DEC-###` |

## 5. Non-Functional Requirements (Measurable)

| ID | Attribute | Budget / Target | Measurement Method | Behavior When Exceeded | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | Latency | `<p95 and p99 with exact unit>` | <load test command or production metric> | <degrade, shed load, or alert> | `DEC-###` |
| `NFR-002` | Throughput | `<requests/sec at target concurrency>` | <benchmark command> | <backpressure or queue bound> | `DEC-###` |
| `NFR-003` | Durability / Recovery | `<RPO and RTO with exact unit>` | <restore drill or backup metric> | <alert and failover> | `DEC-###` |

## 6. Security, Privacy & Abuse Cases

| ID | Asset / Threat | Control | Verification | Source |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | Cross-tenant access (BOLA/IDOR) | <owner or tenant check on every read and mutation> | <unauthorized request returns `403`/`404` with zero leakage> | `DEC-###` |
| `SEC-002` | Replay / duplicate mutation | <idempotency key with atomic first-write-wins> | <duplicate request returns the identical response and zero duplicated side effects> | `DEC-###` |

- **Data Classification**: `<public | internal | confidential | restricted>`, retention, deletion, and audit rules. (`Source: DEC-###`)
- **Secrets**: Source, rotation, and zero-logging rules. (`Source: DEC-###`)
- **Input Boundaries**: Parsing strategy and maximum payload sizes. (`Source: DEC-###`)

## 7. Data & Interface Contracts

- **Entry Signatures**: <exact request/response schemas or function signatures> (`Source: DEC-###`)
- **Persistence / Schema**: <tables, columns, constraints, indexes, ownership keys> (`Source: DEC-###`)
- **Error Contract**:

| ID | Condition | Status / Code | Expected Behavior & Recovery | Source |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-001` | Invalid input | `400` / validation error | Fail fast at boundary; zero state mutation | `DEC-###` |
| `ERR-002` | Concurrent conflict | `409` / retryable | Atomic optimistic-lock rejection | `DEC-###` |

- **Idempotency, Versioning & Pagination**: <key format, TTL, compatibility rules, page-size bound>. (`Source: DEC-###`)

## 8. Persistence, Migration & Rollback

- **Expand**: <backward-compatible schema additions> (`Source: DEC-###`)
- **Migrate**: <batched backfill and dual-read/dual-write window> (`Source: DEC-###`)
- **Contract**: <removal gate> (`Source: DEC-###`)
- **Rollback**: <exact steps, data-recovery path, and maximum tolerable downtime> (`Source: DEC-###`)
- **RTO / RPO**: <exact targets with units> (`Source: NFR-###`)

## 9. Failure Modes & Resilience

| Dependency / Failure | Timeout | Retry Policy | Degradation / Fallback | Consistency Impact | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<service or operation>` | `<ms>` | `<attempts, backoff, jitter>` | `<fallback or fail fast>` | `<strong / eventual>` | `DEC-###` |

## 10. Observability & Operability

- **Logs**: <structured fields, trace context, and redaction rules> (`Source: DEC-###`)
- **Metrics**: <business and system counters, histograms, saturation signals> (`Source: DEC-###`)
- **Alerts**: <thresholds, routing, and runbook link> (`Source: DEC-###`)
- **Configuration**: <environment variables, validation, and fail-fast startup behavior> (`Source: DEC-###`)
- **Lifecycle**: <health/readiness checks and graceful shutdown drain budget> (`Source: DEC-###`)

## 11. Test Strategy & Public Seams

- **Primary Seams**: <exact public interfaces where tests assert behavior> (`Source: DEC-###`)
- **Verification Command**: `<exact runnable command>` (`Source: DEC-###`)
- **Test Matrix**:

| Layer | Scope | Required Cases | Source |
| :--- | :--- | :--- | :--- |
| Unit | Pure domain logic | Invariants, boundaries, forbidden transitions | `INV-###` |
| Integration | Real boundary adapters | Auth, persistence, idempotency, migrations | `SEC-###` |
| End-to-End | Critical user journey | Happy path plus one realistic failure | `REQ-###` |

- **Boundary Matrix**: `N-1`, `N`, `N+1`, empty/nil, maximum length, unauthorized, duplicate, and injected failure.
- **Mutation Falsifiability**: If any core invariant or authorization check is removed, at least one test must fail.

## 12. Traceability Matrix

| Requirement | Invariants / Security | Ticket(s) | Public Seam | Test(s) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | `INV-001`, `SEC-001` | `TBD` | `<seam>` | `<test name>` |

The `Ticket(s)` column is filled by `/to-tickets` when the board is generated; until then it may read `TBD`, but every requirement must already have a seam and a test. A requirement without a seam or test blocks readiness.

## 13. Production Readiness Definition

- [ ] Every requirement, invariant, NFR, security control, and error code is traceable to a source, a seam, and a test.
- [ ] Every DDR `DEC-###` in scope appears in this spec or in an explicit non-goal.
- [ ] Authorization and tenant isolation are proven by tests.
- [ ] Failure, retry, timeout, and degradation behavior is defined.
- [ ] Observability, configuration, and graceful shutdown behavior is defined.
- [ ] Migration and rollback are rehearsed or explicitly proven unnecessary.
- [ ] No production mock, stub, fake data, or deferred `TODO` remains in scope.
- [ ] No ticket-blocking `OPEN` field remains.
- [ ] Full verification command passes with exit code 0.

## 14. Assumptions, Risks & Open Questions

| ID | Type | Statement | Impact | Owner | Resolution / Validation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `OQ-001` | `question` | <unknown> | <blocked requirement or seam> | <owner> | <how and when it is answered> | `open` |
| `ASM-001` | `assumption` | <approved assumption> | <impact> | <owner> | <test or evidence that validates it> | `assumed` |

- **Accepted Ceilings**: Any `// ponytail:` ceiling, its production risk, and the upgrade path.
- **Readiness Rule**: Any `OQ-###` that blocks a requirement, seam, security rule, or acceptance criterion keeps the spec at `Status: draft`.
