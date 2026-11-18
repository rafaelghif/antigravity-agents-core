# Worked Example: Falsifiable Invariants & Sealed State Machine

> Shape example only—never copy these domain facts into an unrelated project.

## Invariant Registry (`CONTEXT.md` §6)

| ID | Term / Invariant | Canonical Definition & Falsifiable Rule | Source |
| :--- | :--- | :--- | :--- |
| `INV-010` | `WithdrawalHold` | `availableBalanceCents = settledBalanceCents - activeHoldsCents`; a hold request where `amountCents > availableBalanceCents` or `amountCents <= 0` must fail atomically with zero balance change. | `DEC-004` |

## State Machine (`ST-010`)

| ID | State Machine | State | Allowed Next | Forbidden | Trigger / Guard |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ST-010` | `PayoutStatus` | `pending` | `settled`, `failed` | `pending` | Bank webhook verified with constant-time HMAC + fencing token. |
| `ST-010` | `PayoutStatus` | `settled` | `None` (terminal) | `failed`, `pending` | Immutable once settled; reversal creates a separate `Refund` ledger entry. |

## Illegal States Eliminated

Instead of `{ isPending: boolean; isSettled: boolean; settledAt?: number; failureReason?: string }`, model as a discriminated union / `sealed class` so `settled` always carries `settledAtUtc` and can never coexist with `failureReason`.
