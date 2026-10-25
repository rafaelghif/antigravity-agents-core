# Google Antigravity Platform Features & Best Practices Reference

Authoritative operational reference and architectural best practices synthesized from `https://antigravity.google/docs/features/`.

---

## 1. Projects & Workspace Scoping

In modern Google Antigravity (App 2.0+), agents operate inside **Projects** instead of being confined to a single directory:

- **Native Git Worktrees**:
  - Support for background and subagent tasks in isolated worktree branches (`git worktree add`).
  - Guarantees concurrent agent execution without colliding with the developer's primary working tree.
- **Scoped Security Presets**:
  - `Default`: Sandboxed terminal commands with interactive approval gates for out-of-sandbox actions.
  - `Full machine`: Broadened filesystem access across directories for multi-repo builds.
  - `Unrestricted`: Minimal friction for fully trusted environments.
- **Scoped & Persistent Permissions**:
  - Project-level permission grants persist across turns as the agent learns trusted operations over time.
- **Multi-Folder Project Mounts**:
  - Multiple codebases can be mounted into a single project, allowing cross-repository execution within one conversation session.

---

## 2. Conversations Outside of Projects

- **Ephemeral Sessions**:
  - Quick, one-off conversations outside of any project.
  - Sessions execute in an isolated local scratch folder with independent permissions while inheriting global defaults.

---

## 3. Scheduled Tasks & Autonomous Triggers

- **Gemini 3.8 Flash Engine**:
  - Autonomous background task execution powered by Gemini 3.8 Flash.
- **Minute-Level Precision**:
  - Trigger recurring background tasks, daily health checks, or automated report sweeps on an exact schedule.

---

## 4. Secure by Default (Terminal Sandbox & Approvals)

- **Interactive Approvals**:
  - Commands running outside the isolated terminal sandbox require explicit user confirmation.
- **Bounded Access**:
  - Filesystem mutations are constrained to declared project directories by default.

---

## 5. Live Voice Transcription (`Ctrl + M`)

- **Real-Time Speech-to-Text**:
  - Toggle live recording via `Ctrl + M` or the microphone icon.
- **Smart Cleanup**:
  - The model cleans transcriptions automatically, eliminating filler words, stutters, and resolving spoken self-corrections into cohesive instructions.
- **Dual Surface Support**:
  - Prompt Composer: Speak instructions directly into the chat prompt.
  - Artifact Comments: Leave precise, spoken inline feedback on plans, diffs, and deliverables.

---

## 6. JSON Lifecycle Hooks

Intercept and enforce guardrails at critical agent execution lifecycle stages via `.agents/hooks.json` (workspace or global):
- `PreToolUse`: Intercept commands or file edits before execution (e.g., blocking dangerous git operations).
- `PostToolUse`: Validate tool execution output.
- `PreInvocation`: Set up preconditions before a model turn begins.
- `PostInvocation`: Inspect or audit generated model output.
- `Stop`: Quality gates and handoff reminders before session conclusion.

---

## 7. Browser Subagent & Chrome DevTools MCP

- **Invocation**: Trigger via the `/browser` command or subagent delegation.
- **Chrome DevTools Integration**: Native Chrome DevTools MCP for DOM inspection, console logs, network analysis, and end-to-end debugging.
- **Video Recording**: Record sessions as WebM video files for visual proof and defect reproduction.

---

## 8. Remote Control (`https://antigravity.google.com`)

- **Untethered Mobility**:
  - Drive and monitor desktop sessions from mobile or remote browsers.
- **Local Context Retained**:
  - Keeps direct access to the host workstation's filesystem, credentials, toolchains, and active worktrees.
- **Proactive Push Notifications**:
  - Get notified immediately when tasks complete or when user input is requested.

---

## 9. Integrated Terminal & VCS Review Panel

- **Integrated Sidebar Terminal**:
  - Toggle with `Ctrl`/`Cmd` + `` ` ``.
- **VCS Review Panel**:
  - Inspect diffs by category: Uncommitted diffs, Branch diffs, and Agent tool-edit diffs.
  - Stage, unstage, or discard files selectively.
  - AI-assisted commit message generation adhering to Conventional Commits.

---

## 10. Core Engineering Best Practices

1. **Explore -> Plan -> Execute Loop**:
   - Explore manifests, topology, and execution flows before touching code.
   - For non-trivial changes, formulate a structured implementation plan artifact for review before applying code edits.
2. **Automated Verification Discipline**:
   - Non-trivial logic must leave runnable tests behind.
   - Always run local verification suites (`npm test`, build scripts) before declaring completion.
3. **Strategic Context Enrichment**:
   - Use `@` mentions for files and rule references.
   - Keep prompt payloads token-efficient through progressive disclosure (`SKILL.md`).
4. **Git Worktree Isolation for Parallel Work**:
   - Isolate subagent branches in Git worktrees to maintain clean and reliable integration.
