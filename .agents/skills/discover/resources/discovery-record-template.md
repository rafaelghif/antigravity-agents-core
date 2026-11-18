# Discovery Decision Record: <Feature / Initiative Title>

- **Feature Slug**: `<feature-slug>`
- **Date**: `YYYY-MM-DD`
- **Status**: `draft` | `confirmed` | `superseded`
- **Next Artifact**: `specs/<feature-slug>.md` or `docs/sprint/SPRINT.md`

> Provenance rule: cite `DEC-###`, `path:line`, or a verified primary source URL for every claim. Unknowns stay `OQ-###` (`open`); genuinely inapplicable sections use `N/A — <reason>`.

---

## 1. Problem, Goal & Non-Goals

- **Problem**: <concrete user or system problem with source>
- **Goal**: <observable outcome>
- **Success Metrics**: <metric, target, measurement method, or `N/A — reason`>
- **Non-Goals**: <what is explicitly excluded>

## 2. Existing Codebase Reuse & Constraints (`CONTEXT.md`)

- **Reusable UI Primitives / Tokens**: <exact file paths & symbols to reuse/extend, or `N/A`>
- **Reusable Utilities / Hooks / Clients / Schemas**: <exact file paths & symbols>
- **Existing Seams & Conflicts**: <repo constraints with `path:line`>

## 3. Architecture & Decisions

| ID | Decision | Alternatives Considered | Rationale | Trade-Off / Ceiling | Status | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DEC-001` | <decision> | <options> | <why> | <limit/upgrade path> | `settled` | <user answer / `path:line`> |

## 4. Domain Language, Invariants & UI/State Behavior

| ID | Term / Invariant | Exact Definition | Forbidden State / Transition | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-001` | <rule> | <falsifiable invariant> | <illegal state> | `DEC-###` / `path:line` |

- **State Machine (`ST-###`)**: <states, allowed/forbidden transitions, guards>
- **Authorization / Tenancy (`SEC-###`)**: <principal, owner/tenant rule, forbidden access>
- **UI States (if UI)**: <loading, empty, validation error, server error, disabled, responsive>

## 5. Data Contracts, Resilience & Verification

| Contract / Seam | Input / Output Schema | Idempotency & Concurrency | Error Contract (`ERR-###`) | Source |
| :--- | :--- | :--- | :--- | :--- |
| `<seam>` | `<shape>` | `<key/lock/version or N/A>` | `<condition -> status/code>` | `DEC-###` |

- **Measurable Quality Budgets (`NFR-###`)**: <exact numbers with units, or `N/A — reason`>
- **Failure & Rollback**: <timeouts/retries/degradation, expand-migrate-contract, rollback trigger>
- **Verification Command**: `<exact runnable command>`
- **Required Test Cases**: happy path, `N-1`/`N`/`N+1`, empty/malformed, auth (`401`/`403`/`404`), duplicate idempotency, failure mode.

## 6. Open Questions (`OQ-###`) & Approved Assumptions (`ASM-###`)

| ID | Type | Statement | Owner | Resolution / Validation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `OQ-001` | `question` | <unknown> | <owner> | <how answered> | `open` |
| `ASM-001` | `assumption` | <approved assumption> | <owner> | <validation step> | `assumed` |

## 7. Completeness Gate

- [ ] Every blocking `OQ-###` is resolved before routing to `/to-spec`, `/to-tickets`, or `/implement`.
- [ ] Existing codebase reusable UI primitives/helpers are verified against real files.
- [ ] All codebase facts cite `path:line`; zero numbers or endpoints are invented.
- [ ] User has confirmed this record.
