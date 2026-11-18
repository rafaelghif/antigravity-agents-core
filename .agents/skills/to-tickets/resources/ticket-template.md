# Ticket #<NN>: <Outcome-Oriented Title>

- **Wave**: `Wave <W>`
- **Size**: `S` | `M` (one session max)
- **Quality Tier**: `production` (MVP/stub shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `ready` | `in-progress` | `in-review` | `done` | `blocked`
- **Blocked by**: `None` (or `#<MM>: <Title>`)
- **Unblocks**: `None` (or `#<KK>: <Title>`)
- **Spec**: `specs/<feature-slug>.md`
- **DDR**: `docs/discovery/<feature-slug>.md`
- **Source Requirements**: `REQ-###`, `NFR-###`
- **Source Decisions**: `DEC-###`
- **Traceability**: `INV-###`, `SEC-###`, `ERR-###`

> Anti-hallucination rule: copy schemas, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets. If any requirement is unclear, mark `OPEN` and ask before coding.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: <observable end-to-end production behavior>
- **In-Scope**: <exact capability including validation, auth, UI states, errors, tests>
- **Out-of-Scope**: <explicitly excluded behavior; never defer security/validation/tests>

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives & Tokens to Reuse/Extend**: <exact `path:symbol` or `N/A — no UI`>
- **Existing Utils / Hooks / Schemas / API Clients**: <exact `path:symbol`>
- **Expected Files & Callers to Check**: <exact paths; justify any new file>

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-###`) & Transitions (`ST-###`)**: <copied verbatim or `N/A — reason`>
- **Validation & Parsing**: <boundary schema, bounds, illegal-state rejection>
- **Authorization / Tenancy (`SEC-###`)**: <owner/tenant rule or `N/A — reason`>
- **UI States (if UI)**: loading, empty, validation error, server error, disabled/in-flight, responsive (`N/A — no UI`)
- **Error Mapping (`ERR-###`)**: <condition -> status/code -> recovery>
- **Public Seam & Contract**: <exact exported interface/endpoint/command & input/output shape>

## 4. Execution Plan (Red → Green → Harden → Refactor)

- [ ] **Step 1 (Red)**: Write failing tests at `<public seam>` covering happy path, boundaries (`N-1`/`N`/`N+1`), invalid/empty input, auth (`401`/`403`/`404`), idempotency, and failure mode.
- [ ] **Step 2 (Green)**: Implement complete production behavior reusing listed shared UI/helpers (no stubs, mocks, or `TODO`s).
- [ ] **Step 3 (Harden)**: Verify timeouts/retries, error wrapping, observability, UI states, and migration/rollback if applicable.
- [ ] **Step 4 (Refactor & Verify)**: Check DRY compliance, verify sibling callers via search, and run the full verification command.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reused/extended existing UI primitives, tokens, hooks, and helpers (zero duplicate components/utils).
- [ ] Boundary parsing rejects malformed, oversized, and illegal-state payloads.
- [ ] Authentication and tenant/owner authorization are enforced and tested.
- [ ] Mutations are atomic; duplicate idempotency keys cause zero duplicate side effects.
- [ ] External calls have explicit timeouts and bounded retries; errors preserve cause chains.
- [ ] Observability (structured logs/redaction) and performance/migration gates satisfied or `N/A`.
- [ ] Zero production mocks/stubs/fake data/`TODO`s and zero test tampering (`.skip`, SUT mocks, weak assertions).
- [ ] Mutation falsifiability: removing a core invariant/auth check turns at least one test red.

## 6. Acceptance Criteria & Verification

- **Verification Command**: `<exact command from spec §11>`
- [ ] **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>` (`REQ-###`).
- [ ] **Boundary / Error / Auth / Idempotency**: Edge and failure cases proven by automated tests.

## 7. Definition of Done (Enterprise)

- [ ] All acceptance criteria and checklist gates satisfied; full verification command exits `0`.
- [ ] Changed callers proven unbroken; working tree free of unrequested churn or production debt.
- [ ] Atomic Conventional Commit landed (only if authorized) and `docs/sprint/SPRINT.md` updated.

## 8. Session Handover & Completion Log

- **Completed Commit SHA**: `<pending | short-sha>`
- **Verification Output**: `<PASS summary with exact command & exit code>`
- **Source IDs Satisfied**: `<REQ-###, INV-###, SEC-###, ERR-###>`
- **Downstream Handover Notes**: `<exported contracts, types, or constraints for next ticket>`
- **Falsified Approaches**: `<dead ends not to repeat>`
