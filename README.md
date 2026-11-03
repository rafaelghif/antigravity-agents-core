<div align="center">

<img src="assets/banner.png" alt="AAC (Antigravity Agent Core) Banner" width="100%" />

# Antigravity Agent Core (V6)

**Enterprise-grade Principal Software Engineering & Technical Scrum constitution, progressive-disclosure rules, deep-module skills, sandboxed subagents, cross-platform lifecycle hooks, and zero-daemon MCP integration for Google Antigravity.**

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-6.1.0-blue.svg?style=for-the-badge&logo=git" alt="Version 6.1.0" /></a>
  <a href="https://antigravity.google/docs"><img src="https://img.shields.io/badge/platform-Google_Antigravity_2.0-8A2BE2.svg?style=for-the-badge&logo=google" alt="Platform" /></a>
  <a href="https://antigravity.google/docs/rules"><img src="https://img.shields.io/badge/engine-Dynamic_High_Reasoning-0052CC.svg?style=for-the-badge&logo=googlecloud" alt="Dynamic High Reasoning" /></a>
  <a href="#v5--v6-evolution--consolidation-matrix"><img src="https://img.shields.io/badge/architecture-deep_modules-success.svg?style=for-the-badge" alt="Deep Modules" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License: MIT" /></a>
</p>

</div>

---

## Why Antigravity Agent Core?

Most AI coding assistants act as **sycophantic yes-men**: they agree with broken architectural premises, generate fragile, mock-heavy boilerplate, silently drop state across multi-turn sessions, and fail under complex enterprise constraints.

**Antigravity Agent Core (AAC V6)** upgrades Google Antigravity into an **uncompromising Principal Software Engineer & Technical Scrum Master**:

- **Anti-Sycophancy Pair-Programming**: Questions flawed premises before code is written (`[Premise Breakdown] -> [Production Failure] -> [Superior Alternative]`).
- **The 6 Engineering Pillars**: Stress-tests every architectural decision and diff to be *Future-Proof, Scalable, Maintainable, Secure, High-Performance, and Upgradeable*.
- **Autonomous Technical Scrum**: Decomposes high-level goals into an Execution Wave DAG (`docs/sprint/SPRINT.md`), test-first vertical tickets, and persistent cross-session handovers.
- **Zero-Mock Production Integrity**: Production paths require genuine environment-backed drivers; mocks and stubs are quarantined strictly to test directories via automated lifecycle guards.
- **Zero-Daemon Primitives**: MCP tools and platform scripts run via standard Node stdio without Docker daemon dependencies or named pipe failures.
- **Non-Destructive Management**: Installs and upgrades non-destructively via a SHA-256 manifest CLI (`bin/cli.mjs`) that protects user modifications and tracks managed assets.

---

## Core Design Principles (V6 Enterprise Architecture)

1. **High-Signal Principal Engineer Persona (Anti-Sycophancy)**: Direct, rigorous, and strictly non-sycophantic pair-programming. Eliminates hollow validation in favor of objective engineering evaluation. When corporate environments require formal tone, exporting `AAC_PERSONA=neutral` instructs the `SessionStart` hook to inject clinical Staff Engineer prose across all interactions.
2. **User-Defined Architecture (Interview First, Zero Static Dogma)**: Never imposes a rigid folder hierarchy, arbitrary layer dogma, or assumed technology stack. Discovers existing repository topology dynamically and **interviews the user first** (`ask_question` / `/grill-me`) whenever boundaries, databases, or conventions are undecided.
3. **The 6 Non-Negotiable Engineering Pillars**: Defined once in `AGENTS.md` §3—every design and diff is stress-tested against:
   - **Future-Proof**: Clean contracts, extensible domain models, zero hard-coded assumptions requiring rewrites.
   - **Scalable**: Zero N+1 query loops, bounded memory/queues, horizontal readiness, safe concurrency under load.
   - **Maintainable**: Low cognitive load (KISS, DRY, YAGNI, SOLID), deep modules (Ousterhout), intention-revealing names, zero clever spaghetti.
   - **Secure**: Zero-trust boundary parsing ("Parse, don't validate"), strict authorization (zero BOLA/IDOR), atomic mutations (zero TOCTOU races), zero leaked secrets.
   - **High-Performance**: Optimal algorithmic complexity, minimal I/O round-trips, proper indexing, explicit timeouts on external calls.
   - **Upgradeable**: Narrow boundary seams, backward-compatible migrations (`Expand-Migrate-Contract`), explicit `// ponytail:` upgrade paths.
4. **Expert Technical Scrum & Multi-Session Continuity**:
   - `/to-tickets` generates a committed **Scrum Sprint Wave Board (`docs/sprint/SPRINT.md`)** and session-sized vertical tracer-bullet tickets (`docs/sprint/tickets/<NN>-<slug>.md`) with **Definition of Ready (DoR)**, **Execution Waves (DAG)**, and **Definition of Done (DoD)**.
   - `/implement` executes 1 unblocked ticket test-first, commits atomically when the user authorizes commits, updates the ticket's `Session Handover & Completion Log`, and promotes newly unblocked tickets in `docs/sprint/SPRINT.md`.
   - `/handoff` checkpoints sprint progress, downstream seam notes, and the exact next command into `.scratch/handoff.md`.
5. **Cross-Platform Lifecycle Hooks & Standalone Guards**:
   - `.agents/hooks.json` uses cross-platform Node JSON parsers:
     - `SessionStart`: Detects cold-start sprint/handoff artifacts and injects active persona directives.
     - `PreToolUse` (Git Guard): Loads `.agents/git-guard.cjs` to intercept direct pushes to protected `main` or `master` branches with `decision: "ask"`, while keeping everyday dev commands (branch, commit, stash, checkout) frictionless.
     - `PreToolUse` (Production No-Mock Guard): Blocks dummy IDs/tokens, synthetic stores, and deferred `TODO` stubs in production paths with fail-closed handling.
6. **Contained Sandboxed Subagents**:
   - `.agents/agents/*.md` subagents run with `commandExecutionPolicy: sandbox` with full operational capabilities (view, write, search, run) without polluting the parent conversation context.
7. **Zero-Daemon MCP & Safe Platform Runtimes**:
   - Default configurations use native Node stdio (`@modelcontextprotocol/server-github`) reading credentials from `env` or `.agents/mcp.env`, eliminating background Docker daemon dependencies and Windows named-pipe failures.
8. **Non-Destructive SHA-256 Manifest CLI**:
   - Tracks managed files in `.agents/.aac-manifest.json`.
   - `upgrade` preserves `CONTEXT.md` and never overwrites user-modified files unless `--force` is passed (backs up conflicts to `.scratch/backups/<timestamp>/` and writes incoming updates to `<file>.aac-new`).

---

## V5 → V6 Evolution & Consolidation Matrix

AAC V6 consolidates 64 legacy fragmented skills into a cohesive, deep-module architecture, eliminating cognitive noise, redundant variants, and token bloat while upgrading core engineering workflows:

| Legacy V5 Area (64 Skills Bloat) | V6 Consolidated Architecture | Primary Seams & Purpose |
| :--- | :--- | :--- |
| **Caveman Suite** (14 fragmented skills: `caveman-discover`, `caveman-learn`, etc.) | **Progressive Rule (`caveman.md`)** | High-signal, high-velocity communication & token-efficient engineering protocol without prompt bloat. |
| **Ponytail Suite** (6 fragmented skills: `ponytail-debt`, `ponytail-gain`, etc.) | **Progressive Rule (`ponytail.md`)** | 7-Rung Minimalist Ladder, root-cause caller mapping, and surgical in-place edits. |
| **Grilling Variants** (3 skills: `grill-me`, `grilling`, `grill-with-docs`) | **Unified `/grill-me` Skill** | Interactive one-question-at-a-time interview with `(Recommended)` first slot to define architecture & stress-test designs. |
| **Scattered Implementation** (`implement`, `implement-spec`, `lean-build`, `prototype`) | **Technical Scrum Wave Engine (`/to-tickets`, `/implement`, `/handoff`)** | Vertical tracer-bullet tickets with Execution Waves DAG (`docs/sprint/SPRINT.md`), DoR, DoD, and cross-session handover. |
| **Review & Verification Scripts** (`code-analyzer`, `quality-guard`, etc.) | **3 Native Subagents & Automated Suite** | Sandboxed `adversarial-reviewer`, `codebase-investigator`, `verification-runner`, plus `tests/aac.test.mjs`. |
| **Fragile Bash/PS1 Overwriters** | **SHA-256 Manifest CLI (`bin/cli.mjs`)** | Non-destructive tracking in `.agents/.aac-manifest.json`, conflict backup (`.scratch/backups/`), `.aac-new`, `--dry-run`, and `uninstall`. |

---

## End-to-End Engineering & Scrum Workflow

```mermaid
flowchart LR
    G["/grill-me\n(One Question at a Time)"] --> F{"Decision Tree\nSettled?"}
    F -->|"New Domain Terms /\n3-Gate Trade-off"| DM["/domain-modeling\n(CONTEXT.md + ADR)"]
    F -->|"Module Boundary /\nSeam Design"| CD["/codebase-design\n(Design It Twice)"]
    F -->|"Multi-Session Feature"| Spec["/to-spec\n(specs/<slug>.md)"]
    F -->|"Scrum Wave Planning"| Tickets["/to-tickets\n(docs/sprint/SPRINT.md)"]
    F -->|"Small Single Slice"| Impl["/implement\n(DoR -> TDD -> DoD)"]
    F -->|"End Session"| Handoff["/handoff\n(.scratch/handoff.md)"]
    DM --> Spec
    CD --> Spec
    Spec --> Tickets
    Tickets -->|"Wave 1..N"| Impl
    Impl <-->|"Next Session"| Handoff
    Impl --> Review["/code-review\n(Spec + 6 Pillars)"]
    Review --> PR["/pr\n(Summary + Door + Evidence)"]
```

---

## Interactive Command & Skills Directory

AAC V6 ships 16 focused single-responsibility skills and 3 sandboxed native subagents organized by lifecycle phase:

### 1. Discovery & Architecture
| Command / Skill | When to Use | Primary Output / Public Seam |
| :--- | :--- | :--- |
| **`/grill-me`** | Undecided stack, architecture, or requirements | Interactive one-question interview stress-testing plans against the 6 Pillars. |
| **`/domain-modeling`** | Ambiguous domain concepts or architectural decisions | Updates ubiquitous glossary in `CONTEXT.md` and records 3-Gate ADRs in `docs/adr/`. |
| **`/codebase-design`** | Designing module interfaces and test seams | Deep module contracts designed using the Design-It-Twice method. |
| **`/research`** | Investigating APIs, official documentation, or 2026 best practices | Evidence-based synthesis in `.scratch/research/<topic>.md` citing primary sources. |
| **`/to-spec`** | Settled architecture ready for formal specification | Structured technical specification in `specs/<slug>.md` with explicit seams. |

### 2. Technical Scrum Engine
| Command / Skill | When to Use | Primary Output / Public Seam |
| :--- | :--- | :--- |
| **`/to-tickets`** | Decomposing a spec or epic into buildable slices | Execution Waves DAG in `docs/sprint/SPRINT.md` and vertical tickets with DoR/DoD. |
| **`/implement`** | Building an unblocked vertical ticket | Test-first implementation slice, atomic commit upon authorization, board sync. |
| **`/handoff`** | Ending session, switching context, or handing over | Checkpoints sprint progress and single next action into `.scratch/handoff.md`. |

### 3. Engineering Quality & TDD
| Command / Skill | When to Use | Primary Output / Public Seam |
| :--- | :--- | :--- |
| **`/tdd`** | Feature implementation and bug fixing | Red-Green-Refactor test loop asserting public module seams. |
| **`/diagnosing-bugs`** | Reproducing failures, flaky tests, or regressions | Tight reproduction script and root-cause hypothesis falsification. |
| **`/safe-refactor`** | Restructuring code without altering external behavior | Characterization tests followed by atomic, behavior-preserving transformations. |
| **`/database-migration`** | Modifying schemas, tables, indexes, or API versions | Zero-downtime Expand-Migrate-Contract plan with rollback verification. |
| **`/code-review`** | Reviewing diffs, pull requests, or branches | Two-axis audit: specification fidelity + 6-Pillar engineering standards. |
| **`/pr`** | Opening or updating a pull request | Structured PR description with visual summary, door reversibility, and test evidence. |

### 4. Automation & Tooling
| Command / Skill | When to Use | Primary Output / Public Seam |
| :--- | :--- | :--- |
| **`/browsing`** | Live UI verification, E2E journeys, layout testing | Playwright browser automation scripts via `/browser` subagent. |
| **`/office`** | Parsing spreadsheets, generating Word/PDF reports | Native multimodal ingestion and automated document generation scripts. |

### 5. Native Sandboxed Subagents (`.agents/agents/`)
| Subagent | Model | Policy | Core Responsibility |
| :--- | :--- | :--- | :--- |
| **`codebase-investigator`** | `flash` | `sandbox` | Fast operational reconnaissance, blast-radius mapping, and execution flow tracing. |
| **`adversarial-reviewer`** | `inherit` | `sandbox` | Independent Red-Team critic auditing proposed diffs against the 6 Pillars. |
| **`verification-runner`** | `flash` | `sandbox` | Isolated build, lint, typecheck, and test runner returning compact pass/fail traces. |

---

## Repository Structure

```text
antigravity-agents-core/
├── .env.example                               # Environment template for local configuration
├── .gitattributes                             # Deterministic LF/CRLF normalization for hooks, rules & tests
├── .gitignore                                 # Excludes secrets, scratch state, and MCP credentials
├── .npmignore                                 # Packaging exclusions for clean distribution
├── AGENTS.md                                  # Always-on Savage Gen-Z Principal Engineer & 6-Pillar Rules
├── CONTEXT.md                                 # User-Defined Architecture, Stack & Domain Glossary
├── package.json                               # NPX & GitHub Packages distributor (@rafaelghif/aac-core v6.1.0)
├── bin/cli.mjs                                # Non-destructive SHA-256 manifest CLI (init / upgrade / uninstall)
├── install.sh                                 # Linux / macOS installer (delegates all writes to bin/cli.mjs)
├── install.ps1                                # Windows PowerShell installer (delegates all writes to bin/cli.mjs)
├── tests/aac.test.mjs                         # Automated test suite (CLI, hooks bypass corpus, official frontmatter contract, link integrity)
├── LICENSE                                    # MIT License
├── SECURITY.md                                # Threat model & vulnerability disclosure policy
├── CHANGELOG.md                               # Release history
├── .github/workflows/publish-package.yml      # Matrix CI verification + provenance publishing
├── assets/
│   └── banner.png                             # Official repository banner
├── docs/
│   ├── adr/                                   # Architecture Decision Records (0001–0004)
│   └── agents/                                # Antigravity platform reference, skill routing, tracker config
└── .agents/
    ├── git-guard.cjs                          # Fast, standalone push-to-main guard runner
    ├── hooks.json                             # Cross-platform inline Node lifecycle hooks (SessionStart, PreToolUse)
    ├── mcp.env.example                        # Template for MCP credential isolation
    ├── mcp_config.example.json                # Zero-daemon GitHub MCP template (Node stdio, env secrets)
    ├── sidecars/repo-health/sidecar.json      # Antigravity App scheduled sidecar template
    ├── rules/                                 # 9 Modular Rules (flat directory, official trigger contract)
    │   ├── coding-standards.md                # DRY, KISS, YAGNI, SOLID/SRP, Clean Code (model_decision)
    │   ├── architecture-and-flow.md           # User-Defined Architecture, Deep Modules, E2E Flow (model_decision)
    │   ├── ponytail.md                        # 7-Rung Minimalist Ladder, Root Cause & Surgical Edits (model_decision)
    │   ├── caveman.md                         # Savage Gen-Z high-signal style & persona switch (model_decision)
    │   ├── database-migrations.md             # Expand-contract, CONCURRENTLY outside tx, SQL safety (model_decision)
    │   ├── security-and-auth.md               # BOLA/IDOR, idempotency, atomic locks, full SSRF defense (model_decision)
    │   ├── git-and-context.md                 # Conventional atomic commits, CONTEXT.md, Sprint Board (model_decision)
    │   ├── testing.md                         # Public-seam assertions, hermeticity, boundary coverage (glob)
    │   └── release-audit.md                   # Pre-release production readiness rubric (manual @mention)
    ├── skills/                                # 16 Focused Single-Responsibility Skills
    │   ├── browsing/                          # Live UI verification, E2E journeys & /browser workflow
    │   │   ├── SKILL.md
    │   │   ├── scripts/run-browser.mjs
    │   │   ├── examples/e2e-journey-example.mjs
    │   │   ├── references/locators-and-patterns.md
    │   │   ├── references/antigravity-subagent.md
    │   │   └── resources/browser-test-template.mjs
    │   ├── research/SKILL.md                  # High-trust primary-source investigation & empirical grounding
    │   ├── office/                            # Native multimodal Office parsing & automated document authoring
    │   │   ├── SKILL.md
    │   │   ├── scripts/extract-office.py
    │   │   ├── examples/generate-report.py
    │   │   ├── references/office-formats-and-tools.md
    │   │   └── references/document-conversions.md
    │   ├── grill-me/SKILL.md                  # One-question-at-a-time interview & 6-Pillar stress-test
    │   ├── domain-modeling/                   # Sharpens CONTEXT.md glossary & records 3-Gate ADRs
    │   │   ├── SKILL.md
    │   │   └── resources/adr-template.md
    │   ├── codebase-design/SKILL.md           # Deep modules & public test seams (Design It Twice)
    │   ├── to-spec/                           # Turns settled decisions into a technical specification
    │   │   ├── SKILL.md
    │   │   └── resources/spec-template.md
    │   ├── to-tickets/                        # Scrum Sprint Wave Board (SPRINT.md) & vertical tickets
    │   │   ├── SKILL.md
    │   │   ├── resources/sprint-board-template.md
    │   │   └── resources/ticket-template.md
    │   ├── implement/SKILL.md                 # Builds 1 Sprint ticket end-to-end (DoR -> TDD -> DoD -> Sync)
    │   ├── tdd/SKILL.md                       # Red -> Green -> Refactor test-driven development loop
    │   ├── diagnosing-bugs/SKILL.md           # Tight reproduction loop & scoped hypothesis falsification
    │   ├── safe-refactor/SKILL.md             # Behavior-preserving atomic code refactoring
    │   ├── database-migration/SKILL.md        # Zero-downtime Expand -> Migrate -> Contract migrations
    │   ├── code-review/SKILL.md               # Two-axis diff review (Spec fidelity + Engineering standards)
    │   ├── pr/                                # Writes PR description (Visual Summary, Door Type, Evidence)
    │   │   ├── SKILL.md
    │   │   └── resources/pr-template.md
    │   └── handoff/                           # Multi-session Scrum handover (.scratch/handoff.md + SPRINT.md)
    │       ├── SKILL.md
    │       └── resources/handoff-template.md
    └── agents/                                # 3 Native Custom Subagents (commandExecutionPolicy: sandbox)
        ├── codebase-investigator.md           # Fast operational recon & blast-radius tracer (model: flash, policy: sandbox)
        ├── adversarial-reviewer.md            # Independent Red-Team diff & 6-Pillar critic (policy: sandbox)
        └── verification-runner.md             # Isolated build, lint, typecheck & test runner (model: flash, policy: sandbox)
```

---

## Verification & Platform Contract

Every claim in this repository is enforced by the shipped automated test suite, not by documentation alone:

```bash
npm test          # CLI idempotency, hook bypass corpus, official frontmatter/skill/subagent contract, relative-link integrity
npm run pack:check  # npm packaging contents
```

CI runs both commands on `ubuntu-latest`, `macos-latest`, and `windows-latest`. `.gitattributes` pins LF for every text file (CRLF for `.ps1`) so frontmatter parsing and hook commands behave identically across platforms.

Verified against the official Antigravity documentation (2026-11-01):

| Artifact | Official contract |
| :--- | :--- |
| `.agents/rules/*.md` | Flat directory, YAML `trigger` required (`always_on`, `model_decision`, `glob`, `manual`), `globs` for `glob`, `description` for `model_decision`; 24 KB per file, 20,000-token aggregate budget |
| `.agents/skills/<name>/SKILL.md` | One level deep, `name` + `description` frontmatter, progressive disclosure, decision tree for complex skills |
| `.agents/agents/<name>.md` | `name`, `description`, `tools`, `subagent`, `mainAgent`, `model` (`inherit`/`flash`/`pro`), `commandExecutionPolicy` (`off`/`sandbox`), `skills` |
| `.agents/hooks.json` | Named hooks with `SessionStart` / `PreToolUse` / `PostToolUse` / `PreInvocation` / `PostInvocation` / `Stop`; JSON on stdin/stdout; `decision` gating |
| `.agents/sidecars/<id>/sidecar.json` + `~/.gemini/config/config.json` | `command` or `builtin`, `args`, `restart_policy`, enabled per sidecar with optional `projectId` |
| `.agents/mcp_config.json` | `mcpServers` map; `command`/`args`/`env` for stdio or `url`/`serverUrl` for remote; `timeoutSeconds` supported |

The MCP template deliberately keeps credentials in `env` or `.agents/mcp.env`, never in `args`: command-line arguments are visible in process listings. GitHub integrations run via Node stdio (`@modelcontextprotocol/server-github`) without requiring Docker Desktop, or can be installed directly from the Antigravity MCP Store.

---

## Quick Start (Multi-Platform Installation, Upgrade & Uninstall)

**Prerequisite**: Node.js **>= 22** on `PATH`. The CLI and lifecycle hooks are Node programs, so there is no supported install path without it.

Install or upgrade into **any project** without modifying the target project's `package.json`:

### Option 1: Universal NPX (npm Registry, GitHub Packages, or Direct GitHub)
```bash
# Install into current project:
npx @rafaelghif/aac-core init

# Or install into a specific target project:
npx @rafaelghif/aac-core init --target /path/to/project

# Preview planned changes without writing files:
npx @rafaelghif/aac-core upgrade --dry-run

# Non-destructive upgrade (preserves CONTEXT.md, custom hooks, and user-modified files; writes conflicts to *.aac-new):
npx @rafaelghif/aac-core upgrade

# Force overwrite modified managed files (backs up previous files to .scratch/backups/<timestamp>/):
npx @rafaelghif/aac-core upgrade --force

# Uninstall unmodified managed files (preserves CONTEXT.md and user modifications):
npx @rafaelghif/aac-core uninstall
```

### Option 2: Linux / macOS Shell (`install.sh`)
The script resolves `bin/cli.mjs` and delegates all writes to it; it never copies managed files directly.
```bash
# Recommended: download the pinned tag, inspect it, then run it:
curl -fsSL -o install.sh https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.sh
less install.sh
bash install.sh

# Non-destructive upgrade:
bash install.sh --upgrade

# Target another project / force / dry-run:
bash install.sh /path/to/your-project --upgrade --force --dry-run
AAC_REF=main bash install.sh --upgrade

# Quick one-liner (pinned tag):
curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.sh | bash
```

### Option 3: Windows PowerShell (`install.ps1`)
```powershell
# Recommended: download the pinned tag, inspect it, then run it in its own process:
Invoke-WebRequest -Uri https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.ps1 -OutFile install.ps1
notepad install.ps1
powershell -NoProfile -File .\install.ps1

# Target another directory / upgrade / force / dry-run:
powershell -NoProfile -File .\install.ps1 -TargetDir "C:\path\to\your-project" -Upgrade

# Pin a different ref:
$env:AAC_REF="main"; powershell -NoProfile -File .\install.ps1 -Upgrade

# Quick one-liner (pinned tag):
irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.ps1 | iex
```

### Optional: Antigravity App Scheduled Sidecar (`--with-sidecar`)
> **Note**: Sidecars are supported on **Antigravity App only**, require an explicit `--project-id <id>`, and consume AI credits when hourly scheduled conversations run.
```bash
npx @rafaelghif/aac-core init --with-sidecar --project-id "<your-antigravity-project-id>"
```

---

## Acknowledgements & Open Source Lineage

This framework adapts and builds upon patterns, workflows, and philosophies pioneered by the open-source software engineering and AI agent community:

- **[Matt Pocock](https://github.com/mattpocock)** ([`mattpocock/skills`](https://github.com/mattpocock/skills)): Foundational inspiration for agent workflow orchestration (`/grill-me`, `/to-spec`, `/to-tickets`, `/implement`), the high-density **Caveman** communication protocol, and **Ponytail** minimalist engineering principles.
- **John Ousterhout** (*A Philosophy of Software Design*): Theoretical principles behind deep modules, interface hiding, and avoiding shallow pass-through abstractions.
- **Michael Feathers** (*Working Effectively with Legacy Code*): Principles of narrow boundary seams and testability without invasive mocks.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full details.
