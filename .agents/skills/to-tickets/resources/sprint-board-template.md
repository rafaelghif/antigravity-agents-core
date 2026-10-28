# Sprint Board: <Feature / Initiative Title>

- **Sprint Goal**: <One-sentence outcome unlocked when all waves complete>
- **Spec Reference**: `specs/<feature-slug>.md`
- **Verification Command**: `<exact test & typecheck command>`
- **Active Wave**: `Wave 1`
- **Next Recommended Ticket**: `docs/sprint/tickets/01-<slug>.md`

---

## 1. Execution Waves & Backlog (DAG)

| Wave | Ticket | Title | Size | Status | Blocked By | Unblocks | Commit SHA |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Wave 1** | [`#01`](tickets/01-<slug>.md) | <Ticket 01 Title> | `S` | `ready` | `None` | `#02`, `#03` | `-` |
| **Wave 2** | [`#02`](tickets/02-<slug>.md) | <Ticket 02 Title> | `M` | `blocked` | `#01` | `#04` | `-` |
| **Wave 2** | [`#03`](tickets/03-<slug>.md) | <Ticket 03 Title> | `S` | `blocked` | `#01` | `#04` | `-` |
| **Wave 3** | [`#04`](tickets/04-<slug>.md) | <Ticket 04 Title> | `M` | `blocked` | `#02`, `#03` | `None` | `-` |

---

## 2. Definition of Ready (DoR) & Definition of Done (DoD)

- **DoR (Before starting a ticket)**: All `Blocked By` tickets are `done`; public seam, scope boundary, and verification command are defined; sized for ≤1 session (`S`/`M`).
- **DoD (Before marking `done`)**: All ticket acceptance criteria checked (`[x]`); full test/typecheck/lint suite passes; atomic Conventional Commit landed; ticket `## 6. Session Handover & Completion Log` and this Sprint Board table updated.

---

## 3. Cross-Session Handover Log

| Session / Date | Tickets Completed | Key Seams / Contracts Introduced | Next Ticket to Run |
| :--- | :--- | :--- | :--- |
| `<YYYY-MM-DD>` | `Sprint Initialized` | <Initial architecture & seam agreements> | `#01` (`docs/sprint/tickets/01-<slug>.md`) |
