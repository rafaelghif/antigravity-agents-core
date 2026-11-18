let s = '';
process.stdin.on('data', d => s += d).on('end', () => {
  try {
    const j = JSON.parse(s || '{}');
    const raw = String(j.toolCall?.args?.CommandLine || j.tool_input?.CommandLine || '').trim();
    const mode = String(process.env.AAC_GIT_GUARD_MODE || 'strict').trim().toLowerCase();
    const segments = raw.split(/[;\n|&]+/).map((seg) => seg.trim()).filter(Boolean);

    let reason = '';
    for (const seg of segments) {
      if (!/(?:^|\s)git(?:\.exe)?(?:\s|$)/i.test(seg)) continue;

      const isPush = /\bpush\b/i.test(seg);
      const isProtectedPush = isPush && /\b(?:refs\/heads\/)?(?:main|master|production|staging|release\/[^\s]+)\b/i.test(seg);
      if (isProtectedPush) {
        reason = 'Blocked by git-destructive-guard: direct push to protected branch (main/master/release/*/production/staging) requires explicit user confirmation.';
        break;
      }

      if (mode === 'legacy') continue;

      if (/\breset\b[^\n]*--hard\b/i.test(seg)) {
        reason = 'Blocked by git-destructive-guard (strict mode): git reset --hard discards uncommitted work and requires confirmation.';
        break;
      }
      const isClean = /\bclean\b/i.test(seg);
      const hasCombinedCleanFlags = /\s-(?:[a-z]*f[a-z]*d|[a-z]*d[a-z]*f)[a-z]*(?=\s|$)/i.test(seg);
      const hasSeparateCleanFlags = (/(?:^|\s)(?:-[a-z]*f[a-z]*|--force)(?=\s|$)/i.test(seg)) && (/(?:^|\s)-[a-z]*d[a-z]*(?=\s|$)/i.test(seg));
      if (isClean && (hasCombinedCleanFlags || hasSeparateCleanFlags)) {
        reason = 'Blocked by git-destructive-guard (strict mode): git clean -fd/-fdx deletes untracked files and requires confirmation.';
        break;
      }
      if (isPush && /(?:^|\s)(?:--force|-f)(?=\s|$)/.test(seg)) {
        reason = 'Blocked by git-destructive-guard (strict mode): raw --force/-f push requires confirmation (prefer --force-with-lease on feature branches).';
        break;
      }
    }

    process.stdout.write(JSON.stringify(reason ? { decision: 'ask', reason } : { decision: 'allow' }) + '\n');
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'ask', reason: 'Guard fail-closed on unparseable payload.' }) + '\n');
  }
});
