# Project Context, Codebase Index & Domain Map

> **Living Codebase Index**: Populate Sections 1–5 by inspecting the actual repository (or running `/index-project`) before implementing features. Never invent paths, components, utilities, or commands—every entry must match real files on disk.

---

## 1. Stack, Tooling & Exact Verification Commands

- **Primary Purpose**: _[To be indexed from README / user context]_
- **Runtime, Language & Package Manager**: _[To be indexed from package.json / manifests]_
- **Frameworks & Core Libraries**: _[To be indexed with exact versions]_
- **UI Kit, Styling & Icon Library**: _[e.g., Tailwind / shadcn / Radix / MUI / lucide-react / N/A]_
- **Validation, State & Data Fetching**: _[e.g., Zod / React Query / Prisma / Drizzle / N/A]_
- **Path Aliases & Import Style**: _[e.g., plain relative `./` `../`, or exact `tsconfig.json` paths]_
- **Verification Commands**:
  - Test: `_[exact command from manifest]_`
  - Typecheck: `_[exact command or N/A]_`
  - Lint: `_[exact command or N/A]_`
  - Build: `_[exact command or N/A]_`

---

## 2. Repository Topology & Entry Points

| Directory / File | Responsibility | Key Entry Points / Exports | Notes |
| :--- | :--- | :--- | :--- |
| _[e.g., `src/`]_ | _[responsibility]_ | _[exact files]_ | _[routing, conventions]_ |

---

## 3. Shared UI, Design System & Frontend Inventory

> Mark `N/A` if this repository has no UI layer. Before creating any UI component, check this table and search component directories.

- **Design Tokens / Theme / CSS Entry**: _[exact path to CSS variables, Tailwind config, or theme file]_
- **Icon Library**: _[package name & import convention]_
- **Layout & Feedback Patterns**: _[toast/alert helper, modal/dialog pattern, form wrapper, error boundary]_

| Component / Primitive | File Path | Exported Symbols & Variants | When to Reuse / Extend |
| :--- | :--- | :--- | :--- |
| _[e.g., `Button`]_ | _[exact path]_ | _[exports/props]_ | _[all clickable actions]_ |

---

## 4. Shared Utilities, Hooks, API Clients & Schemas

> Before writing a helper, fetcher, formatter, hook, or validation schema, check here first.

| Category | File Path | Exported Symbols | Purpose |
| :--- | :--- | :--- | :--- |
| API / HTTP Client | _[exact path]_ | _[exports]_ | _[auth headers, retries, error normalization]_ |
| Auth / Session / Tenancy | _[exact path]_ | _[exports]_ | _[session extraction, RBAC/tenant guard]_ |
| Validation / Schemas | _[exact path]_ | _[exports]_ | _[shared boundary schemas]_ |
| Formatting / Domain Utils | _[exact path]_ | _[exports]_ | _[dates, currency, pagination]_ |
| Shared Hooks | _[exact path]_ | _[exports]_ | _[reusable state/query hooks]_ |

---

## 5. Module Boundaries & Public Seams

| Module / Path | Responsibility | Public Seam (Entry Point) | Ownership / Auth Boundary | Forbidden Imports |
| :--- | :--- | :--- | :--- | :--- |
| _[module]_ | _[responsibility]_ | _[entry point]_ | _[owner/tenant rule]_ | _[imports banned]_ |

---

## 6. Ubiquitous Language, Invariants & State Machines

| ID | Term / Rule | Canonical Definition & Falsifiable Invariant | Source |
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
