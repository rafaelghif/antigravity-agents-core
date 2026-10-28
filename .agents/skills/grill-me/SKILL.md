---
name: grill-me
description: Interviews the user one question at a time to define project architecture/stack from scratch, stress-test plans against the 6 Engineering Pillars, and roast flawed assumptions before coding. Use when architecture, stack, or requirements are undecided or need stress-testing.
---

# Grill Me (User-Defined Architecture & 6-Pillar Stress-Test)

Interview the user relentlessly until you reach a shared understanding and every branch of the design decision tree is settled. Never force a static architecture or pre-baked stack—let the user define what they want, then **critically stress-test their choices** against `@AGENTS.md` §3 (**The 6 Engineering Pillars**).

## Decision tree

1. **Is the missing information a codebase fact or a user-defined architecture/product decision?**
   - **Codebase fact** (something already committed in the workspace) → Never ask the user. Inspect the repo directly or delegate to `codebase-investigator`.
   - **Architecture, stack, folder layout, or product decision** → Never impose a static template! Put it on the question frontier so the user defines it.
2. **Does the user's premise or chosen architecture fail any of the 6 Pillars or violate YAGNI?**
   - **Yes** → Roast and push back immediately (`[Roast / Premise Flaw] -> [Production Failure Mode] -> [Superior Alternative]`). A grilling session with zero pushback is useless.
   - **No** → Proceed to step 3.
3. **Is the question grillable (answerable by reasoning) or ungrillable (needs a quick prototype spike to react to)?**
   - **Ungrillable** → Stop grilling that branch and propose a minimal throwaway spike first.
   - **Grillable** → Ask it using the interview protocol below.
4. **Is the decision frontier empty (all architecture, stack, and domain branches settled)?**
   - **Yes** → Summarize the user-defined architecture and settled decisions, then let the user choose the next workflow step:
     - New user-defined architecture, module boundaries, or domain terms settled → `/domain-modeling` (update `CONTEXT.md` + optional ADR)
     - Module interfaces and boundary seams need design → `/codebase-design`
     - Multi-session feature needing a written spec → `/to-spec`
     - Feature needing Scrum Sprint Wave Board & vertical session-sized tickets → `/to-tickets`
     - Small, single-slice change ready to build immediately → `/implement` (or `/tdd`)
     - Long conversation needing a fresh session window → `/handoff`

## Interview protocol

1. **Start with User-Defined Foundations (if not yet established in the repo)**:
   - Ask how the user wants their architecture, module/folder topology, runtime/stack, and persistence layer structured rather than assuming a default.
2. **Walk the decision tree one question at a time**:
   - Aligning with Antigravity's `/grill-me` behavior (`antigravity.google/docs/commands/grill-me.md`), prioritize the highest-leverage unblocked trunk question first (or use `ask_question` with `(Recommended)` prefixed on your top engineering choice and a brief 6-pillar rationale).
   - Never ask a downstream leaf question before the trunk decision it depends on is settled.
3. **Roast weak spots & advance**:
   - Each answer prunes or expands the tree. Challenge any answer that introduces scaling traps, lock-in, or security holes before advancing to the next branch.
