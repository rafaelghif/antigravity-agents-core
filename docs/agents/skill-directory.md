# Master Skill Routing Directory

Operational taxonomy, trigger conditions, and quality gates for the 20 skills in this repository. Verified by `tests/aac.test.mjs` (skill set, frontmatter, rule size caps, and relative-link integrity).

Platform contract:
- Skills load from `.agents/skills/<skill-folder>/SKILL.md` (one level deep) and `~/.gemini/config/skills/`.
- `name` and `description` frontmatter drive progressive disclosure; `description` must stay under 1,024 characters.

---

## 1. Core LLM Execution Invariants

1. **Anti-Yes-Man & Ambiguity Stop**: When a prompt, PRD, or ticket has missing behaviors, undefined UI states, unclear auth rules, or conflicts with existing code, stop and call `ask_question`. Never invent defaults.
2. **Index Before Coding**: Populate or read `CONTEXT.md` (`/index-project`) and verify existing UI primitives, helpers, schemas, and commands before editing.
3. **Zero Duplicate Code / Shared UI**: Always search existing directories first; follow `Reuse → Extend → Compose → Create`.
4. **Production-Grade by Default**: No mock stores, dummy tokens, fake data, or deferred `TODO`s in production paths.
5. **Closed-Loop Proof**: Run the real build/typecheck/lint/test suite via `run_command` after the final edit (`exit 0`) with zero test tampering.

---

## 2. Routing Flow

```text
User Request / PRD / Ticket
   │
   ├─ Unindexed repo / stale CONTEXT.md ───────────► index-project (populates CONTEXT.md)
   │
   ├─ Ambiguous requirements / architecture ───────► discover (DDR: DEC / OQ / ASM; pairs with /grill-me)
   │                                                  ├─► domain-modeling (CONTEXT.md §6-7 + ADR)
   │                                                  └─► codebase-design (seams, Design It Twice)
   │
   ├─ Multi-session feature / PRD ─────────────────► to-spec (audits PRD/DDR -> specs/<slug>.md)
   │                                                  └─► to-tickets -> implement (per ticket)
   │
   ├─ Ticket / single slice ───────────────────────► implement (Phase 0 Ambiguity Gate -> Reuse -> TDD)
   │
   ├─ Bug / regression ────────────────────────────► diagnosing-bugs -> tdd / safe-refactor
   │
   ├─ External API / 2026 best-practice research ──► research
   │
   ├─ Schema or API contract change ───────────────► database-migration
   │
   ├─ Web automation / live UI verification ───────► browsing
   │
   ├─ Office doc / spreadsheet / PDF processing ───► office
   │
   ├─ Diff review ─────────────────────────────────► code-review
   │
   ├─ Session ending ──────────────────────────────► handoff
   │
   └─ Pull request ────────────────────────────────► pr
```

---

## 3. Skill Catalog

### Discovery, Indexing & Architecture

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`index-project`](../../.agents/skills/index-project/SKILL.md) | Repo is unindexed or `CONTEXT.md` is still a template | Grounded `CONTEXT.md` (stack, commands, shared UI, shared utils, seams) |
| [`discover`](../../.agents/skills/discover/SKILL.md) | Requirements, PRDs, UI states, or architecture are incomplete or need stress-testing (pairs with built-in `/grill-me`) | Confirmed `docs/discovery/<slug>.md` with `DEC/OQ/ASM` IDs |
| [`domain-modeling`](../../.agents/skills/domain-modeling/SKILL.md) | Domain terms, invariants, state machines, or 3-Gate ADRs need recording/reconciliation | `CONTEXT.md` §6–7, `docs/adr/NNNN-*.md` |
| [`codebase-design`](../../.agents/skills/codebase-design/SKILL.md) | Module interfaces, depth, or public test seams need design | Design-It-Twice comparison |
| [`research`](../../.agents/skills/research/SKILL.md) | External docs, library APIs, or current best practices need live verification | Verified primary-source synthesis |
| [`to-spec`](../../.agents/skills/to-spec/SKILL.md) | Confirmed DDR or PRD must become an unambiguous, repo-grounded spec | `specs/<slug>.md` with readiness verdict |

### Execution

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`to-tickets`](../../.agents/skills/to-tickets/SKILL.md) | Readiness-passed spec needs repo-grounded vertical slices and a Wave DAG | `docs/sprint/SPRINT.md`, `docs/sprint/tickets/<NN>-<slug>.md` |
| [`implement`](../../.agents/skills/implement/SKILL.md) | Ticket or feature slice is ready for ambiguity audit, reuse mapping, TDD, and delivery | Tested production code, synced ticket/board |
| [`wave-execute`](../../.agents/skills/wave-execute/SKILL.md) | Active Wave has `>= 2` independent `ready` tickets with disjoint files | Parallel worktree execution + integrated review |
| [`tdd`](../../.agents/skills/tdd/SKILL.md) | Behavioral increment built test-first at a public seam | Failing test → complete production code → refactor |
| [`safe-refactor`](../../.agents/skills/safe-refactor/SKILL.md) | Deduplicating or restructuring code without changing behavior | Characterization tests + atomic steps |
| [`database-migration`](../../.agents/skills/database-migration/SKILL.md) | Zero-downtime schema, index, or contract migrations | Expand → Migrate → Contract with rollback check |
| [`office`](../../.agents/skills/office/SKILL.md) | Processing or generating `.docx`, `.xlsx`, `.pptx`, or `.pdf` | Extracted dataset / formatted document |

### Verification & Continuity

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`browsing`](../../.agents/skills/browsing/SKILL.md) | Live UI verification, E2E journeys, or visual layout checks | Browser runner script + screenshot/video proof |
| [`perf-audit`](../../.agents/skills/perf-audit/SKILL.md) | Verifying `NFR-###` latency, `EXPLAIN ANALYZE`, load, bundle, or UI FPS budgets | Measured benchmark + optimization proof |
| [`code-review`](../../.agents/skills/code-review/SKILL.md) | Diff, branch, or PR audit (spec fidelity, shared UI/DRY, security, test integrity) | Ranked findings + verdict |
| [`pr`](../../.agents/skills/pr/SKILL.md) | Writing a structured pull request description | Visual summary, door reversibility, test evidence |
| [`diagnosing-bugs`](../../.agents/skills/diagnosing-bugs/SKILL.md) | Reproducing bugs/regressions and isolating shared root cause | Reproduction loop + root-cause fix |
| [`handoff`](../../.agents/skills/handoff/SKILL.md) | Ending or switching a session mid-sprint | `.scratch/handoff.md` + synced sprint board |
| [`self-learn`](../../.agents/skills/self-learn/SKILL.md) | Distilling lessons from human feedback, `search_web`, `/browsing`, reviews, or failures | Verified procedural rules in `docs/learnings/LESSONS.md` |
