---
name: to-spec
description: Synthesizes conversation context and codebase understanding into a production-grade Product Requirement Document (PRD) and technical specification with state machines, data contracts, test seams, and NFRs. Use when the user asks to write a spec, PRD, turn ideas into a spec, or document a feature specification.
---

# Production PRD & Technical Specification Protocol

Synthesizes conversation context, user requirements, and repository topology into an exhaustive, world-class Product Requirement Document (PRD) and Technical Specification. Delivers unambiguous clarity across domain logic, state transitions, data contracts, and non-functional requirements.

---

## 1. Core Principles

- **Zero Assumptions**: Never guess missing requirements or API contracts. If behavior, constraints, or schemas are undefined, stop and clarify via `ask_question` or `/grill-me`.
- **Make Illegal States Unrepresentable**: Model domain states, transitions, and invariants explicitly with state machines.
- **Contract-First & Testable**: Every requirement must specify concrete Given-When-Then acceptance criteria verifiable at public seams.
- **Bounded Scope (Strict Anti-Scope)**: Define what is explicitly out-of-scope to protect against scope creep.

---

## 2. Specification Workflow

1. **Techstack & Topology Inspection**:
   - Inspect workspace manifests (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, etc.) per [architecture-and-flow.md](../../rules/architecture-and-flow.md).
   - Use existing domain glossary from [CONTEXT.md](../../../CONTEXT.md) and adhere to recorded ADRs in [docs/adr/](../../../docs/adr).
2. **Identify Public Test Seams**:
   - Locate existing seams (HTTP routes, CLI entrypoints, service interfaces, event listeners).
   - Prefer existing seams over introducing artificial test points.
3. **Draft the Specification**:
   - Follow the World-Class PRD Template below.
4. **Publish & Track**:
   - Write spec to `specs/<feature-slug>.md` or publish to the configured issue tracker with the `ready-for-agent` label.

---

## 3. World-Class PRD & Spec Template

```markdown
# PRD: <Feature Title>

## 1. Executive Summary & Problem Statement
- **Problem**: What real customer or system friction exists? State from user/client perspective.
- **Impact & Value**: Why solve this now? What baseline metric or user workflow improves?
- **Success Criteria**: Measurable outcomes (e.g. reduction in errors, capability unlocked).

## 2. User Personas & User Journeys
- **Primary Personas**: Who interacts with this capability? (e.g., API Consumer, Admin, End User).
- **Core Workflow**: Step-by-step path from intent to completion.

## 3. Scope & Explicit Non-Goals
- **In-Scope**: Hard boundaries of functionality delivered in this release.
- **Explicit Non-Goals (Out of Scope)**: Related capabilities deliberately deferred or excluded to avoid scope creep.

## 4. Functional Requirements & Acceptance Criteria
Numbered user stories accompanied by executable Given/When/Then acceptance criteria:

### Story 1: <User Story Title>
**As an** <actor>, **I want** <capability>, **so that** <benefit>.

#### Acceptance Criteria
- **Scenario 1 (Happy Path)**:
  - **Given** <initial state/precondition>
  - **When** <action or event occurs>
  - **Then** <expected outcome and state change>
- **Scenario 2 (Edge Case / Failure)**:
  - **Given** <boundary condition or invalid input>
  - **When** <action occurs>
  - **Then** <fail-fast error response, zero side effects>

## 5. Non-Functional Requirements (NFRs)
- **Performance & Latency**: p95/p99 latency budget (e.g., < 50ms for query, < 200ms for mutation).
- **Throughput & Concurrency**: Expected load (RPS), race condition handling, optimistic locking.
- **Availability & Resilience**: Graceful degradation, timeout policies, idempotency key requirement for mutations.
- **Security & Privacy**: Authentication, authorization, input validation boundaries, zero leaked credentials.

## 6. Domain Model & State Transitions
- **Domain Entities & Value Objects**: Real types and business invariants.
- **State Machine**:
  ```mermaid
  stateDiagram-v2
      [*] --> Pending
      Pending --> InProgress: Start Processing
      InProgress --> Completed: Success
      InProgress --> Failed: Error / Timeout
      Failed --> Retrying: Backoff Policy
      Retrying --> InProgress: Retry Triggered
      Retrying --> DeadLetter: Max Retries Exceeded
      Completed --> [*]
      DeadLetter --> [*]
  ```
- **Invalid Transitions**: Explicitly list states that cannot transition to each other (e.g., `Completed -> InProgress` forbidden).

## 7. Data Contracts & Schema Definitions
- **API Payloads**: Strong schemas (JSON Schema / Zod / Protobuf / Go struct definitions).
- **Database / Storage**: Exact table migrations, indexes, foreign keys, or key-value structures.
- **Event Contracts**: Event topic names, payload shapes, and idempotency guarantees.

## 8. Error Handling & Failure Modes
| Error Condition | Error Code | HTTP Status | User Message / Action | Retryable? |
| :--- | :--- | :--- | :--- | :--- |
| Invalid Payload | `ERR_VALIDATION` | `400` | Input validation failed with field errors | No |
| Entity Not Found | `ERR_NOT_FOUND` | `404` | Requested resource does not exist | No |
| Concurrency Conflict | `ERR_CONFLICT` | `409` | Version mismatch, retry operation | Yes |
| Downstream Timeout | `ERR_UPSTREAM_TIMEOUT` | `504` | Upstream service did not respond in time | Yes (Backoff) |

## 9. Telemetry & Observability
- **Structured Logs**: Key log events (e.g., `order.created`, `order.failed`) with correlation IDs.
- **Metrics**: Counters, gauges, histograms (e.g., `operation_duration_seconds`, `error_rate`).
- **Audit Logging**: Traceability for sensitive actions or financial transactions.

## 10. Public Test Seams & Verification Plan
- **Primary Seam**: Exact interface under test (e.g., HTTP route handler, service method).
- **Automated Verification Command**: Exact command to prove correctness (`npm test`, `go test ./...`, `pytest`).
- **Boundary Verification**: Edge cases (empty payload, zero values, network drop, concurrent writes).
```
