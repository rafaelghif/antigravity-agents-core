---
name: browsing
description: Automates browser workflows, live UI verification, and end-to-end user journeys using Antigravity browser tools and Playwright. Use when testing web applications, verifying UI layout or responsiveness, or reproducing browser errors.
---

# Browsing & Web Automation

Execute reliable browser automation, live UI verification, and end-to-end user journeys using Antigravity's `/browser` subagent, Chrome DevTools MCP, or Playwright test harnesses.

## Decision tree

1. **Does the task require a real browser engine?**
   - **No (static docs search, REST/GraphQL API tests, or local code inspection)** → Use `search_web`, `curl` or integration tests via `run_command`, or `read_file` / `rg -n`. **Do not launch a browser.**
   - **Yes (live UI rendering, CSS layout, SPA interactions, responsive checks, screenshots/video proof)** → Proceed to step 2.
2. **Is the target a local dev server (`localhost` / `127.0.0.1`)?**
   - **Yes** → Verify the server port is live before navigating (or start/ask the user).
   - **No** → Verify domain allowlist policies (see [references/antigravity-subagent.md](./references/antigravity-subagent.md)).
3. **Which modality fits?**
   - **Interactive inspection / visual layout proof** → Use `/browser` or `invoke_subagent`.
   - **Automated regression script** → Run [scripts/run-browser.mjs](./scripts/run-browser.mjs) or adapt [examples/e2e-journey-example.mjs](./examples/e2e-journey-example.mjs) via `run_command`.

## Workflow & rules

1. **Pre-Flight**: Confirm target URL responds and define pass/fail checks (URL, visible role/text, zero `console.error`, zero 4xx/5xx responses).
2. **Resilient Locators**: Follow [references/locators-and-patterns.md](./references/locators-and-patterns.md): `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId`. Ban CSS positional selectors (`div > div:nth-child(2)`) and arbitrary sleeps (`waitForTimeout`).
3. **CLI Helper**:
   ```bash
   node .agents/skills/browsing/scripts/run-browser.mjs http://localhost:3000 .scratch/ui-proof.png
   ```
4. **Verify & Clean Up**: Confirm exit code `0`, verify screenshot artifact exists, and ensure headless browser processes exit cleanly. Preserve user-specified years/versions in any search queries.
