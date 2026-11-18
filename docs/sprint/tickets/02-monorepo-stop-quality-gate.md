# Ticket #02: Monorepo-Aware Stop Quality Gate (`typecheck + lint + test`)

- **Wave**: `Wave 2`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#01: Monorepo Workspace Recon & Hub+Spoke Domain Context`
- **Unblocks**: `#04: Expanded Non-Echoing Secret Scanner`, `#05: Parallel /wave-execute Skill`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-002`, `NFR-007`
- **Source Decisions**: `DEC-002`
- **Traceability**: `INV-008`, `ERR-005`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: When an agent concludes a turn with modified/untracked files inside any subproject of a monorepo (`apps/web/src/a.ts`, `services/api/main.go`, etc.), `quality-gate-stop-sensor` in `.agents/hooks.json` maps changed files to their nearest workspace manifest and executes `typecheck`, `lint`, and `test` gates sequentially with configurable timeout (`AAC_STOP_TEST_TIMEOUT_MS`, default `60000`ms), returning `decision: "continue"` on test tampering or any gate failure.
- **In-Scope**:
  - Upgrade `quality-gate-stop-sensor` in `.agents/hooks.json` to discover nearest manifest directory per modified/untracked non-doc file (`package.json`, `pubspec.yaml`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `Package.swift`, `mix.exs`) falling back to `root`.
  - Run `typecheck` (`npm/pnpm/yarn/bun run typecheck`, `dart/flutter analyze`, `go vet ./...`), `lint` (`npm/pnpm/yarn/bun run lint`, `cargo clippy`), and `test` sequentially unless disabled via `AAC_STOP_RUN_TYPECHECK=0|false` or `AAC_STOP_RUN_LINT=0|false`.
  - Parse `AAC_STOP_TEST_TIMEOUT_MS` bounded within `5000..300000` (default `60000`) and raise `Stop` hook JSON `timeout` to `120`.
  - Add monorepo `Stop` hook regression tests (including failing `typecheck`/`lint`, changed-package scoping, timeout parsing, and `P0-7` isolation) in `tests/aac.test.mjs`.
- **Out-of-Scope**: `production-no-mock-guard` secret patterns (owned by `#04`), `.agents/git-guard.cjs` (owned by `#03`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — Node lifecycle hook only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/hooks.json:quality-gate-stop-sensor`
  - `.agents/skills/index-project/scripts/scan-repo.mjs` (stack & command detection parity from `#01`)
  - `tests/aac.test.mjs:cleanHookEnv`, `runHook` (`P0-7`)
- **Config & Structured Logger Seams**: Env vars `AAC_STOP_TEST_TIMEOUT_MS`, `AAC_STOP_RUN_TYPECHECK`, `AAC_STOP_RUN_LINT`, `AAC_QUALITY_GATE_RUNNING`, `AAC_SKIP_STOP_TEST`; outputs JSON `{ decision, reason? }` on `stdout`.
- **Expected Files & Sibling Callers to Check**:
  - `.agents/hooks.json`
  - `SECURITY.md` (update `Stop` hook contract documentation)
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-008`)**: Only execute gates for workspace packages containing modified/untracked files (`git status --porcelain`), never running untouched packages or traversing ignored directories. Preserve `continuationActive` and `AAC_QUALITY_GATE_RUNNING` loop guards.
- **Validation & Parsing**: Clamp `AAC_STOP_TEST_TIMEOUT_MS` safely (`5000..300000`, fallback `60000` on `NaN`/non-positive); handle quoted paths from `git status --porcelain`.
- **Authorization / Tenancy (`SEC-###`)**: `N/A — local workspace verification hook`.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-007`)**: `<= 60,000 ms` default per workspace gate execution (`timeout: 120` in `.agents/hooks.json`); skip untouched workspaces.
- **Error Mapping (`ERR-005`)**: On gate failure or timeout, return `{ decision: "continue", reason: "Quality Gate Sensor Failed: ... workspace <rel> gate '<typecheck|lint|test>' failed ..." }`.
- **Public Seam & Contract**: Stdin `{ terminationReason, continuationActive, workspacePaths }`; Stdout `{ decision: 'allow' | 'continue', reason? }`.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Map nearest-manifest lookup and command table matching `#01` (`scan-repo.mjs`) cleanly inside the `Stop` hook command while keeping Windows `cmd.exe` quote safety (no unescaped `$`/`"` hazards).
- [ ] **Step 2 (Red)**: Add failing tests in `tests/aac.test.mjs` for: (a) monorepo `apps/web` with failing `typecheck` or `lint` even when root has no `package.json`, (b) untouched sibling workspace not executed, (c) `AAC_STOP_RUN_TYPECHECK=0` opt-out, and (d) `AAC_STOP_TEST_TIMEOUT_MS` fallback on invalid input.
- [ ] **Step 3 (Green & Optimize)**: Update `quality-gate-stop-sensor` in `.agents/hooks.json` and `SECURITY.md`, ensuring `npm test` passes cross-platform.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reused/aligned command detection rules from `#01` (`scan-repo.mjs`) with unified gate table.
- [ ] Zero hardcoded timeouts outside env-configurable `AAC_STOP_TEST_TIMEOUT_MS` (`60000` default).
- [ ] Structured JSON hook output reports workspace + failed gate cleanly without leaking env secrets.
- [ ] Boundary parsing handles invalid timeout env strings, quoted filenames, and malformed hook stdin.
- [ ] `N/A — local hook has no auth or tenancy layer`.
- [ ] `N/A — read-only verification execution`.
- [ ] Scopes gate execution strictly to changed workspace directories (`NFR-007`).
- [ ] Explicit bounded execution timeout (`timeoutMs`) with `continuationActive` infinite-loop guard.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** a monorepo without root `package.json` where `apps/api/package.json` has failing `typecheck`, **when** `quality-gate-stop-sensor` runs on dirty `apps/api/src/index.ts`, **then** it returns `decision: "continue"` naming `apps/api` and `typecheck` (`REQ-002`, `ERR-005`).
- [ ] **Given** all changed workspaces pass `typecheck`, `lint`, and `test` with zero test tampering, **when** `Stop` runs, **then** it returns `decision: "allow"` (`REQ-002`, `NFR-007`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer fixes (\x22 Windows quoting, -uall, root lockfile fallback, truncated ERR-005 trace)`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-002`, `INV-008`, `NFR-007`, `ERR-005`
- **Downstream Handover Notes**: Unblocks `#04` (safe to edit `.agents/hooks.json` `production-no-mock-guard`) and `#05`.
- **Falsified Approaches**: `None yet`
