# Multi-Stack Public Seam & Fake Patterns

| Stack | Public Seam Under Test | Outer-Boundary Test Double (Allowed) | Forbidden Patterns |
| :--- | :--- | :--- | :--- |
| **Dart / Flutter** | Pure domain functions, Cubit/BLoC/Notifier public actions, `pumpWidget` + `find.byType`/`find.text` | `mocktail` / in-memory fake implementing `Repository` or `HttpClient` interface; `fake_async` | Mocking the Cubit/Widget under test; `skip: true`; `expect(true, isTrue)` |
| **TypeScript / Node** | Exported domain functions, HTTP handler (`inject`/`supertest`), React Testing Library `getByRole` | In-memory adapter implementing storage/HTTP port; `vi.useFakeTimers()` | `vi.mock('./moduleUnderTest')`; `it.skip`; `toBeDefined()` alone |
| **Go** | Exported package functions/handlers (`httptest.NewRecorder`) | Struct implementing narrow `interface` at I/O boundary | `t.Skip()`; testing unexported helpers via reflection |
| **Python** | Public service functions / FastAPI `TestClient` | Fake repository/HTTP transport passed via DI | `@pytest.mark.skip`; monkeypatching SUT internals |
| **Rust** | Public module functions / trait boundaries | In-memory trait impl for storage/clock | `#[ignore]`; asserting private fields |
