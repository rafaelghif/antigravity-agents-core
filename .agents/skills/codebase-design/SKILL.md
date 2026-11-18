---
name: codebase-design
description: Designs deep modules with narrow public interfaces and explicit test seams tailored to the repository's chosen architecture using Design It Twice. Use when designing new module interfaces, choosing test seam boundaries, or collapsing shallow wrappers.
---

# Codebase Design (Deep Modules, Seams & 6 Pillars)

Design module interfaces within the repository's existing (or user-approved) topology that maximize implementation depth behind narrow, stable public interfaces.

## Decision tree

1. **Is the project topology/module layout already established or explicitly defined by the user?**
   - **No** → Inspect `CONTEXT.md` and manifests first; if greenfield/undecided, call `ask_question` (putting the simplest flat layout with plain relative imports as `(Recommended)`). Never impose an unrequested monorepo or alias structure.
   - **Yes** → Proceed to step 2.
2. **Can this capability live inside an existing module/component without bloating its public interface?**
   - **Yes** → Extend the existing module internally. Do not create a new file, pass-through wrapper, or parallel component.
   - **No** → Proceed to step 3.
3. **Does the module cross an external I/O boundary (DB, HTTP, filesystem, queue, clock)?**
   - **Yes** → Define a narrow boundary seam for swappability and hermetic testing.
   - **No (pure internal domain logic)** → Export concrete functions/types directly; do not create 1:1 `IFoo` interfaces.
4. **Is the interface non-trivial or shared across multiple callers?**
   - **Yes** → Run **Design It Twice** below before editing.

## Design workflow

1. **Design It Twice**: Sketch **Design A** (minimal extension) vs **Design B** (deeper interface hiding policy, validation, concurrency safety, and edge cases). Compare across *Future-Proof, Scalable, Maintainable, Secure, High-Performance, Upgradeable*.
2. **Minimize Surface Area**: Pull defaults, invariant checks, and edge-case normalization inside the module so callers stay thin.
3. **Verify Blast Radius**: Check existing callers via `rg -n` (or search tool) so rule/dependency changes stay localized to one module.
