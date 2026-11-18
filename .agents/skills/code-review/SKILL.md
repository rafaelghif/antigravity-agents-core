---
name: code-review
description: Audits diffs, branches, or pull requests across specification fidelity, shared UI/DRY reuse, test integrity, security, and architecture. Use when reviewing code changes or checking diff quality.
---

# Code Review (Spec Fidelity, DRY/UI Reuse & 6-Pillar Audit)

Review changes between `HEAD` and a base ref across **Specification & Reuse Fidelity** and **Engineering & Security Standards**.

## Decision tree

1. **Is the target diff (`git diff` / branch diff) non-empty and resolved?**
   - **No** → Inspect `git status` and `git diff` via `run_command`, or ask the user for the base ref.
   - **Yes** → Proceed to step 2.
2. **Are you reviewing your own multi-file implementation?**
   - **Yes** → Delegate an independent pass to `adversarial-reviewer` via `invoke_subagent` to avoid confirmation bias, or audit strictly against the checklist below.
   - **No** → Execute the review workflow below.

## Review workflow

1. **Capture Diff & Caller Blast Radius**:
   - Inspect `git diff` via `run_command`.
   - For every modified exported function, component prop, type, or schema, search the codebase (`rg -n` or search tool) to confirm unchanged sibling callers remain valid.
2. **Axis 1 — Specification Fidelity, DRY & Test Integrity**:
   - Verify all requirements (`REQ-###`, `INV-###`, `SEC-###`, `ERR-###`, or ticket acceptance criteria) are satisfied without invented endpoints, fields, or unsourced assumptions (`🔴 Blocking` if invented).
   - **Shared UI & DRY Audit**: Flag as `🔴 Blocking` any duplicated UI component, parallel utility/formatter/fetcher, hardcoded color/spacing token, or copy-pasted page logic where an existing primitive/helper exists.
   - **Test Tampering Audit**: Flag as `🔴 Blocking` any `.skip`, `xit`, deleted/weakened assertions (`expect(true).toBe(true)`, `toBeDefined()`), or System-Under-Test mocking.
   - **Production Integrity Audit**: Flag as `🔴 Blocking` any mock stores, dummy tokens, fake data, swallowed errors, `TODO` placeholders, or missing auth/validation/error states.
3. **Axis 2 — Security, Concurrency & Architecture**:
   - Check BOLA/IDOR tenant scoping, strict boundary parsing, TOCTOU races, idempotency, timeouts/retries, N+1 queries, float currency math, hardcoded secrets, and unpinned supply-chain scripts.
4. **Report Ranked Findings**:
   - Group by `🔴 Blocking`, `🟡 Structural`, and `🟢 Nit` using exact verified `file:line` references (`[Location] -> [Concrete Defect] -> [Exact Fix]`).
   - Conclude with **`APPROVE`**, **`APPROVE WITH NITS`**, or **`REQUEST CHANGES`**.
