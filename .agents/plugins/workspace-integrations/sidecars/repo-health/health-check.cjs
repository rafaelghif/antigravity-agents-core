#!/usr/bin/env node
/**
 * Cross-platform repository health check sidecar for Google Antigravity.
 * Periodically monitors git branch cleanliness and reports status.
 */

const { execSync } = require('node:child_process');

try {
  const status = execSync('git status --porcelain', {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'ignore']
  }).trim();

  if (!status) {
    process.stdout.write('HealthCheck: Working tree clean.\n');
  } else {
    const count = status.split('\n').filter(Boolean).length;
    process.stdout.write(`HealthCheck: ${count} uncommitted changes detected.\n`);
  }
} catch (e) {
  process.stdout.write('HealthCheck: Not inside a git repository or git command failed.\n');
}
