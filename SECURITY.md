# Security Policy & Threat Model

## Supported Versions

| Version | Supported |
| :--- | :--- |
| `6.0.x` | ✅ Yes |
| `< 6.0` | ❌ No |

## Reporting a Vulnerability

Report security issues privately to `business.rafaelghifari@gmail.com`. Do not open public issues for unpatched vulnerabilities.

## Trust Boundaries & Runtime Controls

1. **Non-Destructive Installer (`bin/cli.mjs`, `install.sh`, `install.ps1`)**:
   - `install.sh` and `install.ps1` only resolve `bin/cli.mjs` and delegate every write to it. There is exactly one managed-write path, so no installer copy can bypass backups, hashing, or `.aac-new` staging.
   - Both require Node.js >= 22 and fail fast otherwise: the CLI and the lifecycle hooks are Node programs, so a "no-Node" install would ship a package whose guards cannot run.
   - Downloads are pinned to the `v6.0.1` ref (`AAC_REF` overrides). A failed download errors out with an actionable message instead of silently falling back to a mutable branch. The recommended invocation downloads the script for inspection first; the piped one-liner is documented as a convenience, not as a safe default.
   - Tracks SHA-256 hashes of managed files in `.agents/.aac-manifest.json`.
   - Never overwrites user-modified `AGENTS.md`, rules, skills, or `CONTEXT.md` on `upgrade` unless `--force` is explicitly passed; backs up existing files to `.scratch/backups/<timestamp>/` and writes incoming updates to `<file>.aac-new`.
   - `uninstall` deletes only AAC-managed manifest entries (`AGENTS.md` or `.agents/{rules,skills,agents,sidecars}/...`), rejects `..` segments, and requires containment inside the target directory. Crafted or corrupted manifest entries are skipped with a warning instead of deleting arbitrary files.
2. **Cross-Platform Lifecycle Hooks (`.agents/hooks.json`)**:
   - Executes inline Node JSON parsers (`node -e`) for cross-platform compatibility on Linux, macOS, and Windows, with a 5-second timeout.
   - Malformed hook payloads return `decision: "ask"` (fail-closed), so a schema change surfaces as a prompt instead of silently disabling the guard.
   - `lifecycle-session-bootstrap` resolves `.scratch/handoff.md`, `docs/sprint/SPRINT.md`, and `CONTEXT.md` from the documented `workspacePaths` stdin field, never from the hook working directory. It also injects a clinical-prose directive when `AAC_PERSONA=neutral` is present in the host environment.
   - `git-destructive-guard` intercepts direct pushes to protected `main` or `master` branches (`git push origin main`, `git push --force`) with `decision: "ask"`, preventing accidental overwrites while allowing normal local development operations (`checkout`, `commit`, `stash`, feature branch pushes) without friction.
   - `production-no-mock-guard` covers every file-write tool with its real argument name (`CodeContent`, `ReplacementContent`, `ReplacementChunks`). In production files, it intercepts fake stores (`mock*`, `fake*`, `dummy*`, `stub*`), `jest.mock`/`vi.mock`, dummy tokens, and deferred `TODO: implement` stubs with `decision: "ask"`. In test files, it acts as an Anti-Test-Tampering guard, intercepting test-skipping primitives (`.skip(`, `xit(`, `xdescribe(`, `@pytest.mark.skip`, `t.Skip()`) and tautological assertions (`expect(true).toBe(true)`, `assert.ok(true)`) with `decision: "ask"`.
   - `quality-gate-stop-sensor` intercepts session termination (`Stop` event on `terminationReason === 'model_stop'`). If the workspace git working tree has uncommitted modifications, it first audits the git diff (including staged, unstaged, and newly created test files) for test-tampering or test-skipping patterns (`.skip`, `xit`, tautological assertions); if tampering is detected, it rejects termination (`decision: "continue"`). It then dynamically detects and executes the project's verification suite (`npm test`, `cargo test`, `pytest`, `go test ./...`); if tests fail, it rejects premature completion (`decision: "continue"`), preventing the agent from stopping while code is broken, unverified, or synthetically passed via test tampering.
   - The mock guard's exemptions are test code (`*.test.*`, `*.spec.*`, `test_*.py`, `tests/`, `__tests__/`, `fixtures/`, `mocks/`) plus `*.md`, `hooks.json`, and `package.json`. Markdown and config files are exempt because documentation and the hook definitions themselves contain the words the detector matches; they are not executable production modules.
3. **MCP Configuration (`.agents/mcp_config.example.json`)**:
   - `init`/`upgrade` install the template pair (`.agents/mcp_config.example.json`, `.agents/mcp.env.example`) as manifest-tracked files; copy the example to `.agents/mcp_config.json`, which stays gitignored.
   - Credentials live in `env` or a gitignored `--env-file`, never in `args` or committed `headers`.
   - GitHub integration runs via Node stdio (`@modelcontextprotocol/server-github`) reading `GITHUB_PERSONAL_ACCESS_TOKEN` from `.agents/mcp.env` or the Antigravity MCP Store, with zero Docker daemon dependency.
   - `.agents/mcp_config.json` and `.agents/mcp.env` are gitignored by the installer and repository.
4. **Installer Fail-Closed Parsing (`bin/cli.mjs`)**:
   - A malformed `.agents/hooks.json`, `.agents/.aac-manifest.json`, or `~/.gemini/config/config.json` aborts the operation with a non-zero exit code and a timestamped backup instead of being overwritten.
5. **Subagent Containment (`.agents/agents/*.md`)**:
   - All custom subagents (`adversarial-reviewer`, `codebase-investigator`, `verification-runner`) run with `commandExecutionPolicy: sandbox` (never un-sandboxed `auto`) and full edit, search, and execution tools.

   - `tools` lists use only documented Antigravity tool names; an unmapped tool name can hang a subagent.
6. **Scheduled Sidecar (`.agents/sidecars/repo-health/sidecar.json`)**:
   - Supported on **Antigravity App** only (global sidecars under `~/.gemini/config/sidecars/`).
   - Disabled by default; requires explicit opt-in via `--with-sidecar --project-id <id>` and consumes AI credits when scheduled conversations run.
