---
trigger: always_on
---

# Architecture, Techstack & Flow Verification Protocol

Operational protocol mandating dynamic techstack discovery, architectural topology mapping, and end-to-end flow tracing before writing, reviewing, or modifying code.

---

## 1. Mandatory Techstack & Toolchain Discovery

An agent must **never guess or assume** the language, framework, dependencies, or conventions of a workspace:

- **Manifest Inspection**: At session start or before touching unfamiliar modules, inspect the workspace manifests:
  - Node / TypeScript: `package.json`, `tsconfig.json` (check dependencies, scripts, package manager).
  - Go: `go.mod` (module path, Go version, external packages).
  - Rust: `Cargo.toml` (package, edition, dependencies, features).
  - Python: `pyproject.toml`, `requirements.txt`, `Pipfile` (packages, frameworks, Python version).
  - Java / Kotlin: `pom.xml`, `build.gradle` (dependencies, frameworks, plugins).
  - PHP: `composer.json` (packages, autoloading).
- **Framework & Runtime Awareness**: Adapt all conventions, naming styles, error handling patterns, and test frameworks strictly to the detected stack.
- **Never Cross-Contaminate**: Do not suggest or write patterns from other ecosystems (e.g. no Node.js idioms in Python, no Python idioms in Go).

---

## 2. Codebase Topology & Dependency Seam Mapping

Before adding or restructuring files, map the repository's architectural structure:

- **Classify Architecture**:
  - **Hexagonal / Clean Architecture** (`domain/`, `ports/`, `adapters/`, `infrastructure/`): Domain entities and use cases must remain 100% pure; they must NEVER import database, HTTP, or infrastructure packages.
  - **Modular Deep-Seam** (`internal/`, `pkg/`, `modules/`, `packages/`): Each module must expose a narrow public interface hiding internal complexity. Callers cross at seams.
  - **Layered MVC** (`controllers/`, `services/`, `models/`, `views/`): Unidirectional flow from controller to service to model. Never query database directly from controllers or views.
- **Dependency Direction & Seam Integrity**:
  - Dependencies must point inward toward the domain or higher-level policy.
  - Ban cyclic dependencies between modules or packages.
  - Evaluate module depth: a module must offer substantial implementation leverage behind a minimal interface. Eliminate shallow pass-through wrappers.

---

## 3. End-to-End Execution & Data Flow Tracing

Never inspect or modify a function in isolation. Trace the complete path of execution and data:

1. **Entry Point**: Where does the action originate? (HTTP route handler, CLI command, event listener, cron job).
2. **Boundary Validation**: Where are inputs validated at the trust boundary? (Zod schema, JSON schema, Pydantic model, Go struct tags, strict assertions).
3. **Application & Domain Logic**: How does data flow through use cases and domain entities? Are state transitions explicit and invariants preserved?
4. **Seams & External Adapters**: Where does the system interact with external resources? (Database queries, HTTP clients, message brokers, filesystem).
5. **Error & Response Propagation**: How are failures handled? Verify that exceptions or error types are handled explicitly and never swallowed.

---

## 4. Agent-Led Semantic Review & Analysis

When acting as a **Reviewer** or **Analyzer**, the agent goes beyond static regexes by evaluating semantic and architectural soundness:

- **Techstack Idioms**: Verify that code adheres to idiomatic practices of the specific stack (e.g., explicit Go `if err != nil`, Rust `Result`/`Option` handling without unchecked `unwrap()`, TypeScript strict null checks without `any` bypass, Python typed hints).
- **Architectural Seam Compliance**: Ensure changes do not break layer boundaries, bypass ports, or introduce architectural friction.
- **Flow Cohesion**: Verify that data transformations are predictable, side effects are contained, and error boundaries prevent data corruption.
- **Production Realism**: Confirm genuine end-to-end integration, real data contracts, and zero dummy/mock placeholders in application files.
