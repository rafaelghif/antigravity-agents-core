---
trigger: always_on
---

# Production Integrity & Zero-Assumption Protocol

Operational protocol prohibiting hallucinations, silent assumptions, dummy implementations, and mock artifacts in production code.

---

## 1. Zero Assumptions & Explicit Clarification Mandate (Ask First, Never Guess)

Gemini Flash has a known tendency to rush into code generation by fabricating missing schemas and filling gaps with fake data. This creates throwaway "trash code". To eliminate this, the agent must strictly execute the **Clarification-Before-Code Protocol**:

- **Hard Mandate to Pause and Ask**:
  - Before scaffolding or implementing any feature, backend service, database layer, or API contract, you MUST verify that requirements are complete.
  - You are **STRICTLY FORBIDDEN** from generating code and MUST call `ask_question` whenever:
    1. The database technology (PostgreSQL, MySQL, SQLite, MongoDB, etc.) is unstated.
    2. Data model entities, fields, relationships, or table schemas are unstated.
    3. Authentication, authorization, or session mechanisms are unstated.
    4. External API endpoints, contracts, or credentials are unstated.
    5. Business logic rules, calculations, or status workflows are ambiguous.
- **Source of Truth Order**:
  1. Explicit user prompt & conversation instructions.
  2. Workspace codebase, existing manifests, schemas, migrations, tests, and configuration files.
  3. Verified primary documentation and official references.
- **Mandatory Clarification Action**:
  - When information is missing from the above sources, you MUST STOP immediately.
  - Call the native `ask_question` tool with structured, concrete multi-choice options or recommendations.
  - Recommend `/grill-me` ([grilling/SKILL.md](../skills/grilling/SKILL.md)) for large, complex architectural decisions.
  - Never proceed with code changes based on an unverified guess or speculative default.

---

## 2. Zero Dummy, Fake, or Mock Policy (Strict Production Realism)

- **Strict Ban on Fakes in Production Code**:
  - Strictly forbidden to introduce fake data, mock responses, placeholder stubs, dummy objects, or simulated business logic into production/application code (`src/`, `lib/`, `app/`, etc.).
  - **Banned Simulated In-Memory Stores**:
    - Strictly forbidden to create in-memory arrays (`const mockUsers = []`, `let fakeDb = []`, `inMemoryStore = {}`) as a fake substitute for a database.
    - If a database is required, wire a REAL database driver (`pg`, `mysql2`, `prisma`, `typeorm`, `sqlite3`, etc.) reading connection parameters from environment variables (`process.env.DATABASE_URL`), generate a `.env.example`, and fail fast if unconfigured. Never simulate state in memory.
  - Prohibited patterns in production files:
    - Dummy identifiers or credentials (`"dummy_id"`, `"fake-token"`, `"mock_secret"`).
    - Hardcoded stub returns (e.g., `return [{ id: 1, name: "dummy" }]`, `return { status: "fake" }`, `return "not implemented"`).
    - Simulated delay/network calls (`setTimeout(..., 1000) // simulate DB`).
    - Placeholder comments masking incomplete work (`// TODO: implement later`, `/* dummy stub */`, `// fake implementation for now`).
    - Mock classes or simulated adapters (`class MockService`, `class FakeRepository`).
- **World-Class Engineering Realism**:
  - Every feature, module, or function must be genuine, production-grade, and wired end-to-end.
  - All data types, schemas, and API contracts must reflect actual production schemas.
  - Input boundaries must perform genuine validation (e.g., Zod, JSON schema, or strict type assertions).
  - Error boundaries must handle real failure modes gracefully and transparently—never swallow errors or return fake success.
- **Missing External Services or Credentials**:
  - If a feature requires an external service, database, or API key that is not configured, DO NOT create a dummy mock in application code that fakes a working state.
  - Instead, fail fast at initialization with a descriptive error indicating missing configuration, provide the `.env.example` entry, and ask the user for configuration details.

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
