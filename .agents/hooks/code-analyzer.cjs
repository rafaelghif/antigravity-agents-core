const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

/**
 * Antigravity Techstack-Aware Code Reviewer & Complexity Analyzer
 * Features:
 * 1. Automatic Workspace Techstack & Architectural Topology Discovery
 * 2. Multi-language AST/Token Branch Complexity (JS/TS, Go, Python, Rust)
 * 3. Deep Module Ratio (Interface Surface vs Internal Implementation Depth)
 * 4. Multi-Axis Reviewer (Standards, Security, Ponytail Simplicity)
 * Pure Node.js stdlib with zero external dependencies.
 */

const SECRET_PATTERNS = [
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
  { pattern: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/, name: 'GitHub Fine-grained PAT' },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key ID' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'API Secret Key' },
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, name: 'Private Encryption Key' }
];

const DUMMY_STUB_PATTERNS = [
  { pattern: /['"`]dummy[-_]?id['"`]/i, name: 'Dummy identifier' },
  { pattern: /['"`]fake[-_]?token['"`]/i, name: 'Fake token' },
  { pattern: /\bstatus:\s*['"`]fake['"`]/i, name: 'Fake status property' },
  { pattern: /\/\/\s*TODO:\s*(?:implement|fill in|mock|fix later)\b/i, name: 'Incomplete placeholder TODO stub' },
  { pattern: /return\s+['"`]not implemented['"`]/i, name: 'Hardcoded "not implemented" stub return' },
  { pattern: /\braise\s+NotImplementedError\b/, name: 'Python NotImplementedError stub' },
  { pattern: /\b(?:todo!|unimplemented!)\s*\(/, name: 'Rust todo!/unimplemented! macro stub' },
  { pattern: /\bpanic\s*\(\s*['"`](?:not implemented|todo)['"`]\s*\)/i, name: 'Go panic stub' }
];

function isTestPath(filePath) {
  const norm = filePath.replace(/\\/g, '/').toLowerCase();
  return (
    norm.includes('.test.') ||
    norm.includes('.spec.') ||
    norm.includes('_test.go') ||
    norm.includes('/tests/') ||
    norm.includes('/test/') ||
    norm.includes('/__mocks__/') ||
    norm.includes('/fixtures/')
  );
}

/**
 * Discovers the project's actual tech stack, package manager, frameworks, and architecture.
 */
function detectTechStack(workspaceDir = process.cwd()) {
  const root = path.resolve(workspaceDir);
  const info = {
    root,
    languages: [],
    packageManager: 'unknown',
    frameworks: [],
    testRunners: [],
    architecture: 'Standard Application',
    entrypoints: [],
    manifests: []
  };

  // 1. Inspect package manifests
  const pkgPath = path.join(root, 'package.json');
  const goModPath = path.join(root, 'go.mod');
  const cargoPath = path.join(root, 'Cargo.toml');
  const pyprojectPath = path.join(root, 'pyproject.toml');
  const reqsPath = path.join(root, 'requirements.txt');
  const pomPath = path.join(root, 'pom.xml');
  const composerPath = path.join(root, 'composer.json');

  if (fs.existsSync(pkgPath)) {
    info.manifests.push('package.json');
    info.languages.push('JavaScript');
    if (fs.existsSync(path.join(root, 'tsconfig.json'))) {
      info.languages.push('TypeScript');
    }
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) info.packageManager = 'pnpm';
      else if (fs.existsSync(path.join(root, 'yarn.lock'))) info.packageManager = 'yarn';
      else if (fs.existsSync(path.join(root, 'bun.lockb')) || fs.existsSync(path.join(root, 'bun.lock'))) info.packageManager = 'bun';
      else info.packageManager = 'npm';

      if (allDeps['next']) info.frameworks.push('Next.js');
      if (allDeps['react']) info.frameworks.push('React');
      if (allDeps['express']) info.frameworks.push('Express');
      if (allDeps['fastify']) info.frameworks.push('Fastify');
      if (allDeps['@nestjs/core']) info.frameworks.push('NestJS');
      if (allDeps['vue']) info.frameworks.push('Vue');

      if (allDeps['jest']) info.testRunners.push('Jest');
      if (allDeps['vitest']) info.testRunners.push('Vitest');
      if (allDeps['mocha']) info.testRunners.push('Mocha');
      if (pkg.scripts && Object.values(pkg.scripts).some(s => s.includes('node --test'))) {
        info.testRunners.push('Node Test Runner (node:test)');
      }

      if (pkg.main) info.entrypoints.push(pkg.main);
      if (pkg.bin) {
        if (typeof pkg.bin === 'string') info.entrypoints.push(pkg.bin);
        else Object.values(pkg.bin).forEach(b => info.entrypoints.push(b));
      }
    } catch {}
  }

  if (fs.existsSync(goModPath)) {
    info.manifests.push('go.mod');
    info.languages.push('Go');
    info.packageManager = 'go modules';
    info.testRunners.push('go test');
  }

  if (fs.existsSync(cargoPath)) {
    info.manifests.push('Cargo.toml');
    info.languages.push('Rust');
    info.packageManager = 'cargo';
    info.testRunners.push('cargo test');
  }

  if (fs.existsSync(pyprojectPath) || fs.existsSync(reqsPath)) {
    info.manifests.push(fs.existsSync(pyprojectPath) ? 'pyproject.toml' : 'requirements.txt');
    info.languages.push('Python');
    info.packageManager = fs.existsSync(path.join(root, 'poetry.lock')) ? 'poetry' : 'pip';
    info.testRunners.push('pytest / unittest');
  }

  if (fs.existsSync(pomPath)) {
    info.manifests.push('pom.xml');
    info.languages.push('Java');
    info.packageManager = 'maven';
    info.testRunners.push('JUnit');
  }

  if (fs.existsSync(composerPath)) {
    info.manifests.push('composer.json');
    info.languages.push('PHP');
    info.packageManager = 'composer';
    info.testRunners.push('PHPUnit');
  }

  // 2. Discover standard entrypoints
  const candidateEntries = [
    'src/index.ts', 'src/main.ts', 'src/index.js', 'src/main.js',
    'bin/cli.mjs', 'main.go', 'cmd/main.go', 'src/main.rs', 'app/main.py', 'main.py'
  ];
  candidateEntries.forEach(entry => {
    if (fs.existsSync(path.join(root, entry)) && !info.entrypoints.includes(entry)) {
      info.entrypoints.push(entry);
    }
  });

  // 3. Classify Architectural Topology
  try {
    const rootDirs = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
    if (rootDirs.includes('domain') || (rootDirs.includes('core') && (rootDirs.includes('infrastructure') || rootDirs.includes('adapters')))) {
      info.architecture = 'Hexagonal / Clean Architecture (Domain, Ports & Adapters)';
    } else if (rootDirs.includes('controllers') && (rootDirs.includes('models') || rootDirs.includes('views'))) {
      info.architecture = 'MVC (Model-View-Controller)';
    } else if (rootDirs.includes('internal') || rootDirs.includes('pkg') || rootDirs.includes('packages') || rootDirs.includes('modules')) {
      info.architecture = 'Modular Seam Architecture (Deep Sub-packages)';
    } else if (rootDirs.includes('src') && rootDirs.includes('.agents')) {
      info.architecture = 'Antigravity Autonomous Agentic Workspace';
    } else if (rootDirs.includes('src')) {
      info.architecture = 'Layered Application (src/)';
    }
  } catch {}

  return info;
}

/**
 * Analyzes a single file's complexity, LOC, and deep module ratio.
 */
function analyzeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const totalLines = lines.length;
  const ext = path.extname(filePath).toLowerCase();

  let codeLines = 0;
  let commentLines = 0;
  let blankLines = 0;
  let decisionPoints = 0;
  let exportCount = 0;

  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      blankLines++;
      continue;
    }

    if (inBlockComment) {
      commentLines++;
      if (trimmed.includes('*/') || (ext === '.py' && (trimmed.endsWith('"""') || trimmed.endsWith("'''")))) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*') || (ext === '.py' && (trimmed.startsWith('"""') || trimmed.startsWith("'''")) && !trimmed.slice(3).includes('"""'))) {
      commentLines++;
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      commentLines++;
      continue;
    }

    codeLines++;

    // Language-aware cyclomatic decision points
    let branchMatches = null;
    if (ext === '.py') {
      branchMatches = line.match(/\b(if|elif|for|while|except)\b|\band\b|\bor\b/g);
    } else if (ext === '.go') {
      branchMatches = line.match(/\b(if|else|for|case|select)\b|&&|\|\|/g);
    } else if (ext === '.rs') {
      branchMatches = line.match(/\b(if|else|for|while|match)\b|&&|\|\||\?/g);
    } else {
      branchMatches = line.match(/\b(if|else\s+if|for|while|case|catch)\b|&&|\|\||\?/g);
    }

    if (branchMatches) {
      decisionPoints += branchMatches.length;
    }

    // Language-aware export interface surface
    if (ext === '.go') {
      if (/^\s*(?:func\s+\([^\)]+\)\s+[A-Z]|func\s+[A-Z]|type\s+[A-Z]|const\s+[A-Z]|var\s+[A-Z])/.test(line)) {
        exportCount++;
      }
    } else if (ext === '.rs') {
      if (/^\s*pub\s+(?:fn|struct|enum|trait|type|const|static)\b/.test(line)) {
        exportCount++;
      }
    } else if (ext === '.py') {
      if (/^\s*(?:def\s+[a-zA-Z0-9][a-zA-Z0-9_]*|class\s+[a-zA-Z0-9][a-zA-Z0-9_]*)/.test(line) && !/^\s*(?:def|class)\s+_/.test(line)) {
        exportCount++;
      }
    } else {
      if (/\b(export\s+(?:default\s+|const\s+|function\s+|class\s+|let\s+|var\s+)|module\.exports\b|exports\.)/.test(line)) {
        exportCount++;
      }
    }
  }

  const cyclomaticComplexity = 1 + decisionPoints;
  const deepModuleRatio = exportCount > 0 ? Number((codeLines / exportCount).toFixed(1)) : codeLines;

  let moduleDepth = 'Internal / Standalone';
  if (exportCount > 0) {
    if (deepModuleRatio >= 25) moduleDepth = 'Deep (Solid abstraction)';
    else if (deepModuleRatio >= 10) moduleDepth = 'Balanced';
    else moduleDepth = 'Shallow (Thin wrapper)';
  }

  return {
    filePath,
    fileName: path.basename(filePath),
    totalLines,
    codeLines,
    commentLines,
    blankLines,
    cyclomaticComplexity,
    exportCount,
    deepModuleRatio,
    moduleDepth
  };
}

/**
 * Recursively scans directory for source files and aggregates metrics.
 */
function analyzeDirectory(dirPath, options = {}) {
  const root = path.resolve(dirPath);
  const extensions = options.extensions || ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.py', '.go', '.rs', '.java', '.php', '.sh'];
  const results = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.scratch' || entry.name === '.gemini' || entry.name === 'target' || entry.name === 'vendor') {
          continue;
        }
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const res = analyzeFile(full);
          if (res) results.push(res);
        }
      }
    }
  }

  walk(root);

  const totalFiles = results.length;
  const totalLOC = results.reduce((sum, r) => sum + r.codeLines, 0);
  const avgComplexity = totalFiles > 0 ? Number((results.reduce((sum, r) => sum + r.cyclomaticComplexity, 0) / totalFiles).toFixed(1)) : 0;
  const deepModules = results.filter(r => r.moduleDepth.startsWith('Deep')).length;
  const shallowModules = results.filter(r => r.moduleDepth.startsWith('Shallow')).length;

  return {
    directory: root,
    techStack: detectTechStack(root),
    totalFiles,
    totalLOC,
    avgComplexity,
    deepModules,
    shallowModules,
    files: results.sort((a, b) => b.cyclomaticComplexity - a.cyclomaticComplexity)
  };
}

/**
 * Reviews git diff against Standards, Security, and Ponytail simplicity.
 */
function reviewDiff(diffText, workspaceDir = process.cwd()) {
  const findings = [];
  const lines = diffText.split(/\r?\n/);
  const techStack = detectTechStack(workspaceDir);

  let currentFile = '';
  let lineNumber = 0;

  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6).trim();
      lineNumber = 0;
      continue;
    }

    if (line.startsWith('@@')) {
      const match = line.match(/\+([0-9]+)/);
      if (match) lineNumber = parseInt(match[1], 10);
      continue;
    }

    if (line.startsWith('+') && !line.startsWith('+++')) {
      lineNumber++;
      const addedContent = line.slice(1);
      const isTest = isTestPath(currentFile);

      // Skip rule files themselves
      if (currentFile.endsWith('code-analyzer.cjs') || currentFile.endsWith('quality-guard.cjs')) {
        continue;
      }

      // 1. Security Axis (Enforced on production code; test fixtures isolated to test files)
      if (!isTest) {
        for (const secret of SECRET_PATTERNS) {
          if (secret.pattern.test(addedContent)) {
            findings.push({
              axis: 'Security',
              severity: 'error',
              file: currentFile,
              line: lineNumber,
              message: `Secret token pattern detected (${secret.name}).`,
              suggestion: 'Store credentials in environment variables or .agents/mcp_config.json'
            });
          }
        }
      }

      if (/\beval\s*\(/i.test(addedContent)) {
        findings.push({
          axis: 'Security',
          severity: 'warning',
          file: currentFile,
          line: lineNumber,
          message: 'Potentially dangerous use of eval().',
          suggestion: 'Refactor to safe static parsing or explicit data dispatch.'
        });
      }

      // 2. Standards Axis (Language & Framework Aware)
      if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(addedContent)) {
        findings.push({
          axis: 'Standards',
          severity: 'warning',
          file: currentFile,
          line: lineNumber,
          message: 'Empty catch block silently swallowing error.',
          suggestion: 'Handle error explicitly or log transparently. Never swallow exceptions.'
        });
      }

      if (currentFile.endsWith('.py') && /^\s*except\s*:/.test(addedContent)) {
        findings.push({
          axis: 'Standards',
          severity: 'warning',
          file: currentFile,
          line: lineNumber,
          message: 'Bare except clause catches SystemExit and KeyboardInterrupt.',
          suggestion: 'Catch specific Exception subclasses (e.g., except Exception:).'
        });
      }

      if (!isTest && currentFile.endsWith('.rs') && /\.unwrap\(\)/.test(addedContent)) {
        findings.push({
          axis: 'Standards',
          severity: 'warning',
          file: currentFile,
          line: lineNumber,
          message: 'Direct .unwrap() in production Rust code can trigger unhandled panic.',
          suggestion: 'Propagate with ? operator or handle via match/unwrap_or.'
        });
      }

      if (!isTest && /\bconsole\.log\s*\(/.test(addedContent) && !currentFile.includes('bin/') && !currentFile.includes('cli.')) {
        findings.push({
          axis: 'Standards',
          severity: 'info',
          file: currentFile,
          line: lineNumber,
          message: 'console.log() introduced in non-CLI production module.',
          suggestion: 'Remove temporary debug logging or use dedicated logger.'
        });
      }

      // 3. Architecture & Seam Integrity Axis
      if (!isTest && /(?:^|\/)(?:domain|core|entities|usecases)\//i.test(currentFile)) {
        if (/(?:from|require\s*\()\s*['"](?:express|fastify|koa|axios|pg|mysql|mysql2|sqlite3|typeorm|prisma|mongoose|redis|ioredis)['"]/i.test(addedContent)) {
          findings.push({
            axis: 'Architecture',
            severity: 'error',
            file: currentFile,
            line: lineNumber,
            message: 'Hexagonal/Clean Architecture violation: Domain core must remain pure and cannot import infrastructure or database drivers.',
            suggestion: 'Define a port interface in domain and implement it inside an infrastructure adapter.'
          });
        }
      }

      // 4. Logic & Numerical Safety Axis
      if (!isTest && /\b(?:netPrice|totalPrice|unitPrice|accountBalance|transactionAmount)\s*[:=]\s*[0-9]+\.[0-9]+/i.test(addedContent)) {
        findings.push({
          axis: 'Logic',
          severity: 'warning',
          file: currentFile,
          line: lineNumber,
          message: 'Floating-point literal assigned to currency/money identifier.',
          suggestion: 'Use integer minor units (e.g. cents) or decimal library to prevent IEEE-754 precision errors.'
        });
      }

      // 5. Ponytail & Production Realism Axis
      if (!isTest) {
        for (const stub of DUMMY_STUB_PATTERNS) {
          if (stub.pattern.test(addedContent)) {
            findings.push({
              axis: 'Ponytail / Realism',
              severity: 'error',
              file: currentFile,
              line: lineNumber,
              message: `Dummy stub detected (${stub.name}).`,
              suggestion: 'Wire authentic implementation. Strictly avoid mock/dummy stubs in production.'
            });
          }
        }
      }
    }
  }

  return {
    techStack,
    totalFindings: findings.length,
    errors: findings.filter(f => f.severity === 'error').length,
    warnings: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
    findings
  };
}

function getGitDiff(workspaceDir = process.cwd(), stagedOnly = false) {
  try {
    const flag = stagedOnly ? '--staged' : 'HEAD';
    return execSync(`git diff ${flag}`, { cwd: workspaceDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (e) {
    try {
      return execSync('git diff', { cwd: workspaceDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    } catch {
      return '';
    }
  }
}

function formatReviewReport(review) {
  const ts = review.techStack;
  let out = `🔬 Code Review Summary (${review.totalFindings} findings: ${review.errors} errors, ${review.warnings} warnings, ${review.info} info)\n`;
  if (ts) {
    out += `   Ecosystem:    ${ts.languages.join(', ') || 'General'} (${ts.packageManager})\n`;
    out += `   Architecture: ${ts.architecture}\n\n`;
  }

  if (review.findings.length === 0) {
    return out + '✅ No standards violations, secrets, or dummy stubs detected in diff.\n';
  }

  for (const f of review.findings) {
    const badge = f.severity === 'error' ? '❌' : (f.severity === 'warning' ? '⚠️' : 'ℹ️');
    out += `${badge} [${f.axis}] ${f.file}:${f.line}\n`;
    out += `   Problem: ${f.message}\n`;
    out += `   Fix:     ${f.suggestion}\n\n`;
  }
  return out;
}

module.exports = {
  detectTechStack,
  analyzeFile,
  analyzeDirectory,
  reviewDiff,
  getGitDiff,
  formatReviewReport
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
        : process.cwd();

      if (payload.terminationReason === 'model_stop') {
        const diff = getGitDiff(rootDir);
        if (diff) {
          const review = reviewDiff(diff, rootDir);
          if (review.errors > 0) {
            process.stdout.write(JSON.stringify({
              decision: 'continue',
              reason: `Code Review Gate Failed: ${review.errors} error(s) found in diff (${review.findings.map(f => f.message).join('; ')})`
            }));
            process.exit(0);
          }
        }
      }
    } catch (e) {}
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  const subcmd = args[0] || 'review';
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  if (subcmd === 'analyze') {
    const stat = fs.statSync(path.resolve(target));
    if (stat.isDirectory()) {
      const summary = analyzeDirectory(target);
      const ts = summary.techStack;
      console.log(`\n📊 Codebase Metrics for: ${summary.directory}`);
      console.log(`   Ecosystem:            ${ts.languages.join(', ') || 'General'} (${ts.packageManager})`);
      console.log(`   Frameworks:           ${ts.frameworks.join(', ') || 'None detected'}`);
      console.log(`   Architecture:         ${ts.architecture}`);
      console.log(`   Files Scanned:        ${summary.totalFiles}`);
      console.log(`   Total Code Lines:     ${summary.totalLOC}`);
      console.log(`   Avg Complexity:       ${summary.avgComplexity}`);
      console.log(`   Deep Modules (>=25):  ${summary.deepModules}`);
      console.log(`   Shallow Modules (<10): ${summary.shallowModules}\n`);
      console.log('Top complex files:');
      summary.files.slice(0, 10).forEach((f, idx) => {
        console.log(`   ${idx + 1}. ${f.fileName.padEnd(25)} LOC: ${String(f.codeLines).padStart(5)} | Complexity: ${String(f.cyclomaticComplexity).padStart(3)} | Ratio: ${String(f.deepModuleRatio).padStart(4)} (${f.moduleDepth})`);
      });
    } else {
      const f = analyzeFile(path.resolve(target));
      console.log(JSON.stringify(f, null, 2));
    }
  } else if (subcmd === 'review') {
    const diff = getGitDiff(target);
    const review = reviewDiff(diff, target);
    console.log(formatReviewReport(review));
  } else {
    console.log('Usage: node code-analyzer.cjs [review|analyze] [path]');
  }
}
