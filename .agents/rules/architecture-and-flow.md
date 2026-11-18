---
trigger: model_decision
description: "Apply when designing or modifying system topology, module boundaries, external integrations, or shared interfaces."
---

# Architecture, Module Seams & Resilience

1. **Discovery Before Topology Changes**: Inspect existing manifests, `tsconfig.json`, and `CONTEXT.md` first. Never impose rigid folder templates, monorepo tools (Turborepo, Nx, Lerna), scoped `@repo/*` packages, or `@/*` path aliases unless already used in the repo or explicitly approved via `ask_question`. Default to plain relative imports (`./`, `../`) for greenfield projects.
2. **Deep Modules Over Shallow Wrappers**: Expose small, stable public interfaces that encapsulate validation, edge cases, and state coordination internally. Do not create 1:1 `IFoo` interfaces or pass-through service/repository wrappers that add indirection without leverage. Place abstract interfaces/seams only at true external I/O boundaries (DB, HTTP, filesystem, queue, clock).
3. **Resilience & Consistency**:
   - Every external dependency call requires an explicit timeout and bounded retry policy with exponential backoff and jitter.
   - Add a Circuit Breaker only where dependency failure can amplify across high-volume/user-facing request paths.
   - Define explicit fallback or fail-fast degradation behavior. Use single-DB transactions for strong consistency and Transactional Outbox / Saga patterns across distributed boundaries.
4. **End-to-End Traceability & Blast-Radius Mapping**:
   - Trace payloads from ingress parsing → domain state transition → persistence → egress DTO (never leak internal entity fields).
   - Before changing any shared function, component prop, type, or schema, search every caller across the codebase (`rg -n` via `run_command` or search tool) and verify all sibling consumers remain compatible.
