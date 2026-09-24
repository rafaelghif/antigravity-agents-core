#!/usr/bin/env bash
# AAC (Antigravity Agent Core) Installer for Linux / macOS
# Usage:
#   Local:  bash install.sh
#   Remote: curl -fsSL https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.sh | bash

set -e

UPGRADE=false
for arg in "$@"; do
  case $arg in
    --upgrade)
      UPGRADE=true
      shift
      ;;
  esac
done

TARGET_DIR="$(pwd)"
ACTION_TEXT="Installing"
if [ "$UPGRADE" = true ]; then
  ACTION_TEXT="Upgrading"
fi

echo -e "\n🚀 ${ACTION_TEXT} AAC (Antigravity Agent Core v5.3.1)..."
echo -e "Target: ${TARGET_DIR}\n"

TEMP_ZIP="/tmp/aac-main.zip"
TEMP_DIR="/tmp/aac-temp"

cleanup() {
  rm -f "$TEMP_ZIP"
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

SCRIPT_DIR=""
if [ -n "$BASH_SOURCE" ]; then
  SCRIPT_DIR="$(cd "$(dirname "$BASH_SOURCE")" 2>/dev/null && pwd)"
fi

if [ -n "$SCRIPT_DIR" ] && [ -d "${SCRIPT_DIR}/.agents" ]; then
  SOURCE_ROOT="$SCRIPT_DIR"
  echo "📦 Using local framework source: ${SOURCE_ROOT}"
else
  echo "📥 Downloading framework archive from GitHub..."
  curl -fsSL "https://github.com/rafaelghif/antigravity-agents-core/archive/refs/heads/main.zip" -o "$TEMP_ZIP"

  rm -rf "$TEMP_DIR"
  mkdir -p "$TEMP_DIR"
  unzip -q "$TEMP_ZIP" -d "$TEMP_DIR"

  SOURCE_ROOT="$(find "$TEMP_DIR" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
fi

if [ -z "$SOURCE_ROOT" ] || [ ! -d "$SOURCE_ROOT" ]; then
  echo "❌ Error: Framework source directory could not be resolved."
  exit 1
fi

if [ "$(cd "$TARGET_DIR" && pwd -P 2>/dev/null)" = "$(cd "$SOURCE_ROOT" && pwd -P 2>/dev/null)" ]; then
  echo "ℹ️ Target directory is the framework source repository itself (nothing to scaffold)."
  exit 0
fi

# 1. Safely synchronize .agents/ directory
echo "📦 Synchronizing .agents/ (rules, skills, hooks, plugins)..."
mkdir -p "${TARGET_DIR}/.agents"

# Synchronize subdirectories
for sub in rules skills hooks plugins; do
  if [ -d "${SOURCE_ROOT}/.agents/${sub}" ]; then
    mkdir -p "${TARGET_DIR}/.agents/${sub}"
    cp -rf "${SOURCE_ROOT}/.agents/${sub}/"* "${TARGET_DIR}/.agents/${sub}/" 2>/dev/null || cp -rf "${SOURCE_ROOT}/.agents/${sub}" "${TARGET_DIR}/.agents/"
    echo "   ✔ Synchronized .agents/${sub}/"
  fi
done

# Synchronize registry files
for mf in skills.json plugins.json mcp_config.example.json; do
  if [ -f "${SOURCE_ROOT}/.agents/${mf}" ]; then
    cp -f "${SOURCE_ROOT}/.agents/${mf}" "${TARGET_DIR}/.agents/${mf}"
    echo "   ✔ Updated .agents/${mf}"
  fi
done

# Smart-merge hooks.json if it exists
if [ -f "${TARGET_DIR}/.agents/hooks.json" ] && [ -f "${SOURCE_ROOT}/.agents/hooks.json" ]; then
  if command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const srcFile = process.argv[1];
      const dstFile = process.argv[2];
      try {
        const src = JSON.parse(fs.readFileSync(srcFile, "utf8"));
        const dst = JSON.parse(fs.readFileSync(dstFile, "utf8"));
        const merged = { ...dst };
        for (const [k, v] of Object.entries(src)) {
          if (!merged[k]) {
            merged[k] = v;
          } else {
            const userEnabled = merged[k].enabled !== undefined ? merged[k].enabled : v.enabled;
            merged[k] = { ...v, enabled: userEnabled };
          }
        }
        fs.writeFileSync(dstFile, JSON.stringify(merged, null, 2) + "\n", "utf8");
      } catch (e) {}
    ' "${SOURCE_ROOT}/.agents/hooks.json" "${TARGET_DIR}/.agents/hooks.json"
    echo "   🔄 Smart-merged .agents/hooks.json (retained custom hooks & user toggles)"
  fi
elif [ -f "${SOURCE_ROOT}/.agents/hooks.json" ]; then
  cp -f "${SOURCE_ROOT}/.agents/hooks.json" "${TARGET_DIR}/.agents/hooks.json"
fi

# Strictly preserve credentials
if [ -f "${TARGET_DIR}/.agents/mcp_config.json" ]; then
  echo "   🔒 Preserved workspace secrets: .agents/mcp_config.json"
fi

# 2. Copy docs directory (ADRs, tracker configs, templates)
if [ -d "${SOURCE_ROOT}/docs" ]; then
  echo "📚 Synchronizing docs/ (ADRs, agents domain & tracker configs, templates)..."
  mkdir -p "${TARGET_DIR}/docs"
  cp -rf "${SOURCE_ROOT}/docs/"* "${TARGET_DIR}/docs/" 2>/dev/null || cp -rf "${SOURCE_ROOT}/docs" "${TARGET_DIR}/"
fi

# 3. Copy root context and directives (NEVER copy package.json)
for file in AGENTS.md GEMINI.md CLAUDE.md skills-lock.json .env.example; do
  if [ -f "${SOURCE_ROOT}/${file}" ]; then
    if [ ! -f "${TARGET_DIR}/${file}" ] || [ "$UPGRADE" = true ]; then
      cp -f "${SOURCE_ROOT}/${file}" "${TARGET_DIR}/${file}"
      echo "📄 Synchronized ${file}"
    else
      echo "⏩ Skipped ${file} (already exists)"
    fi
  fi
done

# 4. Strictly protect user-owned CONTEXT.md
if [ -f "${SOURCE_ROOT}/CONTEXT.md" ]; then
  if [ ! -f "${TARGET_DIR}/CONTEXT.md" ]; then
    cp "${SOURCE_ROOT}/CONTEXT.md" "${TARGET_DIR}/CONTEXT.md"
    echo "📄 Created CONTEXT.md"
  else
    echo "🔒 Preserved user domain context: CONTEXT.md (never overwritten)"
  fi
fi

# 4. Create .scratch directory
mkdir -p "${TARGET_DIR}/.scratch"
echo "# Ephemeral scratchpad directory" > "${TARGET_DIR}/.scratch/.gitkeep"
echo "📁 Created .scratch/ directory"

# 5. Update .gitignore
GITIGNORE="${TARGET_DIR}/.gitignore"
RULES="
# Antigravity Runtime & Ephemeral State
.gemini/
*.log
*.tmp
.scratch/*
!.scratch/.gitkeep
handoff.md

# Credentials & MCP Secrets
.agents/mcp_config.json
!.agents/mcp_config.example.json
.agents/plugins/**/mcp_config.json
!.agents/plugins/**/mcp_config.example.json
.env
.env.*
!.env.example"

if [ -f "$GITIGNORE" ]; then
  if ! grep -q "\.scratch/\*" "$GITIGNORE"; then
    echo "$RULES" >> "$GITIGNORE"
    echo "🛡️ Appended Antigravity guardrails to .gitignore"
  fi
else
  echo "$RULES" > "$GITIGNORE"
  echo "🛡️ Created .gitignore with Antigravity guardrails"
fi

echo -e "\n✅ Installation successful! (Zero package.json pollution)"
echo -e "👉 Open this repository in Antigravity IDE or Antigravity 2.0 to begin.\n"
