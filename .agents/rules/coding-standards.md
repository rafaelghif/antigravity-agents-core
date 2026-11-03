---
trigger: model_decision
description: "Core coding standards enforcing DRY, KISS, YAGNI, SOLID/SRP, intention-revealing naming, guard clauses, type-driven state invariants, and fail-fast error handling when authoring or reviewing code."
---

# Coding Standards (World-Class Engineering & Mechanical Sympathy)

## 1. Architectural Foundations (KISS, DRY, YAGNI, SOLID)

* **KISS & Simplicity as Unentanglement (Rich Hickey)**: Simplicity is an architectural property (decoupling state, separating concerns, and explicit data flow)—never crude character truncation or cryptic one-liners. Favor flat, linear, obvious control flow with explicit types and guard clauses over meta-programming, deep class hierarchies, or convoluted abstraction layers. Boring, readable code wins every time in production and outlasts 30 years of framework churn.
* **DRY (Single Canonical Source of Truth & Zero Duplicate Boilerplate)**: Consolidate domain calculations, validation schemas, UI primitives, and entity invariants in one place. Never recreate existing components, hooks, or utility functions in isolation—always search the workspace first. If a component or helper exists, reuse or compose it; duplicate implementations create design drift and upgrade nightmares. In configuration files, never dump multiple parallel or competing server definitions—make an explicit choice for the single canonical standard.
* **YAGNI (Anti-Boilerplate & Minimal Scaffolding)**: Implement only what current requirements mandate. Reject bespoke wrappers around standard framework features, redundant boilerplate generators, and speculative generic abstractions. Use existing project utilities and framework built-ins directly.
* **SOLID & Deep Modules**: Functions and modules must operate at a uniform level of abstraction with a single reason to change. Design **Deep Modules**—a simple, compact public interface encapsulating rich, robust internal implementation. Eliminate shallow pass-through classes that add cognitive noise without adding leverage.
* **Empirical Grounding & Mandatory Live Research (Zero Outdated Parametric Assumptions, Exhaustive Reading)**: Model training memory cuts off in 2024; it is obsolete for modern libraries and patterns. Never assume an external API signature, package version, or exported function exists without verifying against workspace manifests, installed types, or live documentation (`search_web`). When asked for best practices, searching, or modern framework patterns, **mandatory live web search is required**—never output outdated 2024 assumptions. Never skim titles or partial headers; read the entire relevant file or module end-to-end. Never regress explicit user-specified dates, years (e.g., 2026), or versions back to stale model training cutoff defaults.

## 2. Mechanical Sympathy & High-Performance Low-Allocation Patterns

* **Allocation Awareness in Hot Paths**:
  * Avoid allocating temporary objects, closures, or intermediate arrays inside hot processing loops. Reuse buffers and pre-allocate fixed-size structures where throughput is critical.
* **Streaming & Backpressure Control**:
  * Process large files, bulk API exports, or continuous network streams using streaming pipelines with explicit backpressure management (`pipe`, `highWaterMark`). Never buffer unbounded data in memory to prevent Out-Of-Memory (OOM) crashes.
* **Temporal & Currency Precision**:
  * Store and compute timestamps in UTC as epoch milliseconds (integer) or ISO-8601 with an explicit `Z`, and serialize one canonical form per API contract. Convert timezones exclusively at the final presentation boundary; never persist local time or an implicit offset.
  * Model currency strictly in integer minor units (e.g., cents as `int64`/`BigInt`) or fixed-point `Decimal`. The use of IEEE-754 floating-point numbers for money calculations is strictly prohibited.
  * Keep `BigInt` off JSON boundaries: `JSON.stringify` throws on it. Serialize money as an integer or a decimal string and parse it back at the edge with an explicit scale.

## 3. Clean Code Mechanics & State Modeling

* **Make Illegal States Unrepresentable**:
  * Model state machines using Discriminated Unions / Sum Types rather than clusters of optional boolean flags or nullable fields. Validate and parse invariants strictly at system boundaries ("Parse, don't validate").
* **Intention-Revealing Naming**:
  * Identifiers must reveal *why* they exist and *what* they represent (`activeSessionCount`, `calculateProratedRefundCents`, `isAuthorizedTenant`). Ban ambiguous abbreviations (`cnt`, `tmp`, `val`, `data2`).
* **Behavioral Contract Inviolability (Zero Test Bypassing / Cheating)**:
  * Unit and integration tests are sacred specifications. When fixing defects or implementing features, production logic must be corrected to satisfy tests. Bypassing or disabling tests via `.skip`, `xit`, deleting assertions, weakening assertions (`expect(true).toBe(true)`), or mocking the system under test to artificially manufacture a passing result is strictly forbidden.
* **Guard Clauses & Flattened Control Flow**:
  * Enforce preconditions, input bounds, and error states at the top of the function and return early. Maintain the primary happy path at the unindented base level (maximum nesting depth: 2–3 levels).
* **Zero Truncated Code**: Never emit placeholder comments like `// ... rest unchanged ...`. Every edit or file must be complete, syntactically valid, and drop-in runnable.
* **Why-Only Comments**:
  * Never write comments that explain *what* the code does. Reserve comments exclusively for *why*: subtle protocol nuances, hardware quirks, concurrency invariants, or explicit `// ponytail: <ceiling and upgrade path>` limits.

## 4. Production Resilience & Observability

* **Structured Logging & Trace Context**:
  * Emit structured JSON logs containing contextual metadata and distributed trace identifiers (`traceId`, `spanId` adhering to W3C Trace Context).
* **Explicit Error Wrapping**:
  * Never swallow errors with empty `catch {}` blocks or ignored returns. Wrap errors with high-signal operational context while preserving the underlying cause chain (`{ cause: err }` in JS/TS, `%w` in Go).
* **Graceful Lifecycle Shutdown**:
  * Implement clean termination handlers on `SIGTERM` and `SIGINT`: reject incoming requests, drain active in-flight operations within a bounded timeout (e.g., 10–30s), close database connection pools and sockets cleanly, then exit.
