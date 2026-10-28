---
trigger: model_decision
description: "User-defined dynamic architecture (interview-first), deep modules, narrow boundary seams, and end-to-end blast-radius mapping when designing or modifying system topology."
---

# Dynamic Architecture & End-to-End Flow Mapping

## 1. User-Defined Architecture (Interview First, Zero Static Dogma)

* **Never Force Static Templates**: Do not impose pre-baked folder hierarchies, rigid layer names, or assumed config files.
* **Dynamic Discovery → User Interview**:
  * First, inspect whatever files and structure already exist in the workspace and `@CONTEXT.md`.
  * If the project is new, evolving, or its architecture/stack/module layout is not yet settled, **interview the user first** (`ask_question` or `/grill-me`) to let them define the architecture and stack, then record their decision in `@CONTEXT.md`.
* **Critique User Choices Against `@AGENTS.md` §3 (The 6 Pillars)**: While the user defines the architecture, ruthlessly stress-test their choice against real-world failure modes and the 6 Engineering Pillars in `@AGENTS.md`. If their chosen structure will cause circular dependencies (`Module A` ↮ `Module B`), scaling bottlenecks, or vendor lock-in, call out the flaw and present a cleaner option before locking it in.

## 2. Deep Modules & Narrow Public Seams (Ousterhout & Feathers)

* **Deep Modules Over Shallow Pass-Throughs**:
  * Design modules with a small, simple public interface hiding substantial logic, validation, and edge-case coordination inside.
  * Eliminate shallow pass-through wrappers, middle-man classes, and boilerplate layers whose interface is as complex as their implementation.
* **Public Seams at True Boundaries Only**:
  * Place abstract interfaces (**seams**) only at genuine I/O, infrastructure, or cross-module boundaries where swappability or hermetic testing is required.
  * Never create 1:1 `IFoo` interfaces for single-implementation internal logic.

## 3. End-to-End Data, Execution & Blast-Radius Mapping

* **Data Flow Mapping**: Trace every payload end-to-end from entry boundary → schema/type parsing → core logic → atomic persistence → explicit output contract. Never leak internal storage representations or sensitive fields into external responses.
* **Blast-Radius & Caller Mapping**: Before modifying any shared function, contract, or schema, run `grep_search` across the workspace to map **every caller, downstream consumer, transaction scope, and error recovery path**.
