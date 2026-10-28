import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repoRoot, 'bin', 'cli.mjs');
const hooksJsonPath = path.join(repoRoot, '.agents', 'hooks.json');

function runHook(command, stdinJson, cwd = repoRoot) {
  const res = spawnSync(command, {
    shell: true,
    cwd,
    input: JSON.stringify(stdinJson),
    encoding: 'utf8',
    timeout: 5000,
  });
  assert.equal(res.status, 0, `Hook failed: ${res.stderr}`);
  return JSON.parse(res.stdout.trim());
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

    // 6. --with-sidecar without --project-id fails fast
    const noPid = spawnSync(process.execPath, [cliPath, 'init', '--target', tmpDir, '--with-sidecar'], { encoding: 'utf8' });
    assert.notEqual(noPid.status, 0);

    // 7. Uninstall removes unmodified managed files while keeping user-modified AGENTS.md & CONTEXT.md
    execFileSync(process.execPath, [cliPath, 'uninstall', '--target', tmpDir], { encoding: 'utf8' });
    assert.equal(fs.existsSync(agentsPath), true, 'User-modified AGENTS.md should be kept on uninstall without --force');
    assert.equal(fs.existsSync(contextPath), true, 'CONTEXT.md must always be preserved');
    assert.equal(fs.existsSync(path.join(tmpDir, '.agents', 'rules', 'coding-standards.md')), false);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('P0-4: Hook contract & full Git + Mock bypass corpus verification', () => {
  const hooks = JSON.parse(fs.readFileSync(hooksJsonPath, 'utf8'));
  const gitHookCmd = hooks['git-destructive-guard'].PreToolUse[0].hooks[0].command;
  const mockHookCmd = hooks['production-no-mock-guard'].PreToolUse[0].hooks[0].command;

  const destructiveGitCorpus = [
    'git push --force',
    'git push -f',
    'git push origin main --force',
    'git push origin +main',
    'git push --mirror',
    'git push origin :main',
    'git reset --hard',
    'git reset HEAD --hard',
    'git reset --hard HEAD',
    'git clean -f',
    'git clean -fd',
    'git clean -f -d',
    'git branch -D main',
    'git checkout -- .',
    'git restore .',
    'git tag -d v1.0.0',
  ];

  for (const cmd of destructiveGitCorpus) {
    const out = runHook(gitHookCmd, { toolCall: { args: { CommandLine: cmd } } });
    assert.equal(out.decision, 'ask', `Expected 'ask' for destructive git command: ${cmd}`);
  }

  const safeGitCorpus = [
    'git status -sb',
    'git push origin main',
    'git checkout -b feat/new-branch',
    'git branch -d merged-branch',
    'git log -1 --oneline',
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
  ];

  for (const snippet of bannedMockCorpus) {
    const out = runHook(mockHookCmd, {
      toolCall: { args: { TargetFile: 'src/service/payment.ts', CodeContent: snippet } },
    });
    assert.equal(out.decision, 'ask', `Expected 'ask' for production mock/stub: ${snippet}`);

    const testOut = runHook(mockHookCmd, {
      toolCall: { args: { TargetFile: 'src/service/payment.test.ts', CodeContent: snippet } },
    });
    assert.equal(testOut.decision, 'allow', `Expected 'allow' in test file for: ${snippet}`);
  }
});

test('P1-6 & §11.3: Frontmatter, skill decision trees, subagent sandbox policy, and package files', () => {
  // 1. Legal & package files exist
  for (const reqFile of ['LICENSE', '.gitignore', 'SECURITY.md', 'CHANGELOG.md', 'AGENTS.md', 'CONTEXT.md']) {
    assert.equal(fs.existsSync(path.join(repoRoot, reqFile)), true, `Missing required file: ${reqFile}`);
  }

  // 2. Rules validation
  const rulesDir = path.join(repoRoot, '.agents', 'rules');
  const ruleFiles = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
  assert.equal(ruleFiles.length, 9);
  for (const file of ruleFiles) {
    const content = fs.readFileSync(path.join(rulesDir, file), 'utf8');
    assert.match(content, /^---\n[\s\S]+?\n---/, `Missing frontmatter in rule ${file}`);
    assert.match(content, /trigger:\s*(always_on|model_decision|glob|manual)/, `Invalid trigger in ${file}`);
  }

  // 3. Skills validation (including Scrum sprint board & ticket templates)
  const skillsDir = path.join(repoRoot, '.agents', 'skills');
  const skillDirs = fs.readdirSync(skillsDir);
  assert.equal(skillDirs.length, 13);
  for (const dir of skillDirs) {
    const skillMd = fs.readFileSync(path.join(skillsDir, dir, 'SKILL.md'), 'utf8');
    assert.match(skillMd, new RegExp(`name:\\s*${dir}`), `Skill name mismatch in ${dir}`);
    assert.match(skillMd, /description:\s*\S+/, `Missing description in ${dir}`);
    assert.match(skillMd, /## Decision tree/, `Missing '## Decision tree' in ${dir}`);
  }
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'sprint-board-template.md')), true);
  assert.equal(fs.existsSync(path.join(skillsDir, 'to-tickets', 'resources', 'ticket-template.md')), true);

  // 4. Subagents validation (sandbox/off policy + documented skills/<name> paths exist on disk)
  const agentsDir = path.join(repoRoot, '.agents', 'agents');
  const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  assert.equal(agentFiles.length, 3);
  for (const file of agentFiles) {
    const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
    assert.match(content, /commandExecutionPolicy:\s*(sandbox|off)/, `Subagent ${file} must use sandbox or off policy`);
    const skillMatches = [...content.matchAll(/^\s*-\s*(skills\/[a-z0-9-]+)\s*$/gm)];
    for (const m of skillMatches) {
      const skillRel = m[1];
      assert.equal(
        fs.existsSync(path.join(repoRoot, '.agents', skillRel, 'SKILL.md')),
        true,
        `Subagent ${file} references non-existent skill path ${skillRel}`,
      );
    }
  }
});
