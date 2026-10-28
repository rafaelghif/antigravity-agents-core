# Spec: <Feature Title>

## 1. Problem & Goal
- **Problem**: Concrete user or system problem being solved.
- **Goal**: Observable capability unlocked when this spec is complete.

## 2. Out of Scope (Explicit Non-Goals)
- List concrete features, edge cases, or abstractions deliberately refused during grilling to prevent scope creep.

## 3. Domain Model & State Transitions
- **Entities & Value Objects**: Exact domain types using `CONTEXT.md` vocabulary.
- **State Machine / Invariants**: Valid states, allowed transitions, and forbidden transitions (making illegal states unrepresentable).

## 4. Data & Interface Contracts
- **API / Entry Signatures**: Request/response schemas or function signatures.
- **Persistence / Schema**: Tables, columns, constraints, and indexes.
- **Security & Concurrency**: Tenant/owner authorization checks, idempotency keys, and locking strategy.

## 5. Error & Failure Modes
| Condition | Error Code / Status | Expected Behavior & Recovery |
| :--- | :--- | :--- |
| Invalid input | `400` / Validation Error | Fail fast at boundary; zero state mutation |
| Unauthorized tenant | `403` / `404` | Reject query; zero data leakage |
| Concurrent conflict | `409` / Retryable | Atomic optimistic lock rejection |

## 6. Public Test Seams & Acceptance Criteria
- **Primary Seams**: Exact public interfaces where tests will assert behavior.
- **Verification Command**: `<exact test command>`
- **Acceptance Scenarios**:
  - **Given** `<precondition>`, **when** `<action>`, **then** `<expected outcome>`.
