---
name: research
description: Investigates external documentation, library APIs, and current best practices against primary sources via live search and deep page ingestion. Use when researching documentation, latest framework changes, or external integrations.
---

# Technical Research & Empirical Grounding

Investigate external APIs, modern library patterns, and primary documentation via live search rather than stale parametric memory.

## Decision tree

1. **Does the task require live browser DOM rendering, CSS layout inspection, or interactive clicks?**
   - **Yes** → Route to `/browsing` (or `/browser`).
   - **No** → Proceed to step 2.
2. **Is the question strictly about local repository symbols or files?**
   - **Yes** → Inspect locally with `read_file` and `rg -n` via `run_command` (or delegate to `codebase-investigator`).
   - **No (external frameworks, best practices, third-party APIs)** → Execute the 4-phase workflow below.

## Research workflow

1. **Decompose & Anchor Queries**: Break the question into 2–3 orthogonal queries anchored with the exact year/version requested (e.g., `2026`, official docs domains, release changelogs).
2. **Live Search & Deep Ingestion**: Execute `search_web`. Never synthesize conclusions from 50-word snippets alone—fetch/read the full primary documentation page (via URL tool or `curl` via `run_command` if allowed) to verify exact signatures, types, and constraints.
3. **Cross-Source Verification**: Confirm across at least 2 authoritative sources (official docs + changelog/repo) and filter out deprecated 2022–2024 patterns.
4. **Synthesize Evidence**: Report recommended architecture/code, exact primary URLs + versions, and deprecated traps to avoid (saving large multi-source syntheses to `.scratch/research/<topic>.md` when helpful).
