---
name: discover
description: Researches live best practices and interviews the user to resolve ambiguous requirements, PRDs, UI states, architecture, configurability, security, and performance budgets, writing a grounded Discovery Decision Record (docs/discovery/<slug>.md) with stable DEC/OQ/ASM IDs. Use when requirements, tickets, PRDs, or architecture are incomplete or need stress-testing (pairs with built-in /grill-me).
---

# Discover (Live-Researched Ambiguity & Architecture Interview)

Eliminate every product, architectural, security, performance, and UI ambiguity **before** specs, tickets, or code exist. Persist settled decisions in `docs/discovery/<feature-slug>.md` using [resources/discovery-record-template.md](resources/discovery-record-template.md). Consult [references/discovery-checklist.md](references/discovery-checklist.md) for the full multi-stack audit dimensions.

## Decision tree

1. **Is the missing fact already proven in the repository (`CONTEXT.md`, manifests, existing code)?**
   - **Yes** → Read the file (or invoke `codebase-investigator`) and cite `path:line`. Never ask the user what the repo already answers.
   - **No** → Proceed to step 2.
2. **Are you about to propose a library, state manager, auth pattern, database design, or framework best practice?**
   - **Yes** → **Mandatory Live Research Gate**: Run `search_web` (or `/research`) anchored to the current year (`2026`) and primary docs **before** proposing options to the user. Never recommend patterns from stale training weights.
   - **No** → Proceed to step 3.
3. **Does the user's premise violate security, scalability, maintainability, configurability, or YAGNI?**
   - **Yes** → Push back immediately (`[Premise Flaw] -> [Production Failure Mode] -> [Concrete Alternative]`).
   - **No** → Proceed to step 4.
4. **Are any behavior-changing questions still open?**
   - **Yes** → Interview via `ask_question` with `(Recommended)` first (backed by live research or repo evidence) until blocking `OQ-###` items are settled.
   - **No** → Write/confirm `docs/discovery/<feature-slug>.md` and route downstream.

## Anti-hallucination rules

- Never invent endpoints, schemas, error codes, numeric limits, or verification commands. Record settled decisions as `DEC-###`, unknowns as `OQ-###` (`OPEN`), and user-approved assumptions as `ASM-###` with a validation check.
- Never route to `/to-spec` or `/to-tickets` while a blocking `OQ-###` remains unresolved.

## Route after confirmation

- Domain invariants, state machines, or 3-gate architecture trade-offs → `/domain-modeling`.
- Non-trivial module seams or pre-code performance/modularity design → `/codebase-design`.
- Multi-session feature needing a formal spec → `/to-spec`.
- Ready spec needing vertical slices → `/to-tickets`.
- Single slice ready to build → `/implement`.
