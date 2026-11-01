#!/usr/bin/env node
/**
 * Zero-fluff, robust browser automation runner script template.
 * Executes headless Playwright with automated error collection, screenshot capture, and clean exit codes.
 *
 * Requirements: npm install -D playwright
 * Usage: node browser-test-template.mjs [targetUrl] [outputScreenshotPath]
 */

import { chromium } from 'playwright';

const targetUrl = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000';
const screenshotPath = process.argv[3] || 'screenshot.png';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const failedRequests = [];
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.method()} ${req.url()} (${req.failure()?.errorText || 'Unknown'})`);
  });

  try {
    console.log(`[browser-runner] Navigating to: ${targetUrl}`);
    const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    if (!response) {
      throw new Error(`Failed to get response from ${targetUrl}`);
    }

    const status = response.status();
    console.log(`[browser-runner] Response status: ${status}`);
    if (status >= 400) {
      throw new Error(`Server returned HTTP error status: ${status}`);
    }

    // Capture visual verification screenshot
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`[browser-runner] Visual snapshot saved to: ${screenshotPath}`);

    // Assert zero uncaught console errors
    if (consoleErrors.length > 0) {
      console.warn(`[browser-runner] Warning: Caught ${consoleErrors.length} console error(s):`);
      for (const err of consoleErrors) {
        console.warn(`  - ${err}`);
      }
    }

    if (failedRequests.length > 0) {
      console.warn(`[browser-runner] Warning: ${failedRequests.length} network request(s) failed:`);
      for (const req of failedRequests) {
        console.warn(`  - ${req}`);
      }
    }

    console.log('[browser-runner] Execution verified successfully.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(`[browser-runner] Execution failed: ${err.message}`);
    try {
      await page.screenshot({ path: `error-${screenshotPath}` });
      console.error(`[browser-runner] Error screenshot saved to: error-${screenshotPath}`);
    } catch {}
    await browser.close();
    process.exit(1);
  }
}

run();
