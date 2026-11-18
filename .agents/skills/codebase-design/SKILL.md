---
name: codebase-design
description: Designs modular, maintainable, scalable, and performance-optimized module interfaces across any language (TS, Dart/Flutter, Go, Python, Rust) using Design It Twice before coding. Use when designing new modules, refactoring shallow wrappers, choosing DI seams, or optimizing scaling and upgradeability.
---

# Codebase Design (Pre-Code Engineering Design & Deep Modules)

Think through **modularity, maintainability, scaling, upgradeability, configurability, security, and performance** *before* writing code. Consult [references/architecture-checklist.md](references/architecture-checklist.md) and [examples/design-it-twice-example.md](examples/design-it-twice-example.md) for concrete multi-stack patterns.

## Decision tree

1. **Is the repository layout / module boundary already established or confirmed by the user?**
   - **No** → Read `CONTEXT.md` and manifests first; if undecided, call `ask_question` (recommending the simplest layout). Never invent unrequested monorepos or aliases.
   - **Yes** → Proceed to step 2.
2. **Can this behavior live cleanly inside an existing module/feature without widening its public interface?**
   - **Yes** → Extend the existing module internally instead of creating a new file or parallel wrapper.
   - **No** → Proceed to step 3.
3. **Does the module cross an external I/O, storage, network, or device boundary?**
   - **Yes** → Define a narrow dependency-inversion seam (`interface` / `abstract interface class` / function type) so drivers can be upgraded/swapped and tested hermetically without mocking internal logic.
   - **No (pure domain logic)** → Export pure functions/classes/types directly; never create 1:1 `IFoo` boilerplate.
4. **Is the module non-trivial, performance-sensitive, or shared across multiple callers?**
   - **Yes** → Run the 4-step **Pre-Code Design & Optimization** workflow below before editing.

## Design workflow

1. **Design It Twice & Diagram Boundaries**:
   - Sketch **Design A** (minimal extension) vs **Design B** (deeper module hiding validation, config defaults, retry/timeout policy, concurrency guards, and state transitions behind a narrow interface).
   - For non-trivial multi-module or external I/O flows, produce a Mermaid `C4Container` (explicit technology + trust boundaries) and/or `sequenceDiagram` before coding.
   - Compare across all 6 Pillars: *Maintainability, Scalability, Modularity/Future-Proofing, Security/Secret Hygiene, Performance Optimization, Upgradeability*.
2. **Pre-Code Performance & Resource Audit**:
   - Verify O(n) / O(1) data structures, zero N+1 queries, bounded pagination/virtualization (`ListView.builder` / cursor pagination), non-blocking UI/event threads (Isolates / workers), explicit timeouts, and deterministic resource disposal (`dispose()`, `close()`, `defer`).
3. **Configurability & Logging Seam**:
   - Inject typed startup-validated config (zero hardcoded URLs, limits, or secrets) and structured logger calls at boundary/error transitions with secret redaction (`<REDACTED>`).
4. **Blast-Radius & Upgradeability Check**:
   - Search existing callers (`rg -n`) and confirm future changes to rules or external SDKs stay isolated inside one module.
