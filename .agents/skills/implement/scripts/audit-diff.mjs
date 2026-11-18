#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`audit-diff.mjs - Audits git diff and untracked files for production quality violations.

Usage:
  node .agents/skills/implement/scripts/audit-diff.mjs [--root <dir>]

Checks added/modified lines for:
  - Credential/secret literals (API keys, private keys, tokens)
  - Production mocks, dummy IDs/stores, and TODO stubs outside tests/docs
  - Test tampering (.skip, skip: true, xit, tautological assertions)
  - Hardcoded localhost URLs in non-test production code`);
  process.exit(0);
}

let rootDir = process.cwd();
const rootIdx = args.indexOf('--root');
if (rootIdx !== -1 && args[rootIdx + 1]) rootDir = path.resolve(args[rootIdx + 1]);

function isExempt(file) {
  return /(\.(?:test|spec)\.[cm]?[jt]sx?|_(?:test)\.(?:dart|go|py|rb)|(?:^|[\\/])test_.*\.py|(?:Test|Tests)\.(?:kt|java|swift))|(?:^|[\\/])(?:test|tests|__tests__|integration_test|fixtures?|mocks?)[\\/]|\.md$|(?:\.example|hooks\.json|package\.json|aac\.test\.mjs)$/i.test(file);
}

let diffFiles = [];
try {
  const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' });
  diffFiles = status
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[MADRCU?!]{1,2}\s+/, '').replace(/^.* -> /, ''));
} catch (err) {
  console.error(`FAIL: Unable to inspect git status in ${rootDir}: ${err.message}`);
  process.exit(1);
}

const findings = [];
const secretRe = /(?:sk_live_[0-9a-zA-Z]{16,}|ghp_[0-9a-zA-Z]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
const fakeRe = /(?:\b(?:const|let|var|final)\s+(?:mock|fake|dummy|stub)\w*\s*(?::[^=]+)?=|\b(?:function|class)\s+\w*(?:mock|fake|dummy|stub)\w*|\b(?:dummy|fake|mock|stub)[-_]?(?:id|token|key|user|db|store|repo|repository)\b|TODO:\s*(?:implement|add|fix))/i;
const tamperRe = /\b(?:\.skip\s*\(|it\.skip|test\.skip|describe\.skip|xit\s*\(|xdescribe\s*\(|skip:\s*true|@pytest\.mark\.(?:skip|xfail)|@unittest\.skip|\bt\.Skip\b|expect\s*\(\s*true\s*\)\.toBe\s*\(\s*true\s*\)|expect\s*\(\s*true\s*,\s*isTrue\s*\)|\bassert(?:\.ok)?\s*\(\s*true\s*\))/;
const hardcodedUrlRe = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i;

for (const rel of diffFiles) {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) continue;
  let content = '';
  try {
    content = fs.readFileSync(full, 'utf8');
  } catch { continue; }

  const lines = content.split('\n');
  const testOrDoc = isExempt(rel);
  const isTestOnly = /(\.(?:test|spec)\.[cm]?[jt]sx?|_(?:test)\.(?:dart|go|py|rb)|(?:^|[\\/])test_.*\.py|(?:Test|Tests)\.(?:kt|java|swift))|(?:^|[\\/])(?:test|tests|__tests__|integration_test)[\\/]/i.test(rel);

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    if (secretRe.test(line) && !/\.md$|aac\.test\.mjs$|hooks\.json$/i.test(rel)) {
      findings.push(`${rel}:${ln} [SECRET] Possible credential/key literal detected.`);
    }
    if (!testOrDoc) {
      if (fakeRe.test(line)) findings.push(`${rel}:${ln} [FAKE/STUB] Mock/dummy/TODO pattern in production file.`);
      if (hardcodedUrlRe.test(line)) findings.push(`${rel}:${ln} [CONFIG] Hardcoded localhost URL in production code—externalize to config.`);
    }
    if (isTestOnly && tamperRe.test(line) && !/aac\.test\.mjs$/i.test(rel)) {
      findings.push(`${rel}:${ln} [TEST-TAMPER] Test skip or tautological assertion detected.`);
    }
  });
}

if (findings.length) {
  console.error(`FAIL (${findings.length} finding(s)):`);
  for (const f of findings) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`PASS: Audited ${diffFiles.length} modified/untracked file(s) with zero secret, stub, or test-tamper violations.`);
