---
name: diagnosing-bugs
description: Isolates bugs and performance regressions using deterministic reproduction loops, hypothesis falsification, and shared root-cause fixes across all callers. Use when debugging failures, flaky tests, race conditions, or unexpected behavior.
---

# Diagnosing Bugs

Reproduce deterministically first, falsify competing hypotheses, and fix the shared root cause across all callers without tampering with tests.

## Decision tree

1. **Do you have a single command that reproduces the bug reliably?**
   - **No** → Execute **Phase 1 (Reproduce)** before editing production code.
   - **Yes** → Proceed to step 2.
2. **Have you proven the exact `file:line` and state transition where actual behavior diverges?**
   - **No** → Execute **Phase 2 (Falsify Hypotheses)**.
   - **Yes** → Search all callers (`rg -n` via `run_command` or search tool), then execute **Phase 3 (Root-Cause Fix)**.

## Workflow

1. **Phase 1 — Reproduce**:
   - Build a fast (<5s) failing test or command via `run_command` that triggers the bug. For race conditions/flakiness, run repeatedly or concurrently to raise reproduction rate. Redact any captured secrets as `<REDACTED>`.
2. **Phase 2 — Falsify Hypotheses**:
   - Trace state backward from the failure to its origin. Test 2–3 competing hypotheses with minimal diagnostics.
   - **Circuit Breaker**: If 3 consecutive hypotheses fail, remove only your temporary debug edits (via `edit_file` or `git stash push -- <instrumented-files>`; never `git checkout -- .`) and escalate/re-align via `ask_question`.
3. **Phase 3 — Root-Cause Fix & Regression Lock**:
   - Fix the shared root cause once in production code (updating any affected sibling callers). Never `.skip`, delete, or weaken tests to pass.
   - Remove temporary diagnostics and run the full test suite via `run_command` to confirm exit code `0`.
