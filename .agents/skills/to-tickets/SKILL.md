---
name: to-tickets
description: Decomposes a readiness-passed specification into a Scrum Sprint Wave Board (docs/sprint/SPRINT.md), cross-machine handover doc, and codebase-grounded vertical tickets citing exact file touchpoints, data/error contracts, Do-Not-Invent guards, and acceptance criteria. Use when slicing a multi-session feature.
---

# To Tickets (Anti-Hallucination Vertical Wave Slicing)

Slice a readiness-passed spec into `docs/sprint/SPRINT.md` ([resources/sprint-board-template.md](resources/sprint-board-template.md)) and hyper-detailed vertical tickets `docs/sprint/tickets/<NN>-<slug>.md` ([resources/ticket-template.md](resources/ticket-template.md)) so any executor agent implements without guessing.

## Decision tree

1. **Does the work fit cleanly in a single session without waves?**
   - **Yes** → Do not generate sprint paperwork; run `/implement` directly.
   - **No** → Proceed to step 2.
2. **Does `specs/<slug>.md` exist with `Readiness Verdict: READY FOR TICKETS` (or a clear confirmed PRD)?**
   - **No** → Stop. Resolve ambiguities via `/to-spec` or `ask_question` first.
   - **Yes** → Proceed to step 3.
3. **Is `CONTEXT.md` populated with real shared UI, helpers, config/logging seams, and verification commands?**
   - **No** → Run `/index-project` first so every ticket cites real `path:symbol` reusable assets.
   - **Yes** → Build coverage ledger, confirm the Wave DAG with the user via `ask_question`, write hyper-detailed tickets, and validate with the black-box script.

## Slicing workflow

1. **Coverage Ledger**: Map every `REQ-###`, `INV-###`, `NFR-###`, `SEC-###`, and `ERR-###` to an owning ticket, public seam, and test. Any unresolved item blocks board creation.
2. **Anti-Hallucination Vertical Slices**:
   - Each ticket (`S` or `M`, `<= 1` session) delivers one observable vertical outcome cutting through validation, auth, domain rules, UI states, persistence, config/logging, error mapping, and tests.
   - Populate **Exact File Touchpoints** (`CREATE`/`MODIFY`/`DELETE`, exact paths & symbols), **Data, Schema & Error Matrix** (exact field bounds, status/error codes, recovery), and **Anti-Hallucination Do-Not-Invent Guards** verbatim from `specs/<slug>.md` and `CONTEXT.md`.
   - Cite exact **Reusable Assets (`path:symbol`)** and **Config/Logging/Performance gates**. Never split out `Harden later`, `Wire UI later`, or `MVP` tasks.
   - Mark genuinely inapplicable checklist gates `N/A — <reason>` rather than inventing filler.
3. **Acyclic Execution Waves**: Put pure prefactoring at `#01` (`Wave 1`) if needed; compute `Blocked by` strictly from real data/contract dependencies and keep file touchpoints disjoint inside each parallel wave.
4. **Validate via Black-Box Script**:
   ```bash
   node .agents/skills/to-tickets/scripts/validate-board.mjs --help
   node .agents/skills/to-tickets/scripts/validate-board.mjs docs/sprint/SPRINT.md
   ```
