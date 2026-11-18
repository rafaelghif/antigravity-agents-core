---
trigger: glob
globs: "*.ts, *.tsx, *.js, *.jsx, *.mjs, *.cjs, *.dart, *.py, *.go, *.rs, *.java, *.kt, *.kts, *.swift, *.rb, *.php, *.cs, *.c, *.cpp, *.ex, *.exs"
description: "Multi-language industrial coding standards: configurability, structured logging, performance optimization, security/secret hygiene, boundary parsing, and maintainability."
---

# Industrial Coding Standards (Multi-Language)

## 1. Configurability & Zero Hardcoded Values

- **Externalize All Runtime Parameters**: Base URLs, ports, timeouts, retry counts, rate/page limits, cache TTLs, feature flags, and credentials MUST come from typed, startup-validated configuration (`process.env`/Zod, `--dart-define`/typed config class, `os.Getenv`/config struct, `pydantic-settings`).
- **Fail Fast on Missing Config**: Validate required configuration at application boot; never silently fall back to hardcoded localhost URLs, dummy secrets, or magic defaults in production paths.

## 2. Structured Logging & Observability

- Use the project's structured logger (JSON/structured key-value fields with `traceId`/`requestId`/`userId` or `tenantId`), never stray `console.log`/`print`/`debugPrint` in production logic.
- Log critical lifecycle transitions, boundary rejections, external call durations, and failures with preserved error causes (`{ cause: err }`, `%w`, `Error.throwWithStackTrace`).
- **Mandatory Redaction**: Never log passwords, API keys, JWTs, auth headers, cookies, or raw PII; replace sensitive values with `<REDACTED>`.

## 3. Best-of-the-Best Performance & Efficiency

- **Algorithmic & Memory Efficiency**: Choose optimal data structures (`Set`/`Map` lookups over repeated O(n²) `.find()`/`.any()` scans in loops), stream large files/exports with backpressure, and bound all list queries with cursor/keyset pagination.
- **Zero N+1 & Minimal Round-Trips**: Batch/join DB queries and parallelize independent I/O (`Promise.all`, `Future.wait`, `errgroup`, `asyncio.gather`) with bounded concurrency.
- **Explicit Timeouts & Resource Cleanup**: Set explicit connect/read timeouts on every HTTP, DB, and queue call. Always close/dispose connections, streams, file handles, timers, and controllers (`try/finally`, `defer`, `use`, `dispose()`).
- **Non-Blocking Hot Paths**: Never run heavy synchronous CPU work (large JSON parsing, hashing, compression, image processing) on the Node event loop or Flutter/mobile UI thread—offload to worker threads / Isolates / background workers.

## 4. Modularity, DRY & Type-Driven Correctness

- **Search Before Creating**: Inspect `lib/`, `utils/`, `helpers/`, `hooks/`, `schemas/`, `services/`, and `CONTEXT.md` before writing any helper, validator, formatter, or HTTP wrapper. Maintain one canonical source of truth.
- **Parse, Don't Validate**: Parse untrusted ingress payloads (HTTP, webhook, CLI, deep links, local storage) at the boundary into strongly-typed domain models; reject unknown fields.
- **Make Illegal States Unrepresentable**: Use discriminated unions / `sealed class` / `enum` sum types (TS unions, Dart 3 `sealed class`, Rust `enum`, Python `Literal` unions) instead of conflicting boolean flags.
- **Guard Clauses & Shallow Nesting**: Validate preconditions at the top of functions and return/throw early (max nesting depth ≤ 3). Keep functions focused on a single level of abstraction.
- **Why-Only Comments & Complete Edits**: Comment only non-obvious invariants or `// ponytail: <ceiling + upgrade path>`. Never emit placeholder comments (`// ... rest unchanged ...`) or `TODO` stubs.

## 5. Data Precision & Production Integrity

- **Timestamps**: Compute/store in UTC (`epoch ms` or ISO-8601 `Z`), one canonical format per API contract; format to local time only at presentation.
- **Currency**: Use integer minor units (`int`/`int64`/`BigInt` cents) or fixed-point `Decimal`—never IEEE-754 floats. Never pass raw `BigInt` directly to `JSON.stringify`.
- **Zero Production Fakes**: No mock stores, dummy IDs/tokens, hardcoded fake responses, or simulated delays in production directories.
