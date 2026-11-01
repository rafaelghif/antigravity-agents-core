#!/usr/bin/env node
/**
 * Antigravity Browser Automation Helper Script
 * Executable headless Playwright runner that loads a target URL, enforces auto-wait,
 * collects console/network failures, captures full-page screenshot proof, and exits with 0 on success.
 *
 * Usage:
 *   node scripts/run-browser.mjs <url> [output-screenshot-path]
 * Example:
 *   node scripts/run-browser.mjs http://localhost:3000 .scratch/ui-proof.png
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const targetUrl = process.argv[2] || process.env.TARGET_URL;
if (!targetUrl) {
  console.error('❌ Error: Missing target URL argument.');
  console.error('Usage: node scripts/run-browser.mjs <url> [output-screenshot-path]');
  process.exit(1);
}

const outputPath = process.argv[3] || path.join('.scratch', 'screenshot.png');
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });

async function execute() {
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
    console.log(`[browsing-agent] Navigating to: ${targetUrl}`);
    const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });

    if (!response) {
      throw new Error(`Navigation failed: No response returned from ${targetUrl}`);
    }

    const status = response.status();
    console.log(`[browsing-agent] HTTP status: ${status}`);
    if (status >= 400) {
      throw new Error(`Target returned HTTP error status: ${status}`);
    }

    // Capture visual verification proof
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`[browsing-agent] Visual proof saved to: ${outputPath}`);

    // Report runtime warnings and errors
    if (consoleErrors.length > 0) {
      console.warn(`[browsing-agent] Captured ${consoleErrors.length} unhandled browser console error(s):`);
      for (const err of consoleErrors) {
        console.warn(`  - ${err}`);
      }
      throw new Error(`Browser console errors detected (${consoleErrors.length})`);
    }

    if (failedRequests.length > 0) {
      console.warn(`[browsing-agent] Captured ${failedRequests.length} failed network request(s):`);
      for (const req of failedRequests) {
        console.warn(`  - ${req}`);
      }
    }

    console.log('[browsing-agent] Browser verification passed successfully.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(`[browsing-agent] Verification failed: ${err.message}`);
    const errorShot = path.join(path.dirname(outputPath), `error-${path.basename(outputPath)}`);
    try {
      await page.screenshot({ path: errorShot });
      console.error(`[browsing-agent] Error state screenshot saved to: ${errorShot}`);
    } catch {}
    await browser.close();
    process.exit(1);
  }
}

execute();
