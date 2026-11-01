#!/usr/bin/env node
/**
 * Reference implementation for an End-to-End User Journey using Playwright.
 * Demonstrates accessible semantic locators, event-driven auto-waiting, and hermetic teardown.
 *
 * Usage:
 *   node examples/e2e-journey-example.mjs
 */

import { chromium, expect } from '@playwright/test';

async function runJourney() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Navigate to target
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    // 2. Interact using accessible semantic locators (never brittle CSS/XPath)
    await page.getByLabel('Email address').fill('engineer@example.com');
    await page.getByLabel('Password').fill('SuperSecretPassword123!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // 3. Auto-wait for expected state transition (never hardcoded sleep)
    await page.waitForURL('**/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // 4. Capture screenshot artifact as proof
    await page.screenshot({ path: '.scratch/login-success.png' });
    console.log('✔ E2E Journey completed successfully.');
  } finally {
    await browser.close();
  }
}

if (process.env.RUN_EXAMPLE === 'true') {
  runJourney().catch((err) => {
    console.error('E2E Journey failed:', err);
    process.exit(1);
  });
}
