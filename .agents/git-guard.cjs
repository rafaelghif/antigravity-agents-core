let s = '';
process.stdin.on('data', d => s += d).on('end', () => {
  try {
    const j = JSON.parse(s || '{}');
    const raw = String(j.toolCall?.args?.CommandLine || j.tool_input?.CommandLine || '').trim();
    const isPushMain = /(?:^|[\s;&|])git(?:\.exe)?\s+.*?\bpush\b.*?\b(main|master)\b/i.test(raw);
    process.stdout.write(JSON.stringify(isPushMain
      ? { decision: 'ask', reason: 'Blocked by git-destructive-guard: direct push to main/master branch requires explicit user confirmation.' }
      : { decision: 'allow' }
    ) + '\n');
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'ask', reason: 'Guard fail-closed on unparseable payload.' }) + '\n');
  }
});
