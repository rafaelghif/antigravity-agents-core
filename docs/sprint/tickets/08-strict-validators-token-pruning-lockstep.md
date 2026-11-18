# Ticket #08: Strict Traceability Validators, Token Pruning & `v6.4.0` Lockstep

- **Wave**: `Wave 4`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#04: Expanded Non-Echoing Secret Scanner`, `#05: Parallel /wave-execute Skill`, `#07: Enterprise Ops, Rollout, API Contract, /perf-audit & Tracker Docs`
- **Unblocks**: `None`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-008`, `NFR-006`
- **Source Decisions**: `DEC-007`
- **Traceability**: `INV-005`, `INV-009`, `INV-010`, `SEC-004`, `ERR-006`, `ERR-007`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: `validate-spec.mjs` verifies 100% `REQ-###`/`SEC-###`/`NFR-###` coverage in §9 Traceability plus Mermaid/enterprise-ops section completeness on `READY FOR TICKETS` specs; `validate-board.mjs` verifies zero `ready`/`in-progress` tickets depend on non-`done` blockers; duplicated checklists across skills/templates are pruned to canonical references keeping `AGENTS.md < 14,000` bytes; and the entire `@rafaelghif/aac-core` package ships in synchronized `v6.4.0` lockstep (`package.json`, `bin/cli.mjs`, `install.sh`, `install.ps1`, `SECURITY.md`, `README.md`, `CHANGELOG.md`, `tests/aac.test.mjs`).
- **In-Scope**:
  - Upgrade `.agents/skills/to-spec/scripts/validate-spec.mjs` (`ERR-006`, `INV-009`): verify every `REQ-###`, `SEC-###`, and `NFR-###` declared in §4–§6 appears in §9 Traceability Matrix when `READY FOR TICKETS`, and verify diagram/ops sections (or explicit `N/A — <reason>`).
  - Upgrade `.agents/skills/to-tickets/scripts/validate-board.mjs` (`ERR-007`, `INV-009`): reject `ready` or `in-progress` tickets whose `Blocked by` dependencies are not `done`, and check spec traceability alignment when spec path is declared.
  - Deduplicate repeated 9-point checklists in `AGENTS.md`, `implement/SKILL.md`, and `ticket-template.md` into canonical references to `review-rubric.md` / `AGENTS.md` without losing required test assertions (`INV-010`, `NFR-006`).
  - Update `bin/cli.mjs` (`resolveManagedPath` safety verified for all new skills/agents/domains), bump version to `6.4.0` across `package.json`, `bin/cli.mjs`, `install.sh`, `install.ps1`, `SECURITY.md`, `README.md`, and `CHANGELOG.md` (`INV-005`, `SEC-004`).
  - Add validator failure/pass regression tests and `v6.4.0` CLI upgrade/uninstall containment tests in `tests/aac.test.mjs`.
- **Out-of-Scope**: Breaking single-context `CONTEXT.md` installs (`DEC-004`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — CLI validators, markdown docs, and package manifest only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/skills/to-spec/scripts/validate-spec.mjs`
  - `.agents/skills/to-tickets/scripts/validate-board.mjs`
  - `bin/cli.mjs:resolveManagedPath`, `runInstallOrUpgrade`, `runUninstall`
  - `.agents/skills/code-review/references/review-rubric.md`
  - `tests/aac.test.mjs` (`P0-1`, `P0-5`, `P0-6`, `P1-6`, `P1-8`, `P1-9`)
- **Config & Structured Logger Seams**: Validator CLI `stderr` diagnostics (`ERR-006`, `ERR-007`) and `bin/cli.mjs` version constant (`VERSION = '6.4.0'`).
- **Expected Files & Sibling Callers to Check**:
  - `.agents/skills/to-spec/scripts/validate-spec.mjs`
  - `.agents/skills/to-tickets/scripts/validate-board.mjs`
  - `AGENTS.md`, `.agents/skills/implement/SKILL.md`, `.agents/skills/to-tickets/resources/ticket-template.md`
  - `package.json`, `bin/cli.mjs`, `install.sh`, `install.ps1`, `SECURITY.md`, `README.md`, `CHANGELOG.md`
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-005`, `INV-009`, `INV-010`)**: All version pins equal `6.4.0`; `AGENTS.md < 14,000` bytes; 100% traceability & blocker consistency enforced.
- **Validation & Parsing**: Extract §9 Traceability slice robustly via heading boundaries so IDs in §4–§6 don't false-match outside §9; handle ticket `Status` case-insensitively.
- **Authorization / Tenancy (`SEC-004`)**: `bin/cli.mjs:resolveManagedPath` safely installs/upgrades/uninstalls all new Wave 1–3 files (`wave-execute`, `perf-audit`, `security-auditor`, `architecture-planner`) while rejecting arbitrary traversal paths.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-006`)**: `AGENTS.md` byte size reduced/maintained well below `14,000` bytes.
- **Error Mapping (`ERR-006`, `ERR-007`)**: Exit `1` listing exact unmapped `REQ`/`SEC`/`NFR` IDs (`ERR-006`) or `<ticket> is ready while blocker <dep> is <status>` (`ERR-007`).
- **Public Seam & Contract**: `validate-spec.mjs <spec-path>`, `validate-board.mjs <board-path>`, `aac init|upgrade|uninstall --version`.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Audit `AGENTS.md`, `implement/SKILL.md`, and `ticket-template.md` against `tests/aac.test.mjs` (`P1-6`, `P1-8`) so token deduplication preserves every required behavioral rule and assertion.
- [ ] **Step 2 (Red)**: Add failing tests in `tests/aac.test.mjs` (`P1-9`) for: (a) `READY` spec with `REQ-002` missing from §9 Traceability failing `validate-spec.mjs`, and (b) `ready` ticket `#02` blocked by `in-progress` `#01` failing `validate-board.mjs`.
- [ ] **Step 3 (Green & Optimize)**: Upgrade `validate-spec.mjs` & `validate-board.mjs`, deduplicate checklists, validate `specs/enterprise-readiness.md` and `docs/sprint/SPRINT.md` against the upgraded validators, and synchronize `v6.4.0` across all release files.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review` across full release diff, update `CONTEXT.md`, `SPRINT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Deduplicates repeated checklists into canonical references (`NFR-006`, `INV-010`).
- [ ] Synchronizes `6.4.0` across all 5 pinned release files (`INV-005`).
- [ ] Clear, actionable `stderr` diagnostics for `ERR-006` and `ERR-007`.
- [ ] Boundary parsing handles specs with `N/A — <reason>` and multi-blocker ticket lines.
- [ ] `resolveManagedPath` containment verified against new skills/subagents (`SEC-004`).
- [ ] `N/A — validators are read-only; CLI writes are atomic + manifest-backed`.
- [ ] `AGENTS.md < 14,000` bytes verified (`INV-010`).
- [ ] `N/A — zero external network I/O`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** a `READY` spec missing `SEC-001` in §9 Traceability, **when** `validate-spec.mjs` runs, **then** it exits `1` naming `SEC-001` (`REQ-008`, `ERR-006`).
- [ ] **Given** a `ready` ticket blocked by a `blocked` or `in-progress` ticket, **when** `validate-board.mjs` runs, **then** it exits `1` naming the violated blocker (`REQ-008`, `ERR-007`).
- [ ] **Given** `package.json` at `6.4.0`, **when** `npm test && npm run pack:check` runs, **then** all version lockstep, CLI upgrade/uninstall, and size-cap checks pass (`INV-005`, `INV-010`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer fixes (required §8 check in validate-spec.mjs, docs/domains uninstall test, governance sync)`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-008`, `INV-005`, `INV-009`, `INV-010`, `NFR-006`, `SEC-004`, `ERR-006`, `ERR-007`
- **Downstream Handover Notes**: Final ticket of `v6.4.0` Enterprise Readiness sprint; ready for `/pr` and release tagging after Wave 4 Exit Gate.
- **Falsified Approaches**: `None yet`
