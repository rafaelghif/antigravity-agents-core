import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const rootDir = path.resolve('.');
const cliPath = path.join(rootDir, 'bin', 'cli.mjs');

test('CLI --version prints v5.2.0', () => {
  const output = execSync(`node "${cliPath}" --version`, { encoding: 'utf-8' });
  assert.match(output, /@rafaelghif\/aac-core v5\.2\.0/);
});

test('CLI --help prints usage banner', () => {
  const output = execSync(`node "${cliPath}" --help`, { encoding: 'utf-8' });
  assert.match(output, /USAGE:/);
  assert.match(output, /npx @rafaelghif\/aac-core <command>/);
  assert.match(output, /init/);
  assert.match(output, /upgrade/);
  assert.match(output, /audit/);
  assert.match(output, /doctor/);
  assert.match(output, /list/);
});

test('CLI list displays skills count', () => {
  const output = execSync(`node "${cliPath}" list`, { encoding: 'utf-8' });
  assert.match(output, /Total: 64 skills available/);
});

test('CLI doctor performs environment health checks', () => {
  const output = execSync(`node "${cliPath}" doctor`, { encoding: 'utf-8' });
  assert.match(output, /Node\.js Runtime/);
  assert.match(output, /Workspace Scope/);
  assert.match(output, /Skills Integrity/);
  assert.match(output, /Hooks Integrity/);
});

test('CLI init never creates or overwrites package.json in target directory', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-test-'));
  try {
    execSync(`node "${cliPath}" init`, { cwd: tempDir, encoding: 'utf-8' });
    assert.ok(fs.existsSync(path.join(tempDir, '.agents')), '.agents/ must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'docs')), 'docs/ must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'AGENTS.md')), 'AGENTS.md must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'GEMINI.md')), 'GEMINI.md must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'CLAUDE.md')), 'CLAUDE.md must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'CONTEXT.md')), 'CONTEXT.md must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, 'skills-lock.json')), 'skills-lock.json must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, '.scratch')), '.scratch/ must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, '.scratch', '.gitkeep')), '.scratch/.gitkeep must be scaffolded');
    assert.ok(fs.existsSync(path.join(tempDir, '.gitignore')), '.gitignore must be scaffolded');
    assert.ok(!fs.existsSync(path.join(tempDir, 'package.json')), 'package.json MUST NEVER BE CREATED in target project');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('install.ps1 scaffolds workspace with zero package.json pollution', (t) => {
  if (process.platform !== 'win32') {
    t.skip('PowerShell test requires Windows');
    return;
  }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-ps1-test-'));
  const ps1Script = path.join(rootDir, 'install.ps1');
  try {
    execSync(`powershell -ExecutionPolicy Bypass -File "${ps1Script}"`, { cwd: tempDir, encoding: 'utf-8' });
    assert.ok(fs.existsSync(path.join(tempDir, '.agents')), '.agents/ must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'docs')), 'docs/ must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'AGENTS.md')), 'AGENTS.md must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'GEMINI.md')), 'GEMINI.md must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'CLAUDE.md')), 'CLAUDE.md must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'CONTEXT.md')), 'CONTEXT.md must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, 'skills-lock.json')), 'skills-lock.json must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, '.scratch')), '.scratch/ must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, '.scratch', '.gitkeep')), '.scratch/.gitkeep must be scaffolded by install.ps1');
    assert.ok(fs.existsSync(path.join(tempDir, '.gitignore')), '.gitignore must be scaffolded by install.ps1');
    assert.ok(!fs.existsSync(path.join(tempDir, 'package.json')), 'package.json MUST NEVER BE CREATED by install.ps1');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('install.sh scaffolds workspace with zero package.json pollution', (t) => {
  let canRunBash = false;
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    try {
      execSync('wsl bash -c "echo OK"', { stdio: 'pipe' });
      canRunBash = true;
    } catch {
      canRunBash = false;
    }
  } else {
    try {
      execSync('bash -c "echo OK"', { stdio: 'pipe' });
      canRunBash = true;
    } catch {
      canRunBash = false;
    }
  }

  if (!canRunBash) {
    t.skip('bash/wsl is not available in environment');
    return;
  }

  if (isWindows) {
    const testDirName = 'aac-sh-' + Date.now();
    try {
      const wslScript = rootDir.replace(/^([a-zA-Z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`).replace(/\\/g, '/') + '/install.sh';
      execSync(`wsl bash -c "mkdir -p /tmp/${testDirName} && cd /tmp/${testDirName} && ${wslScript}"`, { encoding: 'utf-8' });
      const checkFiles = execSync(`wsl bash -c "test -d /tmp/${testDirName}/.agents && test -d /tmp/${testDirName}/docs && test -f /tmp/${testDirName}/AGENTS.md && test -f /tmp/${testDirName}/GEMINI.md && test -f /tmp/${testDirName}/CLAUDE.md && test -f /tmp/${testDirName}/CONTEXT.md && test -f /tmp/${testDirName}/skills-lock.json && test -d /tmp/${testDirName}/.scratch && test -f /tmp/${testDirName}/.scratch/.gitkeep && test -f /tmp/${testDirName}/.gitignore && test ! -f /tmp/${testDirName}/package.json && echo ALL_PASSED"`, { encoding: 'utf-8' });
      assert.match(checkFiles, /ALL_PASSED/);
    } finally {
      execSync(`wsl bash -c "rm -rf /tmp/${testDirName}"`, { stdio: 'pipe' });
    }
  } else {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-sh-test-'));
    try {
      execSync(`bash "${path.join(rootDir, 'install.sh')}"`, { cwd: tempDir, encoding: 'utf-8' });
      assert.ok(fs.existsSync(path.join(tempDir, '.agents')), '.agents/ must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'docs')), 'docs/ must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'AGENTS.md')), 'AGENTS.md must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'GEMINI.md')), 'GEMINI.md must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'CLAUDE.md')), 'CLAUDE.md must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'CONTEXT.md')), 'CONTEXT.md must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, 'skills-lock.json')), 'skills-lock.json must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, '.scratch')), '.scratch/ must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, '.scratch', '.gitkeep')), '.scratch/.gitkeep must be scaffolded by install.sh');
      assert.ok(fs.existsSync(path.join(tempDir, '.gitignore')), '.gitignore must be scaffolded by install.sh');
      assert.ok(!fs.existsSync(path.join(tempDir, 'package.json')), 'package.json MUST NEVER BE CREATED by install.sh');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

test('lifecycle hook block-dangerous-git.cjs blocks dangerous git commands', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'block-dangerous-git.cjs');
  const testCases = [
    { cmd: 'git push origin main', blocked: true },
    { cmd: 'git reset --hard HEAD~1', blocked: true },
    { cmd: 'git clean -fd', blocked: true },
    { cmd: 'git branch -D feat-branch', blocked: true },
    { cmd: 'git status', blocked: false },
    { cmd: 'git add .', blocked: false },
    { cmd: 'git commit -m "feat: valid commit"', blocked: false }
  ];

  for (const tc of testCases) {
    const payload = JSON.stringify({
      toolCall: { name: 'run_command', args: { CommandLine: tc.cmd } }
    });
    const output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
    const result = JSON.parse(output);
    if (tc.blocked) {
      assert.equal(result.decision, 'deny', `Expected '${tc.cmd}' to be blocked`);
    } else {
      assert.equal(result.decision, 'allow', `Expected '${tc.cmd}' to be allowed`);
    }
  }
});

test('lifecycle hook verify-on-stop.cjs executes quality gate on model_stop', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'verify-on-stop.cjs');
  const payload = JSON.stringify({
    terminationReason: 'model_stop',
    workspacePaths: [rootDir]
  });
  const output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
  const result = JSON.parse(output);
  assert.equal(result.decision, 'allow', 'Stop hook should allow when tests pass');
});

test('lifecycle hook verify-on-stop.cjs returns continue when tests fail', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'verify-on-stop.cjs');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-fail-test-'));
  try {
    fs.mkdirSync(path.join(tempDir, 'tests'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, 'tests', 'memory-system.test.mjs'),
      'import test from "node:test"; import assert from "node:assert/strict"; test("returns continue failing test", () => { assert.fail("simulated failure"); });\n'
    );
    const payload = JSON.stringify({
      terminationReason: 'model_stop',
      workspacePaths: [tempDir]
    });
    const cleanEnv = { ...process.env };
    delete cleanEnv.NODE_TEST_CONTEXT;
    delete cleanEnv.NODE_TEST_WORKER_ID;
    const output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8', env: cleanEnv });
    const result = JSON.parse(output);
    assert.equal(result.decision, 'continue', 'Stop hook should return continue to block stop when tests fail');
    assert.match(result.reason, /Quality Gate Failed/, 'Should provide failure reason');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('lifecycle hook handoff-reminder.cjs guards session continuity on model_stop', () => {
  const hookScript = path.join(rootDir, '.agents', 'hooks', 'handoff-reminder.cjs');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-handoff-test-'));
  try {
    const scratchDir = path.join(tempDir, '.scratch');
    fs.mkdirSync(scratchDir, { recursive: true });

    // 1. In a clean directory with no git changes, it allows stop
    const payload = JSON.stringify({
      terminationReason: 'model_stop',
      workspacePaths: [tempDir]
    });
    let output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
    let result = JSON.parse(output);
    assert.equal(result.decision, 'allow', 'Should allow stop when no git changes exist');

    // 2. Initialize a git repo with uncommitted changes
    execSync('git init', { cwd: tempDir, stdio: 'pipe' });
    fs.writeFileSync(path.join(tempDir, 'feature.js'), 'console.log("new code");', 'utf-8');

    // Should return continue because handoff.md is missing
    output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
    result = JSON.parse(output);
    assert.equal(result.decision, 'continue', 'Should prompt to write handoff when uncommitted code changes exist');
    assert.match(result.reason, /Session Continuity Guard/, 'Should include guard reason');

    // Second immediate stop attempt should allow (loop protection)
    output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
    result = JSON.parse(output);
    assert.equal(result.decision, 'allow', 'Should allow stop on second consecutive attempt via loop protection');

    // 3. With fresh handoff.md, it should allow stop
    fs.writeFileSync(path.join(scratchDir, 'handoff.md'), '# Handoff Summary\n', 'utf-8');
    output = execSync(`node "${hookScript}"`, { input: payload, encoding: 'utf-8' });
    result = JSON.parse(output);
    assert.equal(result.decision, 'allow', 'Should allow stop when handoff.md is fresh');

    // 4. Test abnormal termination (token limit / max steps exceeded auto-synthesis)
    const tokenLimitPayload = JSON.stringify({
      terminationReason: 'max_steps_exceeded',
      workspacePaths: [tempDir],
      conversationId: 'test-conv-123'
    });
    fs.rmSync(path.join(scratchDir, 'handoff.md'), { force: true });
    output = execSync(`node "${hookScript}"`, { input: tokenLimitPayload, encoding: 'utf-8' });
    result = JSON.parse(output);
    assert.equal(result.decision, 'allow', 'Should allow stop on max_steps_exceeded');
    assert.ok(fs.existsSync(path.join(scratchDir, 'handoff.md')), 'Should auto-synthesize handoff.md on max_steps_exceeded without requiring LLM interaction');
    const handoffText = fs.readFileSync(path.join(scratchDir, 'handoff.md'), 'utf-8');
    assert.match(handoffText, /max_steps_exceeded/, 'Handoff must record termination reason');
    assert.match(handoffText, /feature\.js/, 'Handoff must record modified files');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('CLI upgrade updates framework rules and directives while strictly preserving user CONTEXT.md and secrets', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-upgrade-test-'));
  try {
    // 1. Setup simulated older workspace (e.g. v5.0.3)
    const agentsDir = path.join(tempDir, '.agents');
    fs.mkdirSync(path.join(agentsDir, 'rules'), { recursive: true });
    fs.mkdirSync(path.join(agentsDir, 'hooks'), { recursive: true });
    fs.mkdirSync(path.join(tempDir, '.scratch'), { recursive: true });

    // Existing user-defined CONTEXT.md
    const userDomainContent = '# Proprietary Domain Models\nVery important custom business rules that must not be deleted.\n';
    fs.writeFileSync(path.join(tempDir, 'CONTEXT.md'), userDomainContent, 'utf-8');

    // Existing user secrets in .agents/mcp_config.json
    const userSecretContent = JSON.stringify({ my_token: 'secret_abc_123' });
    fs.writeFileSync(path.join(agentsDir, 'mcp_config.json'), userSecretContent, 'utf-8');

    // Existing hooks.json with user custom hook and disabled git-guardrails
    const existingHooks = {
      'custom-security-scan': {
        enabled: true,
        Stop: [{ type: 'command', command: 'echo scanning', timeout: 5 }]
      },
      'git-guardrails': {
        enabled: false,
        PreToolUse: []
      }
    };
    fs.writeFileSync(path.join(agentsDir, 'hooks.json'), JSON.stringify(existingHooks, null, 2), 'utf-8');

    // Existing scratchpad handoff
    fs.writeFileSync(path.join(tempDir, '.scratch', 'handoff.md'), '# Active Session Handoff\n', 'utf-8');

    // Outdated AGENTS.md
    fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Outdated Antigravity Agent Guidelines v5.0.3\n', 'utf-8');

    // 2. Run upgrade
    const output = execSync(`node "${cliPath}" upgrade`, { cwd: tempDir, encoding: 'utf-8' });
    assert.match(output, /Upgrading AAC \(Antigravity Agent Core\) to v5\.2\.0/);
    assert.match(output, /Preserved user domain context: CONTEXT\.md/);
    assert.match(output, /Preserved workspace secrets: \.agents\/mcp_config\.json/);

    // 3. Verify user files are strictly preserved
    const actualContext = fs.readFileSync(path.join(tempDir, 'CONTEXT.md'), 'utf-8');
    assert.equal(actualContext, userDomainContent, 'CONTEXT.md must be 100% byte-for-byte preserved');

    const actualSecrets = fs.readFileSync(path.join(agentsDir, 'mcp_config.json'), 'utf-8');
    assert.equal(actualSecrets, userSecretContent, '.agents/mcp_config.json must remain untouched');

    assert.ok(fs.existsSync(path.join(tempDir, '.scratch', 'handoff.md')), '.scratch/ handoffs must be preserved');
    assert.ok(!fs.existsSync(path.join(tempDir, 'package.json')), 'package.json must NEVER be created');

    // 4. Verify framework directives were updated to latest
    const upgradedAgents = fs.readFileSync(path.join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.match(upgradedAgents, /file:\/\/\//, 'AGENTS.md must be updated with latest directives and clickable links');

    assert.ok(fs.existsSync(path.join(agentsDir, 'rules', 'production-integrity.md')), 'production-integrity rule must be installed');
    assert.ok(fs.existsSync(path.join(agentsDir, 'rules', 'memory-management.md')), 'memory-management rule must be installed');
    assert.ok(fs.existsSync(path.join(agentsDir, 'hooks', 'handoff-reminder.cjs')), 'handoff-reminder hook script must be installed');

    // 5. Verify smart hooks merge
    const mergedHooks = JSON.parse(fs.readFileSync(path.join(agentsDir, 'hooks.json'), 'utf-8'));
    assert.ok(mergedHooks['custom-security-scan'], 'User custom hook must be preserved');
    assert.equal(mergedHooks['git-guardrails'].enabled, false, 'User toggle enabled: false must be preserved');
    assert.ok(mergedHooks['session-handoff'], 'New framework hook group session-handoff must be injected');
    assert.ok(mergedHooks['quality-gate'], 'New framework hook group quality-gate must be injected');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('install.ps1 -Upgrade updates framework files while preserving CONTEXT.md', (t) => {
  if (process.platform !== 'win32') {
    t.skip('PowerShell test requires Windows');
    return;
  }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-ps1-upgrade-'));
  const ps1Script = path.join(rootDir, 'install.ps1');
  try {
    // Initial scaffold
    execSync(`powershell -ExecutionPolicy Bypass -File "${ps1Script}"`, { cwd: tempDir, encoding: 'utf-8' });

    // Mutate CONTEXT.md with user-owned content
    const customContext = '# Custom Domain Glossary & Specs\nMy special business terms.\n';
    fs.writeFileSync(path.join(tempDir, 'CONTEXT.md'), customContext, 'utf-8');

    // Run upgrade
    const output = execSync(`powershell -ExecutionPolicy Bypass -File "${ps1Script}" -Upgrade`, { cwd: tempDir, encoding: 'utf-8' });
    assert.match(output, /Upgrading AAC/);
    assert.match(output, /Preserved user domain context: CONTEXT\.md/);

    const afterContext = fs.readFileSync(path.join(tempDir, 'CONTEXT.md'), 'utf-8');
    assert.equal(afterContext, customContext, 'CONTEXT.md must never be overwritten during install.ps1 -Upgrade');
    assert.ok(!fs.existsSync(path.join(tempDir, 'package.json')), 'package.json must not exist');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('install.sh --upgrade updates framework files while preserving CONTEXT.md', (t) => {
  let canRunBash = false;
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    try {
      execSync('wsl bash -c "echo OK"', { stdio: 'pipe' });
      canRunBash = true;
    } catch {
      canRunBash = false;
    }
  } else {
    try {
      execSync('bash -c "echo OK"', { stdio: 'pipe' });
      canRunBash = true;
    } catch {
      canRunBash = false;
    }
  }

  if (!canRunBash) {
    t.skip('bash/wsl is not available in environment');
    return;
  }

  if (isWindows) {
    const testDirName = 'aac-sh-up-' + Date.now();
    try {
      const wslScript = rootDir.replace(/^([a-zA-Z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`).replace(/\\/g, '/') + '/install.sh';
      execSync(`wsl bash -c "mkdir -p /tmp/${testDirName} && cd /tmp/${testDirName} && ${wslScript}"`, { encoding: 'utf-8' });
      execSync(`wsl bash -c "echo 'CUSTOM_USER_CONTEXT' > /tmp/${testDirName}/CONTEXT.md"`, { encoding: 'utf-8' });
      const output = execSync(`wsl bash -c "cd /tmp/${testDirName} && ${script} --upgrade"`, { encoding: 'utf-8' });
      assert.match(output, /Upgrading AAC/);
      assert.match(output, /Preserved user domain context: CONTEXT\.md/);
      const content = execSync(`wsl bash -c "cat /tmp/${testDirName}/CONTEXT.md"`, { encoding: 'utf-8' });
      assert.match(content, /CUSTOM_USER_CONTEXT/);
    } finally {
      execSync(`wsl bash -c "rm -rf /tmp/${testDirName}"`, { stdio: 'pipe' });
    }
  } else {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-sh-up-'));
    try {
      const script = path.join(rootDir, 'install.sh');
      execSync(`bash "${script}"`, { cwd: tempDir, encoding: 'utf-8' });
      fs.writeFileSync(path.join(tempDir, 'CONTEXT.md'), 'CUSTOM_USER_CONTEXT\n', 'utf-8');
      const output = execSync(`bash "${script}" --upgrade`, { cwd: tempDir, encoding: 'utf-8' });
      assert.match(output, /Upgrading AAC/);
      assert.match(output, /Preserved user domain context: CONTEXT\.md/);
      const content = fs.readFileSync(path.join(tempDir, 'CONTEXT.md'), 'utf-8');
      assert.match(content, /CUSTOM_USER_CONTEXT/);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});




