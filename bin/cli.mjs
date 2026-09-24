#!/usr/bin/env node

/**
 * AAC (Antigravity Agent Core) CLI
 * The official setup, audit, and management tool for Google Antigravity workspaces.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const command = args[0] || 'help';

const VERSION = '5.3.1';

function showHelp() {
  console.log(`
AAC (Antigravity Agent Core) CLI v${VERSION}
Minimalist autonomous engineering framework for Google Antigravity

USAGE:
  npx @rafaelghif/aac-core <command> [options]
  (or: npx github:rafaelghif/antigravity-agents-core <command> [options])

COMMANDS:
  init          Scaffold AAC into current workspace (never touches package.json)
  upgrade       Safely update framework rules, skills, and hooks (preserves CONTEXT.md & secrets)
  audit         Audit workspace skills, rules, hooks, and integrity
  doctor        Diagnose environment, runtime, and configuration health
  list          List all available skills with triggers and descriptions
  scan          Scan workspace for leaked credentials, secrets, and dangerous commands
  quality       Check production code for anti-dummy/mock and realism violations
  review        Review git diff against Standards, Security, and Ponytail principles
  analyze       Analyze codebase metrics (LOC, cyclomatic complexity, deep module ratios)
  tasks         Manage DAG task graph and calculate execution waves (.scratch/tasks.json)
  memory        Manage Antigravity 5-tier memory, snapshots, and cold-start rehydration
  help          Show this help banner

OPTIONS:
  --force       Overwrite existing configuration files
  --json        Output results in JSON format
`);
}

function runInit() {
  const targetDir = process.cwd();
  const force = args.includes('--force');
  console.log(`\n🚀 Initializing AAC (Antigravity Agent Core v${VERSION}) in:\n   ${targetDir}\n`);

  if (path.resolve(targetDir) === path.resolve(packageRoot)) {
    console.log('ℹ️ Current directory is the framework source repository itself (nothing to scaffold).');
    return;
  }

  // 1. Copy .agents directory
  const sourceAgents = path.join(packageRoot, '.agents');
  const targetAgents = path.join(targetDir, '.agents');

  if (fs.existsSync(sourceAgents)) {
    console.log('📦 Scaffolding .agents/ directory...');
    fs.cpSync(sourceAgents, targetAgents, { recursive: true, force });
  }

  // 2. Copy docs directory (ADRs, agents domain/tracker configs, templates)
  const sourceDocs = path.join(packageRoot, 'docs');
  const targetDocs = path.join(targetDir, 'docs');

  if (fs.existsSync(sourceDocs)) {
    console.log('📚 Scaffolding docs/ directory (ADRs, tracker configs, templates)...');
    fs.cpSync(sourceDocs, targetDocs, { recursive: true, force });
  }

  // 3. Copy root files
  const rootFiles = ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md', 'CONTEXT.md', 'skills-lock.json', '.env.example'];
  for (const rf of rootFiles) {
    const srcFile = path.join(packageRoot, rf);
    const dstFile = path.join(targetDir, rf);
    if (fs.existsSync(srcFile)) {
      if (!fs.existsSync(dstFile) || force) {
        fs.copyFileSync(srcFile, dstFile);
        console.log(`📄 Created ${rf}`);
      } else {
        console.log(`⏩ Skipped ${rf} (already exists, use --force to overwrite)`);
      }
    }
  }

  // 3. Ensure .scratch directory exists
  const scratchDir = path.join(targetDir, '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
    fs.writeFileSync(path.join(scratchDir, '.gitkeep'), '# Ephemeral scratchpad directory\n');
    console.log('📁 Created .scratch/ directory');
  }

  // 4. Update .gitignore if present
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreAdditions = [
    '# Antigravity Runtime & Ephemeral State',
    '.gemini/',
    '*.log',
    '*.tmp',
    '.scratch/*',
    '!.scratch/.gitkeep',
    'handoff.md',
    '',
    '# Credentials & MCP Secrets',
    '.agents/mcp_config.json',
    '!.agents/mcp_config.example.json',
    '.agents/plugins/**/mcp_config.json',
    '!.agents/plugins/**/mcp_config.example.json',
    '.env',
    '.env.*',
    '!.env.example'
  ];

  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    let modified = false;
    for (const item of gitignoreAdditions) {
      if (item && !gitignoreContent.includes(item)) {
        gitignoreContent += `\n${item}`;
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(gitignorePath, gitignoreContent.trim() + '\n', 'utf-8');
      console.log('🛡️ Updated .gitignore with Antigravity guardrails');
    }
  } else {
    fs.writeFileSync(gitignorePath, gitignoreAdditions.join('\n') + '\n', 'utf-8');
    console.log('🛡️ Created .gitignore with Antigravity guardrails');
  }

  console.log(`
✅ Antigravity workspace initialization complete!
👉 Next steps:
   1. Open in Antigravity IDE or Antigravity 2.0.
   2. Configure MCP tokens by copying .agents/mcp_config.example.json to .agents/mcp_config.json
   3. Configure environment variables by copying .env.example to .env
   4. Run 'npx @rafaelghif/aac-core doctor' to verify readiness.
`);
}

function runUpgrade() {
  const targetDir = process.cwd();
  console.log(`\n🔄 Upgrading AAC (Antigravity Agent Core) to v${VERSION} in:\n   ${targetDir}\n`);

  if (path.resolve(targetDir) === path.resolve(packageRoot)) {
    console.log('ℹ️ Current directory is the framework source repository itself (nothing to upgrade).');
    return;
  }

  const hasAgents = fs.existsSync(path.join(targetDir, '.agents'));
  const hasAgentsMd = fs.existsSync(path.join(targetDir, 'AGENTS.md'));

  if (!hasAgents && !hasAgentsMd) {
    console.warn('⚠️ No existing Antigravity workspace detected in this directory.');
    console.log('👉 Run "npx @rafaelghif/aac-core init" to scaffold a fresh workspace first.\n');
    return;
  }

  // 1. Upgrade .agents/ directory (rules, skills, plugins, hooks)
  console.log('📦 Updating framework directives (.agents/rules, .agents/skills, .agents/plugins, .agents/hooks)...');

  const subdirs = ['rules', 'skills', 'plugins', 'hooks'];
  for (const sub of subdirs) {
    const srcSub = path.join(packageRoot, '.agents', sub);
    const dstSub = path.join(targetDir, '.agents', sub);
    if (fs.existsSync(srcSub)) {
      fs.cpSync(srcSub, dstSub, { recursive: true, force: true });
      console.log(`   ✔ Synchronized .agents/${sub}/`);
    }
  }

  // Update registry files in .agents/
  const metaFiles = ['skills.json', 'plugins.json', 'mcp_config.example.json'];
  for (const mf of metaFiles) {
    const srcMf = path.join(packageRoot, '.agents', mf);
    const dstMf = path.join(targetDir, '.agents', mf);
    if (fs.existsSync(srcMf)) {
      fs.copyFileSync(srcMf, dstMf);
      console.log(`   ✔ Updated .agents/${mf}`);
    }
  }

  // 2. Smart merge .agents/hooks.json
  const sourceHooksConfig = path.join(packageRoot, '.agents', 'hooks.json');
  const targetHooksConfig = path.join(targetDir, '.agents', 'hooks.json');
  if (fs.existsSync(sourceHooksConfig)) {
    let mergedHooks = {};
    const frameworkHooks = JSON.parse(fs.readFileSync(sourceHooksConfig, 'utf-8'));
    if (fs.existsSync(targetHooksConfig)) {
      try {
        const existingHooks = JSON.parse(fs.readFileSync(targetHooksConfig, 'utf-8'));
        mergedHooks = { ...existingHooks };
        for (const [groupName, groupDef] of Object.entries(frameworkHooks)) {
          if (!mergedHooks[groupName]) {
            mergedHooks[groupName] = groupDef;
          } else {
            const userEnabled = mergedHooks[groupName].enabled !== undefined ? mergedHooks[groupName].enabled : groupDef.enabled;
            mergedHooks[groupName] = {
              ...groupDef,
              enabled: userEnabled
            };
          }
        }
      } catch {
        console.warn('   ⚠️ Could not parse existing hooks.json, creating hooks.json.bak before updating.');
        fs.copyFileSync(targetHooksConfig, targetHooksConfig + '.bak');
        mergedHooks = frameworkHooks;
      }
    } else {
      mergedHooks = frameworkHooks;
    }
    fs.writeFileSync(targetHooksConfig, JSON.stringify(mergedHooks, null, 2) + '\n', 'utf-8');
    console.log('   ✔ Smart-merged .agents/hooks.json (custom hooks and user toggles preserved)');
  }

  // 3. Preserve credentials: .agents/mcp_config.json
  const targetMcpConfig = path.join(targetDir, '.agents', 'mcp_config.json');
  if (fs.existsSync(targetMcpConfig)) {
    console.log('   🔒 Preserved workspace secrets: .agents/mcp_config.json');
  }

  // 4. Update docs directory (ADRs, templates, configs), preserving user ADRs
  const sourceDocs = path.join(packageRoot, 'docs');
  const targetDocs = path.join(targetDir, 'docs');
  if (fs.existsSync(sourceDocs)) {
    console.log('📚 Updating framework documentation (docs/agents, docs/templates, base ADRs)...');
    fs.cpSync(sourceDocs, targetDocs, { recursive: true, force: true });
    console.log('   ✔ Synchronized docs/ directory (custom user ADRs preserved)');
  }

  // 5. Update root framework files (AGENTS.md, GEMINI.md, CLAUDE.md, skills-lock.json, .env.example)
  const rootFrameworkFiles = ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md', 'skills-lock.json', '.env.example'];
  for (const rf of rootFrameworkFiles) {
    const srcFile = path.join(packageRoot, rf);
    const dstFile = path.join(targetDir, rf);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, dstFile);
      console.log(`   ✔ Updated ${rf}`);
    }
  }

  // 6. STRICT PRESERVATION: CONTEXT.md
  const targetContext = path.join(targetDir, 'CONTEXT.md');
  if (fs.existsSync(targetContext)) {
    console.log('   🔒 Preserved user domain context: CONTEXT.md (never overwritten)');
  } else {
    const srcContext = path.join(packageRoot, 'CONTEXT.md');
    if (fs.existsSync(srcContext)) {
      fs.copyFileSync(srcContext, targetContext);
      console.log('   📄 Created default CONTEXT.md (did not previously exist)');
    }
  }

  // 7. Ensure .scratch directory is preserved
  const scratchDir = path.join(targetDir, '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
    fs.writeFileSync(path.join(scratchDir, '.gitkeep'), '# Ephemeral scratchpad directory\n');
  }
  console.log('   🔒 Preserved ephemeral scratchpad: .scratch/');

  // 8. Update .gitignore with latest guardrails
  const gitignorePath = path.join(targetDir, '.gitignore');
  const gitignoreAdditions = [
    '# Antigravity Runtime & Ephemeral State',
    '.gemini/',
    '*.log',
    '*.tmp',
    '.scratch/*',
    '!.scratch/.gitkeep',
    'handoff.md',
    '',
    '# Credentials & MCP Secrets',
    '.agents/mcp_config.json',
    '!.agents/mcp_config.example.json',
    '.agents/plugins/**/mcp_config.json',
    '!.agents/plugins/**/mcp_config.example.json',
    '.env',
    '.env.*',
    '!.env.example'
  ];

  if (fs.existsSync(gitignorePath)) {
    let gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    let modified = false;
    for (const item of gitignoreAdditions) {
      if (item && !gitignoreContent.includes(item)) {
        gitignoreContent += `\n${item}`;
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(gitignorePath, gitignoreContent.trim() + '\n', 'utf-8');
      console.log('   🛡️ Synchronized .gitignore guardrails');
    }
  } else {
    fs.writeFileSync(gitignorePath, gitignoreAdditions.join('\n') + '\n', 'utf-8');
    console.log('   🛡️ Created .gitignore with Antigravity guardrails');
  }

  console.log(`
✅ AAC upgrade to v${VERSION} complete!
Summary of Protections:
 - 🔒 CONTEXT.md preserved (custom domain model intact)
 - 🔒 .agents/mcp_config.json preserved (API tokens and MCP configurations intact)
 - 🔒 Custom hooks in .agents/hooks.json preserved
 - 🔒 .scratch/ handoffs preserved
 - 🔒 package.json untouched (zero pollution)
`);
}

function runAudit() {
  const targetDir = process.cwd();
  console.log(`\n🔍 Auditing Antigravity workspace in:\n   ${targetDir}\n`);

  const issues = [];

  // 1. Check AGENTS.md
  const agentsPath = path.join(targetDir, 'AGENTS.md');
  if (!fs.existsSync(agentsPath)) {
    issues.push('Missing root AGENTS.md');
  } else {
    const content = fs.readFileSync(agentsPath, 'utf-8');
    if (content.length > 12000) {
      issues.push(`AGENTS.md length is ${content.length} chars (exceeds 12000 limit)`);
    }
    if (!content.includes('file:///')) {
      issues.push('AGENTS.md missing clickable file:/// links');
    }
  }

  // 2. Check rules
  const rulesDir = path.join(targetDir, '.agents', 'rules');
  if (!fs.existsSync(rulesDir)) {
    issues.push('Missing .agents/rules directory');
  } else {
    const rules = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
    if (rules.length === 0) {
      issues.push('No modular rules found in .agents/rules');
    }
    for (const rf of rules) {
      const content = fs.readFileSync(path.join(rulesDir, rf), 'utf-8');
      if (!content.includes('trigger:')) {
        issues.push(`Rule ${rf} missing frontmatter trigger specification`);
      }
    }
  }

  // 3. Check skills
  const skillsDir = path.join(targetDir, '.agents', 'skills');
  if (!fs.existsSync(skillsDir)) {
    issues.push('Missing .agents/skills directory');
  } else {
    const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    console.log(`Checking ${skills.length} skills...`);
    for (const sf of skills) {
      const sfPath = path.join(skillsDir, sf, 'SKILL.md');
      if (!fs.existsSync(sfPath)) {
        issues.push(`Skill ${sf} missing SKILL.md`);
        continue;
      }
      const content = fs.readFileSync(sfPath, 'utf-8');
      if (!content.includes(`name: ${sf}`)) {
        issues.push(`Skill ${sf} name in frontmatter does not match folder`);
      }
      if (!/use when|trigger:/i.test(content)) {
        issues.push(`Skill ${sf} description lacks "Use when..." or "Trigger:" phrasing`);
      }
    }
  }

  // 4. Check hooks
  const hooksFile = path.join(targetDir, '.agents', 'hooks.json');
  if (!fs.existsSync(hooksFile)) {
    issues.push('Missing .agents/hooks.json');
  } else {
    try {
      JSON.parse(fs.readFileSync(hooksFile, 'utf-8'));
    } catch (e) {
      issues.push(`.agents/hooks.json has invalid JSON syntax: ${e.message}`);
    }
  }

  console.log(`\nAudit Results: ${issues.length === 0 ? '✅ 100% COMPLIANT' : `⚠️ ${issues.length} ISSUES DETECTED`}`);
  if (issues.length > 0) {
    issues.forEach(iss => console.log(` - ❌ ${iss}`));
    process.exit(1);
  } else {
    console.log('✨ All Antigravity operational criteria and best practices satisfied.');
  }
}

function runDoctor() {
  console.log(`\n🩺 Antigravity Environment & Diagnostic Doctor (v${VERSION})\n`);

  const checks = [
    {
      name: 'Node.js Runtime',
      run: () => {
        const version = process.version;
        const major = parseInt(version.replace('v', '').split('.')[0], 10);
        return { ok: major >= 18, message: `Node.js ${version} (required >= 18.0.0)` };
      }
    },
    {
      name: 'Workspace Scope',
      run: () => {
        const cwd = process.cwd();
        const hasAgents = fs.existsSync(path.join(cwd, '.agents'));
        const hasAgentsMd = fs.existsSync(path.join(cwd, 'AGENTS.md'));
        return { ok: hasAgents && hasAgentsMd, message: hasAgents && hasAgentsMd ? 'Antigravity workspace detected' : 'Not an Antigravity workspace (run npx @rafaelghif/aac-core init)' };
      }
    },
    {
      name: 'Skills Integrity',
      run: () => {
        const skillsDir = path.join(process.cwd(), '.agents', 'skills');
        if (!fs.existsSync(skillsDir)) return { ok: false, message: 'Missing .agents/skills folder' };
        const count = fs.readdirSync(skillsDir).filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory()).length;
        return { ok: count > 0, message: `${count} skills mounted` };
      }
    },
    {
      name: 'Hooks Integrity',
      run: () => {
        const hooksPath = path.join(process.cwd(), '.agents', 'hooks.json');
        if (!fs.existsSync(hooksPath)) return { ok: false, message: 'Missing .agents/hooks.json' };
        try {
          const json = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
          const hookCount = Object.keys(json).length;
          return { ok: true, message: `${hookCount} hook groups configured (${Object.keys(json).join(', ')})` };
        } catch {
          return { ok: false, message: 'Corrupted .agents/hooks.json' };
        }
      }
    },
    {
      name: 'MCP Configuration',
      run: () => {
        const mcpPath = path.join(process.cwd(), '.agents', 'mcp_config.json');
        const examplePath = path.join(process.cwd(), '.agents', 'mcp_config.example.json');
        if (fs.existsSync(mcpPath)) return { ok: true, message: 'Active .agents/mcp_config.json found' };
        if (fs.existsSync(examplePath)) return { ok: true, message: 'Template mcp_config.example.json present (copy to mcp_config.json to activate)' };
        return { ok: false, message: 'Missing MCP configuration' };
      }
    },
    {
      name: 'Environment Config',
      run: () => {
        const envPath = path.join(process.cwd(), '.env');
        const examplePath = path.join(process.cwd(), '.env.example');
        if (fs.existsSync(envPath)) return { ok: true, message: 'Active .env found' };
        if (fs.existsSync(examplePath)) return { ok: true, message: 'Template .env.example present (copy to .env to activate)' };
        return { ok: false, message: 'Missing .env and .env.example' };
      }
    }
  ];

  for (const c of checks) {
    const res = c.run();
    console.log(`${res.ok ? '✅' : '❌'} ${c.name.padEnd(20)}: ${res.message}`);
  }
  console.log('\nDiagnostic complete.\n');
}

function runList() {
  const skillsDir = path.join(packageRoot, '.agents', 'skills');
  if (!fs.existsSync(skillsDir)) {
    console.error('Skills directory not found.');
    process.exit(1);
  }
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  console.log(`\n📚 Antigravity 64-Skill Suite (v${VERSION}):\n`);
  skills.forEach((s, idx) => {
    const skillPath = path.join(skillsDir, s, 'SKILL.md');
    let desc = '';
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf-8');
      const descMatch = content.match(/description:\s*(?:>-\s*|>|\s*)?([\s\S]*?)(?=\n---|\n#)/);
      if (descMatch) desc = descMatch[1].replace(/\r?\n/g, ' ').trim().slice(0, 75) + '...';
    }
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. ${s.padEnd(30)} ${desc}`);
  });
  console.log(`\nTotal: ${skills.length} skills available.\n`);
}

function runScan() {
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();
  const securityScanner = require('../.agents/hooks/security-scanner.cjs');
  const issues = securityScanner.scanDirectory(target);
  console.log(`\n🛡️ Security & Secret Scanner Report for: ${path.resolve(target)}\n`);
  if (issues.length === 0) {
    console.log('✅ No exposed secrets or credentials detected in workspace files.\n');
  } else {
    console.log(`⚠️ Detected ${issues.length} potential secret(s):\n`);
    issues.forEach(iss => console.log(` - ❌ [${iss.type}] ${iss.file}:${iss.line}`));
    console.log('\nRemediation: Store credentials in environment variables or .agents/mcp_config.json.\n');
    process.exit(1);
  }
}

function runQuality() {
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();
  const qualityGuard = require('../.agents/hooks/quality-guard.cjs');
  const issues = qualityGuard.checkDirectory(target);
  console.log(`\n💎 Quality Code & Production Integrity Report for: ${path.resolve(target)}\n`);
  if (issues.length === 0) {
    console.log('✅ 100% Production Realism: No fake tokens, dummy IDs, or incomplete TODOs found in production code.\n');
  } else {
    console.log(`⚠️ Detected ${issues.length} dummy/mock violation(s) in production code:\n`);
    issues.forEach(iss => console.log(` - ❌ ${iss.file}:${iss.line} -> ${iss.description}`));
    console.log('\nRemediation: Wire real types and concrete implementations. Move test fixtures to tests/ folder.\n');
    process.exit(1);
  }
}

function runReview() {
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();
  const codeAnalyzer = require('../.agents/hooks/code-analyzer.cjs');
  const diff = codeAnalyzer.getGitDiff(target);
  const review = codeAnalyzer.reviewDiff(diff, target);
  console.log(codeAnalyzer.formatReviewReport(review));
  if (review.errors > 0) {
    process.exit(1);
  }
}

function runAnalyze() {
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();
  const codeAnalyzer = require('../.agents/hooks/code-analyzer.cjs');
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    console.error(`Target path does not exist: ${resolved}`);
    process.exit(1);
  }
  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    const summary = codeAnalyzer.analyzeDirectory(resolved);
    console.log(`\n📊 Codebase Metrics for: ${summary.directory}`);
    console.log(`   Files Scanned:          ${summary.totalFiles}`);
    console.log(`   Total Code Lines:       ${summary.totalLOC}`);
    console.log(`   Avg Complexity:         ${summary.avgComplexity}`);
    console.log(`   Deep Modules (>=25):    ${summary.deepModules}`);
    console.log(`   Shallow Modules (<10):   ${summary.shallowModules}\n`);
    console.log('Top complex files:');
    summary.files.slice(0, 10).forEach((f, idx) => {
      console.log(`   ${idx + 1}. ${f.fileName.padEnd(25)} LOC: ${String(f.codeLines).padStart(5)} | Complexity: ${String(f.cyclomaticComplexity).padStart(3)} | Ratio: ${String(f.deepModuleRatio).padStart(4)} (${f.moduleDepth})`);
    });
    console.log('');
  } else {
    const f = codeAnalyzer.analyzeFile(resolved);
    console.log(JSON.stringify(f, null, 2));
  }
}

function runTasks() {
  const taskOrchestrator = require('../.agents/hooks/task-orchestrator.cjs');
  const subcmd = args[1] || 'summary';
  const target = process.cwd();

  switch (subcmd) {
    case 'summary':
    case 'list':
      console.log(taskOrchestrator.formatTaskSummary(target));
      break;
    case 'waves': {
      const data = taskOrchestrator.loadTasks(target);
      const calc = taskOrchestrator.calculateWaves(data.tasks);
      console.log(JSON.stringify(calc, null, 2));
      break;
    }
    case 'next': {
      const runnable = taskOrchestrator.getRunnableTasks(target);
      console.log(JSON.stringify(runnable, null, 2));
      break;
    }
    case 'add': {
      const id = args[2];
      const title = args[3];
      const deps = args[4] ? args[4].split(',') : [];
      if (!id || !title) {
        console.error('Usage: aac tasks add <id> <title> [dep1,dep2]');
        process.exit(1);
      }
      const added = taskOrchestrator.addTask(target, { id, title, dependsOn: deps });
      console.log(`✅ Added task ${added.id}: ${added.title}`);
      break;
    }
    case 'update': {
      const id = args[2];
      const status = args[3];
      const notes = args[4] || '';
      if (!id || !status) {
        console.error('Usage: aac tasks update <id> <status> [notes]');
        process.exit(1);
      }
      const updated = taskOrchestrator.updateTask(target, id, { status, notes });
      if (updated) {
        console.log(`✅ Updated task ${id} -> ${status}`);
      } else {
        console.error(`Task ${id} not found.`);
        process.exit(1);
      }
      break;
    }
    case 'verify': {
      const id = args[2];
      if (!id) {
        console.error('Usage: aac tasks verify <id>');
        process.exit(1);
      }
      const res = taskOrchestrator.verifyTask(target, id);
      if (res.success) {
        console.log(`✅ Task ${id} verified successfully!`);
      } else {
        console.error(`❌ Task ${id} verification failed: ${res.message || res.output}`);
        process.exit(1);
      }
      break;
    }
    case 'sync': {
      const res = taskOrchestrator.syncMarkdownTickets(target);
      console.log(`✅ Synchronized ${res.synced} ticket(s) from .scratch into .scratch/tasks.json`);
      break;
    }
    default:
      console.log('Commands: aac tasks [summary|list|waves|next|add|update|verify|sync]');
      break;
  }
}

function runMemory() {
  const memoryEngine = require('../.agents/hooks/memory-engine.cjs');
  const subcmd = args[1] || 'status';
  const target = process.cwd();

  switch (subcmd) {
    case 'status': {
      const tiers = memoryEngine.getMemoryTiersStatus(target);
      console.log(`\n🧠 Antigravity 5-Tier Memory Architecture Status:\n`);
      for (const [key, val] of Object.entries(tiers)) {
        const mark = val.ready ? '✅' : '⚠️';
        console.log(`${mark} ${val.name}`);
        console.log(`   └─ ${val.details}`);
      }
      console.log('');
      break;
    }
    case 'snapshot': {
      const snap = memoryEngine.snapshotContext(target);
      console.log('✅ Context snapshot updated in .scratch/active_context.json');
      console.log(JSON.stringify(snap, null, 2));
      break;
    }
    case 'rehydrate': {
      console.log(memoryEngine.rehydrateContext(target));
      break;
    }
    default:
      console.log('Commands: aac memory [status|snapshot|rehydrate]');
      break;
  }
}

switch (command) {
  case 'init':
    runInit();
    break;
  case 'upgrade':
    runUpgrade();
    break;
  case 'audit':
    runAudit();
    break;
  case 'doctor':
    runDoctor();
    break;
  case 'list':
    runList();
    break;
  case 'scan':
    runScan();
    break;
  case 'quality':
    runQuality();
    break;
  case 'review':
    runReview();
    break;
  case 'analyze':
    runAnalyze();
    break;
  case 'tasks':
  case 'task':
    runTasks();
    break;
  case 'memory':
    runMemory();
    break;
  case 'version':
  case '-v':
  case '--version':
    console.log(`@rafaelghif/aac-core v${VERSION}`);
    break;
  case 'help':
  case '-h':
  case '--help':
  default:
    showHelp();
    break;
}
