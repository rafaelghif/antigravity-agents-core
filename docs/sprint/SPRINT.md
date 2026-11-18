# Sprint Board: AAC v6.4.0 Enterprise Readiness Upgrade

- **Feature Slug**: `enterprise-readiness`
- **Sprint Goal**: Upgrade `@rafaelghif/aac-core` to `v6.4.0` with monorepo workspace verification, strict configurable git/secret guards, parallel Wave execution with read-only review separation, mandatory Mermaid design diagrams, enterprise ops/perf documentation, and deterministic traceability validators.
- **Spec Reference**: `specs/enterprise-readiness.md`
- **DDR Reference**: `docs/discovery/enterprise-readiness.md`
- **Handover Log**: `docs/sprint/HANDOFF.md`
- **Spec Readiness**: `READY FOR TICKETS`
- **Quality Bar**: `production` (industrial standard; stub/hardcoded shortcuts forbidden)
- **Board Status**: `DONE`
- **Verification Command**: `npm test && npm run pack:check`
- **Active Wave**: `Completed (Wave 1–4 Done)`
- **Next Recommended Ticket**: `None — all tickets complete; ready for /pr and release commit`

---

## 1. Execution Waves & Backlog (DAG)

| Wave | Ticket | Title | Size | Status | Source IDs | Blocked By | Unblocks | Commit SHA |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **Wave 1** | [`#01`](tickets/01-monorepo-scan-hub-spoke.md) | Monorepo Workspace Recon & Hub+Spoke Domain Context | `M` | `done` | `REQ-001`, `INV-008`, `NFR-004`, `ERR-004` | `None` | `#02`, `#06` | `uncommitted` |
| **Wave 2** | [`#02`](tickets/02-monorepo-stop-quality-gate.md) | Monorepo-Aware Stop Quality Gate (`typecheck + lint + test`) | `M` | `done` | `REQ-002`, `INV-008`, `NFR-007`, `ERR-005` | `#01` | `#04`, `#05` | `uncommitted` |
| **Wave 2** | [`#03`](tickets/03-enterprise-strict-git-guard.md) | Enterprise Strict Configurable `git-guard.cjs` & ADR-0005 | `S` | `done` | `REQ-003`, `INV-003`, `SEC-002` | `None` | `#05` | `uncommitted` |
| **Wave 2** | [`#04`](tickets/04-expanded-non-echoing-secret-scanner.md) | Expanded OWASP/Gitleaks Non-Echoing Secret Scanner | `M` | `done` | `REQ-004`, `INV-007`, `SEC-001` | `#02` | `#08` | `uncommitted` |
| **Wave 3** | [`#05`](tickets/05-wave-execute-readonly-subagents.md) | Parallel `/wave-execute` Skill & Read-Only Reviewer Subagents | `M` | `done` | `REQ-005`, `INV-006`, `SEC-003`, `ST-002` | `#02`, `#03` | `#08` | `uncommitted` |
| **Wave 3** | [`#06`](tickets/06-mandatory-mermaid-design-diagrams.md) | Mandatory Mermaid Design Diagrams Across Spec, Domain & Design | `M` | `done` | `REQ-006`, `INV-009` | `#01` | `#07` | `uncommitted` |
| **Wave 3** | [`#07`](tickets/07-enterprise-ops-perf-tracker-docs.md) | Enterprise Ops, Rollout, API Contract, `/perf-audit` & Tracker Docs | `M` | `done` | `REQ-007`, `NFR-006` | `#06` | `#08` | `uncommitted` |
| **Wave 4** | [`#08`](tickets/08-strict-validators-token-pruning-lockstep.md) | Strict Traceability Validators, Token Pruning & `v6.4.0` Lockstep | `M` | `done` | `REQ-008`, `INV-005`, `INV-009`, `INV-010`, `NFR-006`, `SEC-004`, `ERR-006`, `ERR-007` | `#04`, `#05`, `#07` | `None` | `uncommitted` |

## 2. Source Lineage

| Source | Artifact | Consumed By |
| :--- | :--- | :--- |
| `DEC-001`..`DEC-007` | `docs/discovery/enterprise-readiness.md` | Ticket decisions, config & constraints |
| `REQ/NFR/INV/SEC/ERR` | `specs/enterprise-readiness.md` | Traceability & acceptance criteria |
| `INV-001`..`INV-010` / `ST-001`..`ST-002` | `CONTEXT.md` | Codebase index, config/logging seams & invariants |
| `ADR-0004` / `ADR-0005` | `docs/adr/` | Hook policy evolution & git guard constraints |

## 3. Traceability Matrix

| Source ID | Requirement / Budget / Threat | Ticket(s) | Public Seam | Test(s) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | Monorepo workspace scanning & Hub+Spoke context | `#01` | `scan-repo.mjs --json`, `CONTEXT.md` | `tests/aac.test.mjs` (`P1-9`) | `covered` |
| `REQ-002` | Monorepo `Stop` gate (`typecheck+lint+test`) + `P0-7` isolation | `#02` | `.agents/hooks.json` (`quality-gate-stop-sensor`) | `tests/aac.test.mjs` (`P0-7`) | `covered` |
| `REQ-003` | Enterprise strict configurable `git-guard.cjs` + ADR-0005 | `#03` | `.agents/git-guard.cjs`, `docs/adr/0005-*` | `tests/aac.test.mjs` (`P0-4`) | `covered` |
| `REQ-004` | Expanded OWASP/Gitleaks non-echoing secret scanner | `#04` | `production-no-mock-guard`, `audit-diff.mjs` | `tests/aac.test.mjs` (`P0-4`, `P1-9`) | `covered` |
| `REQ-005` | Parallel `/wave-execute` & read-only reviewer subagents | `#05` | `.agents/skills/wave-execute/`, `.agents/agents/*.md` | `tests/aac.test.mjs` (`P1-6`, `P1-8`) | `covered` |
| `REQ-006` | Mandatory Mermaid diagrams in spec/domain/design skills | `#06` | `spec-template.md`, `domain-modeling/`, `codebase-design/` | `tests/aac.test.mjs` (`P1-8`) | `covered` |
| `REQ-007` | `/perf-audit`, API/Rollout/SLO templates & Jira/Linear docs | `#07` | `.agents/skills/perf-audit/`, `spec-template.md`, `issue-tracker.md` | `tests/aac.test.mjs` (`P1-6`, `P1-8`) | `covered` |
| `REQ-008` | Strict validators, token deduplication & `v6.4.0` lockstep | `#08` | `validate-spec.mjs`, `validate-board.mjs`, `AGENTS.md`, `package.json` | `tests/aac.test.mjs` (`P0-1`, `P0-6`, `P1-9`) | `covered` |
| `INV-006` | Reviewer subagents omit `write_file`/`edit_file` | `#05` | `.agents/agents/*.md` | `tests/aac.test.mjs` (`P1-6`) | `covered` |
| `INV-007` | Secret scanners never echo raw secret substrings | `#04` | `production-no-mock-guard`, `audit-diff.mjs` | `tests/aac.test.mjs` (`P0-4`, `P1-9`) | `covered` |
| `INV-008` | Bounded recursive workspace scan (`IGNORE_DIRS`, depth `<= 5`) | `#01`, `#02` | `scan-repo.mjs`, `quality-gate-stop-sensor` | `tests/aac.test.mjs` (`P1-9`, `P0-7`) | `covered` |
| `INV-009` | 100% traceability & zero non-`done` blockers on `ready` tickets | `#06`, `#08` | `validate-spec.mjs`, `validate-board.mjs` | `tests/aac.test.mjs` (`P1-9`) | `covered` |
| `INV-010` | `AGENTS.md < 14,000` B & rules `< 24,000` B | `#08` | `AGENTS.md`, `.agents/rules/*.md` | `tests/aac.test.mjs` (`P1-6`) | `covered` |
| `NFR-004` | `scan-repo.mjs` `< 2,000` ms | `#01` | `scan-repo.mjs` | `tests/aac.test.mjs` (`P1-9`) | `covered` |
| `NFR-005` | `PreToolUse` hook overhead `< 5,000` ms | `#03`, `#04` | `.agents/hooks.json`, `.agents/git-guard.cjs` | `tests/aac.test.mjs` (`P0-4`) | `covered` |
| `NFR-006` | Context & rule token budget | `#07`, `#08` | `AGENTS.md`, skills/templates | `tests/aac.test.mjs` (`P1-6`) | `covered` |
| `NFR-007` | `Stop` hook window `<= 60,000` ms default (`AAC_STOP_TEST_TIMEOUT_MS`) | `#02` | `.agents/hooks.json` | `tests/aac.test.mjs` (`P0-7`) | `covered` |
| `SEC-001`..`SEC-004` | Non-echo secrets, protected branches, read-only reviewers, CLI containment | `#03`, `#04`, `#05`, `#08` | Hooks, agents, `bin/cli.mjs` | `tests/aac.test.mjs` | `covered` |
| `ERR-004`..`ERR-007` | Missing `--root`, workspace gate failure, spec/board validation diagnostics | `#01`, `#02`, `#08` | Scripts & hooks `stderr`/JSON | `tests/aac.test.mjs` | `covered` |

## 4. Definition of Ready (DoR), Definition of Done (DoD) & Wave Exit Gate

- **DoR**: `Blocked By` tickets are `done`; source IDs, reusable repo assets, config/logging seams, public seam, and exact verification command are unambiguous (`ready` tickets contain zero unresolved items).
- **DoD**: Acceptance criteria checked `[x]`; `npm test && npm run pack:check` exits `0`; `audit-diff.mjs` + independent `/code-review` (`adversarial-reviewer`) pass; zero test tampering, production fakes, or credential leaks; ticket log, `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md` updated; atomic Conventional Commit ready for user approval.
- **Wave Exit Gate**: Wave 1–4 Exit Gates verified (`npm test` 10/10, `npm run pack:check`, `validate-spec.mjs`, `validate-board.mjs`, `audit-diff.mjs`, `adversarial-reviewer` fixes applied).

## 5. Board Hygiene & Change Control

- Unique stable ticket IDs (`#01`..`#08`); acyclic `Blocked by` graph; one observable vertical outcome per ticket; zero concurrent shared-file collisions inside parallel waves (`.agents/hooks.json` serialized via `#02 -> #04`; `spec-template.md` serialized via `#06 -> #07`).
- Atomic status transitions: `blocked → ready → in-progress → in-review → done`.

## 6. Cross-Session & Cross-Machine Handover Log

| Session / Date | Ticket Completed | Commit SHA | Key Seams / Config / Primitives Added | Production & Review Gates Verified | Next Ticket |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `2026-11-18` | `Sprint Initialized` | `-` | `CONTEXT.md`, `docs/discovery/enterprise-readiness.md`, `specs/enterprise-readiness.md`, `tests/aac.test.mjs` (`cleanHookEnv`) | `validate-spec.mjs` (`PASS`), `npm test` (`10/10`) | `#01` |
| `2026-11-18` | `#01`..`#08` (`Wave 1`–`4`) | `uncommitted` | `scan-repo.mjs` monorepo, `.agents/hooks.json` (`\x22` Windows-safe, `-uall`, root lockfile fallback, truncated `ERR-005`), `.agents/git-guard.cjs` (`strict`/`legacy`, segment-safe), `audit-diff.mjs`, `/wave-execute`, `/perf-audit`, read-only `adversarial-reviewer` / `security-auditor` / `architecture-planner`, Mermaid & Ops templates, `validate-spec.mjs`, `validate-board.mjs`, `v6.4.0` lockstep | `npm test` (`10/10`), `npm run pack:check` (`76` files), `validate-spec.mjs`, `validate-board.mjs`, `audit-diff.mjs` (`PASS`) | `None` |
