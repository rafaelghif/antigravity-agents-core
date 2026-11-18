# Domain Docs Configuration

How engineering skills consume this repository's codebase index and domain documentation.

## Layout: Single-Context

- **Codebase Index & Domain Map**: [CONTEXT.md](../../CONTEXT.md) at the repository root. Holds verified stack/commands, shared UI/utility inventory, module boundaries, invariants (`INV-###`), state machines (`ST-###`), quality budgets (`NFR-###`), and error codes (`ERR-###`).
- **Discovery Decisions**: `docs/discovery/<feature-slug>.md` holds the confirmed Discovery Decision Record (`DEC-###`, `OQ-###`, `ASM-###`) written by `/discover`.
- **Specifications**: `specs/<feature-slug>.md` holds the readiness-passed technical specification with traceability.
- **Architectural Decisions**: [docs/adr/](../adr) contains numbered ADR files (`NNNN-<slug>.md`).

## Consumption Rules

1. Before starting work touching unfamiliar modules, UI, or domain logic, inspect [CONTEXT.md](../../CONTEXT.md) (running `/index-project` if still a template), the relevant DDR, and any affected spec.
2. Reuse exact UI primitives, shared utilities, and canonical vocabulary defined in `CONTEXT.md`.
3. If a ticket, PRD, or implementation decision conflicts with an ADR, DDR, spec, or existing code, stop and ask the user via `ask_question` before modifying code.
4. When an invariant, state machine, NFR, security rule, or error code changes, propagate the change into `specs/` and `docs/sprint/SPRINT.md` before implementation resumes.
5. Never invent a domain term, UI component, endpoint, number, or error code to fill a gap. Mark unknowns `OPEN` and resolve them with the user.
