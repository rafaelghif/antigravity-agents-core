# Spec: <Feature Title>

- **Status**: `draft` | `ready-for-tickets` | `accepted` | `superseded by <spec>`
- **Feature Slug**: `<feature-slug>`
- **DDR / PRD Source**: `docs/discovery/<feature-slug>.md` (or PRD link)
- **Quality Bar**: `production` (MVP/prototype shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Verification Command**: `<exact command verified from repo>`
- **Readiness Verdict**: `NOT READY` | `READY FOR TICKETS`

---

## 1. Problem, Scope & Non-Goals

- **Problem & Goal**: <observable problem & outcome> (`Source: DEC-###`)
- **In Scope**: <capabilities mapped to `REQ-###`>
- **Out of Scope**: <explicit exclusions + compensating control if deferred> (`Source: DEC-###`)

## 2. Reusable Codebase Assets & Touchpoints (`CONTEXT.md`)

- **Shared UI & Tokens to Reuse/Extend**: <exact `path:symbol` or `N/A — no UI`>
- **Shared Utils / Hooks / Schemas / API Clients**: <exact `path:symbol`>
- **Target Modules / Existing Callers**: <exact files and sibling callers verified via search>

## 3. Domain Model, Invariants & State Machine

| ID | Invariant | Forbidden State / Transition | Enforced By | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-001` | <falsifiable statement> | <what must be impossible> | <rule/constraint> | `DEC-###` / `path:line` |

| State | Allowed Transitions | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- |
| `<state>` | `<next states>` | `<illegal states>` | `<guard>` (`Source: ST-###`) |

- **UI States (if UI)**: loading, empty, validation error, server error, disabled/in-flight, responsive (`N/A — no UI` if backend/CLI).

## 4. Functional Requirements & Acceptance Criteria

| ID | Requirement | Given / When / Then | Priority | Source |
| :--- | :--- | :--- | :---: | :--- |
| `REQ-001` | <behavior> | **Given** `<pre>`, **when** `<action>`, **then** `<outcome>` | `must` | `DEC-###` |

## 5. Non-Functional Requirements (Measurable)

| ID | Attribute | Budget / Target | Measurement Method | Behavior When Exceeded | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | <latency/throughput/durability or `N/A`> | `<exact target + unit>` | <benchmark/metric> | <degradation/alert> | `DEC-###` |

## 6. Security, Privacy & Abuse Cases

| ID | Threat / Control Area | Rule | Verification | Source |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | Auth / BOLA-IDOR | <owner/tenant check on every read & write> | <`401`/`403`/`404` test> | `DEC-###` |
| `SEC-002` | Boundary Parsing / Replay | <strict schema parse, payload bounds, idempotency key> | <malformed + duplicate test> | `DEC-###` |

## 7. Data Contracts, Error Mapping & Persistence

- **Entry Signatures / Schemas**: <exact types/endpoints> (`Source: DEC-###`)
- **Persistence & Migrations**: <expand-migrate-contract + rollback or `N/A — no schema change`>

| ID | Condition | Status / Code | Recovery Behavior | Source |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-001` | <condition> | `<status/code>` | <fail fast / retry / rollback> | `DEC-###` |

## 8. Resilience, Observability & Test Strategy

- **Failure Modes**: <timeouts, retries with jitter, fallback or `N/A — pure local logic`>
- **Observability**: <structured logs, traceId, redaction, metrics/alerts or `N/A`>
- **Public Seams & Test Matrix**: happy path, `N-1`/`N`/`N+1`, empty/nil/max, unauthorized (`401`/`403`/`404`), duplicate idempotency, failure injection, mutation falsifiability.

## 9. Traceability Matrix

| Requirement | Invariants / Security | Ticket(s) | Public Seam | Test(s) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | `INV-001`, `SEC-001` | `TBD` | `<seam>` | `<test>` |

## 10. Production Readiness Definition & Open Questions

- [ ] Every requirement, invariant, NFR, security rule, and error code maps to a source, seam, and test.
- [ ] Existing shared UI primitives, helpers, and sibling callers are mapped.
- [ ] No blocking `OQ-###` remains (`Status: draft` if any is open).

| ID | Type | Statement | Impact | Owner | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `OQ-001` | `question` | <unknown> | <blocked ID/seam> | <owner> | <resolution> | `open` |
| `ASM-001` | `assumption` | <approved assumption> | <impact> | <owner> | <validation> | `assumed` |
