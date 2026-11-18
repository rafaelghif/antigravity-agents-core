# Discovery Decision Record: AAC v6.4.0 Enterprise Readiness Upgrade

- **Feature Slug**: `enterprise-readiness`
- **Date**: `2026-11-18`
- **Status**: `confirmed`
- **Next Artifact**: `specs/enterprise-readiness.md`

> Provenance rule: cite `DEC-###`, `path:line`, or a live primary-source URL (`/research` / `search_web`). Unknowns stay `OQ-###` (`open`); inapplicable areas use `N/A — <reason>`.

---

## 1. Problem, Goal & Non-Goals

- **Problem & Goal**: AAC v6.3.0 enforces strong single-repo SDLC discipline, yet exhibits structural gaps for enterprise-scale projects: (1) `scan-repo.mjs` and `quality-gate-stop-sensor` inspect only root-level manifests and skip monorepo/polyglot subprojects while omitting typecheck/lint gates; (2) `CONTEXT.md` is locked to a single-file layout; (3) secret/branch guards cover only 4 literal regex patterns and `main`/`master` pushes; (4) `validate-spec.mjs` and `validate-board.mjs` omit traceability completeness and blocker-status checks; (5) multi-agent lacks parallel Wave orchestration and `adversarial-reviewer` holds write tools; and (6) design diagrams, enterprise product rollout/SLO/API-contract/runbook templates, and Jira/Linear tracker guides are absent. Goal: upgrade AAC to `v6.4.0` (backward-compatible) to close all six gaps cleanly.
- **Success Metrics**: `100%` pass rate across `npm test` and `npm run pack:check` on Ubuntu/macOS/Windows; `AGENTS.md` `< 14,000` bytes; every rule `< 24,000` bytes; deterministic monorepo detection, expanded secret detection, read-only reviewer separation, and validator checks verified by automated regression tests.
- **Non-Goals**:
  - Breaking existing single-repo `CONTEXT.md` installs (`DEC-004`).
  - Adding third-party npm runtime dependencies to `@rafaelghif/aac-core` (must remain zero-dependency Node `>=22`).
  - Building a live Jira/Linear HTTP sync daemon inside AAC (MCP/CLI guidance and templates only; no credentialed runtime server shipped).

---

## 2. Existing Codebase Reuse & Constraints (`CONTEXT.md`)

- **Reusable UI Primitives / Widgets / Tokens**: `N/A — CLI and markdown/hook governance package with no UI layer`.
- **Reusable Utils / API Clients / State Holders / Schemas**:
  - `bin/cli.mjs` (`resolveManagedPath`, `atomicWrite`, `mergeHooks`, `runInstallOrUpgrade`)
  - `.agents/hooks.json` (`lifecycle-session-bootstrap`, `git-destructive-guard`, `production-no-mock-guard`, `quality-gate-stop-sensor`)
  - `.agents/git-guard.cjs`
  - `.agents/skills/index-project/scripts/scan-repo.mjs`
  - `.agents/skills/to-spec/scripts/validate-spec.mjs`
  - `.agents/skills/to-tickets/scripts/validate-board.mjs`
  - `.agents/skills/implement/scripts/audit-diff.mjs`
- **Existing Constraints / Conflicts**:
  - `docs/adr/0004-inline-node-lifecycle-hooks.md` restricts `git-destructive-guard` to `main`/`master` pushes and `Stop` hook to test execution with `25s` timeout; `tests/aac.test.mjs:278-306` asserts `git reset --hard`, `git clean -fd`, and `git push -f origin feat/new-branch` return `allow`. Superseded by `DEC-002` + new ADR `0005`.
  - `tests/aac.test.mjs:522-526,596-600,631-635` hard-asserts exact rule, skill, and subagent catalogs; test suite must be updated alongside catalog additions.
  - `tests/aac.test.mjs:544-545` caps `AGENTS.md` at `< 14,000` bytes (`24,000` platform limit).

---

## 3. Architecture, Config & Live-Researched Decisions

| ID | Decision | Alternatives Considered | Rationale (6 Pillars) | Trade-Off / Ceiling | Primary Source / Citation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `DEC-001` | Populate `CONTEXT.md` for this repo, formalize this DDR, and produce `specs/enterprise-readiness.md` (`READY FOR TICKETS`). | Direct spec without DDR; draft spec only. | Full provenance chain (`DEC-###` -> `REQ-###` -> tickets) and immediate self-dogfooding. | Adds DDR doc maintenance alongside spec. | User confirmation (`A1`), `CONTEXT.md` | `settled` |
| `DEC-002` | Enterprise Strict (configurable) guardrails: monorepo-aware `Stop` hook running `typecheck + lint + test` on changed workspace packages (`AAC_STOP_TEST_TIMEOUT_MS` default `60000`, opt-out env flags); `git-guard.cjs` guarding `main`/`master`/`release/*`/`production`/`staging` pushes plus `reset --hard`, `clean -fd`, and non-`--force-with-lease` `--force`/`-f` via `decision: "ask"` (configurable bypass `AAC_GIT_GUARD_MODE=legacy` if needed); supersede ADR-0004 via ADR-0005. | Keep ADR-0004 low-friction git guard; keep hooks unchanged and rely on `audit-diff.mjs` only. | Prevents broken types/lint/monorepo subprojects from slipping past `Stop` and prevents accidental destructive workspace wipes while preserving `decision: "ask"` human override. | Slightly slower `Stop` turns on large repos; mitigated by scoping to changed workspace roots and configurable timeout. | User confirmation (`A2`), `.agents/hooks.json:47`, `.agents/git-guard.cjs` | `settled` |
| `DEC-003` | Add `/wave-execute` skill (parallel Wave execution via Antigravity `swarm` / `run_workflow` with `workspace: "share"`), restrict `adversarial-reviewer` to read-only tools (`read_file`, `run_command`, `search_web`), and add 2 read-only specialist subagents: `security-auditor` and `architecture-planner`. | `/wave-execute` without new subagents; parallel guidance inside `/implement` only. | Enforces strict separation of duties (reviewers cannot silently mutate production files) and unlocks safe parallel ticket execution across isolated worktrees. | Increases subagent roster from 3 to 5; requires `tests/aac.test.mjs` catalog update and `bin/cli.mjs` manages `.agents/agents/` automatically. | User confirmation (`A3`), `.agents/agents/adversarial-reviewer.md:4-9`, `docs/agents/antigravity-platform.md:11-13` | `settled` |
| `DEC-004` | Target `v6.4.0` backward-compatible upgrade: preserve single-file `CONTEXT.md` for small repos, add opt-in Hub+Spoke (`CONTEXT.md` index + `docs/domains/<domain>.md`) and recursive monorepo workspace scanning (`apps/*`, `services/*`, `packages/*`, `npm`/`pnpm`/`cargo` workspaces). | Breaking `v7.0.0` enforcing `docs/domains/` on every repo. | Scales cleanly to large enterprise monorepos without token bloat while avoiding boilerplate on single-package services. | Supports two `CONTEXT.md` layouts (documented in `docs/agents/domain.md`). | User confirmation (`A4`), `docs/agents/domain.md:5` | `settled` |
| `DEC-005` | Expand secret detection in `production-no-mock-guard` and `audit-diff.mjs` using Gitleaks/OWASP-aligned patterns (AWS `AKIA`/`ASIA`/`A3T`, GitHub `ghp`/`gho`/`ghu`/`ghs`/`ghr`, Slack `xox[baprs]-`, GCP `AIza`, Stripe `sk_live_`/`sk_test_`, DB connection strings with embedded credentials, JWT `eyJ...` in non-test assignments, PEM private keys). | Keep 4 legacy regex patterns; shell out to external `gitleaks` binary. | Zero external binary dependency while closing major enterprise credential leak vectors across cloud/SaaS/DB URIs. | Regex-only without full Shannon entropy; compensated by keeping `decision: "ask"` and recommending CI `gitleaks` in `/release-audit`. | `search_web` (Gitleaks/OWASP Secrets Management Cheat Sheet 2026), `.agents/hooks.json:35`, `.agents/skills/implement/scripts/audit-diff.mjs:43` | `settled` |
| `DEC-006` | Mandate Mermaid Design Diagrams (`C4Context`/`C4Container`, `erDiagram`, `sequenceDiagram`, `stateDiagram-v2`) in `/to-spec` (`spec-template.md`), `/domain-modeling`, and `/codebase-design`, plus Enterprise Product/Ops artifacts (API Contract OpenAPI/AsyncAPI gate, Feature-Flag/Canary Rollout & Rollback SOP, Observability SLI/SLO & Runbook template, and Jira/Linear guidance in `issue-tracker.md`) and a `/perf-audit` or benchmark gate in `NFR` verification. | Diagrams in `/pr` only; keep GitHub-only tracker docs. | Aligns pre-code review with enterprise architecture/security sign-off and Mermaid docs-as-code best practices (explicit IDs, `stateDiagram-v2`, scoped ERDs). | Adds required sections in `spec-template.md`; inapplicable diagrams may be marked `N/A — <reason>`. | `search_web` (Mermaid C4/ERD/`stateDiagram-v2` 2026 best practices), `.agents/skills/to-spec/resources/spec-template.md`, `docs/agents/issue-tracker.md` | `settled` |
| `DEC-007` | Strengthen deterministic validators and reduce token redundancy: `validate-spec.mjs` checks 100% `REQ`/`SEC`/`NFR` coverage in §9 Traceability + diagram presence; `validate-board.mjs` verifies `Blocked by` status consistency (`ready`/`in-progress` cannot depend on non-`done` tickets) and spec ID coverage; deduplicate repeated 9-point checklists across skills/templates into canonical references to `AGENTS.md` / `review-rubric.md` while keeping `AGENTS.md < 14 KB`. | Keep syntactic checks only; duplicate checklists in every template. | Eliminates silent traceability gaps and reduces multi-file context token waste without weakening enforcement. | Existing specs/boards using legacy template headings remain valid unless `READY FOR TICKETS` / `ready` is claimed. | `.agents/skills/to-spec/scripts/validate-spec.mjs`, `.agents/skills/to-tickets/scripts/validate-board.mjs`, `tests/aac.test.mjs:545` | `settled` |

- **Configurability & Env Contract**:
  - `AAC_STOP_TEST_TIMEOUT_MS` (optional positive integer ms, default `60000`, clamped e.g. `5000..300000`, controls child command timeout in `quality-gate-stop-sensor`; hook JSON timeout raised accordingly or bounded).
  - `AAC_STOP_RUN_LINT` / `AAC_STOP_RUN_TYPECHECK` (optional `"0"`/`"false"` to skip individual non-test gates; default enabled).
  - `AAC_GIT_GUARD_MODE` (`"strict"` default | `"legacy"` opt-in fallback to `main`/`master` push only).
  - Existing: `AAC_QUALITY_GATE_RUNNING`, `AAC_SKIP_STOP_TEST`, `AAC_PERSONA`, `AAC_PROJECT_ID`, `AAC_REF`.
- **Structured Logging & Audit Trail**: Hooks emit deterministic JSON `{ decision, reason }` with redacted violation context (never echoing matched secret values in `reason` or `audit-diff.mjs` stdout/stderr — emit pattern category + `file:line` only).

---

## 4. Domain Language, Invariants & UI/State Behavior

| ID | Term / Invariant | Exact Definition | Forbidden State / Transition | Source |
| :--- | :--- | :--- | :--- | :--- |
| `INV-006` | Reviewer Separation of Duty | Review subagents (`adversarial-reviewer`, `security-auditor`, `architecture-planner`) must not declare `write_file` or `edit_file` in frontmatter `tools`. | Any reviewer subagent mutating workspace code directly. | `DEC-003` |
| `INV-007` | Secret Non-Echoing Redaction | Secret scanners (`production-no-mock-guard`, `audit-diff.mjs`) must report `file:line` and rule category without printing the matched credential literal. | Emitting raw secret substrings in hook `reason` or CLI `stderr`. | `DEC-005`, `AGENTS.md` §3.4 |
| `INV-008` | Monorepo Workspace Discovery Boundedness | Recursive workspace discovery (`scan-repo.mjs`, `quality-gate-stop-sensor`) ignores `node_modules`/`.git`/build dirs and bounds traversal depth (`maxDepth <= 5`) and package count. | Unbounded filesystem recursion or executing commands in ignored/vendor directories. | `DEC-002`, `DEC-004` |
| `INV-009` | Spec-to-Board Completeness | A spec marked `READY FOR TICKETS` must map every `REQ-###`, `SEC-###`, and `NFR-###` to §9 Traceability; a ticket marked `ready` or `in-progress` must have all `Blocked by` tickets in `done`. | Unmapped requirements on a `READY` spec or `ready` ticket with unfinished blocker. | `DEC-007` |

- **State Machine (`ST-002`, Wave Parallel Execution)**: `wave-pending` → `wave-dispatched` (when all Wave N tickets have `Blocked by` satisfied and disjoint file/contract ownership) → `wave-integrating` (collect worker outputs & run integrated typecheck/lint/test) → `wave-verified` (when integrated verification passes and `/code-review` approves) → `wave-blocked` (on merge conflict or verification failure). Forbidden: dispatching a ticket whose blocker is not `done`, or mutating shared contracts concurrently without Wave 1 lock.
- **Authorization / Tenancy (`SEC-###`)**: `N/A — local CLI and agent governance tooling without multi-tenant auth runtime; enforces static/hook guardrails on generated enterprise apps`. (Still enforces `resolveManagedPath` containment in `bin/cli.mjs` and read-only sandboxing on reviewer subagents).
- **UI States (if UI)**: `N/A — no UI layer`.

---

## 5. Data Contracts, Performance & Verification

| Contract / Seam | Schema & Bounds | Idempotency & Concurrency | Error Contract (`ERR-###`) | Source |
| :--- | :--- | :--- | :--- | :--- |
| `scan-repo.mjs --json` | `{ rootDir, manifests, workspaces: [{ path, stacks, commands }], stacks, commands, dependencies, directoryBuckets, layoutMode }` | Read-only idempotent scan | Exit `1` on unreadable explicit `--root` (`ERR-004`) | `DEC-004` |
| `quality-gate-stop-sensor` | Stdin `{ terminationReason, continuationActive, workspacePaths }`; Stdout `{ decision: 'allow'|'continue', reason? }` | Runs gates per changed workspace root sequentially with `AAC_QUALITY_GATE_RUNNING=1` | Returns `decision: 'continue'` on tamper/typecheck/lint/test failure (`ERR-005`) | `DEC-002` |
| `.agents/git-guard.cjs` | Stdin `{ toolCall: { args: { CommandLine } } }`; Stdout `{ decision: 'allow'|'ask', reason? }` | Stateless | Fail-closed `decision: 'ask'` on parse error (`INV-003`) | `DEC-002` |
| `validate-spec.mjs` / `validate-board.mjs` | CLI exit `0` (`PASS`) or `1` (`FAIL` with bulleted diagnostics) | Read-only idempotent | Exit `1` on missing traceability, invalid diagram block (if non-`N/A`), or unsatisfied blocker status | `DEC-007` |

- **Performance & Scaling Budgets (`NFR-###`)**:
  - `NFR-004`: `scan-repo.mjs` completes in `< 2,000 ms` on repos up to 5,000 non-ignored directories (`maxDepth = 5`, `IGNORE_DIRS` pruned).
  - `NFR-005`: `PreToolUse` hooks (`git-guard.cjs`, `production-no-mock-guard`) remain `< 5,000 ms` (`timeout: 5`).
  - `NFR-006`: `AGENTS.md` remains `< 14,000` bytes and every `.agents/rules/*.md` remains `< 24,000` bytes.
- **Failure, Resilience & Migration**: `bin/cli.mjs upgrade` preserves user-modified rules/agents/hooks via `.aac-new` staging and `.scratch/backups/`; `AAC_GIT_GUARD_MODE=legacy` and `AAC_SKIP_STOP_TEST=1` provide emergency escape hatches without editing `.agents/hooks.json`.
- **Verification Command**: `npm test && npm run pack:check`
- **Required Test Cases**: CLI upgrade/uninstall with new subagents & skills; monorepo `scan-repo.mjs` (`apps/*`, `services/*`); expanded secret corpus without echoing secret values; `git-guard.cjs` strict vs `legacy` mode + `--force-with-lease` distinction; `Stop` hook monorepo typecheck+lint+test + timeout override; `validate-spec.mjs` traceability & diagram checks; `validate-board.mjs` blocker-status checks; read-only reviewer frontmatter enforcement.

---

## 6. Open Questions (`OQ-###`) & Approved Assumptions (`ASM-###`)

| ID | Type | Statement | Owner | Resolution / Validation | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ASM-001` | `assumption` | Target enterprise repos run `typecheck` / `lint` / `test` scripts defined in standard manifests (`package.json`, `pubspec.yaml`, `go.mod`, `Cargo.toml`, `pyproject.toml`) without requiring custom root-only task runners. | User / Maintainer | Documented in `CONTEXT.md` §1 and validated in `tests/aac.test.mjs` synthetic monorepo fixtures. | `assumed` |
| `ASM-002` | `assumption` | Antigravity runtime supports `swarm` and `run_workflow` with `workspace: "share"` as declared in the host tool schemas. | Platform | Cross-checked against host tool declarations and `docs/agents/antigravity-platform.md`. | `assumed` |

---

## 7. Completeness Gate

- [x] Live research (`search_web`) was executed for external library/architecture recommendations (Mermaid C4/ERD/`stateDiagram-v2` 2026 & Gitleaks/OWASP secret patterns).
- [x] Every blocking `OQ-###` is resolved before routing to `/to-spec`, `/to-tickets`, or `/implement`.
- [x] Existing codebase reusable UI primitives/helpers are verified against real files.
- [x] Zero numbers, endpoints, schemas, or commands are invented.
- [x] User has confirmed this record (`A1`–`A4` via `ask_question`).
