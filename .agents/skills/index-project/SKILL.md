---
name: index-project
description: Scans and indexes a repository into CONTEXT.md with verified stack versions, verification commands, directory topology, shared UI primitives, design tokens, utilities, hooks, API clients, and module boundaries. Use when starting work on an unindexed repo, when CONTEXT.md is still a template, or after major structural changes.
---

# Index Project (Codebase Reconnaissance & Context Map)

Build an accurate, file-grounded index in `CONTEXT.md` so downstream discovery, specs, tickets, and implementation never guess existing paths, UI primitives, or utilities.

## Decision tree

1. **Does `CONTEXT.md` already contain verified, non-template repo paths matching current manifests?**
   - **Yes (and no major refactor occurred)** → Spot-check target directories for the current task rather than re-indexing everything.
   - **No (empty template, missing file, or stale index)** → Execute the 5-step indexing workflow below.
2. **Is the repository large (>100 source files)?**
   - **Yes** → Delegate initial file discovery to `codebase-investigator` via `invoke_subagent`, then read key manifests/barrels directly before writing `CONTEXT.md`.
   - **No** → Inspect directly using `read_file` and `run_command` (`find` / `rg`).

## Indexing workflow

1. **Read Manifests & Configs**:
   - Locate and read `package.json`, `tsconfig.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, or framework configs (`next.config.*`, `vite.config.*`, `tailwind.config.*`).
   - Extract **exact** test, typecheck, lint, and build scripts, installed UI/validation/state/ORM dependencies, and configured path aliases (or confirm plain relative imports).
2. **Map Directory Topology**:
   - Run a depth-limited listing (`find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*'`) via `run_command`.
   - Identify entry points (routes, pages, API handlers, CLI bins, services).
3. **Catalog Shared UI & Design System (if UI exists; otherwise mark `N/A`)**:
   - Inspect `components/`, `ui/`, `shared/`, `design-system/`, `styles/`, `theme/`.
   - Read barrel files (`index.ts`) and core primitive files (`Button`, `Input`, `Dialog`/`Modal`, `Table`, `Card`, `Select`, `Toast`) to record **exact file paths, exported symbols, and key variants/props**.
   - Record design token files (Tailwind theme, CSS variables) and icon library import pattern.
4. **Catalog Shared Utilities, Hooks, API Clients & Schemas**:
   - Inspect `lib/`, `utils/`, `helpers/`, `hooks/`, `api/`, `services/`, `schemas/`, `types/`.
   - Read shared files to record exact reusable exports (HTTP client, auth/session extractor, tenant guard, formatters, validation schemas, error classes).
5. **Write `CONTEXT.md` & Verify Paths**:
   - Populate Sections 1–5 of `CONTEXT.md` using only paths and symbols observed in tool output. Preserve existing domain invariants (`INV-###`, `ST-###`, `NFR-###`, `ERR-###`) in Sections 6–7.
   - Verify every path cited in `CONTEXT.md` exists on disk. Never copy illustrative examples or invent missing sections (mark absent layers `N/A`).
