# Industrial Code Review Rubric

Every item marked `🔴` is a release/ticket blocker (`REQUEST CHANGES`):

1. **Specification Fidelity (`🔴 Blocking`)**:
   - All ticket/spec requirements, UI states (`loading`/`empty`/`error`/`disabled`), and edge cases implemented; zero invented behaviors or unverified assumptions.
2. **Credential & Security Hygiene (`🔴 Blocking`)**:
   - Zero hardcoded API keys, tokens, passwords, private keys, or secrets in code/logs/URLs/client binaries.
   - Tenant/owner authorization enforced at query layer; boundary inputs parsed strictly; atomic DB updates/idempotency keys used for mutations.
3. **Configurability & Logging (`🔴 Blocking` / `🟡 Structural`)**:
   - Runtime URLs, timeouts, limits, and flags read from startup-validated config—never scattered hardcoded literals.
   - Lifecycle failures and boundary rejections logged via structured logger with correlation ID and `<REDACTED>` secrets/PII; zero stray `print()`/`console.log()`.
4. **Performance & Resource Disposal (`🔴 Blocking` / `🟡 Structural`)**:
   - Zero N+1 queries, unbounded memory reads, O(n²) nested scans on large collections, blocking heavy work on main/UI thread, or missing `dispose()`/`close()`/`cancel()`.
   - Dynamic UI lists use virtualization (`ListView.builder`, windowing) and proper `const`/memoization boundaries.
5. **Shared UI & DRY (`🔴 Blocking`)**:
   - Reuses/extends existing primitives, widgets, theme tokens, formatters, and API clients (`CONTEXT.md`). Zero parallel component copies or hardcoded colors/styles.
6. **Modularity & Maintainability (`🟡 Structural`)**:
   - Deep modules with narrow DI seams at I/O boundaries; sum types instead of boolean flag clusters; nesting depth ≤ 3; zero `TODO` stubs or dummy data.
7. **Test Integrity (`🔴 Blocking`)**:
   - Real verification command passes (`exit 0`); zero `.skip`/`skip: true`/SUT mocks/tautological assertions; covers happy path, `N-1`/`N`/`N+1`, auth, idempotency, and failure mode.
