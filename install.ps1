# AAC (Antigravity Agent Core) Installer for Windows PowerShell
# Usage:
#   Local:  powershell -ExecutionPolicy Bypass -File install.ps1
#   Remote: irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex

param(
    [switch]$Upgrade
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$targetDir = Get-Location

$actionText = if ($Upgrade) { "Upgrading" } else { "Installing" }
Write-Host "`n🚀 $actionText AAC (Antigravity Agent Core v5.3.0)..." -ForegroundColor Cyan
Write-Host "Target: $targetDir`n" -ForegroundColor Gray

$repoUrl = "https://github.com/rafaelghif/antigravity-agents-core/archive/refs/heads/main.zip"
$tempZip = Join-Path ([System.IO.Path]::GetTempPath()) "aac-main.zip"
$tempExtract = Join-Path ([System.IO.Path]::GetTempPath()) "aac-temp"

try {
    $sourceRoot = $null
    if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot ".agents"))) {
        $sourceRoot = $PSScriptRoot
        Write-Host "📦 Using local framework source: $sourceRoot" -ForegroundColor Yellow
    } else {
        Write-Host "📥 Downloading framework archive from GitHub..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri $repoUrl -OutFile $tempZip -UseBasicParsing

        if (Test-Path $tempExtract) {
            Remove-Item -Recurse -Force $tempExtract
        }

        Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        $sourceRoot = (Get-ChildItem -Directory -Path $tempExtract | Select-Object -First 1).FullName
    }

    if (-not $sourceRoot -or -not (Test-Path $sourceRoot)) {
        Write-Host "❌ Error: Framework source directory could not be resolved." -ForegroundColor Red
        return
    }

    if ((Resolve-Path $targetDir).Path -eq (Resolve-Path $sourceRoot).Path) {
        Write-Host "ℹ️ Target directory is the framework source repository itself (nothing to scaffold)." -ForegroundColor Cyan
        return
    }

    # Backup existing hooks.json before .agents/ copy if upgrading
    $existingHooks = $null
    $targetHooksPath = Join-Path $targetDir ".agents\hooks.json"
    if (Test-Path $targetHooksPath) {
        try {
            $existingHooks = Get-Content $targetHooksPath -Raw | ConvertFrom-Json
        } catch { }
    }

    # 1. Copy .agents directory
    Write-Host "📦 Synchronizing .agents/ (rules, skills, hooks, plugins)..." -ForegroundColor Yellow
    Copy-Item -Path (Join-Path $sourceRoot ".agents") -Destination $targetDir -Recurse -Force

    # Smart-merge hooks.json if it existed
    if ($existingHooks -and (Test-Path $targetHooksPath)) {
        try {
            $newHooks = Get-Content $targetHooksPath -Raw | ConvertFrom-Json
            foreach ($prop in $newHooks.PSObject.Properties) {
                if (-not $existingHooks.PSObject.Properties[$prop.Name]) {
                    $existingHooks | Add-Member -MemberType NoteProperty -Name $prop.Name -Value $prop.Value
                } else {
                    $userEnabled = $existingHooks.($prop.Name).enabled
                    $val = $prop.Value
                    if ($null -ne $userEnabled) {
                        $val.enabled = $userEnabled
                    }
                    $existingHooks.($prop.Name) = $val
                }
            }
            $existingHooks | ConvertTo-Json -Depth 10 | Set-Content -Path $targetHooksPath -Encoding UTF8
            Write-Host "🔄 Smart-merged .agents/hooks.json (retained custom hooks & user toggles)" -ForegroundColor Green
        } catch { }
    }

    # 2. Copy docs directory (ADRs, tracker configs, templates)
    $sourceDocs = Join-Path $sourceRoot "docs"
    if (Test-Path $sourceDocs) {
        Write-Host "📚 Synchronizing docs/ (ADRs, agents domain & tracker configs, templates)..." -ForegroundColor Yellow
        Copy-Item -Path $sourceDocs -Destination $targetDir -Recurse -Force
    }

    # 3. Copy root context and directives (NEVER COPY package.json)
    $rootFiles = @("AGENTS.md", "GEMINI.md", "CLAUDE.md", "skills-lock.json")
    foreach ($file in $rootFiles) {
        $src = Join-Path $sourceRoot $file
        $dst = Join-Path $targetDir $file
        if (Test-Path $src) {
            if (-not (Test-Path $dst) -or $Upgrade) {
                Copy-Item -Path $src -Destination $dst -Force
                Write-Host "📄 Synchronized $file" -ForegroundColor Green
            } else {
                Write-Host "⏩ Skipped $file (already exists)" -ForegroundColor Gray
            }
        }
    }

    # 4. Strictly protect user-owned CONTEXT.md
    $srcContext = Join-Path $sourceRoot "CONTEXT.md"
    $dstContext = Join-Path $targetDir "CONTEXT.md"
    if (Test-Path $srcContext) {
        if (-not (Test-Path $dstContext)) {
            Copy-Item -Path $srcContext -Destination $dstContext -Force
            Write-Host "📄 Created CONTEXT.md" -ForegroundColor Green
        } else {
            Write-Host "🔒 Preserved user domain context: CONTEXT.md (never overwritten)" -ForegroundColor Cyan
        }
    }

    # 4. Create .scratch directory
    $scratchDir = Join-Path $targetDir ".scratch"
    if (-not (Test-Path $scratchDir)) {
        New-Item -ItemType Directory -Path $scratchDir -Force | Out-Null
        Set-Content -Path (Join-Path $scratchDir ".gitkeep") -Value "# Ephemeral scratchpad directory" -Force
        Write-Host "📁 Created .scratch/ directory" -ForegroundColor Green
    }

    # 5. Update .gitignore (never overwrite existing)
    $gitignorePath = Join-Path $targetDir ".gitignore"
    $rulesToAppend = @"

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
"@

    if (Test-Path $gitignorePath) {
        $existing = Get-Content $gitignorePath -Raw
        if ($existing -notmatch "\.scratch/\*") {
            Add-Content -Path $gitignorePath -Value $rulesToAppend
            Write-Host "🛡️ Appended Antigravity guardrails to .gitignore" -ForegroundColor Green
        }
    } else {
        Set-Content -Path $gitignorePath -Value $rulesToAppend.Trim() -Force
        Write-Host "🛡️ Created .gitignore with Antigravity guardrails" -ForegroundColor Green
    }

    Write-Host "`n✅ Installation successful! (Zero package.json pollution)" -ForegroundColor Green
    Write-Host "👉 Open this repository in Antigravity IDE or Antigravity 2.0 to begin.`n" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Installation failed: $_" -ForegroundColor Red
} finally {
    if (Test-Path $tempZip) { Remove-Item -Force $tempZip -ErrorAction SilentlyContinue }
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue }
}
