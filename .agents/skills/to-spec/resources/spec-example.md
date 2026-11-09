# Worked Example: Spec Provenance (Illustrative Only)

> **Do not copy these domain facts.** This file exists only to show the required detail level and provenance discipline. The refund domain below is fictional. When writing a real spec, every value, ID, seam, and command must come from the confirmed Discovery Decision Record (DDR), the repository, or a live primary source.

This example shows how a DDR decision becomes a traceable specification. The DDR lives at `docs/discovery/refund-authorization.md` and the spec lives at `specs/refund-authorization.md`.

## 1. How the excerpt maps upstream decisions

| DDR source | Spec destination | Provenance rule applied |
| :--- | :--- | :--- |
| `DEC-003` (refunds are authorized per tenant) | `REQ-001`, `SEC-001` | Copied the exact authorization rule; no extra control invented. |
| `INV-002` (refund must never exceed captured minus prior refunds) | `INV-002`, `REQ-002` | Copied the invariant verbatim and attached a forbidden-transition test. |
| `NFR-001` (p95 refund decision under 150 ms) | `NFR-001` | Copied the number and unit; added the measurement method from `DEC-008`. |
| `OQ-004` (refund audit retention period) | §14 open question | Left `OPEN`; the spec stays `draft` until resolved. |

## 2. Excerpt: functional requirements

| ID | Requirement | Given / When / Then | Priority | Source |
| :--- | :--- | :--- | :---: | :--- |
| `REQ-001` | A refund is accepted only for the tenant that owns the payment. | **Given** a payment owned by tenant `A`, **when** tenant `B` submits a refund, **then** the API responds `404 ERR-002` and mutates zero rows. | `must` | `DEC-003` |
| `REQ-002` | A refund may never exceed the remaining refundable amount. | **Given** a captured payment of `100.00` with `30.00` already refunded, **when** a `71.00` refund is requested, **then** the request fails with `409 ERR-003` and no ledger entry is written. | `must` | `INV-002`, `DEC-005` |

## 3. Excerpt: measurable non-functional requirements

| ID | Attribute | Budget / Target | Measurement Method | Behavior When Exceeded | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NFR-001` | Refund decision latency | `p95 < 150 ms`, `p99 < 400 ms` at `200 req/s` | Load test `npm run bench:refund -- --rate 200 --duration 300` | Alert at `p99 > 400 ms`; shed to `503 ERR-005` above queue depth `1000` | `NFR-001`, `DEC-008` |

## 4. Excerpt: security and abuse cases

| ID | Asset / Threat | Control | Verification | Source |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-001` | Cross-tenant refund (BOLA/IDOR) | Tenant predicate on every read and mutation; response is `404`, never `403`, to avoid existence leakage | `tests/refund/authorization.test.ts` cross-tenant case | `DEC-003` |
| `SEC-002` | Replayed refund request | Client-supplied idempotency key with atomic first-write-wins and 24-hour TTL | Duplicate request returns the original response and creates one ledger entry | `DEC-006` |

## 5. Excerpt: error contract

| ID | Condition | Status / Code | Expected Behavior & Recovery | Source |
| :--- | :--- | :--- | :--- | :--- |
| `ERR-002` | Payment not visible to the caller's tenant | `404` / `payment_not_found` | Fail closed; no state mutation; caller must not learn whether the payment exists | `DEC-003` |
| `ERR-003` | Refund exceeds the remaining refundable amount | `409` / `refund_exceeds_remaining` | Reject atomically; expose the remaining amount only to the owning tenant | `INV-002`, `DEC-005` |

## 6. Excerpt: traceability matrix

| Requirement | Invariants / Security | Ticket(s) | Public Seam | Test(s) |
| :--- | :--- | :--- | :--- | :--- |
| `REQ-001` | `INV-001`, `SEC-001` | `#02` | `POST /refunds` | `tests/refund/authorization.test.ts` |
| `REQ-002` | `INV-002`, `SEC-002` | `#03` | `POST /refunds` | `tests/refund/amount-boundary.test.ts` |

## 7. Excerpt: readiness verdict

```text
Status: draft
Readiness verdict: NOT READY
Blocking: OQ-004 (audit retention period) blocks SEC-003 and the migration in §8.
```

The verdict is `READY FOR TICKETS` only when every blocking `OQ-###` is resolved or explicitly deferred with an owner, a risk statement, and a compensating control.
