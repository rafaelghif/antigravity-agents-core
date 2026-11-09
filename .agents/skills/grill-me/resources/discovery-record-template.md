# Discovery Decision Record: <Feature / Initiative Title>

- **Feature Slug**: `<feature-slug>`
- **Date**: `YYYY-MM-DD`
- **Participants**: `<user and agent roles>`
- **Status**: `draft` | `confirmed` | `superseded`
- **Next Artifact**: `specs/<feature-slug>.md` or `docs/sprint/SPRINT.md`

## How to fill this record (LLM rules)

1. **Every statement needs provenance**: cite `DEC-###`, a repository `path:line`, a user answer date, or a live primary-source URL. No unsourced claims.
2. **Never invent**: if the user did not decide it and the repository does not prove it, write `OPEN` and add an `OQ-###`.
3. **One decision per `DEC-###`**: state the decision, alternatives, rationale, consequences, and status (`settled`, `assumed`, `rejected`).
4. **Numbers must be exact**: copy latency targets, limits, retention periods, and throughput budgets verbatim. Never round or "improve" them.
5. **No vague adjectives**: replace `fast`, `secure`, `scalable`, `robust`, `simple` with a measurable target or an explicit `OPEN`.
6. **No implementation detail without a contract reason**: record schemas, seams, and invariants; do not dump code.
7. **Blocking unknowns stop the handoff**: every `OQ-###` is either resolved or explicitly deferred with owner, risk, and compensating control.
8. **This record is evidence, not a wish list**: downstream skills may cite it, but may not extend it with invented requirements.

---

## 1. Problem, Goal & Success Metrics

- **Problem**: <concrete user or system problem, with evidence or source>
- **Goal**: <observable capability unlocked>
- **Success Metrics**: <metric, target, measurement method, source>
- **Non-Goals**: <what this initiative deliberately refuses>

## 2. Actors, Personas & Critical Journeys

| Actor | Goal | Critical Journey | Failure That Must Not Happen | Source |
| :--- | :--- | :--- | :--- | :--- |
| `<actor>` | `<goal>` | `<step → step → outcome>` | `<failure>` | `DEC-###` / `path:line` |

## 3. Architecture, Stack & Topology Decisions

| ID | Decision | Alternatives Considered | Rationale (6 Pillars) | Consequences / Ceiling | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DEC-001` | `<chosen architecture>` | `<option A, option B>` | `<why this wins>` | `<trade-off and upgrade path>` | `settled` | `<user answer / path:line>` |

- **Module / Folder Topology**: <user-defined layout and dependency rules>
- **Runtime, Language & Tooling**: <exact versions and package manager>
- **Persistence & Infrastructure**: <database, queue, cache, deployment target>
- **Ownership Boundaries**: <which module owns which state and which imports are forbidden>

## 4. Domain Language, Invariants & State Machines

| ID | Term / Entity / Invariant | Exact Definition | Forbidden State or Transition | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-001` | `<term or invariant>` | `<precise definition>` | `<what must be impossible>` | `DEC-###` / `path:line` |

- **Bounded Contexts**: <context → responsibility → boundary>
- **State Machine**: <states, allowed transitions, forbidden transitions, trigger/guard>
- **Ownership / Authorization Boundary**: <principal → aggregate → tenant rule>
- **Data Classification**: `public` | `internal` | `confidential` | `restricted` per asset.
- **Edge-Case Scenarios Probed**: <partial refund, ownership transfer, expired grace period, duplicate command, concurrent mutation>

## 5. Data & Interface Contracts

| Contract | Shape / Schema | Versioning | Idempotency / Concurrency | Migration Impact | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<endpoint, event, or function seam>` | `<request/response or signature>` | `<version rule>` | `<key, TTL, lock>` | `<expand/migrate/contract>` | `DEC-###` |

- **Error Taxonomy**: `<condition → status/code → recovery>` with stable `ERR-###` IDs.
- **Pagination / Limits**: <cursor or offset, maximum page size, payload bound>
- **Backward Compatibility**: <what old clients may still send and how it is handled>

## 6. Quality Attributes & Measurable NFRs

| ID | Attribute | Budget / Target | Measurement Method | Failure Behavior | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | `<latency, throughput, durability, availability, recovery>` | `<exact number and unit>` | `<benchmark, metric, test>` | `<degrade, shed load, alert>` | `DEC-###` |

## 7. Security, Privacy & Abuse Cases

| ID | Asset / Threat | Control | Verification | Source |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | `<threat>` | `<authn/authz/validation/rate limit/encryption>` | `<test or audit>` | `DEC-###` |

- **Tenancy / BOLA-IDOR**: <owner rule and forbidden cross-tenant access>
- **Secrets**: <source, rotation, zero-logging rule>
- **PII / Retention**: <data class, retention, deletion, audit>
- **Abuse Cases**: <replay, enumeration, injection, SSRF, resource exhaustion>

## 8. Failure Modes, Resilience & Observability

| Dependency / Failure | Timeout | Retry / Backoff | Degradation / Fallback | Consistency Impact | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<dependency>` | `<ms>` | `<attempts, jitter>` | `<behavior>` | `<strong / eventual>` | `DEC-###` |

- **Logs**: <structured fields, trace context, redaction>
- **Metrics / Alerts**: <signal, threshold, routing, runbook owner>
- **Lifecycle**: <health/readiness and graceful shutdown budget>
- **Configuration**: <env vars, validation, fail-fast behavior>

## 9. Migration, Rollback & Compatibility

- **Expand**: <backward-compatible additions>
- **Migrate**: <backfill batches, dual-read/write window>
- **Contract**: <removal gate>
- **Rollback Trigger**: <metric/threshold and owner>
- **Maximum Tolerable Downtime / Data Loss**: <RTO/RPO>

## 10. Test Seams & Verification

- **Public Seams**: <exact seam list>
- **Verification Command**: `<exact runnable command>`
- **Boundary Matrix**: `N-1`, `N`, `N+1`, empty/nil, max length, malformed input.
- **Authorization Cases**: <cross-tenant and unauthenticated cases>
- **Idempotency Cases**: <duplicate request and zero duplicated side effects>
- **Failure Injection**: <dependency failure and expected degradation>
- **Mutation Falsifiability**: <which core check must turn a test red when removed>

## 11. Assumptions & Open Questions

| ID | Type | Statement | Owner | Validation / Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `OQ-001` | `question` | `<unknown>` | `<owner>` | `<how and when it will be answered>` | `open` |
| `ASM-001` | `assumption` | `<approved assumption>` | `<owner>` | `<test or evidence that validates it>` | `assumed` |

**Blocking rule**: if an `OQ-###` blocks a requirement, seam, security rule, or acceptance criterion, the DDR is not ready to route to `/to-spec` or `/to-tickets`.

## 12. Rejected Options & Rationale

| Option | Why It Was Considered | Why It Was Rejected | Failure Mode It Would Have Introduced |
| :--- | :--- | :--- | :--- |
| `<option>` | `<attraction>` | `<specific reason>` | `<concrete production failure>` |

## 13. Decision Index

| ID | Decision / Artifact | Status | Downstream Consumer |
| :--- | :--- | :--- | :--- |
| `DEC-001` | `<short decision>` | `settled` | `specs/<slug>.md`, `CONTEXT.md` |

## 14. Discovery Completeness Gate

- [ ] Every required section is filled or explicitly `OPEN`/`N/A` with rationale.
- [ ] Every `DEC-###` has alternatives, rationale, consequences, and a source.
- [ ] Every blocking `OQ-###` is resolved or explicitly deferred with owner and risk.
- [ ] Every codebase fact cites `path:line`.
- [ ] Every external best-practice claim cites a live primary source or a recorded user decision.
- [ ] No invented endpoint, schema, number, term, or verification command remains.
- [ ] The user has confirmed the record, and the next artifact is named.
