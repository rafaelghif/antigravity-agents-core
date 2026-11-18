# ADR 0005: Enterprise Strict Configurable Git and Monorepo Stop Guards

- **Status**: `accepted`
- **Date**: `2026-11-18`
- **Decision Owners**: `AAC Maintainers`
- **Reversibility**: `easy`
- **Supersedes**: `ADR-0004` (guard strictness and `Stop` hook scope; inline Node execution model from ADR-0004 is retained)
- **DDR Source**: `docs/discovery/enterprise-readiness.md#DEC-002`
- **Related Spec**: `specs/enterprise-readiness.md`
- **Related IDs**: `INV-003`, `INV-008`, `SEC-002`, `NFR-005`, `NFR-007`, `ERR-005`

## Context

`docs/adr/0004-inline-node-lifecycle-hooks.md` restricted `git-destructive-guard` to pushes on `main`/`master` and scoped `quality-gate-stop-sensor` to root-level test execution with a 25-second timeout. In enterprise monorepos and high-strictness delivery workflows, two failure modes emerged: (1) sub-package changes (`apps/*`, `services/*`) without a root `package.json` bypassed `Stop` checks entirely, and type/lint errors slipped past test-only runs; (2) accidental `git reset --hard`, `git clean -fd`, raw `--force` pushes, or unguarded pushes to `release/*`, `staging`, and `production` caused avoidable data or release-branch loss (`DEC-002`).

## Decision Drivers (6 Pillars)

- **Future-Proof / Upgradeable**: Env-configurable thresholds (`AAC_STOP_TEST_TIMEOUT_MS`, `AAC_GIT_GUARD_MODE`) allow teams to tune strictness without editing `.agents/hooks.json`.
- **Scalable / High-Performance**: `Stop` scopes execution exclusively to workspace packages with uncommitted changes (`INV-008`, `NFR-007`).
- **Maintainable / Secure**: Preserves `--force-with-lease` on feature branches while gating destructive workspace resets and protected release branches via `decision: "ask"` (`SEC-002`).

## Options Considered

| Option | Strengths | Failure Modes / Risks | Migration & Rollback Cost | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Option A (Chosen): Enterprise Strict Configurable** | Guards `release/*`, `production`, `staging`, `reset --hard`, `clean -fd`, raw `--force` (`ask`) + monorepo `typecheck + lint + test` in `Stop` | Higher friction on destructive git resets; mitigated by `AAC_GIT_GUARD_MODE=legacy` | Low (`env` toggle) | `DEC-002` |
| **Option B: Keep ADR-0004 Git Guard, Upgrade Stop Only** | Zero git friction | Leaves `release/*`/`staging`/`production` and `reset --hard` unguarded | Low | `DEC-002` |

## Decision

Adopt **Enterprise Strict Configurable** (`Option A`) as the default for `.agents/git-guard.cjs` and `quality-gate-stop-sensor`, retaining ADR-0004's cross-platform inline/dual-cwd Node hook execution and `decision: "ask"` human-confirmation model (`DEC-002`).

## Consequences

- **Positive**: Closes monorepo blind spots, catches typecheck/lint regressions before turn completion, and protects release/environment branches.
- **Negative / Ceiling**: Larger monorepo test suites exceeding `60,000` ms must set `AAC_STOP_TEST_TIMEOUT_MS` (up to `300,000` ms) or opt out individual gates (`AAC_STOP_RUN_TYPECHECK=0`, `AAC_STOP_RUN_LINT=0`).
- **Security & Invariant Impact**: Enforces `INV-003` (fail-closed), `INV-008` (bounded workspace scan), and `SEC-002`.

## Validation & Follow-Up

- [x] `tests/aac.test.mjs` `P0-4` covers strict mode, `--force-with-lease`, `AAC_GIT_GUARD_MODE=legacy`, and fail-closed parse errors.
- [x] `tests/aac.test.mjs` `P0-7` verifies monorepo `Stop` `typecheck + lint + test` (`#02`).
