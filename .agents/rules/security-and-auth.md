---
trigger: model_decision
description: "Apply these security and concurrency guidelines whenever implementing authentication, authorization, external network calls, or state mutations."
---

# Security & Concurrency Rules (World-Class Defense-in-Depth)

1. **Object-Level Authorization (Zero BOLA/IDOR)**:
   - Enforce tenant and ownership isolation at the query engine layer on every read, write, and delete operation (`WHERE id = $1 AND tenant_id = $2`). Never trust client-supplied tenant identifiers.
2. **Fail-Closed Authentication & RBAC**:
   - Fail closed (`401 Unauthorized` / `403 Forbidden`) whenever identity, token validity, or scope authorization is missing, malformed, or ambiguous.
3. **Cryptographic Integrity & Timing-Attack Defense**:
   - Compare all HMACs, webhook signatures, API tokens, and cryptographic hashes using constant-time algorithms (`crypto.timingSafeEqual` in Node.js or `subtle.timingSafeEqual`) to eliminate side-channel timing leaks.
4. **Boundary Parsing & Mass Assignment / Prototype Pollution Defense**:
   - Parse all boundary inputs through explicit, strict schemas (e.g., Zod `.strict()`, TypeBox, Pydantic). Reject unknown properties and ban `__proto__`, `constructor`, and `prototype` keys to prevent prototype pollution and mass assignment into domain models.
5. **Atomic Mutations & TOCTOU Race Prevention**:
   - Prevent Time-of-Check to Time-of-Use (TOCTOU) races by performing conditional state transitions atomically at the database engine (`UPDATE ... WHERE id = $1 AND version = $2` or `SELECT ... FOR UPDATE`). Never check state in application memory and act subsequently without a database-level lock.
6. **Distributed Locking with Fencing Tokens**:
   - When coordinating distributed resources with locks (Redis/Postgres advisory locks), issue monotonically increasing **fencing tokens**. Storage systems must reject operations presenting an older token to prevent split-brain mutations caused by garbage-collection pauses or network partitions.
7. **Full-Spectrum SSRF & DNS Rebinding Defense**:
   - On all outbound HTTP calls: (a) validate URL scheme (`https` only) and host against an allowlist, (b) resolve DNS once and pin the IP to an isolated custom socket agent, (c) reject all non-global IPv4/IPv6 ranges (`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.168.0.0/16`, `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96`, and octal/hex/decimal encodings), and (d) re-validate every redirect hop against the same filter before following.
8. **Path Traversal & Canonicalization**:
   - Canonicalize external paths (`path.resolve`, `filepath.Clean`), verify strict boundary containment (`resolvedPath.startsWith(allowedBase + path.sep)`), and reject NULL-byte injections (`\0`).
9. **Secrets & PII Redaction Invariant**:
   - Never log, serialize, or transmit API secrets, private keys, session tokens, or sensitive personal data; sanitize all error traces and structured log payloads with `<REDACTED>`.
