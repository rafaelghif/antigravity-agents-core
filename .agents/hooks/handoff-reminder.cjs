const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

let input = '';
try {
  input = fs.readFileSync(0, 'utf-8');
} catch (e) {
  // Ignore stdin read errors
}

if (!input || !input.trim()) {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

function extractGoalFromTranscript(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return 'Continue ongoing development tasks.';
  try {
    const lines = fs.readFileSync(transcriptPath, 'utf-8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj.type === 'USER_INPUT' && obj.content) {
          let text = obj.content;
          text = text.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/gi, '');
          text = text.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/gi, '$1');
          text = text.trim();
          if (text) {
            return text.slice(0, 300);
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
  return 'Continue ongoing development tasks.';
}

function synthesizeHandoff(rootDir, conversationId, transcriptPath, terminationReason, error) {
  const scratchDir = path.join(rootDir, '.scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
  const handoffFile = path.join(scratchDir, 'handoff.md');

  let branch = 'unknown';
  let commit = 'none';
  let statusLines = [];
  let diffStat = '';

  try {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (_) {}

  try {
    commit = execSync('git log -1 --pretty=format:"%h - %s"', { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (_) {}

  try {
    const gitStatus = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    statusLines = gitStatus.split('\n').map(l => l.trim()).filter(l => l && !l.includes('.scratch/'));
  } catch (_) {}

  try {
    diffStat = execSync('git diff --stat', { cwd: rootDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (_) {}

  const goal = extractGoalFromTranscript(transcriptPath);
  const now = new Date().toISOString();
  const convLink = conversationId ? `conversation://${conversationId}` : 'current-session';

  let terminationNote = 'Session concluded normally.';
  if (terminationReason === 'max_steps_exceeded') {
    terminationNote = '⚠️ **Token limit or maximum step ceiling exceeded.** Task interrupted before conversational wrap-up.';
  } else if (terminationReason === 'error') {
    terminationNote = `⚠️ **Session terminated with error**: ${error || 'Unknown error'}`;
  }

  const modifiedList = statusLines.length > 0
    ? statusLines.map(l => `- \`${l}\``).join('\n')
    : '- Working tree clean (all changes committed)';

  const normalizedRoot = rootDir.replace(/\\/g, '/');
  const rootUri = normalizedRoot.startsWith('/') ? normalizedRoot : `/${normalizedRoot}`;
  const skillsBase = `file://${rootUri}/.agents/skills`;

  const content = `# Automated Session Handoff

**Timestamp**: ${now}  
**Conversation**: [\`${convLink}\`](${convLink})  
**Termination Reason**: ${terminationReason || 'model_stop'}

---

## 1. Session Status
${terminationNote}

## 2. Goal
${goal}

## 3. Current State
- **Git Branch**: \`${branch}\`
- **Latest Commit**: \`${commit}\`
- **Working Tree**: ${statusLines.length > 0 ? 'Dirty (uncommitted changes below)' : 'Clean'}

### Modified Files:
${modifiedList}

${diffStat ? `### Git Diff Stat:\n\`\`\`text\n${diffStat}\n\`\`\`\n` : ''}

## 4. Immediate Next Action
1. Review modified files and check working tree (\`git status ; git diff\`).
2. Run automated test suite to verify baseline integrity (\`npm test\`).
3. Resume the goal stated above.

## 5. Suggested Skills
- [handoff](${skillsBase}/handoff/SKILL.md)
- [diagnosing-bugs](${skillsBase}/diagnosing-bugs/SKILL.md)
- [verify-and-stop](${skillsBase}/verify-and-stop/SKILL.md)
`;

  try {
    fs.writeFileSync(handoffFile, content, 'utf-8');
  } catch (_) {}
}

try {
  const payload = JSON.parse(input);
  const rootDir = (payload.workspacePaths && payload.workspacePaths[0])
    ? path.resolve(payload.workspacePaths[0])
    : path.resolve(__dirname, '..', '..');

  const scratchDir = path.join(rootDir, '.scratch');
  const handoffFile = path.join(scratchDir, 'handoff.md');
  const promptedFile = path.join(scratchDir, '.handoff-prompted');
  const skipFile = path.join(scratchDir, '.no-handoff');

  // 1. Explicit skip marker
  if (fs.existsSync(skipFile)) {
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // 2. Abnormal termination (token limit / max steps / error):
  // Model CANNOT generate a response anymore, so synthesize handoff directly on disk
  if (payload.terminationReason && payload.terminationReason !== 'model_stop') {
    synthesizeHandoff(rootDir, payload.conversationId, payload.transcriptPath, payload.terminationReason, payload.error);
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
    process.exit(0);
  }

  // 3. Normal model_stop termination
  if (payload.terminationReason === 'model_stop') {
    // Loop protection: If already prompted in this turn, allow stop and clear marker
    if (fs.existsSync(promptedFile)) {
      try { fs.unlinkSync(promptedFile); } catch (_) {}
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
    }

    // Check for substantive uncommitted code changes
    let hasChanges = false;
    try {
      const gitStatus = execSync('git status --porcelain', {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      const substantive = gitStatus
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.includes('.scratch/'));

      if (substantive.length > 0) {
        hasChanges = true;
      }
    } catch (_) {
      hasChanges = false;
    }

    // If changes exist, ensure a handoff is preserved
    if (hasChanges) {
      let isFresh = false;
      if (fs.existsSync(handoffFile)) {
        try {
          const stats = fs.statSync(handoffFile);
          const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
          if (ageMinutes < 15) {
            isFresh = true;
          }
        } catch (_) {}
      }

      if (!isFresh) {
        // Auto-synthesize fallback handoff immediately so state is preserved on disk regardless of what happens next
        synthesizeHandoff(rootDir, payload.conversationId, payload.transcriptPath, payload.terminationReason, payload.error);

        try {
          if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
          fs.writeFileSync(promptedFile, new Date().toISOString(), 'utf-8');
        } catch (_) {}

        process.stdout.write(JSON.stringify({
          decision: 'continue',
          reason: 'Session Continuity Guard: Uncommitted code modifications detected. A fallback handoff was automatically saved to .scratch/handoff.md. Please review or polish .scratch/handoff.md before exiting, or proceed.'
        }));
        process.exit(0);
      }
    }
  }
} catch (e) {
  // Fallback to allow on parse error
}

process.stdout.write(JSON.stringify({ decision: 'allow' }));
process.exit(0);
