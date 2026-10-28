<div align="center">

<img src="assets/banner.png" alt="AAC (Antigravity Agent Core) Banner" width="100%" />

# Antigravity Engineering Agent (V6)

**Plug-and-play Principal Software Engineering & Technical Scrum constitution, progressive-disclosure rules, focused deep-module skills, native subagents, cross-platform Node lifecycle hooks, and scheduled sidecars for Google Antigravity.**

<p align="center">
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-6.0.0-blue.svg?style=for-the-badge&logo=git" alt="Version 6.0.0" /></a>
  <a href="https://antigravity.google/docs"><img src="https://img.shields.io/badge/platform-Google_Antigravity_2.0-8A2BE2.svg?style=for-the-badge&logo=google" alt="Platform" /></a>
  <a href="https://antigravity.google/docs/rules-workflows"><img src="https://img.shields.io/badge/adaptive_for-Gemini_Flash_%E2%80%A2_Argon_4-0052CC.svg?style=for-the-badge&logo=googlecloud" alt="Gemini Flash & Argon 4" /></a>
  <a href="#v5--v6-evolution--consolidation-matrix"><img src="https://img.shields.io/badge/architecture-deep_modules-success.svg?style=for-the-badge" alt="Deep Modules" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge" alt="License: MIT" /></a>
</p>

</div>

---

## Core Design Principles (V6 Enterprise Architecture)

1. **Savage Gen-Z Principal Engineer Persona ("Strictly Not a Yes-Man")**: Fun, unfiltered, blak-blakan (allowed to roast bad ideas, spaghetti code, or YAGNI over-engineering), zero corporate sycophancy (`[Roast & Premise Flaw] -> [Production Failure Mode] -> [Superior Engineering Alternative]`). Supports `AAC_PERSONA=neutral` for teams wanting formal enterprise tone.
2. **User-Defined Architecture (Interview First, Zero Static Dogma)**: Never imposes a static folder hierarchy, rigid layer dogma, or assumed manifest stack. Discovers existing repo structure dynamically and **interviews the user first** (`ask_question` / `/grill-me`) whenever architecture, stack, or module topology are open.
3. **The 6 Non-Negotiable Engineering Pillars**: Defined once in `AGENTS.md` §3—every design and diff is stress-tested to be **Future-Proof, Scalable, Maintainable, Secure, High-Performance, and Upgradeable**.
4. **Expert Technical Scrum & Multi-Session Continuity**:
   - `/to-tickets` generates a committed **Scrum Sprint Wave Board (`docs/sprint/SPRINT.md`)** and session-sized vertical tracer-bullet tickets (`docs/sprint/tickets/<NN>-<slug>.md`) with **Definition of Ready (DoR)**, **Execution Waves (DAG)**, and **Definition of Done (DoD)**.
   - `/implement` executes 1 unblocked ticket test-first, commits atomically, updates the ticket's `Session Handover & Completion Log`, and promotes newly unblocked tickets in `docs/sprint/SPRINT.md`.
   - `/handoff` checkpoints sprint progress, downstream seam notes, and the exact next command into `.scratch/handoff.md`.
5. **Cross-Platform Tested Hooks & Contained Subagents**:
   - `.agents/hooks.json` uses cross-platform `node -e` JSON parsers (`SessionStart` cold-start sprint/handoff detector, `PreToolUse` git destructive guard & production no-mock guard with `decision: "ask"`).
   - `.agents/agents/*.md` subagents run with `commandExecutionPolicy: sandbox` (or `off` for `codebase-investigator`).
6. **Non-Destructive SHA-256 Manifest Installer**:
   - Tracks managed files in `.agents/.aac-manifest.json`.
   - `upgrade` preserves `CONTEXT.md` and never overwrites user-modified `AGENTS.md`, rules, skills, or agents unless `--force` is passed (backs up to `.scratch/backups/<timestamp>/` and writes incoming updates to `<file>.aac-new`).

---

## V5 → V6 Evolution & Consolidation Matrix

AAC V6 consolidates 64 legacy fragmented skills into a cohesive, deep-module architecture, eliminating cognitive noise, redundant variants, and token bloat while upgrading core engineering workflows:

| Legacy V5 Area (64 Skills Bloat) | V6 Consolidated Architecture | Primary Seams & Purpose |
| :--- | :--- | :--- |
| **Caveman Suite** (14 fragmented skills: `caveman-discover`, `caveman-learn`, `caveman-manage`, etc.) | **Progressive Rule (`caveman.md`)** | Zero-fluff, high-signal communication & token-efficient Gen-Z engineering protocol without prompt bloat. |
| **Ponytail Suite** (6 fragmented skills: `ponytail-debt`, `ponytail-gain`, `ponytail-audit`, etc.) | **Progressive Rule (`ponytail.md`)** | 7-Rung Minimalist Ladder, root-cause caller mapping, and surgical in-place edits. |
| **Grilling Variants** (3 skills: `grill-me`, `grilling`, `grill-with-docs`) | **Unified `/grill-me` Skill** | Interactive one-question-at-a-time interview with `(Recommended)` first slot to define architecture & stress-test designs. |
| **Scattered Implementation** (`implement`, `implement-spec`, `lean-build`, `prototype`) | **Technical Scrum Wave Engine (`/to-tickets`, `/implement`, `/handoff`)** | Vertical tracer-bullet tickets with Execution Waves DAG (`docs/sprint/SPRINT.md`), DoR, DoD, and cross-session handover. |
| **Review & Verification Scripts** (`code-analyzer`, `quality-guard`, `security-scanner`) | **3 Native Subagents & Automated Suite** | Sandboxed `adversarial-reviewer`, `codebase-investigator`, `verification-runner`, plus `tests/aac.test.mjs`. |
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

## Repository Structure

```text
antigravity-agent/
├── AGENTS.md                                  # Always-on Savage Gen-Z Principal Engineer & 6-Pillar Rules
├── CONTEXT.md                                 # User-Defined Architecture, Stack & Domain Glossary
├── package.json                               # NPX & GitHub Packages distributor (@rafaelghif/aac-core v6.0.0)
├── bin/cli.mjs                                # Non-destructive SHA-256 manifest CLI (init / upgrade / uninstall)
├── install.sh                                 # Linux / macOS installer (delegates to bin/cli.mjs when Node is present)
├── install.ps1                                # Windows PowerShell installer (delegates to bin/cli.mjs when Node is present)
├── tests/aac.test.mjs                         # Automated test suite (CLI, hooks bypass corpus, frontmatter, packaging)
├── LICENSE                                    # MIT License
├── SECURITY.md                                # Threat model & vulnerability disclosure policy
├── CHANGELOG.md                               # Release history
├── .github/workflows/publish-package.yml      # Matrix CI verification + provenance publishing
├── assets/
│   └── banner.png                             # Official repository banner
├── docs/
│   ├── adr/                                   # Architecture Decision Records
│   └── agents/                                # Antigravity platform reference & domain specs
└── .agents/
    ├── hooks.json                             # Cross-platform Node JSON lifecycle hooks (SessionStart, PreToolUse)
    ├── sidecars/repo-health/sidecar.json      # Antigravity App scheduled sidecar template
    ├── rules/                                 # 9 Modular Rules (flat directory)
    │   ├── coding-standards.md                # DRY, KISS, YAGNI, SOLID/SRP, Clean Code (always_on)
    │   ├── architecture-and-flow.md           # User-Defined Architecture, Deep Modules, E2E Flow (always_on)
    │   ├── ponytail.md                        # 7-Rung Minimalist Ladder, Root Cause & Surgical Edits (always_on)
    │   ├── caveman.md                         # Savage Gen-Z high-signal style & persona switch (always_on)
    │   ├── database-migrations.md             # Expand-contract, CONCURRENTLY outside tx, SQL safety (model_decision)
    │   ├── security-and-auth.md               # BOLA/IDOR, idempotency, atomic locks, full SSRF defense (model_decision)
    │   ├── git-and-context.md                 # Conventional atomic commits, CONTEXT.md, Sprint Board (model_decision)
    │   ├── testing.md                         # Public-seam assertions, hermeticity, boundary coverage (glob)
    │   └── release-audit.md                   # Pre-release production readiness rubric (manual @mention)
    ├── skills/                                # 13 Focused Single-Responsibility Skills
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
    └── agents/                                # 3 Native Custom Subagents (commandExecutionPolicy: sandbox / off)
        ├── codebase-investigator.md           # Fast read-only recon & blast-radius tracer (model: flash, policy: off)
        ├── adversarial-reviewer.md            # Independent Savage Red-Team diff & 6-Pillar critic (policy: sandbox)
        └── verification-runner.md             # Isolated build, lint, typecheck & test runner (policy: sandbox)
```

---

## Quick Start (Multi-Platform Installation, Upgrade & Uninstall)

Install or upgrade into **any project** without touching the target project's `package.json`:

### Option 1: Universal NPX (npm Registry, GitHub Packages, or Direct GitHub)
```bash
# Install via npm Registry:
npx @rafaelghif/aac-core init

# Or via GitHub Packages (after configuring @rafaelghif:registry=https://npm.pkg.github.com):
npx @rafaelghif/aac-core init

# Or directly from GitHub:
npx github:rafaelghif/antigravity-agents-core init

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
```bash
# Remote install:
curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash

# Remote non-destructive upgrade:
curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash -s -- --upgrade

# Local install / dry-run / upgrade:
bash /path/to/antigravity-agent/install.sh /path/to/your-project [--upgrade] [--force] [--dry-run]
```

### Option 3: Windows PowerShell (`install.ps1`)
```powershell
# Remote install:
irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex

# Remote non-destructive upgrade:
$env:AAC_UPGRADE="1"; irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex

# Local install:
powershell -File .\install.ps1 -TargetDir "C:\path\to\your-project" [-Upgrade] [-Force] [-DryRun]
```

### Optional: Antigravity App Scheduled Sidecar (`--with-sidecar`)
> **Note**: Sidecars are supported on **Antigravity App only**, require an explicit `--project-id <id>`, and consume AI credits when hourly scheduled conversations run.
```bash
npx @rafaelghif/aac-core init --with-sidecar --project-id "<your-antigravity-project-id>"
```
