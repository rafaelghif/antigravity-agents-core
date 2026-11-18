---
name: implement
description: Audits a ticket, PRD, or feature slice for ambiguity and codebase feasibility, maps reusable shared UI and helpers, and executes test-first production implementation through full verification. Use when implementing any ticket, GitHub issue, Jira task, or feature slice, even if small.
---

# Implement (Anti-Yes-Man Ticket Audit → Reuse Map → TDD → Verify)

Execute **one ticket or vertical slice** from strict ambiguity & feasibility auditing through codebase reuse mapping, test-first production implementation, and closed-loop verification.

## Decision tree

1. **Does the ticket/PRD/request pass the Ambiguity & Feasibility Audit (Phase 0)?**
   - **No (missing rules, unclear UI states, missing auth/validation/error behavior, or conflict with existing code)** → **STOP. Do NOT write code and do NOT invent defaults.** Call `ask_question` with the exact gaps and proposed `(Recommended)` options.
   - **Yes** → Proceed to step 2.
2. **Is the ticket blocked by an unfinished dependency (`Blocked by` in `docs/sprint/SPRINT.md`)?**
   - **Yes** → Stop and report the blocking ticket to the user.
   - **No** → Proceed to step 3.
3. **Is `CONTEXT.md` populated for the target area of the repo?**
   - **No** → Run `/index-project` reconnaissance on the relevant directories first so you know exact existing components, helpers, and commands.
   - **Yes** → Proceed to Phase 1.

---

## Phase 0: Mandatory Ticket / PRD Ambiguity Audit (Anti-Yes-Man Gate)

Never blindly implement an incomplete ticket (whether from Jira, Linear, GitHub Issue, chat prompt, or `docs/sprint/tickets/`). Audit these 7 checks against the actual repository:

1. **Scope & Acceptance Criteria**: Is the observable outcome unambiguous and testable?
2. **Actors & Authorization**: Who can access/mutate this? What happens on unauthenticated (`401`) or unauthorized/cross-tenant (`403`/`404`) requests?
3. **Inputs, Validation & Boundaries**: Required vs optional fields, min/max lengths, numeric precision, empty/duplicate handling?
4. **Data & API Contract**: Exact request/response fields, status codes, schema changes—and do the referenced endpoints/tables/types actually exist in the repo?
5. **UI / UX States (if UI)**: Loading, empty, validation error, server error, success feedback, disabled/in-flight state, responsive layout?
6. **Failure & Concurrency**: External API timeouts/retries, race conditions, idempotency?
7. **Codebase Contradictions**: Does the ticket contradict `CONTEXT.md`, existing types, or current behavior?

**If any behavior-changing detail is unclear or contradicts the repo:** stop, cite `ticket/PRD` vs `file:line`, and ask the user via `ask_question`.

---

## Phase 1: Codebase Reuse & Touchpoint Plan (Zero Duplication)

Before editing or creating any file:
1. Search existing directories (`components/`, `ui/`, `shared/`, `lib/`, `utils/`, `hooks/`, `schemas/`, `api/`) for reusable UI primitives, hooks, validators, formatters, and API clients.
2. Read every target file and shared primitive/helper you plan to call so imports, props, and types are 100% verified.
3. Search all callers of any shared function/type/component you plan to modify (`rg -n` via `run_command` or search tool).
4. Lock the **Touchpoint & Reuse Plan**:
   - Exact existing primitives/helpers to **reuse or extend** (never duplicate).
   - Exact files to modify (and justification if a new file is strictly required).
   - Exact public seam & test file to run.

---

## Phase 2: Execute TDD & Complete Production Implementation

1. Follow `/tdd`: write failing tests at the public seam covering happy path, boundary cases (`N-1`/`N`/`N+1`, empty/malformed), auth/permission failure, idempotency/concurrency (where applicable), and failure handling.
2. Implement the **smallest complete production slice**—never a happy-path stub. Include real boundary parsing, auth checks, error wrapping, UI states, and observability.
3. Keep production code free of mock stores, dummy tokens, simulated delays, and `TODO` stubs.
4. Run the focused test file and typechecker after each increment.

---

## Phase 3: Definition of Done & Sync

1. Run the **full verification command** (typecheck, linter, build, and test suite) via `run_command` after your final edit and verify exit code `0`.
2. Inspect `git diff` to verify:
   - Zero test tampering (`.skip`, weakened assertions, SUT mocking).
   - Zero duplicate UI components, parallel utilities, hardcoded theme colors, or unrequested file churn.
   - All sibling callers of modified exports still work.
3. If `docs/sprint/SPRINT.md` and ticket files exist: check off `[x]` criteria, record verification output and `Downstream Handover Notes` in the ticket's completion log, and update `SPRINT.md` (proposing a commit only if authorized).
