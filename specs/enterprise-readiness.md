# Spec: AAC v6.4.0 Enterprise Readiness Upgrade

- **Status**: `ready-for-tickets`
- **Feature Slug**: `enterprise-readiness`
- **DDR / PRD Source**: `docs/discovery/enterprise-readiness.md`
- **Quality Bar**: `production` (industrial standard; MVP/stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Verification Command**: `npm test && npm run pack:check`
- **Readiness Verdict**: `READY FOR TICKETS`

---

## 1. Problem, Scope & Non-Goals

- **Problem & Goal**: Upgrade `@rafaelghif/aac-core` from `v6.3.0` to `v6.4.0` so teams building enterprise applications receive deterministic monorepo verification, expanded OWASP/Gitleaks secret guards, parallel Wave multi-agent orchestration with strict reviewer separation of duties, mandatory Mermaid architecture/data/state diagrams, enterprise operational documentation (API contract, rollout/canary, SLI/SLO runbook, Jira/Linear tracker guides), Hub+Spoke domain context scaling, and stricter spec/board/diff validators (`DEC-001`..`DEC-007`).
- **In Scope**:
  - `REQ-001`: Monorepo & polyglot workspace discovery in `scan-repo.mjs` and Hub+Spoke `docs/domains/<domain>.md` support (`DEC-004`).
  - `REQ-002`: Monorepo-aware `quality-gate-stop-sensor` running `typecheck + lint + test` on changed workspace packages with configurable timeout (`DEC-002`).
  - `REQ-003`: Strict configurable `git-destructive-guard` protecting `main`/`master`/`release/*`/`production`/`staging` and destructive resets/force pushes (`DEC-002`, ADR-0005).
  - `REQ-004`: Expanded OWASP/Gitleaks secret patterns + non-echoing redaction in `production-no-mock-guard` and `audit-diff.mjs` (`DEC-005`).
  - `REQ-005`: Parallel `/wave-execute` skill (`swarm` / `run_workflow` with `workspace: "share"`), read-only `adversarial-reviewer`, plus `security-auditor` and `architecture-planner` subagents (`DEC-003`).
  - `REQ-006`: Mandatory Mermaid Design Diagrams (`C4Context`/`C4Container`, `erDiagram`, `sequenceDiagram`, `stateDiagram-v2`) in `/to-spec`, `/domain-modeling`, and `/codebase-design` (`DEC-006`).
  - `REQ-007`: Enterprise Product, API Contract (OpenAPI/AsyncAPI), Rollout/Canary, Observability/Runbook, Performance Verification (`/perf-audit`), and Jira/Linear tracker docs/templates (`DEC-006`).
  - `REQ-008`: Traceability/diagram/blocker validation in `validate-spec.mjs` & `validate-board.mjs`, token-deduplicated checklists, and `v6.4.0` release lockstep across CLI/installers/tests (`DEC-007`).
- **Out of Scope**:
  - Adding third-party npm dependencies (package remains zero-dependency Node `>=22`; `DEC-005`).
  - Shipping live Jira/Linear HTTP sync daemons (documented via MCP/CLI patterns only).
  - Breaking single-file `CONTEXT.md` layouts on small single-package repositories (`DEC-004`).

## 2. Reusable Codebase Assets & Touchpoints (`CONTEXT.md`)

- **Shared UI / Widgets & Tokens to Reuse/Extend**: `N/A — CLI and governance package with no UI layer`.
- **Shared Utils / Hooks / State Holders / Schemas / API Clients**:
  - `bin/cli.mjs:resolveManagedPath`, `atomicWrite`, `backupFile`, `mergeHooks`, `runInstallOrUpgrade`
  - `.agents/hooks.json:lifecycle-session-bootstrap`, `git-destructive-guard`, `production-no-mock-guard`, `quality-gate-stop-sensor`
  - `.agents/git-guard.cjs`
  - `.agents/skills/index-project/scripts/scan-repo.mjs`
  - `.agents/skills/to-spec/scripts/validate-spec.mjs`
  - `.agents/skills/to-tickets/scripts/validate-board.mjs`
  - `.agents/skills/implement/scripts/audit-diff.mjs`
- **Target Modules & Sibling Callers**:
  - `AGENTS.md`, `CONTEXT.md`, `package.json`, `install.sh`, `install.ps1`, `SECURITY.md`, `README.md`, `CHANGELOG.md`
  - `.agents/agents/*.md`, `.agents/rules/*.md`, `.agents/skills/*`, `docs/agents/*.md`, `docs/adr/`, `tests/aac.test.mjs`

## 3. Domain Model, Invariants & State Machine

### 3.1 Architecture & State Diagrams

```mermaid
C4Container
    title AAC v6.4.0 Governance & Multi-Agent Runtime
    Person(dev, "Enterprise Engineer", "Runs Antigravity CLI / IDE")
    System_Boundary(aac, "AAC Governance Layer (.agents/)") {
        Container(hooks, "Lifecycle Hooks", "Node 22 stdin/stdout JSON", "SessionStart, PreToolUse, Stop gates")
        Container(cli, "Package CLI", "bin/cli.mjs", "SHA-256 manifest install/upgrade/uninstall")
        Container(skills, "Skills & Validators", "SKILL.md + *.mjs", "scan-repo, validate-spec, validate-board, audit-diff, wave-execute")
        Container(agents, "Subagents", "Sandbox Agents", "codebase-investigator, verification-runner, adversarial-reviewer, security-auditor, architecture-planner")
    }
    System_Ext(repo, "Target Enterprise Monorepo", "apps/*, services/*, packages/*")
    Rel(dev, skills, "Invokes workflow (/discover, /to-spec, /wave-execute)")
    Rel(hooks, repo, "Audits diffs, guards git, runs changed-workspace gates")
    Rel(skills, agents, "Delegates parallel Wave workers & read-only audits")
    Rel(cli, repo, "Installs & upgrades managed files non-destructively")
```

```mermaid
stateDiagram-v2
    [*] --> WavePending
    WavePending --> WaveDispatched: All BlockedBy == done & disjoint ownership
    WaveDispatched --> WaveIntegrating: All workers report PASS
    WaveDispatched --> WaveBlocked: Worker failure or contract mismatch
    WaveIntegrating --> WaveVerified: Integrated typecheck+lint+test == 0 & reviewers APPROVE
    WaveIntegrating --> WaveBlocked: Merge conflict or regression
    WaveBlocked --> WavePending: Blocker resolved via ask_question or fix
    WaveVerified --> [*]
```

### 3.2 Invariants & State Rules

| ID | Invariant | Forbidden State / Transition | Enforced By | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-006` | Reviewer subagents (`adversarial-reviewer`, `security-auditor`, `architecture-planner`) must not declare `write_file` or `edit_file` in `tools`. | Reviewer subagent holding file-mutation tools. | `tests/aac.test.mjs` frontmatter policy assertion | `DEC-003` |
| `INV-007` | Secret scanners must emit `file:line` and rule ID/category only, redacting or omitting any matched credential literal. | Secret literal echoed to hook `reason` or CLI output. | `production-no-mock-guard`, `audit-diff.mjs`, tests | `DEC-005` |
| `INV-008` | Recursive workspace scanning skips `IGNORE_DIRS` and caps depth (`<= 5`) and package count (`<= 100`). | Unbounded traversal into `node_modules` or `.git`. | `scan-repo.mjs`, `quality-gate-stop-sensor` | `DEC-002`, `DEC-004` |
| `INV-009` | A `READY FOR TICKETS` spec covers 100% of `REQ-###`/`SEC-###`/`NFR-###` in §9; a `ready`/`in-progress` ticket has zero non-`done` blockers. | Unmapped requirement or prematurely `ready` ticket. | `validate-spec.mjs`, `validate-board.mjs` | `DEC-007` |
| `INV-010` | `AGENTS.md` remains `< 14,000` bytes and every `.agents/rules/*.md` remains `< 24,000` bytes. | Instruction bloat or truncation risk. | `tests/aac.test.mjs` | `DEC-007` |

| State | Allowed Transitions | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- |
| `WavePending` | `WaveDispatched` | `WaveVerified` | Every ticket in wave has `status == ready` and all `Blocked by` in `done` (`ST-002`) |
| `WaveDispatched` | `WaveIntegrating`, `WaveBlocked` | `WaveVerified` | Workers run in isolated `workspace: "share"` worktrees (`ST-002`) |
| `WaveIntegrating` | `WaveVerified`, `WaveBlocked` | `WaveDispatched` | Integrated `typecheck + lint + test` exits `0` + read-only reviewer `APPROVE` (`ST-002`) |
| `WaveBlocked` | `WavePending` | `WaveVerified` | Conflict or defect fixed and re-verified (`ST-002`) |

- **UI States (if UI)**: `N/A — no UI layer`.

## 4. Functional Requirements & Acceptance Criteria

| ID | Requirement | Given / When / Then | Priority | Source |
| :--- | :--- | :--- | :---: | :--- |
| `REQ-001` | Monorepo workspace scanning & Hub+Spoke context | **Given** a repo with sub-manifests under `apps/api/go.mod` and `apps/web/package.json` (or root `workspaces`), **when** `scan-repo.mjs --json` executes, **then** it outputs all discovered `workspaces` with exact `stacks`, `commands` (`test`, `analyze`, `lint`, `build`), and recommends `hub-and-spoke` layout (`docs/domains/<domain>.md`) when `> 1` workspace or `> 100` files exist, while keeping `single-context` for single-package repos. | `must` | `DEC-004` |
| `REQ-002` | Monorepo-aware `Stop` hook with static + test gates | **Given** uncommitted changes in `apps/web/src/a.ts` (inside a subproject with `package.json` defining `typecheck`, `lint`, `test`), **when** `quality-gate-stop-sensor` runs on `NO_TOOL_CALL`, **then** it detects tampered test diffs, maps changed files to their nearest workspace manifest, executes `typecheck`, `lint`, and `test` sequentially with `AAC_STOP_TEST_TIMEOUT_MS` (default `60000`), and returns `decision: "continue"` if any gate fails; `tests/aac.test.mjs` `P0-7` clears `AAC_QUALITY_GATE_RUNNING` / `AAC_SKIP_STOP_TEST` in child hook spawns so self-hosting `Stop` runs do not fail hermetic hook tests. | `must` | `DEC-002` |
| `REQ-003` | Enterprise strict configurable `git-guard.cjs` | **Given** `.agents/git-guard.cjs` in default `strict` mode, **when** `run_command` executes `git push origin release/1.0`, `git push -f origin feat/x`, `git reset --hard`, or `git clean -fd`, **then** it returns `decision: "ask"`; **when** `--force-with-lease` on a non-protected feature branch or `AAC_GIT_GUARD_MODE=legacy` for feature commands runs, **then** it returns `decision: "allow"`. | `must` | `DEC-002` |
| `REQ-004` | Expanded secret detection without raw echo | **Given** production file content containing `AKIA...`, `ASIA...`, `ghp_...`, `xoxb-...`, `AIza...`, `sk_test_...`, `postgres://user:pass@host/db`, or `const token = "eyJ..."`, **when** `production-no-mock-guard` or `audit-diff.mjs` inspects it, **then** it flags `[SECRET]` / `decision: "ask"` citing `file:line` and pattern category while never printing the secret string itself. | `must` | `DEC-005` |
| `REQ-005` | Parallel `/wave-execute` & read-only review separation | **Given** a Wave in `docs/sprint/SPRINT.md` containing `>= 2` independent `ready` tickets, **when** `/wave-execute` orchestrates the wave, **then** it assigns disjoint files/seams, spawns workers via `swarm` or `run_workflow` with `workspace: "share"`, integrates changes, and runs read-only `adversarial-reviewer`, `security-auditor`, and `architecture-planner` subagents (`tools` excluding `write_file`/`edit_file`). | `must` | `DEC-003` |
| `REQ-006` | Mandatory Design Diagrams in architecture/spec skills | **Given** `/to-spec`, `/domain-modeling`, or `/codebase-design` producing a spec or architecture update, **when** the feature introduces components, persistence changes, distributed flows, or state machines, **then** `specs/<slug>.md` includes valid Mermaid `C4Context`/`C4Container`, `erDiagram`, `sequenceDiagram`, and/or `stateDiagram-v2` blocks (or explicit `N/A — <reason>`). | `must` | `DEC-006` |
| `REQ-007` | Enterprise product, ops, perf, and tracker guides | **Given** an enterprise team adopting AAC, **when** planning, verifying performance, or syncing tickets, **then** AAC provides `/perf-audit` skill (load/query `EXPLAIN`/bundle/profiling workflow), `spec-template.md` sections for API Contract (OpenAPI/AsyncAPI), Rollout/Feature-Flag & Rollback SOP, and Observability SLI/SLO/Runbook, plus Jira/Linear/GitLab mapping in `docs/agents/issue-tracker.md`. | `must` | `DEC-006` |
| `REQ-008` | Deterministic validator enforcement, token pruning & `v6.4.0` lockstep | **Given** a `READY FOR TICKETS` spec or `SPRINT.md`, **when** `validate-spec.mjs` or `validate-board.mjs` runs, **then** missing `REQ`/`SEC`/`NFR` traceability rows, missing diagram/ops sections, or `ready` tickets with non-`done` blockers fail with exit code `1`; duplicated checklist text across skills/templates is consolidated to canonical references keeping `AGENTS.md < 14,000` bytes and all `v6.4.0` version pins synchronized. | `must` | `DEC-007` |

## 5. Non-Functional & Performance Optimization Budgets

| ID | Attribute | Budget / Target | Optimization Strategy | Measurement Method | Behavior When Exceeded | Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NFR-004` | `scan-repo.mjs` scan latency | `< 2,000 ms` on 5,000 dirs | Prune `IGNORE_DIRS`, cap depth at `5`, skip file bodies outside manifests | Benchmark test in `tests/aac.test.mjs` | Stop traversal at cap and emit truncation note in JSON output | `DEC-004` |
| `NFR-005` | `PreToolUse` hook overhead | `< 5,000 ms` (`timeout: 5`) | Single-pass compiled regexes, zero child process spawns in `PreToolUse` | Hook corpus timing in `tests/aac.test.mjs` | Fail closed with `decision: "ask"` on timeout/parse error | `DEC-002`, `DEC-005` |
| `NFR-006` | Context & rule token budget | `AGENTS.md < 14,000` B; each rule `< 24,000` B | Deduplicate checklists into single canonical rules; load Hub+Spoke domain docs on demand | `wc -c` & `tests/aac.test.mjs` byte-size assertions | Test suite fails (`exit 1`) blocking release | `DEC-007` |
| `NFR-007` | `Stop` hook execution window | `<= 60,000 ms` default (`AAC_STOP_TEST_TIMEOUT_MS` bounded `5000..300000`) | Run gates **only** on workspace packages containing modified/untracked files | Synthetic multi-package `Stop` test in `tests/aac.test.mjs` | Return `decision: "continue"` citing timed-out command and workspace | `DEC-002` |

## 6. Security, Credential Hygiene & Abuse Cases

| ID | Threat / Control Area | Rule | Verification | Source |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | Credential Leak & Non-Echo | Detect cloud, SaaS, DB URI, PEM, and JWT secret patterns in `production-no-mock-guard` and `audit-diff.mjs`; emit rule category + `file:line` only, never the matched value. | Expanded secret corpus tests asserting `decision: "ask"` and `doesNotMatch` on secret substring | `DEC-005`, `INV-007` |
| `SEC-002` | Destructive Git & Protected Branches | Intercept `main`/`master`/`release/*`/`production`/`staging` pushes, `reset --hard`, `clean -fd`, and raw `--force`/`-f` via `decision: "ask"`, allowing `--force-with-lease` on feature branches. | Corpus tests for strict mode, `--force-with-lease`, and `AAC_GIT_GUARD_MODE=legacy` | `DEC-002` |
| `SEC-003` | Reviewer Privilege Separation | `adversarial-reviewer`, `security-auditor`, and `architecture-planner` exclude `write_file`/`edit_file` and run under `commandExecutionPolicy: sandbox`. | Frontmatter validation in `tests/aac.test.mjs` | `DEC-003`, `INV-006` |
| `SEC-004` | Manifest Uninstall Containment | `bin/cli.mjs` `resolveManagedPath` validates every deleted path stays inside `MANAGED_PREFIXES` / `MANAGED_FILES` and inside `targetDir` (including new subagents, skills, `docs/domains/` safety). | Traversal & non-managed path tests in `tests/aac.test.mjs` | `CONTEXT.md` (`INV-001`) |

## 7. Configurability, Logging, Data Contracts & Persistence

- **Config Contract (Zero Hardcoded Values)**:
  - `AAC_STOP_TEST_TIMEOUT_MS`: positive integer string (`5000`–`300000`), defaults to `60000`; invalid values fall back to `60000` or fail-closed diagnostic rather than `0`/`NaN`.
  - `AAC_STOP_RUN_TYPECHECK`, `AAC_STOP_RUN_LINT`: `"1"` (default) or `"0"`/`"false"`.
  - `AAC_GIT_GUARD_MODE`: `"strict"` (default) or `"legacy"`.
  - Existing: `AAC_QUALITY_GATE_RUNNING`, `AAC_SKIP_STOP_TEST`, `AAC_PERSONA`, `AAC_PROJECT_ID`, `AAC_REF` (`v6.4.0` on release).
- **Logging & Audit Contract**:
  - Hooks emit single-line JSON on `stdout`; `audit-diff.mjs` and validators emit structured diagnostics (`<file>:<line> [<CATEGORY>] <message>`) with `<REDACTED>` for any sensitive value (`INV-007`).
- **API Contract & Schema Compatibility**: `N/A — CLI and markdown/hook governance package; scan-repo.mjs --json preserves all v6.3.0 top-level keys alongside workspaces and layoutMode`.
- **Entry Signatures / Schemas**:
  - `scan-repo.mjs --json` adds `layoutMode: "single-context" | "hub-and-spoke"` and `workspaces: Array<{ path, manifests, stacks, commands }>`, preserving top-level `rootDir`, `manifests`, `stacks`, `commands`, `dependencies`, `directoryBuckets` for backward compatibility (`DEC-004`).
  - `bin/cli.mjs` adds new skill directories (`wave-execute`, `perf-audit`) and subagents (`security-auditor`, `architecture-planner`) automatically via `listFilesRecursive('.agents/skills')` and `.agents/agents`.
- **Persistence & Migrations**: `N/A — file-based markdown/JSON governance package; bin/cli.mjs upgrade migrates managed files non-destructively via .aac-manifest.json and .aac-new staging`.

| ID | Condition | Status / Code | Recovery Behavior | Source |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-004` | `--root` path missing or unreadable in `scan-repo.mjs` | Exit `1` | Print `FAIL: Root directory not found: <path>` on `stderr` and abort immediately | `DEC-004` |
| `ERR-005` | Workspace `typecheck`/`lint`/`test` fails or times out in `Stop` | `{ decision: "continue" }` | Report workspace path, failed gate (`typecheck`/`lint`/`test`), and truncated error trace | `DEC-002` |
| `ERR-006` | `validate-spec.mjs` detects missing traceability row or diagram section | Exit `1` | List exact missing `REQ`/`SEC`/`NFR` IDs or diagram sections on `stderr` | `DEC-007` |
| `ERR-007` | `validate-board.mjs` detects `ready`/`in-progress` ticket with non-`done` blocker | Exit `1` | List `<ticket> is <status> while blocker <dep> is <depStatus>` on `stderr` | `DEC-007` |

## 8. Resilience, Rollout, Observability & Test Strategy

- **Failure Modes**:
  - Multi-workspace `Stop` timeout: `Stop` hook JSON `timeout` raised to accommodate bounded `AAC_STOP_TEST_TIMEOUT_MS` (e.g., `timeout: 120` in `.agents/hooks.json`), with `continuationActive` and `AAC_QUALITY_GATE_RUNNING` guards preventing infinite loops.
  - Malformed JSON stdin in any hook returns `decision: "ask"` (fail closed, `INV-003`).
- **Rollout, Feature-Flag & Rollback SOP**: `bin/cli.mjs upgrade` writes incoming conflicts to `*.aac-new` and backups to `.scratch/backups/<timestamp>/`; `AAC_GIT_GUARD_MODE=legacy` and `AAC_STOP_RUN_TYPECHECK=0` provide immediate env-level rollback toggles.
- **Observability (SLI/SLO & Runbook)**: `N/A — local CLI and lifecycle hook package with no long-running daemon service; CI matrix verifies ubuntu/macos/windows`.
- **Public Seams & Test Matrix**:
  - `tests/aac.test.mjs` covers: happy path, `N-1`/`N`/`N+1` boundary depth/workspace counts, malformed/empty inputs, traversal/containment security cases, strict vs `legacy` git-guard modes, expanded secret non-echo corpus, monorepo `Stop` typecheck+lint+test failure/pass, validator traceability/blocker failures, read-only reviewer enforcement, and `v6.4.0` version lockstep.

## 9. Traceability Matrix

| Requirement | Invariants / Security | Ticket Wave | Public Seam | Test(s) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | `INV-008`, `NFR-004` | Wave 1 | `scan-repo.mjs --json`, `CONTEXT.md` | `tests/aac.test.mjs` monorepo scan & Hub+Spoke test |
| `REQ-002` | `INV-008`, `NFR-007` | Wave 2 | `.agents/hooks.json` (`quality-gate-stop-sensor`) | `tests/aac.test.mjs` monorepo Stop `typecheck+lint+test` suite |
| `REQ-003` | `INV-003`, `SEC-002`, `NFR-005` | Wave 2 | `.agents/git-guard.cjs`, `docs/adr/0005-*` | `tests/aac.test.mjs` strict/legacy/lease git corpus |
| `REQ-004` | `INV-007`, `SEC-001`, `NFR-005` | Wave 2 | `.agents/hooks.json` (`production-no-mock-guard`), `audit-diff.mjs` | `tests/aac.test.mjs` expanded secret & non-echo assertions |
| `REQ-005` | `INV-006`, `SEC-003` | Wave 3 | `.agents/skills/wave-execute/`, `.agents/agents/*.md` | `tests/aac.test.mjs` subagent read-only & skill catalog assertions |
| `REQ-006` | `INV-009` | Wave 3 | `spec-template.md`, `domain-modeling/`, `codebase-design/` | `tests/aac.test.mjs` + `validate-spec.mjs` diagram gate |
| `REQ-007` | `NFR-006` | Wave 3 | `.agents/skills/perf-audit/`, `spec-template.md`, `issue-tracker.md` | `tests/aac.test.mjs` skill/link & template checks |
| `REQ-008` | `INV-005`, `INV-009`, `INV-010`, `NFR-006`, `SEC-004` | Wave 4 | `validate-spec.mjs`, `validate-board.mjs`, `AGENTS.md`, `package.json` | `tests/aac.test.mjs` full lockstep, byte-cap & validator suite |

## 10. Production Readiness Definition & Open Questions

- [x] Every requirement, invariant, NFR, security, config, and logging rule maps to a source, seam, and test.
- [x] Existing shared helpers, hooks, scripts, and sibling callers (`tests/aac.test.mjs`, `bin/cli.mjs`) are mapped.
- [x] Zero blocking `OQ-###` items remain (`Status: ready-for-tickets`).

| ID | Type | Statement | Impact | Owner | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ASM-001` | `assumption` | Enterprise repos expose `typecheck`/`lint`/`test` in standard workspace manifests. | `REQ-002` | Maintainer | Validated via multi-stack `scan-repo.mjs` and synthetic monorepo test fixtures. | `assumed` |
| `ASM-002` | `assumption` | Host Antigravity runtime provides `swarm` and `run_workflow` with `workspace: "share"`. | `REQ-005` | Platform | Verified against runtime tool schemas; sequential fallback documented if unavailable. | `assumed` |
