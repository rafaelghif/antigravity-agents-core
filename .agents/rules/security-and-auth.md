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
   - Compare all HMACs, webhook signatures, API tokens, and password-reset codes with a constant-time comparator (`crypto.timingSafeEqual` in Node.js). Hash both sides to a fixed length first: `timingSafeEqual` throws on unequal lengths, and length-dependent early returns leak the secret's length. Never use `===`, `==`, or `Buffer.equals` on secrets; none of them are constant-time.
   - There is no `timingSafeEqual` in Node's WebCrypto `subtle` interface — reaching for it is a hallucinated fix that silently resolves to `undefined`.
4. **Boundary Parsing & Mass Assignment / Prototype Pollution Defense**:
   - Parse all boundary inputs through explicit, strict schemas (e.g., Zod `.strict()`, TypeBox, Pydantic). Reject unknown properties and ban `__proto__`, `constructor`, and `prototype` keys to prevent prototype pollution and mass assignment into domain models.
5. **Atomic Mutations & TOCTOU Race Prevention**:
   - Prevent Time-of-Check to Time-of-Use (TOCTOU) races by performing conditional state transitions atomically at the database engine (`UPDATE ... WHERE id = $1 AND version = $2` or `SELECT ... FOR UPDATE`). Never check state in application memory and act subsequently without a database-level lock.
6. **Distributed Locking with Fencing Tokens**:
   - When coordinating distributed resources with locks (Redis/Postgres advisory locks), issue monotonically increasing **fencing tokens**. Storage systems must reject operations presenting an older token to prevent split-brain mutations caused by garbage-collection pauses or network partitions.
7. **Full-Spectrum SSRF & DNS Rebinding Defense**:
   - On all outbound HTTP calls: (a) validate URL scheme (`https` only) and host against an allowlist, (b) resolve DNS once and pin the IP to an isolated custom socket agent (Node: the `lookup` option on `http(s).request`), (c) reject all non-global IPv4/IPv6 ranges (`0.0.0.0/8`, `10.0.0.0/8`, `100.64.0.0/10`, `127.0.0.0/8`, `169.254.0.0/16`, `172.16.0.0/12`, `192.0.0.0/24`, `192.168.0.0/16`, `198.18.0.0/15`, `224.0.0.0/4`, `240.0.0.0/4`, `::/128`, `::1`, `fc00::/7`, `fe80::/10`, `::ffff:0:0/96`, `64:ff9b::/96`, `2002::/16`, and octal/hex/decimal encodings), and (d) re-validate every redirect hop against the same filter before following.
8. **Path Traversal & Canonicalization**:
   - Canonicalize external paths (`path.resolve`, `filepath.Clean`), resolve symlinks with `fs.realpath`, then verify containment with `resolved === base || resolved.startsWith(base + path.sep)`; a plain `startsWith(base + path.sep)` rejects the base directory itself. Compare case-insensitively on Windows and macOS, percent-decode before validating, and reject NULL bytes (`\0`) and any path that escapes after canonicalization.
9. **Secrets & PII Redaction Invariant**:
   - Never log, serialize, or transmit API secrets, private keys, session tokens, or sensitive personal data; sanitize all error traces and structured log payloads with `<REDACTED>`.
