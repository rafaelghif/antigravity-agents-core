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
- **Uncommitted / Pending Files**: `<clean tree after commit | exact modified files>`

## 2. Downstream Seam, Config & Shared-Asset Notes

- **New / Updated Public Seams**: `<exact file:symbol and signature>`
- **New Config Keys / Env Vars (names only, zero values)**: `<KEY_NAME>`
- **New Shared UI Primitives / Helpers Added to `CONTEXT.md`**: `<exact path:symbol>`

## 3. Falsified Approaches (Do Not Repeat)

- <dead end or rejected pattern + why it failed>

## 4. Machine-Portable Resume Checklist

1. Pull latest branch (`git pull`) and verify toolchain/env vars match `CONTEXT.md` §1–2.
2. Read `CONTEXT.md`, `docs/sprint/SPRINT.md`, and the target ticket below.

## 5. Immediate Next Session Action

Run exactly one command or skill invocation to continue:

```text
/implement docs/sprint/tickets/<MM>-<slug>.md
```
