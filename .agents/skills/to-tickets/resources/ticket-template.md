# Ticket #<NN>: <Outcome-Oriented Title>

- **Wave**: `Wave <W>`
- **Size**: `S` | `M` (one session maximum)
- **Quality Tier**: `production` (enterprise-grade; MVP and prototype shortcuts are forbidden)
- **Status**: `ready` | `in-progress` | `in-review` | `done` | `blocked`
- **Blocked by**: `None` (or `#<MM>: <Blocking Ticket Title>`)
- **Unblocks**: `None` (or `#<KK>: <Downstream Ticket Title>`)
- **Spec**: `specs/<feature-slug>.md`
- **DDR**: `docs/discovery/<feature-slug>.md`
- **Source Requirements**: `REQ-###`, `NFR-###` (exact IDs this slice satisfies)
- **Source Decisions**: `DEC-###` (the DDR decisions that justify the behavior)
- **Traceability**: `INV-###`, `SEC-###`, `ERR-###` (exact IDs this slice enforces)

## How to fill this ticket (LLM rules)

1. **Cite before writing**: every behavior, number, schema, and error code must cite a source ID or `path:line`. If it cannot, write `OPEN` and stop.
2. **One objective**: one observable outcome, one session, `S` or `M`. If the work needs two outcomes, split the ticket and preserve the source IDs.
3. **No invented contract**: copy the seam, schema, error mapping, and verification command from the spec verbatim.
4. **Never defer hardening**: authorization, validation, idempotency, failure handling, observability, and test proof belong to this ticket.
5. **Never weaken proof**: no skipped tests, no tautological assertions, no mocking the system under test.
6. **Mark inapplicable gates `N/A` with a rationale**: never delete a required checkbox.
7. **Examples are shape only**: never copy illustrative values from templates or resources.

## 1. Objective & Demoable Outcome (Vertical Behavior)

State the end-to-end production behavior this ticket delivers, how it is demonstrated, and why it matters. Never a horizontal single-layer task.

- **Demoable Outcome**: <what can be demonstrated or verified when this ticket is done>
- **Source**: `REQ-###`, `DEC-###`

## 2. Scope Boundary (Session Focus)

- **In-Scope**: Exact capability delivered, including its validation, authorization, failure handling, tests, and observability.
- **Out-of-Scope**: Genuinely separate behavior deferred to downstream tickets. Production hardening for a seam introduced here is never deferred.
- **Source**: `REQ-###`, `DEC-###`

## 3. Domain Invariants & Contracts

- **Invariants Enforced**: `INV-###` statements this slice must preserve, copied verbatim.
- **State Transitions**: Allowed and forbidden transitions touched by this slice (`ST-###`).
- **Validation & Parsing**: Ingress parsing strategy, payload bounds, and illegal-state rejection.
- **Authorization / Tenancy**: Exact owner or tenant rule on every read and mutation (`SEC-###`).
- **Error Mapping**: `ERR-###` conditions, status/code, and recovery behavior.
- **Source**: `CONTEXT.md`, spec §3 and §6, DDR §4.

## 4. Public Seam & Touchpoints

- **Primary Seam Under Test**: Exact public interface (endpoint, CLI command, or exported module function) where automated tests assert behavior.
- **Contract**: Input/output schema, versioning, idempotency key, and pagination rules where relevant.
- **Expected Touchpoints**: Modules/directories expected to be created or modified, plus blast-radius callers to re-verify via `grep_search`.
- **Source**: spec §7, `DEC-###`.

## 5. Execution Plan (Red → Green → Harden → Refactor)

- [ ] **Step 1 (Red)**: Write failing tests at `<public seam>` for the happy path, `N-1`/`N`/`N+1` boundaries, unauthorized access, duplicate idempotency, and at least one failure mode.
- [ ] **Step 2 (Green)**: Implement the **smallest complete production behavior** that passes the tests: boundary parsing, authorization, transactions, idempotency, and explicit error mapping. No happy-path stub.
- [ ] **Step 3 (Harden)**: Add timeouts, bounded retries with backoff and jitter, observability, measurable performance checks, and migration/rollback proof where the slice touches a schema or contract.
- [ ] **Step 4 (Refactor & Verify)**: Remove duplication, flatten control flow, re-check callers via `grep_search`, and run the full verification command.

## 6. Production Quality Checklist

Mark `N/A` with a one-line rationale only when the concern genuinely cannot apply.

- [ ] Ingress parsing rejects malformed, oversized, and illegal-state payloads.
- [ ] Authentication and tenant/owner authorization are enforced and tested.
- [ ] Mutations are atomic; duplicate idempotency keys cause zero duplicated side effects.
- [ ] Concurrency conflicts fail deterministically with the documented `ERR-###`.
- [ ] External calls have explicit timeouts and bounded retries with backoff and jitter.
- [ ] Errors are wrapped with preserved causes; no empty `catch` blocks or swallowed failures.
- [ ] Structured logs include trace context and redact secrets/PII.
- [ ] Required metrics and alert-worthy failure signals exist.
- [ ] Performance budget is measured or explicitly justified `N/A`.
- [ ] Schema/contract changes include expand-migrate-contract and rollback proof.
- [ ] Configuration and secrets come from the environment with fail-fast validation.
- [ ] No production mock, stub, fake data, dummy token, artificial delay, or deferred `TODO`.
- [ ] No test is skipped, weakened, deleted, or mocked at the system under test.
- [ ] Every source ID in the header maps to at least one test in this ticket.

## 7. Acceptance Criteria & Verification

- **Verification Command**: `<exact runnable test + typecheck + lint command>` (Source: spec §11)
- [ ] **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>` (`REQ-###`).
- [ ] **Happy Path**: The primary production behavior is proven end-to-end.
- [ ] **Boundary Matrix**: `N-1`, `N`, `N+1`, empty/nil, maximum length, and malformed input fail safely.
- [ ] **Authorization**: Cross-tenant/unauthorized access returns `403`/`404` with zero data leakage (`SEC-###`).
- [ ] **Idempotency**: A duplicate request returns the identical response and creates zero duplicate side effects (`SEC-###`).
- [ ] **Failure Mode**: Injected dependency failure produces the documented error or degradation path (`ERR-###`).
- [ ] **Mutation Falsifiability**: Removing a core invariant or authorization check turns at least one test red.
- [ ] **Performance**: The measurable budget for this seam is met or explicitly `N/A` with rationale (`NFR-###`).

## 8. Definition of Done (Enterprise)

- [ ] All acceptance criteria are checked (`[x]`) and the full verification command passes with exit code 0.
- [ ] Typecheck and linter are clean; changed callers are proven unbroken.
- [ ] No skipped/weakened tests, production mocks, fake data, or `TODO` placeholders remain.
- [ ] Security, tenancy, idempotency, failure, and observability gates are satisfied or justified `N/A`.
- [ ] Migration/rollback was rehearsed or proven unnecessary.
- [ ] Every source requirement and decision in the header is satisfied by a test or an explicit `N/A` rationale.
- [ ] Atomic Conventional Commit created (or explicitly deferred with user consent) and recorded below.
- [ ] `docs/sprint/SPRINT.md`, this ticket, and downstream handover notes are updated.

## 9. Session Handover & Completion Log

- **Completed Commit SHA**: `<pending | short-sha>`
- **Verification Output**: `<pending | PASS summary with command and exit code>`
- **Production Gates Verified**: `<security, idempotency, observability, migration, performance>`
- **Source IDs Satisfied**: `<REQ-###, INV-###, NFR-###, SEC-###, ERR-###>`
- **Downstream Handover Notes**: `<Exact contracts, types, invariants, or edge-case notes the next session/ticket needs to know>`
- **Falsified Approaches**: `<Dead ends the next session must not repeat>`
