# Master Skill Routing Directory & Quality-First Engineering Protocols

Comprehensive operational taxonomy and decision matrix for all 64 skills in **antigravity-agents**. Defines exact trigger conditions, input requirements, output artifacts, and mandatory Quality-First invariants.

---

## 1. Quality-First Engineering Manifesto

Quality is never an afterthought or a cleanup step; it is the non-negotiable precondition of every code modification:

1. **Clarification Before Code (Never Guess, Ask First)**:
   - When requirements, schemas, credentials, or edge-case behaviors are ambiguous, **STOP**.
   - Use `ask_question` or activate [`grill-me`](../../.agents/skills/grill-me/SKILL.md) / [`grilling`](../../.agents/skills/grilling/SKILL.md). Never invent throwaway assumptions.
2. **Zero Dummy, Mock, or Fake Artifacts in Production**:
   - Strict ban on placeholder stubs (`"dummy-id"`, `"fake-token"`, `status: "fake"`, `// TODO`).
   - Wire genuine database adapters, live API clients, and real environment variables (`.env.example`).
   - Restrict all synthetic fixtures, stubs, and spies exclusively to test files (`*.test.*`, `*.spec.*`, `tests/fixtures/`).
3. **Mandatory Automated Test Proof (Red-Green Loop)**:
   - Non-trivial features and bug fixes must leave automated regression proof behind.
   - Run tests via `run_command` and verify passes before concluding turns.
4. **Deep Module Seams & Clean Architecture**:
   - Keep domain cores 100% pure (zero framework/database driver imports).
   - Design deep modules: substantial implementation leverage hidden behind minimal, stable public interfaces.
5. **Human-Readable & Strict DRY Code**:
   - Intention-revealing naming (no single-letter or cryptic variables).
   - Flatten control flow with early guard clauses (max nesting depth: 2–3).
   - Centralize shared logic, validation schemas, and domain constants in single sources of truth.

---

## 2. Master Lifecycle Decision Flowchart

```
                          ┌─────────────────────────────┐
                          │ User Request / Work Intent  │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     [Unclear / Ambiguous Intent]                   [Clear / Specific Intent]
                 │                                               │
        ┌────────┴────────┐                         ┌────────────┴────────────┐
        ▼                 ▼                         ▼                         ▼
   [Need Choice]    [Need Stress-Test]        [Bug / Regression]      [Feature / Enhancement]
    `ask-matt`         `grill-me`            `diagnosing-bugs`               │
                   `grill-with-docs`                 │                        │
                                                     ▼                        ▼
                                             `surgical-patch`          [Multi-Session?]
                                                                       ┌──────┴──────┐
                                                                       ▼             ▼
                                                                     [Yes]          [No]
                                                                  `wayfinder`   `implement`
                                                                  `to-spec`       (`tdd`)
                                                                  `to-tickets`
                                                                       │
                                                                       ▼
                                                               `implement-spec`
```

---

## 3. Comprehensive Skill Directory (All 64 Skills)

### Phase 0: Orientation, Exploration & Routing
- [`ask-matt`](../../.agents/skills/ask-matt/SKILL.md): Master workflow router. Use when unsure which skill or path to follow.
- [`caveman-explore`](../../.agents/skills/caveman-explore/SKILL.md): Read-only repository explorer for cold-start orientation. Uses research subagent to return compact `path:line` citations.
- [`research`](../../.agents/skills/research/SKILL.md): Investigates questions against primary documentation and writes findings to markdown.

### Phase 1: Clarification, Interviewing & Planning
- [`grill-me`](../../.agents/skills/grill-me/SKILL.md): Relentless interview to clarify and stress-test ideas before code (stateless).
- [`grill-with-docs`](../../.agents/skills/grill-with-docs/SKILL.md): Stateful interview that records ADRs and updates domain glossary in [CONTEXT.md](../../CONTEXT.md).
- [`grilling`](../../.agents/skills/grilling/SKILL.md): Core decision-tree interview primitive. Maps decision frontiers and eliminates assumptions.
- [`to-spec`](../../.agents/skills/to-spec/SKILL.md): Synthesizes conversation and codebase understanding into production-grade PRD specifications.
- [`to-tickets`](../../.agents/skills/to-tickets/SKILL.md): Breaks PRDs into tracer-bullet vertical slices declaring dependency edges and verification commands.
- [`wayfinder`](../../.agents/skills/wayfinder/SKILL.md): Maps large, ambiguous multi-session initiatives into decision graphs on the issue tracker.
- [`to-questionnaire`](../../.agents/skills/to-questionnaire/SKILL.md): Formats unanswered architectural questions into structured questionnaires for external stakeholders.
- [`loop-me`](../../.agents/skills/loop-me/SKILL.md): Specifies workflows and recurring automation loops.
- [`prototype`](../../.agents/skills/prototype/SKILL.md): Builds throwaway prototypes to answer design, state-machine, or UI questions.

### Phase 2: Architecture & Domain Modeling
- [`domain-modeling`](../../.agents/skills/domain-modeling/SKILL.md): Sharpens domain language, defines bounded contexts, and records ADRs.
- [`codebase-design`](../../.agents/skills/codebase-design/SKILL.md): Core vocabulary and patterns for deep modules, interface depth, and public seams.
- [`improve-codebase-architecture`](../../.agents/skills/improve-codebase-architecture/SKILL.md): Scans codebase for deepening opportunities, shallow wrappers, and architectural debt.
- [`setup-ts-deep-modules`](../../.agents/skills/setup-ts-deep-modules/SKILL.md): Enforces architectural module boundaries using dependency-cruiser.

### Phase 3: Quality-First Implementation & Refactoring
- [`implement`](../../.agents/skills/implement/SKILL.md): Rigorous 5-phase feature implementation driving TDD, code review, and quality gates.
- [`implement-spec`](../../.agents/skills/implement-spec/SKILL.md): Implements an entire multi-ticket spec using concurrent isolated subagents.
- [`tdd`](../../.agents/skills/tdd/SKILL.md): Test-driven red-green-refactor loop. Test behavior through public seams with zero test mocks in production.
- [`safe-refactor`](../../.agents/skills/safe-refactor/SKILL.md): Restructures code preserving external behavior using bracketed verification and micro-transformations.
- [`surgical-patch`](../../.agents/skills/surgical-patch/SKILL.md): Narrow bug fix targeting the shared root cause with zero scope creep.
- [`lean-build`](../../.agents/skills/lean-build/SKILL.md): Builds narrow feature slices with high overbuilding risk, maximizing codebase reuse.
- [`migration`](../../.agents/skills/migration/SKILL.md): Reversible, compatibility-safe database schema and API protocol migrations.
- [`migrate-to-shoehorn`](../../.agents/skills/migrate-to-shoehorn/SKILL.md): Replaces unsafe TypeScript `as` casts in test suites with `@total-typescript/shoehorn`.
- [`scaffold-exercises`](../../.agents/skills/scaffold-exercises/SKILL.md): Scaffolds clean exercise structures with section problems, solutions, and explainers.
- [`starter-skill`](../../.agents/skills/starter-skill/SKILL.md): Standard template for authoring new workspace procedures and skills.

### Phase 4: Verification, Review & Auditing
- [`code-review`](../../.agents/skills/code-review/SKILL.md): Two-axis review of git diffs: Standards (coding guidelines & Fowler code smells) and Spec conformance.
- [`verify-and-stop`](../../.agents/skills/verify-and-stop/SKILL.md): Proves existing work satisfies acceptance criteria and quality gates without expanding scope.
- [`ponytail-review`](../../.agents/skills/ponytail-review/SKILL.md): Code review hunting over-engineering, dead flexibility, and reinvented standard library.
- [`ponytail-audit`](../../.agents/skills/ponytail-audit/SKILL.md): Whole-repo audit scanning for bloat, unnecessary abstractions, and unused dependencies.
- [`ponytail-debt`](../../.agents/skills/ponytail-debt/SKILL.md): Harvests `ponytail:` shortcut comments into an actionable technical debt ledger.
- [`caveman-review`](../../.agents/skills/caveman-review/SKILL.md): Ultra-compressed code review delivering one-line findings with exact line references and fixes.
- [`triage`](../../.agents/skills/triage/SKILL.md): Triages raw issues through canonical roles (`needs-triage`, `ready-for-agent`, `ready-for-human`, `wontfix`).

### Phase 5: Investigation & Diagnostics
- [`diagnosing-bugs`](../../.agents/skills/diagnosing-bugs/SKILL.md): Scientific diagnosis loop establishing a tight reproduction loop before proposing fixes.
- [`investigate-first`](../../.agents/skills/investigate-first/SKILL.md): Diagnoses ambiguous failures and builds evidence-ranked hypotheses before editing files.

### Phase 6: Environment, Git & Safety Guardrails
- [`git-guardrails`](../../.agents/skills/git-guardrails/SKILL.md): Intercepts destructive git commands before terminal execution via PreToolUse lifecycle hooks.
- [`setup-pre-commit`](../../.agents/skills/setup-pre-commit/SKILL.md): Configures Husky pre-commit hooks with lint-staged, type checking, and automated tests.
- [`setup-matt-pocock-skills`](../../.agents/skills/setup-matt-pocock-skills/SKILL.md): Initializes issue tracker integration, triage labels, and domain doc layouts.
- [`resolving-merge-conflicts`](../../.agents/skills/resolving-merge-conflicts/SKILL.md): Resolves in-progress git merge/rebase conflicts by intent traced to primary sources.
- [`wizard`](../../.agents/skills/wizard/SKILL.md): Generates interactive bash/PowerShell wizards for human-in-the-loop setup and secrets.

### Phase 7: Session Continuity & Subagent Delegation
- [`handoff`](../../.agents/skills/handoff/SKILL.md): Compacts session state into `.scratch/handoff.md` for seamless cross-session rehydration.
- [`subagent-handoff`](../../.agents/skills/subagent-handoff/SKILL.md): Delegates the session asynchronously to an autonomous background subagent.
- [`cavecrew`](../../.agents/skills/cavecrew/SKILL.md): Orchestrates specialized subagents (investigator, builder, reviewer) with compressed output contracts.
- [`retro`](../../.agents/skills/retro/SKILL.md): Retrospective analysis to refine rules, skills, and agent operational performance.

### Phase 8: Ponytail Minimalist Ladder
- [`ponytail`](../../.agents/skills/ponytail/SKILL.md): Forces simplest solution that works: YAGNI -> reuse -> stdlib -> native -> one-liner -> minimum code.
- [`ponytail-gain`](../../.agents/skills/ponytail-gain/SKILL.md): Compact scoreboard displaying measured code and token savings.
- [`ponytail-help`](../../.agents/skills/ponytail-help/SKILL.md): Quick reference card for all ponytail modes, skills, and commands.

### Phase 9: Caveman & Token Observability
- [`caveman`](../../.agents/skills/caveman/SKILL.md): Ultra-compressed terse communication mode eliminating conversational fluff while preserving technical accuracy.
- [`caveman-commit`](../../.agents/skills/caveman-commit/SKILL.md): Writes concise, intent-only Conventional Commits messages.
- [`caveman-compress`](../../.agents/skills/caveman-compress/SKILL.md): Compresses markdown memory files into caveman format to save ~46% context tokens.
- [`caveman-discover`](../../.agents/skills/caveman-discover/SKILL.md): Discovers and labels LLM workflows across the codebase for cost attribution.
- [`caveman-evidence-review`](../../.agents/skills/caveman-evidence-review/SKILL.md): Read-only inspection of LLM traces, latency, error rates, and token cost.
- [`caveman-help`](../../.agents/skills/caveman-help/SKILL.md): Quick-reference card for caveman modes, triggers, and configuration.
- [`caveman-learn`](../../.agents/skills/caveman-learn/SKILL.md): Acts on token cost reports and trims heavy rules or memory files.
- [`caveman-manage`](../../.agents/skills/caveman-manage/SKILL.md): Inspects and manages lifecycle of Caveman experiments.
- [`caveman-optimize`](../../.agents/skills/caveman-optimize/SKILL.md): Evaluates optimization candidates against baseline evaluations.
- [`caveman-setup`](../../.agents/skills/caveman-setup/SKILL.md): Configures repository through Caveman Cloud observability gateway.
- [`caveman-stats`](../../.agents/skills/caveman-stats/SKILL.md): Computes real session token usage and estimated savings from transcripts.

### Phase 10: Education & Content Authoring
- [`teach`](../../.agents/skills/teach/SKILL.md): Multi-session technical curriculum and guided learning workspace.
- [`wait-what`](../../.agents/skills/wait-what/SKILL.md): Re-explains concepts in plain English using ASD-STE100 Simplified Technical English.
- [`writing-for-agents`](../../.agents/skills/writing-for-agents/SKILL.md): Reference standard for authoring skills, rules, and agent instructions.
- [`writing-beats`](../../.agents/skills/writing-beats/SKILL.md): Structures raw technical notes into grounded conceptual beats.
- [`writing-fragments`](../../.agents/skills/writing-fragments/SKILL.md): Brainstorms content and mines atomic fragments without premature structure.
- [`writing-shape`](../../.agents/skills/writing-shape/SKILL.md): Shapes unstructured notes into polished, cohesive narrative articles.
