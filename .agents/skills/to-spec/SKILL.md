---
name: to-spec
description: Turns settled decisions from a conversation into a structured technical specification with explicit public seams and out-of-scope boundaries. Use after grill-me or when the user asks to write a specification or PRD.
---

# To Spec

Record settled product and architectural decisions into a durable specification document (`specs/<feature-slug>.md` or an Antigravity Implementation Plan artifact via `/plan`) without starting a new round of questions or inventing unagreed requirements.

## Decision tree

1. **Are critical decisions (data model, auth boundaries, or failure modes) still unresolved?**
   - **Yes** → Do not invent decisions to fill a template section. Pause and resolve open questions via `/grill-me` or `ask_question` first.
   - **No** → Proceed to step 2.
2. **Did you confirm the public test seams with the user before writing the full spec?**
   - **No** → Present the proposed **public seams** (proposing as few as possible) before or alongside the spec draft.
   - **Yes** → Write the specification using [resources/spec-template.md](resources/spec-template.md).

## Specification workflow

1. **Use project vocabulary**:
   - Read `CONTEXT.md` and `docs/adr/` first so every entity, state, and seam uses the repository's exact domain nouns rather than generic boilerplate.
2. **Propose minimal public seams**:
   - Identify the existing routes, handlers, or module interfaces where automated tests will verify the behavior without reaching into internal implementation details.
3. **Record only settled decisions**:
   - Follow [resources/spec-template.md](resources/spec-template.md).
   - Ensure the **Out of Scope** section lists the concrete capabilities deliberately refused during planning.
4. **Next step routing**:
   - If the build spans multiple sessions or slices, recommend `/to-tickets` to generate the Scrum Sprint Wave Board (`docs/sprint/SPRINT.md`) and vertical tracer-bullet tickets.
   - If the build is small enough for a single session, recommend `/implement`.
