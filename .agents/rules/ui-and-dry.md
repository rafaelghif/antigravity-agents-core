---
trigger: glob
globs: "*.tsx, *.jsx, *.vue, *.svelte, *.astro, *.html, *.css, *.scss, **/components/**, **/ui/**, **/app/**, **/pages/**"
description: "Shared UI reuse, design-token discipline, DRY component composition, mandatory UI state matrices, and frontend anti-duplication gates."
---

# UI, Shared Components & Frontend DRY Rules

## 1. Mandatory Pre-UI Discovery Gate (Run Before Writing JSX/CSS)

Before creating or modifying any UI component, page, or stylesheet:
1. Read `CONTEXT.md` §3–4 (if populated) and `package.json` to identify the active UI kit, styling system, icon library, form library, and data-fetching client.
2. Search existing UI and helper directories (`components/`, `ui/`, `shared/`, `design-system/`, `hooks/`, `styles/`, `app/`, `pages/`) via search tools or `rg`/`find`.
3. Read the target primitive files (`Button`, `Input`, `Select`, `Dialog`, `Modal`, `Table`, `Card`, `Badge`, `Toast`) and theme/CSS token files so your props, variants, and classes match real exports.

## 2. Strict Component Reuse Hierarchy

1. **Reuse First**: Always import existing UI primitives, layout wrappers, form controls, icon libraries, and formatting helpers.
2. **Extend Second**: If an existing component lacks a visual variant, size, or callback, extend it cleanly with backward-compatible props/variants—never copy it into `CustomModal.tsx` or `UserCardV2.tsx`.
3. **Compose Third**: Build feature UI by composing existing primitives (`Card` + `Table` + `Badge`) instead of duplicating markup.
4. **Create Last**: Create a new shared or feature component only when search confirms no existing primitive covers the pattern, and only when justified by reuse or clear single responsibility.
5. **Zero Copy-Paste Across Routes**: If two views share table, filter, form, or modal structure, extract one parameterized component or shared hook instead of duplicating JSX across pages.

## 3. Design Tokens, Styling & Icon Discipline

- Never hardcode hex colors, pixel magic numbers, or inline `<svg>` paths when theme tokens, CSS variables, Tailwind theme scales, or an installed icon library exist in the repo.
- Match the repository's existing styling mechanism (`cn`/`clsx`, CSS Modules, Tailwind utility classes, styled components). Do not introduce a competing CSS approach in the same project.

## 4. Mandatory UI State & Accessibility Matrix

Every interactive component, form, or data view must explicitly handle (or confirm via `ask_question` if omitted from the ticket/PRD):
- **Loading**: skeleton, spinner, or disabled submit state.
- **Empty**: explicit empty-state message/action rather than blank space.
- **Error**: validation errors (field-level + summary) and server/network error recovery (retry or clear message).
- **Disabled / In-Flight**: prevent duplicate form/button submissions while mutations are pending.
- **Accessibility**: native semantic elements (`<button type="button">` for actions, `<a href>` for navigation, `<label>`/`aria-label` for inputs, keyboard focus/Escape handling for dialogs).

## 5. Logic Separation

- Keep API calls, data normalization, and complex business rules out of JSX render bodies—use the project's shared API client, validation schemas, and custom hooks/actions.
- Never invent API endpoints, response fields, or prop names. Read the actual backend/API type or schema first; if missing, ask the user.
