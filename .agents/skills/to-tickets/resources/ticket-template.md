# Ticket #<NN>: <Outcome-Oriented Title>

- **Wave**: `Wave <W>`
- **Size**: `S` | `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `ready` | `in-progress` | `in-review` | `done` | `blocked`
- **Blocked by**: `None` (or `#<MM>: <Title>`)
- **Unblocks**: `None` (or `#<KK>: <Title>`)
- **Spec**: `specs/<feature-slug>.md`
- **DDR**: `docs/discovery/<feature-slug>.md`
- **Source Requirements**: `REQ-###`, `NFR-###`
- **Source Decisions**: `DEC-###`
- **Traceability**: `INV-###`, `SEC-###`, `ERR-###`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets. If any requirement is unclear, stop and call `ask_question`.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: <observable end-to-end production behavior>
- **In-Scope**: <exact capability including validation, auth, UI states, config/logging, errors, tests>
- **Out-of-Scope**: <explicitly excluded behavior; never defer security/validation/tests>

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: <exact `path:symbol` or `N/A — no UI`>
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**: <exact `path:symbol`>
- **Config & Structured Logger Seams**: <exact config loader + logger `path:symbol`>
- **Sibling Callers Checked (`rg -n`)**: <exact caller `path:line` list or `None — net-new seam`>

### Exact File Touchpoints

| Action | File Path | Exact Symbols / Exports | Purpose & Boundary |
| :--- | :--- | :--- | :--- |
| `CREATE` \| `MODIFY` \| `DELETE` | `<exact/path>` | `<exact symbol/function/component>` | `<single responsibility>` |

## 3. Domain Invariants, Data, Schema & Error Matrix

- **Invariants (`INV-###`) & Transitions (`ST-###`)**: <copied verbatim or `N/A — reason`>
- **Authorization / Tenancy (`SEC-###`)**: <owner/tenant rule or `N/A — reason`>
- **UI States & Disposal (if UI)**: loading, empty, validation error, server/offline error, disabled/in-flight, responsive, controller disposal (`N/A — no UI`)
- **Performance & Scaling Target (`NFR-###`)**: <complexity, N+1, pagination/virtualization, isolate offload or `N/A — reason`>
- **Public Seam & Contract**: <exact exported interface/endpoint/command & input/output shape>

### Data, Schema & Error Matrix

| Surface / Field | Exact Type, Bounds & Format | Error Condition (`ERR-###`) | Status / Code & Recovery |
| :--- | :--- | :--- | :--- |
| `<field / endpoint / arg>` | `<required/optional, min/max, enum/unit>` | `<invalid/missing/unauthorized/conflict>` | `<400/401/403/404/409/exit 1 + recovery>` |

## 4. Anti-Hallucination Do-Not-Invent Guards

- **Forbidden Assumptions**: Never invent API routes, database columns, enum values, env vars, error codes, or UI variants not listed in §2–§3 or `specs/<feature-slug>.md`.
- **Ambiguity Stop Trigger**: If an unmapped edge case or sibling caller conflict surfaces during implementation, STOP and call `ask_question` immediately.

## 5. Execution Plan (In-Progress → Pre-Code Design → TDD → Review → Unblock & Handover)

- [ ] **Step 0 (Live Status Transition)**: Flip `**Status**: in-progress` in this ticket and `docs/sprint/SPRINT.md` BEFORE editing any source file.
- [ ] **Step 1 (Pre-Code Design & Reuse)**: Confirm modularity/DI seam, config keys, logging fields, performance strategy, and reused shared UI/helpers.
- [ ] **Step 2 (Red)**: Write failing tests at `<public seam>` covering happy path, boundaries (`N-1`/`N`/`N+1`), invalid/empty input, auth (`401`/`403`/`404`), idempotency, and failure mode.
- [ ] **Step 3 (Green & Optimize)**: Implement complete production behavior reusing listed assets—zero hardcoded literals/secrets, zero stubs/mocks, proper disposal & bounded I/O.
- [ ] **Step 4 (Verify, Review, Immediate Unblock & Handover)**: Run `audit-diff.mjs` + full verification (`exit 0`), run `/code-review`, flip status to `done`, **immediately unblock** downstream tickets in `SPRINT.md`, run `/handoff` (`HANDOFF.md` + `.scratch/handoff.md`), and distill any new insight via `/self-learn`.

## 6. Production Quality Checklist

Enforce all 7 axes in `.agents/skills/code-review/references/review-rubric.md` (marking inapplicable ticket-specific gates `N/A — <reason>`):

- [ ] **Spec, DRY & Reuse**: Exact acceptance criteria, UI states, and existing primitives/helpers from `CONTEXT.md` reused.
- [ ] **Config, Logging & Security**: Zero hardcoded URLs/secrets; startup config, `<REDACTED>` structured logs, tenant/owner auth, atomic mutations.
- [ ] **Performance, Resilience & Tests**: Zero N+1/unbounded loads/leaked controllers; explicit timeouts; zero `.skip`/SUT mocks/tautological assertions.

## 7. Acceptance Criteria & Verification

- **Verification Command**: `<exact command from spec/CONTEXT.md>`
- [ ] **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>` (`REQ-###`).
- [ ] **Boundary / Error / Auth / Idempotency**: Edge and failure cases proven by automated tests.

## 8. Definition of Done, Live Lifecycle Log & Cross-Machine Handover

- **Live Lifecycle State Log**: `ready -> in-progress -> in-review -> done`
- **Post-Ticket Self-Check & `/code-review` Verdict**: `<pending | APPROVE>`
- **Completed Commit SHA**: `<pending | short-sha>`
- **Verification Output**: `<pending | PASS summary with exact command & exit code>`
- **Source IDs Satisfied**: `<REQ-###, INV-###, SEC-###, ERR-###>`
- **Downstream Unblocked Tickets**: `<#KK flipped to ready | None>`
- **Downstream Handover Notes**: `<exported contracts, config keys, UI primitives, or invariants for next ticket>`
- **Falsified Approaches**: `<dead ends not to repeat>`
