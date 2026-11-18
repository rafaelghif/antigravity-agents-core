# Project Context, Codebase Index & Domain Map

> **Living Codebase Index**: Indexed directly from verified repository files (`package.json`, `bin/cli.mjs`, `.agents/`, `docs/`, `tests/aac.test.mjs`). Synced to `@rafaelghif/aac-core@6.4.0`.

---

## 1. Stack, Tooling & Exact Verification Commands

- **Primary Purpose**: `@rafaelghif/aac-core` v6.4.0 — CLI package and `.agents/` engineering governance layer (Constitution, progressive rules, 20 multi-language skills, 5 sandboxed subagents, and lifecycle hooks) for Google Antigravity.
- **Languages, Runtimes & Package Manager**: Node.js `>=22.0.0` (ESM `*.mjs` + CJS `.agents/git-guard.cjs`), `npm@10.9.0`, Bash (`install.sh`), PowerShell (`install.ps1`), Python 3 (`.agents/skills/office/scripts/extract-office.py`).
- **Frameworks & Core Libraries**: Zero third-party runtime npm dependencies (`node:test`, `node:assert/strict`, `node:fs`, `node:path`, `node:crypto`, `node:child_process`, `node:os`, `node:url`).
- **UI Kit, Styling & Icon Library**: `N/A — CLI and markdown/hook governance package with no UI layer`.
- **State, Validation & Data Layer**: File-based SHA-256 manifest (`.agents/.aac-manifest.json`), Markdown-based Sprint DAG (`docs/sprint/SPRINT.md`, `docs/sprint/HANDOFF.md`), and stdin/stdout JSON hook protocol (`.agents/hooks.json`).
- **Path Aliases & Import Style**: Native ESM relative imports (`node:*`, `./`, `../`) with zero bundlers or path aliases.
- **Verification Commands** (from `package.json` & `.github/workflows/publish-package.yml`):
  - Test: `npm test` (`node --test tests/aac.test.mjs`)
  - Static Analysis / Typecheck: `N/A — plain JavaScript ESM/CJS with no TypeScript compiler configured`
  - Lint / Package Check: `npm run pack:check` (`npm pack --dry-run`)
  - Build: `N/A — zero build step`

---

## 2. Configurability, Logging & Environment Contract

- **Configuration Entry Point**: `bin/cli.mjs` CLI flags (`--target`, `--force`, `--dry-run`, `--with-sidecar`, `--project-id`) and environment variables read at runtime in hooks/CLI/installers.
- **Required Env / Build Variables** (names only, never values):
  - `AAC_PROJECT_ID` (required only when `--with-sidecar` is enabled; `bin/cli.mjs:17,113`)
  - `AAC_REF` (optional pinned ref override in `install.sh:21` and `install.ps1:30`, defaults to `v6.4.0`)
  - `AAC_PERSONA` (optional `neutral` persona toggle in `.agents/hooks.json:7`)
  - `AAC_GIT_GUARD_MODE` (`strict` default | `legacy` fallback in `.agents/git-guard.cjs:6`)
  - `AAC_STOP_TEST_TIMEOUT_MS` (integer ms `5000..300000`, default `60000` in `.agents/hooks.json:47`)
  - `AAC_STOP_RUN_TYPECHECK`, `AAC_STOP_RUN_LINT` (`"1"` default | `"0"`/`"false"` in `.agents/hooks.json:47`)
  - `AAC_QUALITY_GATE_RUNNING`, `AAC_SKIP_STOP_TEST` (loop/skip guards in `.agents/hooks.json:47`)
  - `GITHUB_PERSONAL_ACCESS_TOKEN` (consumed via `.agents/mcp.env` in `.agents/mcp_config.example.json:10`)
- **Structured Logger & Redaction Seam**: CLI prints prefixed status lines to `stdout`/`stderr` (`bin/cli.mjs`); hooks emit strict single-line JSON (`{ decision, reason }` or `{ injectSteps }`) on `stdout` without echoing secrets (`INV-007`, `<REDACTED>`).

---

## 3. Repository Topology & Entry Points

| Directory / File | Responsibility | Key Entry Points / Exports | Notes |
| :--- | :--- | :--- | :--- |
| `bin/` | Non-destructive CLI installer, upgrader, uninstaller | `bin/cli.mjs` (`runInstallOrUpgrade`, `runUninstall`, `mergeHooks`, `resolveManagedPath`) | Single canonical write path; `install.sh` & `install.ps1` delegate here |
| `.agents/` | Runtime hooks, git guard, MCP templates, sidecar | `.agents/hooks.json`, `.agents/git-guard.cjs`, `.agents/mcp_config.example.json` | Installed into target projects under `.agents/.aac-manifest.json` |
| `.agents/rules/` | 8 progressive-disclosure engineering rules | `coding-standards.md`, `ui-and-dry.md`, `security-and-auth.md`, `testing.md`, `database-migrations.md`, `architecture-and-flow.md`, `git-and-context.md`, `release-audit.md` | Triggers: `glob`, `model_decision`, `manual`; each `< 24 KB` |
| `.agents/skills/` | 20 workflow skills & deterministic Node/Python validators | `scan-repo.mjs`, `validate-spec.mjs`, `validate-board.mjs`, `audit-diff.mjs`, `run-browser.mjs`, `extract-office.py` | Includes `/wave-execute`, `/perf-audit`, `/self-learn`; validated by `tests/aac.test.mjs` |
| `.agents/agents/` | 5 sandboxed subagent definitions | `adversarial-reviewer.md`, `security-auditor.md`, `architecture-planner.md`, `codebase-investigator.md`, `verification-runner.md` | Reviewers strictly read-only (`INV-006`); `mainAgent: false` |
| `docs/` | ADRs, platform reference, tracker, DDRs, learnings, sprint artifacts | `docs/adr/0001..0005`, `docs/agents/*.md`, `docs/discovery/*.md`, `docs/learnings/LESSONS.md`, `docs/sprint/*` | Relative links verified by `tests/aac.test.mjs` |
| `specs/` | Grounded technical specifications | `specs/enterprise-readiness.md` | Validated by `validate-spec.mjs` |
| `tests/` | Automated contract & security corpus test suite | `tests/aac.test.mjs` (10 suites) | Runs on Ubuntu, macOS, Windows in CI |

---

## 4. Shared UI, Design System & Frontend Inventory

`N/A — @rafaelghif/aac-core is a Node.js CLI and agent-governance package without a frontend/UI layer.`

- **Design Tokens / Theme Entry**: `N/A — no UI layer`
- **Icon Library**: `N/A — no UI layer`
- **Layout, Async & Feedback Patterns**: `N/A — CLI stdout/stderr and hook JSON stdout only`

| Component / Widget | File Path | Exported Symbols & Props/Variants | Reuse / Extend Guidance |
| :--- | :--- | :--- | :--- |
| `N/A` | `N/A` | `N/A` | No UI primitives exist in this repository |

---

## 5. Shared Utilities, Hooks, API Clients & Schemas

| Category | File Path | Exported Symbols / Commands | Purpose |
| :--- | :--- | :--- | :--- |
| Installer & Path Guard | `bin/cli.mjs` | `resolveManagedPath`, `atomicWrite`, `backupFile`, `mergeHooks`, `configureSidecar` | SHA-256 tracked install/upgrade/uninstall with traversal containment |
| Git Branch Guard | `.agents/git-guard.cjs` | Stdin JSON hook (`strict` default \| `legacy`) | Intercepts protected branch pushes, `reset --hard`, `clean -fd/-fdx`, raw `--force` (`ask`) |
| Lifecycle Hooks | `.agents/hooks.json` | `lifecycle-session-bootstrap`, `git-destructive-guard`, `production-no-mock-guard`, `post-edit-backpressure`, `quality-gate-stop-sensor` | `SessionStart`, `PreToolUse`, `PostToolUse`, and monorepo `Stop` runtime guardrails |
| Repo Recon Scanner | `.agents/skills/index-project/scripts/scan-repo.mjs` | CLI `--root`, `--json`, `--help` | Detects root + sub-workspaces, `layoutMode` (`single-context` \| `hub-and-spoke`), commands |
| Spec Validator | `.agents/skills/to-spec/scripts/validate-spec.mjs` | CLI `<spec-path>`, `--help` | Enforces required headings, 100% `REQ`/`NFR`/`SEC` traceability, diagrams & ops sections |
| Board DAG Validator | `.agents/skills/to-tickets/scripts/validate-board.mjs` | CLI `<sprint-board-path>`, `--help` | Enforces acyclic DAG, required fields, and zero `ready`/`in-progress` tickets with unfinished blockers |
| Diff Quality Auditor | `.agents/skills/implement/scripts/audit-diff.mjs` | CLI `--root`, `--help` | Scans modified/untracked (`-uall`) files for non-echoing secrets, mocks/stubs, test tampering |
| Test Env Isolator | `tests/aac.test.mjs` | `cleanHookEnv` | Strips `AAC_QUALITY_GATE_RUNNING`/`AAC_SKIP_STOP_TEST` for hermetic `Stop` tests |

---

## 6. Module Boundaries, Invariants (`INV-###`) & State Machines (`ST-###`)

| Module / Path | Responsibility | Public Seam | Ownership / Auth Boundary | Forbidden Imports |
| :--- | :--- | :--- | :--- | :--- |
| `bin/cli.mjs` | File installation & manifest lifecycle | CLI args (`init`, `upgrade`, `uninstall`) | `resolveManagedPath` restricts deletion to `MANAGED_FILES` / `MANAGED_PREFIXES` inside `targetDir` | External npm packages (must stay zero-dependency) |
| `install.sh` / `install.ps1` | Bootstrapper & Node `>=22` gate | Shell flags | Must delegate all managed writes exclusively to `bin/cli.mjs` | Direct file copying of `.agents/` or JSON manipulation |
| `.agents/hooks.json` | Antigravity hook contract | Stdin/stdout JSON (`decision`, `injectSteps`) | Fail-closed (`decision: "ask"`) on unparseable `PreToolUse` stdin | Relative cwd assumptions (must resolve from `workspacePaths`) |
| `.agents/agents/*.md` | Subagent definitions | Frontmatter (`tools`, `model`, `commandExecutionPolicy`) | Reviewers omit `write_file`/`edit_file`; `commandExecutionPolicy: sandbox` or `off`, `mainAgent: false` | Unofficial tool names not in Antigravity tool contract |

| ID | Term / Invariant | Canonical Definition & Falsifiable Rule | Source |
| :--- | :--- | :--- | :--- |
| `INV-001` | Single Managed-Write Path | Only `bin/cli.mjs` may write, backup, hash, or remove AAC-managed files; `install.sh` and `install.ps1` must delegate to it. | `SECURITY.md`, `tests/aac.test.mjs` |
| `INV-002` | User-Edit & `CONTEXT.md` Preservation | `upgrade` must never overwrite user-modified managed files (writes `*.aac-new` instead) and `init`/`upgrade`/`uninstall` must never overwrite/delete `CONTEXT.md` without `--force`. | `bin/cli.mjs` |
| `INV-003` | Fail-Closed Guardrail Parsing | Malformed stdin in `PreToolUse` hooks or malformed `.aac-manifest.json` / `hooks.json` must abort or return `decision: "ask"`, never silently `allow` or overwrite. | `bin/cli.mjs`, `.agents/hooks.json`, `.agents/git-guard.cjs` |
| `INV-004` | Constitution & Rule Size Ceiling | `AGENTS.md` must stay `< 14,000` bytes (`< 24,000` hard cap) and every rule file `< 24,000` bytes. | `tests/aac.test.mjs` |
| `INV-005` | Version Lockstep | `package.json`, `bin/cli.mjs` (`VERSION`), `install.sh` (`AAC_REF`), `install.ps1` (`$ref`), and `SECURITY.md` must reference `6.4.0`. | `tests/aac.test.mjs` |
| `INV-006` | Reviewer Separation of Duty | `adversarial-reviewer`, `security-auditor`, and `architecture-planner` must exclude `write_file` and `edit_file` from frontmatter `tools`. | `.agents/agents/*.md`, `tests/aac.test.mjs` |
| `INV-007` | Secret Non-Echoing Redaction | Secret scanners (`production-no-mock-guard`, `audit-diff.mjs`) report `file:line` + rule category only, never echoing raw secret substrings. | `.agents/hooks.json`, `audit-diff.mjs` |
| `INV-008` | Monorepo Scan Boundedness | Workspace discovery skips `IGNORE_DIRS` and caps depth (`<= 5`) and workspace count (`<= 100`). | `scan-repo.mjs`, `.agents/hooks.json` |
| `INV-009` | Spec-to-Board Completeness | `READY FOR TICKETS` specs cover 100% of `REQ`/`NFR`/`SEC` in §9 + diagrams/ops; `ready`/`in-progress` tickets have zero non-`done` blockers. | `validate-spec.mjs`, `validate-board.mjs` |
| `INV-010` | Token Deduplication Budget | Checklists consolidate into `review-rubric.md` / `AGENTS.md` while keeping `AGENTS.md < 14,000` B. | `AGENTS.md`, `tests/aac.test.mjs` |

| ID | State Machine | State | Allowed Next States | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ST-001` | Ticket Lifecycle | `blocked` → `ready` → `in-progress` → `in-review` → `done` | Sequential transitions only | `ready` with unfinished blocker; `done` without review | `validate-board.mjs`, `/code-review` |
| `ST-002` | Wave Parallel Execution | `WavePending` → `WaveDispatched` → `WaveIntegrating` → `WaveVerified` | `WaveBlocked` on conflict/failure | Parallel dispatch with overlapping file ownership | `/wave-execute` (`workspace: "share"`) |

---

## 7. Quality Budgets (`NFR-###`) & Error Taxonomy (`ERR-###`)

| ID | Attribute / Condition | Target / Status Code | Measurement / Recovery Behavior | Source |
| :--- | :--- | :--- | :--- | :--- |
| `NFR-001` / `NFR-006` | `AGENTS.md` & rule footprint | `AGENTS.md < 14,000` B; rules `< 24,000` B | Verified on every `npm test` run | `tests/aac.test.mjs` |
| `NFR-002` / `NFR-005` | `PreToolUse` hook timeout | `<= 5` seconds per invocation | Configured `timeout: 5` in `.agents/hooks.json` | `.agents/hooks.json` |
| `NFR-003` / `NFR-007` | `Stop` quality gate window | `<= 60,000` ms default (`AAC_STOP_TEST_TIMEOUT_MS` `5000..300000`; hook `timeout: 120`) | Runs `typecheck`, `lint`, `test` only on changed workspaces | `.agents/hooks.json` |
| `NFR-004` | `scan-repo.mjs` latency | `< 2,000` ms | Bounded `maxDepth = 5`, `IGNORE_DIRS` pruned | `scan-repo.mjs`, `tests/aac.test.mjs` |
| `ERR-001` | Corrupt JSON in `.agents/hooks.json` or `.aac-manifest.json` | Exit code `1` | Backup file to `.scratch/backups/<stamp>/` and abort | `bin/cli.mjs` |
| `ERR-002` | Unsafe path entry in `.aac-manifest.json` during `uninstall` | Warning on `stderr`, skip entry | Reject `..`, `.`, `\0`, non-managed prefix, or root-escape | `bin/cli.mjs` |
| `ERR-003` | Node runtime `< 22` during install | Exit code `1` | Abort before any write | `install.sh`, `install.ps1` |
| `ERR-004` | Missing/unreadable `--root` in `scan-repo.mjs` | Exit code `1` | Print `FAIL: Root directory not found` on `stderr` | `scan-repo.mjs` |
| `ERR-005` | Changed workspace gate failure in `Stop` | `{ decision: "continue" }` | Report workspace, failed gate, and truncated error trace | `.agents/hooks.json` |
| `ERR-006` | Unmapped spec IDs or missing Mermaid/ops sections | Exit code `1` | List missing `REQ`/`SEC`/`NFR` IDs or sections on `stderr` | `validate-spec.mjs` |
| `ERR-007` | Premature `ready`/`in-progress` ticket with unfinished blocker | Exit code `1` | List ticket vs blocker status on `stderr` | `validate-board.mjs` |
