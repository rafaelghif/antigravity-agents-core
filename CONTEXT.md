# Project Context & Domain Glossary

> **Zero Static Template**: Nothing in this file is pre-defined by dogma. Populate and evolve this file dynamically after interviewing the user (`/grill-me` / `/domain-modeling`) or inspecting the existing workspace.

---

## 1. System Overview & User-Defined Stack

- **Primary Purpose**: _[Defined with user via interview or discovered from repo]_
- **Runtime, Language & Tooling**: _[Defined by user or discovered dynamically from workspace]_
- **Architecture & Folder Topology**: _[Defined by user—never force a static template]_
- **Persistence & Infrastructure**: _[Defined by user or discovered from workspace]_
- **Verification Command**: _[Exact command to run build, lint, typecheck, and tests]_

---

## 2. User-Defined Module Boundaries & Public Seams

| Module / Path | Responsibility | Public Seam (Entry Point) | Ownership / Authorization Boundary | Dependency Constraints |
| :--- | :--- | :--- | :--- | :--- |
| _[Defined by user]_ | _[Core responsibility]_ | _[Public interface / seam]_ | _[Tenant/owner rule and forbidden access]_ | _[What this module must never import]_ |

---

## 3. Ubiquitous Language & Core Invariants

| ID | Term / Entity | Definition | Enforced Invariants |
| :--- | :--- | :--- | :--- |
| `INV-001` | _[Defined by user]_ | _[Canonical domain meaning]_ | _[State, concurrency, security, or precision invariant]_ |

Invariants must be precise and falsifiable. "The system must be consistent" is not an invariant; "a refund may never exceed the captured payment minus prior refunds" is.

---

## 4. State Machines & Forbidden Transitions

| State Machine | State | Allowed Transitions | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- | :--- |
| `ST-001` | _[state]_ | _[next states]_ | _[illegal states]_ | _[condition]_ |

If a combination of boolean flags can represent an impossible state, collapse it into a discriminated union so the illegal state cannot exist.

---

## 5. Data Classification, Retention & Compliance

| Data Asset | Classification | Owner | Retention / Deletion | Audit Requirement |
| :--- | :--- | :--- | :--- | :--- |
| _[asset]_ | `public` / `internal` / `confidential` / `restricted` | _[owner]_ | _[rule]_ | _[requirement]_ |

---

## 6. Quality Attributes & Measurable NFR Budgets

| ID | Attribute | Budget / Target | Measurement Method | Behavior When Exceeded |
| :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | _[latency, throughput, durability, availability, recovery]_ | _[measurable target]_ | _[benchmark or production metric]_ | _[degrade, shed load, or alert]_ |

---

## 7. Failure Taxonomy & Error Contract

| ID | Failure Class | Detection | Recovery / Degradation | Error Contract |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-001` | _[validation, conflict, dependency, authorization]_ | _[signal]_ | _[retry, fallback, fail fast]_ | _[status/code and user-visible behavior]_ |

---

## 8. Domain Change Protocol

1. Every term, invariant, state machine, data class, NFR, and error code gets a stable ID.
2. The confirmed Discovery Decision Record (`docs/discovery/<feature-slug>.md`) is the upstream source for settled decisions; specs and tickets must cite its `DEC-###` IDs rather than restating them from memory.
3. Use `/domain-modeling` to propagate a changed ID into `specs/` and `docs/sprint/SPRINT.md` before implementation resumes, and surface any conflict instead of silently choosing a winner.
4. An ADR is required when a decision passes all three gates in `/domain-modeling`.
5. Never let a domain rule live only in chat, a ticket comment, or an implementation detail.
