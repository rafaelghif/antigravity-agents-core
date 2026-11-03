---
trigger: model_decision
description: "User-defined dynamic architecture (interview-first), deep modules, narrow boundary seams, and end-to-end blast-radius mapping when designing or modifying system topology."
---

# Dynamic Architecture & Resilient Flow (World-Class Systems Architecture)

## 1. Dynamic Discovery & User-Defined Architecture

* **Zero Static Dogma**: Never impose rigid folder hierarchies, pre-baked layer structures, or assumed framework dogma. The user defines their system topology, stack, and module layout.
* **Discovery Before Action (Anti-Presumptive Scaffolding)**: Always inspect existing workspace manifests, configs, and `@CONTEXT.md` first. When system topology, folder structure, or stack boundaries are open-ended (e.g. requests to "create monorepo", "scaffold backend", or "organize project"), never assume a complex setup or generate opinionated directory trees silently. Interview the user first via `ask_question` (with `(Recommended)` on the minimal path) or `/grill-me`.
* **Presumption-Free Topology & Plain-Import Simplicity**:
  * **Precondition Check**: When scaffolding or restructuring without explicit tooling requirements:
    * **Action**: Do not unilaterally introduce monorepo build orchestrators (Turborepo, Nx, Lerna), scoped package hierarchies (`@repo/*`, `@apps/*`), or TypeScript path aliases (`@/*`).
    * **Resolution Protocol**: Clarify the desired simplicity tier first via `ask_question`, offering transparent choices:
      1. Minimal & Flat (Standard directories, plain relative imports `./`, zero build-step magic).
      2. Native Workspace (Standard package manager workspaces without third-party orchestrators).
      3. Enterprise Monorepo (Dedicated orchestrators and scoped packages, only when explicitly requested).
  * **Default Import Seam**: Unless the user explicitly requests path aliasing (`@/*`), default to plain relative imports (`./`, `../`). Plain imports preserve runtime portability, prevent module-resolution breakage across CLI/test runners, and provide zero cognitive friction for developers tracing files on disk.
* **Critical 6-Pillar Stress-Testing**: Rigorously critique architectural proposals against real-world production failure modes (circular dependencies, lock contention, cascading outages, vendor lock-in) before finalizing designs.

## 2. Deep Modules & Narrow Boundary Seams (Ousterhout & Feathers)

* **Deep Modules Over Shallow Wrappers**:
  * Design modules with small, simple public interfaces that hide extensive domain complexity, edge-case management, and state coordination behind them.
  * Eliminate shallow pass-through classes, anemic services, and boilerplates that merely forward calls without adding leverage.
* **Seams at Genuine Boundaries Only**:
  * Introduce abstract test seams (interfaces/traits) exclusively at true I/O, external network, filesystem, database, or time boundaries to enable hermetic testing and painless swappability.
  * Never create 1:1 `IFoo` interfaces for single-implementation internal classes.

## 3. Resilience Engineering & Boundary Protection

* **Bounded Failure & Graceful Degradation**:
  * Every external call — network service, third-party API, queue, or database — gets an explicit timeout plus a bounded retry policy with backoff and jitter. This part is mandatory.
  * Add a **Circuit Breaker** (Closed, Open, Half-Open) when the dependency is high-volume, user-facing, or capable of amplifying one failure across the request path. For low-volume or batch-only calls, a timeout and retry ceiling is enough; do not add a breaker just to look production-ready.
  * Define explicit fallback or degradation behavior for every dependency whose outage would otherwise take down a primary workflow.
* **Consistency Boundaries & Saga Patterns**:
  * Respect architectural consistency limits: enforce **Strong Consistency** within a single database transactional boundary; use the **Transactional Outbox Pattern** or **Saga Pattern** with compensating actions when coordinating state mutations across distributed services or message queues.

## 4. End-to-End Data & Blast-Radius Traceability

* **Complete Flow Traceability**:
  * Trace every data payload end-to-end from ingress validation → domain state machine → atomic persistence → egress serialization. Internal entity models and sensitive fields must never leak across public API boundaries.
* **Blast-Radius Caller Mapping**:
  * Before modifying any shared function, type, or database contract, map **every single caller and downstream consumer across the codebase via `grep_search`**. Never patch a single call-site while leaving sibling consumers broken.
