---
trigger: glob
globs: "*.tsx, *.jsx, *.vue, *.svelte, *.astro, *.html, *.css, *.scss, *.dart, **/components/**, **/widgets/**, **/screens/**, **/pages/**, **/ui/**, **/app/**, **/features/**"
description: "Multi-framework UI & DRY rules (Web + Dart/Flutter + Mobile): shared widget/component discovery, Reuse->Extend->Compose->Create, design tokens, UI state matrix, lifecycle disposal, and rebuild performance."
---

# UI, Shared Components & Frontend/Mobile DRY Rules

## 1. Mandatory Pre-UI Discovery Gate (Run Before Writing UI)

Before creating or modifying any UI component, widget, screen, or style:
1. Read `CONTEXT.md` §4–5 (if populated) and the project manifest (`package.json`, `pubspec.yaml`, etc.) to identify the active UI kit, styling/theming system, icon library, state manager, and HTTP client.
2. Search existing UI directories (`components/`, `widgets/`, `shared/`, `design-system/`, `theme/`, `hooks/`, `features/`, `screens/`, `pages/`, `app/`) via search tool or `rg`/`find`.
3. Read the real primitive/theme files (`Button`/`AppButton`, `Input`/`AppTextField`, `Dialog`/`Modal`, `Table`, `ThemeData`/`ColorScheme`/`globals.css`) so props, variants, and theme tokens match verified code.

## 2. Strict Component / Widget Reuse Hierarchy

1. **Reuse First**: Always import existing UI primitives, layout wrappers, form controls, icon packs, and formatting helpers.
2. **Extend Second**: If an existing component/widget lacks a variant, size, or callback, extend it cleanly with optional/backward-compatible parameters—never copy it into `CustomModal.tsx` or `CustomPrimaryButton.dart`.
3. **Compose Third**: Build feature views by composing existing primitives instead of duplicating markup/widget trees.
4. **Create Last**: Create a new shared component/widget only when search proves no existing primitive covers it and it warrants reuse or single-responsibility isolation.
5. **Zero Copy-Paste Across Screens/Routes**: Extract shared cards, list items, filters, and form sections into parameterized shared components/widgets.

## 3. Design Tokens, Styling & Icon Discipline

- Never hardcode hex colors (`#123456` / `Color(0xFF...)`), magic spacing/font sizes, or inline SVG/custom paths when theme tokens (`Theme.of(context).colorScheme` / `TextTheme`, CSS variables, Tailwind theme scales) or installed icon libraries exist.
- Match the repository's styling & state architecture (e.g., Tailwind/`cn`, CSS Modules, Riverpod/BLoC, React Query) instead of mixing paradigms.

## 4. Mandatory UI State, Lifecycle & Rendering Performance Matrix

Every interactive screen, widget, or form must explicitly handle (or stop and `ask_question` if undefined in the ticket/PRD):
- **Loading / Empty / Validation Error / Server Error / Disabled In-Flight**: never leave dead blank states or allow double-submission.
- **UI Thread & Rebuild Optimization**:
  - **Flutter/Dart**: Prefer `const` constructors/widgets, use `ListView.builder`/`SliverChildBuilderDelegate` for dynamic lists (never `.map().toList()` inside `Column` for unbounded data), narrow state rebuild scopes (`Consumer`/`BlocSelector`), and offload heavy JSON parsing/crypto to `compute()`/`Isolate`.
  - **Web (React/Vue/Svelte)**: Virtualize large lists, avoid allocating inline handlers/objects unnecessarily in hot lists, keep render bodies pure.
- **Resource Disposal (Zero Memory Leaks)**: Always dispose `TextEditingController`, `AnimationController`, `ScrollController`, `FocusNode`, `StreamSubscription`, `Timer`, `AbortController`, and event listeners on unmount/`dispose()`.
- **Accessibility**: Semantic elements (`<button type="button">` vs `<a href>`, `<label>`/`aria-*`, Flutter `Semantics`, proper focus/keyboard navigation).

## 5. Logic Separation

- Keep API calls, DTO parsing, caching, and domain rules out of UI render/`build()` methods—use the project's shared API client, schemas, and state holders. Never invent API fields or routes; ask if missing.
