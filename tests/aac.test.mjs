import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repoRoot, 'bin', 'cli.mjs');
const hooksJsonPath = path.join(repoRoot, '.agents', 'hooks.json');

function cleanHookEnv(extraEnv = {}) {
  const childEnv = { ...process.env };
  delete childEnv.AAC_QUALITY_GATE_RUNNING;
  delete childEnv.AAC_SKIP_STOP_TEST;
  return { ...childEnv, ...extraEnv };
}

function runHook(command, stdinJson, cwd = repoRoot, env = {}) {
  const res = spawnSync(command, {
    shell: true,
    cwd,
    input: JSON.stringify(stdinJson),
    encoding: 'utf8',
    timeout: 5000,
    env: cleanHookEnv(env),
  });
  assert.equal(res.status, 0, `Hook failed: ${res.stderr}`);
  return JSON.parse(res.stdout.trim());
}

function runHookRaw(command, rawInput, cwd = repoRoot) {
  const res = spawnSync(command, {
    shell: true,
    cwd,
    input: rawInput,
    encoding: 'utf8',
    timeout: 5000,
    env: cleanHookEnv(),
  });
  assert.equal(res.status, 0, `Hook failed: ${res.stderr}`);
  return JSON.parse(res.stdout.trim());
}

function hookCommand(hooks, name) {
  return hooks[name].PreToolUse[0].hooks[0].command;
}

function canRun(command, args) {
  const res = spawnSync(command, args, { encoding: 'utf8' });
  return !res.error && res.status === 0;
}

function readFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  assert.ok(match, `Missing YAML frontmatter in ${path.relative(repoRoot, filePath)}`);
  return match[1];
}

function frontmatterValue(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^"(.*)"$/, '$1') : undefined;
}

test('P0-1 & P2-7: CLI init, idempotency, non-destructive upgrade, conflict backup, malformed hooks, dry-run, and uninstall', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-cli-test-'));
  try {
    // 1. Dry-run performs zero writes
    execFileSync(process.execPath, [cliPath, 'init', '--target', tmpDir, '--dry-run'], { encoding: 'utf8' });
    assert.equal(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), false);

    // 2. Fresh init creates expected tree & manifest
    execFileSync(process.execPath, [cliPath, 'init', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(fs.existsSync(path.join(tmpDir, 'AGENTS.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, 'CONTEXT.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', '.aac-manifest.json')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'skills', 'wave-execute', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'skills', 'perf-audit', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'agents', 'security-auditor.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'agents', 'architecture-planner.md')), true);
    assert.equal(fs.existsSync(path.join(tmpDir, 'package.json')), false);

    // 2b. The MCP templates referenced by SECURITY.md and docs/agents/issue-tracker.md must actually ship.
    const mcpExamplePath = path.join(tmpDir, '.agents', 'mcp_config.example.json');
    const mcpEnvExamplePath = path.join(tmpDir, '.agents', 'mcp.env.example');
    assert.equal(fs.existsSync(mcpExamplePath), true, 'init must install .agents/mcp_config.example.json (documented copy source)');
    assert.equal(fs.existsSync(mcpEnvExamplePath), true, 'init must install .agents/mcp.env.example');
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'git-guard.cjs')), true, 'init must install .agents/git-guard.cjs');
    assert.doesNotMatch(fs.readFileSync(mcpExamplePath, 'utf8'), /"(?:token|password|secret|apiKey)"\s*:\s*"[^"$]/, 'MCP template must not embed literal credentials');
    assert.doesNotMatch(fs.readFileSync(mcpExamplePath, 'utf8'), /"command"\s*:\s*"docker"/, 'MCP template must default to daemon-free stdio (Node/npx) to avoid Docker Desktop named pipe crashes on Windows');
    const mcpJson = JSON.parse(fs.readFileSync(mcpExamplePath, 'utf8'));
    assert.equal(Object.keys(mcpJson.mcpServers).length, 1, 'MCP template must follow DRY and define exactly one canonical server entry');

    // 3. Modify AGENTS.md, a rule, CONTEXT.md, and add a custom hook + toggle enabled: false
    const agentsPath = path.join(tmpDir, 'AGENTS.md');
    fs.appendFileSync(agentsPath, '\n<!-- Custom User Constitution Line -->\n');
    const rulePath = path.join(tmpDir, '.agents', 'rules', 'ui-and-dry.md');
    fs.appendFileSync(rulePath, '\n<!-- Custom Rule Tweak -->\n');
    const contextPath = path.join(tmpDir, 'CONTEXT.md');
    fs.writeFileSync(contextPath, '# Custom User Context\n');

    const dstHooksPath = path.join(tmpDir, '.agents', 'hooks.json');
    const hooksObj = JSON.parse(fs.readFileSync(dstHooksPath, 'utf8'));
    hooksObj['git-destructive-guard'].enabled = false;
    hooksObj['custom-user-hook'] = { enabled: true, Stop: [] };
    fs.writeFileSync(dstHooksPath, JSON.stringify(hooksObj, null, 2));

    // 4. Non-destructive upgrade preserves user-modified AGENTS.md & rule, writes .aac-new, prunes unmodified deprecated files, and merges hooks
    const legacyManifest = JSON.parse(fs.readFileSync(path.join(tmpDir, '.agents', '.aac-manifest.json'), 'utf8'));
    const deprecatedUnmodified = path.join(tmpDir, '.agents', 'rules', 'caveman.md');
    const deprecatedContent = '# Deprecated rule\n';
    fs.writeFileSync(deprecatedUnmodified, deprecatedContent);
    legacyManifest.files['.agents/rules/caveman.md'] = crypto.createHash('sha256').update(deprecatedContent).digest('hex');
    const deprecatedModified = path.join(tmpDir, '.agents', 'rules', 'ponytail.md');
    fs.writeFileSync(deprecatedModified, '# User customized legacy rule\n');
    legacyManifest.files['.agents/rules/ponytail.md'] = crypto.createHash('sha256').update('# Old upstream\n').digest('hex');
    fs.writeFileSync(path.join(tmpDir, '.agents', '.aac-manifest.json'), JSON.stringify(legacyManifest, null, 2));

    execFileSync(process.execPath, [cliPath, 'upgrade', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(fs.existsSync(deprecatedUnmodified), false, 'Unmodified deprecated managed file must be pruned on upgrade');
    assert.equal(fs.existsSync(deprecatedModified), true, 'User-modified deprecated file must be preserved on upgrade');
    assert.match(fs.readFileSync(agentsPath, 'utf8'), /Custom User Constitution Line/);
    assert.equal(fs.existsSync(`${agentsPath}.aac-new`), true);
    assert.match(fs.readFileSync(rulePath, 'utf8'), /Custom Rule Tweak/);
    assert.equal(fs.existsSync(`${rulePath}.aac-new`), true);
    assert.equal(fs.readFileSync(contextPath, 'utf8'), '# Custom User Context\n');

    // 4b. CLI --help and --version exit 0 cleanly
    const pkgMeta = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
    const helpOut = execFileSync(process.execPath, [cliPath, '--help'], { encoding: 'utf8' });
    assert.match(helpOut, /Usage:/);
    const verOut = execFileSync(process.execPath, [cliPath, '--version'], { encoding: 'utf8' }).trim();
    assert.equal(verOut, pkgMeta.version);

    const mergedHooks = JSON.parse(fs.readFileSync(dstHooksPath, 'utf8'));
    assert.equal(mergedHooks['git-destructive-guard'].enabled, false);
    assert.deepEqual(mergedHooks['custom-user-hook'], { enabled: true, Stop: [] });

    // Verify backup directory was created
    const backupsDir = path.join(tmpDir, '.scratch', 'backups');
    assert.equal(fs.existsSync(backupsDir), true);
    assert.ok(fs.readdirSync(backupsDir).length >= 1);

    // 5. Malformed hooks.json aborts with non-zero exit code instead of silently overwriting
    fs.writeFileSync(dstHooksPath, '{ invalid json ');
    const badRes = spawnSync(process.execPath, [cliPath, 'upgrade', '--target', tmpDir], { encoding: 'utf8' });
    assert.notEqual(badRes.status, 0);
    assert.equal(fs.readFileSync(dstHooksPath, 'utf8'), '{ invalid json ');
    fs.writeFileSync(dstHooksPath, JSON.stringify(mergedHooks, null, 2));

    // 5b. Corrupt local manifest must fail closed instead of crashing with a raw stack or overwriting
    const manifestPath = path.join(tmpDir, '.agents', '.aac-manifest.json');
    const goodManifest = fs.readFileSync(manifestPath, 'utf8');
    fs.writeFileSync(manifestPath, '{ not-json ');
    const badManifest = spawnSync(process.execPath, [cliPath, 'upgrade', '--target', tmpDir], { encoding: 'utf8' });
    assert.notEqual(badManifest.status, 0);
    assert.match(badManifest.stderr, /manifest/i);
    assert.equal(fs.readFileSync(manifestPath, 'utf8'), '{ not-json ');
    fs.writeFileSync(manifestPath, goodManifest);

    // 6. --with-sidecar without --project-id fails fast
    const noPid = spawnSync(process.execPath, [cliPath, 'init', '--target', tmpDir, '--with-sidecar'], { encoding: 'utf8' });
    assert.notEqual(noPid.status, 0);

    // 7. Uninstall removes unmodified managed files while keeping user-modified AGENTS.md & CONTEXT.md
    execFileSync(process.execPath, [cliPath, 'uninstall', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(fs.existsSync(agentsPath), true, 'User-modified AGENTS.md should be kept on uninstall without --force');
    assert.equal(fs.existsSync(contextPath), true, 'CONTEXT.md must always be preserved');
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'rules', 'coding-standards.md')), false);
    assert.equal(fs.existsSync(mcpExamplePath), false, 'unmodified MCP templates are managed files and must be removed on uninstall');
    assert.equal(fs.existsSync(mcpEnvExamplePath), false, 'unmodified MCP env template must be removed on uninstall');
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'git-guard.cjs')), false, 'unmodified git-guard.cjs must be removed on uninstall');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P0-5: Uninstall rejects unsafe manifest paths (traversal, non-managed files, directories)', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-uninstall-safety-'));
  const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-uninstall-outside-'));
  const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  try {
    const rulesDir = path.join(tmpDir, '.agents', 'rules');
    fs.mkdirSync(rulesDir, { recursive: true });
    const managed = path.join(rulesDir, 'coding-standards.md');
    fs.writeFileSync(managed, 'managed\n');
    const victim = path.join(tmpDir, 'victim.txt');
    fs.writeFileSync(victim, 'user file\n');
    const domainDoc = path.join(tmpDir, 'docs', 'domains', 'auth.md');
    fs.mkdirSync(path.dirname(domainDoc), { recursive: true });
    fs.writeFileSync(domainDoc, '# Auth Domain\n');
    const outside = path.join(outsideDir, 'outside.txt');
    fs.writeFileSync(outside, 'outside file\n');
    const escape = path.relative(tmpDir, outside).replace(/\\/g, '/');

    fs.writeFileSync(path.join(tmpDir, '.agents', '.aac-manifest.json'), JSON.stringify({
      version: '6.0.0',
      files: {
        '.agents/rules/coding-standards.md': sha(managed),
        'victim.txt': sha(victim),
        'docs/domains/auth.md': sha(domainDoc),
        [escape]: sha(outside),
        '.agents/rules/../../victim.txt': sha(victim),
        '.agents/rules': sha(managed),
      },
    }, null, 2));

    const out = spawnSync(process.execPath, [cliPath, 'uninstall', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(out.status, 0, out.stderr);
    assert.equal(fs.existsSync(managed), false, 'managed file should still be removed');
    assert.equal(fs.existsSync(victim), true, 'non-managed file inside the repo must not be deleted');
    assert.equal(fs.existsSync(domainDoc), true, 'Hub+Spoke docs/domains/ file must not be deleted by uninstall');
    assert.equal(fs.existsSync(outside), true, 'path traversal outside the target must not delete anything');
    assert.match(out.stderr, /Skipped unsafe manifest entry/);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync(outsideDir, { recursive: true, force: true });
  }
});

test('P0-6: Installers delegate every write to bin/cli.mjs and refuse to run without Node >= 22', () => {
  const sh = fs.readFileSync(path.join(repoRoot, 'install.sh'), 'utf8');
  const ps1 = fs.readFileSync(path.join(repoRoot, 'install.ps1'), 'utf8');

  for (const [name, body] of [['install.sh', sh], ['install.ps1', ps1]]) {
    assert.match(body, /bin[\\/]cli\.mjs/, `${name} must delegate to bin/cli.mjs`);
    assert.match(body, />=\s*22|>=22/, `${name} must state the Node >= 22 requirement`);
    assert.doesNotMatch(body, /refs\/heads\/main/, `${name} must not silently fall back to a mutable branch`);
  }

  // Only the manifest-tracked CLI writes managed files. A second copy path skips backups, hashing,
  // and `.aac-new` staging, silently clobbering user edits.
  assert.doesNotMatch(sh, /\bcp\s+-[a-zA-Z]*[rR]/, 'install.sh must not copy managed files itself');
  assert.doesNotMatch(sh, /\bexec\s+node\b/, 'install.sh must not exec node: it skips the EXIT trap and leaks the temp archive');
  assert.doesNotMatch(ps1, /ConvertTo-Json/, 'install.ps1 must not merge hooks itself: PowerShell 5.1 writes a UTF-8 BOM that breaks JSON.parse');
  assert.doesNotMatch(ps1, /Copy-Item[^\r\n]*\.agents/, 'install.ps1 must not copy managed files itself');

  // Pinned release alignment: install.sh, install.ps1, bin/cli.mjs, and SECURITY.md must strictly track package.json.version.
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const cliBody = fs.readFileSync(path.join(repoRoot, 'bin', 'cli.mjs'), 'utf8');
  const securityBody = fs.readFileSync(path.join(repoRoot, 'SECURITY.md'), 'utf8');

  assert.match(sh, new RegExp(`AAC_REF="\\$\\{AAC_REF:-v${pkg.version}\\}"`), `install.sh default ref must match package.json v${pkg.version}`);
  assert.match(ps1, new RegExp(`\\$ref = if \\(\\[string\\]::IsNullOrWhiteSpace\\(\\$env:AAC_REF\\)\\) \\{ "v${pkg.version}" \\}`), `install.ps1 default ref must match package.json v${pkg.version}`);
  assert.match(cliBody, new RegExp(`const VERSION = '${pkg.version}';`), `bin/cli.mjs VERSION must match package.json ${pkg.version}`);
  assert.match(securityBody, new RegExp(`pinned to the \`v${pkg.version}\` ref`), `SECURITY.md must document pinned downloads matching package.json v${pkg.version}`);

  // `bash` on Windows is the WSL relay, which cannot run a Windows-path script; syntax-check on POSIX only.
  if (process.platform !== 'win32' && canRun('bash', ['-c', 'exit 0'])) {
    const syntax = spawnSync('bash', ['-n', path.join(repoRoot, 'install.sh')], { encoding: 'utf8' });
    assert.equal(syntax.status, 0, `install.sh has a syntax error: ${syntax.stderr}`);
  }

  if (canRun('powershell.exe', ['-NoProfile', '-Command', 'exit 0'])) {
    const target = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-ps-install-'));
    try {
      const out = spawnSync(
        'powershell.exe',
        ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(repoRoot, 'install.ps1'), '-TargetDir', target, '-DryRun'],
        { encoding: 'utf8', timeout: 60000 },
      );
      assert.equal(out.status, 0, `install.ps1 -DryRun failed: ${out.stderr || out.stdout}`);
      assert.equal(fs.existsSync(path.join(target, 'AGENTS.md')), false, 'install.ps1 -DryRun must not write managed files');
      assert.equal(fs.existsSync(path.join(target, '.agents')), false, 'install.ps1 -DryRun must not create .agents');
    } finally {
      fs.rmSync(target, { recursive: true, force: true });
    }
  }
});

test('P0-4: Hook contract & full Git + Mock bypass corpus verification', () => {
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  const gitHookCmd = hookCommand(hooks, 'git-destructive-guard');
  const mockHookCmd = hookCommand(hooks, 'production-no-mock-guard');

  const destructiveGitCorpus = [
    'git push origin main',
    'git push origin master',
    'git push -u origin main',
    'git push origin main --force',
    'git push -f origin main',
    'git push --delete origin main',
    'sudo git push origin main',
    'git.exe push origin main',
  ];

  for (const cmd of destructiveGitCorpus) {
    const out = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } });
    assert.equal(out.decision, 'ask', `Expected 'ask' for push to main: ${cmd}`);
  }

  const strictBlockedGitCorpus = [
    'git push origin release/v1.0',
    'git push origin production',
    'git push origin staging',
    'git push origin feat/new-branch --force',
    'git push -f origin feat/new-branch',
    'git push --force-with-lease -f origin feat/new-branch',
    'echo --force-with-lease && git push -f origin feat/new-branch',
    'git reset --hard',
    'git clean -fd',
    'git clean -fdx',
    'git clean -f -d',
  ];

  for (const cmd of strictBlockedGitCorpus) {
    const out = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } });
    assert.equal(out.decision, 'ask', `Expected 'ask' in strict mode for: ${cmd}`);
    const legacyOut = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } }, repoRoot, { AAC_GIT_GUARD_MODE: 'legacy' });
    const expectedLegacy = /\bpush\b.*?\b(release\/|production|staging)\b/i.test(cmd) ? 'ask' : 'allow';
    assert.equal(legacyOut.decision, expectedLegacy, `Expected '${expectedLegacy}' in legacy mode for: ${cmd}`);
  }

  const safeGitCorpus = [
    'git status -sb',
    'git push origin feat/new-branch',
    'git push --force-with-lease origin feat/new-branch',
    'git push origin dev',
    'git checkout -b feat/new-branch',
    'git checkout main',
    'git branch -d merged-branch',
    'git branch -D main',
    'git log -1 --oneline',
    'git stash list',
    'git stash',
    'git worktree list',
    'git -C /repo status',
    'git remote -v',
    'git diff HEAD~1',
    'git commit -m "feat: standard commit"',
    'git config --get user.name',
    'git switch -c feat/x',
  ];

  for (const cmd of safeGitCorpus) {
    const out = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } });
    assert.equal(out.decision, 'allow', `Expected 'allow' for safe git command: ${cmd}`);
  }

  const bannedMockCorpus = [
    'const mockUsers = []',
    'const mockUsers: User[] = []',
    'let fakeDb = {}',
    'let fakeDatabase = {}',
    'const dummyId = "dummy_id"',
    'const token = "fake-token"',
    '// TODO: implement later',
    'function createMockDb() {}',
    'class FakeRepository {}',
    'jest.mock("./paymentGateway")',
  ];

  // Every Antigravity file-write tool must be covered, including its real argument name.
  const productionWrites = [
    { TargetFile: 'src/service/payment.ts', CodeContent: 'X_SNIPPET_X' },
    { TargetFile: 'src/service/payment.ts', ReplacementContent: 'X_SNIPPET_X' },
    { TargetFile: 'src/service/payment.ts', ReplacementChunks: [{ ReplacementContent: 'X_SNIPPET_X' }] },
  ];

  for (const snippet of bannedMockCorpus) {
    for (const baseArgs of productionWrites) {
      const args = { ...baseArgs };
      for (const key of Object.keys(args)) {
        args[key] = typeof args[key] === 'string'
          ? args[key].replace('X_SNIPPET_X', snippet)
          : args[key].map((chunk) => ({ ...chunk, ReplacementContent: snippet }));
      }
      const out = runHook(mockHookCmd, { toolCall: { args } });
      assert.equal(out.decision, 'ask', `Expected 'ask' for production mock/stub via ${Object.keys(baseArgs).join(',')}: ${snippet}`);
    }

    for (const baseArgs of productionWrites) {
      const args = { ...baseArgs };
      for (const key of Object.keys(args)) {
        args[key] = typeof args[key] === 'string'
          ? args[key].replace('X_SNIPPET_X', snippet)
          : args[key].map((chunk) => ({ ...chunk, ReplacementContent: snippet }));
      }
      args.TargetFile = 'src/service/payment.test.ts';
      const testOut = runHook(mockHookCmd, { toolCall: { args } });
      assert.equal(testOut.decision, 'allow', `Expected 'allow' in test file for: ${snippet}`);
    }
  }

  const safeProductionSnippets = [
    'const users = []',
    'const paymentGateway = createStripeGateway(process.env.STRIPE_KEY)',
    'const repository = new PostgresUserRepository(pool)',
  ];
  for (const snippet of safeProductionSnippets) {
    const out = runHook(mockHookCmd, { toolCall: { args: { TargetFile: 'src/service/payment.ts', CodeContent: snippet } } });
    assert.equal(out.decision, 'allow', `Expected 'allow' for genuine production code: ${snippet}`);
  }

  const bannedTestTamperCorpus = [
    "it.skip('should pay', () => {})",
    "test.skip('edge case', () => {})",
    "describe.skip('suite', () => {})",
    "xit('temporary bypass', () => {})",
    "xdescribe('skipped group', () => {})",
    "@pytest.mark.skip(reason='broken')",
    "@unittest.skip('not implemented')",
    "t.Skip('skip in Go')",
    "expect(true).toBe(true)",
    "assert.ok(true)",
  ];

  for (const snippet of bannedTestTamperCorpus) {
    const out = runHook(mockHookCmd, { toolCall: { args: { TargetFile: 'src/service/payment.test.ts', CodeContent: snippet } } });
    assert.equal(out.decision, 'ask', `Expected 'ask' for test tampering snippet: ${snippet}`);
    assert.match(out.reason, /Anti-Test-Tampering Guard/i);
  }

  // Dual-platform tool argument support (edit_file / write_file with Path and Replacement)
  const editFileBypass = runHook(mockHookCmd, { toolCall: { args: { Path: 'src/repo/account.ts', Replacement: 'const mockStore = new Map();' } } });
  assert.equal(editFileBypass.decision, 'ask', 'production-no-mock-guard must intercept mock patterns in edit_file tool calls with Path and Replacement');
  assert.match(editFileBypass.reason, /production-no-mock-guard/i);

  // Dart / Flutter test files are allowed mocks, but blocked on test tampering
  const dartMockInTest = runHook(mockHookCmd, { toolCall: { args: { Path: 'test/features/auth/login_test.dart', Content: 'final mockRepo = MockAuthRepo();' } } });
  assert.equal(dartMockInTest.decision, 'allow', 'Dart *_test.dart files must be recognized as test files');
  const dartSkipProp = 'skip' + ': true';
  const dartTamper = runHook(mockHookCmd, { toolCall: { args: { Path: 'test/features/auth/login_test.dart', Content: `test("auth", () {}, ${dartSkipProp});` } } });
  assert.equal(dartTamper.decision, 'ask', 'Dart skip flag must be intercepted by Anti-Test-Tampering Guard');
  assert.match(dartTamper.reason, /Anti-Test-Tampering Guard/i);

  // Hardcoded secret / credential literal guard (expanded OWASP/Gitleaks corpus, non-echoing)
  const syntheticSecrets = [
    ['stripe-key', 'sk_' + 'live_' + '1234567890abcdef1234'],
    ['stripe-test', 'sk_' + 'test_' + '1234567890abcdef1234'],
    ['aws-key', 'AS' + 'IA' + 'IOSFODNN7EXAMPLE12'],
    ['github-token', 'gh' + 'o_' + '1234567890abcdefghij123456'],
    ['slack-token', 'xo' + 'xb-' + '123456789012-123456789012-abcd'],
    ['gcp-key', 'AI' + 'za' + 'SyDaGmWKa4JsXZ-1234567890abcdef12345'],
    ['db-uri-password', 'postgres://' + 'admin:Sup3rS3cretPass@db.internal:5432/prod'],
    ['jwt-literal', 'const tok = "' + 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"'],
  ];
  for (const [label, secretVal] of syntheticSecrets) {
    const secretLeak = runHook(mockHookCmd, { toolCall: { args: { Path: 'lib/config/env.dart', Content: `const val = '${secretVal}';` } } });
    assert.equal(secretLeak.decision, 'ask', `Secret Leak Guard must block ${label}`);
    assert.match(secretLeak.reason, /Secret Leak Guard/i);
    assert.equal(secretLeak.reason.includes(secretVal), false, `Secret Leak Guard must never echo raw ${label}`);
  }
  const safeTemplateUri = runHook(mockHookCmd, { toolCall: { args: { Path: 'src/config/db.ts', Content: 'const dsn = `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/app`;' } } });
  assert.equal(safeTemplateUri.decision, 'allow', 'Parameterized env DB URI must not trigger Secret Leak Guard');
  const webhookJsonLeak = runHook(mockHookCmd, { toolCall: { args: { Path: 'src/webhooks.json', Content: `{"token":"${'gh' + 'p_' + '1234567890abcdefghij123456'}"}` } } });
  assert.equal(webhookJsonLeak.decision, 'ask', 'Only root/named hooks.json/package.json are exempt, never src/webhooks.json');

  // Guard payloads that cannot be parsed must fail closed (ask), never silently allow.
  for (const [name, cmd] of [['git-destructive-guard', gitHookCmd], ['production-no-mock-guard', mockHookCmd]]) {
    const out = runHookRaw(cmd, '{ this is not json');
    assert.equal(out.decision, 'ask', `${name} must fail closed on malformed stdin, not allow`);
    assert.match(out.reason, /fail-closed/i, `${name} must explain the fail-closed decision`);
  }

  // PostToolUse back-pressure hook catches broken JSON and JS/ESM syntax immediately after edit
  const postHookCmd = hooks['post-edit-backpressure'].PostToolUse[0].hooks[0].command;
  const tmpPostDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-post-hook-'));
  try {
    const badJsonPath = path.join(tmpPostDir, 'bad.json');
    fs.writeFileSync(badJsonPath, '{ broken json ');
    const badJsonOut = runHook(postHookCmd, { workspacePaths: [tmpPostDir], toolCall: { args: { TargetFile: badJsonPath } } }, tmpPostDir);
    assert.equal(badJsonOut.decision, 'block', 'PostToolUse must block on malformed JSON write');
    assert.equal(badJsonOut.hookSpecificOutput?.hookEventName, 'PostToolUse');

    const badJsPath = path.join(tmpPostDir, 'bad.mjs');
    fs.writeFileSync(badJsPath, 'export function broken( { return 1; }\n');
    const badJsOut = runHook(postHookCmd, { workspacePaths: [tmpPostDir], toolCall: { args: { Path: badJsPath } } }, tmpPostDir);
    assert.equal(badJsOut.decision, 'block', 'PostToolUse must block on JS/ESM syntax error');

    const goodJsPath = path.join(tmpPostDir, 'good.mjs');
    fs.writeFileSync(goodJsPath, 'export const ok = 1;\n');
    const goodJsOut = runHook(postHookCmd, { workspacePaths: [tmpPostDir], toolCall: { args: { Path: goodJsPath } } }, tmpPostDir);
    assert.equal(goodJsOut.decision, 'allow', 'PostToolUse must allow syntactically valid JS/ESM');
  } finally {
    fs.rmSync(tmpPostDir, { recursive: true, force: true });
  }
});

test('P0-7: quality-gate-stop-sensor blocks premature completion on NO_TOOL_CALL and protects against continuation loops', () => {
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  const stopHookCmd = hooks['quality-gate-stop-sensor'].Stop[0].command;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-stop-test-'));
  try {
    // 1. Clean tree or non-agent-end terminationReason returns allow
    const cleanOut = runHook(stopHookCmd, { terminationReason: 'USER_CANCELED', workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(cleanOut.decision, 'allow');

    // 2. Initialize a git repo with a failing package test and modified files
    spawnSync('git', ['init'], { cwd: tmpDir });
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      scripts: { test: 'node -e "process.exit(1)"' }
    }));
    fs.writeFileSync(path.join(tmpDir, 'tracked.txt'), 'initial\n');
    spawnSync('git', ['add', '.'], { cwd: tmpDir });
    spawnSync('git', ['commit', '-m', 'initial'], {
      cwd: tmpDir,
      env: { ...process.env, GIT_AUTHOR_NAME: 'test', GIT_AUTHOR_EMAIL: 'test@test.com', GIT_COMMITTER_NAME: 'test', GIT_COMMITTER_EMAIL: 'test@test.com' }
    });

    // Modify file so working tree is dirty
    fs.writeFileSync(path.join(tmpDir, 'tracked.txt'), 'modified\n');

    const dirtyFailingOut = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(dirtyFailingOut.decision, 'continue', 'Stop hook must return continue when tests fail on dirty working tree');
    assert.match(dirtyFailingOut.reason, /Quality Gate Sensor Failed/i);

    // 2b. When continuationActive is true, allow stop so the hook does not trigger an infinite loop
    const loopGuardOut = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: true, workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(loopGuardOut.decision, 'allow', 'Stop hook must allow stop when continuationActive is true to prevent infinite loops');

    // 3. When tests pass, allow stop
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
      scripts: { test: 'node -e "process.exit(0)"' }
    }));
    const dirtyPassingOut = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(dirtyPassingOut.decision, 'allow', 'Stop hook must allow stop when tests pass');

    // 3b. Documentation/markdown diffs mentioning skip patterns must not trigger false positives
    fs.writeFileSync(path.join(tmpDir, 'README.md'), 'Never use `' + 'it' + '.skip` in tests.\n');
    const docsPassingOut = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(docsPassingOut.decision, 'allow', 'Stop hook must not flag documentation files mentioning test-skip patterns');

    // 4. When tests pass exit code 0, BUT git diff introduces test skipping (.skip / xit / etc.), reject stop
    fs.writeFileSync(path.join(tmpDir, 'service.test.js'), 'it.skip("bypassed test", () => {});\n');
    const tamperedOut = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpDir] }, repoRoot);
    assert.equal(tamperedOut.decision, 'continue', 'Stop hook must return continue when test tampering is detected in git diff');
    assert.match(tamperedOut.reason, /Test tampering \/ skipping detected/i);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // 5. Monorepo workspace scoping: typecheck + lint + test on changed workspace only, plus opt-out & timeout guard
  const tmpMono = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-stop-mono-'));
  try {
    spawnSync('git', ['init'], { cwd: tmpMono });
    fs.mkdirSync(path.join(tmpMono, 'apps', 'web', 'src'), { recursive: true });
    fs.mkdirSync(path.join(tmpMono, 'apps', 'untouched', 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpMono, 'apps', 'web', 'package.json'), JSON.stringify({
      scripts: {
        typecheck: 'node -e "process.exit(1)"',
        lint: 'node -e "process.exit(0)"',
        test: 'node -e "process.exit(0)"',
      },
    }));
    fs.writeFileSync(path.join(tmpMono, 'apps', 'untouched', 'package.json'), JSON.stringify({
      scripts: { test: 'node -e "process.exit(1)"' },
    }));
    fs.writeFileSync(path.join(tmpMono, 'apps', 'web', 'src', 'index.ts'), 'export const a = 1;\n');
    fs.writeFileSync(path.join(tmpMono, 'apps', 'untouched', 'src', 'index.ts'), 'export const b = 1;\n');
    spawnSync('git', ['add', '.'], { cwd: tmpMono });
    spawnSync('git', ['commit', '-m', 'init'], {
      cwd: tmpMono,
      env: { ...process.env, GIT_AUTHOR_NAME: 'test', GIT_AUTHOR_EMAIL: 'test@test.com', GIT_COMMITTER_NAME: 'test', GIT_COMMITTER_EMAIL: 'test@test.com' },
    });

    fs.writeFileSync(path.join(tmpMono, 'apps', 'web', 'src', 'index.ts'), 'export const a = 2;\n');
    const typecheckFail = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpMono] }, repoRoot);
    assert.equal(typecheckFail.decision, 'continue', 'Stop hook must fail when changed monorepo workspace typecheck fails');
    assert.match(typecheckFail.reason, /typecheck/i);

    const optOutPass = runHook(stopHookCmd, { terminationReason: 'NO_TOOL_CALL', continuationActive: false, workspacePaths: [tmpMono] }, repoRoot, { AAC_STOP_RUN_TYPECHECK: '0', AAC_STOP_TEST_TIMEOUT_MS: 'invalid' });
    assert.equal(optOutPass.decision, 'allow', 'Stop hook must allow when failing gate is opted out and ignore untouched failing sibling');
  } finally {
    fs.rmSync(tmpMono, { recursive: true, force: true });
  }
});

test('P1-1: SessionStart hook resolves workspacePaths from stdin instead of process cwd', () => {
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  const sessionHookCmd = hooks['lifecycle-session-bootstrap'].SessionStart[0].command;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-session-test-'));
  try {
    fs.mkdirSync(path.join(tmpDir, '.scratch'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs', 'sprint'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs', 'learnings'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.scratch', 'handoff.md'), '# Handoff\n');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'sprint', 'SPRINT.md'), '# Sprint\n');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'learnings', 'LESSONS.md'), '# Lessons\n');

    const out = runHook(sessionHookCmd, { workspacePaths: [tmpDir] }, repoRoot);
    const message = JSON.stringify(out);
    assert.match(message, /handoff\.md/);
    assert.match(message, /SPRINT\.md/);
    assert.match(message, /LESSONS\.md/);

    const contextOnlyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-session-context-'));
    try {
      fs.writeFileSync(path.join(contextOnlyDir, 'CONTEXT.md'), '# Context\n- **Primary Purpose**: _[To be indexed]_\n');
      const ctxTemplateOut = runHook(sessionHookCmd, { workspacePaths: [contextOnlyDir] }, repoRoot);
      const ctxTemplateMsg = JSON.stringify(ctxTemplateOut);
      assert.match(ctxTemplateMsg, /\/index-project/, 'Unindexed template CONTEXT.md must advise running /index-project');

      fs.writeFileSync(path.join(contextOnlyDir, 'CONTEXT.md'), '# Context\n- **Primary Purpose**: Billing API\n');
      const ctxOut = runHook(sessionHookCmd, { workspacePaths: [contextOnlyDir] }, repoRoot);
      const ctxMsg = JSON.stringify(ctxOut);
      assert.match(ctxMsg, /CONTEXT\.md/);
      assert.doesNotMatch(ctxMsg, /handoff\.md/);
      assert.doesNotMatch(ctxMsg, /SPRINT\.md/);
      assert.match(ctxMsg, /codebase index/i);
    } finally {
      fs.rmSync(contextOnlyDir, { recursive: true, force: true });
    }

    const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-session-empty-'));
    try {
      const emptyOut = runHook(sessionHookCmd, { workspacePaths: [emptyDir] }, repoRoot);
      assert.deepEqual(emptyOut.injectSteps, []);

      const neutralOut = runHook(sessionHookCmd, { workspacePaths: [emptyDir] }, repoRoot, { AAC_PERSONA: 'neutral' });
      const neutralText = JSON.stringify(neutralOut);
      assert.match(neutralText, /AAC_PERSONA=neutral is active/, 'AAC_PERSONA=neutral must inject a neutral-persona system message');
      assert.match(neutralText, /clinical/, 'Neutral mode must request clinical Staff Engineer prose');
    } finally {
      fs.rmSync(emptyDir, { recursive: true, force: true });
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P1-6 & §11.3: Frontmatter, Antigravity skill spec, subagent policy, and package files', () => {
  // 1. Legal & package files exist
  for (const reqFile of ['LICENSE', '.gitignore', '.gitattributes', 'SECURITY.md', 'CHANGELOG.md', 'AGENTS.md', 'CONTEXT.md']) {
    assert.equal(fs.existsSync(path.join(repoRoot, reqFile)), true, `Missing required file: ${reqFile}`);
  }

  // 2. Rules validation (official trigger contract + conditional frontmatter keys)
  const rulesDir = path.join(repoRoot, '.agents', 'rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
  assert.deepEqual(
    ruleFiles.map((f) => f.replace(/\.md$/, '')).sort(),
    ['architecture-and-flow', 'coding-standards', 'database-migrations', 'git-and-context', 'release-audit', 'security-and-auth', 'testing', 'ui-and-dry'],
    'Rule set drifted from the documented progressive-disclosure catalog',
  );
  for (const file of ruleFiles) {
    const frontmatter = readFrontmatter(path.join(rulesDir, file));
    const trigger = frontmatterValue(frontmatter, 'trigger');
    assert.match(trigger, /^(always_on|model_decision|glob|manual)$/, `Invalid trigger in ${file}`);
    if (trigger === 'glob') {
      const globs = frontmatterValue(frontmatter, 'globs');
      assert.ok(globs, `glob rule ${file} must declare globs`);
      assert.doesNotMatch(globs, /[{}]/, `glob rule ${file} must not use brace syntax`);
    }
    assert.ok(frontmatterValue(frontmatter, 'description'), `Rule ${file} should declare a description (used as fallback context)`);
    assert.ok(fs.statSync(path.join(rulesDir, file)).size < 24000, `Rule ${file} exceeds the Antigravity 24 KB per-file limit`);
  }

  // AGENTS.md must stay well below Antigravity's 24 KB cap so it is never truncated,
  // and must index every shipped rule without phantom references.
  const agentsPath = path.join(repoRoot, 'AGENTS.md');
  const agentsSize = fs.statSync(agentsPath).size;
  assert.ok(agentsSize < 24000, `AGENTS.md (${agentsSize} bytes) exceeds Antigravity 24,000-byte cap and would be truncated`);
  assert.ok(agentsSize < 14000, `AGENTS.md (${agentsSize} bytes) should stay concise (<14 KB) to prevent LLM instruction dilution`);
  const agentsContent = fs.readFileSync(agentsPath, 'utf8');
  for (const file of ruleFiles) {
    assert.ok(agentsContent.includes(file), `AGENTS.md rule index is missing ${file} (silent progressive-disclosure drift)`);
  }
  for (const match of agentsContent.matchAll(/`\.agents\/rules\/([a-z0-9-]+\.md)`/g)) {
    assert.equal(fs.existsSync(path.join(rulesDir, match[1])), true, `AGENTS.md references missing rule ${match[1]}`);
  }

  // Core LLM invariants in AGENTS.md
  assert.match(agentsContent, /Anti-Yes-Man & Mandatory Stop\/Ask Gate/i);
  assert.match(agentsContent, /ask_question/i);
  assert.match(agentsContent, /Read-Before-Cite & Verify-Before-Import/i);
  assert.match(agentsContent, /Pre-Creation DRY Gate/i);
  assert.match(agentsContent, /Mandatory Live Research & Temporal Fidelity/i);
  assert.match(agentsContent, /Configurability/i);
  assert.match(agentsContent, /Structured Logging/i);
  assert.match(agentsContent, /Zero Production Fakes/i);
  assert.match(agentsContent, /Closed-Loop Verification & Zero Test Tampering/i);
  assert.match(agentsContent, /Cross-Session & Cross-Machine Handover/i);
  assert.match(agentsContent, /Circuit Breaker/i);

  // Glob-triggered everyday rules must auto-activate on matching files & support Dart/Flutter
  for (const globRule of ['ui-and-dry.md', 'coding-standards.md', 'database-migrations.md', 'testing.md']) {
    const fm = readFrontmatter(path.join(rulesDir, globRule));
    assert.equal(frontmatterValue(fm, 'trigger'), 'glob', `${globRule} must use trigger: glob so it auto-loads on matching files`);
  }

  const uiRule = fs.readFileSync(path.join(rulesDir, 'ui-and-dry.md'), 'utf8');
  assert.match(uiRule, /\*\.dart/);
  assert.match(uiRule, /Reuse First/i);
  assert.match(uiRule, /dispose\(\)/i);

  const testingRule = fs.readFileSync(path.join(rulesDir, 'testing.md'), 'utf8');
  assert.match(testingRule, /\*_test\.dart/);
  assert.match(testingRule, /Anti-Test-Tampering/i);

  const codingRule = fs.readFileSync(path.join(rulesDir, 'coding-standards.md'), 'utf8');
  assert.match(codingRule, /\*\.dart/);
  assert.match(codingRule, /Configurability & Zero Hardcoded Values/i);
  assert.match(codingRule, /Structured Logging & Observability/i);
  assert.match(codingRule, /Parse, Don't Validate/i);

  // Security-rule regression: never document a non-existent constant-time API.
  const securityRule = fs.readFileSync(path.join(rulesDir, 'security-and-auth.md'), 'utf8');
  assert.doesNotMatch(securityRule, /subtle\.timingSafeEqual/, 'security-and-auth.md must not cite the non-existent crypto.subtle.timingSafeEqual');
  assert.match(securityRule, /crypto\.timingSafeEqual/, 'security-and-auth.md must document constant-time comparison');

  // 3. Skills validation against the agentskills.io spec + Antigravity best practice (no built-in collisions)
  const skillsDir = path.join(repoRoot, '.agents', 'skills');
  const skillDirs = fs.readdirSync(skillsDir);
  assert.deepEqual(
    skillDirs.sort(),
    ['browsing', 'code-review', 'codebase-design', 'database-migration', 'diagnosing-bugs', 'discover', 'domain-modeling', 'handoff', 'implement', 'index-project', 'office', 'perf-audit', 'pr', 'research', 'safe-refactor', 'self-learn', 'tdd', 'to-spec', 'to-tickets', 'wave-execute'],
    'Skill set drifted from the documented catalog',
  );
  assert.equal(skillDirs.includes('grill-me'), false, 'Custom skill must not collide with built-in /grill-me slash command');
  assert.equal(skillDirs.includes('learn'), false, 'Custom skill must not collide with built-in /learn slash command');
  for (const dir of skillDirs) {
    assert.match(dir, /^[a-z0-9]+(-[a-z0-9]+)*$/, `Invalid skill directory name: ${dir}`);
    const skillMd = path.join(skillsDir, dir, 'SKILL.md');
    const frontmatter = readFrontmatter(skillMd);
    assert.equal(frontmatterValue(frontmatter, 'name'), dir, `Skill name mismatch in ${dir}`);
    const description = frontmatterValue(frontmatter, 'description') || '';
    assert.ok(description.length > 20, `Skill description too vague in ${dir}`);
    assert.ok(description.length <= 1024, `Skill description exceeds agentskills.io 1024-char limit in ${dir}`);
    const skillBody = fs.readFileSync(skillMd, 'utf8');
    assert.match(skillBody, /## Decision tree/, `Missing '## Decision tree' in ${dir}`);
    const descLine = (frontmatter.match(/^description:(.*)$/m) || [])[1] || '';
    assert.doesNotMatch(descLine, /:\s/, `Unquoted colon-space in ${dir} description breaks YAML parsing`);
    const builtinSlash = new Set(['plan', 'compact', 'agents', 'teamwork', 'browser', 'grill-me', 'learn']);
    for (const ref of skillBody.matchAll(/(?:^|[\s(`])\/([a-z][a-z-]+)\b/g)) {
      if (builtinSlash.has(ref[1])) continue;
      assert.equal(fs.existsSync(path.join(skillsDir, ref[1], 'SKILL.md')), true, `${dir} routes to unknown skill /${ref[1]}`);
    }
  }
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'sprint-board-template.md')), true);
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'ticket-template.md')), true);

  // 4. Subagents validation (native Antigravity tool names, sandbox policy, model tier, skills/<name> paths)
  const officialTools = new Set([
    'read_file', 'edit_file', 'write_file', 'run_command', 'manage_task', 'search_web',
    'ask_question', 'invoke_subagent', 'define_subagent', 'send_message', 'manage_subagents',
    'schedule', 'run_workflow', 'swarm', 'generate_image',
  ]);
  const agentsDir = path.join(repoRoot, '.agents', 'agents');
  const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  assert.deepEqual(
    agentFiles.map((f) => f.replace(/\.md$/, '')).sort(),
    ['adversarial-reviewer', 'architecture-planner', 'codebase-investigator', 'security-auditor', 'verification-runner'],
    'Subagent set drifted from the documented catalog',
  );
  const readOnlyReviewers = new Set(['adversarial-reviewer.md', 'architecture-planner.md', 'security-auditor.md']);
  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    const frontmatter = readFrontmatter(path.join(agentsDir, file));
    assert.match(frontmatter, /commandExecutionPolicy:\s*(sandbox|off)/, `Subagent ${file} must use sandbox or off policy`);
    assert.match(frontmatter, /model:\s*(inherit|flash|pro)/, `Subagent ${file} has an unsupported model tier`);
    assert.match(frontmatter, /mainAgent:\s*false/, `Subagent ${file} should not be selectable as a main agent`);
    const toolMatches = [...frontmatter.matchAll(/^\s*-\s*([a-z_]+)\s*$/gm)].map((m) => m[1]);
    for (const tool of toolMatches) {
      assert.equal(officialTools.has(tool), true, `Subagent ${file} references unknown Antigravity tool '${tool}' (can hang the subagent)`);
      if (readOnlyReviewers.has(file)) {
        assert.equal(tool === 'write_file' || tool === 'edit_file', false, `Reviewer subagent ${file} must be read-only (INV-006): remove '${tool}'`);
      }
    }
    const skillMatches = [...frontmatter.matchAll(/^\s*-\s*(skills\/[a-z0-9-]+)\s*$/gm)];
    for (const m of skillMatches) {
      assert.equal(fs.existsSync(path.join(repoRoot, '.agents', m[1], 'SKILL.md')), true, `Subagent ${file} references non-existent skill path ${m[1]}`);
    }
  }
});

test('P1-7: Managed markdown links resolve (no stale catalog references)', () => {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
  const markdownFiles = [
    ...walk(path.join(repoRoot, '.agents')),
    ...walk(path.join(repoRoot, 'docs')),
    ...['README.md', 'AGENTS.md', 'CONTEXT.md', 'SECURITY.md'].map((f) => path.join(repoRoot, f)),
  ].filter((f) => f.endsWith('.md'));

  const broken = [];
  for (const file of markdownFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|#|file:|conversation:)/.test(href)) continue;
      const target = href.split('#')[0];
      if (!target || /[<>{*]/.test(target)) continue; // template placeholders are not real links
      if (!fs.existsSync(path.resolve(path.dirname(file), target))) {
        broken.push(`${path.relative(repoRoot, file)} -> ${href}`);
      }
    }
  }
  assert.deepEqual(broken, [], `Broken relative markdown links:\n${broken.join('\n')}`);
});

test('P1-8: LLM-native anti-yes-man, codebase indexing, DRY reuse, and provenance contracts', () => {
  const read = (relPath) => fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  const skillsRoot = '.agents/skills';

  // CONTEXT.md must index shared UI, config/logging seams, shared utils, and verification commands.
  const contextMd = read('CONTEXT.md');
  assert.match(contextMd, /Configurability, Logging & Environment Contract/);
  assert.match(contextMd, /Shared UI, Design System & Frontend Inventory/);
  assert.match(contextMd, /Shared Utilities, Hooks, API Clients & Schemas/);

  // index-project must populate CONTEXT.md using scan-repo.mjs.
  const indexProject = read(`${skillsRoot}/index-project/SKILL.md`);
  assert.match(indexProject, /CONTEXT\.md/);
  assert.match(indexProject, /scan-repo\.mjs --help/);

  // discover must run live research before proposing stack/architecture options.
  const discover = read(`${skillsRoot}/discover/SKILL.md`);
  assert.match(discover, /docs\/discovery\/<feature-slug>\.md/);
  assert.match(discover, /Mandatory Live Research Gate/);
  assert.match(discover, /`DEC-###`/);
  assert.match(discover, /`OQ-###`/);
  assert.match(discover, /`ASM-###`/);
  assert.match(discover, /ask_question/);
  const discoveryTemplate = read(`${skillsRoot}/discover/resources/discovery-record-template.md`);
  assert.match(discoveryTemplate, /Existing Codebase Reuse/);
  assert.match(discoveryTemplate, /Configurability & Env Contract/);
  assert.match(discoveryTemplate, /Completeness Gate/);

  // to-spec: audits ambiguous PRDs/DDRs, enforces config/logging/security/perf, and validates with script.
  const toSpec = read(`${skillsRoot}/to-spec/SKILL.md`);
  assert.match(toSpec, /Anti-Yes-Man Gate/);
  assert.match(toSpec, /validate-spec\.mjs --help/);
  assert.match(toSpec, /READY FOR TICKETS/);
  assert.match(toSpec, /resources\/spec-example\.md/);
  const specTemplate = read(`${skillsRoot}/to-spec/resources/spec-template.md`);
  assert.match(specTemplate, /Quality Bar\*\*: `production`/);
  assert.match(specTemplate, /Reusable Codebase Assets/);
  assert.match(specTemplate, /Config Contract \(Zero Hardcoded Values\)/);
  assert.match(specTemplate, /Logging & Audit Contract/);
  assert.match(specTemplate, /Traceability Matrix/);

  // to-tickets: grounds every vertical slice in reusable codebase assets and validates DAG with script.
  const toTickets = read(`${skillsRoot}/to-tickets/SKILL.md`);
  assert.match(toTickets, /Reusable Assets/);
  assert.match(toTickets, /validate-board\.mjs --help/);
  const ticketTemplate = read(`${skillsRoot}/to-tickets/resources/ticket-template.md`);
  assert.match(ticketTemplate, /Quality Tier\*\*: `production`/);
  assert.match(ticketTemplate, /Reusable Codebase Assets & Touchpoints/);
  assert.match(ticketTemplate, /Config & Structured Logger Seams/);
  assert.match(ticketTemplate, /Post-Ticket Self-Check/);
  const sprintTemplate = read(`${skillsRoot}/to-tickets/resources/sprint-board-template.md`);
  assert.match(sprintTemplate, /docs\/sprint\/HANDOFF\.md/);
  assert.match(sprintTemplate, /Traceability Matrix/);
  assert.match(sprintTemplate, /Wave Exit Gate/);

  // domain-modeling & codebase-design: 4-bundle depth + multi-language support.
  const domainModeling = read(`${skillsRoot}/domain-modeling/SKILL.md`);
  assert.match(domainModeling, /3 ADR Gates/);
  assert.match(domainModeling, /ask_question/);
  const codebaseDesign = read(`${skillsRoot}/codebase-design/SKILL.md`);
  assert.match(codebaseDesign, /Pre-Code Performance & Resource Audit/);
  assert.match(codebaseDesign, /Configurability & Logging Seam/);

  // implement, tdd, handoff, and code-review enforce ambiguity stop, reuse, post-ticket review, and cross-machine handover.
  const implement = read(`${skillsRoot}/implement/SKILL.md`);
  assert.match(implement, /Phase 0: Mandatory Ticket \/ PRD Ambiguity Audit/);
  assert.match(implement, /Phase 1: Pre-Code Design, Config\/Logging & Reuse Plan/);
  assert.match(implement, /Phase 3: Post-Ticket Re-Check, Independent Review & Handover Commit/);
  assert.match(implement, /audit-diff\.mjs --help/);
  assert.match(read(`${skillsRoot}/tdd/SKILL.md`), /complete production behavior/);
  assert.match(read(`${skillsRoot}/handoff/SKILL.md`), /docs\/sprint\/HANDOFF\.md/);
  assert.match(read(`${skillsRoot}/code-review/SKILL.md`), /review-rubric\.md/);

  // Enterprise diagrams, ops/rollout/API contracts, perf-audit, wave-execute, and multi-tracker docs
  assert.match(specTemplate, /C4Container|C4Context/);
  assert.match(specTemplate, /erDiagram/);
  assert.match(specTemplate, /sequenceDiagram/);
  assert.match(specTemplate, /stateDiagram-v2/);
  assert.match(specTemplate, /API Contract/i);
  assert.match(specTemplate, /Rollout|Canary|Feature-Flag/i);
  assert.match(specTemplate, /Observability.*SLI\/SLO|Runbook/i);
  assert.match(toSpec, /Mermaid/i);
  assert.match(domainModeling, /stateDiagram-v2/);
  assert.match(domainModeling, /erDiagram/);
  assert.match(codebaseDesign, /C4Container|sequenceDiagram/);
  assert.match(read(`${skillsRoot}/wave-execute/SKILL.md`), /workspace:\s*"share"|workspace: share/i);
  assert.match(read(`${skillsRoot}/wave-execute/SKILL.md`), /Blackboard/i);
  assert.match(read(`${skillsRoot}/wave-execute/SKILL.md`), /Critic Loop/i);
  assert.match(read(`${skillsRoot}/perf-audit/SKILL.md`), /EXPLAIN ANALYZE/);
  assert.match(ticketTemplate, /Exact File Touchpoints/i);
  assert.match(ticketTemplate, /Data, Schema & Error Matrix/i);
  assert.match(ticketTemplate, /Do-Not-Invent/i);
  const handoffTemplate = read(`${skillsRoot}/handoff/resources/handoff-template.md`);
  assert.match(handoffTemplate, /Environment & Toolchain Preconditions/i);
  assert.match(handoffTemplate, /Git Working Tree Snapshot/i);
  assert.match(handoffTemplate, /Unblocked Ready Queue/i);
  assert.match(implement, /in-progress/i);
  assert.match(implement, /unblock/i);
  const selfLearn = read(`${skillsRoot}/self-learn/SKILL.md`);
  assert.match(selfLearn, /human-feedback/i);
  assert.match(selfLearn, /search_web/i);
  assert.match(selfLearn, /browsing/i);
  assert.match(selfLearn, /docs\/learnings\/LESSONS\.md/);
  assert.equal(fs.existsSync(path.join(repoRoot, 'docs', 'learnings', 'LESSONS.md')), true);
  const trackerDoc = read('docs/agents/issue-tracker.md');
  assert.match(trackerDoc, /Jira/);
  assert.match(trackerDoc, /Linear/);
  assert.match(trackerDoc, /GitLab/);
  const releaseAuditRule = read('.agents/rules/release-audit.md');
  assert.match(releaseAuditRule, /gitleaks|SBOM/i);
});

test('P1-9: Black-box skill scripts support --help and validate multi-language repos, specs, boards, and diffs', () => {
  const scripts = [
    '.agents/skills/index-project/scripts/scan-repo.mjs',
    '.agents/skills/to-spec/scripts/validate-spec.mjs',
    '.agents/skills/to-tickets/scripts/validate-board.mjs',
    '.agents/skills/implement/scripts/audit-diff.mjs',
  ];
  for (const rel of scripts) {
    const out = execFileSync(process.execPath, [path.join(repoRoot, rel), '--help'], { encoding: 'utf8' });
    assert.match(out, /Usage:/i, `${rel} --help must print Usage instructions`);
  }

  // scan-repo.mjs detects Dart / Flutter project topology
  const tmpFlutter = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-flutter-scan-'));
  try {
    fs.writeFileSync(path.join(tmpFlutter, 'pubspec.yaml'), 'name: sample_app\ndependencies:\n  flutter:\n    sdk: flutter\n  riverpod: ^2.6.0\n');
    fs.mkdirSync(path.join(tmpFlutter, 'lib', 'widgets'), { recursive: true });
    fs.mkdirSync(path.join(tmpFlutter, 'test'), { recursive: true });
    const scanOut = JSON.parse(execFileSync(process.execPath, [path.join(repoRoot, scripts[0]), '--root', tmpFlutter, '--json'], { encoding: 'utf8' }));
    assert.ok(scanOut.stacks.includes('Dart / Flutter'));
    assert.ok(scanOut.commands.test.includes('flutter test'));
    assert.ok(scanOut.commands.analyze.includes('flutter analyze'));
    assert.ok(scanOut.directoryBuckets.ui.includes('lib/widgets'));
    assert.equal(scanOut.layoutMode, 'single-context');
    assert.equal(scanOut.workspaces.length, 1);
  } finally {
    fs.rmSync(tmpFlutter, { recursive: true, force: true });
  }

  // scan-repo.mjs detects polyglot monorepo sub-manifests, inherits root lockfile, and recommends hub-and-spoke layout
  const tmpMono = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-mono-scan-'));
  try {
    fs.writeFileSync(path.join(tmpMono, 'pnpm-lock.yaml'), 'lockfileVersion: 9.0\n');
    fs.mkdirSync(path.join(tmpMono, 'apps', 'web'), { recursive: true });
    fs.writeFileSync(path.join(tmpMono, 'apps', 'web', 'package.json'), JSON.stringify({
      scripts: { test: 'vitest run', typecheck: 'tsc --noEmit', lint: 'eslint .' },
    }));
    fs.mkdirSync(path.join(tmpMono, 'services', 'billing'), { recursive: true });
    fs.writeFileSync(path.join(tmpMono, 'services', 'billing', 'go.mod'), 'module example.com/billing\n');
    // Depth > 5 must be bounded
    fs.mkdirSync(path.join(tmpMono, 'a', 'b', 'c', 'd', 'e', 'f', 'deep'), { recursive: true });
    fs.writeFileSync(path.join(tmpMono, 'a', 'b', 'c', 'd', 'e', 'f', 'deep', 'Cargo.toml'), '[package]\nname="deep"\n');

    const t0 = Date.now();
    const monoOut = JSON.parse(execFileSync(process.execPath, [path.join(repoRoot, scripts[0]), '--root', tmpMono, '--json'], { encoding: 'utf8' }));
    assert.ok(Date.now() - t0 < 2000, 'scan-repo.mjs must complete within 2000ms (NFR-004)');
    assert.equal(monoOut.layoutMode, 'hub-and-spoke');
    assert.ok(monoOut.workspaces.some((w) => w.path === 'apps/web' && w.commands.analyze.includes('pnpm typecheck')));
    assert.ok(monoOut.workspaces.some((w) => w.path === 'services/billing' && w.commands.test.includes('go test ./...')));
    assert.equal(monoOut.workspaces.some((w) => w.path.includes('deep')), false, 'scan-repo.mjs must bound traversal depth <= 5');

    const missingRoot = spawnSync(process.execPath, [path.join(repoRoot, scripts[0]), '--root', path.join(tmpMono, 'does-not-exist')], { encoding: 'utf8' });
    assert.notEqual(missingRoot.status, 0, 'scan-repo.mjs must exit non-zero on missing --root');
  } finally {
    fs.rmSync(tmpMono, { recursive: true, force: true });
  }

  // validate-spec.mjs rejects READY FOR TICKETS spec containing vague qualifier / TBD or missing traceability
  const tmpSpecDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-spec-val-'));
  try {
    const badSpec = path.join(tmpSpecDir, 'bad.md');
    fs.writeFileSync(badSpec, '# Spec: X\n- **Readiness Verdict**: `READY FOR TICKETS`\n- **Verification Command**: `TBD`\n## 1. Problem, Scope & Non-Goals\nfast\n');
    const res = spawnSync(process.execPath, [path.join(repoRoot, scripts[1]), badSpec], { encoding: 'utf8' });
    assert.notEqual(res.status, 0, 'validate-spec.mjs must fail on incomplete READY spec');

    const unmappedSpec = path.join(tmpSpecDir, 'unmapped.md');
    fs.writeFileSync(unmappedSpec, [
      '# Spec: Unmapped',
      '- **Readiness Verdict**: `READY FOR TICKETS`',
      '- **Verification Command**: `npm test`',
      '## 1. Problem, Scope & Non-Goals',
      'Scope',
      '## 2. Reusable Codebase Assets',
      '`N/A`',
      '## 3. Domain Model',
      '```mermaid\nC4Container\n```\n`N/A — no db`',
      '## 4. Functional Requirements',
      '| `REQ-001` | A | G/W/T | `must` | `DEC-001` |',
      '| `REQ-002` | B | G/W/T | `must` | `DEC-001` |',
      '## 5. Non-Functional',
      '| `NFR-001` | Latency | 10ms | opt | bench | shed | `DEC-001` |',
      '## 6. Security, Credential Hygiene',
      '| `SEC-001` | Auth | rule | test | `DEC-001` |',
      '## 7. Configurability, Logging',
      '- **API Contract**: `N/A`',
      '## 8. Resilience',
      '- **Rollout**: `N/A`',
      '- **Observability**: `N/A`',
      '## 9. Traceability Matrix',
      '| `REQ-001` | `SEC-001` | `#01` | `seam` | `test` |',
    ].join('\n'));
    const unmappedRes = spawnSync(process.execPath, [path.join(repoRoot, scripts[1]), unmappedSpec], { encoding: 'utf8' });
    assert.notEqual(unmappedRes.status, 0, 'validate-spec.mjs must reject READY spec with unmapped REQ-002 / NFR-001 in §9');
    assert.match(unmappedRes.stderr, /REQ-002/);

    const noSec8Spec = path.join(tmpSpecDir, 'no-sec8.md');
    fs.writeFileSync(noSec8Spec, [
      '# Spec: NoSec8',
      '- **Readiness Verdict**: `READY FOR TICKETS`',
      '- **Verification Command**: `npm test`',
      '## 1. Problem, Scope & Non-Goals',
      '## 2. Reusable Codebase Assets',
      '## 3. Domain Model',
      '`N/A`',
      '## 4. Functional Requirements',
      '| `REQ-001` | A | G/W/T | `must` | `DEC-001` |',
      '## 6. Security, Credential Hygiene',
      '| `SEC-001` | Auth | rule | test | `DEC-001` |',
      '## 7. Configurability, Logging',
      '- **API Contract**: `N/A`',
      '## 9. Traceability Matrix',
      '| `REQ-001` | `SEC-001` | `#01` | `seam` | `test` |',
    ].join('\n'));
    const noSec8Res = spawnSync(process.execPath, [path.join(repoRoot, scripts[1]), noSec8Spec], { encoding: 'utf8' });
    assert.notEqual(noSec8Res.status, 0, 'validate-spec.mjs must fail if §8 Resilience/Rollout/Observability is omitted');
    assert.match(noSec8Res.stderr, /Rollout/);
  } finally {
    fs.rmSync(tmpSpecDir, { recursive: true, force: true });
  }

  // validate-board.mjs detects circular Blocked by dependencies and premature ready tickets
  const tmpBoardDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-board-val-'));
  try {
    fs.mkdirSync(path.join(tmpBoardDir, 'tickets'), { recursive: true });
    fs.writeFileSync(path.join(tmpBoardDir, 'SPRINT.md'), '| [`#01`](tickets/01-a.md) | A |\n| [`#02`](tickets/02-b.md) | B |\n');
    const baseTicket = (id, status, blockedBy) => `# Ticket #${id}\n- **Status**: \`${status}\`\n- **Blocked by**: ${blockedBy}\n- **Source Requirements**: REQ-001\n- **Source Decisions**: DEC-001\n## Reusable Codebase Assets\n## Exact File Touchpoints\n## Do-Not-Invent Guards\n## Verification Command\n\`npm test\`\n`;
    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '01-a.md'), baseTicket('01', 'blocked', '#02'));
    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '02-b.md'), baseTicket('02', 'blocked', '#01'));
    const res = spawnSync(process.execPath, [path.join(repoRoot, scripts[2]), path.join(tmpBoardDir, 'SPRINT.md')], { encoding: 'utf8' });
    assert.notEqual(res.status, 0, 'validate-board.mjs must reject cyclic Blocked by dependencies');
    assert.match(res.stderr, /Cycle detected/i);

    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '01-a.md'), baseTicket('01', 'in-progress', 'None'));
    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '02-b.md'), baseTicket('02', 'ready', '#01'));
    const prematureRes = spawnSync(process.execPath, [path.join(repoRoot, scripts[2]), path.join(tmpBoardDir, 'SPRINT.md')], { encoding: 'utf8' });
    assert.notEqual(prematureRes.status, 0, 'validate-board.mjs must reject ready ticket blocked by unfinished ticket');
    assert.match(prematureRes.stderr, /#01/);

    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '01-a.md'), '# Ticket #01\n- **Status**: `ready`\n- **Blocked by**: None\n- **Source Requirements**: REQ-001\n- **Source Decisions**: DEC-001\n## Reusable Codebase Assets\n## Verification Command\n`npm test`\n');
    fs.writeFileSync(path.join(tmpBoardDir, 'tickets', '02-b.md'), baseTicket('02', 'blocked', '#01'));
    const shallowRes = spawnSync(process.execPath, [path.join(repoRoot, scripts[2]), path.join(tmpBoardDir, 'SPRINT.md')], { encoding: 'utf8' });
    assert.notEqual(shallowRes.status, 0, 'validate-board.mjs must reject ready ticket lacking Exact File Touchpoints or Do-Not-Invent Guards');
    assert.match(shallowRes.stderr, /Exact File Touchpoints|Do-Not-Invent/i);
  } finally {
    fs.rmSync(tmpBoardDir, { recursive: true, force: true });
  }

  // audit-diff.mjs flags expanded secret patterns without echoing raw credential values
  const tmpAuditDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-audit-diff-'));
  try {
    spawnSync('git', ['init'], { cwd: tmpAuditDir });
    const fakeDsn = 'postgres://' + 'svc:R3alPassw0rd@db.prod.local:5432/app';
    fs.mkdirSync(path.join(tmpAuditDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tmpAuditDir, 'src', 'db.ts'), `export const dsn = "${fakeDsn}";\n`);
    fs.writeFileSync(path.join(tmpAuditDir, '.env.example'), 'DATABASE_URL=postgres://${DB_USER}:${DB_PASS}@localhost:5432/app\n');
    const res = spawnSync(process.execPath, [path.join(repoRoot, scripts[3]), '--root', tmpAuditDir], { encoding: 'utf8' });
    assert.notEqual(res.status, 0, 'audit-diff.mjs must fail on embedded DB URI password');
    assert.match(res.stderr, /db-uri-password/);
    assert.equal(res.stderr.includes('R3alPassw0rd'), false, 'audit-diff.mjs must never echo matched secret substrings');
  } finally {
    fs.rmSync(tmpAuditDir, { recursive: true, force: true });
  }
});
