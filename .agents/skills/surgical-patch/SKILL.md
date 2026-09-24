---
name: surgical-patch
description: Fix bugs and small behavior changes at the narrowest responsible layer. Use when regression proof, preserved surrounding behavior, and task-relevant tests matter.
---

# Surgical patch

Reproduce failure first when economical; otherwise capture strongest available evidence.

- Trace symptom to responsible mechanism. Target root cause, not symptom per [ponytail.md](../../rules/ponytail.md).
- Change narrowest layer that owns incorrect behavior. Grep callers of shared functions before changing.
- Preserve unrelated behavior and user changes.
- Avoid cleanup, renaming, and abstraction outside fix.
- Strictly adhere to [production-integrity.md](../../rules/production-integrity.md): no placeholder stubs or fake returns.
- Add only regression proof relevant to task per [coding-standards.md](../../rules/coding-standards.md).
- Apply surgical edits using `replace_file_content`.

Run focused proof plus nearest affected gate. Stop when failure is fixed and regression proof passes.
