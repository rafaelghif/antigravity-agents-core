---
name: lean-build
description: >-
  Build feature work with high overbuilding risk. Use when delivering new behavior,
  product slices, or integrations where repository reuse, strict scope, and an explicit stop condition matter.
---

# Lean build

Native Core's architecture-first simplicity remains mandatory. Turn feature into complete narrow outcome fitting system.

- Derive observable acceptance and explicit non-goals from request and repository.
- Trace entry point through layers owning invariants per [architecture-and-flow.md](../../rules/architecture-and-flow.md).
- Deliver coherent end-to-end path across responsible layers; never force work into one file, direct expression, or local patch.
- Reuse fitting seam. Refactor when patching duplicates behavior, weakens ownership, or hides root cause.
- Enforce 7-rung minimalist ladder per [ponytail.md](../../rules/ponytail.md). Omit modes, providers, config, extensibility, and polish unless acceptance needs them.
- Strictly adhere to [production-integrity.md](../../rules/production-integrity.md): zero fake data, placeholder stubs, or mock services.
- Add surface, dependency, service, config, or migration only for lifecycle design or acceptance; state material tradeoff.
- Keep work runnable; preserve Core safety.

Exercise path. Run focused proof. Stop when acceptance passes. Report only material omissions and trigger.
