# Project Context & Domain Glossary

> **Zero Static Template**: Nothing in this file is pre-defined by dogma. Populate and evolve this file dynamically after interviewing the user (`/grill-me` / `/domain-modeling`) or inspecting the existing workspace.

---

## 1. System Overview & User-Defined Stack

- **Primary Purpose**: _[Defined with user via interview or discovered from repo]_
- **Runtime, Language & Tooling**: _[Defined by user or discovered dynamically from workspace]_
- **Architecture & Folder Topology**: _[Defined by user—never force a static template]_
- **Persistence & Infrastructure**: _[Defined by user or discovered from workspace]_
- **Verification Command**: _[Exact command to run build, lint, typecheck, and tests]_

---

## 2. User-Defined Module Boundaries & Public Seams

| Module / Path | Responsibility | Public Seam (Entry Point) | Dependency Constraints |
| :--- | :--- | :--- | :--- |
| _[Defined by user]_ | _[Core responsibility]_ | _[Public interface / seam]_ | _[What this module must never import]_ |

---

## 3. Ubiquitous Language & Core Invariants

| Term / Entity | Definition | Enforced Invariants |
| :--- | :--- | :--- |
| _[Defined by user]_ | _[Canonical domain meaning]_ | _[State, concurrency, security, or precision invariants]_ |
