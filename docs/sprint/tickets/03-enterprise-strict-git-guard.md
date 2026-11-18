# Ticket #03: Enterprise Strict Configurable `git-guard.cjs` & ADR-0005

- **Wave**: `Wave 2`
- **Size**: `S` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `None`
- **Unblocks**: `#05: Parallel /wave-execute Skill`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-003`
- **Source Decisions**: `DEC-002`
- **Traceability**: `INV-003`, `SEC-002`, `NFR-005`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: `.agents/git-guard.cjs` enforces enterprise strict branch & destructive-command protection by default (`main`, `master`, `release/*`, `production`, `staging` pushes, `git reset --hard`, `git clean -fd`, and raw `git push --force`/`-f` return `decision: "ask"`), while permitting `git push --force-with-lease` on feature branches and supporting `AAC_GIT_GUARD_MODE=legacy` fallback, documented in `docs/adr/0005-enterprise-strict-git-and-stop-guards.md` (superseding ADR-0004).
- **In-Scope**:
  - Update `.agents/git-guard.cjs` with `AAC_GIT_GUARD_MODE` (`strict` default | `legacy`) and fail-closed JSON stdin parsing (`INV-003`).
  - Author `docs/adr/0005-enterprise-strict-git-and-stop-guards.md` using `.agents/skills/domain-modeling/resources/adr-template.md` and mark `docs/adr/0004-inline-node-lifecycle-hooks.md` status as superseded by ADR-0005 for guard strictness.
  - Update `SECURITY.md` and `tests/aac.test.mjs` (`P0-4` git corpus covering strict, `--force-with-lease`, `release/*`/`production`/`staging`, `reset --hard`, `clean -fd`, `legacy` mode, and malformed stdin fail-closed).
- **Out-of-Scope**: Modifying `.agents/hooks.json` (`#02` and `#04` own that file; `.agents/hooks.json` already invokes `.agents/git-guard.cjs`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — Node stdin/stdout hook script only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/git-guard.cjs`
  - `.agents/skills/domain-modeling/resources/adr-template.md`
  - `tests/aac.test.mjs:cleanHookEnv`, `runHook`, `runHookRaw` (`P0-4`)
- **Config & Structured Logger Seams**: Env var `AAC_GIT_GUARD_MODE` (`strict` default | `legacy`); outputs `{ decision: 'allow' | 'ask', reason? }` on `stdout`.
- **Expected Files & Sibling Callers to Check**:
  - `.agents/git-guard.cjs`
  - `docs/adr/0004-inline-node-lifecycle-hooks.md`
  - `docs/adr/0005-enterprise-strict-git-and-stop-guards.md` (new)
  - `SECURITY.md`
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-003`)**: Unparseable stdin or unexpected error must return `decision: "ask"` (fail closed), never `allow`.
- **Validation & Parsing**: Extract `j.toolCall?.args?.CommandLine || j.tool_input?.CommandLine`; classify command chains safely across `&&`, `;`, `|`.
- **Authorization / Tenancy (`SEC-002`)**: Guard `main`, `master`, `release/*`, `production`, `staging` pushes plus `reset --hard`, `clean -fd`, and non-lease force pushes.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-005`)**: Synchronous single-pass regex check `< 50 ms` (well under `5,000 ms` `PreToolUse` cap).
- **Error Mapping (`ERR-###`)**: `N/A — malformed input returns { decision: "ask", reason: "Guard fail-closed on unparseable payload." }`.
- **Public Seam & Contract**: Stdin `{ toolCall: { args: { CommandLine } } }` (or `tool_input`); Stdout `{ decision: 'allow' | 'ask', reason? }`.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Design clean command-matcher table in `.agents/git-guard.cjs` so strict vs `legacy` mode shares one parser path with zero duplicated regexes.
- [ ] **Step 2 (Red)**: Update `tests/aac.test.mjs` `P0-4` git corpus to expect `ask` for `release/1.0`, `staging`, `production`, `git reset --hard`, `git clean -fd`, `git push -f origin feat/x`, and `allow` for `--force-with-lease` on feature branches and `AAC_GIT_GUARD_MODE=legacy`.
- [ ] **Step 3 (Green & Optimize)**: Implement strict/legacy guard rules in `.agents/git-guard.cjs`, write `docs/adr/0005-enterprise-strict-git-and-stop-guards.md`, and update `docs/adr/0004-inline-node-lifecycle-hooks.md` + `SECURITY.md`.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Single canonical matcher table in `.agents/git-guard.cjs` handles both `strict` and `legacy` modes.
- [ ] Zero hardcoded secrets; mode controlled by `AAC_GIT_GUARD_MODE` env var.
- [ ] Clear `reason` message explains which strict rule triggered `decision: "ask"`.
- [ ] Fail-closed on malformed JSON stdin (`INV-003`).
- [ ] `N/A — local git CLI guard has no user/tenant auth layer`.
- [ ] `N/A — read-only command inspection`.
- [ ] Executes in `< 50 ms` (`NFR-005`).
- [ ] `N/A — zero external network I/O`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** `strict` mode (default), **when** `git push origin release/v2`, `git reset --hard`, `git clean -fd`, or `git push -f origin feat/a` is checked, **then** `.agents/git-guard.cjs` returns `decision: "ask"` (`REQ-003`, `SEC-002`).
- [ ] **Given** `git push --force-with-lease origin feat/a` or `AAC_GIT_GUARD_MODE=legacy` on feature operations, **when** checked, **then** it returns `decision: "allow"` (`REQ-003`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer fixes (segment parser for -fdx, -f -d, --force-with-lease + --force)`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-003`, `INV-003`, `SEC-002`, `NFR-005`
- **Downstream Handover Notes**: Parallel worker safety in `#05` relies on `#03` strict worktree/force-push guards.
- **Falsified Approaches**: `None yet`
