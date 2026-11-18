# Design It Twice Example (Multi-Stack Reference)

> Illustrative pattern only—always adapt to the repository's actual language and architecture.

## Problem
Implement an offline-tolerant order sync + list view without UI jank, N+1 calls, or tight SDK coupling.

## Comparison

| Dimension | Design A (Shallow Wrapper) | Design B (Deep Module + Narrow Seam — Chosen) |
| :--- | :--- | :--- |
| **Public Seam** | Exposes raw HTTP client, cache DB, retry helper, and mapping helper separately to UI/viewmodels. | Exposes one `OrderRepository` seam (`watchOrders(cursor)`, `syncPending(idempotencyKey)`). |
| **Modularity / Upgradeability** | Swapping HTTP client or local DB (e.g. Drift/SQLite) forces edits across every caller. | HTTP + local DB adapters sit behind `OrderRemoteSource` / `OrderLocalStore` interfaces; domain/UI never imports Dio/SQLite. |
| **Performance** | Fetches full order list, parses JSON on UI thread, rebuilds entire `ListView`. | Cursor-paginated queries, JSON decoded in `Isolate.run` / worker, UI renders `ListView.builder` with `const` item widgets. |
| **Config & Logging** | Hardcoded `https://api...` and `timeout: 5000`; `print(err)`. | Injected `AppConfig` (`apiBaseUrl`, `syncTimeoutMs`, `maxRetries`) + structured logger with `traceId` and `<REDACTED>` tokens. |
| **Failure / Concurrency** | Concurrent button taps trigger duplicate POSTs. | In-flight guard + atomic idempotency key + bounded exponential backoff with jitter. |

**Verdict**: **Design B** hides retry, isolation, caching, and pagination behind a 2-method seam, making upgrades local and testing deterministic without mocking the UI or repository core.
