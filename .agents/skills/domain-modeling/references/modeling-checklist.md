# Domain Modeling Checklist (Multi-Language)

1. **Aggregate & Tenant Ownership**:
   - Name the owning principal (`tenant_id`, `organization_id`, `user_id`) for every aggregate.
   - Specify what cross-tenant reads/mutations must return (`404` vs `403`, zero existence leakage).
2. **State Machine Precision**:
   - List every state, valid transition `(from, trigger, guard) -> to`, and explicitly forbidden transitions.
   - Enforce sum types / sealed classes per stack:
     - **TypeScript**: `type OrderState = { kind: 'draft' } | { kind: 'paid'; paidAtMs: number; receiptId: string }`
     - **Dart 3**: `sealed class OrderState {}` with exhaustive `switch`
     - **Rust**: `enum OrderState { Draft, Paid { paid_at_ms: i64, receipt_id: String } }`
     - **Python**: `@dataclass(frozen=True)` variants in `Union[...]` / `TypeAlias`
3. **Precision Types**:
   - Money in integer minor units (`amountCents`) or fixed-point `Decimal` with explicit currency code (`ISO-4217`).
   - Timestamps in UTC (`epochMs` / `DateTime.utc()` / `time.Time` UTC).
4. **Falsifiable Invariant Format**:
   - Bad: *"Balances must stay consistent."*
   - Good: *"`INV-002`: `sum(refunds.amountCents) <= payment.capturedAmountCents`; concurrent refund attempts exceeding remaining balance must reject atomically with `409 ERR-003`."*
