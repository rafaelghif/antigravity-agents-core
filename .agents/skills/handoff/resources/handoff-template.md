# Session & Cross-Machine Handoff

- **Date / UTC Timestamp**: `YYYY-MM-DDTHH:MM:SSZ`
- **Branch / Base Commit**: `<branch>` @ `<short-sha>`
- **Sprint Board**: `docs/sprint/SPRINT.md` (or `N/A`)
- **Last Completed Ticket**: `<#NN - Title | None>`
- **Active / Next Ticket**: `<#MM - Title>` (`docs/sprint/tickets/<MM>-<slug>.md`)

---

## 1. Current State & Verification Proof

- **Completed in This Session**: <concise bullet list with exact `path:symbol`>
- **Verification Command Run**: `<exact command>` → `PASS (exit 0)` | `WIP (<summary>)`
- **Post-Ticket `/code-review` Verdict**: `APPROVE` | `N/A (WIP)`
- **Unblocked Ready Queue**: `<#KK, #LL promoted from blocked -> ready | None>`

## 2. Git Working Tree Snapshot & Resume Files

- **Working Tree (`git status -sb`)**: `<clean tree after commit | modified/untracked file list>`
- **Diff Stat (`git diff --stat`)**: `<summary of touched modules>`

## 3. Environment & Toolchain Preconditions (Machine-Portable)

- **Runtime / Toolchain Versions**: `<e.g., Node >= 22, Flutter 3.x, Go 1.2x>`
- **Required Env Vars (names only, zero values)**: `<KEY_NAME>`
- **Active Services / DB Migrations / Ports**: `<migrated to NNNN | local DB required | N/A>`

## 4. Downstream Seam, Config & Shared-Asset Notes

- **New / Updated Public Seams**: `<exact file:symbol and signature>`
- **New Config Keys / Env Vars (names only, zero values)**: `<KEY_NAME>`
- **New Shared UI Primitives / Helpers Added to `CONTEXT.md`**: `<exact path:symbol>`

## 5. Falsified Approaches & Distilled Learnings (`docs/learnings/LESSONS.md`)

- **Falsified Approaches (Do Not Repeat)**: <dead end or rejected pattern + why it failed>
- **New Lessons Added**: `<L-### in docs/learnings/LESSONS.md | None>`

## 6. Immediate Next Session Action

1. Pull latest branch (`git pull`) and verify toolchain/env vars match §3 and `CONTEXT.md` §1–2.
2. Read `CONTEXT.md`, `docs/learnings/LESSONS.md`, `docs/sprint/SPRINT.md`, and run exactly one command below:

```text
/implement docs/sprint/tickets/<MM>-<slug>.md
```
