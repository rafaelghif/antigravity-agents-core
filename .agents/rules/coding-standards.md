---
trigger: always_on
---

# World-Class Coding Standards & Craftsmanship Protocol

Universal software engineering and craftsmanship protocol defining standards for clean code, DRY architecture, human readability, and test-backed production realism.

---

## 1. Human-Readable & Self-Documenting Code

Code is read far more often than it is written. Optimize relentlessly for human comprehension, cognitive locality, and maintainability:

- **Intention-Revealing Naming**:
  - Variable, function, class, and type names must explicitly state *why* they exist and *what* they represent.
  - Ban cryptic abbreviations, acronym soup, and single-letter identifiers (e.g., use `activeUserSession` instead of `aus`, `invoiceItemCount` instead of `cnt`, `retryAttemptIndex` instead of `i`).
  - Functions must be verb-noun pairs revealing side effects and return values (`validateCheckoutPayload`, `calculateNetPrice`, `isUserAuthorized`).
  - Booleans must read like questions (`isEnabled`, `hasExpired`, `shouldRetry`).
- **Guard Clauses & Flattened Control Flow**:
  - Check failure conditions, edge cases, and invalid inputs early at the top of the function and return immediately (Fail Fast).
  - Keep the primary "happy path" unindented at the base function level.
  - Ban deep nested control structures (maximum nesting depth: 2 to 3 levels).
- **Explanatory Variables over Dense Expressions**:
  - Break complex conditional expressions, regex evaluations, or mathematical calculations into named boolean variables that explain the business logic:
    ```javascript
    // Good: Intent is crystal clear
    const isEligibleForFreeShipping = cart.totalPrice >= 50 && user.hasActiveMembership;
    const isDeliveryAddressDomestic = order.destinationCountry === store.originCountry;
    if (isEligibleForFreeShipping && isDeliveryAddressDomestic) {
      applyFreeShipping(order);
    }
    ```
- **Focused Scope & Cognitive Locality (SRP)**:
  - Every function must perform one single logical task at a consistent level of abstraction.
  - Keep functions concise (typically 20–40 lines). If a function requires scrolling or mental juggling of multiple invariants, decompose it into private pure helpers.
- **Documentation Rationale**:
  - Do not write comments stating *what* the code visibly does.
  - Write targeted comments explaining *why*: non-obvious business invariants, architectural constraints, protocol quirks, or performance trade-offs.

---

## 2. Strict DRY (Don't Repeat Yourself) & Reuse First

Duplication creates multiple vectors for synchronization bugs and maintenance friction:

- **Single Source of Truth**:
  - Validation schemas, domain constants, calculation algorithms, and API payload definitions must be defined exactly once and shared.
  - Never copy-paste business logic between files or services.
- **Reuse Hierarchy (Ponytail Principle)**:
  1. Inspect existing codebase utilities and patterns before writing new code (`git grep`, search existing modules).
  2. Leverage the standard library before adding custom utility functions.
  3. Extract pure, stateless helpers when identical logic shape appears in 2 or more call sites.
- **Centralize Magic Values**:
  - Magic strings, timeout thresholds, HTTP status codes, and configuration constants must be placed in typed enumerations or shared constant modules.

---

## 3. Mandatory Automated Testing & Verification Discipline

Unverified code is considered incomplete and broken by default. Every non-trivial change must leave behind automated regression proof:

- **Behavior-Driven Public Seam Testing**:
  - Test behavior through public interfaces and contracts, never by asserting private implementation details or mocking internal helpers.
  - Tests must read like executable specifications: describe the scenario and expected outcome clearly (`should calculate tiered discount when order exceeds threshold`).
- **Table-Driven & Edge-Case Coverage**:
  - Always verify boundary conditions:
    - Empty collections, null/undefined/nil inputs, zero values.
    - Out-of-bounds inputs, negative numbers, overflow boundaries.
    - Network timeout, external service rejection, invalid payload shapes.
- **Hermetic & Deterministic Tests**:
  - Unit tests must be fast, completely independent, and free of side effects.
  - Never depend on execution order or shared mutable global state.
  - Segregate test doubles, fixtures, and synthetic data exclusively to dedicated test files (`*.test.*`, `*.spec.*`, `tests/fixtures/`). Never allow test mocks in production code.
- **Red-Green Verification Loop**:
  - Execute automated tests via `run_command` and confirm passes before declaring work complete. Never assume a change works without automated test proof.

---

## 4. Fail-Fast Boundaries & Graceful Error Handling

- **Boundary Validation**:
  - Validate all external inputs at the trust boundary (HTTP payloads, CLI arguments, database reads, environment variables).
  - Parse and validate into strong domain types immediately before passing to internal application layers.
- **Explicit Error Propagation**:
  - Never swallow exceptions silently with empty `catch` blocks or unlogged ignores.
  - Return descriptive, actionable errors indicating root cause and remediation.
  - Preserve error causal chains (error wrapping in Go `fmt.Errorf("...: %w", err)`, Java/TS error causes `new Error("...", { cause: err })`).

---

## 5. Architectural Depth & Minimal Surface

- **Deep Modules**:
  - Design modules with substantial internal implementation leverage behind a minimal, simple public interface.
  - Eliminate shallow pass-through classes and wrappers that do nothing except delegate calls.
- **Strict Dependency Direction**:
  - Core domain logic and business entities must remain 100% pure and independent of database schemas, HTTP frameworks, or cloud SDKs.
