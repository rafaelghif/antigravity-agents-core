# Google Antigravity Platform Features & Best Practices Reference

Authoritative operational reference and architectural best practices synthesized from `https://antigravity.google/docs/features/` and `https://antigravity.google/docs/changelog/`.

---

## 1. Projects & Workspace Boundary Scoping

In Google Antigravity 2.0+, agents operate within **Projects** providing deep architectural boundaries and multi-repo support:

- **Native Git Worktrees**:
  - Direct support for background and subagent tasks in isolated worktree branches (`git worktree add`).
  - Ensures concurrent agent execution without colliding with the developer's active working tree.
- **Scoped Security Presets**:
  - `Default`: Sandboxed terminal commands with interactive approval gates for out-of-sandbox actions.
  - `Full machine`: Broadened filesystem access across directories for multi-repo builds.
  - `Unrestricted`: Minimal friction for fully trusted environments.
  - In-composer permissions preset picker allows switching presets per message.
- **Scoped & Persistent Permissions**:
  - Project-level permission grants persist across turns as the agent learns trusted operations over time.
- **Multi-Folder Project Mounts**:
  - Mount multiple directories in a single project to operate across related microservices or monorepos within one conversation.
- **Workspace Configuration Standard**:
  - Project-level customizations and settings load from `<project>/.gemini/config.json`.
- **Windows Subsystem for Linux (WSL)**:
  - Native WSL distribution integration allowing agents to execute directly within Linux environments on Windows machines.

---

## 2. Conversations Outside of Projects

- **Ephemeral Sessions**:
  - Start quick, one-off conversations outside of any project.
  - Sessions execute in an isolated local scratch folder with independent permissions while inheriting global defaults.

---

## 3. Automations & Session Compacting

- **Automations (formerly Scheduled Tasks)**:
  - Supports recurring triggers with minute-level precision as well as immediate on-demand runs via `Run Now`.
  - Guided setup with `Create with Prompt` allowing agents to construct automations conversationally.
  - Configurable model tiers: Flash Lite, Flash, or Pro.
- **Session Compacting (`/compact`)**:
  - When conversations grow long, `/compact` compresses historical context into an executive summary, clearing context window capacity while retaining core instructions and progress.

---

## 4. Secure by Default (Terminal Sandbox & Approvals)

- **Cross-Platform Sandboxing**:
  - Native file and network terminal sandboxing across Linux, macOS, and Windows.
- **Interactive Approval Gates**:
  - Commands running outside the isolated terminal sandbox require explicit user confirmation.
- **Docked Interaction Prompts (v2.26+)**:
  - Question prompts (`ask_question`) and permission dialogs dock above the message composer instead of replacing it, allowing users to type or queue follow-up messages while review is pending.

---

## 5. Live Voice Transcription & Media Interactions

- **Real-Time Speech-to-Text (`Ctrl + M`)**:
  - Live transcription with smart cleanup: automatically removes filler words, stutters, and resolves spoken self-corrections.
  - Dual surface support: Prompt composer and inline artifact comments.
- **Native Document & Archive Support**:
  - Drag-and-drop support for Microsoft Office documents (.docx, .xlsx, .pptx) parsed natively by Gemini models.
  - Direct `.zip` archive extraction and processing.
- **Full-Screen Media Viewer**:
  - Pan/zoom for images, 2x playback speed, and frame-stepping navigation for videos.

---

## 6. JSON Lifecycle Hooks & Custom Agent Declarations

Intercept and enforce guardrails at critical agent execution lifecycle stages via `.agents/hooks.json` (workspace or global) or directly within custom agent frontmatter (`hooks:`):
- `PreToolUse`: Intercept commands or file edits before execution (e.g., blocking dangerous git operations).
- `PostToolUse`: Validate tool execution output.
- `PreInvocation`: Set up preconditions before a model turn begins.
- `PostInvocation`: Inspect or audit generated model output.
- `Stop`: Quality gates and handoff reminders before session conclusion.

---

## 7. Subagent Orchestration & Direct Messaging

- **Direct Subagent Messaging**:
  - Send messages directly to background subagents from the message box without routing through the coordinator agent.
- **Live Status Cards**:
  - Subagents appear as live conversation cards showing running, waiting, and completed states with stop controls and attention indicators.
- **Browser Subagent (`/browser`)**:
  - Dedicated browser automation via Chrome DevTools MCP (DOM inspection, network analysis, console auditing).
  - Video session recording (WebM) for reproducible test verification.

---

## 8. Remote Control (`https://antigravity.google.com`)

- **Untethered Mobility**:
  - Drive and monitor desktop sessions from mobile or remote browsers.
- **Local Context Retained**:
  - Preserves host workstation toolchains, credentials, and active worktrees.
- **Proactive Push Notifications**:
  - Instant browser notifications on task completion or human approval gates.

---

## 9. Integrated Terminal & VCS Review Panel

- **Integrated Sidebar Terminal**:
  - Toggle terminal pane quickly via `Ctrl`/`Cmd` + `` ` ``.
- **VCS Review Panel**:
  - Category-based diff inspections: Uncommitted diffs, Branch diffs, and Agent tool-edit diffs.
  - File-level staging, unstaging, and discarding.
  - AI-assisted commit message generation adhering to Conventional Commits.

---

## 10. Token Budgeting & Architecture Isolation

- **20,000-Token Rules Budget**:
  - Rules receive an isolated budget preventing them from crowding out skills, subagents, or MCP tools.
  - Over-budget rules are included by reference (file path + description) for on-demand loading.
- **Planning Mode (`/plan`)**:
  - Formulate structured implementation plan artifacts before touching code.
  - Configurable Plan Review Policy: `always-proceed`, `agent-decides`, or `skip`.

---

## 11. Core Engineering Best Practices

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
   - Isolate subagent branches in Git worktrees (`Workspace: "branch"` or `"share"`) to maintain clean and reliable integration.

---

## 12. Gemini 3.8 Flash Optimization & Execution Mechanics

**Gemini 3.8 Flash** (`gemini-3.8-flash`) is the platform's high-efficiency workhorse model optimized for long-horizon agentic loops, code synthesis, and multi-turn tool execution.

### Key Technical Parameters
- **Context Window**: 1,048,576 tokens (~1M).
- **Max Output**: 65,536 tokens.
- **Thinking Levels**: Configured via `thinking_level: "low" | "medium" | "high"` (`minimal` is unsupported).
- **Sampling Behavior**: `temperature` defaults to `1.0`; custom frequency/presence penalties are unsupported and will return API errors.

### Flash Adherence Strategies (Preventing Rule-Skipping)
1. **Internal Thinking Steering**: With `thinking_level: "high"`, inject a structured `<thinking_rubric>` into system instructions to mandate blast-radius mapping and invariant checks during internal chain-of-thought tokens before any tool emission.
2. **Deterministic PreToolUse Hook Backstops**: Rely on Node.js lifecycle hooks (`.agents/hooks.json`) to intercept destructive git actions and production mocks mechanically rather than depending solely on prompt compliance.
3. **Subagent Workload Offloading**: Use sandboxed custom subagents (`codebase-investigator`, `verification-runner`) to isolate heavy file scans and test outputs, keeping the primary agent context window lean and preventing *Lost-in-the-Middle* degradation.
4. **Affirmative Operational Guardrails**: State constraints as positive, active operational steps with clear preconditions and fail-fast triggers.
