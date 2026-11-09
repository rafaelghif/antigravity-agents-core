# Master Skill Routing Directory

Operational taxonomy, trigger conditions, and quality gates for the 16 committed skills in this repository. Every claim here is verified by `tests/aac.test.mjs` (skill set, frontmatter, and relative-link integrity).

Platform contract (verified against `https://antigravity.google/docs/skills/`):
- Skills load from `.agents/skills/<skill-folder>/SKILL.md` (one level deep) and `~/.gemini/config/skills/`.
- `name` and `description` frontmatter are what the agent sees during progressive disclosure; `description` must stay under 1,024 characters.
- Skills are auto-selected from the description. Users can also invoke `/<skill-name>` explicitly.

---

## 1. Quality-First Engineering Invariants

Quality is a precondition of every code modification, not a cleanup phase:

1. **Clarify Before Code**: When requirements, schemas, credentials, or edge cases are ambiguous, stop and ask (`ask_question` or `/grill-me`). Never invent throwaway assumptions.
2. **Production-Grade by Default (Anti-MVP)**: Every artifact is production-bound unless the user explicitly labels it a throwaway spike. "MVP" means the smallest complete, deployable, production-safe slice—never permission to omit validation, authorization, tests, observability, migrations, or rollback. Throwaway spikes are quarantined outside production paths and never merged.
3. **Zero Production Fakes**: No placeholder stubs, dummy IDs/tokens, or deferred `TODO` implementations in production paths. Genuine drivers read configuration from the environment. Fakes belong in test code only (`tests/`, `__tests__/`, `fixtures/`, `mocks/`, `*.test.*`, `*.spec.*`).
4. **Automated Proof**: Non-trivial changes leave a runnable regression test behind, and the verification command is executed before completion is reported.
5. **Deep Modules**: Small public interfaces hide substantial implementation; domain cores stay free of framework and driver imports.
6. **Strict DRY**: Intention-revealing names, guard clauses instead of nesting, and one canonical source of truth for validation and domain constants.
7. **Provenance Before Prose**: Every requirement, number, schema, error code, and verification command in a spec, ticket, ADR, or `CONTEXT.md` cites a stable ID (`DEC-###`, `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, `ERR-###`), a repository `path:line`, or a live primary source. An unsourced unknown is written `OPEN`, never invented.

---

## 2. Routing Flow

```
User Request
   │
   ├─ Ambiguous / architectural decision ──────────► grill-me
   │                                                  ├─► docs/discovery/<slug>.md (DDR)
   │                                                  ├─► domain-modeling (CONTEXT.md + ADR)
   │                                                  └─► codebase-design (seams, Design It Twice)
   │
   ├─ Multi-session feature ───────────────────────► to-spec (reads DDR)
   │                                                  └─► to-tickets (reads spec + DDR) ─► implement (per ticket)
   │
   ├─ Bug / regression ────────────────────────────► diagnosing-bugs ─► tdd / safe-refactor
   │
   ├─ Documentation / API / 2026 best-practice research ──► research
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

### Discovery, design, and planning

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`grill-me`](../../.agents/skills/grill-me/SKILL.md) | Architecture, stack, requirements, or the production quality frontier are undecided; a plan needs 6-Pillar stress-testing | Confirmed `docs/discovery/<slug>.md` Discovery Decision Record with stable `DEC/OQ/ASM` IDs |
| [`domain-modeling`](../../.agents/skills/domain-modeling/SKILL.md) | Domain terms, bounded contexts, invariants, state machines, or a hard-to-reverse decision need recording; the DDR and `CONTEXT.md` disagree | `CONTEXT.md`, `docs/adr/NNNN-*.md`, propagation report |
| [`codebase-design`](../../.agents/skills/codebase-design/SKILL.md) | Module interfaces, interface depth, or public test seams need design | Design-It-Twice comparison |
| [`research`](../../.agents/skills/research/SKILL.md) | Technical investigation, official docs, library APIs, or 2026 best practices need research | `.scratch/research/<topic>.md` |
| [`to-spec`](../../.agents/skills/to-spec/SKILL.md) | A confirmed DDR must become an enterprise-grade specification with measurable NFRs, security/failure contracts, explicit seams, provenance, and traceability | `specs/<slug>.md` with a readiness verdict |

### Execution

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`to-tickets`](../../.agents/skills/to-tickets/SKILL.md) | A readiness-passed spec and its DDR need production-grade vertical slices with source provenance, traceability, quality gates, and dependency edges | `docs/sprint/SPRINT.md`, `docs/sprint/tickets/<NN>-<slug>.md` |
| [`implement`](../../.agents/skills/implement/SKILL.md) | One unblocked ticket or vertical slice is ready to build end-to-end | Code, tests, atomic commit (when the user authorizes it), ticket completion log |
| [`tdd`](../../.agents/skills/tdd/SKILL.md) | A behavioral increment should be built test-first at a public seam | Failing test → smallest complete production behavior → refactor |
| [`safe-refactor`](../../.agents/skills/safe-refactor/SKILL.md) | Structure must change without changing external behavior | Characterization tests + atomic transformations |
| [`database-migration`](../../.agents/skills/database-migration/SKILL.md) | Schema, index, or versioned API contract changes are required | Expand → Migrate → Contract plan with rollback proof |
| [`office`](../../.agents/skills/office/SKILL.md) | Office documents (.docx, .xlsx, .pptx), spreadsheets, or PDFs need processing or generation | Extracted dataset / formatted document (.docx/.xlsx) |

### Verification and continuity

| Skill | Use when | Primary artifact |
| :--- | :--- | :--- |
| [`browsing`](../../.agents/skills/browsing/SKILL.md) | Web automation, live UI verification, responsive testing, or visual proof are needed | Browser runner script + screenshot/video artifacts |
| [`code-review`](../../.agents/skills/code-review/SKILL.md) | A diff, branch, or pull request needs spec-fidelity and standards review | Ranked findings + verdict |
| [`pr`](../../.agents/skills/pr/SKILL.md) | A pull request description is needed | Summary, blast radius, door reversibility, evidence |
| [`diagnosing-bugs`](../../.agents/skills/diagnosing-bugs/SKILL.md) | A failure or performance regression needs a root cause before a patch | Reproduction loop + falsified hypotheses |
| [`handoff`](../../.agents/skills/handoff/SKILL.md) | A session is ending, switching context, or handing off to a fresh session | `.scratch/handoff.md` + synced sprint board |

Unlisted commands such as `/grill-me`, `/plan`, `/agents`, `/teamwork`, and `/browser` are Antigravity built-ins. This repository does not re-implement them; the `grill-me` skill adds the 6-Pillar stress-test protocol on top of the built-in interview behavior, and the `browsing` skill standardizes live UI verification and Playwright automation alongside the `/browser` subagent.

---

## 4. Cross-Session Resumption

1. Read `.scratch/handoff.md` first (written by `handoff`), then `docs/sprint/SPRINT.md`.
2. Resume exactly one unblocked ticket with `/implement docs/sprint/tickets/<NN>-<slug>.md`.
3. Never re-plan a settled decision; check `docs/discovery/`, `docs/adr/`, and `CONTEXT.md` before proposing alternatives.
