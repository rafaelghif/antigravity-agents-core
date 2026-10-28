# Session & Sprint Handoff

## 1. Sprint & Initiative Snapshot
- **Sprint Goal**: <One-sentence objective of the active initiative>
- **Sprint Board**: `docs/sprint/SPRINT.md` (`<X>/<Y> tickets done`, Active: `Wave <W>`)
- **Active / Next Ticket**: `docs/sprint/tickets/<NN>-<slug>.md` (`in-progress` | `ready`)

## 2. Working Tree & Verification State
- **Branch & HEAD**: `<branch>` @ `<short-sha>`
- **Working Tree**: `<clean | list of WIP uncommitted files>`
- **Last Verification Command**: `<exact command>` (`PASS` / `FAIL`)

## 3. Completed in This Session
- <Ticket `#NN` or sub-tasks finished, commit SHAs, and key files touched>

## 4. Cross-Session Context & Guardrails
- **Downstream Seam & Contract Notes**: <Exact interfaces, types, or invariants created in this session that the next ticket consumes>
- **Falsified Hypotheses / Dead-Ends**: <Approaches tried and rejected so the next session does not repeat them>
- **Open Blockers (if any)**: <None | specific external blocker>

## 5. Immediate Next Session Action
- <Exactly ONE concrete, runnable instruction to execute first in the next session, e.g.: `Run /implement on docs/sprint/tickets/02-<slug>.md (starting at Step 1: Red test at ...)`>
