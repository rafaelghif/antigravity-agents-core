---
name: database-migration
description: Plans and executes zero-downtime Expand-Migrate-Contract database schema and API contract migrations with rollback verification. Use when adding or modifying database tables, columns, indexes, or versioned API schemas.
---

# Database Migration

Evolve database schemas and external contracts without downtime or data loss using the **Expand → Migrate → Contract** workflow.

## Decision tree

1. **Is the database engine and migration tool known from workspace manifests?**
   - **No** → Pause and call `ask_question` to confirm the database stack before generating migrations.
   - **Yes** → Proceed to step 2.
2. **Is the migration purely additive (new table, new nullable column, or new index)?**
   - **Yes** → Execute **Step 1 (Expand)** and **Step 4 (Verify Rollback)**.
   - **No (renaming, splitting, changing types, or dropping columns)** → Execute all 4 steps below across separate deployments.

## Migration workflow

1. **Expand (Backwards-compatible addition)**:
   - Add new columns as nullable (or with safe defaults) so running application instances continue to operate without error.
   - Create indexes non-blockingly on large tables (e.g., `CREATE INDEX CONCURRENTLY`).
2. **Dual-write & idempotent backfill**:
   - Update writers to write both old and new columns within the same transaction.
   - Backfill existing rows idempotently in bounded batches.
   - Switch readers to read from the new column (with fallback to the old column).
3. **Contract (Cleanup)**:
   - After all readers and writers use the new column exclusively, remove the legacy column in a separate follow-up migration.
4. **Verify forward and rollback paths**:
   - Apply the migration (`up`), test rollback (`down`), re-apply (`up`), and run integration tests via `run_command`.
