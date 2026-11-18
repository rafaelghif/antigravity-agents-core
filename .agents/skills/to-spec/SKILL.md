---
name: to-spec
description: Audits a Discovery Decision Record or PRD and expands it into an industrial-grade, repo-grounded specification (specs/<slug>.md) with configurability, logging, security, performance, reusable assets, and requirement-to-test traceability. Use before slicing multi-session tickets.
---

# To Spec (Industrial-Grade Grounded Specification)

Convert a confirmed Discovery Decision Record (`docs/discovery/<slug>.md`) or PRD into an unambiguous specification at `specs/<feature-slug>.md` using [resources/spec-template.md](resources/spec-template.md).

## Decision tree

1. **Does a confirmed DDR (`docs/discovery/<slug>.md`) or explicit PRD exist?**
   - **No** → Stop and run `/discover` (or built-in `/grill-me`) first.
   - **Yes** → Proceed to step 2.
2. **Are any requirements, UI states, auth/tenancy rules, config/env keys, logging rules, performance targets, or data contracts ambiguous or conflicting with `CONTEXT.md`?**
   - **Yes** → **STOP (Anti-Yes-Man Gate).** Cite exact gaps (`PRD/DDR` vs `path:line`) and call `ask_question`. Never invent defaults.
   - **No** → Proceed to step 3.
3. **Have you researched any unfamiliar external API/architecture patterns (`search_web`) and verified reusable repo assets in `CONTEXT.md`?**
   - **No** → Run `/index-project` or `/research` first.
   - **Yes** → Write `specs/<feature-slug>.md` and validate it with the black-box validator script.

## Workflow

1. **Ground Against Codebase**: Read DDR/PRD and `CONTEXT.md` end-to-end. Verify exact `path:symbol` for shared UI widgets/components, theme tokens, API clients, schemas, config loaders, and structured loggers.
2. **Classify Facts (`KNOWN` / `OPEN` / `ASSUMED` / `N/A`)**: Copy numbers, schemas, and commands verbatim. Inapplicable sections get `N/A — <reason>`, never silent omission or fake metrics.
3. **Specify Industrial Contracts**:
   - Functional `REQ-###` (Given/When/Then), `INV-###` / `ST-###`, and UI state matrix (`loading`, `empty`, `validation error`, `server/offline error`, `disabled`, disposal).
   - **Architecture & Design Diagrams (Mermaid)**: `C4Context`/`C4Container` (component & trust boundaries), `erDiagram` (scoped tables with `PK`/`FK`), `sequenceDiagram` (auth/payment/distributed flows), and `stateDiagram-v2` (from `[*]`). Mark inapplicable diagrams `N/A — <reason>`.
   - Security & credential hygiene (`SEC-###`: auth/BOLA, strict parsing, idempotency, secret isolation).
   - Configurability (typed startup-validated keys), structured logging (`traceId`, `<REDACTED>`), API Contract (`OpenAPI`/`AsyncAPI`), Rollout/Canary & Rollback SOP, Observability SLI/SLO & Runbook, and performance/complexity budgets (`NFR-###`, verified via `/perf-audit`).
   - Traceability Matrix mapping every requirement to a public seam and automated test.
4. **Validate via Black-Box Script**:
   ```bash
   node .agents/skills/to-spec/scripts/validate-spec.mjs --help
   node .agents/skills/to-spec/scripts/validate-spec.mjs specs/<feature-slug>.md
   ```

## Route next

- `READY FOR TICKETS` (multi-slice) → `/to-tickets`.
- `READY FOR TICKETS` (single slice) → `/implement`.
- `NOT READY` → resolve blockers via `ask_question` or `/discover`.

Use [resources/spec-example.md](resources/spec-example.md) as a provenance shape reference only—never copy its domain facts.
