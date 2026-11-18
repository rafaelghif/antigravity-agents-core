---
name: wave-execute
description: Orchestrates parallel execution of independent tickets in a Sprint Wave using 2026 Orchestrator-Worker, Blackboard state sync, Bounded Critic Loops, and worktree isolation (workspace share), enforcing disjoint file ownership, real-time ticket unblocking, and per-ticket handovers. Use when executing a Wave with two or more unblocked ready tickets.
---

# Wave Execute (2026 Orchestrator-Worker, Blackboard & Critic Loop)

Execute **independent `ready` tickets within one Wave** (`docs/sprint/SPRINT.md`) concurrently using isolated Git worktrees (`workspace: "share"`), a shared **Blackboard** ledger, and a **Bounded Critic Loop** (`max 2` fix rounds).

## Decision tree

1. **Are there `>= 2` `ready` tickets in the active Wave whose `Blocked by` dependencies are all `done`?**
   - **No (only 1 `ready` ticket or unresolved blockers)** → Do not spawn a swarm; run `/implement` directly on the single `ready` ticket.
   - **Yes** → Proceed to step 2.
2. **Do the candidate tickets have disjoint `Exact File Touchpoints`?**
   - **No (two tickets mutate the same file or shared schema)** → Serialize the conflicting ticket into the next sub-wave or execute sequentially via `/implement`.
   - **Yes** → Execute the `ST-002` Orchestrator workflow below.

---

## Wave state machine (`ST-002`)

`WavePending` → `WaveDispatched` → `WaveIntegrating` → `WaveVerified` (or `WaveBlocked`)

1. **`WavePending` (Preflight & Blackboard Sync)**:
   - Run `node .agents/skills/to-tickets/scripts/validate-board.mjs docs/sprint/SPRINT.md` (`exit 0`).
   - Read `CONTEXT.md` and `docs/learnings/LESSONS.md`; ensure shared contracts from prior waves are already merged.
   - Flip every dispatched ticket's status to `in-progress` in `docs/sprint/SPRINT.md` and `docs/sprint/tickets/<NN>-*.md` BEFORE dispatching workers.
2. **`WaveDispatched` (Parallel Isolated Workers + Blackboard)**:
   - Spawn one worker per disjoint ticket via `swarm` (`action: "add"`, `workspace: "share"`) or `run_workflow` (`parallel` with `workspace: "share"`).
   - **Blackboard Protocol**: Workers never pass bloated prompt chains between peers; instead, each worker reads `CONTEXT.md` + `docs/learnings/LESSONS.md` + its ticket, executes `/implement` Phases 1–2 (TDD + complete production code) inside its own `workspace: "share"` worktree, and reports compact structured output (changed files, new seams/env keys, `audit-diff.mjs` + test exit status, falsified approaches) back to the coordinator / board.
   - **Sequential Fallback**: If `swarm`/`run_workflow` is unavailable in the host runtime, run `/implement` ticket-by-ticket in Wave order, still flipping `in-progress` → `done`, unblocking downstream tickets immediately, and running `/handoff` after every 1 ticket.
3. **`WaveIntegrating` (Merge & Bounded Critic Loop)**:
   - As each worker finishes, merge its diff sequentially into the coordinator workspace, run `audit-diff.mjs` + full verification (`verification-runner` in a fresh context window, `exit 0`).
   - **Bounded Critic Loop (`max 2` iterations)**: Run independent read-only critics via `invoke_subagent` (`adversarial-reviewer`, plus `security-auditor` and `architecture-planner` when auth/secrets/schemas/boundaries change). Builders never grade their own diff. If `🔴 Blocking` findings appear, route targeted failure logs back for fix & re-verification (max `2` rounds); if still blocked after `2` rounds, transition to `WaveBlocked` and escalate via `ask_question`.
4. **`WaveVerified` (Immediate Unblock, Learn & Per-Ticket Handover)**:
   - Immediately mark each completed ticket `done` in `tickets/<NN>-*.md` and `SPRINT.md`, and **immediately unblock** any downstream tickets (`blocked` → `ready`) whose blockers are now `done` without waiting for unrelated waves.
   - Update `CONTEXT.md`, distill any new insights via `/self-learn` into `docs/learnings/LESSONS.md`, and run `/handoff` (`docs/sprint/HANDOFF.md` + `.scratch/handoff.md`) for every completed ticket/integration checkpoint.
