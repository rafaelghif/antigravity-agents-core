---
trigger: always_on
---

# Git Workflow & Commit Guidelines

These guidelines standardize git history and branch integration in this repository.

---

## 1. Conventional Commits

Use standard conventional commit prefixes:
- `feat: <description>`: New features or capabilities
- `fix: <description>`: Bug fixes and defect corrections
- `docs: <description>`: Documentation additions or updates
- `refactor: <description>`: Code restructuring without changing external behavior
- `chore: <description>`: Maintenance tasks, build scripts, configuration changes
- `test: <description>`: Unit or integration test additions and updates

---

## 2. Atomic Commits

- Ensure each commit represents a single logical unit of change.
- Do not mix cosmetic reformatting with functional logic updates in the same commit.
- Keep the repository in a compilable, testable state across all commits.

---

## 3. Git Worktrees & VCS Panel Integration

- **Worktree Concurrency**:
  - Prefer Git worktrees when running parallel agentic tasks or background subagent spikes to preserve working tree cleanliness.
- **VCS Panel Alignment**:
  - Structure commits so diffs in the Antigravity VCS panel remain atomic, self-explanatory, and segregated between functional logic and tooling.
