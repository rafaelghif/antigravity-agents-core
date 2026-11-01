# Issue Tracker Configuration

Primary issue tracking configuration for **AAC (Antigravity Agent Core)**.

## Primary Tracker: GitHub

Issues, specifications, and wayfinder-style maps are tracked on GitHub via the `gh` CLI or the GitHub MCP server installed from the Antigravity MCP Store.

- **Remote**: `origin` -> `https://github.com/rafaelghif/antigravity-agents-core.git`
- **Commands**:
  - Create issue: `gh issue create --title "..." --body "..."`
  - Read issue: `gh issue view <number> --comments`
  - List issues: `gh issue list --state open --json number,title,body,labels,comments`
  - Edit issue / labels: `gh issue edit <number> --add-label "..."`
  - Close issue: `gh issue close <number> --comment "..."`
- **PRs as a request surface**: `no`

## Alternative Tracker: Self-Hosted Gitea via MCP

When working in local or self-hosted environments, configure the Gitea MCP server in `.agents/mcp_config.json` (create it from `.agents/mcp_config.example.json`; it is gitignored). The server then exposes its own MCP tools (for example `issue_read`, `issue_write`, `list_issues`) directly to the agent. There is no generic Antigravity tool that proxies arbitrary MCP calls.

## Offline / Local Fallback

For local or solo development without network connectivity:

- Store issue files under `.scratch/tickets/` as markdown files.
- Promote resolved tickets into `docs/sprint/tickets/` when the work becomes part of a committed sprint.
