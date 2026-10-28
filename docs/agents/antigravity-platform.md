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

## 12. Dynamic Model Tier Architecture & Execution Matrix

Antigravity natively routes tasks across dynamic model capability tiers. Instead of coupling workflows to transient model version strings, the execution harness adapts based on runtime tier characteristics:

### 1. High-Speed / Distilled Iteration Tiers
- **Characteristics**: Low-latency, high-throughput, multi-turn tool loops, and automated continuous integration.
- **Vulnerability**: Vulnerable to instruction dilution, lost-in-the-middle degradation, and premature completion shortcuts.
- **Methodological Safeguards**:
  - Enforce affirmative operational formulas ("Inspect X, wire real Y, fail fast on Z") over passive prohibitions.
  - Employ progressive disclosure (`model_decision` / `glob`) to keep static prompt payloads strictly bounded.
  - Rely on deterministic Node.js lifecycle hooks (`PreToolUse`) to mechanically intercept destructive or invalid actions.

### 2. Frontier Reasoning Tiers
- **Characteristics**: Large-scale internal test-time compute (extended chain-of-thought tokens), deep logic deliberation, and long-horizon autonomy.
- **Strengths**: Excels at holistic codebase refactoring, complex state-machine synchronization, and end-to-end vulnerability patching.
- **Methodological Posture**:
  - Leverages `<thinking_rubric>` to systematically audit caller blast radiuses, edge cases, and architectural seams inside the reasoning phase.
  - Formulates multi-step execution plans and hermetic public test seams before modifying shared interfaces.

### 3. Model-Agnostic Invariants
- **Thinking Steering**: Mandatory evaluation of the 4 check-gates (Blast Radius, 6 Pillars, Ponytail Ladder, Verification Command) during internal reasoning.
- **Zero Mocks**: Real drivers reading from environment variables; mocks strictly isolated to test directories.
- **Execution Evidence**: Tasks require terminal verification (`exit code: 0`) before completion can be reported.
