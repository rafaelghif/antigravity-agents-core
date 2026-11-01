# 3. Automated Lifecycle Guardrails and Task & Memory Engine Architecture

Date: 2026-09-24
Status: Withdrawn (never implemented)

> **Withdrawn (2026-11-01)**: The `.agents/hooks/` engine described below (`security-scanner.cjs`, `quality-guard.cjs`, `task-orchestrator.cjs`, `code-analyzer.cjs`, `memory-engine.cjs`, and the `aac scan|quality|review|analyze|tasks|memory` CLI) does not exist in this repository and was never shipped. The guardrails that actually exist are three inline Node lifecycle hooks plus the file-based Sprint Board and handoff protocol. See [ADR 0004](0004-inline-node-lifecycle-hooks.md).

## Context

Autonomous coding agents executing complex multi-turn workflows require rigorous boundaries to prevent:
1. Accidental leaks of authentication secrets (GitHub tokens, cloud keys) and catastrophic shell/git command execution.
2. Incomplete dummy implementations, fake data, or placeholder stubs reaching production files.
3. Task graph drift and lost context across session boundaries and context compressions.
4. Unchecked code complexity and shallow module sprawl.

## Decision

We implement a unified, zero-dependency autonomous guardrail architecture powered by Antigravity lifecycle hooks (`.agents/hooks/`) and CLI utilities:

1. **Security & Secret Scanner (`security-scanner.cjs`)**:
   - `PreToolUse` hook intercepting `run_command`, `write_to_file`, and `replace_file_content`.
   - Prohibits destructive commands (`git reset --hard`, `git push --force`, `rm -rf /`, `rmdir /s C:\`).
   - Detects leaked API keys, tokens, and private keys before tool execution.

2. **Quality Code Guard (`quality-guard.cjs`)**:
   - `PreToolUse` hook strictly enforcing production realism and the anti-dummy/mock policy described in `AGENTS.md` §4.
   - Enforces genuine types and concrete implementations in production code while permitting fixtures in test folders (`tests/`, `*.test.*`).

3. **Task Orchestrator & Wave Planner (`task-orchestrator.cjs`)**:
   - DAG task graph engine operating on `.scratch/tasks.json`.
   - Calculates independent parallel execution waves using topological sorting.
   - Detects circular dependencies and tracks execution state (`pending`, `in_progress`, `blocked`, `verified`, `done`).

4. **Automated Code Reviewer & Complexity Analyzer (`code-analyzer.cjs`)**:
   - Multi-axis diff reviewer: Standards (error handling, debug artifacts), Security (leaks, unsafe execution), and Ponytail simplicity.
   - Codebase metrics engine calculating LOC, cyclomatic branch complexity, and the Deep Module Ratio.

5. **Memory Engine & Context Consolidator (`memory-engine.cjs`)**:
   - Manages and audits the 5-Tier Memory Hierarchy.
   - Consolidates runtime state into `.scratch/active_context.json`.
   - `PreInvocation` hook for cold-start rehydration from previous session handoffs (`.scratch/handoff.md`).

6. **CLI Surface (`bin/cli.mjs`)**:
   - Standalone and CI/CD subcommands: `aac scan`, `aac quality`, `aac review`, `aac analyze`, `aac tasks`, and `aac memory`.

## Consequences

- **Positive**: Complete automated verification and protection at every agent tool call and turn boundary.
- **Positive**: Zero external dependencies—pure Node.js standard modules (`node:fs`, `node:path`, `node:child_process`).
- **Positive**: Clean separation between developer-facing CLI commands and background agent lifecycle hooks.
