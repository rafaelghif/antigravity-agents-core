# Ticket #07: Enterprise Ops, Rollout, API Contract, `/perf-audit` & Tracker Docs

- **Wave**: `Wave 3`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#06: Mandatory Mermaid Design Diagrams Across Spec, Domain & Design Skills`
- **Unblocks**: `#08: Strict Traceability Validators, Token Pruning & v6.4.0 Lockstep`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-007`, `NFR-006`
- **Source Decisions**: `DEC-006`
- **Traceability**: `NFR-006`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: AAC equips enterprise teams with a `/perf-audit` skill (load testing, `EXPLAIN ANALYZE`, bundle/memory profiling, and Core Web Vitals verification), extended `spec-template.md` sections for API Contracts (OpenAPI/AsyncAPI/GraphQL/Protobuf), Rollout/Feature-Flag/Canary & Rollback SOP, and Observability SLI/SLO/Runbooks, plus Jira/Linear/GitLab tracker integration guides in `docs/agents/issue-tracker.md`.
- **In-Scope**:
  - Create `.agents/skills/perf-audit/SKILL.md` with `## Decision tree`, multi-stack load/query/UI profiling workflows, and pass/fail NFR evidence output.
  - Extend `.agents/skills/to-spec/resources/spec-template.md` (and `to-spec/SKILL.md`) with API Contract (`OpenAPI`/`AsyncAPI`), Rollout/Canary/Feature-Flag & Rollback SOP, and Observability SLI/SLO & Runbook links (allowing `N/A — <reason>` for non-service libs).
  - Update `.agents/rules/release-audit.md` with CI `gitleaks`/SBOM/license compliance and Runbook/OpenAPI checks.
  - Update `docs/agents/issue-tracker.md` to add Jira, Linear, and GitLab CLI/MCP configuration patterns alongside GitHub while keeping `mcp_config.example.json` single-server DRY (`tests/aac.test.mjs:83`).
  - Update `docs/agents/skill-directory.md` and `tests/aac.test.mjs` (`P1-6` skill catalog + `P1-8` enterprise ops checks).
- **Out-of-Scope**: Writing a live Jira/Linear sync daemon; editing `AGENTS.md` size pruning (owned by `#08`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — skills, templates, rules, and documentation only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/skills/to-spec/resources/spec-template.md` (updated by `#06`)
  - `.agents/rules/release-audit.md`
  - `docs/agents/issue-tracker.md`
  - `docs/agents/skill-directory.md`
  - `tests/aac.test.mjs` (`P1-6`, `P1-7`, `P1-8`)
- **Config & Structured Logger Seams**: Reference env vars only (never embed Jira/Linear/GitLab tokens in `issue-tracker.md` or `mcp_config.example.json`).
- **Expected Files & Sibling Callers to Check**:
  - `.agents/skills/perf-audit/SKILL.md` (new)
  - `.agents/skills/to-spec/resources/spec-template.md` & `.agents/skills/to-spec/SKILL.md`
  - `.agents/rules/release-audit.md`
  - `docs/agents/issue-tracker.md` & `docs/agents/skill-directory.md`
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`NFR-006`)**: Keep `.agents/rules/release-audit.md` well under `24,000` bytes; preserve `.agents/mcp_config.example.json` single canonical server rule (`tests/aac.test.mjs:82-83`).
- **Validation & Parsing**: `.agents/skills/perf-audit/SKILL.md` must obey `agentskills.io` frontmatter rules (`name: perf-audit`, `description <= 1024`, no unquoted `: `, includes `## Decision tree`, all `/<skill>` refs valid).
- **Authorization / Tenancy (`SEC-###`)**: Never place credentials or tokens in example URLs/headers in `issue-tracker.md`.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-006`)**: Keep skill body concise and actionable; reference external tools (`k6`, `EXPLAIN ANALYZE`, `lighthouse`, Flutter DevTools) without bloating rules.
- **Error Mapping (`ERR-###`)**: `N/A — documentation & workflow skill only`.
- **Public Seam & Contract**: `/perf-audit [<NFR-### or endpoint/query>]` skill + `spec-template.md` API/Rollout/Observability sections.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Inspect `release-audit.md`, `issue-tracker.md`, and `spec-template.md` (`#06` output) so new sections integrate cleanly without duplicating `NFR-###` tables.
- [ ] **Step 2 (Red)**: Update `tests/aac.test.mjs` (`P1-6` skill catalog includes `perf-audit`; `P1-8` asserts API Contract, Rollout/Canary, Observability/Runbook in `spec-template.md` and Jira/Linear in `issue-tracker.md`).
- [ ] **Step 3 (Green & Optimize)**: Author `.agents/skills/perf-audit/SKILL.md`, update `spec-template.md`, `to-spec/SKILL.md`, `release-audit.md`, `issue-tracker.md`, and `skill-directory.md`.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Extends existing `spec-template.md`, `release-audit.md`, and `issue-tracker.md` cleanly.
- [ ] Zero literal credentials or unpinned `npx -y` advice in security-sensitive docs; `mcp_config.example.json` untouched.
- [ ] Observability SLI/SLO & Runbook template explicitly defines structured metrics/logs/alerts.
- [ ] Frontmatter & relative markdown links pass `tests/aac.test.mjs` `P1-6` and `P1-7`.
- [ ] `N/A — markdown templates and workflow skills only`.
- [ ] `N/A — zero state mutations`.
- [ ] `/perf-audit` defines concrete N+1/latency/bundle measurement workflows.
- [ ] `N/A — zero runtime network calls`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** `.agents/skills/perf-audit/SKILL.md`, `spec-template.md`, and `docs/agents/issue-tracker.md`, **when** `npm test` runs, **then** skill catalog, frontmatter, markdown links, and enterprise ops assertions all pass (`REQ-007`, `NFR-006`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer verification`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-007`, `NFR-006`
- **Downstream Handover Notes**: Unblocks `#08` to enforce new sections in `validate-spec.mjs` and finalize `v6.4.0` release lockstep.
- **Falsified Approaches**: `None yet`
