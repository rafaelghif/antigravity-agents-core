# Domain Docs Configuration

How the engineering skills consume this repository's domain documentation.

## Layout: Single-Context

- **Living Domain Context**: [CONTEXT.md](../../CONTEXT.md) at the repository root. Defines bounded contexts, core terminology, stable invariant/state/quality IDs, and domain boundaries.
- **Discovery Decisions**: `docs/discovery/<feature-slug>.md` holds the confirmed Discovery Decision Record (`DEC-###`, `OQ-###`, `ASM-###`) written by `/grill-me`. It is the upstream provenance for specs and tickets.
- **Specifications**: `specs/<feature-slug>.md` holds the readiness-passed technical specification with requirement-to-test traceability.
- **Architectural Decisions**: [docs/adr/](../adr) contains numbered ADR files (e.g. `0001-antigravity-5-tier-memory-system.md`).

## Consumption Rules

1. Before starting work touching domain logic or architecture, inspect [CONTEXT.md](../../CONTEXT.md), the relevant DDR, and any affected spec.
2. Use the exact vocabulary and stable IDs defined in the glossary and invariant registry. Avoid synonyms or conflicting jargon.
3. If an implementation decision conflicts with an existing ADR, DDR decision, or spec requirement, flag both sources and the production consequence before modifying code.
4. When an invariant, state machine, NFR, security rule, or error code changes, propagate the change into `specs/` and `docs/sprint/SPRINT.md` before implementation resumes.
5. Never invent a domain term, rule, number, or error code to fill a gap. Write `OPEN` and resolve it with the user or the owning artifact.
