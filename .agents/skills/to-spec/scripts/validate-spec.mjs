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
  - Verification Command is populated
  - READY FOR TICKETS specs map 100% of REQ/SEC/NFR IDs in §9 Traceability and declare Mermaid/API/Rollout/Observability contracts`);
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

function sliceSection(prefix, nextPrefix) {
  const start = text.indexOf(prefix);
  if (start === -1) return '';
  if (!nextPrefix) return text.slice(start);
  const end = text.indexOf(nextPrefix, start + prefix.length);
  return end === -1 ? text.slice(start) : text.slice(start, end);
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
    const badLines = text.split('\n').filter((l) => /\b(TBD|TODO)\b|\|\s*`?open`?\s*\|/i.test(l));
    if (badLines.length) errors.push(`Unresolved TBD/TODO/open items remain:\n  ${badLines.slice(0, 5).join('\n  ')}`);
  }
  const vague = text.match(/\b(?:fast|robust|minimal|for now|harden later)\b/gi);
  if (vague) errors.push(`Vague qualifiers found in READY spec: ${[...new Set(vague)].join(', ')}`);

  // 100% traceability coverage of REQ-###, NFR-###, and SEC-### in §9 Traceability Matrix
  const sec3 = sliceSection('## 3. Domain Model', '## 4. Functional Requirements');
  const sec4 = sliceSection('## 4. Functional Requirements', '## 5.');
  const sec5 = sliceSection('## 5.', '## 6. Security, Credential Hygiene');
  const sec6 = sliceSection('## 6. Security, Credential Hygiene', '## 7. Configurability, Logging');
  const sec7 = sliceSection('## 7. Configurability, Logging', '## 8.');
  const sec8 = sliceSection('## 8.', '## 9. Traceability Matrix');
  const sec9 = sliceSection('## 9. Traceability Matrix', '## 10.');

  const declaredIds = new Set([
    ...[...sec4.matchAll(/\|\s*`(REQ-\d+)`\s*\|/g)].map((m) => m[1]),
    ...[...sec5.matchAll(/\|\s*`(NFR-\d+)`\s*\|/g)].map((m) => m[1]),
    ...[...sec6.matchAll(/\|\s*`(SEC-\d+)`\s*\|/g)].map((m) => m[1]),
  ]);
  const unmapped = [...declaredIds].filter((id) => !new RegExp(`\\b${id}\\b`).test(sec9));
  if (unmapped.length) {
    errors.push(`Unmapped IDs missing from §9 Traceability Matrix: ${unmapped.join(', ')}`);
  }

  if (!sec3 || (!/```mermaid[\s\S]*?```/i.test(sec3) && !/\bN\/A\b/.test(sec3))) {
    errors.push('§3 Domain Model must include Mermaid design diagram(s) or explicit N/A rationale.');
  }
  if (!sec7 || !/API Contract/i.test(sec7)) {
    errors.push('§7 must declare API Contract & Schema Compatibility (or N/A — reason).');
  }
  if (!sec8 || !/Rollout/i.test(sec8) || !/Observability/i.test(sec8)) {
    errors.push('§8 must declare Rollout/Rollback SOP and Observability SLI/SLO (or N/A — reason).');
  }
}

if (errors.length) {
  console.error(`FAIL (${errors.length} issue(s)) in ${specPath}:`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`PASS: ${path.basename(specPath)} passed structural spec checks.`);
