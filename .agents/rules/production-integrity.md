---
trigger: always_on
---

# Production Integrity & Zero-Assumption Protocol

Operational protocol prohibiting hallucinations, silent assumptions, dummy implementations, and mock artifacts in production code.

---

## 1. Zero Assumptions & Explicit Clarification Mandate

- **Never Assume or Speculate**:
  - Never guess, extrapolate, or invent missing requirements, architectural designs, API endpoints, payload schemas, domain entities, configuration keys, or user intentions.
  - If any requirement, interface, contract, or behavior is ambiguous or unstated, **STOP IMMEDIATELY**.
- **Source of Truth Order**:
  1. Explicit user prompt & conversation instructions.
  2. Workspace codebase, existing schemas, tests, and configuration files.
  3. Verified primary documentation and official references.
- **Mandatory Clarification Action**:
  - When information is missing from the above sources, you MUST ask the user.
  - Use the native `ask_question` tool for structured questions or choices.
  - When planning or exploring complex design decisions, activate or recommend `/grill-me` ([grilling/SKILL.md](file:///D:/Project/antigravity-agents/.agents/skills/grilling/SKILL.md)) to explore the design tree round-by-round.
  - Never proceed with code changes based on an unverified guess.

---

## 2. Zero Dummy, Fake, or Mock Policy (Production Realism)

- **Strict Ban on Fakes in Production Code**:
  - Strictly forbidden to introduce fake data, mock responses, placeholder stubs, dummy objects, or simulated business logic into production/application code (`src/`, `lib/`, `app/`, etc.).
  - Prohibited patterns in production files:
    - Dummy identifiers or credentials (e.g., `"dummy_id"`, `"fake-token"`, `"mock_secret"`).
    - Hardcoded stub returns (e.g., `return { status: "fake", data: [] }`, `return "not implemented"`).
    - Placeholder comments masking incomplete work (e.g., `// TODO: implement later`, `/* dummy stub */`).
    - Fabricated API responses or mock database adapters masking missing backend integrations.
- **World-Class Engineering Realism**:
  - Every feature, module, or function must be genuine, production-grade, and wired end-to-end.
  - All data types, schemas, and API contracts must reflect actual production schemas.
  - Input boundaries must perform genuine validation (e.g., Zod, JSON schema, or strict type assertions).
  - Error boundaries must handle real failure modes gracefully and transparently—never swallow errors or return fake success.
- **Missing External Services or Credentials**:
  - If a feature requires an external service, database, or API key that is not configured, DO NOT create a dummy mock in application code that fakes a working state.
  - Instead, fail fast with a descriptive error indicating missing configuration, or ask the user for configuration details.

---

## 3. Test Fixture Isolation

- **Test Doubles Restricted to Test Suites**:
  - Mocks, stubs, spies, and synthetic fixtures are permitted ONLY inside dedicated test files (`*.test.*`, `*.spec.*`) or test utility folders (`tests/fixtures/`, `__mocks__/`).
  - Production code must never import, contain, or depend on test mocks, fake data, or test-only stubs.
  - Verification must run against real unit/integration tests without modifying production behavior to pass tests artificially.

---

## 4. Verification & Defense Against Hallucination

- **Fact Checking Before Execution**:
  - Always verify that files, functions, variables, package exports, and CLI arguments actually exist before referencing or calling them.
  - Use `view_file` or `run_command` to inspect real file contents and signatures.
- **Verification Protocol**:
  - Run real builds, type checks, and tests via `run_command` to confirm changes work.
  - Never report that a task is complete or working without executing automated verification.
