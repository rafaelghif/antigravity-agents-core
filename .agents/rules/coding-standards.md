---
trigger: always_on
description: "Core coding standards enforcing DRY, KISS, YAGNI, SOLID/SRP, intention-revealing naming, guard clauses, type-driven state invariants, and fail-fast error handling."
---

# Coding Standards (DRY, KISS, YAGNI, SOLID & Clean Code)

## 1. Core Engineering Principles

* **KISS (Keep It Simple, Stupid)**: Prefer flat, linear, obvious control flow over clever meta-programming, deep inheritance hierarchies, or nested ternaries. Boring, readable code wins.
* **DRY (Don't Repeat Yourself — Single Source of Truth)**: Define validation schemas, domain constants, business formulas, and contracts in one canonical place. Apply the **Rule of Three** (or extract when identical domain formulas appear in 2+ substantive call sites); never copy-paste business rules across files.
* **YAGNI (You Aren't Gonna Need It)**: Implement only what the current specification requires. Ban speculative generics, unused configuration parameters, and unrequested wrapper abstractions.
* **SOLID & Single Responsibility (SRP)**: Each function and module must have a single reason to change and operate at a uniform level of abstraction (use ~15–40 lines as a cognitive-load guideline, without artificially splitting cohesive deep modules). Prefer composition and small interfaces over class inheritance.

## 2. Clean Code Mechanics (Tata Cara Penulisan Kode)

* **Intention-Revealing Naming**:
  * Variables and types must state *what* they hold and *why* they exist (`activeSessionCount`, `retryAttemptIndex`, `invoiceTotalCents`). Ban cryptic abbreviations (`cnt`, `tmp`, `val`, `obj`, `data2`).
  * Functions must use verb-noun phrasing revealing behavior or return semantics (`parseWebhookSignature`, `calculateProratedRefund`).
  * Booleans must read as affirmative predicates (`isAuthorized`, `hasExpired`, `shouldRetry`).
* **Guard Clauses & Flattened Control Flow**:
  * Validate preconditions, edge cases, and failure states at the top of the function and return early (Fail Fast).
  * Keep the primary happy path unindented at the base level. Maximum nesting depth: **2–3 levels**.
* **Explanatory Variables**:
  * Extract complex boolean expressions, bitwise checks, or regular expressions into named intermediate variables that explain the business rule.
* **Why-Only Comments**:
  * Never write comments describing *what* the code visibly does. Write comments only to explain *why*: non-obvious business invariants, protocol quirks, concurrency ordering, or `// ponytail:` scaling ceilings and upgrade paths.

## 3. Type-Driven State, Precision & Error Handling

* **Make Illegal States Unrepresentable**:
  * Model mutually exclusive lifecycles with Discriminated Unions / Sum Types (`type OrderState = { status: 'draft' } | { status: 'paid'; paidAt: Date; txId: string }`) instead of nullable field bags or boolean flag clusters (`isPending`, `isPaid`, `isFailed`).
  * Enforce invariants inside constructors or boundary parsers ("Parse, don't validate").
* **Temporal & Monetary Precision**:
  * Store and compute all timestamps in UTC (`ISO-8601` / UTC epoch); convert timezones only at presentation boundaries.
  * Represent currency in integer minor units (`BigInt` / `int64` cents in memory/DB, serialized as integer/string at JSON API boundaries) or fixed-point `Decimal`—never IEEE-754 floats.
* **Explicit Error Propagation & Resource Cleanup**:
  * Never swallow errors with empty `catch {}` blocks or ignored returns (`_ = err`). Wrap errors with operational context while preserving the causal chain (`%w` or `{ cause: err }`).
  * Bound all external I/O with explicit timeouts and guarantee resource cleanup (`defer`, `try/finally`, `using`, RAII).
