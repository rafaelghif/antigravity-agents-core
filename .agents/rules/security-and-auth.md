---
trigger: model_decision
description: "Apply these security and concurrency guidelines whenever implementing authentication, authorization, external network calls, file paths, secrets, or state mutations."
---

# Security & Concurrency Rules

1. **Object-Level Authorization (Zero BOLA/IDOR)**: Enforce authenticated `tenant_id` / owner checks directly in the data query (`WHERE id = $1 AND tenant_id = $2`) on every read, update, and delete. Never trust client-supplied tenant or owner IDs.
2. **Fail-Closed Auth & RBAC**: Return `401`/`403` whenever identity, token signature, expiry, or required scope is missing, malformed, or ambiguous.
3. **Constant-Time Secret Comparison**: Compare HMACs, webhook signatures, API keys, and reset tokens using `crypto.timingSafeEqual` (Node.js) after hashing both inputs to identical fixed length. Never use `===`, `==`, or `Buffer.equals` on secrets, and note that WebCrypto `subtle` has no `timingSafeEqual`.
4. **Boundary Parsing & Prototype-Pollution Defense**: Parse external payloads with strict schemas (e.g., Zod `.strict()`, Pydantic) rejecting unknown keys and `__proto__`/`constructor`/`prototype` properties.
5. **Atomic State Transitions (Zero TOCTOU)**: Perform state checks and updates atomically in the database (`UPDATE ... WHERE id = $1 AND version = $2` or `SELECT ... FOR UPDATE`). Never check state in memory and mutate later without a lock/version guard.
6. **Distributed Locks with Fencing Tokens**: Pair distributed locks with monotonically increasing fencing tokens validated by storage so paused workers cannot commit stale writes.
7. **Full SSRF & DNS-Rebinding Defense**: On outbound HTTP calls: (a) allowlist `https` and approved hosts, (b) resolve DNS once and pin the validated IP on the socket/agent (`lookup` option in Node `http(s).request`), (c) reject non-global IPv4/IPv6 ranges (`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.0.0.0/24`, `192.168.0.0/16`, `198.18.0.0/15`, `224.0.0.0/4`, `240.0.0.0/4`, `::/128`, `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96`, `64:ff9b::/96`, `2002::/16`, plus decimal/octal/hex IP encodings), and (d) revalidate every redirect hop.
8. **Path Traversal & Canonicalization**: Percent-decode, reject `\0` bytes, canonicalize (`path.resolve`), resolve symlinks (`fs.realpath`), and verify `resolved === base || resolved.startsWith(base + path.sep)` (case-insensitively on Windows/macOS).
9. **Secret & PII Redaction**: Never log, serialize, or expose tokens, private keys, passwords, or PII in errors/logs; redact with `<REDACTED>`.
