# Sprint Board: <Feature / Initiative Title>

- **Feature Slug**: `<feature-slug>`
- **Sprint Goal**: <one-sentence production outcome>
- **Spec Reference**: `specs/<feature-slug>.md`
- **DDR Reference**: `docs/discovery/<feature-slug>.md`
- **Spec Readiness**: `READY FOR TICKETS` (never seed from a `draft` spec)
- **Quality Bar**: `production` (MVP/stub shortcuts forbidden)
- **Board Status**: `READY` | `NOT READY` (list blocking IDs)
- **Verification Command**: `<exact test + typecheck + lint command from spec>`
- **Active Wave**: `Wave 1`
- **Next Recommended Ticket**: `docs/sprint/tickets/01-<slug>.md`

---

## 1. Execution Waves & Backlog (DAG)

| Wave | Ticket | Title | Size | Status | Source IDs | Blocked By | Unblocks | Commit SHA |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **Wave 1** | [`#01`](tickets/01-<slug>.md) | <Outcome Title> | `S` | `ready` | `REQ-###` | `None` | `#02` | `-` |
| **Wave 2** | [`#02`](tickets/02-<slug>.md) | <Outcome Title> | `M` | `blocked` | `REQ-###`, `SEC-###` | `#01` | `None` | `-` |

## 2. Source Lineage

| Source | Artifact | Consumed By |
| :--- | :--- | :--- |
| `DEC-###` | `docs/discovery/<feature-slug>.md` | Ticket decisions & constraints |
| `REQ/NFR/INV/SEC/ERR` | `specs/<feature-slug>.md` | Traceability & acceptance criteria |
| `INV-###` / `ST-###` | `CONTEXT.md` | Codebase index & domain invariants |
| `ADR-####` | `docs/adr/` | Architectural & migration constraints |

## 3. Traceability Matrix

| Source ID | Requirement / Budget / Threat | Ticket(s) | Public Seam | Test(s) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | <summary> | `#01` | `<seam>` | `<test>` | `covered` |
| `INV-001` | <invariant> | `#02` | `<seam>` | `<test>` | `covered` |
| `SEC-001` | <threat/control> | `#02` | `<seam>` | `<test>` | `covered` |
| `ERR-001` | <condition/status> | `#02` | `<seam>` | `<test>` | `covered` |

## 4. Definition of Ready (DoR), Definition of Done (DoD) & Wave Exit Gate

- **DoR**: `Blocked By` tickets are `done`; source IDs, reusable repo assets, public seam, UI/error/auth contracts, and exact verification command are unambiguous (`ready` tickets have zero `OPEN` items).
- **DoD**: Acceptance criteria checked `[x]`; full verification command exits `0`; zero test tampering or production fakes; DRY/UI reuse verified; ticket completion log and this board updated.
- **Wave Exit Gate**: All tickets in the wave are `done`, full verification passes on integrated wave diff, migrations rehearsed if applicable, zero unmapped spec IDs remain.

## 5. Board Hygiene & Change Control

- Unique stable ticket IDs; acyclic `Blocked by` graph; one observable outcome per ticket (no horizontal layer tasks or `MVP`/`hardening later` tickets).
- Atomic status transitions: `blocked → ready → in-progress → in-review → done`.
- Any spec change invalidates affected tickets explicitly and updates the Traceability Matrix before coding resumes.

## 6. Cross-Session Handover Log

| Session / Date | Tickets Completed | Key Seams / Contracts Introduced | Source IDs Satisfied | Production Gates Verified | Next Ticket |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `<YYYY-MM-DD>` | `Sprint Initialized` | <initial seams> | `REQ-###` | <gates> | `#01` |
