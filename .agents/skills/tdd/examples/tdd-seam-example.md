# Worked Example: Public-Seam TDD (Dart/Flutter & TypeScript Shape)

> Illustrative example only—adapt to the repository's real symbols and test runner.

1. **RED (Observable Contract)**:
   - Test name: `rejects withdrawal exceeding available balance without mutating ledger`
   - Calls public seam `submitWithdrawal(tenantId, accountId, amountCents, idempotencyKey)` (not internal `_validateLimit()`).
   - Asserts `InsufficientFundsError` + ledger balance unchanged + duplicate `idempotencyKey` returns identical result without double-debit.
2. **GREEN (Complete Production Behavior)**:
   - Parses amount bounds (`> 0`), verifies `tenantId` ownership in storage query, runs atomic conditional update (`version`), logs structured failure with `traceId` and `<REDACTED>` account token, uses injected config timeout.
3. **REFACTOR**:
   - Extracts repeated validation/error-mapping helper if shared across deposits and withdrawals, verifies `dart analyze` / `tsc --noEmit` + full test suite exit `0`.
