# Pre-Code Architecture, Scaling & Performance Checklist

Audit every non-trivial design against these 6 dimensions before writing code:

1. **Modularity, Deep Interfaces & Diagrams**:
   - Public interface is smaller than the complexity it hides (validation, normalization, retries, error mapping stay internal).
   - Domain layer imports zero HTTP clients, SQL drivers, or UI frameworks (`flutter/material.dart`, React).
   - Visualize non-trivial component boundaries and cross-service flows with Mermaid `C4Container` / `sequenceDiagram`.
2. **Maintainability & Upgradeability**:
   - Dependency inversion exists strictly at external I/O boundaries (payment provider, storage, HTTP, clock, push notifications) so SDK major upgrades touch 1 adapter file.
   - Zero duplicate helpers, formatters, or UI primitives (`CONTEXT.md` checked first).
3. **Configurability**:
   - Timeouts, retry caps, page sizes, endpoints, and feature flags come from injected typed config validated at startup—zero scattered magic constants.
4. **Performance & Scaling**:
   - **Database**: batch lookups (`WHERE id IN (...)` / joins) instead of per-item queries; composite index matches `WHERE` + `ORDER BY`; cursor pagination instead of deep `OFFSET`.
   - **Memory & Streaming**: stream exports/files instead of buffering unbounded lists; virtualize UI lists (`ListView.builder`, windowing).
   - **Concurrency & Threading**: bound parallel external calls; offload heavy parsing/crypto from main/UI thread (Flutter `Isolate.run`/`compute`, Node worker threads).
   - **Cleanup**: explicit `dispose()`/`close()`/`cancel()` for every controller, stream, timer, and connection pool.
5. **Security & Secret Hygiene**:
   - Tenant/owner checks live inside the repository/query seam (`tenant_id`), never in caller-side `if` checks that another caller might forget.
   - Zero credentials in client code, logs, or URLs.
6. **Observability**:
   - Structured log at entry failure, external dependency failure, and state mutation with `traceId`/correlation ID and `<REDACTED>` secrets.
