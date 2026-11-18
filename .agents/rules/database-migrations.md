---
trigger: glob
globs: "*.sql, **/migrations/**, **/migrate/**, **/prisma/**, **/drizzle/**, **/alembic/**, **/db/**"
description: "Zero-downtime database migration rules: Expand-Migrate-Contract, CONCURRENTLY indexing, lock timeouts, and tenant-safe SQL."
---

# Database & Migration Rules

1. **Defensive Timeouts**: Every production DDL migration must set lock and statement timeouts (e.g., `SET lock_timeout = '2s'; SET statement_timeout = '30s';`) so queued `ACCESS EXCLUSIVE` locks cannot stall live OLTP traffic.
2. **Non-Blocking Index Operations**: Create and drop indexes on live tables using `CREATE INDEX CONCURRENTLY` / `DROP INDEX CONCURRENTLY` **outside** any transaction block (e.g., `disable_ddl_transaction!` in Rails, no `BEGIN`/`COMMIT` wrapper in raw SQL).
3. **Non-Blocking Foreign Keys**: On populated tables, add foreign keys as `NOT VALID` first, then run `ALTER TABLE ... VALIDATE CONSTRAINT` in a separate step.
4. **Expand-Migrate-Contract**: Never drop, rename, or tighten a column type in a single deployment.
   - **Expand**: Add the new column as nullable or with a constant non-volatile `DEFAULT` (volatile defaults like `now()` or `random()` rewrite tables—backfill those separately).
   - **Migrate**: Dual-write in application code, backfill existing rows in cursor-based batches (`WHERE id > $last_id ORDER BY id ASC LIMIT 1000`) with throttling, then switch readers.
   - **Contract**: Drop legacy columns/constraints only after all running instances use the new schema.
5. **No I/O Inside Transactions**: Never perform HTTP requests, webhooks, email dispatches, or unbounded scans inside an open DB transaction.
6. **Composite Index Ordering**: Put equality predicates before range/sort columns (`WHERE tenant_id = $1 AND created_at > $2` → index `(tenant_id, created_at)`). Use covering indexes (`INCLUDE (...)`) on hot read paths where appropriate.
7. **Strict Parameterization & Tenancy**: Use parameterized queries exclusively (zero SQL string interpolation). Every read/update/delete on multi-tenant tables must filter by the authenticated `tenant_id`.
