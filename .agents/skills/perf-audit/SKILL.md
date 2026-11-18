---
name: perf-audit
description: Audits application performance budgets (NFR-###) across database query plans (EXPLAIN ANALYZE), N+1 elimination, load/latency benchmarks, bundle size, memory leaks, and UI rendering FPS. Use when validating NFR-### budgets, investigating slow endpoints/queries, or preparing a release.
---

# Performance Audit (`NFR-###` Verification & Profiling)

Verify latency, throughput, memory, query-plan, and UI-rendering budgets (`NFR-###` in `CONTEXT.md` or `specs/<slug>.md`) with real measurements rather than assumptions.

## Decision tree

1. **Are explicit `NFR-###` targets (`p95`/`p99` ms, RPS, bundle KB, FPS, memory cap) defined?**
   - **No** → Stop and establish measurable targets via `/discover` or `ask_question` before benchmarking.
   - **Yes** → Proceed to step 2.
2. **Which performance surface is under audit?**
   - **Database / Query** → Run `EXPLAIN ANALYZE` / `EXPLAIN (ANALYZE, BUFFERS)` and inspect N+1 query counts, sequential scans, and composite index alignment (`(tenant_id, ...)`).
   - **HTTP / Worker / CLI Throughput** → Run a bounded load benchmark (`k6`, `autocannon`, `hey`, `pytest-benchmark`, `go test -bench`) against a staging or local isolated instance.
   - **Frontend / Mobile UI** → Check bundle size (`build` stats), Core Web Vitals (`lighthouse`), React/Vue re-render flamegraphs, or Flutter DevTools frame timing + controller `dispose()` cleanup.

---

## Audit workflow

1. **Baseline & Hot-Path Inspection**:
   - Locate hot loops, unbounded list loads, missing cursor pagination, blocking synchronous CPU work, and per-item DB/HTTP calls inside loops.
2. **Execute Real Measurement**:
   - Capture exact command, dataset size/concurrency, and observed `p50`/`p95`/`p99`, query plan cost, or bundle/memory metrics via `run_command` (or `/browsing` for live web timing).
3. **Remediate & Re-Measure**:
   - Apply batching/joins, covering/composite indexes, cursor pagination, streaming backpressure, `Isolate`/`worker_threads` offload, or list virtualization (`ListView.builder`).
   - Re-run the benchmark and record before/after numbers plus regression test coverage (`NFR-###`).
