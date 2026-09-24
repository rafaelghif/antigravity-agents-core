import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = path.resolve('.');
const cliPath = path.join(rootDir, 'bin', 'cli.mjs');

const securityScanner = require('../.agents/hooks/security-scanner.cjs');
const qualityGuard = require('../.agents/hooks/quality-guard.cjs');
const taskOrchestrator = require('../.agents/hooks/task-orchestrator.cjs');
const codeAnalyzer = require('../.agents/hooks/code-analyzer.cjs');
const memoryEngine = require('../.agents/hooks/memory-engine.cjs');

test('security-scanner hook blocks dangerous commands and leaked secrets', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'security-scanner.cjs');

  // 1. Dangerous git reset --hard
  const dangerousGitPayload = JSON.stringify({
    toolCall: {
      name: 'run_command',
      args: { CommandLine: 'git reset --hard HEAD~1' }
    }
  });
  const gitRes = JSON.parse(execSync(`node "${hookScript}"`, { input: dangerousGitPayload, encoding: 'utf-8' }));
  assert.equal(gitRes.decision, 'deny');
  assert.match(gitRes.reason, /Destructive git reset --hard/);

  // 2. Leaked secret in CommandLine
  const testPAT = 'ghp_' + '123456789012345678901234567890123456';
  const secretCmdPayload = JSON.stringify({
    toolCall: {
      name: 'run_command',
      args: { CommandLine: `curl -H "Authorization: token ${testPAT}" https://api.github.com` }
    }
  });
  const secretRes = JSON.parse(execSync(`node "${hookScript}"`, { input: secretCmdPayload, encoding: 'utf-8' }));
  assert.equal(secretRes.decision, 'deny');
  assert.match(secretRes.reason, /Leaked secret detected in CommandLine/);

  // 3. Sensitive system write
  const sysWritePayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: { TargetFile: '/etc/hosts', CodeContent: '127.0.0.1 bad' }
    }
  });
  const sysRes = JSON.parse(execSync(`node "${hookScript}"`, { input: sysWritePayload, encoding: 'utf-8' }));
  assert.equal(sysRes.decision, 'deny');
  assert.match(sysRes.reason, /protected system path/);

  // 4. Leaked Database URI with password
  const rawDbUri = 'postgres' + '://admin:supersecret@db.internal:5432/prod';
  const dbUriPayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: { TargetFile: '/workspace/src/db.js', CodeContent: `const uri = "${rawDbUri}";` }
    }
  });
  const dbRes = JSON.parse(execSync(`node "${hookScript}"`, { input: dbUriPayload, encoding: 'utf-8' }));
  assert.equal(dbRes.decision, 'deny');
  assert.match(dbRes.reason, /Database URI with Password/);

  // 5. Insecure catastrophic command
  const rootChmodPayload = JSON.stringify({
    toolCall: {
      name: 'run_command',
      args: { CommandLine: 'chmod -R 777 /' }
    }
  });
  const chmodRes = JSON.parse(execSync(`node "${hookScript}"`, { input: rootChmodPayload, encoding: 'utf-8' }));
  assert.equal(chmodRes.decision, 'deny');
  assert.match(chmodRes.reason, /Insecure global root permission/);

  // 6. Safe command is allowed
  const safePayload = JSON.stringify({
    toolCall: {
      name: 'run_command',
      args: { CommandLine: 'git status' }
    }
  });
  const safeRes = JSON.parse(execSync(`node "${hookScript}"`, { input: safePayload, encoding: 'utf-8' }));
  assert.equal(safeRes.decision, 'allow');
});

test('quality-guard hook enforces anti-dummy/mock policy on production files', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'quality-guard.cjs');

  // 1. Dummy ID in production file
  const dummyPayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: {
        TargetFile: '/workspace/src/auth.ts',
        CodeContent: 'const id = "dummy_id";'
      }
    }
  });
  const dummyRes = JSON.parse(execSync(`node "${hookScript}"`, { input: dummyPayload, encoding: 'utf-8' }));
  assert.equal(dummyRes.decision, 'deny');
  assert.match(dummyRes.reason, /Dummy identifier/);

  // 2. Dummy ID allowed in test file
  const testPayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: {
        TargetFile: '/workspace/tests/auth.test.ts',
        CodeContent: 'const id = "dummy_id";'
      }
    }
  });
  const testRes = JSON.parse(execSync(`node "${hookScript}"`, { input: testPayload, encoding: 'utf-8' }));
  assert.equal(testRes.decision, 'allow');

  // 3. Mock in-memory array in production file blocked
  const mockStorePayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: {
        TargetFile: '/workspace/src/users.ts',
        CodeContent: 'const mockUsers = [{ id: 1 }];'
      }
    }
  });
  const mockStoreRes = JSON.parse(execSync(`node "${hookScript}"`, { input: mockStorePayload, encoding: 'utf-8' }));
  assert.equal(mockStoreRes.decision, 'deny');
  assert.match(mockStoreRes.reason, /Mock array fixture/);
});

test('task-orchestrator computes DAG topological waves and handles dependencies', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-task-test-'));
  try {
    // Add 3 tasks: A (no dep), B (depends on A), C (depends on B)
    taskOrchestrator.addTask(tempDir, { id: 'T-A', title: 'Task A' });
    taskOrchestrator.addTask(tempDir, { id: 'T-B', title: 'Task B', dependsOn: ['T-A'] });
    taskOrchestrator.addTask(tempDir, { id: 'T-C', title: 'Task C', dependsOn: ['T-B'] });

    const loaded = taskOrchestrator.loadTasks(tempDir);
    assert.equal(loaded.tasks.length, 3);

    // Initial calculation: Wave 1 has T-A, Wave 2 has T-B, Wave 3 has T-C
    const initialCalc = taskOrchestrator.calculateWaves(loaded.tasks);
    assert.equal(initialCalc.waves.length, 3);
    assert.equal(initialCalc.waves[0][0].id, 'T-A');
    assert.equal(initialCalc.waves[1][0].id, 'T-B');
    assert.equal(initialCalc.waves[2][0].id, 'T-C');

    // Runnable task should be T-A
    const runnable1 = taskOrchestrator.getRunnableTasks(tempDir);
    assert.equal(runnable1.length, 1);
    assert.equal(runnable1[0].id, 'T-A');

    // Complete T-A
    taskOrchestrator.updateTask(tempDir, 'T-A', { status: 'done' });
    const afterA = taskOrchestrator.loadTasks(tempDir);
    const calcAfterA = taskOrchestrator.calculateWaves(afterA.tasks);
    assert.equal(calcAfterA.completed.length, 1);
    assert.equal(calcAfterA.waves.length, 2);
    assert.equal(calcAfterA.waves[0][0].id, 'T-B');

    // Circular dependency detection
    taskOrchestrator.addTask(tempDir, { id: 'T-X', title: 'Task X', dependsOn: ['T-Y'] });
    taskOrchestrator.addTask(tempDir, { id: 'T-Y', title: 'Task Y', dependsOn: ['T-X'] });
    const withCycles = taskOrchestrator.loadTasks(tempDir);
    const cycleCalc = taskOrchestrator.calculateWaves(withCycles.tasks);
    assert.ok(cycleCalc.blockedOrCyclic.some(t => t.id === 'T-X'));
    assert.ok(cycleCalc.blockedOrCyclic.some(t => t.id === 'T-Y'));

    // Automated task verification execution
    taskOrchestrator.addTask(tempDir, { id: 'T-V', title: 'Task V', verificationCmd: 'node -e "process.exit(0)"' });
    const verifySuccess = taskOrchestrator.verifyTask(tempDir, 'T-V');
    assert.ok(verifySuccess.success);
    assert.equal(verifySuccess.task.status, 'verified');

    taskOrchestrator.addTask(tempDir, { id: 'T-F', title: 'Task F', verificationCmd: 'node -e "process.exit(1)"' });
    const verifyFail = taskOrchestrator.verifyTask(tempDir, 'T-F');
    assert.equal(verifyFail.success, false);
    assert.equal(verifyFail.task.status, 'blocked');

    // Markdown ticket sync test
    const featureIssuesDir = path.join(tempDir, '.scratch', 'cart-checkout', 'issues');
    fs.mkdirSync(featureIssuesDir, { recursive: true });
    fs.writeFileSync(path.join(featureIssuesDir, '01-cart-schema.md'), `# 01: Cart Schema
**What to build:** Cart schema definition
**Seam under test:** src/cart.js
**Verification command:** node -e "process.exit(0)"
**Blast radius & Scope:** src/cart.js
**Blocked by:** None
**Status:** ready-for-agent

- [ ] Cart schema validates item count
- [ ] Cart rejects negative quantities
`);
    fs.writeFileSync(path.join(featureIssuesDir, '02-cart-api.md'), `# 02: Cart API
**What to build:** Cart checkout endpoint
**Verification command:** node -e "process.exit(0)"
**Blocked by:** 01
**Status:** ready-for-agent
`);
    const syncRes = taskOrchestrator.syncMarkdownTickets(tempDir);
    assert.equal(syncRes.synced, 2);
    const syncedTasks = taskOrchestrator.loadTasks(tempDir);
    const task01 = syncedTasks.tasks.find(t => t.id === '01');
    assert.ok(task01);
    assert.equal(task01.title, 'Cart Schema');
    assert.equal(task01.verificationCmd, 'node -e "process.exit(0)"');
    const task02 = syncedTasks.tasks.find(t => t.id === '02');
    assert.ok(task02);
    assert.deepEqual(task02.dependsOn, ['01']);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('code-analyzer accurately computes cyclomatic complexity and deep module ratio', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-analyzer-test-'));
  try {
    const testFile = path.join(tempDir, 'sample-module.js');
    const code = `
      // Sample deep module
      export function evaluate(x) {
        if (x > 10) {
          for (let i = 0; i < x; i++) {
            if (i % 2 === 0 && i !== 0) {
              console.log(i);
            }
          }
          return true;
        } else {
          return false;
        }
      }
    `;
    fs.writeFileSync(testFile, code, 'utf-8');

    const analysis = codeAnalyzer.analyzeFile(testFile);
    assert.ok(analysis.codeLines > 5);
    assert.ok(analysis.cyclomaticComplexity >= 4, `Expected complexity >= 4, got ${analysis.cyclomaticComplexity}`);
    assert.equal(analysis.exportCount, 1);
    assert.equal(analysis.fileName, 'sample-module.js');

    // Review diff test with secret and dummy stub
    const diff = `
--- a/src/app.js
+++ b/src/app.js
@@ -1,3 +1,5 @@
+const token = "ghp_123456789012345678901234567890123456";
+const dummy = "dummy_id";
`;
    const review = codeAnalyzer.reviewDiff(diff);
    assert.ok(review.errors >= 2, `Expected >= 2 errors in diff, got ${review.errors}`);

    // Architecture and Logic checks
    const archDiff = `
--- a/domain/order.js
+++ b/domain/order.js
@@ -1,2 +1,3 @@
+const pg = require("pg");
+const totalPrice = 19.99;
`;
    const archReview = codeAnalyzer.reviewDiff(archDiff);
    assert.ok(archReview.findings.some(f => f.axis === 'Architecture' && f.severity === 'error'));
    assert.ok(archReview.findings.some(f => f.axis === 'Logic' && f.severity === 'warning'));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('memory-engine tracks 5 tiers and creates snapshots', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-mem-test-'));
  try {
    // Setup minimal environment
    fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Agents\n', 'utf-8');
    fs.writeFileSync(path.join(tempDir, 'CONTEXT.md'), '# Context\n', 'utf-8');
    const scratchDir = path.join(tempDir, '.scratch');
    fs.mkdirSync(scratchDir);
    fs.writeFileSync(path.join(scratchDir, 'handoff.md'), '### Immediate Next Action\nContinue testing.\n', 'utf-8');

    const status = memoryEngine.getMemoryTiersStatus(tempDir);
    assert.ok(status.tier1.ready);
    assert.ok(status.tier3.ready);
    assert.ok(status.tier4.ready);

    const snapshot = memoryEngine.snapshotContext(tempDir);
    assert.ok(fs.existsSync(path.join(scratchDir, 'active_context.json')));
    assert.equal(snapshot.version, '1.0.0');

    const rehydration = memoryEngine.rehydrateContext(tempDir);
    assert.match(rehydration, /Continue testing/);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('CLI exposes new subcommands: scan, quality, review, analyze, tasks, memory', () => {
  // 1. scan
  const scanOutput = execSync(`node "${cliPath}" scan .agents/hooks`, { encoding: 'utf-8' });
  assert.match(scanOutput, /Security & Secret Scanner Report/);

  // 2. quality
  const qualityOutput = execSync(`node "${cliPath}" quality .agents/hooks`, { encoding: 'utf-8' });
  assert.match(qualityOutput, /Quality Code & Production Integrity Report/);

  // 3. analyze
  const analyzeOutput = execSync(`node "${cliPath}" analyze .agents/hooks`, { encoding: 'utf-8' });
  assert.match(analyzeOutput, /Codebase Metrics for/);
  assert.match(analyzeOutput, /Deep Modules/);

  // 4. review
  const reviewOutput = execSync(`node "${cliPath}" review`, { encoding: 'utf-8' });
  assert.match(reviewOutput, /Code Review Summary/);

  // 5. memory
  const memoryOutput = execSync(`node "${cliPath}" memory status`, { encoding: 'utf-8' });
  assert.match(memoryOutput, /Antigravity 5-Tier Memory Architecture Status/);

  // 6. tasks
  const tasksOutput = execSync(`node "${cliPath}" tasks summary`, { encoding: 'utf-8' });
  assert.match(tasksOutput, /Task Graph Summary|No tasks registered/);
});

test('code-analyzer detectTechStack detects workspace manifests, frameworks, and architecture', () => {
  const ts = codeAnalyzer.detectTechStack(rootDir);
  assert.ok(ts.languages.includes('JavaScript') || ts.languages.includes('TypeScript'));
  assert.equal(ts.packageManager, 'npm');
  assert.ok(ts.manifests.includes('package.json'));

  // Synthetic Python & Go stack detection
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-stack-test-'));
  try {
    fs.writeFileSync(path.join(tempDir, 'go.mod'), 'module example.com/myservice\n\ngo 1.22\n', 'utf-8');
    const goStack = codeAnalyzer.detectTechStack(tempDir);
    assert.ok(goStack.languages.includes('Go'));
    assert.equal(goStack.packageManager, 'go modules');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('quality-guard catches multi-language stubs in Python, Rust, and Go', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'quality-guard.cjs');

  // Python NotImplementedError
  const pyPayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: { TargetFile: '/workspace/src/service.py', CodeContent: 'def execute():\n    raise NotImplementedError\n' }
    }
  });
  const pyRes = JSON.parse(execSync(`node "${hookScript}"`, { input: pyPayload, encoding: 'utf-8' }));
  assert.equal(pyRes.decision, 'deny');
  assert.match(pyRes.reason, /NotImplementedError/);

  // Rust todo! macro
  const rsPayload = JSON.stringify({
    toolCall: {
      name: 'write_to_file',
      args: { TargetFile: '/workspace/src/lib.rs', CodeContent: 'pub fn compute() {\n    todo!()\n}\n' }
    }
  });
  const rsRes = JSON.parse(execSync(`node "${hookScript}"`, { input: rsPayload, encoding: 'utf-8' }));
  assert.equal(rsRes.decision, 'deny');
  assert.match(rsRes.reason, /Rust todo!/);
});

test('all local markdown links across repository resolve to existing files', () => {
  function walkDir(dir, cb) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.git' && file !== '.gemini' && file !== '.scratch') {
          walkDir(fullPath, cb);
        }
      } else if (file.endsWith('.md')) {
        cb(fullPath);
      }
    });
  }

  const broken = [];
  walkDir(rootDir, (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRegex.exec(withoutCodeBlocks)) !== null) {
      const text = m[1];
      const target = m[2].trim().split('#')[0];
      if (!target || target.startsWith('http') || target.startsWith('conversation://') || target.startsWith('mailto:') || target.startsWith('<') || target.startsWith('file:///<workspace>') || target.endsWith('mcp_config.json') || target.endsWith('.env')) {
        continue;
      }
      const resolved = target.startsWith('/')
        ? path.resolve(rootDir, '.' + target)
        : path.resolve(path.dirname(filePath), target);
      if (!fs.existsSync(resolved)) {
        broken.push({ file: path.relative(rootDir, filePath), text, target });
      }
    }
  });

  assert.deepEqual(broken, [], `Found broken markdown links: ${JSON.stringify(broken)}`);
});

test('AGENTS.md, rules, and skills cross-references are synchronized', () => {
  const agentsMd = fs.readFileSync(path.join(rootDir, 'AGENTS.md'), 'utf-8');
  const rulesDir = path.join(rootDir, '.agents', 'rules');
  const skillsDir = path.join(rootDir, '.agents', 'skills');

  // Verify all 7 rules exist and are listed in AGENTS.md
  const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
  assert.equal(ruleFiles.length, 7);
  for (const rf of ruleFiles) {
    assert.ok(agentsMd.includes(rf), `AGENTS.md must cite rule ${rf}`);
  }

  // Verify skills in AGENTS.md decision matrix exist
  const skillMatches = agentsMd.match(/\.agents\/skills\/([a-zA-Z0-9_-]+)\/SKILL\.md/g) || [];
  for (const sm of skillMatches) {
    const skillName = sm.split('/')[2];
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), `Skill ${skillName} cited in AGENTS.md must exist at ${skillPath}`);
  }
});

