---
trigger: always_on
---

# Coding Standards & Quality Guidelines

These rules apply when writing, modifying, or refactoring code in this repository.

---

## 1. Code Quality & Simplicity

- **Simplicity & Readability**: Code must be clear and self-documenting, with intention-revealing naming for variables and functions.
- **Single Responsibility Principle (SRP)**: Each function, module, or class must focus on a single responsibility.
- **Fail Fast & Graceful Handling**: Validate inputs at trust boundaries early and handle errors explicitly. Never swallow exceptions silently.
- **Standard Library First**: Utilize standard library features before reaching for third-party packages or complex abstractions.
- **Production Realism (Zero Dummy/Mock)**: No dummy data, fake responses, mock services, or placeholder constants in production code. Wire genuine implementations end-to-end with real schemas and boundaries.
- **Strict Verification & Zero Assumptions**: Never guess types, schemas, or external APIs; verify against actual codebase files or clarify via `ask_question`. Test fixtures belong exclusively in test directories.

---

## 2. Documentation Integrity

- **Preserve Existing Documentation**: Do not remove functional comments, license banners, or docstrings that remain relevant.
- **Targeted Commentary**: Add comments only for non-obvious rationale, complex domain logic, or edge-case handling.

---

## 3. Tool Usage & File Modifications

- When editing existing files, use targeted replacements on the smallest contiguous code blocks.
- Avoid full-file rewrites when modifying only a few lines.
- Preserve existing formatting, indentation style, and quote conventions.
