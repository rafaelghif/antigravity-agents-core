# Ticket #06: Mandatory Mermaid Design Diagrams Across Spec, Domain & Design Skills

- **Wave**: `Wave 3`
- **Size**: `M` (one session max)
- **Quality Tier**: `production` (industrial standard; stub/hardcoded shortcuts forbidden; inapplicable gates marked `N/A — <reason>`)
- **Status**: `done`
- **Blocked by**: `#01: Monorepo Workspace Recon & Hub+Spoke Domain Context`
- **Unblocks**: `#07: Enterprise Ops, Rollout, API Contract, /perf-audit & Tracker Docs`
- **Spec**: `specs/enterprise-readiness.md`
- **DDR**: `docs/discovery/enterprise-readiness.md`
- **Source Requirements**: `REQ-006`
- **Source Decisions**: `DEC-006`
- **Traceability**: `INV-009`

> Anti-hallucination rule: copy schemas, config keys, error codes, and verification commands verbatim from the spec/repo. Cite real `path:symbol` for reusable assets.

## 1. Objective & Demoable Outcome

- **Demoable Outcome**: `/to-spec`, `/domain-modeling`, and `/codebase-design` require docs-as-code Mermaid architecture, data, sequence, and state diagrams (`C4Context`/`C4Container`, `erDiagram`, `sequenceDiagram`, `stateDiagram-v2` — or explicit `N/A — <reason>`) following 2026 Mermaid syntax best practices (unique node IDs, `stateDiagram-v2` with `[*]`, scoped bounded-context ERDs with `PK`/`FK`).
- **In-Scope**:
  - Update `.agents/skills/to-spec/resources/spec-template.md` and `.agents/skills/to-spec/SKILL.md` to add a dedicated Architecture & Design Diagrams section (`C4Context`/`C4Container`, `erDiagram`, `sequenceDiagram`, `stateDiagram-v2`).
  - Update `.agents/skills/domain-modeling/SKILL.md` and `references/modeling-checklist.md` to require `erDiagram` + `stateDiagram-v2` when entities or `ST-###` state machines are added/changed.
  - Update `.agents/skills/codebase-design/SKILL.md` and `references/architecture-checklist.md` to require `C4Container` / `sequenceDiagram` for non-trivial external I/O or multi-module seams.
  - Add regression assertions in `tests/aac.test.mjs` (`P1-8`) verifying mandatory diagram gates exist in `to-spec`, `domain-modeling`, `codebase-design`, and `spec-template.md`.
- **Out-of-Scope**: Enterprise Ops/Rollout/API-Contract/`/perf-audit` sections in `spec-template.md` (owned sequentially by `#07` to prevent merge conflicts); `validate-spec.mjs` enforcement logic (owned by `#08`).

## 2. Reusable Codebase Assets & Touchpoints (DRY)

- **Existing UI Primitives / Widgets & Tokens to Reuse/Extend**: `N/A — markdown templates, skills, and tests only`
- **Existing Utils / Hooks / State Holders / Schemas / API Clients**:
  - `.agents/skills/to-spec/SKILL.md` & `resources/spec-template.md`
  - `.agents/skills/domain-modeling/SKILL.md` & `references/modeling-checklist.md`
  - `.agents/skills/codebase-design/SKILL.md` & `references/architecture-checklist.md`
  - `tests/aac.test.mjs` (`P1-8`)
- **Config & Structured Logger Seams**: `N/A — markdown documentation contracts`.
- **Expected Files & Sibling Callers to Check**:
  - `.agents/skills/to-spec/resources/spec-template.md`
  - `.agents/skills/to-spec/SKILL.md`
  - `.agents/skills/domain-modeling/SKILL.md` & `references/modeling-checklist.md`
  - `.agents/skills/codebase-design/SKILL.md` & `references/architecture-checklist.md`
  - `tests/aac.test.mjs`

## 3. Domain Invariants, UI States & Contracts

- **Invariants (`INV-009`)**: Preserve existing required section headings in `spec-template.md` (`## 1. Problem, Scope & Non-Goals` .. `## 10. Production Readiness Definition & Open Questions`) so `validate-spec.mjs` remains backward-compatible until `#08` extends it.
- **Validation & Parsing**: Mermaid blocks must avoid raw HTML tags and `{}` inside comments (`search_web` 2026 Mermaid hygiene rules), use `stateDiagram-v2` (never v1), and declare explicit `PK`/`FK` in `erDiagram`.
- **Authorization / Tenancy (`SEC-###`)**: `C4Container` / `sequenceDiagram` must show trust boundaries and tenant/auth checks where applicable.
- **UI States & Disposal (if UI)**: `N/A — no UI layer`.
- **Performance & Scaling Target (`NFR-###`)**: Scope ERDs per bounded context (`<= ~15` tables per diagram) so diagrams stay readable and token-compact.
- **Error Mapping (`ERR-###`)**: `N/A — template/skill gate only`.
- **Public Seam & Contract**: Updated `spec-template.md` section `## 3. Domain Model, Invariants, State Machine & Diagrams` (matching `validate-spec.mjs` prefix `## 3. Domain Model`).

## 4. Execution Plan (Pre-Code Design → Red → Green → Optimize → Review)

- [ ] **Step 1 (Pre-Code Design & Reuse)**: Inspect `domain-modeling/references/modeling-checklist.md` and `codebase-design/references/architecture-checklist.md` first; keep diagram syntax rules in one concise shared reference or non-duplicated checklist items.
- [ ] **Step 2 (Red)**: Add failing assertions in `tests/aac.test.mjs` (`P1-8`) requiring `C4`, `erDiagram`, `sequenceDiagram`, and `stateDiagram-v2` guidance in `spec-template.md`, `to-spec/SKILL.md`, `domain-modeling/SKILL.md`, and `codebase-design/SKILL.md`.
- [ ] **Step 3 (Green & Optimize)**: Update `spec-template.md`, `to-spec`, `domain-modeling`, and `codebase-design` files; verify `validate-spec.mjs specs/enterprise-readiness.md` still passes.
- [ ] **Step 4 (Verify, Post-Ticket Review & Handover)**: Run `audit-diff.mjs`, `npm test && npm run pack:check` (`exit 0`), `/code-review`, update `SPRINT.md`, `CONTEXT.md`, and `docs/sprint/HANDOFF.md`.

## 5. Production Quality Checklist

Mark inapplicable items `N/A — <reason>` rather than deleting them:

- [ ] Reuses existing heading structure in `spec-template.md` without breaking `validate-spec.mjs`.
- [ ] Zero hardcoded domain examples copied into templates (inapplicable sections allow `N/A — <reason>`).
- [ ] `N/A — markdown templates have no runtime logging`.
- [ ] `validate-spec.mjs specs/enterprise-readiness.md` passes cleanly after template updates.
- [ ] `N/A — documentation contracts only`.
- [ ] `N/A — zero state mutations`.
- [ ] Keeps `spec-template.md` concise and scoped per bounded context.
- [ ] `N/A — zero external network I/O`.
- [ ] Zero test tampering (`.skip`, `skip: true`, SUT mocks, tautological assertions).

## 6. Acceptance Criteria & Verification

- **Verification Command**: `npm test && npm run pack:check`
- [ ] **Given** `spec-template.md`, `domain-modeling/SKILL.md`, and `codebase-design/SKILL.md`, **when** `tests/aac.test.mjs` runs, **then** all mandatory Mermaid diagram types (`C4`, `erDiagram`, `sequenceDiagram`, `stateDiagram-v2`) and `N/A — <reason>` fallback rules are verified (`REQ-006`).

## 7. Definition of Done & Cross-Machine Handover Log

- **Post-Ticket Self-Check & `/code-review` Verdict**: `Passed adversarial-reviewer verification`
- **Completed Commit SHA**: `uncommitted`
- **Verification Output**: `npm test && npm run pack:check -> PASS (exit 0)`
- **Source IDs Satisfied**: `REQ-006`, `INV-009`
- **Downstream Handover Notes**: Unblocks `#07` to safely add Enterprise Ops/API/Rollout sections into `spec-template.md`.
- **Falsified Approaches**: `None yet`
