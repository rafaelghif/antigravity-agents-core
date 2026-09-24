const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Antigravity Task Orchestrator & Wave Planner Engine
 * Manages local DAG task graphs (.scratch/tasks.json) with topological wave partitioning.
 * Zero external dependencies - pure Node.js stdlib.
 */

function resolveWorkspace(targetDir) {
  if (targetDir) return path.resolve(targetDir);
  return path.resolve(process.env.WORKSPACE_ROOT || path.join(__dirname, '..', '..'));
}

function getTasksFilePath(workspaceDir) {
  const root = resolveWorkspace(workspaceDir);
  return path.join(root, '.scratch', 'tasks.json');
}

function loadTasks(workspaceDir) {
  const filePath = getTasksFilePath(workspaceDir);
  if (!fs.existsSync(filePath)) {
    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      activeWave: 1,
      tasks: []
    };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      activeWave: 1,
      tasks: []
    };
  }
}

function saveTasks(workspaceDir, data) {
  const root = resolveWorkspace(workspaceDir);
  const scratchDir = path.join(root, '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(path.join(scratchDir, 'tasks.json'), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function addTask(workspaceDir, taskDef) {
  const data = loadTasks(workspaceDir);
  const existingIdx = data.tasks.findIndex(t => t.id === taskDef.id);
  const task = {
    id: String(taskDef.id || `T-${data.tasks.length + 1}`).trim(),
    title: String(taskDef.title || 'Untitled task').trim(),
    status: taskDef.status || 'pending', // pending | in_progress | blocked | verified | done
    dependsOn: Array.isArray(taskDef.dependsOn)
      ? taskDef.dependsOn
      : (taskDef.dependsOn ? String(taskDef.dependsOn).split(',').map(s => s.trim()).filter(Boolean) : []),
    assignedTo: taskDef.assignedTo || 'self',
    verificationCmd: taskDef.verificationCmd || '',
    notes: taskDef.notes || ''
  };

  if (existingIdx >= 0) {
    data.tasks[existingIdx] = { ...data.tasks[existingIdx], ...task };
  } else {
    data.tasks.push(task);
  }

  saveTasks(workspaceDir, data);
  return task;
}

function updateTask(workspaceDir, id, updates) {
  const data = loadTasks(workspaceDir);
  const task = data.tasks.find(t => t.id === id);
  if (!task) {
    return null;
  }
  Object.assign(task, updates);
  saveTasks(workspaceDir, data);
  return task;
}

function verifyTask(workspaceDir, taskId) {
  const root = resolveWorkspace(workspaceDir);
  const data = loadTasks(root);
  const task = data.tasks.find(t => t.id === taskId);
  if (!task) {
    return { success: false, message: `Task ${taskId} not found` };
  }
  if (!task.verificationCmd) {
    return { success: false, message: `Task ${taskId} has no verificationCmd configured` };
  }

  updateTask(root, taskId, { status: 'verifying' });
  try {
    const output = execSync(task.verificationCmd, { cwd: root, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const verified = updateTask(root, taskId, {
      status: 'verified',
      notes: `Verified successfully: ${task.verificationCmd} (${new Date().toISOString()})`
    });
    return { success: true, output, task: verified };
  } catch (err) {
    const errorMsg = (err.stderr || err.stdout || err.message || '').slice(0, 500);
    const blocked = updateTask(root, taskId, {
      status: 'blocked',
      notes: `Verification failed: ${errorMsg}`
    });
    return { success: false, output: errorMsg, task: blocked };
  }
}

/**
 * Computes execution waves using DAG topological ordering.
 * Wave 1 contains tasks whose dependencies are satisfied (done/verified or none).
 * Successive waves unlock as previous waves complete.
 */
function calculateWaves(tasks) {
  const completedIds = new Set(
    tasks.filter(t => t.status === 'done' || t.status === 'verified').map(t => t.id)
  );

  const pendingTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'verified');
  const waves = [];
  const simulatedDone = new Set(completedIds);
  let remaining = [...pendingTasks];
  let guard = 0;

  while (remaining.length > 0 && guard < 100) {
    guard++;
    const currentWave = [];
    const nextRemaining = [];

    for (const task of remaining) {
      const deps = task.dependsOn || [];
      const isSatisfied = deps.every(depId => simulatedDone.has(depId));
      if (isSatisfied) {
        currentWave.push(task);
      } else {
        nextRemaining.push(task);
      }
    }

    if (currentWave.length === 0) {
      // Remaining tasks have unsatisfied/cyclic dependencies
      break;
    }

    waves.push(currentWave);
    currentWave.forEach(t => simulatedDone.add(t.id));
    remaining = nextRemaining;
  }

  return {
    completed: tasks.filter(t => t.status === 'done' || t.status === 'verified'),
    waves,
    blockedOrCyclic: remaining
  };
}

function getRunnableTasks(workspaceDir) {
  const data = loadTasks(workspaceDir);
  const { waves } = calculateWaves(data.tasks);
  if (waves.length === 0) return [];
  // Return pending or in_progress tasks in the immediate frontier wave
  return waves[0];
}

function formatTaskSummary(workspaceDir) {
  const data = loadTasks(workspaceDir);
  const total = data.tasks.length;
  if (total === 0) {
    return 'No tasks registered in .scratch/tasks.json';
  }

  const { completed, waves, blockedOrCyclic } = calculateWaves(data.tasks);
  const doneCount = completed.length;
  const inProgressCount = data.tasks.filter(t => t.status === 'in_progress').length;
  const pendingCount = data.tasks.filter(t => t.status === 'pending').length;

  let out = `📋 Task Graph Summary (${doneCount}/${total} Completed)\n`;
  out += `   Status: ${doneCount} Done, ${inProgressCount} In Progress, ${pendingCount} Pending, ${blockedOrCyclic.length} Blocked\n`;
  out += `   Waves Remaining: ${waves.length}\n\n`;

  if (waves.length > 0) {
    out += `🎯 Frontier (Wave 1 - Ready for Execution):\n`;
    waves[0].forEach(t => {
      out += `   - [${t.status.toUpperCase()}] ${t.id}: ${t.title}${t.verificationCmd ? ` (verify: ${t.verificationCmd})` : ''}\n`;
    });
  }

  if (waves.length > 1) {
    out += `\n⏳ Upstream Queued Waves:\n`;
    for (let i = 1; i < waves.length; i++) {
      out += `   Wave ${i + 1} (${waves[i].length} tasks): ${waves[i].map(t => t.id).join(', ')}\n`;
    }
  }

  if (blockedOrCyclic.length > 0) {
    out += `\n⚠️ Blocked / Circular Dependencies:\n`;
    blockedOrCyclic.forEach(t => {
      out += `   - ${t.id}: ${t.title} (depends on: ${t.dependsOn.join(', ')})\n`;
    });
  }

  return out;
}

// Module export for CLI and other hooks
module.exports = {
  loadTasks,
  saveTasks,
  addTask,
  updateTask,
  verifyTask,
  calculateWaves,
  getRunnableTasks,
  formatTaskSummary,
  getTasksFilePath
};

// Lifecycle hook and CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const isCli = args.length > 0;

  let stdin = '';
  if (!isCli && !process.stdin.isTTY) {
    try {
      stdin = fs.readFileSync(0, 'utf-8');
    } catch (e) {
      // Stdin empty or not available
    }
  }

  if (stdin && stdin.trim()) {
    // Running as Antigravity hook (PreInvocation or Stop)
    try {
      const payload = JSON.parse(stdin);
      const rootDir = (payload.workspacePaths && payload.workspacePaths[0])
        ? path.resolve(payload.workspacePaths[0])
        : resolveWorkspace();

      if (payload.terminationReason === 'model_stop') {
        const data = loadTasks(rootDir);
        const inProgress = data.tasks.filter(t => t.status === 'in_progress');
        if (inProgress.length > 0) {
          process.stderr.write(`[task-orchestrator] Note: ${inProgress.length} tasks remain marked in_progress.\n`);
        }
      }
    } catch (e) {
      // Ignore hook payload errors
    }
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // CLI execution via process.argv
  const subcmd = args[0] || 'summary';
  const targetDir = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  switch (subcmd) {
    case 'list':
    case 'summary':
      console.log(formatTaskSummary(targetDir));
      break;
    case 'waves': {
      const data = loadTasks(targetDir);
      const calc = calculateWaves(data.tasks);
      console.log(JSON.stringify(calc, null, 2));
      break;
    }
    case 'next': {
      const runnable = getRunnableTasks(targetDir);
      console.log(JSON.stringify(runnable, null, 2));
      break;
    }
    case 'add': {
      const id = args[1];
      const title = args[2];
      const deps = args[3] ? args[3].split(',') : [];
      if (!id || !title) {
        console.error('Usage: node task-orchestrator.cjs add <id> <title> [dep1,dep2]');
        process.exit(1);
      }
      const added = addTask(targetDir, { id, title, dependsOn: deps });
      console.log(`Added task ${added.id}: ${added.title}`);
      break;
    }
    case 'update': {
      const id = args[1];
      const status = args[2];
      const notes = args[3] || '';
      if (!id || !status) {
        console.error('Usage: node task-orchestrator.cjs update <id> <status> [notes]');
        process.exit(1);
      }
      const updated = updateTask(targetDir, id, { status, notes });
      if (updated) {
        console.log(`Updated task ${id} -> ${status}`);
      } else {
        console.error(`Task ${id} not found.`);
        process.exit(1);
      }
      break;
    }
    case 'verify': {
      const id = args[1];
      if (!id) {
        console.error('Usage: node task-orchestrator.cjs verify <id>');
        process.exit(1);
      }
      const res = verifyTask(targetDir, id);
      if (res.success) {
        console.log(`✅ Task ${id} verified successfully!`);
      } else {
        console.error(`❌ Task ${id} verification failed: ${res.message || res.output}`);
        process.exit(1);
      }
      break;
    }
    default:
      console.log('Commands: summary, list, waves, next, add, update, verify');
      break;
  }
}
