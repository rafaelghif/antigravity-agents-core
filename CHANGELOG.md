# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.2.0] - 2026-09-24

### Added
- **Smart Workspace Upgrade Command (`upgrade`)**: Introduced `npx @rafaelghif/aac-core upgrade` to safely synchronize core rules, skills, plugins, and hooks from older versions (e.g. `v5.0.3` / `v5.1.0`) to latest without losing custom project work.
- **Strict User Asset Protection**:
  - `CONTEXT.md`: Strictly preserved if present; user-defined domain models, bounded contexts, and glossaries are never overwritten.
  - `.agents/mcp_config.json`: Workspace credentials and private MCP tokens are strictly preserved.
  - `.scratch/`: Active session handoffs and scratchpads are strictly preserved.
  - `package.json`: Guaranteed zero pollution; never created or modified in user target repositories.
- **Smart Hooks Merging**: Upgrades merge `.agents/hooks.json` intelligently—injecting latest framework hooks (`git-guardrails`, `quality-gate`, `session-handoff`, `security-scanner`, `quality-guard`, `context-rehydration`, `code-review-gate`, `task-orchestration`) and updating standard hook definitions while retaining all custom user-defined hooks and user toggle states (`enabled: false/true`).
- **Security & Secret Scanner Hook & CLI (`security-scanner.cjs`)**: PreToolUse hook intercepting `run_command`, `write_to_file`, and `replace_file_content`. Blocks destructive commands (`git reset --hard`, `git push --force`, `rm -rf /`) and detects exposed API keys, tokens, and private keys.
- **Quality Code Guard Hook & CLI (`quality-guard.cjs`)**: PreToolUse hook enforcing production realism and the anti-dummy/mock standard (`production-integrity.md`) on production files.
- **Task Orchestrator & Wave Planner Engine (`task-orchestrator.cjs`)**: DAG task graph engine operating on `.scratch/tasks.json`. Computes parallel execution waves via topological sorting and flags circular dependencies.
- **Automated Code Reviewer & Complexity Analyzer (`code-analyzer.cjs`)**: Multi-axis diff reviewer (Standards, Security, Ponytail) and complexity analyzer (LOC, cyclomatic branch complexity, Deep Module Ratio).
- **Memory Engine & PreInvocation Rehydration (`memory-engine.cjs`)**: PreInvocation hook rehydrating cold starts from `.scratch/handoff.md` and maintaining snapshots in `.scratch/active_context.json`.
- **Extended CLI Tooling (`bin/cli.mjs`)**: Added `aac scan`, `aac quality`, `aac review`, `aac analyze`, `aac tasks`, and `aac memory` subcommands with zero runtime dependencies.
- **PRD & Technical Specification Protocol (`to-spec/SKILL.md`)**: Upgraded to 10-point production PRD standard including problem statement, user personas & journeys, explicit anti-scope non-goals, functional Given/When/Then acceptance criteria, NFR latency/throughput budgets, Mermaid state machine diagrams, data schemas, error codes, and telemetry.
- **Task Management & Markdown Sync Engine (`to-tickets`, `task-orchestrator.cjs`)**: Added automated synchronization of markdown tickets into `.scratch/tasks.json` via `aac tasks sync`, runnable automated verification commands (`verificationCmd`), blast radius boundaries, and seam tracking.
- **Clean Architecture & Domain Purity Protocol (`architecture-and-flow.md`)**: Enforced Hexagonal/Clean Architecture boundaries prohibiting domain core from importing database/HTTP packages, zero cyclic dependencies, and Command-Query Separation (CQS).
- **Codebase Design & Deep Modules (`codebase-design/SKILL.md`)**: Codified information hiding, eliminating leaked ORM/SQL representations, and maximizing implementation leverage behind minimal public seams.
- **Robust Business Logic Standards (`coding-standards.md`)**: Added Section 6 on type-driven design ("make illegal states unrepresentable"), idempotency keys for mutations, optimistic locking, UTC temporal precision, and non-floating-point monetary representations.
- **Architectural & Semantic Diff Linters (`code-analyzer.cjs`)**: Added checks in `reviewDiff` catching hexagonal architecture layer violations, financial floating-point arithmetic, and deep nesting.

### Changed
- **Version Bump**: Bumped framework version to `5.2.0` across manifests (`package.json`), CLI (`bin/cli.mjs`), installers (`install.ps1`, `install.sh`), test suites (`tests/cli.test.mjs`), and documentation (`README.md`), adhering strictly to SemVer 2.0.0 for backwards-compatible feature additions.

## [5.1.0] - 2026-09-24

### Added
- **Autonomous Session Continuity & Handoff Hook**: Added [`.agents/hooks/handoff-reminder.cjs`](.agents/hooks/handoff-reminder.cjs) (and `.js`) as a native Antigravity `Stop` lifecycle hook registered in [`.agents/hooks.json`](.agents/hooks.json).
- **Token Limit Resilience**: When a session is interrupted due to token limits, step ceilings (`max_steps_exceeded`), or abnormal exits where conversational turns are impossible, the hook automatically parses `git status`, diff stat, and `transcript.jsonl` to synthesize `.scratch/handoff.md` without consuming LLM tokens.
- **Loop Protection**: Built-in 1-turn retry ceiling via `.scratch/.handoff-prompted` guaranteeing zero infinite continuation loops.
- **Automated Hook Verification Suite**: Added comprehensive test coverage in [`tests/cli.test.mjs`](tests/cli.test.mjs) verifying clean stop allowances, uncommitted code modification gating, loop protection, and abnormal termination auto-synthesis.

### Changed
- **Version Bump**: Bumped version to `5.1.0` across manifests (`package.json`), CLI (`bin/cli.mjs`), installers (`install.ps1`, `install.sh`), test suites (`tests/cli.test.mjs`), and documentation (`README.md`), strictly following SemVer 2.0.0 for backwards-compatible feature additions.

## [5.0.5] - 2026-09-24

### Added
- **Always-On Rules Documentation**: Comprehensive documentation of workspace always-on operational rules in [`README.md`](README.md), including `production-integrity.md`, `ponytail.md`, `caveman.md`, `coding-standards.md`, `git-workflow.md`, and `memory-management.md`.

### Changed
- **CI/CD Dual Registry Automation**: Overhauled [`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml) into a 3-job parallel pipeline to publish packages simultaneously to both npm public registry (`registry.npmjs.org`) and GitHub Packages (`npm.pkg.github.com`) upon release publication.
- **Trigger De-duplication**: Removed duplicate `push: tags: ['v*']` trigger in GitHub Actions workflow to eliminate race conditions with the `release: [published]` trigger.
- **Version Bump**: Bumped version to `5.0.5` across manifests (`package.json`), CLI (`bin/cli.mjs`), installers (`install.ps1`, `install.sh`), test suites (`tests/cli.test.mjs`), and documentation (`README.md`).

## [5.0.4] - 2026-09-24

### Added
- **Production Integrity & Zero-Assumption Protocol**: Implemented [`production-integrity.md`](.agents/rules/production-integrity.md) (`trigger: always_on`) strictly prohibiting assumptions, hallucinations, dummy/fake mocks, and hardcoded placeholders in production code.
- **Production Realism Standards**: Integrated production realism, zero-dummy policies, and test fixture isolation into [`coding-standards.md`](.agents/rules/coding-standards.md) and [`AGENTS.md`](AGENTS.md).
- **Mandatory Clarification Routing**: Wired ambiguous requirements directly to `/grill-me` and native `ask_question` tool.

### Changed
- **Version Bump**: Bumped root framework `@rafaelghif/aac-core` to `v5.0.4` across manifests (`package.json`), CLI (`bin/cli.mjs`), installers (`install.ps1`, `install.sh`), test suites (`tests/cli.test.mjs`), and documentation (`README.md`).
- **Caveman Learn Skill Release Preparation**: Bumped [`.agents/skills/caveman-learn/package.json`](.agents/skills/caveman-learn/package.json) to `v1.0.1` and configured `"publishConfig": { "access": "public" }` for public NPM registry release.

## [5.0.3] - 2026-09-15

### Added
- **Init & Installer Scaffolding Verification**: Added comprehensive assertions in [`tests/cli.test.mjs`](tests/cli.test.mjs) verifying that `bin/cli.mjs init`, `install.ps1`, and `install.sh` create `.scratch/` (with `.gitkeep`) and `.gitignore` alongside `.agents/`, `docs/`, `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `CONTEXT.md`, and `skills-lock.json` with zero `package.json` pollution.
- **Lifecycle Hook Test Verification**: Added automated test coverage in [`tests/cli.test.mjs`](tests/cli.test.mjs) verifying `block-dangerous-git.cjs` (blocking destructive git operations) and `verify-on-stop.cjs` (quality gate allowing clean stops and blocking on regressions).
- **Test Suite Completeness**: Wired `.agents/skills/caveman-learn/tests/skill-file.test.mjs` into `package.json` `"test"` script, bringing total automated test count to 28 passing tests.
- **License Restoration**: Restored canonical MIT [`LICENSE`](LICENSE) matching `package.json` manifest and `README.md`.
- **Manifest Package Completeness**: Included `install.ps1` and `install.sh` in `package.json` `"files"` array to provide offline inspection of standalone installation scripts within the NPM distribution package.

### Changed
- **Version Bump**: Bumped version to `5.0.3` across manifests (`package.json`), CLI (`bin/cli.mjs`), installers (`install.ps1`, `install.sh`), test suites (`tests/cli.test.mjs`), and documentation (`README.md`).
- **Markdown Link Standard Alignment**: Updated example file links in [`AGENTS.md`](AGENTS.md) to unescaped GitHub-style `file:///` markdown links for instant clickability while strictly maintaining character limits (<12k chars).

### Fixed
- **CLI Guidance Diagnostics**: Fixed outdated legacy package references in [`bin/cli.mjs`](bin/cli.mjs) (`npx antigravity-agents doctor` and `npx antigravity-agents init`) to canonical `@rafaelghif/aac-core`.
- **Stop Hook Execution Directory**: Resolved working directory resolution in [`.agents/hooks/verify-on-stop.cjs`](.agents/hooks/verify-on-stop.cjs), [`.agents/hooks/verify-on-stop.js`](.agents/hooks/verify-on-stop.js), and [`.agents/hooks/verify-on-stop.ps1`](.agents/hooks/verify-on-stop.ps1) to resolve two directory levels up (`path.resolve(__dirname, '..', '..')` / `Split-Path -Parent (Split-Path -Parent $PSScriptRoot)`) to the true workspace root, fixing false-positive Stop Quality Gate bypasses.
- **Test Context Isolation**: Stripped `NODE_TEST_*` environment variables in `verify-on-stop.cjs` and `verify-on-stop.js` child execution to prevent inherited test-runner filtering from bypassing the Stop Quality Gate.
- **Installer Source Directory Guard**: Added missing source directory existence checks in `install.ps1` and `install.sh` preventing unhandled exceptions when source directory extraction fails.

### Security
- **NPM Package Secret Exclusion**: Added negative matching rules `!.agents/mcp_config.json` and `!.agents/**/mcp_config.json` in `package.json` `"files"` array along with `.npmignore`, completely eliminating risk of active MCP tokens or PATs leaking into published NPM distribution tarballs.

## [5.0.2] - 2026-09-14

### Fixed
- **Installer Completeness**: Ensured `docs/` (ADRs, tracker configs, templates), `CLAUDE.md` (`@AGENTS.md`), and `skills-lock.json` are properly included in the NPM distribution manifest (`package.json` `"files"`) and copied by all installers (`npx init`, `install.ps1`, `install.sh`).
- **Source Directory Init Guard**: Fixed `bin/cli.mjs init` throwing when run inside the framework source repository itself.

## [5.0.1] - 2026-09-14

### Changed
- Bump version to `5.0.1` for NPM registry publication under `@rafaelghif/aac-core`.
- Synchronized all documentation, CLI, and test suite version assertions to `5.0.1`.

## [5.0.0] - 2026-09-14

### Major Paradigm Shift: Native Google Antigravity 2.0 Architecture
Version 5.0.0 is a complete rewrite and architectural evolution, moving from custom Python harness scripts (v4 AAC) to first-class, native **Google Antigravity Customization Architecture**:

### Added
- **Gemini 3.8 Flash (High) Pairing Directives**: Optimized root [`AGENTS.md`](AGENTS.md) adhering to the **Caveman Principle** (terse, fluff-free technical precision) and **Ponytail Principle** (7-rung minimalist code ladder).
- **Progressive Disclosure Skills**: Integrated all 64 modular skills in `.agents/skills/` across testing, architecture, planning, code review, and token reduction:
  - `ponytail` suite (minimalist code ladder, audit, debt, review).
  - `caveman` suite (ultra-compact token conservation and subagent output).
  - `mattpocock` suite (`ask-matt`, `to-spec`, `to-tickets`, `tdd`, `code-review`, `wayfinder`, `triage`, `grilling`, `domain-modeling`).
- **5-Tier Memory Architecture & Cross-Session Protocol**: Implemented `memory-management.md` rule (`trigger: always_on`), root `CONTEXT.md` living domain glossary, `docs/adr/0001-antigravity-5-tier-memory-system.md`, and standardized session handoff templates with `.scratch/` sandboxing.
- **Multi-Platform Zero-Pollution Installers**:
  - Universal NPX CLI ([`bin/cli.mjs`](bin/cli.mjs)): `npx @rafaelghif/aac-core init` (or `npx github:rafaelghif/antigravity-agents-core init`).
  - Standalone Windows PowerShell installer ([`install.ps1`](install.ps1)): `irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex`.
  - Standalone Linux/macOS installer ([`install.sh`](install.sh)): `curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash`.
  - **Zero Package.json Pollution Guarantee**: Installers safely scaffold `.agents/`, `AGENTS.md`, and `CONTEXT.md` without ever writing or overwriting `package.json` in user workspaces (protecting Python, Go, Rust, C++, PHP, and existing Node projects).
- **Cross-Platform Node.js Lifecycle Hooks & ADR-0002**:
  - Migrated lifecycle hooks in `.agents/hooks.json` to universal Node.js CommonJS scripts ([`block-dangerous-git.cjs`](.agents/hooks/block-dangerous-git.cjs) and [`verify-on-stop.cjs`](.agents/hooks/verify-on-stop.cjs)), documented in [`docs/adr/0002-cross-platform-node-lifecycle-hooks.md`](docs/adr/0002-cross-platform-node-lifecycle-hooks.md).
  - Ensures seamless hook execution across both Windows (`cmd /c`) and POSIX (`sh -c`) platforms.
- **Automated Verification Suites**:
  - Added unit test suite in [`tests/cli.test.mjs`](tests/cli.test.mjs) verifying CLI commands (`init`, `doctor`, `audit`, `list`) and asserting zero `package.json` creation in target directories.
  - Added test suite in [`tests/memory-system.test.mjs`](tests/memory-system.test.mjs) verifying memory architecture and 64-skill compliance.
- **Antigravity Native Lifecycle Hooks**: Configured in `.agents/hooks.json` supporting `PreToolUse` (git guardrails) and `Stop` (`quality-gate` running `verify-on-stop.cjs` to prevent exit with failing tests).
- **Git Guardrails Hook**: Intercepts `run_command` in Antigravity to block destructive git operations (`push`, `reset --hard`, `clean -f`, `branch -D`) using cross-platform Node.js ([`block-dangerous-git.cjs`](.agents/hooks/block-dangerous-git.cjs)).
- **Autonomous Multi-Agent Subagent Graphs**: Leverages `invoke_subagent` with isolated workspace branches (`Workspace: "branch"` or `"share"`), enabling concurrent implementation of spec task graphs.
- **Multi-VCS Model Context Protocol (MCP)**: Native workspace configuration for **Gitea MCP** (stdio) and **GitHub Copilot MCP** (remote SSE) in `.agents/mcp_config.json`.
- **Workspace Plugins Architecture**: Implemented `.agents/plugins/workspace-integrations/` packaging workspace-scoped MCP servers and sidecars, registered via explicit `.agents/plugins.json` and `.agents/skills.json`.
- **Background Sidecars Engine**: Integrated persistent background runner architecture (`sidecar.json`) with an automated repository health and branch hygiene monitor (`repo-health`).
- **Complete 64-Skill Compliance Audit**: Verified all 64 skills against 8 Antigravity operational dimensions across 7 task batches, tracked in `docs/audit-checklist-64-skills.md` (512 checks passing, 100% compliant).
- **Rule Progressive Disclosure Triggers**: Configured `trigger: always_on` across modular rules (`caveman.md`, `coding-standards.md`, `git-workflow.md`, `ponytail.md`, `memory-management.md`).
- **Credential Quarantine**: Added comprehensive `.gitignore` sandboxing for `.agents/mcp_config.json`, `.agents/plugins/**/mcp_config.json`, `.env`, `.scratch/*`, tokens, keys, and PATs, alongside sanitized example templates.
- **Multi-Platform Parity**: Fully tested across Windows PowerShell 5.1+, Windows cmd, macOS, and Linux bash/sh environments.

### Changed
- Refactored all inherited Claude Code specific patterns (`CLAUDE.md`, `.claude/`, generic `Skill` tool calls, `Bash` tool calls) to native Google Antigravity primitives (`AGENTS.md`, `.agents/`, `view_file`, `run_command`, `invoke_subagent`).
- Cleaned and decoupled workspace configurations from machine-global state (`~/.gemini/config/`).

---

## [4.47.2] - 2026-09-13

### Fixed
- **Installer Source Validation & CLI Sandbox Alignment**: Fixed `install.py` aborting during release source validation by passing `--source-only` and decoupling external host CLI settings from source archive validation.
- **Comprehensive Antigravity Settings Sanitizer**: Implemented `sanitize_antigravity_settings` in `scripts/health_check.py`.
- **Consumer Workspace Validation Scope**: Scoped global CLI settings validation in `scripts/validate.py` to framework development runs only.

[5.0.3]: https://github.com/rafaelghif/antigravity-agents-core/compare/v5.0.2...v5.0.3
[5.0.2]: https://github.com/rafaelghif/antigravity-agents-core/compare/v5.0.1...v5.0.2
[5.0.1]: https://github.com/rafaelghif/antigravity-agents-core/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/rafaelghif/antigravity-agents-core/compare/v4.47.2...v5.0.0
[4.47.2]: https://github.com/rafaelghif/antigravity-agents-core/releases/tag/v4.47.2

