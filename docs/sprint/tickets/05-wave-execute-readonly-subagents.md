# Ticket #05: Parallel `/wave-execute` Skill & Read-Only Reviewer Subagents

- **Wave**: `Wave 3`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#02: Monorepo-Aware Stop Quality Gate`, `#03: Enterprise Strict Configurable git-guard.cjs`
- **Unblocks**: `#08: Strict Traceability Validators, Token Pruning & v6.4.0 Lockstep`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-005`
- **Source Decisions**: `DEC-003`
- **Traceability**: `INV-006`, `SEC-003`, `ST-002`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: AAC ships a production `/wave-execute` skill orchestrating independent tickets in a `docs/sprint/SPRINT.md` Wave in parallel using Antigravity `swarm` / `run_workflow` with `workspace: "share"` (strictly enforcing disjoint file ownership and `ST-002` integration gates), restricts `adversarial-reviewer` to read-only tools, and adds two read-only specialist subagents (`security-auditor` and `architecture-planner`) verified by `tests/aac.test.mjs`.
- **In-Scope**:
  - Create `.agents/skills/wave-execute/SKILL.md` with `## Decision tree`, `ST-002` Wave state machine (`WavePending -> WaveDispatched -> WaveIntegrating -> WaveVerified | WaveBlocked`), disjoint file-ownership preflight, `swarm`/`run_workflow` `workspace: "share"` dispatch, merge & integrated verification, and sequential fallback.
  - Update `.agents/agents/adversarial-reviewer.md` frontmatter `tools` to remove `write_file` and `edit_file` (keeping `read_file`, `run_command`, `search_web` under `commandExecutionPolicy: sandbox`).
  - Create `.agents/agents/security-auditor.md` (`model: inherit`, `commandExecutionPolicy: sandbox`, read-only tools) and `.agents/agents/architecture-planner.md` (`model: inherit`, `commandExecutionPolicy: sandbox`, read-only tools).
  - Link `/wave-execute` and new subagents in `.agents/skills/implement/SKILL.md`, `.agents/skills/code-review/SKILL.md`, `AGENTS.md`, `docs/agents/skill-directory.md`, and `README.md`.
  - Update `tests/aac.test.mjs` (`P1-6` skill & subagent catalog + `INV-006` read-only reviewer policy assertion).
- **Out-of-Scope**: Runtime changes to Antigravity host `swarm` binary; `validate-board.mjs` structural changes (owned by `#08`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — markdown skills, subagent definitions, and test assertions only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/agents/adversarial-reviewer.md`, `codebase-investigator.md`, `verification-runner.md`
  - `.agents/skills/implement/SKILL.md`, `.agents/skills/code-review/SKILL.md`
  - `docs/agents/antigravity-platform.md` (worktree & `swarm` contracts)
  - `tests/aac.test.mjs` (`P1-6` subagent & skill validator)
- **Config & Structured Logger Seams**: Subagent frontmatter `commandExecutionPolicy: sandbox`, `mainAgent: false`, `model`, `tools`.
- **Expected Files & Sibling Callers to Check**:
  - `.agents/skills/wave-execute/SKILL.md` (new)
  - `.agents/agents/adversarial-reviewer.md`
  - `.agents/agents/security-auditor.md` (new)
  - `.agents/agents/architecture-planner.md` (new)
  - `.agents/skills/implement/SKILL.md`, `.agents/skills/code-review/SKILL.md`
  - `docs/agents/skill-directory.md`, `AGENTS.md`, `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-006`)**: All reviewer/planner subagents (`adversarial-reviewer`, `security-auditor`, `architecture-planner`) must exclude `write_file` and `edit_file` from `tools` and use only official Antigravity tool names (`tests/aac.test.mjs:624-649`).
- **Validation & Parsing**: `SKILL.md` YAML frontmatter `name: wave-execute`, `description <= 1024` chars without unquoted `: `, includes `## Decision tree`, and all `/<skill>` cross-links exist on disk.
- **Authorization / Tenancy (`SEC-003`)**: Enforce `commandExecutionPolicy: sandbox` and read-only privilege separation on reviewers.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-###`)**: `N/A — skill/subagent orchestration markdown; AGENTS.md < 14,000 B enforced`.
- **Error Mapping (`ERR-###`)**: `N/A — WaveBlocked transitions route conflicts to ask_question`.
- **Public Seam & Contract**: `/wave-execute [wave-number | docs/sprint/SPRINT.md]` + subagent `invoke_subagent` / `swarm` interfaces.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Design `/wave-execute` around `ST-002`, reusing `/implement` per-worker and `/code-review` + `security-auditor` + `architecture-planner` at `WaveIntegrating` rather than duplicating review checklists.
- [ ] **Step 2 (Red)**: Update `tests/aac.test.mjs` `P1-6` assertions to expect `wave-execute` skill, 5 subagents (`adversarial-reviewer`, `architecture-planner`, `codebase-investigator`, `security-auditor`, `verification-runner`), and assert `INV-006` (zero `write_file`/`edit_file` in reviewer subagents).
- [ ] **Step 3 (Green & Optimize)**: Author `.agents/skills/wave-execute/SKILL.md`, update `adversarial-reviewer.md`, create `security-auditor.md` and `architecture-planner.md`, and update skill/doc indexes keeping `AGENTS.md < 14,000` bytes.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reuses `/implement` and `/code-review` workflows inside `/wave-execute` without duplicating instructions.
- [ ] Zero hardcoded project paths or secrets; all `/<skill>` links verified by `tests/aac.test.mjs`.
- [ ] Wave transition logs & `HANDOFF.md` updates documented cleanly.
- [ ] YAML frontmatter passes `tests/aac.test.mjs` tool-whitelist, colon-space, and size checks.
- [ ] Reviewer subagents enforce read-only `tools` (`INV-006`, `SEC-003`).
- [ ] `ST-002` forbids dispatching tickets with unfinished blockers or overlapping file ownership.
- [ ] Keeps `AGENTS.md < 14,000` bytes (`INV-010`).
- [ ] `N/A — markdown orchestration & subagent specs`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** `tests/aac.test.mjs` inspects `.agents/agents/*.md`, **when** `npm test` runs, **then** `adversarial-reviewer`, `security-auditor`, and `architecture-planner` have zero write tools and valid Antigravity tool names (`REQ-005`, `INV-006`, `SEC-003`).
- [ ] **Given** `.agents/skills/wave-execute/SKILL.md`, **when** checked against skill contracts and link integrity, **then** frontmatter, `## Decision tree`, `ST-002`, and all relative links pass (`REQ-005`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer INV-006/SEC-003 verification`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-005`, `INV-006`, `SEC-003`, `ST-002`
- **Downstream Handover Notes**: `#08` finalizes `README.md`, `CHANGELOG.md`, and `bin/cli.mjs` version lockstep.
- **Falsified Approaches**: `None yet`
