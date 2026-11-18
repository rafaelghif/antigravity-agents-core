---
name: implement
description: Audits any ticket or PRD for ambiguity, flips ticket status to in-progress in real time, designs modular/configurable/optimized solutions reusing shared UI and utilities, executes test-first production code, runs post-ticket independent review, immediately unblocks downstream tickets, and checkpoints per-ticket handover. Use when implementing any ticket, issue, or feature slice.
---

# Implement (Real-Time Lifecycle → Ambiguity Audit → Design → TDD → Review → Unblock & Handover)

Build **one ticket or vertical slice** to industrial production quality—never MVP stubs, hardcoded values, deferred status updates, or unreviewed diffs.

## Decision tree

1. **Does the ticket/PRD/request pass Phase 0 (Ambiguity & Feasibility Audit)?**
   - **No (unclear rules, UI states, auth/tenancy, config keys, API contracts, or repo conflicts)** → **STOP. Do NOT write code and do NOT invent defaults.** Call `ask_question` with exact gaps and `(Recommended)` options.
   - **Yes** → Proceed to step 2.
2. **Is the ticket blocked by an unfinished ticket (`Blocked by` in `docs/sprint/SPRINT.md`)?**
   - **Yes** → Stop and report the blocking ticket first.
   - **No** → If the active Wave has `>= 2` independent `ready` tickets with disjoint files, consider `/wave-execute` for parallel execution; otherwise proceed to step 3.
3. **Is `CONTEXT.md` populated for the target area of the codebase?**
   - **No** → Run `/index-project` (including `scan-repo.mjs`) first so you know exact dependencies, UI primitives, config/logging seams, and verification commands.
   - **Yes** → Immediately flip ticket status to `in-progress` and execute Phases 1–3 below.

---

## Phase 0: Mandatory Ticket / PRD Ambiguity Audit (Anti-Yes-Man Gate)

Audit Jira/GitHub/Linear/chat/Sprint tickets against these 7 checks before designing or coding:
1. **Scope & Acceptance Criteria**: Is every expected behavior and exclusion testable?
2. **Actors & Auth**: Who can access/mutate this? What happens on `401`/`403`/`404` or cross-tenant access?
3. **Inputs & Edge Cases**: Required/optional fields, bounds, formats, empty/duplicate/idempotent cases?
4. **Data & API Contract**: Exact fields, status/error codes, schema migrations—and do referenced tables/endpoints exist?
5. **UI / UX States (if UI)**: Loading, empty, validation error, server/offline error, disabled/in-flight, responsive, disposal?
6. **Config, Logging & Failures**: Env/config keys, timeouts/retries, offline/partial failure behavior?
7. **Codebase Contradictions**: Does anything contradict `CONTEXT.md`, `docs/learnings/LESSONS.md`, or existing code?

**Hard rule:** If any behavior-changing detail is missing or contradictory, stop, cite `ticket/PRD` vs `file:line`, and call `ask_question`.

---

## Phase 1: Pre-Code Design, Config/Logging & Reuse Plan (After `in-progress` Flip)

Before editing any production or test file:
1. **Immediate Status Transition**: Update `**Status**: in-progress` in both `docs/sprint/tickets/<NN>-*.md` and `docs/sprint/SPRINT.md` so concurrent sessions or teammates know this ticket is actively owned.
2. **Reuse & Callers Search**: Search `components/`, `widgets/`, `ui/`, `shared/`, `lib/`, `utils/`, `hooks/`, `schemas/`, `api/`, read target primitives/helpers, and check all callers (`rg -n`) of any shared symbol you will modify.
3. **Engineering Design Check** (invoke `/codebase-design` if non-trivial):
   - Modularity & narrow DI seam at external I/O boundaries.
   - Performance optimization: zero N+1, optimal data structures, cursor pagination/`ListView.builder`, isolate/worker offload for heavy CPU, `dispose()`/`close()` plan.
   - Configurability: exact env, `--dart-define`, or typed config keys (zero hardcoded URLs, limits, or secrets).
   - Structured logging: events, `traceId`, and `<REDACTED>` secret/PII policy.

---

## Phase 2: TDD Execution & Optimization

1. Follow `/tdd`: write failing public-seam tests (happy path, `N-1`/`N`/`N+1`, invalid/empty, auth, idempotency, failure mode).
2. Implement complete production logic—zero stubs, mock stores, dummy data, hardcoded secrets/URLs, or stray `print`/`console.log`.
3. Run focused tests and static analyzer/typechecker (`dart analyze`, `tsc --noEmit`, etc.) after each step.

---

## Phase 3: Post-Ticket Re-Check, Independent Review & Handover Commit

1. **Ticket Re-Check**: Re-read the ticket/PRD line-by-line and confirm every acceptance criterion, touchpoint, UI state, config key, log event, and edge case is implemented.
2. **Black-Box Diff Audit & Full Verification**:
   ```bash
   node .agents/skills/implement/scripts/audit-diff.mjs --help
   node .agents/skills/implement/scripts/audit-diff.mjs
   ```
   Then run the project's full test, static analysis, lint, and build commands via `run_command` and confirm exit code `0`.
3. **Mandatory Post-Ticket Review**: Flip ticket status to `in-review` and run `/code-review` (using read-only `adversarial-reviewer`, plus `security-auditor` / `architecture-planner` as needed) via `invoke_subagent`.
4. **Immediate Status Done, Downstream Unblock & Per-Ticket Handover**:
   - Flip the completed ticket to `done` in `docs/sprint/tickets/<NN>-*.md` and `docs/sprint/SPRINT.md` immediately upon review approval.
   - **Never delay unblocking**: immediately inspect every `blocked` ticket whose `Blocked by` list is now `100%` `done` and promote it to `ready` in both its ticket file and `SPRINT.md`.
   - Update `CONTEXT.md` if new seams/primitives/config vars were added, and run `/self-learn` if any new insight emerged.
   - **Mandatory Per-1-Ticket Handover**: Run `/handoff` immediately after finishing this ticket (`docs/sprint/HANDOFF.md` + `.scratch/handoff.md`), then create one atomic Conventional Commit (`feat(scope): ...`) if commits were authorized in this session (otherwise propose the exact commit command/message).
