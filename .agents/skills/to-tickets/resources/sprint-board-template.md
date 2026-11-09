# Sprint Board: <Feature / Initiative Title>

- **Feature Slug**: `<feature-slug>`
- **Sprint Goal**: <one-sentence production outcome unlocked when all waves complete>
- **Spec Reference**: `specs/<feature-slug>.md`
- **DDR Reference**: `docs/discovery/<feature-slug>.md`
- **Spec Readiness**: `READY FOR TICKETS` (a `draft` spec cannot seed a board)
- **Quality Bar**: `production` (enterprise-grade; MVP/prototype shortcuts are forbidden)
- **Board Status**: `READY` | `NOT READY` (with blocking ticket IDs)
- **Verification Command**: `<exact test + typecheck + lint command>`
- **Active Wave**: `Wave 1`
- **Next Recommended Ticket**: `docs/sprint/tickets/01-<slug>.md`

## How to fill this board (LLM rules)

1. **Derive from the spec, not from imagination**: every ticket row must trace to at least one spec ID and its `DEC-###` provenance.
2. **Never invent tickets or dependencies**: `Blocked by` must name a real data, contract, or ordering constraint.
3. **Copy the verification command verbatim** from the spec; never guess a test runner.
4. **No silent coverage gaps**: every `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###` appears in the traceability matrix with an owning ticket.
5. **No deferred hardening**: security, validation, data integrity, failure handling, observability, and tests belong to the ticket that introduces the seam.
6. **Mark a board `NOT READY`** if any requirement lacks an owner or any ticket lacks a seam, test, or source ID.

---

## 1. Execution Waves & Backlog (DAG)

| Wave | Ticket | Title | Size | Status | Source IDs | Blocked By | Unblocks | Commit SHA |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **Wave 1** | [`#01`](tickets/01-<slug>.md) | <Ticket 01 Title> | `S` | `ready` | `REQ-###` | `None` | `#02`, `#03` | `-` |
| **Wave 2** | [`#02`](tickets/02-<slug>.md) | <Ticket 02 Title> | `M` | `blocked` | `REQ-###`, `SEC-###` | `#01` | `#04` | `-` |
| **Wave 2** | [`#03`](tickets/03-<slug>.md) | <Ticket 03 Title> | `S` | `blocked` | `NFR-###` | `#01` | `#04` | `-` |
| **Wave 3** | [`#04`](tickets/04-<slug>.md) | <Ticket 04 Title> | `M` | `blocked` | `ERR-###` | `#02`, `#03` | `None` | `-` |

---

## 2. Source Lineage

| Source | Artifact | Consumed By |
| :--- | :--- | :--- |
| `DEC-###` | `docs/discovery/<feature-slug>.md` | Ticket headers and behavior rationale |
| `REQ-###` / `NFR-###` / `INV-###` / `SEC-###` / `ERR-###` | `specs/<feature-slug>.md` | Traceability matrix, acceptance criteria, tests |
| `INV-###` / `ST-###` | `CONTEXT.md` | Domain rules and forbidden transitions |
| `ADR-####` | `docs/adr/` | Reversibility, migration, and rollback constraints |

---

## 3. Traceability Matrix

| Source ID | Requirement / Budget / Threat | Ticket(s) | Public Seam | Test(s) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | <one-line summary> | `#01` | `<seam>` | `<test name>` | `covered` |
| `INV-001` | <invariant> | `#02` | `<seam>` | `<forbidden-transition test>` | `covered` |
| `NFR-001` | <budget with unit> | `#03` | `<seam>` | `<benchmark>` | `covered` |
| `SEC-001` | <threat/control> | `#02` | `<seam>` | `<authz test>` | `covered` |
| `ERR-001` | <condition/status> | `#04` | `<seam>` | `<failure test>` | `covered` |

Every in-scope spec ID must appear here and be owned by at least one ticket. Unmapped IDs block the board from starting.

---

## 4. Definition of Ready (DoR) & Definition of Done (DoD)

- **DoR (Before starting a ticket)**: All `Blocked By` tickets are `done`; source IDs, public seam, contract, scope boundary, production quality gates, and verification command are defined; sized for ≤1 session (`S`/`M`); no unresolved ADR or unknown auth/NFR constraint.
- **DoD (Before marking `done`)**: All ticket acceptance criteria checked (`[x]`); full test/typecheck/lint suite passes with exit code 0; zero skipped/weakened tests, production mocks, fake data, or `TODO` placeholders; security, tenancy, idempotency, failure, observability, performance, migration, and rollback gates satisfied or justified `N/A`; every source ID satisfied by a test or an explicit `N/A` rationale; atomic Conventional Commit landed (or explicitly deferred with user consent); ticket `## 9. Session Handover & Completion Log` and this Sprint Board table updated.
- **Wave Exit Gate**: Every ticket in the wave is `done`; the full verification command passes on the integrated wave result; migrations are rehearsed; no production fake, deferred hardening, or unmapped source ID remains inside the wave's diff.

---

## 5. Board Hygiene & Change Control

- Ticket IDs are unique and stable; `Blocked by` edges form an acyclic graph with no orphan or duplicate tickets.
- One objective per ticket; titles state the observable outcome, never the architectural layer.
- Every ticket cites its source IDs and `DEC-###` provenance; a ticket without provenance is invalid.
- Status transitions are atomic: `blocked → ready → in-progress → in-review → done`.
- A spec change invalidates affected tickets explicitly; update the traceability matrix and source lineage before resuming work.
- Splitting a ticket preserves its source IDs and downstream contracts; never silently drop a requirement.
- A ticket titled `MVP`, `prototype`, `wireframe`, or `temporary` is invalid unless it is a quarantined spike that never merges.

---

## 6. Cross-Session Handover Log

| Session / Date | Tickets Completed | Key Seams / Contracts Introduced | Source IDs Satisfied | Production Gates Verified | Next Ticket to Run |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<YYYY-MM-DD>` | `Sprint Initialized` | <initial architecture and seam agreements> | `REQ-###` | <security, migration, observability> | `#01` (`docs/sprint/tickets/01-<slug>.md`) |
