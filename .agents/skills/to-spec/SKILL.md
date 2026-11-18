---
name: to-spec
description: Converts a confirmed Discovery Decision Record or PRD into a grounded, unambiguous technical specification (specs/<slug>.md) with provenance, reusable codebase touchpoints, security/failure contracts, and requirement-to-test traceability. Use when planning a multi-slice feature or auditing a PRD before ticketing.
---

# To Spec (Grounded Technical Specification)

Transform a confirmed Discovery Decision Record (`docs/discovery/<slug>.md`) or user-provided PRD into an unambiguous specification at `specs/<feature-slug>.md` using [resources/spec-template.md](resources/spec-template.md).

## Decision tree

1. **Does a confirmed DDR (`docs/discovery/<slug>.md`) or explicit PRD exist?**
   - **No** → Stop and run `/discover` (or built-in `/grill-me`) first. Never invent a spec from vague chat memory.
   - **Yes** → Proceed to step 2.
2. **Are any requirements, UI states, auth rules, data contracts, or repo seams ambiguous or conflicting with `CONTEXT.md` / existing code?**
   - **Yes** → **STOP (Anti-Yes-Man Gate).** Do not fill unknowns with plausible prose. Cite the exact gap (`PRD/DDR` vs `path:line`) and call `ask_question` (or route back to `/discover`).
   - **No** → Proceed to step 3.
3. **Are the public seams, reusable codebase components/helpers, and exact verification command verified from the repo?**
   - **No** → Read `CONTEXT.md` (run `/index-project` if empty) and target manifests/files first.
   - **Yes** → Write `specs/<feature-slug>.md` and run the validation gate below.

## Source priority (on conflict, STOP and ask the user)

1. Explicit user decision in this session.
2. Confirmed `DEC-###` in `docs/discovery/<slug>.md` (or confirmed PRD).
3. `CONTEXT.md` invariants & `docs/adr/`.
4. Actual repository code & manifests (`path:line`).
5. Live primary docs via `/research`.
6. Explicitly approved `ASM-###` (never an unapproved guess).

## Specification workflow

1. **Audit Inputs & Ground Against Repo**:
   - Read the DDR/PRD and `CONTEXT.md` end-to-end.
   - Inspect existing UI primitives, hooks, schemas, API routes, and DB tables that overlap with the feature. Record exact `path:symbol` reuse targets.
2. **Build Fact Ledger (Internal)**:
   - Classify every requirement/NFR/control as `KNOWN` (source cited), `OPEN` (blocking question), `ASSUMED` (user-approved `ASM-###`), or `N/A` (one-line rationale).
   - Never invent latency budgets, endpoints, columns, or error codes. If inapplicable (e.g., DB migration on a UI-only filter), write `N/A — <reason>`.
3. **Author `specs/<feature-slug>.md`**:
   - Define `REQ-###` (Given/When/Then), `INV-###` / `ST-###` (illegal states unrepresentable), `SEC-###` (auth/tenancy/parsing/idempotency), `ERR-###` (status/code/recovery), UI state matrix (if UI), `NFR-###` (where applicable, exact units), reusable codebase assets, and the **Traceability Matrix** mapping every ID to a public seam and test.
   - Keep `Status: draft` and `Readiness Verdict: NOT READY` if any ticket-blocking `OQ-###` remains.
4. **Validation Gate (Before Marking `READY FOR TICKETS`)**:
   - Every `REQ-###` cites a source and maps to a public seam and test.
   - Every `INV-###`, `SEC-###`, and `ERR-###` has a test/owner/recovery path.
   - Every reusable UI/utility dependency references real repo paths.
   - Zero vague qualifiers (`fast`, `robust`, `for now`, `TODO`) or unresolved blocking `OQ-###`.

## Route next

- `READY FOR TICKETS` (multi-slice) → `/to-tickets`.
- `READY FOR TICKETS` (single slice) → `/implement`.
- `NOT READY` → resolve listed blockers via `ask_question` or `/discover`.

Use [resources/spec-example.md](resources/spec-example.md) as a provenance shape reference only—never copy its domain facts.
