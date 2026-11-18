#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`validate-spec.mjs - Validates a technical specification before /to-tickets.

Usage:
  node .agents/skills/to-spec/scripts/validate-spec.mjs <spec-path>

Checks:
  - Required headings exist (Problem, Reusable Codebase Assets, Domain Model, Requirements, Security, Traceability)
  - No unresolved OPEN / TBD / TODO / vague qualifier tokens in readiness-claimed specs
  - At least one REQ-### row with a Source column entry
  - Verification Command is populated`);
  process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}

const specPath = path.resolve(args[0]);
if (!fs.existsSync(specPath)) {
  console.error(`FAIL: Spec not found at ${specPath}`);
  process.exit(1);
}

const text = fs.readFileSync(specPath, 'utf8');
const errors = [];

const requiredHeadings = [
  '## 1. Problem, Scope & Non-Goals',
  '## 2. Reusable Codebase Assets',
  '## 3. Domain Model',
  '## 4. Functional Requirements',
  '## 6. Security, Credential Hygiene',
  '## 7. Configurability, Logging',
  '## 9. Traceability Matrix',
];
for (const h of requiredHeadings) {
  if (!text.includes(h)) errors.push(`Missing required section: ${h}`);
}

const hasReadyVerdict = /Readiness Verdict\*\*:\s*`?READY FOR TICKETS`?/i.test(text);
const hasReq = /\|\s*`REQ-\d+`\s*\|/.test(text);
if (!hasReq) errors.push('No REQ-### rows found in Functional Requirements table.');

const verifMatch = text.match(/Verification Command\*\*:\s*`([^`]+)`/);
if (!verifMatch || /<exact command|TODO|TBD/i.test(verifMatch[1])) {
  errors.push('Verification Command is missing or placeholder.');
}

if (hasReadyVerdict) {
  if (/\b(?:TBD|TODO|OPEN)\b/.test(text.replace(/`OPEN`/g, 'OPEN'))) {
    // Allow "OPEN" only inside template notes if none in active tables/fields
    const badLines = text.split('\n').filter((l) => /\b(TBD|TODO)\b|\|\s*`?open`?\s*\|/i.test(l));
    if (badLines.length) errors.push(`Unresolved TBD/TODO/open items remain:\n  ${badLines.slice(0, 5).join('\n  ')}`);
  }
  const vague = text.match(/\b(?:fast|robust|minimal|for now|harden later)\b/gi);
  if (vague) errors.push(`Vague qualifiers found in READY spec: ${[...new Set(vague)].join(', ')}`);
}

if (errors.length) {
  console.error(`FAIL (${errors.length} issue(s)) in ${specPath}:`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`PASS: ${path.basename(specPath)} passed structural spec checks.`);
