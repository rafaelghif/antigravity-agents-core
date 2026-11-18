# Discovery Decision Record: <Feature / Initiative Title>

- **Feature Slug**: `<feature-slug>`
- **Date**: `YYYY-MM-DD`
- **Status**: `draft` | `confirmed` | `superseded`
- **Next Artifact**: `specs/<feature-slug>.md` or `docs/sprint/SPRINT.md`

> Provenance rule: cite `DEC-###`, `path:line`, or a live primary-source URL (`/research` / `search_web`). Unknowns stay `OQ-###` (`open`); inapplicable areas use `N/A — <reason>`.

---

## 1. Problem, Goal & Non-Goals

- **Problem & Goal**: <observable problem and outcome>
- **Success Metrics**: <metric, target, measurement method, or `N/A — reason`>
- **Non-Goals**: <explicit exclusions>

## 2. Existing Codebase Reuse & Constraints (`CONTEXT.md`)

- **Reusable UI Primitives / Widgets / Tokens**: <exact `path:symbol` or `N/A`>
- **Reusable Utils / API Clients / State Holders / Schemas**: <exact `path:symbol`>
- **Existing Constraints / Conflicts**: <`path:line`>

## 3. Architecture, Config & Live-Researched Decisions

| ID | Decision | Alternatives Considered | Rationale (6 Pillars) | Trade-Off / Ceiling | Primary Source / Citation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DEC-001` | <decision> | <options> | <why> | <ceiling/upgrade path> | <user answer / URL / `path:line`> | `settled` |

- **Configurability & Env Contract**: <typed config keys, validation, zero hardcoded URLs/secrets>
- **Structured Logging & Audit Trail**: <logger seam, trace/correlation fields, `<REDACTED>` policy>

## 4. Domain Language, Invariants & UI/State Behavior

| ID | Term / Invariant | Exact Definition | Forbidden State / Transition | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-001` | <rule> | <falsifiable invariant> | <illegal state> | `DEC-###` / `path:line` |

- **State Machine (`ST-###`)**: <states, allowed/forbidden transitions, guards>
- **Authorization / Tenancy (`SEC-###`)**: <principal, owner/tenant rule, forbidden access>
- **UI States (if UI)**: <loading, empty, validation error, server/offline error, disabled, responsive, controller disposal>

## 5. Data Contracts, Performance & Verification

| Contract / Seam | Schema & Bounds | Idempotency & Concurrency | Error Contract (`ERR-###`) | Source |
| :--- | :--- | :--- | :--- | :--- |
| `<seam>` | `<shape>` | `<key/lock/version or N/A>` | `<condition -> status/code>` | `DEC-###` |

- **Performance & Scaling Budgets (`NFR-###`)**: <complexity/N+1/pagination/memory/latency budgets or `N/A — reason`>
- **Failure, Resilience & Migration**: <timeouts/retries/degradation, expand-migrate-contract, rollback trigger>
- **Verification Command**: `<exact runnable command>`
- **Required Test Cases**: happy path, `N-1`/`N`/`N+1`, empty/malformed, auth (`401`/`403`/`404`), duplicate idempotency, failure mode.

## 6. Open Questions (`OQ-###`) & Approved Assumptions (`ASM-###`)

| ID | Type | Statement | Owner | Resolution / Validation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `OQ-001` | `question` | <unknown> | <owner> | <how answered> | `open` |
| `ASM-001` | `assumption` | <approved assumption> | <owner> | <validation step> | `assumed` |

## 7. Completeness Gate

- [ ] Live research (`search_web`) was executed for external library/architecture recommendations.
- [ ] Every blocking `OQ-###` is resolved before routing to `/to-spec`, `/to-tickets`, or `/implement`.
- [ ] Existing codebase reusable UI primitives/helpers are verified against real files.
- [ ] Zero numbers, endpoints, schemas, or commands are invented.
- [ ] User has confirmed this record.
