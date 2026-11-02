---
name: research
description: Investigates technical questions, library APIs, and modern architecture against high-trust primary sources via live search and deep URL ingestion. Use when researching documentation, best practices, latest framework changes, or external system integrations.
---

# Technical Research & Empirical Grounding

Investigate complex technical topics, modern library conventions, architecture patterns, and official documentation against high-trust primary sources using live web search and deep URL ingestion.

## Decision tree

1. **Does the task require live rendering of a browser DOM, visual UI layouts, or interactive clicks?**
   - **Yes** → Use `/browser` or the `browsing` skill.
   - **No** → Proceed to step 2.
2. **Is the research question strictly about local codebase symbols, files, or internal data flows?**
   - **Yes** → Delegate to `codebase-investigator` via `invoke_subagent` or inspect locally via `grep_search` and `read_file`.
   - **No (external frameworks, 2026 best practices, third-party libraries, modern APIs, or platform specs)** → Execute the 4-phase research workflow below.

## Research workflow

### Phase 1: Question decomposition & year-anchored query matrix
- Deconstruct the user's inquiry into 2–3 specific, orthogonal search queries.
- Anchor queries with the explicit year (`2026`), latest version numbers, and authoritative domains (e.g. `site:github.com`, `site:docs.<framework>.org`, official changelogs).
- Avoid vague keywords; target RFCs, official API references, and primary migration guides.

### Phase 2: Live web search & exhaustive primary ingestion
- Execute search queries via `search_web`.
- **Anti-Snippet Skimming Invariant**: Never guess or synthesize findings from brief 50-word search snippets.
- Ingest full primary documentation pages using `read_url_content` (or fetch via `run_command` if needed) to examine exact method signatures, types, and constraints end-to-end.

### Phase 3: Cross-source triangulation & falsification
- Cross-reference claims across at least 2 independent authoritative sources (e.g. official docs + release changelog + GitHub discussion/issue).
- Eliminate deprecated 2022–2024 patterns (e.g. legacy Next.js Pages router, outdated React hooks, obsolete CLI flags).
- Verify licensing, dependency footprint, and cross-platform compatibility (Linux, macOS, Windows).

### Phase 4: Structured evidence synthesis & artifact generation
- Synthesize findings into a structured report containing:
  - **Executive Verdict & Recommended Pattern**: The single best-practice architecture adhering to the 6 Engineering Pillars.
  - **Empirical Evidence & Primary Sources**: Verifiable URLs with dates and line/section citations.
  - **Concrete Drop-In Example**: Minimal working code or configuration.
  - **Deprecated Traps to Avoid**: Legacy patterns commonly hallucinated from 2024 training data.
- Save complex multi-page research to `.scratch/research/<topic-slug>.md` as an observable artifact.
