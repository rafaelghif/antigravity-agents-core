# ADR NNNN: <Short Imperative Decision Title>

- **Status**: `accepted` | `superseded by ADR-MMMM` | `withdrawn`
- **Date**: `YYYY-MM-DD`
- **Decision Owners**: `<names or roles>`
- **Reversibility**: `easy` | `costly` | `irreversible`
- **Supersedes**: `<ADR-MMMM or None>`
- **DDR Source**: `docs/discovery/<feature-slug>.md#DEC-###`
- **Related Spec**: `specs/<feature-slug>.md`
- **Related IDs**: `INV-###`, `ST-###`, `NFR-###`, `SEC-###`, `ERR-###`

> Provenance rule: cite `DEC-###`, spec IDs, `path:line`, or verified primary URLs. Never invent rejected options or round numeric targets; mark unknowns `OPEN`.

## Context

Architectural problem, domain forces, and constraints (`Source: DEC-###`).

## Decision Drivers (6 Pillars)

- **Future-Proof / Upgradeable**: <extensibility, migration, rollback impact>
- **Scalable / High-Performance**: <load, concurrency, latency/resource impact>
- **Maintainable / Secure**: <cognitive load, boundaries, auth/tenancy/abuse impact>

## Options Considered

| Option | Strengths | Failure Modes / Risks | Migration & Rollback Cost | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** | <summary> | <failure mode> | <cost> | `DEC-###` |
| **Option B** | <summary> | <failure mode> | <cost> | `DEC-###` |

## Decision

Chosen option, exact trade-off rationale, and why the closest alternative lost (`Source: DEC-###`).

## Consequences

- **Positive**: <benefits>
- **Negative / Ceiling**: <accepted limits (`// ponytail:` ceiling + upgrade path)>
- **Security, Observability & Migration**: <auth/PII impact, logs/metrics, expand-migrate-contract + rollback trigger>
- **Invariant Impact**: <affected `INV-###`/`ST-###` and new forbidden states>

## Validation & Follow-Up

- [ ] Test seam, benchmark, or migration rehearsal proving the choice (`Source: spec §8`).
- [ ] Update `CONTEXT.md`, affected specs, `docs/sprint/SPRINT.md`, and supersede any replaced ADR.
