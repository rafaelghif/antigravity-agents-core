---
name: browsing
description: Automates browser workflows, live UI verification, and end-to-end user journeys using Antigravity browser tools and Playwright. Use this skill when the user asks to test web applications, verify UI layout or responsiveness, reproduce browser errors, or execute browser automation workflows.
---

# Browsing & Web Automation

Execute reliable browser automation, live UI verification, and end-to-end user journeys using Antigravity's native `/browser` subagent, Chrome DevTools MCP, or Playwright test harnesses.

## Decision tree

1. **Does the task require a real browser engine?**
   - **No (static search, querying docs, plain HTML/markdown scraping, backend REST/GraphQL API testing, or local code navigation)** →
     - Web & doc search: Call `search_web`.
     - Static text or HTML pages: Call `read_url_content` or `curl`.
     - Backend API contracts: Run integration tests or curl via `run_command`.
     - Local repository files: Call `read_file` or `grep_search`.
     - **DO NOT launch a browser instance.**
   - **Yes (live UI rendering, CSS layout verification, client-side SPA execution, responsive design, interactive DOM state changes, visual screenshots/video proof, or E2E flow)** → Proceed to step 2.
2. **Is the target a local development server (`localhost` / `127.0.0.1`)?**
   - **Yes** → Verify that the local server is running and responding (e.g. check active terminals or probe the port). If not running, start it or prompt the user first. Proceed to step 3.
   - **No (remote staging or production URL)** → Check security policies (`Browser Allowlist` and `Internet Access Policy` in `settings.json`; see [references/antigravity-subagent.md](./references/antigravity-subagent.md)). Never navigate to unauthorized external domains. Proceed to step 3.
3. **Which execution modality fits the task?**
   - **Interactive exploration, visual layout inspection, or user-facing session** → Use the Antigravity `/browser` slash command or delegate via `invoke_subagent`. Operates in an isolated window and automatically records WebM video and screenshot artifacts.
   - **Programmatic automated test, CI assertion, or regression suite** → Run the headless automation helper [scripts/run-browser.mjs](./scripts/run-browser.mjs) or author an E2E test following [examples/e2e-journey-example.mjs](./examples/e2e-journey-example.mjs) via `run_command`.

---

## When to use browsing

### 1. Valid trigger scenarios
- **Live web app verification**: Testing local preview servers (e.g. `http://localhost:3000`), rendered CSS layouts, modal dialogs, and responsive breakpoints.
- **Client-side SPAs**: Interacting with pages rendered dynamically by JavaScript (React, Next.js, Vue, Svelte) that static HTTP scraping cannot evaluate.
- **Multi-step interactive user flows**: Testing forms, authentication funnels, shopping carts, and drag-and-drop actions.
- **Visual evidence capture**: Generating full-page screenshots and recorded WebM session videos for PR proof or verification.
- **Bug reproduction**: Capturing unhandled browser console errors (`console.error`) and failed network requests (4xx/5xx).

### 2. Prohibited anti-patterns
- **Document scraping**: Never launch Chrome to read public documentation that `search_web` or `read_url_content` can fetch in milliseconds.
- **Backend API testing**: Never click UI buttons to test backend JSON validation when a curl command or integration test can verify it directly.
- **Arbitrary sleep delays**: Never introduce `sleep 3` or `waitForTimeout`. Always use event-driven auto-waiting (`waitForURL`, `waitForSelector`).
- **Brittle CSS/XPath selectors**: Never select elements via generated hashes or positional paths (`div > div:nth-child(2)`). Always use user-facing accessible locators (see [references/locators-and-patterns.md](./references/locators-and-patterns.md)).
- **Temporal regression in search**: Never replace user-specified years, dates, or version constraints with training cutoff defaults (e.g., querying 2024 when 2026 was explicitly mandated). Search queries must preserve exact temporal parameters.

---

## Implementation workflow

### Step 1: Pre-flight check & target readiness
1. Ensure the target web server is live:
   - For local servers: Confirm port binding (HTTP 200/300) before navigation.
   - For remote servers: Confirm domain is allowed in `settings.json`.
2. Define explicit pass/fail criteria before launching (target URL reached, heading visible, zero console errors).

### Step 2: Choose execution modality

#### Modality A: Antigravity native `/browser` subagent
- Trigger via `/browser <task instruction>` in composer or delegate with `invoke_subagent`.
- Chrome is managed automatically via Chrome DevTools MCP.
- Operates in an isolated conversation context to keep large DOM trees out of main chat.
- Automatically generates WebM video recordings and visual snapshots.

#### Modality B: Programmatic runner script
- Execute the headless test runner script via `run_command`:
  ```bash
  node .agents/skills/browsing/scripts/run-browser.mjs http://localhost:3000 .scratch/ui-proof.png
  ```
- For multi-step custom journeys, adapt [examples/e2e-journey-example.mjs](./examples/e2e-journey-example.mjs).

### Step 3: Resilient interaction & locator standards
- Follow the accessibility locator priority in [references/locators-and-patterns.md](./references/locators-and-patterns.md):
  `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId`.
- Rely on framework auto-waiting; wait for specific network responses or URL transitions.
- Capture all uncaught browser runtime console errors and failed network requests.

### Step 4: Verification & proof
1. Validate command exit code (exit 0).
2. Confirm the generated screenshot artifact exists and embed the file link in your final report.
3. Ensure all headless browser processes terminate cleanly without lingering zombies.
