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

function runHook(command, stdinJson, cwd = repoRoot, env = {}) {
  const res = spawnSync(command, {
    shell: true,
    cwd,
    input: JSON.stringify(stdinJson),
    encoding: 'utf8',
    timeout: 5000,
    env: { ...process.env, ...env },
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
    assert.equal(fs.existsSync(path.join(tmpDir, 'package.json')), false);

    // 2b. The MCP templates referenced by SECURITY.md and docs/agents/issue-tracker.md must actually ship.
    const mcpExamplePath = path.join(tmpDir, '.agents', 'mcp_config.example.json');
    const mcpEnvExamplePath = path.join(tmpDir, '.agents', 'mcp.env.example');
    assert.equal(fs.existsSync(mcpExamplePath), true, 'init must install .agents/mcp_config.example.json (documented copy source)');
    assert.equal(fs.existsSync(mcpEnvExamplePath), true, 'init must install .agents/mcp.env.example');
    assert.doesNotMatch(fs.readFileSync(mcpExamplePath, 'utf8'), /"(?:token|password|secret|apiKey)"\s*:\s*"[^"$]/, 'MCP template must not embed literal credentials');

    // 3. Modify AGENTS.md, a rule, CONTEXT.md, and add a custom hook + toggle enabled: false
    const agentsPath = path.join(tmpDir, 'AGENTS.md');
    fs.appendFileSync(agentsPath, '\n<!-- Custom User Constitution Line -->\n');
    const rulePath = path.join(tmpDir, '.agents', 'rules', 'ponytail.md');
    fs.appendFileSync(rulePath, '\n<!-- Custom Rule Tweak -->\n');
    const contextPath = path.join(tmpDir, 'CONTEXT.md');
    fs.writeFileSync(contextPath, '# Custom User Context\n');

    const dstHooksPath = path.join(tmpDir, '.agents', 'hooks.json');
    const hooksObj = JSON.parse(fs.readFileSync(dstHooksPath, 'utf8'));
    hooksObj['git-destructive-guard'].enabled = false;
    hooksObj['custom-user-hook'] = { enabled: true, Stop: [] };
    fs.writeFileSync(dstHooksPath, JSON.stringify(hooksObj, null, 2));

    // 4. Non-destructive upgrade preserves user-modified AGENTS.md & rule, writes .aac-new, and merges hooks
    execFileSync(process.execPath, [cliPath, 'upgrade', '--target', tmpDir], { encoding: 'utf8' });
    assert.match(fs.readFileSync(agentsPath, 'utf8'), /Custom User Constitution Line/);
    assert.equal(fs.existsSync(`${agentsPath}.aac-new`), true);
    assert.match(fs.readFileSync(rulePath, 'utf8'), /Custom Rule Tweak/);
    assert.equal(fs.existsSync(`${rulePath}.aac-new`), true);
    assert.equal(fs.readFileSync(contextPath, 'utf8'), '# Custom User Context\n');

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
    const outside = path.join(outsideDir, 'outside.txt');
    fs.writeFileSync(outside, 'outside file\n');
    const escape = path.relative(tmpDir, outside).replace(/\\/g, '/');

    fs.writeFileSync(path.join(tmpDir, '.agents', '.aac-manifest.json'), JSON.stringify({
      version: '6.0.0',
      files: {
        '.agents/rules/coding-standards.md': sha(managed),
        'victim.txt': sha(victim),
        [escape]: sha(outside),
        '.agents/rules/../../victim.txt': sha(victim),
        '.agents/rules': sha(managed),
      },
    }, null, 2));

    const out = spawnSync(process.execPath, [cliPath, 'uninstall', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(out.status, 0, out.stderr);
    assert.equal(fs.existsSync(managed), false, 'managed file should still be removed');
    assert.equal(fs.existsSync(victim), true, 'non-managed file inside the repo must not be deleted');
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
    'git push --force',
    'git push -f',
    'git push origin main --force',
    'git push --delete origin main',
    'sudo git push origin main',
    'git.exe push origin main',
  ];

  for (const cmd of destructiveGitCorpus) {
    const out = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } });
    assert.equal(out.decision, 'ask', `Expected 'ask' for push to main: ${cmd}`);
  }

  const safeGitCorpus = [
    'git status -sb',
    'git push origin feat/new-branch',
    'git push origin dev',
    'git checkout -b feat/new-branch',
    'git checkout main',
    'git branch -d merged-branch',
    'git branch -D main',
    'git log -1 --oneline',
    'git stash list',
    'git stash',
    'git reset --hard',
    'git clean -fd',
    'git restore .',
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

  // Guard payloads that cannot be parsed must fail closed (ask), never silently allow.
  for (const [name, cmd] of [['git-destructive-guard', gitHookCmd], ['production-no-mock-guard', mockHookCmd]]) {
    const out = runHookRaw(cmd, '{ this is not json');
    assert.equal(out.decision, 'ask', `${name} must fail closed on malformed stdin, not allow`);
    assert.match(out.reason, /fail-closed/i, `${name} must explain the fail-closed decision`);
  }
});

test('P1-1: SessionStart hook resolves workspacePaths from stdin instead of process cwd', () => {
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  const sessionHookCmd = hooks['lifecycle-session-bootstrap'].SessionStart[0].command;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aac-session-test-'));
  try {
    fs.mkdirSync(path.join(tmpDir, '.scratch'), { recursive: true });
    fs.mkdirSync(path.join(tmpDir, 'docs', 'sprint'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.scratch', 'handoff.md'), '# Handoff\n');
    fs.writeFileSync(path.join(tmpDir, 'docs', 'sprint', 'SPRINT.md'), '# Sprint\n');

    const out = runHook(sessionHookCmd, { workspacePaths: [tmpDir] }, repoRoot);
    const message = JSON.stringify(out);
    assert.match(message, /handoff\.md/);
    assert.match(message, /SPRINT\.md/);

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
    ['architecture-and-flow', 'caveman', 'coding-standards', 'database-migrations', 'git-and-context', 'ponytail', 'release-audit', 'security-and-auth', 'testing'],
    'Rule set drifted from the documented progressive-disclosure catalog',
  );
  for (const file of ruleFiles) {
    const frontmatter = readFrontmatter(path.join(rulesDir, file));
    const trigger = frontmatterValue(frontmatter, 'trigger');
    assert.match(trigger, /^(always_on|model_decision|glob|manual)$/, `Invalid trigger in ${file}`);
    if (trigger === 'glob') {
      assert.ok(frontmatterValue(frontmatter, 'globs'), `glob rule ${file} must declare globs`);
    }
    assert.ok(frontmatterValue(frontmatter, 'description'), `Rule ${file} should declare a description (used as fallback context)`);
    assert.ok(fs.statSync(path.join(rulesDir, file)).size < 24000, `Rule ${file} exceeds the Antigravity 24 KB per-file limit`);
  }

  // AGENTS.md must index every rule it ships and reference no phantom rule file.
  const agentsContent = fs.readFileSync(path.join(repoRoot, 'AGENTS.md'), 'utf8');
  for (const file of ruleFiles) {
    assert.ok(agentsContent.includes(file), `AGENTS.md rule index is missing ${file} (silent progressive-disclosure drift)`);
  }
  for (const match of agentsContent.matchAll(/`\.agents\/rules\/([a-z0-9-]+\.md)`/g)) {
    assert.equal(fs.existsSync(path.join(rulesDir, match[1])), true, `AGENTS.md references missing rule ${match[1]}`);
  }

  // Security-rule regression: never document a non-existent constant-time API.
  const securityRule = fs.readFileSync(path.join(rulesDir, 'security-and-auth.md'), 'utf8');
  assert.doesNotMatch(securityRule, /subtle\.timingSafeEqual/, 'security-and-auth.md must not cite the non-existent crypto.subtle.timingSafeEqual');
  assert.match(securityRule, /crypto\.timingSafeEqual/, 'security-and-auth.md must document constant-time comparison');

  // 3. Skills validation against the agentskills.io spec + Antigravity best practice
  const skillsDir = path.join(repoRoot, '.agents', 'skills');
  const skillDirs = fs.readdirSync(skillsDir);
  assert.deepEqual(
    skillDirs.sort(),
    ['browsing', 'code-review', 'codebase-design', 'database-migration', 'diagnosing-bugs', 'domain-modeling', 'grill-me', 'handoff', 'implement', 'office', 'pr', 'safe-refactor', 'tdd', 'to-spec', 'to-tickets'],
    'Skill set drifted from the documented catalog',
  );
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
    const builtinSlash = new Set(['plan', 'compact', 'agents', 'teamwork', 'browser']);
    for (const ref of skillBody.matchAll(/(?:^|[\s(`])\/([a-z][a-z-]+)\b/g)) {
      if (builtinSlash.has(ref[1])) continue;
      assert.equal(fs.existsSync(path.join(skillsDir, ref[1], 'SKILL.md')), true, `${dir} routes to unknown skill /${ref[1]}`);
    }
  }
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'sprint-board-template.md')), true);
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'ticket-template.md')), true);

  // 4. Subagents validation (official tool names, execution policy, model tier, skills/<name> paths)
  const officialTools = new Set([
    'view_file', 'write_to_file', 'replace_file_content', 'multi_replace_file_content', 'list_dir', 'find_by_name',
    'grep_search', 'search_web', 'read_url_content', 'run_command', 'manage_task', 'schedule', 'list_permissions',
    'ask_permission', 'invoke_subagent', 'define_subagent', 'send_message', 'manage_subagents', 'ask_question', 'generate_image',
  ]);
  const agentsDir = path.join(repoRoot, '.agents', 'agents');
  const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  assert.deepEqual(
    agentFiles.map((f) => f.replace(/\.md$/, '')).sort(),
    ['adversarial-reviewer', 'codebase-investigator', 'verification-runner'],
    'Subagent set drifted from the documented catalog',
  );
  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    const frontmatter = readFrontmatter(path.join(agentsDir, file));
    assert.match(frontmatter, /commandExecutionPolicy:\s*(sandbox|off)/, `Subagent ${file} must use sandbox or off policy`);
    assert.match(frontmatter, /model:\s*(inherit|flash|pro)/, `Subagent ${file} has an unsupported model tier`);
    assert.match(frontmatter, /mainAgent:\s*false/, `Subagent ${file} should not be selectable as a main agent`);
    const toolMatches = [...frontmatter.matchAll(/^\s*-\s*([a-z_]+)\s*$/gm)].map((m) => m[1]);
    for (const tool of toolMatches) {
      assert.equal(officialTools.has(tool), true, `Subagent ${file} references unknown Antigravity tool '${tool}' (can hang the subagent)`);
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
