const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Universal Quality Gate (Stop Hook)
 * Dynamically detects the host project's actual test framework (Node, Go, Rust, Python, Make)
 * and executes verification before session termination.
 * Zero external dependencies - pure Node.js stdlib.
 */

if (process.env.AAC_QUALITY_GATE_RUNNING) {
  // Prevent recursive execution loops
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

let input = '';
if (!process.stdin.isTTY) {
  try {
    input = fs.readFileSync(0, 'utf-8');
  } catch (e) {}
}

if (!input || !input.trim()) {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

function detectProjectTestCommand(rootDir) {
  const frameworkRoot = path.resolve(__dirname, '..', '..');

  // 1. If running within the AAC framework repository itself, run memory-system unit test
  if (path.resolve(rootDir) === frameworkRoot) {
    const memTest = path.join(rootDir, 'tests', 'memory-system.test.mjs');
    if (fs.existsSync(memTest)) return `node --test "${memTest}"`;
  }

  // 2. Check for custom verification command in .scratch/tasks.json
  const tasksPath = path.join(rootDir, '.scratch', 'tasks.json');
  if (fs.existsSync(tasksPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));
      const activeTask = (data.tasks || []).find(t => t.status === 'in_progress' || t.status === 'verifying');
      if (activeTask && activeTask.verificationCmd) {
        return activeTask.verificationCmd;
      }
    } catch {}
  }

  // 3. Standalone memory test fallback (e.g. temporary test directories)
  const standaloneMemTest = path.join(rootDir, 'tests', 'memory-system.test.mjs');
  if (fs.existsSync(standaloneMemTest)) {
    return `node --test "${standaloneMemTest}"`;
  }

  // 4. Node.js / TypeScript workspace
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const testScript = pkg.scripts && pkg.scripts.test;
      if (testScript && !testScript.includes('no test specified')) {
        if (fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))) return 'pnpm test';
        if (fs.existsSync(path.join(rootDir, 'yarn.lock'))) return 'yarn test';
        if (fs.existsSync(path.join(rootDir, 'bun.lockb')) || fs.existsSync(path.join(rootDir, 'bun.lock'))) return 'bun test';
        return 'npm test';
      }
    } catch {}
  }

  // 5. Go workspace
  if (fs.existsSync(path.join(rootDir, 'go.mod'))) {
    return 'go test ./...';
  }

  // 6. Rust workspace
  if (fs.existsSync(path.join(rootDir, 'Cargo.toml'))) {
    return 'cargo test';
  }

  // 7. Python workspace
  if (fs.existsSync(path.join(rootDir, 'pyproject.toml')) || fs.existsSync(path.join(rootDir, 'pytest.ini'))) {
    return 'pytest';
  }

  // 8. Makefile
  const makefilePath = path.join(rootDir, 'Makefile');
  if (fs.existsSync(makefilePath)) {
    try {
      const makeContent = fs.readFileSync(makefilePath, 'utf-8');
      if (/^test\s*:/m.test(makeContent)) {
        return 'make test';
      }
    } catch {}
  }

  return null;
}

try {
  const payload = JSON.parse(input);
  if (payload.terminationReason === 'model_stop') {
    const rootDir = (payload.workspacePaths && payload.workspacePaths[0])
      ? path.resolve(payload.workspacePaths[0])
      : path.resolve(__dirname, '..', '..');

    const testCmd = detectProjectTestCommand(rootDir);
    if (testCmd) {
      try {
        const testEnv = { ...process.env, AAC_QUALITY_GATE_RUNNING: '1' };
        delete testEnv.NODE_TEST_CONTEXT;
        delete testEnv.NODE_TEST_WORKER_ID;
        execSync(testCmd, { cwd: rootDir, stdio: 'pipe', env: testEnv });
      } catch (err) {
        process.stdout.write(JSON.stringify({
          decision: 'continue',
          reason: `Quality Gate Failed: '${testCmd}' failed. Please resolve test regressions before concluding.`
        }));
        process.exit(0);
      }
    }
  }
} catch (e) {
  // Graceful fallback on JSON parse errors
}

process.stdout.write(JSON.stringify({ decision: 'allow' }));
process.exit(0);
