const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Antigravity 5-Tier Memory Engine & PreInvocation Hook
 * Manages working memory, snapshot consolidation, and cold-start rehydration.
 * Pure Node.js stdlib with zero external dependencies.
 */

function resolveWorkspace(targetDir) {
  if (targetDir) return path.resolve(targetDir);
  return path.resolve(process.env.WORKSPACE_ROOT || path.join(__dirname, '..', '..'));
}

/**
 * Inspects all 5 tiers of the Antigravity Memory Hierarchy.
 */
function getMemoryTiersStatus(workspaceDir) {
  const root = resolveWorkspace(workspaceDir);

  // Tier 1: Ephemeral working context
  const scratchDir = path.join(root, '.scratch');
  const hasScratch = fs.existsSync(scratchDir);

  // Tier 2: Unconditional Workspace Directives
  const agentsPath = path.join(root, 'AGENTS.md');
  const rulesDir = path.join(root, '.agents', 'rules');
  const agentsLength = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf-8').length : 0;
  const ruleCount = fs.existsSync(rulesDir) ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.md')).length : 0;

  // Tier 3: Domain & Architectural Knowledge
  const contextPath = path.join(root, 'CONTEXT.md');
  const adrDir = path.join(root, 'docs', 'adr');
  const hasContext = fs.existsSync(contextPath);
  const adrCount = fs.existsSync(adrDir) ? fs.readdirSync(adrDir).filter(f => f.endsWith('.md')).length : 0;

  // Tier 4: Session Bridge Handoff
  const handoffPath = path.join(root, '.scratch', 'handoff.md');
  const activeContextPath = path.join(root, '.scratch', 'active_context.json');
  const hasHandoff = fs.existsSync(handoffPath);
  const hasActiveContext = fs.existsSync(activeContextPath);

  // Tier 5: External Task Graph
  const tasksPath = path.join(root, '.scratch', 'tasks.json');
  let taskCount = 0;
  let doneCount = 0;
  if (fs.existsSync(tasksPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
      taskCount = (data.tasks || []).length;
      doneCount = (data.tasks || []).filter(t => t.status === 'done' || t.status === 'verified').length;
    } catch {}
  }

  return {
    tier1: {
      name: 'Tier 1: Ephemeral Session Context',
      ready: true,
      details: 'Active in-memory turn context & transcript'
    },
    tier2: {
      name: 'Tier 2: Unconditional Workspace Directives',
      ready: agentsLength > 0 && agentsLength <= 12000 && ruleCount > 0,
      details: `AGENTS.md (${agentsLength} / 12000 chars), ${ruleCount} active rules in .agents/rules/`
    },
    tier3: {
      name: 'Tier 3: Domain & Architectural Knowledge',
      ready: hasContext,
      details: `CONTEXT.md (${hasContext ? 'Present' : 'Missing'}), ${adrCount} ADRs in docs/adr/`
    },
    tier4: {
      name: 'Tier 4: Session Bridge Handoff',
      ready: hasHandoff || hasActiveContext,
      details: `handoff.md (${hasHandoff ? 'Available' : 'None'}), active_context.json (${hasActiveContext ? 'Present' : 'None'})`
    },
    tier5: {
      name: 'Tier 5: Task Graph & Issue Frontier',
      ready: taskCount > 0,
      details: `${doneCount}/${taskCount} tasks completed in .scratch/tasks.json`
    }
  };
}

/**
 * Creates or updates .scratch/active_context.json snapshot.
 */
function snapshotContext(workspaceDir) {
  const root = resolveWorkspace(workspaceDir);
  const scratchDir = path.join(root, '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  let branch = 'unknown';
  let uncommittedCount = 0;
  try {
    branch = execSync('git branch --show-current', { cwd: root, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    const status = execSync('git status --porcelain', { cwd: root, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    uncommittedCount = status ? status.split('\n').length : 0;
  } catch {}

  const tasksPath = path.join(scratchDir, 'tasks.json');
  let openTasks = [];
  if (fs.existsSync(tasksPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
      openTasks = (data.tasks || []).filter(t => t.status !== 'done' && t.status !== 'verified').map(t => ({ id: t.id, title: t.title, status: t.status }));
    } catch {}
  }

  const snapshot = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    git: {
      branch,
      uncommittedChanges: uncommittedCount
    },
    taskFrontier: {
      openCount: openTasks.length,
      nextTasks: openTasks.slice(0, 5)
    },
    memoryTiers: getMemoryTiersStatus(root)
  };

  fs.writeFileSync(path.join(scratchDir, 'active_context.json'), JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
  return snapshot;
}

/**
 * Rehydrates context from .scratch/handoff.md or .scratch/active_context.json.
 */
function rehydrateContext(workspaceDir) {
  const root = resolveWorkspace(workspaceDir);
  const handoffPath = path.join(root, '.scratch', 'handoff.md');
  const activeContextPath = path.join(root, '.scratch', 'active_context.json');

  let report = '🧠 Antigravity Cold-Start Context Rehydration:\n\n';

  if (fs.existsSync(handoffPath)) {
    const handoff = fs.readFileSync(handoffPath, 'utf-8');
    const nextActionMatch = handoff.match(/### Immediate Next Action\s*\n([\s\S]*?)(?=\n###|\n##|$)/i);
    report += '📄 Handoff Checkpoint (.scratch/handoff.md):\n';
    if (nextActionMatch) {
      report += `   👉 Immediate Next Action: ${nextActionMatch[1].trim()}\n\n`;
    } else {
      report += '   Found handoff.md, review for pending work items.\n\n';
    }
  }

  if (fs.existsSync(activeContextPath)) {
    try {
      const active = JSON.parse(fs.readFileSync(activeContextPath, 'utf-8'));
      report += `🔄 Active Context Snapshot (${active.timestamp}):\n`;
      report += `   Git Branch: ${active.git.branch} (${active.git.uncommittedChanges} uncommitted change(s))\n`;
      report += `   Open Tasks: ${active.taskFrontier.openCount}\n`;
      active.taskFrontier.nextTasks.forEach(t => {
        report += `   - [${t.status}] ${t.id}: ${t.title}\n`;
      });
    } catch {}
  }

  return report;
}

module.exports = {
  getMemoryTiersStatus,
  snapshotContext,
  rehydrateContext
};

// Lifecycle hook and CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const isCli = args.length > 0;

  let stdin = '';
  if (!isCli && !process.stdin.isTTY) {
    try {
      stdin = fs.readFileSync(0, 'utf-8');
    } catch (e) {}
  }

  if (stdin && stdin.trim()) {
    try {
      const payload = JSON.parse(stdin);
      const rootDir = (payload.workspacePaths && payload.workspacePaths[0])
        ? path.resolve(payload.workspacePaths[0])
        : resolveWorkspace();

      // Check if called as PreInvocation hook
      const isPreInvocation = payload.invocationNum !== undefined || (payload.toolCall === undefined && payload.terminationReason === undefined);

      if (isPreInvocation) {
        const scratchDir = path.join(rootDir, '.scratch');
        const handoffPath = path.join(scratchDir, 'handoff.md');
        const injectSteps = [];

        // On initial turns, inject session continuity message if prior handoff exists
        const isInitialTurn = (payload.invocationNum === 1 || payload.stepIdx === 0 || payload.initialNumSteps === 0 || payload.stepIdx === undefined);
        if (isInitialTurn && fs.existsSync(handoffPath)) {
          injectSteps.push({
            ephemeralMessage: 'Session Continuity (Tier 4): Active session handoff detected at .scratch/handoff.md. Inspect .scratch/handoff.md via view_file to rehydrate previous progress and immediate next actions.'
          });
        }

        process.stdout.write(JSON.stringify({ injectSteps }));
        process.exit(0);
      }

      // Stop hook snapshot consolidation
      if (payload.terminationReason === 'model_stop') {
        snapshotContext(rootDir);
      }
    } catch (e) {}
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  const subcmd = args[0] || 'status';
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  switch (subcmd) {
    case 'status': {
      const tiers = getMemoryTiersStatus(target);
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
      const snap = snapshotContext(target);
      console.log('Context snapshot written to .scratch/active_context.json');
      console.log(JSON.stringify(snap, null, 2));
      break;
    }
    case 'rehydrate': {
      console.log(rehydrateContext(target));
      break;
    }
    default:
      console.log('Usage: node memory-engine.cjs [status|snapshot|rehydrate] [path]');
      break;
  }
}
