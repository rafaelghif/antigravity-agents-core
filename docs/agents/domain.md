# Domain Docs Configuration

How engineering skills consume this repository's codebase index and domain documentation.

## Layout Modes: Single-Context vs Hub-and-Spoke

- **Single-Context (Default for Single-Package Repos)**: [CONTEXT.md](../../CONTEXT.md) at the repository root holds verified stack/commands, shared UI/utility inventory, module boundaries, invariants (`INV-###`), state machines (`ST-###`), quality budgets (`NFR-###`), and error codes (`ERR-###`).
- **Hub-and-Spoke (Enterprise Monorepos & Multi-Domain Repos)**: When `scan-repo.mjs` reports `layoutMode: hub-and-spoke` (`> 1` workspace or `> 100` files), `CONTEXT.md` acts as the lightweight index hub routing to scoped domain files under `docs/domains/<domain>.md` (holding domain-specific UI, services, invariants, and verification commands without bloating every turn).
- **Discovery Decisions**: `docs/discovery/<feature-slug>.md` holds the confirmed Discovery Decision Record (`DEC-###`, `OQ-###`, `ASM-###`) written by `/discover`.
- **Specifications**: `specs/<feature-slug>.md` holds the readiness-passed technical specification with traceability.
- **Architectural Decisions**: [docs/adr/](../adr) contains numbered ADR files (`NNNN-<slug>.md`).

## Consumption Rules

1. Before starting work touching unfamiliar modules, UI, or domain logic, inspect [CONTEXT.md](../../CONTEXT.md) (running `/index-project` if still a template), the relevant DDR, and any affected spec.
2. Reuse exact UI primitives, shared utilities, and canonical vocabulary defined in `CONTEXT.md`.
3. If a ticket, PRD, or implementation decision conflicts with an ADR, DDR, spec, or existing code, stop and ask the user via `ask_question` before modifying code.
4. When an invariant, state machine, NFR, security rule, or error code changes, propagate the change into `specs/` and `docs/sprint/SPRINT.md` before implementation resumes.
5. Never invent a domain term, UI component, endpoint, number, or error code to fill a gap. Mark unknowns `OPEN` and resolve them with the user.
