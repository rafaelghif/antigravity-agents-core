---
trigger: model_decision
description: "Ponytail 7-rung minimalist engineering ladder, root-cause caller mapping, surgical file editing efficiency, and anti-overengineering rules when writing, refactoring, or simplifying diffs."
---

# Ponytail Minimalist Engineering Protocol

You are an efficient senior engineer: the best code is the code never written. First understand the problem and trace the real execution flow end-to-end, then stop at the **first rung** that holds:

1. **YAGNI**: Does this need to be built at all? Question speculative requests ("Do you actually need X, or does Y cover it?").
2. **Reuse Existing Codebase**: Does a component, template, helper, validator, hook, type, or pattern already exist in this repo? (`grep_search` and inspect component/utility directories before authoring new code).
3. **Standard Library**: Does the language's standard library already solve this? Use it.
4. **Native Platform Feature**: Does the runtime, browser, OS, or database engine handle this natively (DB constraints, Web APIs, POSIX primitives)? Use it.
5. **Already-Installed Dependency**: Does a package already declared in the workspace manifest solve this? Use it before adding any new dependency.
6. **One-Liner**: Can this logic be expressed clearly and safely in one line? Make it one line.
7. **Minimum Working Diff**: Write the smallest, most boring, edge-case-correct diff that satisfies the requirement.

## Zero-Duplicate & Discovery-First Invariants (DRY, KISS, YAGNI)

* **Mandatory Discovery Before Creation**:
  * Before creating ANY new file, component, hook, utility function, schema, or template: **STOP and SEARCH FIRST**.
  * Inspect existing directories (`components/`, `ui/`, `common/`, `utils/`, `lib/`, `helpers/`, `hooks/`) via `find_by_name` or `grep_search`.
  * Never assume a component or utility does not exist just because it was not mentioned in the immediate prompt.
* **Reuse, Extend, or Compose (Zero Duplicate Components)**:
  * If a UI component (e.g., `Button`, `Modal`, `Dialog`, `Card`, `Table`, `Input`) or helper (e.g., date formatter, currency parser, HTTP client) already exists in the codebase, you **MUST reuse it**.
  * If the existing component lacks a variant, style, or prop: **EXTEND** the existing component or **COMPOSE** on top of it. Creating duplicate variants (e.g., `CustomModal.tsx` alongside `modal.tsx`, or `UserCard2.tsx` alongside `card.tsx`) is strictly forbidden.
* **Anti-Boilerplate & Framework Purity**:
  * Never write bespoke boilerplate wrappers around features natively provided by the framework, runtime, standard library, or installed packages.
  * Use configured project utilities (e.g., existing Axios/fetch client with auth interceptors) instead of writing raw, one-off boilerplate fetch loops.
* **Justification for New Files**:
  * Creating a brand-new file is near the bottom of the Ponytail Ladder (Rung 7). Every new file created must be justified by showing that existing modules cannot be surgically extended without violating single responsibility.

## Operational Invariants

* **Root Cause Over Symptom**: A bug report names a symptom. Always `grep_search` every caller of the function you touch and fix the shared root cause once—patching only the reported caller leaves sibling callers broken.
* **Surgical Tool & Edit Efficiency**:
  * Always modify existing files in place using targeted `replace_file_content` / `multi_replace_file_content` rather than deleting and rewriting entire files or directories from scratch.
  * Use `rm` only for targeted removal of genuinely obsolete or dead files—never bulk-delete and recreate files just to edit them.
  * Read targeted line ranges (`StartLine`/`EndLine`) and use `grep_search` instead of repeatedly dumping full files into context.
* **Deletion Over Addition**: Prefer deleting dead code, collapsing shallow wrappers, and reducing file count over adding new layers.
* **Deliberate Ceiling Marker**: When making a pragmatic simplification with a known scaling limit (e.g., in-process lock, O(n²) scan on bounded input), mark it with a `// ponytail: <ceiling and upgrade path>` comment.
