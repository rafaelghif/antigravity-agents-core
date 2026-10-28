---
trigger: model_decision
description: "Apply these guidelines whenever writing or reviewing database migrations, SQL queries, or schema changes."
---

# Database & Migration Rules (World-Class Zero-Downtime Engineering)

1. **Lock Timeout Defense (Anti-Starvation)**:
   - Every production DDL migration must explicitly configure defensive lock and statement timeouts (e.g., `SET lock_timeout = '2s'; SET statement_timeout = '30s';`). This prevents queued DDL locks (`ACCESS EXCLUSIVE`) from blocking live OLTP read/write traffic and causing cascading pool exhaustion.
2. **Zero-Downtime Index Operations**:
   - Always create and drop indexes concurrently on live tables (e.g., `CREATE INDEX CONCURRENTLY` in PostgreSQL), and ensure the migration executes **outside of an active transaction block** (`disable_ddl_transaction`).
3. **Non-Blocking Foreign Key Validation**:
   - Never add a foreign key constraint to a large table in a single blocking command. Add the constraint as `NOT VALID` first (takes a momentary lock), then run `VALIDATE CONSTRAINT` in a subsequent step (validates without holding an exclusive table lock).
4. **Expand-Migrate-Contract Pattern**:
   - Never drop, rename, or tighten a column type in a single deployment.
   - **Expand**: Add the new column as nullable or with a non-locking default (`DEFAULT ...` without table rewrite in modern engines).
   - **Migrate**: Enable application dual-writing, backfill existing rows in bounded, cursor-based batches (`WHERE id > $last_id ORDER BY id ASC LIMIT 1000`) with pause intervals to avoid replication lag, and switch readers.
   - **Contract**: Remove legacy columns only after all deployed instances consume the new schema.
5. **No I/O Inside Database Transactions**:
   - Never perform external HTTP calls, third-party API invocations, email dispatches, or slow synchronous operations inside an open database transaction. Keep transactions sub-millisecond to maximize connection pool concurrency and minimize row lock contention.
6. **Index Architecture & Leftmost Prefix Rule**:
   - Design composite indexes matching query filter semantics: equality predicates first, followed by range predicates or sort keys (`WHERE tenant_id = $1 AND created_at > $2` → Index `(tenant_id, created_at)`). Leverage covering indexes (`INCLUDE (col)`) on hot read queries to eliminate table heap fetches.
7. **Strict Parameterization & Tenant Isolation**:
   - Every SQL query must use parameterized statements; string concatenation or interpolation in SQL strings is strictly banned.
   - Every read, update, and delete query in multi-tenant schemas must explicitly filter by the authenticated `tenant_id`.
