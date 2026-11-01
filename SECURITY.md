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
   - Downloads are pinned to the `v6.0.0` ref (`AAC_REF` overrides). A failed download errors out with an actionable message instead of silently falling back to a mutable branch. The recommended invocation downloads the script for inspection first; the piped one-liner is documented as a convenience, not as a safe default.
   - Tracks SHA-256 hashes of managed files in `.agents/.aac-manifest.json`.
   - Never overwrites user-modified `AGENTS.md`, rules, skills, or `CONTEXT.md` on `upgrade` unless `--force` is explicitly passed; backs up existing files to `.scratch/backups/<timestamp>/` and writes incoming updates to `<file>.aac-new`.
   - `uninstall` deletes only AAC-managed manifest entries (`AGENTS.md` or `.agents/{rules,skills,agents,sidecars}/...`), rejects `..` segments, and requires containment inside the target directory. Crafted or corrupted manifest entries are skipped with a warning instead of deleting arbitrary files.
2. **Cross-Platform Lifecycle Hooks (`.agents/hooks.json`)**:
   - Executes inline Node JSON parsers (`node -e`) for cross-platform compatibility on Linux, macOS, and Windows, with a 5-second timeout.
   - Malformed hook payloads return `decision: "ask"` (fail-closed), so a schema change surfaces as a prompt instead of silently disabling the guard.
   - `lifecycle-session-bootstrap` resolves `.scratch/handoff.md`, `docs/sprint/SPRINT.md`, and `CONTEXT.md` from the documented `workspacePaths` stdin field, never from the hook working directory. It also injects a clinical-prose directive when `AAC_PERSONA=neutral` is present in the host environment.
   - `git-destructive-guard` repeatedly strips stacked shell wrappers (`sudo`, `env VAR=...`, `command`, `nohup`, `timeout N`, `bash -lc`, `powershell -Command`) and stacked git global options (`-C`, `-c`, `--git-dir`, `--work-tree`, `--no-pager`, ...) before matching destructive subcommands anywhere in the segment, including `git.exe` and `$(git ...)` forms (`push --force/+ref/--mirror/--delete`, `reset --hard/--merge/--keep`, `clean -f`, `branch -D`, `checkout -f/-B/-- <path>`, `restore`, `switch --discard-changes/-C`, `tag -d`, `stash clear/drop`, `reflog expire/delete`, `gc --prune`, `update-ref -d`, `worktree remove/prune`, `submodule deinit -f`, `rm`, `filter-branch/filter-repo`) and returns `decision: "ask"`.
   - `production-no-mock-guard` covers every file-write tool with its real argument name (`CodeContent`, `ReplacementContent`, `ReplacementChunks`) and intercepts fake stores (`mock*`, `fake*`, `dummy*`, `stub*`), `jest.mock`/`vi.mock`, dummy tokens, and deferred `TODO: implement` stubs in non-test files with `decision: "ask"`.
   - The mock guard's exemptions are test code (`*.test.*`, `*.spec.*`, `test_*.py`, `tests/`, `__tests__/`, `fixtures/`, `mocks/`) plus `*.md`, `hooks.json`, and `package.json`. Markdown and config files are exempt because documentation and the hook definitions themselves contain the words the detector matches; they are not executable production modules.
3. **MCP Configuration (`.agents/mcp_config.example.json`)**:
   - `init`/`upgrade` install the template pair (`.agents/mcp_config.example.json`, `.agents/mcp.env.example`) as manifest-tracked files; copy the example to `.agents/mcp_config.json`, which stays gitignored.
   - Credentials live in `env` or a gitignored `--env-file`, never in `args` or committed `headers`.
   - Database/cloud/GitHub integrations should be installed from the Antigravity MCP Store so OAuth tokens stay in Antigravity's token store.
   - `.agents/mcp_config.json` and `.agents/mcp.env` are gitignored by the installer and repository.
4. **Installer Fail-Closed Parsing (`bin/cli.mjs`)**:
   - A malformed `.agents/hooks.json`, `.agents/.aac-manifest.json`, or `~/.gemini/config/config.json` aborts the operation with a non-zero exit code and a timestamped backup instead of being overwritten.
5. **Subagent Containment (`.agents/agents/*.md`)**:
   - `codebase-investigator` runs with `commandExecutionPolicy: off` (strictly read-only) and no `run_command` tool.
   - `adversarial-reviewer` and `verification-runner` run with `commandExecutionPolicy: sandbox` (never `auto`).
   - `tools` lists use only documented Antigravity tool names; an unmapped tool name can hang a subagent.
6. **Scheduled Sidecar (`.agents/sidecars/repo-health/sidecar.json`)**:
   - Supported on **Antigravity App** only (global sidecars under `~/.gemini/config/sidecars/`).
   - Disabled by default; requires explicit opt-in via `--with-sidecar --project-id <id>` and consumes AI credits when scheduled conversations run.
