# 4. Inline Node Lifecycle Hooks and File-Based Task Memory

Date: 2026-11-01
Status: Accepted

## Context

V6 needs deterministic guardrails that run inside Antigravity's lifecycle hook contract (`.agents/hooks.json`) on Linux, macOS, and Windows. Two earlier ADRs described architectures that were never shipped:

- [ADR 0002](0002-cross-platform-node-lifecycle-hooks.md) proposed external `.agents/hooks/*.cjs` scripts plus `.sh`/`.ps1` reference implementations.
- [ADR 0003](0003-automated-lifecycle-guardrails-and-task-memory-engine.md) proposed a five-module hook engine and `aac scan|quality|review|analyze|tasks|memory` CLI commands.

Antigravity executes hook commands through the host shell. The hook payload provides `workspacePaths` on stdin, but the working directory of the hook process is not part of the documented contract. Any hook command that relies on a relative script path (`node .agents/hooks/guard.mjs`) can therefore fail silently in a project with multiple mounted folders, and a silent hook failure is worse than no hook.

## Decision

1. **Inline `node -e` hook programs.** Each hook command is a self-contained Node program embedded in `.agents/hooks.json`. It requires only Node.js (already required by the installer and test suite), has no relative-path dependency, and behaves identically under `cmd /c`, PowerShell, and `sh -c`.
2. **Resolve workspace paths from the documented payload.** `lifecycle-session-bootstrap` reads `workspacePaths` from stdin and checks each root for `.scratch/handoff.md`, `docs/sprint/SPRINT.md`, and `CONTEXT.md`. It falls back to `process.cwd()` only when the payload is absent (for example, when a developer runs the hook manually).
3. **Normalize before matching, repeatedly.** `git-destructive-guard` strips stacked shell wrappers (`sudo`, `env VAR=...`, `command`, `nohup`, `timeout N`, `bash -lc`, `powershell -Command`) and stacked git global options (`-C`, `-c`, `--git-dir`, `--work-tree`, `--no-pager`, ...) in a loop, then searches each command segment for a git invocation — including `git.exe` and `$(git ...)` forms. This closes the bypasses found in the V6 audit (`git -C <path> push --force`, `git -c ... reset --hard`, `git -C . -c ... reset --hard`, `sudo env FOO=1 git clean -fd`, `bash -c 'git reset --hard'`).
4. **Cover every file-write tool with its real argument name.** `production-no-mock-guard` matches `write_to_file` (`CodeContent`), `replace_file_content` (`ReplacementContent`), and `multi_replace_file_content` (`ReplacementChunks`). Omitting `ReplacementContent` made the guard trivially bypassable through Antigravity's default edit tool.
5. **Ask, do not silently deny.** Both guards return `decision: "ask"` so a human approves genuinely destructive or fake-looking changes instead of the agent working around a hard denial. The 5-second `timeout` keeps the loop responsive.
6. **File-based task memory.** The durable task graph is `docs/sprint/SPRINT.md` plus per-ticket files; the session bridge is `.scratch/handoff.md`. No background daemon, JSON task engine, or in-memory state is required. `CONTEXT.md` and `docs/adr/` hold durable domain and architecture knowledge.

## Consequences

- **Positive**: One hook file, zero external script resolution, identical behavior on all three operating systems, and regression coverage for every bypass in `tests/aac.test.mjs`.
- **Positive**: The task graph is reviewable in normal pull requests and survives session compaction and model changes.
- **Trade-off**: Inline programs are harder to read than standalone files, and the shell quoting must avoid `$`/`"` hazards. Tests execute the exact command strings from `hooks.json`, so quoting regressions fail CI rather than production.
- **Trade-off**: Heuristic guards can still produce false positives. `decision: "ask"` makes that acceptable; `decision: "deny"` would not.
