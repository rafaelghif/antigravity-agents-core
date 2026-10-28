---
name: code-review
description: Reviews code changes along two axes—specification fidelity and engineering standards (security, concurrency, architecture, and Ponytail minimalism). Use when reviewing diffs, pull requests, branches, or checking code quality.
---

# Code Review

Review the diff between `HEAD` and a base reference along two axes: **Specification Fidelity** and **Engineering Standards**.

## Decision tree

1. **Is the base ref (commit, branch, or working-tree diff) resolved and non-empty?**
   - **No** → Inspect `git status` and `git diff` (or ask the user for the base ref) before starting.
   - **Yes** → Proceed to step 2.
2. **Are you reviewing your own recent implementation or a multi-module diff?**
   - **Yes** → Delegate the review to `adversarial-reviewer` via `invoke_subagent` so findings remain free of confirmation bias.
   - **No** → Execute the review workflow below directly.

## Review workflow

1. **Capture diff & check unchanged callers**:
   - Run `git diff <base>...HEAD` (or `git diff`) via `run_command`.
   - For every modified function signature or shared type, run `grep_search` across the repo to confirm unchanged callers are not broken.
2. **Audit Axis 1 — Specification Fidelity**:
   - Verify the diff fulfills all requirements and acceptance criteria from the originating spec/ticket.
   - Flag any unagreed public seams, missing boundary checks, dummy/mock data stores, or deferred `// TODO` stubs.
3. **Audit Axis 2 — Standards, Security & Minimalism**:
   - **Security & Concurrency**: Check for injection risks, missing BOLA/IDOR tenant checks, TOCTOU race conditions, non-idempotent mutations, and network calls inside DB transactions.
   - **Architecture & Quality**: Flag shallow pass-through wrappers, inward dependency violations, float currency math, boolean flag clusters, and Fowler smells.
   - **Ponytail Minimalism**: Flag unnecessary dependencies, speculative abstractions, or multi-file boilerplate replaceable by stdlib.
4. **Report prioritized findings**:
   - Group findings by `🔴 Blocking`, `🟡 Structural`, and `🟢 Nit` with clickable `[file.ext](file:///abs/path/file.ext#L10-L20)` links (`[Location] -> [Concrete Problem] -> [Exact Fix]`).
   - Conclude with **`APPROVE`**, **`APPROVE WITH NITS`**, or **`REQUEST CHANGES`**.
