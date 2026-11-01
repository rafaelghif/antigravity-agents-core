#!/usr/bin/env bash
# AAC (Antigravity Agent Core V6) — installer for Linux / macOS.
#
# Requires Node.js >= 22: bin/cli.mjs is the only component that writes managed files, and
# .agents/hooks.json runs `node -e` guards at runtime. Without Node the hooks cannot execute,
# so there is no supported "no-Node" install path.
#
# Recommended (download, inspect, then run — no remote code is executed sight-unseen):
#   curl -fsSL -o install.sh https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.0.0/install.sh
#   less install.sh
#   bash install.sh [target_dir] [--upgrade] [--force] [--dry-run] [--with-sidecar --project-id <id>]
#
# Optional one-liner (same pinned tag; never a mutable branch):
#   curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.0.0/install.sh | bash -s -- [args]
#
# Pin a different ref explicitly: AAC_REF=main bash install.sh

set -euo pipefail

REPO="rafaelghif/antigravity-agents-core"
AAC_REF="${AAC_REF:-v6.0.0}"

case "$AAC_REF" in
  ''|*..*|*[!A-Za-z0-9._/-]*)
    echo "❌ Invalid AAC_REF: '$AAC_REF' (allowed: letters, digits, dot, underscore, dash, slash)." >&2
    exit 1 ;;
esac

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
    -h|--help)
      echo "Usage: bash install.sh [target_dir] [--upgrade] [--force] [--dry-run] [--with-sidecar --project-id <id>]"
      exit 0 ;;
    -*)
      echo "❌ Unknown flag: $1" >&2
      echo "Usage: bash install.sh [target_dir] [--upgrade] [--force] [--dry-run] [--with-sidecar --project-id <id>]" >&2
      exit 1 ;;
    *) TARGET_DIR="$1"; shift ;;
  esac
done

TARGET_DIR="${TARGET_DIR:-$(pwd)}"

if [ "$WITH_SIDECAR" = true ] && [ -z "$PROJECT_ID" ]; then
  echo "❌ --with-sidecar requires --project-id <id> (or AAC_PROJECT_ID)." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js >= 22 is required (the AAC CLI and lifecycle hooks are Node programs)." >&2
  echo "   Install it from https://nodejs.org, then re-run this installer." >&2
  exit 1
fi

if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)'; then
  echo "❌ Node.js >= 22 is required; found $(node -p 'process.versions.node')." >&2
  exit 1
fi

SCRIPT_DIR=""
if [ -n "${BASH_SOURCE[0]:-}" ] && [ -f "${BASH_SOURCE[0]}" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" 2>/dev/null && pwd -P || true)"
fi

TEMP_DIR=""
cleanup() {
  if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
  fi
}
trap cleanup EXIT

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/bin/cli.mjs" ]; then
  SOURCE_DIR="$SCRIPT_DIR"
else
  TEMP_DIR="$(mktemp -d)"
  ARCHIVE="https://github.com/$REPO/archive/$AAC_REF.tar.gz"
  echo "Downloading AAC $AAC_REF..."
  if ! curl -fsSL "$ARCHIVE" -o "$TEMP_DIR/aac.tar.gz"; then
    echo "❌ Download failed: $ARCHIVE" >&2
    echo "   Check the ref (AAC_REF=$AAC_REF) and your network, or clone the repo and run 'bash install.sh' from it." >&2
    exit 1
  fi
  if ! tar -xzf "$TEMP_DIR/aac.tar.gz" -C "$TEMP_DIR"; then
    echo "❌ Could not extract $ARCHIVE (corrupt or partial download)." >&2
    exit 1
  fi
  # `-quit` avoids a `| head -n 1` pipeline, which can SIGPIPE `find` under `set -o pipefail`.
  SOURCE_DIR="$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d -print -quit)"
fi

if [ -z "${SOURCE_DIR:-}" ] || [ ! -f "$SOURCE_DIR/bin/cli.mjs" ]; then
  echo "❌ AAC $AAC_REF does not contain bin/cli.mjs; refusing to continue." >&2
  exit 1
fi

CLI_CMD="init"
[ "$UPGRADE" = true ] && CLI_CMD="upgrade"
CLI_ARGS=("$CLI_CMD" "--target" "$TARGET_DIR")
[ "$FORCE" = true ] && CLI_ARGS+=("--force")
[ "$DRY_RUN" = true ] && CLI_ARGS+=("--dry-run")
if [ "$WITH_SIDECAR" = true ]; then
  CLI_ARGS+=("--with-sidecar" "--project-id" "$PROJECT_ID")
fi

# Deliberately not `exec`: replacing the shell would skip the EXIT trap and leak the temp archive.
node "$SOURCE_DIR/bin/cli.mjs" "${CLI_ARGS[@]}"
