# Ticket #04: Expanded OWASP/Gitleaks Non-Echoing Secret Scanner

- **Wave**: `Wave 2`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#02: Monorepo-Aware Stop Quality Gate`
- **Unblocks**: `#08: Strict Traceability Validators, Token Pruning & v6.4.0 Lockstep`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-004`
- **Source Decisions**: `DEC-005`
- **Traceability**: `INV-007`, `SEC-001`, `NFR-005`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: Both `production-no-mock-guard` (`.agents/hooks.json`) and `.agents/skills/implement/scripts/audit-diff.mjs` detect enterprise credential leaks (AWS `AKIA`/`ASIA`/`A3T`, GitHub `ghp`/`gho`/`ghu`/`ghs`/`ghr`, Slack `xox[baprs]-`, GCP `AIza`, Stripe `sk_live_`/`sk_test_`, DB URIs with embedded passwords such as `postgres://user:pass@host/db`, JWT literals `eyJ...` in non-test assignments, and PEM private keys) and emit `file:line` + pattern category without ever echoing the raw secret substring.
- **In-Scope**:
  - Update `production-no-mock-guard` in `.agents/hooks.json` with expanded Gitleaks/OWASP-aligned secret patterns and non-echoing `reason`.
  - Update `.agents/skills/implement/scripts/audit-diff.mjs` with matching secret patterns, category labels, and non-echoing output.
  - Add expanded secret + non-echoing assertions in `tests/aac.test.mjs` (`P0-4` & `P1-9`).
- **Out-of-Scope**: External `gitleaks` binary runtime dependency (recommended in `/release-audit` for CI, not bundled here).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — CLI audit script and Node hook only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/hooks.json:production-no-mock-guard`
  - `.agents/skills/implement/scripts/audit-diff.mjs:secretRe`
  - `tests/aac.test.mjs:runHook` (`P0-4`, `P1-9`)
- **Config & Structured Logger Seams**: Hook JSON `{ decision: 'ask', reason }` and CLI `audit-diff.mjs` stderr (`<rel>:<ln> [SECRET:<category>] ...`), strictly redacting/omitting secret strings (`INV-007`).
- **Expected Files & Sibling Callers to Check**:
  - `.agents/hooks.json`
  - `.agents/skills/implement/scripts/audit-diff.mjs`
  - `.agents/rules/release-audit.md` (document CI `gitleaks` recommendation if helpful)
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-007`)**: Neither `production-no-mock-guard` `reason` nor `audit-diff.mjs` output may include the matched secret substring (`<REDACTED>` or category name only).
- **Validation & Parsing**: Ignore placeholder DB URIs with `${VAR}` / `<PASSWORD>` templates (`mcp_config.example.json`, `.env.example`) to avoid false positives; keep `.md`, `hooks.json`, `package.json`, `aac.test.mjs` safe exemptions consistent with `SECURITY.md:30`.
- **Authorization / Tenancy (`SEC-001`)**: Prevents credential embedding in production & test code alike (fail-closed `decision: "ask"`).
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-005`)**: Single-pass regex checks `< 5,000 ms` (`timeout: 5`).
- **Error Mapping (`ERR-###`)**: `N/A — audit-diff.mjs exits 1 on findings; hook returns decision: "ask"`.
- **Public Seam & Contract**: `audit-diff.mjs [--root <dir>]` exits `0` (`PASS`) or `1` (`FAIL`) with non-echoing category diagnostics.

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Define identical named rule categories (`aws-key`, `github-token`, `slack-token`, `gcp-key`, `stripe-key`, `db-uri-password`, `jwt-literal`, `private-key`) across `production-no-mock-guard` and `audit-diff.mjs`.
- [ ] **Step 2 (Red)**: Add failing tests in `tests/aac.test.mjs` using dynamically constructed synthetic test tokens (never real credentials) verifying detection of AWS `ASIA`, GitHub `gho_`, Slack, GCP `AIza`, Stripe `sk_test_`, DB URI password, and JWT literal, plus `doesNotMatch` asserting the raw token is never echoed in `reason` or `stderr`.
- [ ] **Step 3 (Green & Optimize)**: Update `.agents/hooks.json` (`production-no-mock-guard`) and `audit-diff.mjs`; verify zero false positives on safe `process.env` DB URIs and valid production snippets.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Aligned secret rule table across `production-no-mock-guard` and `audit-diff.mjs`.
- [ ] Zero literal secrets stored in source or test files (construct synthetic test strings dynamically).
- [ ] Non-echoing diagnostics emit rule category + `file:line` only (`INV-007`).
- [ ] Handles `${ENV_VAR}` placeholder URIs cleanly without false positives.
- [ ] `N/A — static secret scanner has no user/tenant auth layer`.
- [ ] `N/A — read-only inspection`.
- [ ] Linear-time regexes without catastrophic backtracking (`NFR-005`).
- [ ] `N/A — zero external network I/O`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** production code with a DB URI password or `AIza`/`ASIA`/`xoxb`/`eyJ` token, **when** `production-no-mock-guard` or `audit-diff.mjs` inspects it, **then** it flags `decision: "ask"` / exit `1` without echoing the secret value (`REQ-004`, `SEC-001`, `INV-007`).
- [ ] **Given** config reading `postgres://${DB_USER}:${DB_PASS}@localhost/app` from env placeholders in `.env.example`, **when** scanned, **then** zero false-positive secret errors occur (`REQ-004`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer fixes (anchored hooks/package exemptions, shared isDocOrExample, \x22 jwt regex)`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-004`, `INV-007`, `SEC-001`, `NFR-005`
- **Downstream Handover Notes**: Unblocks `#08` final lockstep verification.
- **Falsified Approaches**: `None yet`
