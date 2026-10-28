---
name: codebase-design
description: Designs deep modules with narrow public interfaces and explicit test seams tailored to the user's chosen architecture using the Design-It-Twice method. Use when designing module interfaces, choosing where to place test seams, or refactoring shallow modules.
---

# Codebase Design (Deep Modules, Seams & 6 Pillars)

Design module interfaces within the **user's chosen architecture** that maximize **depth** (high internal capability behind a small, stable interface), place **seams** only at genuine boundaries, and uphold the **6 Engineering Pillars** (*Future-Proof, Scalable, Maintainable, Secure, High-Performance, Upgradeable*).

## Decision tree

1. **Has the user defined their preferred project architecture and module layout yet?**
   - **No** → Do not impose a static folder hierarchy! Interview the user first via `ask_question` or `/grill-me` to agree on the project's module topology.
   - **Yes** → Proceed to step 2.
2. **Can the new capability live inside an existing module without widening its public interface?**
   - **Yes** → Extend the existing module internally. Do not create a new file, wrapper class, or pass-through layer.
   - **No** → Proceed to step 3.
3. **Does the module cross an external I/O or third-party boundary (database, external API, queue, filesystem, clock)?**
   - **Yes** → Define a narrow **seam** at the boundary so callers stay **Upgradeable** (easy to swap providers) and deterministically testable without live infrastructure.
   - **No (internal logic)** → Expose concrete functions or types directly; do not create 1:1 `IFoo` interfaces for single-implementation internal code.
4. **Is the interface non-trivial?**
   - **Yes** → Run **Design It Twice** below before writing implementation code.

## Design workflow

1. **Design It Twice**:
   - Sketch **Design A** (minimal evolutionary extension) and **Design B** (a deeper module hiding more policy, concurrency safety, and edge cases behind fewer exported functions).
   - Compare both across the **6 Engineering Pillars**: *Future-Proof, Scalable, Maintainable, Secure, High-Performance, Upgradeable*.
2. **Minimize the interface**:
   - Ask for every exported function/method: *Can I reduce the number of methods? Can I simplify the parameters? Can I pull configuration defaults or edge-case handling inside the module?*
3. **Verify locality & upgradeability**:
   - Ensure a single business rule change or dependency upgrade requires editing only this module rather than scattering edits across callers.
