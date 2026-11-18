# Ticket #<NN>: <Outcome-Oriented Title>

- **Wave**: `Wave <W>`
- **Size**: `S` | `M` (one session max)
- **Quality Tier**: `production` (industrial standard; MVP/stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `ready` | `in-progress` | `in-review` | `done` | `blocked`
- **Blocked by**: `None` (or `#<MM>: <Title>`)
- **Unblocks**: `None` (or `#<KK>: <Title>`)
- **Spec**: `specs/<feature-slug>.md`
- **DDR**: `docs/discovery/<feature-slug>.md`
- **Source Requirements**: `REQ-###`, `NFR-###`
- **Source Decisions**: `DEC-###`
- **Traceability**: `INV-###`, `SEC-###`, `ERR-###`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets. If any requirement is unclear, mark `OPEN` and call `ask_question`.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: <observable end-to-end production behavior>
- **In-Scope**: <exact capability including validation, auth, UI states, config/logging, errors, tests>
- **Out-of-Scope**: <explicitly excluded behavior; never defer security/validation/tests>

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: <exact `path:symbol` or `N/A — no UI`>
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**: <exact `path:symbol`>
- **Config & Structured Logger Seams**: <exact config loader + logger `path:symbol`>
- **Expected Files & Sibling Callers to Check**: <exact paths; justify any new file>

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-###`) & Transitions (`ST-###`)**: <copied verbatim or `N/A — reason`>
- **Validation & Parsing**: <boundary schema, bounds, illegal-state rejection>
- **Authorization / Tenancy (`SEC-###`)**: <owner/tenant rule or `N/A — reason`>
- **UI States & Disposal (if UI)**: loading, empty, validation error, server/offline error, disabled/in-flight, responsive, controller disposal (`N/A — no UI`)
- **Performance & Scaling Target (`NFR-###`)**: <complexity, N+1, pagination/virtualization, isolate offload or `N/A — reason`>
- **Error Mapping (`ERR-###`)**: <condition -> status/code -> recovery>
- **Public Seam & Contract**: <exact exported interface/endpoint/command & input/output shape>

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Confirm modularity/DI seam, config keys, logging fields, performance strategy, and reused shared UI/helpers.
- [ ] **Step 2 (Red)**: Write failing tests at `<public seam>` covering happy path, boundaries (`N-1`/`N`/`N+1`), invalid/empty input, auth (`401`/`403`/`404`), idempotency, and failure mode.
- [ ] **Step 3 (Green & Optimize)**: Implement complete production behavior reusing listed assets—zero hardcoded literals/secrets, zero stubs/mocks, proper disposal & bounded I/O.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs` + full verification (`exit 0`), run `/code-review`, update `SPRINT.md` + `docs/sprint/HANDOFF.md`, and prepare/run atomic handover commit.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reused/extended existing UI primitives, tokens, hooks, and helpers (zero duplicate components/utils).
- [ ] Zero hardcoded URLs, magic limits, dummy data, or embedded credentials/secrets.
- [ ] Startup-validated config keys and structured logging (`traceId`, `<REDACTED>` secrets/PII) implemented.
- [ ] Boundary parsing rejects malformed, oversized, and illegal-state payloads.
- [ ] Authentication and tenant/owner authorization are enforced and tested.
- [ ] Mutations are atomic; duplicate idempotency keys cause zero duplicate side effects.
- [ ] Performance optimized (zero N+1, bounded lists/virtualization, non-blocking UI/event thread, resources disposed).
- [ ] External calls have explicit timeouts and bounded retries; errors preserve cause chains.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions) and mutation falsifiability holds.

## 6. Acceptance Criteria & Verification

- **Verification Command**: `<exact command from spec/CONTEXT.md>`
- [ ] **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>` (`REQ-###`).
- [ ] **Boundary / Error / Auth / Idempotency**: Edge and failure cases proven by automated tests.

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `<pending | APPROVE>`
- **Completed Commit SHA**: `<pending | short-sha>`
- **Verification Output**: `<pending | PASS summary with exact command & exit code>`
- **Source IDs Satisfied**: `<REQ-###, INV-###, SEC-###, ERR-###>`
- **Downstream Handover Notes**: `<exported contracts, config keys, UI primitives, or invariants for next ticket>`
- **Falsified Approaches**: `<dead ends not to repeat>`
