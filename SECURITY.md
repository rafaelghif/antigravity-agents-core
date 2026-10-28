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
   - Tracks SHA-256 hashes of managed files in `.agents/.aac-manifest.json`.
   - Never overwrites user-modified `AGENTS.md`, rules, skills, or `CONTEXT.md` on `upgrade` unless `--force` is explicitly passed; backs up existing files to `.scratch/backups/<timestamp>/` and writes incoming updates to `<file>.aac-new`.
2. **Cross-Platform Lifecycle Hooks (`.agents/hooks.json`)**:
   - Executes inline Node JSON parsers (`node -e`) for cross-platform compatibility on Linux, macOS, and Windows.
   - `git-destructive-guard` intercepts destructive git variants (`push --force`, `+ref`, `--mirror`, `reset --hard`, `clean -f`, `branch -D`, `checkout -- .`, `restore .`, `tag -d`) and returns `decision: "ask"` requiring explicit user approval.
   - `production-no-mock-guard` intercepts fake in-memory stores (`mock*`, `fake*`), dummy tokens (`dummy_id`, `fake-token`), and `TODO: implement later` stubs in non-test files with `decision: "ask"`.
3. **Subagent Containment (`.agents/agents/*.md`)**:
   - `codebase-investigator` runs with `commandExecutionPolicy: off` (strictly read-only).
   - `adversarial-reviewer` and `verification-runner` run with `commandExecutionPolicy: sandbox` (never `auto`).
4. **Scheduled Sidecar (`.agents/sidecars/repo-health/sidecar.json`)**:
   - Supported on **Antigravity App** only.
   - Disabled by default; requires explicit opt-in via `--with-sidecar --project-id <id>` and consumes AI credits when scheduled conversations run.
