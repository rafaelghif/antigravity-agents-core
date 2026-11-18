---
name: index-project
description: Scans and indexes any multi-language repository (Node/TS, Dart/Flutter, Go, Python, Rust, JVM, Swift) into CONTEXT.md with verified stack versions, config/logging seams, verification commands, shared UI primitives/widgets, design tokens, utilities, and module boundaries. Use when starting on an unindexed repo, when CONTEXT.md is still a template, or after structural changes.
---

# Index Project (Multi-Language Codebase Reconnaissance)

Populate `CONTEXT.md` strictly with verified file paths, exported symbols, config/logging seams, and runnable commands so downstream planning and coding never guess or duplicate existing code.

## Decision tree

1. **Does `CONTEXT.md` already have verified, non-template entries matching current manifests?**
   - **Yes (and no major refactor occurred)** → Read `CONTEXT.md` and spot-check only the directories touched by the current task.
   - **No (template placeholders or stale paths)** → Run the indexing workflow below.
2. **Is the codebase large (>100 source files)?**
   - **Yes** → Run the black-box scanner script first, then delegate deep symbol extraction to `codebase-investigator` via `invoke_subagent`, and verify key files with `read_file`.
   - **No** → Run the black-box scanner script, then read key manifests/primitives directly.

## Indexing workflow

1. **Run the Black-Box Scanner First**:
   - Inspect script options via `--help`, then execute:
     ```bash
     node .agents/skills/index-project/scripts/scan-repo.mjs --help
     node .agents/skills/index-project/scripts/scan-repo.mjs
     ```
2. **Verify Manifests, Config & Logging Seams**:
   - Read the detected manifests (`package.json`, `pubspec.yaml`, `go.mod`, `Cargo.toml`, `pyproject.toml`, `tsconfig.json`, `analysis_options.yaml`).
   - Locate and read the startup configuration module (`.env` loader, `--dart-define` / config class) and structured logger helper.
3. **Inspect Shared UI / Widgets & Design Tokens (or mark `N/A`)**:
   - Read barrel files, shared widget/component folders (`components/`, `widgets/`, `ui/`, `shared/`), and theme/token files (`ThemeData`, `AppColors`, `tailwind.config.*`, `globals.css`).
   - Record **exact file paths, exported symbols, and key props/variants**.
4. **Inspect Shared Utilities, API Clients, Schemas & State Holders**:
   - Read existing HTTP/API clients, auth/session guards, boundary validators, formatters, and shared hooks/providers/BLoCs.
5. **Write `CONTEXT.md` (and Optional Hub+Spoke Domain Files) & Verify Every Path**:
   - Populate Sections 1–5 of `CONTEXT.md` using only observed paths/symbols; preserve domain invariants in Sections 6–7.
   - When `scan-repo.mjs` reports `layoutMode: hub-and-spoke` (`> 1` workspace or `> 100` files), keep `CONTEXT.md` concise as the **Index Hub** (linking per-workspace/domain spokes at `docs/domains/<domain>.md`) so root context stays token-efficient. Single-package repos keep `single-context` inside `CONTEXT.md`.
   - Confirm every file path cited in `CONTEXT.md` exists on disk.
