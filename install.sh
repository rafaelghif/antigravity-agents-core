#!/usr/bin/env bash
# AAC (Antigravity Agent Core V6) — Multi-Mode Installer for Linux / macOS
# Usage:
#   Remote Install: curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash
#   Remote Upgrade: curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash -s -- --upgrade
#   Local Install:  bash install.sh [target_dir] [--upgrade] [--force] [--dry-run] [--with-sidecar --project-id <id>]

set -euo pipefail

UPGRADE=false
FORCE=false
DRY_RUN=false
WITH_SIDECAR=false
PROJECT_ID="${AAC_PROJECT_ID:-}"
TARGET_DIR=""

while [ $# -gt 0 ]; do
  case "$1" in
    --upgrade|-u) UPGRADE=true; shift ;;
    --force|-f) FORCE=true; shift ;;
    --dry-run) DRY_RUN=true; shift ;;
    --with-sidecar) WITH_SIDECAR=true; shift ;;
    --project-id)
      [ $# -lt 2 ] && { echo "❌ --project-id requires a value" >&2; exit 1; }
      PROJECT_ID="$2"; shift 2 ;;
    --project-id=*) PROJECT_ID="${1#*=}"; shift ;;
    -*)
      echo "❌ Unknown flag: $1" >&2
      echo "Usage: bash install.sh [target_dir] [--upgrade] [--force] [--dry-run] [--with-sidecar --project-id <id>]" >&2
      exit 1 ;;
    *) TARGET_DIR="$1"; shift ;;
  esac
done

TARGET_DIR="${TARGET_DIR:-$(pwd)}"
if [ "$DRY_RUN" = false ]; then
  mkdir -p "$TARGET_DIR"
  TARGET_DIR="$(cd "$TARGET_DIR" && pwd -P)"
fi

if [ "$WITH_SIDECAR" = true ] && [ -z "$PROJECT_ID" ]; then
  echo "❌ --with-sidecar requires --project-id <id> (or AAC_PROJECT_ID)." >&2
  exit 1
fi

SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd -P || true)"
fi

TEMP_DIR=""
cleanup() {
  if [ -n "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

if [ -n "$SCRIPT_DIR" ] && [ -d "$SCRIPT_DIR/.agents" ]; then
  SOURCE_DIR="$SCRIPT_DIR"
else
  REPO_ARCHIVE="${ANTIGRAVITY_REPO_ARCHIVE:-https://github.com/rafaelghif/antigravity-agents-core/archive/refs/tags/v6.0.0.tar.gz}"
  FALLBACK_ARCHIVE="https://github.com/rafaelghif/antigravity-agents-core/archive/refs/heads/main.tar.gz"
  TEMP_DIR="$(mktemp -d)"
  echo "Downloading AAC v6.0.0..."
  if ! curl -fsSL "$REPO_ARCHIVE" | tar -xz -C "$TEMP_DIR" 2>/dev/null; then
    curl -fsSL "$FALLBACK_ARCHIVE" | tar -xz -C "$TEMP_DIR"
  fi
  SOURCE_DIR="$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
fi

if command -v node >/dev/null 2>&1 && [ -f "$SOURCE_DIR/bin/cli.mjs" ]; then
  CLI_CMD="init"
  [ "$UPGRADE" = true ] && CLI_CMD="upgrade"
  CLI_ARGS=("$CLI_CMD" "--target" "$TARGET_DIR")
  [ "$FORCE" = true ] && CLI_ARGS+=("--force")
  [ "$DRY_RUN" = true ] && CLI_ARGS+=("--dry-run")
  if [ "$WITH_SIDECAR" = true ]; then
    CLI_ARGS+=("--with-sidecar" "--project-id" "$PROJECT_ID")
  fi
  exec node "$SOURCE_DIR/bin/cli.mjs" "${CLI_ARGS[@]}"
fi

if [ "$DRY_RUN" = true ]; then
  echo "[dry-run] Would install AAC v6.0.0 into $TARGET_DIR"
  exit 0
fi

if [ "$TARGET_DIR" != "$SOURCE_DIR" ]; then
  mkdir -p "$TARGET_DIR/.agents/rules" "$TARGET_DIR/.agents/skills" "$TARGET_DIR/.agents/agents" "$TARGET_DIR/.agents/sidecars" "$TARGET_DIR/.scratch"
  cp -rf "$SOURCE_DIR/.agents/rules/." "$TARGET_DIR/.agents/rules/"
  cp -rf "$SOURCE_DIR/.agents/skills/." "$TARGET_DIR/.agents/skills/"
  cp -rf "$SOURCE_DIR/.agents/agents/." "$TARGET_DIR/.agents/agents/"
  cp -rf "$SOURCE_DIR/.agents/sidecars/." "$TARGET_DIR/.agents/sidecars/"
  [ ! -f "$TARGET_DIR/.agents/hooks.json" ] || [ "$FORCE" = true ] && cp -f "$SOURCE_DIR/.agents/hooks.json" "$TARGET_DIR/.agents/hooks.json"

  if [ ! -f "$TARGET_DIR/AGENTS.md" ] || [ "$FORCE" = true ]; then
    cp -f "$SOURCE_DIR/AGENTS.md" "$TARGET_DIR/AGENTS.md"
  else
    cp -f "$SOURCE_DIR/AGENTS.md" "$TARGET_DIR/AGENTS.md.aac-new"
  fi

  if [ ! -f "$TARGET_DIR/CONTEXT.md" ] && [ -f "$SOURCE_DIR/CONTEXT.md" ]; then
    cp "$SOURCE_DIR/CONTEXT.md" "$TARGET_DIR/CONTEXT.md"
  fi

  if [ ! -f "$TARGET_DIR/.scratch/.gitkeep" ]; then
    printf "# Ephemeral scratchpad\n" > "$TARGET_DIR/.scratch/.gitkeep"
  fi

  GITIGNORE="$TARGET_DIR/.gitignore"
  if [ ! -f "$GITIGNORE" ] || ! grep -qF ".scratch/*" "$GITIGNORE"; then
    printf "\n# Antigravity Ephemeral State & Secrets\n.scratch/*\n!.scratch/.gitkeep\n.agents/mcp_config.json\n" >> "$GITIGNORE"
  fi
  echo "✅ AAC v6.0.0 ready."
fi
