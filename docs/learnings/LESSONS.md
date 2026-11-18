# Distilled Engineering Lessons & Procedural Memory

> **Active Budget**: Maximum `50` `active` lessons. Surfaced at `SessionStart` (`.agents/hooks.json`). Every entry must cite a verified source (`human-feedback`, `web-research`, `browsing`, `code-review`, `test-failure`) and zero secret literals.

| ID | Source | Scope / Trigger | Falsifiable Rule & Fix | Provenance | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `L-001` | `code-review` | `.agents/hooks.json` inline `node -e "..."` | Never place `\"` or `$var` inside inline `node -e "..."` strings; Windows `cmd.exe` splits on `"` and exposes `|`/`<`/`>`. Always encode quotes as `\x22`, `$` as `\x24`, and backticks as `\x60`. | `docs/adr/0004-inline-node-lifecycle-hooks.md`, `tests/aac.test.mjs` | `active` |
| `L-002` | `test-failure` | `git status --porcelain` in hooks/auditors | Always pass `git status --porcelain -uall` when scanning changed files; plain `--porcelain` collapses new directories into `?? dir/` and hides untracked files inside them. | `.agents/skills/implement/scripts/audit-diff.mjs`, `.agents/hooks.json` | `active` |
| `L-003` | `test-failure` | Nested hook tests (`P0-7`) | Strip `AAC_QUALITY_GATE_RUNNING` and `AAC_SKIP_STOP_TEST` via `cleanHookEnv()` in test subprocesses so `npm test` remains hermetic when invoked from `Stop`. | `tests/aac.test.mjs` (`cleanHookEnv`) | `active` |
| `L-004` | `code-review` | Shell command guards (`.agents/git-guard.cjs`) | Split command strings on `[;\n|&]+` and evaluate flags per segment; whole-line negative lookaheads (`--force-with-lease`) are bypassable via chained or duplicate flags. | `.agents/git-guard.cjs`, `tests/aac.test.mjs` | `active` |
| `L-005` | `human-feedback` | Multi-ticket execution & handover | Flip ticket `Status` (`ready` → `in-progress` → `done`) in real time, unblock dependent tickets immediately after each blocker finishes, and checkpoint `HANDOFF.md` after every 1 ticket. | `.agents/skills/implement/SKILL.md`, `.agents/skills/handoff/SKILL.md` | `active` |
