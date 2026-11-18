# Ticket #01: Monorepo Workspace Recon & Hub+Spoke Domain Context

- **Wave**: `Wave 1`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `None`
- **Unblocks**: `#02: Monorepo-Aware Stop Quality Gate`, `#06: Mandatory Mermaid Design Diagrams`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-001`, `NFR-004`
- **Source Decisions**: `DEC-004`
- **Traceability**: `INV-008`, `ERR-004`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: Running `node .agents/skills/index-project/scripts/scan-repo.mjs --json` on a monorepo or polyglot repository discovers all sub-manifests (`apps/*`, `services/*`, `packages/*`, `workspaces`), reports per-workspace stacks and exact `test`/`analyze`/`lint`/`build` commands, emits `layoutMode: "single-context" | "hub-and-spoke"`, and `/index-project` + `docs/agents/domain.md` support optional `docs/domains/<domain>.md` spoke files without breaking single-repo `CONTEXT.md`.
- **In-Scope**:
  - Bounded recursive manifest/workspace discovery (`maxDepth = 5`, package cap `<= 100`, `IGNORE_DIRS` pruning) in `.agents/skills/index-project/scripts/scan-repo.mjs`.
  - Fail-closed exit `1` (`ERR-004`) when explicit `--root` does not exist or is unreadable.
  - Updated `.agents/skills/index-project/SKILL.md` and `docs/agents/domain.md` documenting Hub+Spoke (`CONTEXT.md` + `docs/domains/<domain>.md`) for large/monorepo repos while preserving `single-context` backward compatibility.
  - Automated regression & latency boundary tests in `tests/aac.test.mjs`.
- **Out-of-Scope**: Executing `Stop` hook gates (owned by `#02`), modifying `bin/cli.mjs` manifest prefixes (already covers `.agents/skills/`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — CLI scanner and markdown docs only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/skills/index-project/scripts/scan-repo.mjs:detectManifests`, `extractCommandsAndStacks`, `walkDirs`, `classifyDirs`
  - `tests/aac.test.mjs` (`P1-9` scanner test harness)
- **Config & Structured Logger Seams**: CLI `--root`, `--json`, `--help`; errors emitted to `stderr` (`FAIL: Root directory not found: <path>`).
- **Expected Files & Sibling Callers to Check**:
  - `.agents/skills/index-project/scripts/scan-repo.mjs`
  - `.agents/skills/index-project/SKILL.md`
  - `docs/agents/domain.md`
  - `.agents/hooks.json` (`SessionStart` hook references `scan-repo.mjs` — check compatibility)
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-008`)**: Skip `.git`, `node_modules`, `.dart_tool`, `build`, `dist`, `.next`, `.nuxt`, `target`, `vendor`, `__pycache__`, `.venv`, `venv`, `.idea`, `.scratch`, `coverage`; cap traversal at `maxDepth = 5` and workspace list at `<= 100`.
- **Validation & Parsing**: Validate `--root` exists and is a directory before scanning; parse `package.json` / `Cargo.toml` / `pnpm-workspace.yaml` safely without crashing on malformed JSON.
- **Authorization / Tenancy (`SEC-###`)**: `N/A — local read-only CLI reconnaissance tool with zero network or user auth`.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-004`)**: `< 2,000 ms` across 5,000 non-ignored directories; never read file bodies outside manifest files.
- **Error Mapping (`ERR-004`)**: Missing/unreadable `--root` → exit code `1` with clear `stderr` message; truncated traversal emits `truncated: true` metadata.
- **Public Seam & Contract**: `scan-repo.mjs --json` returns `{ rootDir, manifests, workspaces: [{ path, manifests, stacks, commands }], layoutMode, truncated, stacks, commands, dependencies, directoryBuckets }`, keeping existing top-level keys backward-compatible.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Inspect `scan-repo.mjs` and `docs/agents/domain.md`; refactor `detectManifests` and `extractCommandsAndStacks` into a single reusable per-directory manifest inspector helper so root and sub-workspaces share identical detection logic.
- [ ] **Step 2 (Red)**: Add failing tests in `tests/aac.test.mjs` covering: (a) polyglot monorepo (`apps/web/package.json` + `services/api/go.mod`), (b) single-repo `single-context` vs monorepo `hub-and-spoke` `layoutMode`, (c) `maxDepth` boundary (`5` vs `6`), and (d) missing `--root` exit `1`.
- [ ] **Step 3 (Green & Optimize)**: Implement bounded workspace discovery in `scan-repo.mjs`, update `.agents/skills/index-project/SKILL.md` and `docs/agents/domain.md`, and verify `< 2,000 ms` scan budget.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `CONTEXT.md`, `SPRINT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reused/extended existing helpers (`detectManifests`, `extractCommandsAndStacks`) with zero duplicated stack-parsing logic.
- [ ] Zero hardcoded URLs, magic limits outside named constants, dummy data, or embedded credentials/secrets.
- [ ] CLI validation fails cleanly (`ERR-004`) and emits clean JSON/stderr diagnostics.
- [ ] Boundary parsing handles malformed manifests and missing `--root` cleanly.
- [ ] `N/A — local CLI scanner has no auth or tenancy layer`.
- [ ] `N/A — read-only filesystem scanner performs zero mutations`.
- [ ] Performance optimized (`IGNORE_DIRS` pruned, `maxDepth = 5`, `< 2,000 ms` verified).
- [ ] `N/A — local filesystem only, no external network calls`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** a polyglot monorepo with `apps/web/package.json` and `services/api/go.mod`, **when** `scan-repo.mjs --json` runs, **then** both appear in `workspaces` with exact `commands` and `layoutMode === "hub-and-spoke"` (`REQ-001`).
- [ ] **Given** a single-package repo or missing `--root`, **when** `scan-repo.mjs` runs, **then** single-package yields `layoutMode === "single-context"` and missing `--root` exits `1` (`ERR-004`, `INV-008`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer fixes (root lockfile fallback + <2000ms latency test)`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-001`, `INV-008`, `NFR-004`, `ERR-004`
- **Downstream Handover Notes**: `#02` consumes the exact per-workspace manifest/command detection rules; `#06` references Hub+Spoke domain layouts.
- **Falsified Approaches**: `None yet`
