---
trigger: glob
globs: "*.ts, *.tsx, *.js, *.jsx, *.mjs, *.cjs, *.py, *.go, *.rs, *.java, *.kt, *.rb, *.php, *.cs"
description: "Core LLM coding invariants: DRY single source of truth, boundary parsing, type-driven states, guard clauses, error wrapping, and precision."
---

# Coding Standards & Implementation Invariants

## 1. DRY & Reuse Before Authoring

- Before writing a helper, validator, API wrapper, formatter, constant, or type, search `utils/`, `lib/`, `helpers/`, `hooks/`, `schemas/`, `types/`, and `CONTEXT.md`. Reuse or extend existing code.
- Maintain a single canonical source of truth for validation schemas, domain constants, error codes, and API fetchers. Never maintain parallel configs or duplicate helper implementations.
- Use standard library and already-installed packages before adding dependencies or bespoke wrappers.

## 2. Type-Driven Design & Boundary Parsing

- **Parse, Don't Validate**: Parse untrusted ingress payloads (HTTP bodies, query params, CLI args, env vars, webhook JSON) at the boundary into strict domain types using the project's schema library (or explicit strict parsers). Never pass raw `any`/untyped dicts into domain logic.
- **Make Illegal States Unrepresentable**: Model mutually exclusive states with discriminated unions / sum types instead of clusters of optional booleans (`isLoading`, `isError`, `isSuccess`).
- **Intention-Revealing Names**: Name identifiers for domain meaning (`activeSessionCount`, `calculateProratedRefundCents`). Avoid ambiguous abbreviations (`tmp`, `val`, `data2`).

## 3. Control Flow, Error Handling & Readability

- **Guard Clauses**: Validate preconditions and failure exits at the top of functions with early returns; keep nesting depth ≤ 3.
- **Explicit Error Wrapping**: Never write empty `catch {}` blocks or ignore returned errors. Wrap failures with operational context and preserve the cause chain (`{ cause: err }` in JS/TS, `%w` in Go).
- **Why-Only Comments**: Do not narrate *what* the code does. Comment only non-obvious invariants, protocol constraints, or explicit scaling ceilings (`// ponytail: <ceiling + upgrade path>`).
- **Complete Edits**: Never emit placeholder comments (`// ... rest unchanged ...`) or deferred `TODO` stubs in production code.

## 4. Data Precision, I/O & Lifecycle Safety

- **Timestamps**: Compute and store timestamps in UTC (`epoch ms` or ISO-8601 with `Z`), serializing one canonical form per API contract. Convert timezones only at the presentation layer.
- **Currency**: Represent money in integer minor units (e.g., `int64`/`BigInt` cents) or fixed-point `Decimal`—never IEEE-754 floats. Never pass raw `BigInt` directly to `JSON.stringify`; serialize as integer or decimal string with explicit scale.
- **Bounded Memory & External I/O**: Enforce explicit timeouts on every external HTTP, DB, and queue call. Stream large payloads with backpressure and paginate list queries instead of loading unbounded collections into memory.
- **Graceful Shutdown**: Long-running services must handle `SIGTERM`/`SIGINT` by rejecting new work, draining in-flight requests within a bounded timeout, and closing DB pools/sockets cleanly.
