# Project Context, Codebase Index & Domain Map

> **Living Codebase Index**: Populate Sections 1–6 by inspecting the actual repository (or running `/index-project` + `node .agents/skills/index-project/scripts/scan-repo.mjs`) before writing code. Never invent paths, components, utilities, or commands—every entry must exist on disk.

---

## 1. Stack, Tooling & Exact Verification Commands

- **Primary Purpose**: _[To be indexed from README / user context]_
- **Languages, Runtimes & Package Manager**: _[e.g., Node 22 / TypeScript, Dart 3.x / Flutter, Go, Python, Rust]_
- **Frameworks & Core Libraries**: _[To be indexed with exact versions from manifest]_
- **UI Kit, Styling & Icon Library**: _[e.g., Tailwind + shadcn/ui, Flutter Material 3 / ThemeData + custom design tokens, N/A]_
- **State, Validation & Data Layer**: _[e.g., Riverpod/BLoC + Freezed, Zod + TanStack Query, SQLx/Prisma/Drift]_
- **Path Aliases & Import Style**: _[e.g., plain relative `./`, `package:<app>/...`, or exact `tsconfig.json` paths]_
- **Verification Commands** (discovered from manifest/CI):
  - Test: `_[exact command, e.g. npm test / flutter test / go test ./... / pytest]_`
  - Static Analysis / Typecheck: `_[exact command, e.g. tsc --noEmit / dart analyze / flutter analyze / N/A]_`
  - Lint: `_[exact command or N/A]_`
  - Build: `_[exact command or N/A]_`

---

## 2. Configurability, Logging & Environment Contract

- **Configuration Entry Point**: _[exact file path where env / `--dart-define` / typed config is parsed & validated at startup]_
- **Required Env / Build Variables** (names only, never values): _[e.g., `DATABASE_URL`, `API_BASE_URL`]_
- **Structured Logger & Redaction Seam**: _[exact logger file/helper + correlation/traceId field convention]_

---

## 3. Repository Topology & Entry Points

| Directory / File | Responsibility | Key Entry Points / Exports | Notes |
| :--- | :--- | :--- | :--- |
| _[e.g., `lib/features/`]_ | _[responsibility]_ | _[exact files]_ | _[routing, conventions]_ |

---

## 4. Shared UI, Design System & Frontend Inventory

> Mark `N/A` if this repository has no UI layer. Inspect this table and search component/widget directories before writing UI code.

- **Design Tokens / Theme Entry**: _[exact path to CSS vars, Tailwind config, or Flutter `ThemeData`/`AppColors`/`AppSpacing`]_
- **Icon Library**: _[package name & import convention]_
- **Layout, Async & Feedback Patterns**: _[toast/snackbar helper, dialog/sheet wrapper, empty/error state widget, router]_

| Component / Widget | File Path | Exported Symbols & Props/Variants | Reuse / Extend Guidance |
| :--- | :--- | :--- | :--- |
| _[e.g., `AppButton`]_ | _[exact path]_ | _[exports/variants]_ | _[all primary/secondary actions]_ |

---

## 5. Shared Utilities, Hooks, API Clients & Schemas

> Search and reuse these canonical helpers instead of writing duplicate utilities or raw HTTP calls.

| Category | File Path | Exported Symbols | Purpose |
| :--- | :--- | :--- | :--- |
| API / HTTP Client | _[exact path]_ | _[exports]_ | _[auth interceptor, timeouts, retries, error mapping]_ |
| Auth / Session / Tenancy | _[exact path]_ | _[exports]_ | _[session extraction, RBAC/tenant guard]_ |
| Validation / Schemas / Models | _[exact path]_ | _[exports]_ | _[boundary parsers, DTO mappers]_ |
| Formatting / Domain Utils | _[exact path]_ | _[exports]_ | _[dates, currency minor units, pagination]_ |
| Shared Hooks / State Holders | _[exact path]_ | _[exports]_ | _[reusable hooks, providers, blocs]_ |

---

## 6. Module Boundaries, Invariants (`INV-###`) & State Machines (`ST-###`)

| Module / Path | Responsibility | Public Seam | Ownership / Auth Boundary | Forbidden Imports |
| :--- | :--- | :--- | :--- | :--- |
| _[module]_ | _[responsibility]_ | _[entry point]_ | _[owner/tenant rule]_ | _[banned dependencies]_ |

| ID | Term / Invariant | Canonical Definition & Falsifiable Rule | Source |
| :--- | :--- | :--- | :--- |
| `INV-001` | _[term/invariant]_ | _[precise falsifiable statement]_ | _[`DEC-###` / `path:line`]_ |

| ID | State Machine | State | Allowed Next States | Forbidden Transitions | Trigger / Guard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ST-001` | _[entity]_ | _[state]_ | _[allowed]_ | _[illegal]_ | _[condition]_ |

---

## 7. Quality Budgets (`NFR-###`) & Error Taxonomy (`ERR-###`)

| ID | Attribute / Condition | Target / Status Code | Measurement / Recovery Behavior | Source |
| :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | _[attribute]_ | _[numeric target + unit]_ | _[measurement + degradation]_ | _[`DEC-###`]_ |
| `ERR-001` | _[failure condition]_ | _[code/status]_ | _[expected recovery]_ | _[`DEC-###`]_ |
