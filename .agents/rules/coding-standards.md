---
trigger: model_decision
description: "Core coding standards enforcing DRY, KISS, YAGNI, SOLID/SRP, intention-revealing naming, guard clauses, type-driven state invariants, and fail-fast error handling when authoring or reviewing code."
---

# Coding Standards (World-Class Engineering & Mechanical Sympathy)

## 1. Architectural Foundations (KISS, DRY, YAGNI, SOLID)

* **KISS (Keep It Simple, Stupid)**: Favor flat, linear, obvious control flow over meta-programming, deep class hierarchies, or convoluted abstraction layers. Boring, readable code wins every time in production.
* **DRY (Single Canonical Source of Truth)**: Consolidate domain calculations, validation schemas, and entity invariants in one place. Apply the Rule of Three; never copy-paste business logic across modules.
* **YAGNI (You Aren't Gonna Need It)**: Implement only what current requirements mandate. Reject speculative generic abstractions, unused hook configurations, and premature extension frameworks.
* **SOLID & Deep Modules**: Functions and modules must operate at a uniform level of abstraction with a single reason to change. Design **Deep Modules**—a simple, compact public interface encapsulating rich, robust internal implementation. Eliminate shallow pass-through classes that add cognitive noise without adding leverage.

## 2. Mechanical Sympathy & High-Performance Low-Allocation Patterns

* **Allocation Awareness in Hot Paths**:
  * Avoid allocating temporary objects, closures, or intermediate arrays inside hot processing loops. Reuse buffers and pre-allocate fixed-size structures where throughput is critical.
* **Streaming & Backpressure Control**:
  * Process large files, bulk API exports, or continuous network streams using streaming pipelines with explicit backpressure management (`pipe`, `highWaterMark`). Never buffer unbounded data in memory to prevent Out-Of-Memory (OOM) crashes.
* **Temporal & Currency Precision**:
  * Store, compute, and serialize all timestamps in UTC (`ISO-8601` or epoch timestamps). Convert timezones exclusively at the final presentation boundary.
  * Model currency strictly in integer minor units (e.g., cents using `BigInt` or `int64`) or fixed-point `Decimal`. The use of IEEE-754 floating-point numbers for money calculations is strictly prohibited.

## 3. Clean Code Mechanics & State Modeling

* **Make Illegal States Unrepresentable**:
  * Model state machines using Discriminated Unions / Sum Types rather than clusters of optional boolean flags or nullable fields. Validate and parse invariants strictly at system boundaries ("Parse, don't validate").
* **Intention-Revealing Naming**:
  * Identifiers must reveal *why* they exist and *what* they represent (`activeSessionCount`, `calculateProratedRefundCents`, `isAuthorizedTenant`). Ban ambiguous abbreviations (`cnt`, `tmp`, `val`, `data2`).
* **Guard Clauses & Flattened Control Flow**:
  * Enforce preconditions, input bounds, and error states at the top of the function and return early. Maintain the primary happy path at the unindented base level (maximum nesting depth: 2–3 levels).
* **Why-Only Comments**:
  * Never write comments that explain *what* the code does. Reserve comments exclusively for *why*: subtle protocol nuances, hardware quirks, concurrency invariants, or explicit `// ponytail: <ceiling and upgrade path>` limits.

## 4. Production Resilience & Observability

* **Structured Logging & Trace Context**:
  * Emit structured JSON logs containing contextual metadata and distributed trace identifiers (`traceId`, `spanId` adhering to W3C Trace Context).
* **Explicit Error Wrapping**:
  * Never swallow errors with empty `catch {}` blocks or ignored returns. Wrap errors with high-signal operational context while preserving the underlying cause chain (`{ cause: err }` in JS/TS, `%w` in Go).
* **Graceful Lifecycle Shutdown**:
  * Implement clean termination handlers on `SIGTERM` and `SIGINT`: reject incoming requests, drain active in-flight operations within a bounded timeout (e.g., 10–30s), close database connection pools and sockets cleanly, then exit.
