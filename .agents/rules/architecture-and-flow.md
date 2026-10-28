---
trigger: model_decision
description: "User-defined dynamic architecture (interview-first), deep modules, narrow boundary seams, and end-to-end blast-radius mapping when designing or modifying system topology."
---

# Dynamic Architecture & Resilient Flow (World-Class Systems Architecture)

## 1. Dynamic Discovery & User-Defined Architecture

* **Zero Static Dogma**: Never impose rigid folder hierarchies, pre-baked layer structures, or assumed framework dogma. The user defines their system topology, stack, and module layout.
* **Discovery Before Action**: Always inspect existing workspace manifests, configs, and `@CONTEXT.md` first. If architecture or boundaries are undecided, **interview the user first** (`ask_question` with `(Recommended)` first, or `/grill-me`).
* **Critical 6-Pillar Stress-Testing**: Rigorously critique architectural proposals against real-world production failure modes (circular dependencies, lock contention, cascading outages, vendor lock-in) before finalizing designs.

## 2. Deep Modules & Narrow Boundary Seams (Ousterhout & Feathers)

* **Deep Modules Over Shallow Wrappers**:
  * Design modules with small, simple public interfaces that hide extensive domain complexity, edge-case management, and state coordination behind them.
  * Eliminate shallow pass-through classes, anemic services, and boilerplates that merely forward calls without adding leverage.
* **Seams at Genuine Boundaries Only**:
  * Introduce abstract test seams (interfaces/traits) exclusively at true I/O, external network, filesystem, database, or time boundaries to enable hermetic testing and painless swappability.
  * Never create 1:1 `IFoo` interfaces for single-implementation internal classes.

## 3. Resilience Engineering & Boundary Protection

* **Circuit Breakers & Graceful Degradation**:
  * Protect every integration with an external network service, third-party API, or asynchronous worker with an automated **Circuit Breaker** (Closed, Open, Half-Open) and explicit timeout bounds.
  * Define explicit fallback behaviors to prevent external outages from taking down primary application workflows.
* **Consistency Boundaries & Saga Patterns**:
  * Respect architectural consistency limits: enforce **Strong Consistency** within a single database transactional boundary; use the **Transactional Outbox Pattern** or **Saga Pattern** with compensating actions when coordinating state mutations across distributed services or message queues.

## 4. End-to-End Data & Blast-Radius Traceability

* **Complete Flow Traceability**:
  * Trace every data payload end-to-end from ingress validation → domain state machine → atomic persistence → egress serialization. Internal entity models and sensitive fields must never leak across public API boundaries.
* **Blast-Radius Caller Mapping**:
  * Before modifying any shared function, type, or database contract, map **every single caller and downstream consumer across the codebase via `grep_search`**. Never patch a single call-site while leaving sibling consumers broken.
