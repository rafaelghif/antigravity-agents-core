#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`validate-board.mjs - Validates Sprint Board (SPRINT.md) and ticket files.

Usage:
  node .agents/skills/to-tickets/scripts/validate-board.mjs <sprint-board-path>

Checks:
  - Ticket files referenced in SPRINT.md exist
  - No circular Blocked By dependencies
  - Tickets marked 'ready' or 'in-progress' have all Blocked By tickets in 'done'
  - Every ticket includes Reusable Codebase Assets, Source Requirements, Source Decisions, and Verification Command
  - Tickets marked 'ready' or 'in-progress' declare Exact File Touchpoints and Do-Not-Invent guards
  - No OPEN/TBD/TODO markers on tickets marked ready`);
  process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
}

const boardPath = path.resolve(args[0]);
if (!fs.existsSync(boardPath)) {
  console.error(`FAIL: Board not found at ${boardPath}`);
  process.exit(1);
}

const boardDir = path.dirname(boardPath);
const board = fs.readFileSync(boardPath, 'utf8');
const errors = [];

const ticketRefs = [...board.matchAll(/\[`#(\d+)`\]\(([^)]+)\)/g)];
if (!ticketRefs.length) {
  errors.push('No ticket links found in SPRINT.md Execution Waves table.');
}

const edges = new Map();
const ticketFiles = new Map();
const ticketStatuses = new Map();

for (const [, id, rel] of ticketRefs) {
  const tPath = path.resolve(boardDir, rel);
  ticketFiles.set(id, tPath);
  if (!fs.existsSync(tPath)) {
    errors.push(`Ticket #${id} references missing file: ${rel}`);
    continue;
  }
  const tText = fs.readFileSync(tPath, 'utf8');
  const statusMatch = tText.match(/\*\*Status\*\*:\s*`?([a-z-]+)`?/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : 'unknown';
  ticketStatuses.set(id, status);

  const blockedMatch = tText.match(/\*\*Blocked by\*\*:\s*(.+)/i);
  const deps = blockedMatch && !/None/i.test(blockedMatch[1])
    ? [...blockedMatch[1].matchAll(/#(\d+)/g)].map((m) => m[1])
    : [];
  edges.set(id, deps);

  for (const field of ['Source Requirements', 'Source Decisions', 'Reusable Codebase Assets', 'Verification Command']) {
    if (!tText.includes(field)) errors.push(`Ticket #${id} is missing '${field}'.`);
  }
  if (status === 'ready' || status === 'in-progress') {
    for (const guardField of ['Exact File Touchpoints', 'Do-Not-Invent']) {
      if (!tText.includes(guardField)) {
        errors.push(`Ticket #${id} ('${status}') must declare '${guardField}' to prevent LLM assumptions.`);
      }
    }
  }
  if (status === 'ready' && /\b(?:TBD|TODO|OPEN)\b/.test(tText)) {
    errors.push(`Ticket #${id} is marked 'ready' but still contains TBD/TODO/OPEN.`);
  }
}

// Detect cycles & premature ready/in-progress tickets with unfinished blockers
const state = new Map(); // 0=unvisited, 1=visiting, 2=done
function hasCycle(node) {
  const s = state.get(node) || 0;
  if (s === 1) return true;
  if (s === 2) return false;
  state.set(node, 1);
  for (const dep of edges.get(node) || []) {
    if (!ticketFiles.has(dep)) errors.push(`Ticket #${node} blocked by unknown ticket #${dep}.`);
    else if (hasCycle(dep)) return true;
  }
  state.set(node, 2);
  return false;
}

for (const id of edges.keys()) {
  if (hasCycle(id)) {
    errors.push(`Cycle detected in Blocked by graph involving ticket #${id}.`);
    break;
  }
  const st = ticketStatuses.get(id);
  if (st === 'ready' || st === 'in-progress') {
    for (const dep of edges.get(id) || []) {
      const depStatus = ticketStatuses.get(dep);
      if (depStatus && depStatus !== 'done') {
        errors.push(`Ticket #${id} is '${st}' while blocker #${dep} is '${depStatus}' (must be 'done').`);
      }
    }
  }
}

if (errors.length) {
  console.error(`FAIL (${errors.length} issue(s)) in ${boardPath}:`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`PASS: ${path.basename(boardPath)} (${ticketFiles.size} tickets) validated with acyclic DAG.`);
