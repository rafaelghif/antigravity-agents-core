# Antigravity Native Browser Subagent Reference

Official platform documentation reference for Antigravity's browser automation, Chrome DevTools MCP, and the `/browser` subagent command.

---

## 1. How the Native Browser Subagent Works

Google Antigravity provides an integrated, out-of-the-box browser execution environment:

1. **Invocation via Composer or Slash Command**:
   - Typing `/browser <task>` in the Antigravity composer prompts the main agent to delegate the task to a specialized browser subagent.
   - The agent can also trigger this programmatically via `invoke_subagent` using the `browser` type.
2. **Chrome DevTools MCP Server**:
   - The platform automatically spins up a local Google Chrome instance controlled via the Chrome DevTools Model Context Protocol (MCP) server or `@playwright/mcp`.
   - Requires zero manual browser binary setup or extension installations.
3. **Isolated Conversation Context**:
   - The browser subagent runs in its own dedicated conversation window.
   - Prevents massive accessibility trees, DOM snapshots, network payloads, and verbose console logs from polluting the primary developer context window.
4. **Recorded Video & Screenshot Artifacts**:
   - Every browser automation run is recorded and exported as a WebM video artifact saved to the conversation assets directory.
   - Screenshots captured during verification are displayed directly in the Artifacts / Aux Pane for instant visual review.

---

## 2. Security & Policy Enforcement

Browser activities are bounded by security controls configured in `~/.gemini/antigravity-cli/settings.json` or project settings:

* **Browser Allowlist (`browserAllowlist`)**:
  - Restricts which domains and hostnames the agent's browser tools can navigate to.
  - Local addresses (`http://localhost:*`, `http://127.0.0.1:*`) are typically allowed for local dev server testing.
  - Wildcards (`*.internal.net`) can be configured for enterprise staging servers.
* **Internet Access Policy (`internetAccessPolicy`)**:
  - `allow`: Agent can make unrestricted external requests.
  - `ask`: Prompts the user before navigating to external web domains.
  - `deny`: Fully restricts network and browser operations to local offline surfaces.
* **Tool Execution Policy (`toolPermission`)**:
  - Regulates whether automated shell commands (e.g., launching local development preview servers) require user consent before running.
