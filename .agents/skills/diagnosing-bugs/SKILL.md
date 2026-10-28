---
name: diagnosing-bugs
description: Diagnoses bugs and performance regressions by building tight reproduction loops and falsifying root-cause hypotheses. Use when debugging failures, flaky tests, race conditions, or unexpected behavior.
---

# Diagnosing Bugs

Isolate and fix bugs systematically by building a deterministic reproduction loop first, falsifying competing hypotheses, and fixing the shared root cause across all callers.

## Decision tree

1. **Do you have a single command that reproduces the bug deterministically?**
   - **No** → Start at **Phase 1 (Build & Tighten the Feedback Loop)**. Do not edit production code yet.
   - **Yes** → Proceed to step 2.
2. **Have you proven the exact line and state transition where actual behavior diverges from the invariant?**
   - **No** → Execute **Phase 2 (Falsify Hypotheses)**.
   - **Yes** → Proceed to step 3.
3. **Have you checked every caller of the broken function across the codebase?**
   - **No** → Run `grep_search` to inspect all callers before applying the fix.
   - **Yes** → Execute **Phase 3 (Root-Cause Fix & Regression Lock)**.

## Debugging workflow

### Phase 1: Build & tighten the feedback loop
- Construct a fast (<5s) command via `run_command` that turns **red** on this specific bug (unit/integration test at the closest seam, `curl`/CLI fixture, or `git bisect run` harness).
- For intermittent or race-condition bugs, loop the trigger concurrently to raise the reproduction rate until it fails reliably.
- Redact all secrets or credentials in captured logs as `<REDACTED>`.

### Phase 2: Falsify hypotheses
- Trace data and execution flow backward from the symptom to the origin of the bad state.
- Formulate 2–3 competing hypotheses and add minimal assertions or traces to falsify wrong ones.
- If 3 consecutive hypotheses fail, remove **only** your temporary debug instrumentation via `replace_file_content` (or `git stash push -- <instrumented-files>`—never run `git checkout -- .` which would destroy the user's uncommitted work) and re-evaluate the architecture with the user.

### Phase 3: Root-cause fix & regression lock
- Fix the shared root cause once (never patch a single caller while leaving sibling callers broken).
- Remove temporary debug traces, confirm the reproduction command turns **green**, and run the full test suite.
