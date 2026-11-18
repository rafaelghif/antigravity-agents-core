---
trigger: model_decision
description: "Apply these security, credential-hygiene, and concurrency guidelines whenever implementing authentication, authorization, external network calls, file paths, secrets, or state mutations."
---

# Security, Credential Hygiene & Concurrency Rules

1. **Zero Credential & Secret Leaks**:
   - Never hardcode API keys, tokens, passwords, signing secrets, or private keys in source code, tests with real credentials, config defaults, or client-visible bundles (note: Flutter `--dart-define` values embedded in mobile binaries are extractable—keep server secrets strictly on backend services).
   - Never log, return in error responses, or place secrets in query-string URLs or CLI process arguments. Redact sensitive fields with `<REDACTED>`.
2. **Object-Level Authorization (Zero BOLA/IDOR)**:
   - Enforce authenticated `tenant_id` / owner checks directly in the data query (`WHERE id = $1 AND tenant_id = $2`) on every read, update, and delete. Never trust client-supplied owner/tenant IDs.
3. **Fail-Closed Auth & RBAC**:
   - Reject (`401`/`403`) whenever identity, token signature, expiry, or required scope is missing, malformed, or ambiguous.
4. **Constant-Time Secret Comparison**:
   - Compare HMACs, webhook signatures, API keys, and reset tokens using constant-time comparators (`crypto.timingSafeEqual` in Node after fixed-length SHA-256 pre-hash, `hmac.compare_digest` in Python, `hmac.Equal` in Go, `subtle.ConstantTimeCompare`). Never use `===`/`==` on secrets, and note WebCrypto `subtle` has no `timingSafeEqual`.
5. **Boundary Parsing & Mass Assignment Defense**:
   - Parse untrusted payloads with strict schemas rejecting unknown fields and `__proto__`/`constructor`/`prototype` keys.
6. **Atomic State Transitions & Distributed Fencing**:
   - Perform check-and-update atomically in storage (`UPDATE ... WHERE id = $1 AND version = $2` or `SELECT ... FOR UPDATE`). Pair distributed locks with monotonically increasing fencing tokens checked by storage.
7. **Full SSRF & DNS-Rebinding Defense**:
   - Allowlist `https` and approved hosts, resolve DNS once and pin the validated IP on the socket/client, block all non-global IPv4/IPv6 ranges (`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.0.0.0/24`, `192.168.0.0/16`, `198.18.0.0/15`, `224.0.0.0/4`, `240.0.0.0/4`, `::/128`, `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96`, `64:ff9b::/96`, `2002::/16`, and decimal/octal/hex IP encodings), and revalidate every redirect hop.
8. **Path Traversal & Canonicalization**:
   - Percent-decode, reject `\0`, canonicalize, resolve symlinks (`realpath`), and verify `resolved === base || resolved.startsWith(base + path.sep)` (case-insensitively on Windows/macOS).
