# ADR NNNN: <Short Imperative Decision Title>

- **Status**: `accepted` | `superseded by ADR-MMMM` | `withdrawn`
- **Date**: `YYYY-MM-DD`
- **Decision Owners**: `<names or roles>`
- **Reversibility**: `easy` | `costly` | `irreversible`
- **Supersedes**: `<ADR-MMMM or None>`
- **DDR Source**: `docs/discovery/<feature-slug>.md#DEC-###`
- **Related Spec**: `specs/<feature-slug>.md`
- **Related IDs**: `INV-###`, `ST-###`, `NFR-###`, `SEC-###`, `ERR-###`

## How to fill this ADR (LLM rules)

1. **Cite a source for every claim**: `DEC-###`, a spec ID, `path:line`, or a live primary-source URL. No unsourced rationale.
2. **Never invent an option**: the alternatives table must contain options that were actually considered in the DDR or the review.
3. **Copy numbers verbatim**: latency, retention, RTO/RPO, and migration windows must not be rounded.
4. **Name the closest rejected option** and the exact production failure it would have introduced.
5. **No implementation dump**: record the contract, invariants, and consequences, not a code listing.
6. **Do not restate the whole spec**: an ADR explains *why* this decision beat its alternatives and what it costs.
7. **Mark unknowns `OPEN`** with an owner and a resolution path; never hide them behind confident prose.

## Context

State the architectural problem, domain forces, production constraints, and the failure modes that forced a decision. Cite the relevant `INV-###`, `NFR-###`, or `SEC-###` identifiers from `CONTEXT.md`, the DDR, or the spec. (`Source: DEC-###`)

## Decision Drivers (6 Pillars)

- **Future-Proof**: <extensibility and contract stability impact>
- **Scalable**: <load, data-growth, and concurrency impact>
- **Maintainable**: <cognitive load and module-boundary impact>
- **Secure**: <auth, tenancy, data-exposure, and abuse impact>
- **High-Performance**: <latency, throughput, and resource impact>
- **Upgradeable**: <migration, rollback, and backward-compatibility impact>

## Options Considered

| Option | Strengths | Failure Modes / Production Risks | Migration & Rollback Cost | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** | <summary> | <how it fails under load, attack, or partial failure> | <cost> | `DEC-###` |
| **Option B** | <summary> | <how it fails under load, attack, or partial failure> | <cost> | `DEC-###` |

## Decision

State the chosen option and the specific trade-off rationale. Name the rejected option that came closest and why it lost. (`Source: DEC-###`)

## Consequences

- **Positive**: What becomes simpler, safer, faster, or cheaper.
- **Negative / Ceiling**: What trade-offs or scaling limits we accept (`// ponytail:` ceiling and upgrade path when applicable).
- **Security & Compliance**: Authorization, tenancy, secrets, PII, retention, and audit impact.
- **Performance & Scalability**: Measured or expected budgets and the load at which the decision breaks.
- **Observability & Operability**: Logs, metrics, alerts, dashboards, runbook, and shutdown impact.
- **Data Migration & Rollback**: Expand-migrate-contract path, backfill, rollback trigger, and recovery proof.
- **Invariant Impact**: Which `INV-###`/`ST-###` entries change, and the exact new forbidden state.

## Validation

How the decision will be proven correct: the test seam, benchmark, migration rehearsal, security test, or production signal that falsifies a wrong choice. (`Source: spec §11`)

## Follow-Up

- [ ] Update `CONTEXT.md` invariants, state transitions, and glossary.
- [ ] Update affected specs and the `docs/sprint/SPRINT.md` traceability matrix.
- [ ] Record the rollback trigger and owner.
- [ ] Mark any superseded decision or ADR explicitly; never leave two active truths.
- [ ] Record the propagation report for every affected ticket.
