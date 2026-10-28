---
trigger: model_decision
description: "Apply these guidelines whenever writing or reviewing database migrations, SQL queries, or schema changes."
---

# Database & Migration Rules

1. Never drop, rename, or tighten the type of an existing column in a single deployment; use an expand-and-contract migration across separate releases.
2. Always add `CONCURRENTLY` (or the target engine's non-blocking equivalent) when creating or dropping indexes on existing tables in production, and ensure the migration runs **outside a transaction block** (e.g., `disable_ddl_transaction` in PostgreSQL).
3. Add new columns as nullable or with non-locking server defaults so running application instances remain compatible during rollout.
4. Always use parameterized queries or prepared statements; never interpolate or concatenate variables into SQL strings.
5. Every migration must include a verified rollback (`down`) path or explicit irreversibility documentation.
6. Never execute external HTTP calls, email dispatch, or unbounded loops inside an open database transaction.
7. Scope every multi-tenant read and write query by both the resource ID and the authenticated `tenant_id`.
