# Locators and Browser Automation Patterns

Best practices for robust, flake-free browser automation and testing across Antigravity's browser tools and Playwright runners.

---

## 1. Locator Strategy Priority

Always prioritize locators that reflect how human users perceive and interact with the interface. Avoid fragile implementation details like CSS hierarchy or auto-generated classes.

| Priority | Locator API | Example | Why |
| :--- | :--- | :--- | :--- |
| **P0 (Recommended)** | `getByRole` | `page.getByRole('button', { name: 'Submit' })` | Accessible, resilient to DOM refactoring, enforces proper ARIA semantics. |
| **P1** | `getByLabel` | `page.getByLabel('Email address')` | Directly tests form input labelling and accessibility. |
| **P2** | `getByPlaceholder` | `page.getByPlaceholder('Search documentation...')` | Good fallback for inputs without explicit visible labels. |
| **P3** | `getByText` | `page.getByText('Order completed successfully')` | Ideal for asserting non-interactive content and status banners. |
| **P4** | `getByTestId` | `page.getByTestId('checkout-cart-summary')` | Dedicated test contract; use only when visible semantic text is unavailable. |
| **Anti-Pattern (Banned)** | Complex CSS / XPath | `page.locator('div.sc-1234 > div:nth-child(2) > button')` | Extremely brittle; breaks on minor CSS, styling, or structural changes. |

---

## 2. Auto-Waiting vs. Hardcoded Sleep Invariants

Never introduce arbitrary delays (`sleep`, `page.waitForTimeout`, `setTimeout`). They introduce non-deterministic race conditions on slow machines and waste time on fast machines.

### The Invariants:
1. **Actionability Auto-Waiting**: Playwright and Chrome DevTools MCP automatically wait for elements to be visible, attached, stable, and enabled before clicking or typing.
2. **Explicit State Assertions**: When waiting for asynchronous transitions, wait for the expected outcome, not elapsed time:
   ```javascript
   // BAD: Arbitrary sleep
   await page.waitForTimeout(3000);

   // GOOD: Await specific condition or navigation
   await page.waitForURL('**/dashboard');
   await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
   ```
3. **Network Synchronization**: Wait for API responses or idle state when handling data-fetching operations:
   ```javascript
   await Promise.all([
     page.waitForResponse((res) => res.url().includes('/api/checkout') && res.status() === 200),
     page.getByRole('button', { name: 'Place Order' }).click(),
   ]);
   ```

---

## 3. Console & Network Error Detection

A page may visually render an error fallback while silently failing in JavaScript. Always monitor console logs and network failures:

```javascript
const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

const failedRequests = [];
page.on('requestfailed', (req) => {
  failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
});

// Post-action verification
expect(consoleErrors).toEqual([]);
expect(failedRequests).toEqual([]);
```

---

## 4. Responsive Viewport Matrix

When verifying responsive UI or mobile breakpoints, explicitly set viewports:

| Device / Form Factor | Viewport Dimensions | Purpose |
| :--- | :--- | :--- |
| **Desktop Wide** | `1920 x 1080` | High-density enterprise dashboards, multi-column layouts |
| **Desktop Standard** | `1280 x 720` | Default laptop resolution, primary desktop breakpoint |
| **Tablet Portrait** | `768 x 1024` | Tablet navigation, collapsing sidebars, responsive tables |
| **Mobile Standard** | `375 x 812` (iPhone X/13) | Mobile hamburger menus, stacked cards, touch-target sizing |
