const fs = require('node:fs');
const path = require('node:path');

/**
 * Antigravity Quality Code & Production Integrity Guard
 * Enforces production realism and zero-assumption anti-dummy policy:
 * - Strictly prohibits dummy identifiers, fake tokens, hardcoded stubs, and placeholder TODOs in production code
 * - Permits test fixtures and doubles exclusively in test files (*.test.*, *.spec.*, tests/)
 * Pure Node.js stdlib with zero external dependencies.
 */

const DUMMY_STUB_PATTERNS = [
  { pattern: /['"`]dummy[-_]?id['"`]/i, description: 'Dummy identifier' },
  { pattern: /['"`]fake[-_]?token['"`]/i, description: 'Fake token' },
  { pattern: /\bstatus:\s*['"`]fake['"`]/i, description: 'Fake status property' },
  { pattern: /\/\/\s*TODO:\s*(?:implement|fill in|mock|fix later)\b/i, description: 'Incomplete placeholder TODO stub' },
  { pattern: /\/\*\s*(?:dummy|mock|placeholder)\s*stub\s*\*\//i, description: 'Placeholder comment stub' },
  { pattern: /return\s+['"`]not implemented['"`]/i, description: 'Hardcoded "not implemented" stub return' },
  { pattern: /\braise\s+NotImplementedError\b/, description: 'Python NotImplementedError stub' },
  { pattern: /\b(?:todo!|unimplemented!)\s*\(/, description: 'Rust todo!/unimplemented! macro stub' },
  { pattern: /\bpanic\s*\(\s*['"`](?:not implemented|todo)['"`]\s*\)/i, description: 'Go panic stub' },
  { pattern: /throw\s+new\s+Error\s*\(\s*['"`](?:not implemented|todo|stub|placeholder)['"`]\s*\)/i, description: 'Hardcoded Error stub thrown' },
  { pattern: /['"`]https?:\/\/(?:dummy\.api|mock\.api|placeholder\.com|api\.example\.com\/v[0-9]+\/(?:dummy|fake|mock))['"`]/i, description: 'Placeholder mock API URL' },
  { pattern: /(?:const|let|var)\s+(?:mock|fake|dummy)[A-Za-z0-9_]*\s*=\s*\[/i, description: 'Mock array fixture in production code' },
  { pattern: /(?:const|let|var)\s+(?:mock|fake|dummy)[A-Za-z0-9_]*\s*=\s*\{/i, description: 'Mock object fixture in production code' },
  { pattern: /\b(?:mockDatabase|fakeDatabase|inMemoryDb|dummyDb|mockStore|fakeStore)\b/i, description: 'Simulated in-memory database' },
  { pattern: /\bclass\s+(?:Mock|Fake|Dummy)[A-Za-z0-9_]+/i, description: 'Mock/fake class in production code' },
  { pattern: /\/\/\s*(?:simulate|faking|mocking)\s+(?:database|api|db|network|service)\b/i, description: 'Simulated backend/database comment' },
  { pattern: /\breturn\s*\[\s*\{\s*(?:id|name|title):\s*['"`](?:mock|dummy|sample|fake)[-_]?[0-9]*['"`]/i, description: 'Hardcoded mock collection return' },
  { pattern: /\b(?:apiKey|apiSecret|token|secret)\s*[:=]\s*['"`](?:mock|fake|dummy|test|placeholder)[-_]?[a-zA-Z0-9]*['"`]/i, description: 'Dummy/mock credential in production' }
];

function isTestFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  return (
    normalized.includes('.test.') ||
    normalized.includes('.spec.') ||
    normalized.includes('_test.go') ||
    normalized.includes('/tests/') ||
    normalized.includes('/test/') ||
    normalized.includes('/__mocks__/') ||
    normalized.includes('/fixtures/')
  );
}

function checkContent(content, filePath = '') {
  if (
    isTestFile(filePath) ||
    filePath.endsWith('.md') ||
    filePath.includes('/.scratch/') ||
    filePath.includes('.example') ||
    filePath.endsWith('quality-guard.cjs') ||
    filePath.endsWith('code-analyzer.cjs')
  ) {
    return [];
  }
  const issues = [];
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const stub of DUMMY_STUB_PATTERNS) {
      if (stub.pattern.test(line)) {
        issues.push({
          file: filePath,
          line: idx + 1,
          description: stub.description,
          message: `${stub.description} detected in production file`
        });
      }
    }
  });
  return issues;
}

function checkDirectory(dirPath) {
  const root = path.resolve(dirPath);
  const issues = [];
  const ignoredDirs = new Set(['node_modules', '.git', '.gemini', '.scratch', 'tests', '__mocks__', 'fixtures']);

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (/\.(png|jpg|jpeg|gif|ico|pdf|lock|exe|bin|md)$/i.test(entry.name)) continue;
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const fileIssues = checkContent(content, path.relative(root, fullPath));
          issues.push(...fileIssues);
        } catch {}
      }
    }
  }

  walk(root);
  return issues;
}

module.exports = {
  checkContent,
  checkDirectory,
  isTestFile,
  DUMMY_STUB_PATTERNS
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
      const toolName = payload?.toolCall?.name || '';
      const toolArgs = payload?.toolCall?.args || {};

      if (toolName === 'write_to_file' || toolName === 'replace_file_content') {
        const targetFile = toolArgs.TargetFile || '';
        const content = (toolArgs.CodeContent || '') + '\n' + (toolArgs.ReplacementContent || '');

        if (
          !isTestFile(targetFile) &&
          !targetFile.endsWith('.md') &&
          !targetFile.includes('/.scratch/') &&
          !targetFile.endsWith('quality-guard.cjs') &&
          !targetFile.endsWith('code-analyzer.cjs')
        ) {
          for (const stub of DUMMY_STUB_PATTERNS) {
            if (stub.pattern.test(content)) {
              process.stdout.write(JSON.stringify({
                decision: 'deny',
                reason: `ANTI-DUMMY VIOLATION: ${stub.description} detected in production file '${path.basename(targetFile)}'. You are strictly forbidden from assuming or inventing mock data, simulated in-memory databases, or placeholder stubs. STOP immediately and ask the user for the real schema, credentials, or requirements using 'ask_question'. See: .agents/rules/production-integrity.md`
              }));
              process.exit(0);
            }
          }
        }
      }
    } catch (e) {}

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // CLI execution
  const subcmd = args[0] || 'check';
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  if (subcmd === 'check') {
    const issues = checkDirectory(target);
    console.log(`\n💎 Quality Code & Production Integrity Report for: ${path.resolve(target)}\n`);
    if (issues.length === 0) {
      console.log('✅ 100% Production Realism: No fake tokens, dummy IDs, or incomplete TODOs found in production code.\n');
    } else {
      console.log(`⚠️ Detected ${issues.length} dummy/mock violation(s) in production code:\n`);
      issues.forEach(iss => {
        console.log(` - ❌ ${iss.file}:${iss.line} -> ${iss.description}`);
      });
      console.log('\nRemediation: Wire real types and concrete implementations. Move test fixtures to tests/ folder.\n');
      process.exit(1);
    }
  } else {
    console.log('Usage: node quality-guard.cjs check [dir]');
  }
}
