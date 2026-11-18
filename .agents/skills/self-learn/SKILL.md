---
name: self-learn
description: Distills durable procedural rules from human corrections, search_web research, /browsing observations, code-review findings, and test failures into git-tracked docs/learnings/LESSONS.md without bloating AGENTS.md. Use after user feedback, tricky debugging, or external research (pairs with built-in /learn).
---

# Self-Learn (Multi-Source Procedural Memory Distillation)

Turn transient discoveries, human feedback ("teguran"), and failure trajectories into concise, verified, non-redundant rules in `docs/learnings/LESSONS.md` (maximum `50` active lessons) so every future session and teammate inherits the insight automatically via `SessionStart`.

## Decision tree

1. **Did a durable insight emerge from any verified source below?**
   - `human-feedback`: User correction, preference, or premise pushback.
   - `web-research`: Primary documentation or `2026` best practices via `search_web` / `/research`.
   - `browsing`: Live DOM/network/UI verification discovery via `/browsing`.
   - `code-review`: `🔴 Blocking` or `🟡 Structural` finding from `adversarial-reviewer`, `security-auditor`, or `architecture-planner`.
   - `test-failure`: Root cause of a non-trivial bug, CI regression, or `Stop`/`PostToolUse` hook failure.
   - **No (one-off typo or ephemeral WIP note)** → Do not pollute `docs/learnings/LESSONS.md`; keep ephemeral notes in `.scratch/handoff.md`.
   - **Yes** → Proceed to step 2.
2. **Is this already enforced deterministically by a hook, test, or `CONTEXT.md` invariant?**
   - **Yes (and identical)** → Do not duplicate; cross-link the existing rule/test ID.
   - **No (or an important nuance/gotcha was missed)** → Distill and persist using the workflow below.

---

## Distillation workflow

1. **Verify Before Writing**:
   - Cite the exact verified source (`URL`, `path:line`, test/hook output, or user directive). Never store unverified guesses or secrets (`<REDACTED>`).
2. **Distill Into Actionable Rule (`<= 2` lines)**:
   - Format: `| ID | Source | Scope / Trigger | Falsifiable Rule & Fix | Provenance | Status |`
   - Prefer **executable guardrails** (test case, validator check, or hook regex) over passive prose whenever possible.
3. **Deduplicate, Supersede & Prune (`<= 50` Active Cap)**:
   - Search `docs/learnings/LESSONS.md` before appending. Merge overlapping rules or mark obsolete rules `superseded by L-###` so the file stays token-lean.
   - If the insight represents a domain invariant or costly architectural decision, also promote it to `CONTEXT.md` §6 (`/domain-modeling`) or `docs/adr/NNNN-*.md`.
4. **Pair with Built-In `/learn`**:
   - When the user wants personal/IDE-level persistence outside the repository, also recommend `/learn`.
