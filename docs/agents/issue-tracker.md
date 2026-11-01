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

## GitHub MCP Server Configuration

Configure the official GitHub MCP server ([`github/github-mcp-server`](https://github.com/github/github-mcp-server)) in `.agents/mcp_config.json` (copy from `.agents/mcp_config.example.json`; it is gitignored).

Credentials live in `.agents/mcp.env` (copy from `.agents/mcp.env.example`), keeping tokens out of process command lines and repository history via `npx -y @modelcontextprotocol/server-github` (or via official Docker container `ghcr.io/github/github-mcp-server` when Docker Desktop is active). The server exposes all GitHub repository, issue, and pull request tools directly to the agent.

## Offline / Local Fallback

For local or solo development without network connectivity:

- Store issue files under `.scratch/tickets/` as markdown files.
- Promote resolved tickets into `docs/sprint/tickets/` when the work becomes part of a committed sprint.
