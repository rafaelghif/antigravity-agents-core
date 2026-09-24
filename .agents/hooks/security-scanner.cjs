const fs = require('node:fs');
const path = require('node:path');

/**
 * Antigravity Security & Secret Scanner
 * Inspects tool calls (PreToolUse) and scans source code files to prevent:
 * 1. Destructive git and shell commands
 * 2. Accidental exposure or write of API tokens, private keys, and secrets
 * Pure Node.js stdlib with zero external dependencies.
 */

const DANGEROUS_COMMAND_PATTERNS = [
  { pattern: /\bgit\s+push\s+.*--force\b/i, reason: 'Force push to remote repository is prohibited.' },
  { pattern: /\bgit\s+push\b/i, reason: 'Direct git push from agent session is guarded.' },
  { pattern: /\bgit\s+reset\s+--hard\b/i, reason: 'Destructive git reset --hard destroys uncommitted working tree.' },
  { pattern: /\bgit\s+clean\s+(-[a-zA-Z]*f[a-zA-Z]*)\b/i, reason: 'Destructive git clean -f removes untracked files.' },
  { pattern: /\bgit\s+branch\s+-D\b/i, reason: 'Forced git branch deletion is prohibited.' },
  { pattern: /\bgit\s+checkout\s+\./i, reason: 'git checkout . discards working tree changes.' },
  { pattern: /\bgit\s+restore\s+\./i, reason: 'git restore . discards all uncommitted modifications.' },
  { pattern: /\brm\s+-rf\s+(\/|~|\$HOME)\b/i, reason: 'Catastrophic filesystem deletion command.' },
  { pattern: /\brmdir\s+\/s\s+(\/q\s+)?[cC]:\\/i, reason: 'Catastrophic Windows disk wipe command.' },
  { pattern: /\bchmod\s+-R\s+777\s+\//i, reason: 'Insecure global root permission modification.' },
  { pattern: /\bdd\s+if=\/dev\/(?:zero|urandom)\s+of=\/dev\/[sh]d[a-z]/i, reason: 'Raw disk overwrite command.' },
  { pattern: /\bDROP\s+(?:DATABASE|SCHEMA)\s+[a-zA-Z0-9_]+/i, reason: 'Destructive raw database drop command.' }
];

const SECRET_PATTERNS = [
  { pattern: /ghp_[a-zA-Z0-9]{36}/, type: 'GitHub Personal Access Token' },
  { pattern: /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/, type: 'GitHub Fine-grained PAT' },
  { pattern: /gh[ousr]_[a-zA-Z0-9]{36}/, type: 'GitHub App / OAuth Token' },
  { pattern: /glpat-[a-zA-Z0-9\-=_]{20,}/, type: 'GitLab Personal Access Token' },
  { pattern: /(?:AKIA|ASIA)[0-9A-Z]{16}/, type: 'AWS Access Key ID' },
  { pattern: /sk-[a-zA-Z0-9]{20,}/, type: 'API Secret Key (OpenAI / Generic)' },
  { pattern: /sk-ant-[a-zA-Z0-9_\-]{40,}/, type: 'Anthropic API Key' },
  { pattern: /(?:sk|rk)_live_[0-9a-zA-Z]{24,}/, type: 'Stripe Live Secret/Restricted Key' },
  { pattern: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/, type: 'Slack Token' },
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, type: 'Private Encryption Key' },
  { pattern: /(?:postgres|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@[a-zA-Z0-9\.\-_]+/, type: 'Database URI with Password' },
  { pattern: /\b(bearer\s+[a-zA-Z0-9_\-\.]{30,})\b/i, type: 'Raw Bearer Token' }
];

function scanContent(content, filePath = '') {
  const issues = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    for (const secret of SECRET_PATTERNS) {
      if (secret.pattern.test(line)) {
        issues.push({
          file: filePath,
          line: idx + 1,
          type: secret.type,
          message: `Secret detected (${secret.type})`
        });
      }
    }
  });

  return issues;
}

function scanDirectory(dirPath, options = {}) {
  const root = path.resolve(dirPath);
  const issues = [];
  const ignoredDirs = new Set(['node_modules', '.git', '.gemini', '.scratch', 'dist', 'build', ...(options.ignoredDirs || [])]);
  const includeTests = options.includeTests === true;
  const includeEnv = options.includeEnv === true;

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      const relPath = path.relative(root, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          if (!includeTests && /^(?:tests?|__tests__|fixtures)$/i.test(entry.name)) {
            continue;
          }
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Skip binary and lock files
        if (/\.(png|jpg|jpeg|gif|ico|pdf|lock|exe|bin|woff|woff2|ttf|eot)$/i.test(entry.name)) continue;
        // Skip .env files unless explicitly included
        if (!includeEnv && /^\.env(?:\..+)?$/i.test(entry.name)) continue;
        // Skip test files unless explicitly included
        if (!includeTests && /\.(test|spec)\.[a-zA-Z0-9]+$/i.test(entry.name)) continue;

        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const fileIssues = scanContent(content, relPath);
          issues.push(...fileIssues);
        } catch {}
      }
    }
  }

  walk(root);
  return issues;
}

module.exports = {
  scanContent,
  scanDirectory,
  SECRET_PATTERNS,
  DANGEROUS_COMMAND_PATTERNS
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

      // 1. Inspect run_command
      if (toolName === 'run_command') {
        const command = toolArgs.CommandLine || '';

        // Check dangerous commands
        for (const entry of DANGEROUS_COMMAND_PATTERNS) {
          if (entry.pattern.test(command)) {
            process.stdout.write(JSON.stringify({
              decision: 'deny',
              reason: `SECURITY GUARD: Blocked command matching '${entry.pattern.source}'. ${entry.reason}`
            }));
            process.exit(0);
          }
        }

        // Check secrets in command line
        for (const secret of SECRET_PATTERNS) {
          if (secret.pattern.test(command)) {
            process.stdout.write(JSON.stringify({
              decision: 'deny',
              reason: `SECURITY GUARD: Leaked secret detected in CommandLine (${secret.type}). Redact credentials before executing.`
            }));
            process.exit(0);
          }
        }
      }

      // 2. Inspect write_to_file and replace_file_content
      if (toolName === 'write_to_file' || toolName === 'replace_file_content') {
        const targetFile = (toolArgs.TargetFile || '').replace(/\\/g, '/');
        const content = (toolArgs.CodeContent || '') + '\n' + (toolArgs.ReplacementContent || '');

        // Block writing into sensitive system paths
        if (/^\/etc\/|^\/root\/|^C:\/Windows\//i.test(targetFile)) {
          process.stdout.write(JSON.stringify({
            decision: 'deny',
            reason: `SECURITY GUARD: Modifying protected system path '${targetFile}' is strictly prohibited.`
          }));
          process.exit(0);
        }

        // Block hardcoded secrets in non-test files
        const isTestFile = /\.(test|spec)\.[a-zA-Z0-9]+$/i.test(targetFile) || /(?:^|\/)(?:tests?|__tests__|fixtures)\//i.test(targetFile);
        if (!isTestFile) {
          for (const secret of SECRET_PATTERNS) {
            if (secret.pattern.test(content)) {
              process.stdout.write(JSON.stringify({
                decision: 'deny',
                reason: `SECURITY GUARD: Hardcoded secret detected in payload (${secret.type}). Use environment variables (.env / mcp_config.json) instead.`
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
  const subcmd = args[0] || 'scan';
  const target = args[1] && !args[1].startsWith('-') ? args[1] : process.cwd();

  if (subcmd === 'scan') {
    const issues = scanDirectory(target);
    console.log(`\n🛡️ Security & Secret Scanner Report for: ${path.resolve(target)}\n`);
    if (issues.length === 0) {
      console.log('✅ No exposed secrets or credentials detected in workspace files.\n');
    } else {
      console.log(`⚠️ Detected ${issues.length} potential secret(s):\n`);
      issues.forEach(iss => {
        console.log(` - ❌ [${iss.type}] ${iss.file}:${iss.line}`);
      });
      console.log('\nRemediation: Remove secrets and store in environment variables or .agents/mcp_config.json.\n');
      process.exit(1);
    }
  } else {
    console.log('Usage: node security-scanner.cjs scan [dir]');
  }
}
