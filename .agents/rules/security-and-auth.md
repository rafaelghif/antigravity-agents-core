---
trigger: model_decision
description: "Apply these security and concurrency guidelines whenever implementing authentication, authorization, external network calls, or state mutations."
---

# Security & Concurrency Rules

1. Enforce object-level authorization (`BOLA/IDOR`) on every query by verifying both the resource ID and the authenticated principal/tenant ID (`WHERE id = $1 AND tenant_id = $2`).
2. Fail closed (`401 Unauthorized` / `403 Forbidden`) whenever authentication or permission state is missing or ambiguous.
3. Bind external inputs through explicit schema allowlists; never pass raw request bodies directly into ORM models (Mass Assignment defense).
4. Enforce idempotency on all mutating endpoints, payment handlers, webhooks, and background jobs using idempotency keys or unique constraints.
5. Prevent TOCTOU race conditions by performing conditional state transitions atomically in the database (`UPDATE ... WHERE id = $1 AND version = $2` or `SELECT ... FOR UPDATE`) rather than check-then-act in memory.
6. Prevent SSRF on outbound requests: validate scheme (`https`) and host against an explicit allowlist, resolve DNS once and pin the validated IP (preventing DNS rebinding), block all non-global IPv4/IPv6 ranges (`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96`, plus octal/hex/integer encodings), and revalidate every redirect hop.
7. Canonicalize external file paths (`path.resolve`, `filepath.Clean`) and verify they remain inside the allowed base directory before any file I/O.
8. Never hardcode or log secrets, API keys, JWT signing keys, session tokens, or PII; always redact sensitive values as `<REDACTED>`.
