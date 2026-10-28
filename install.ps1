# AAC (Antigravity Agent Core V6) — Windows PowerShell Installer
# Usage:
#   Remote Install: irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex
#   Remote Upgrade: $env:AAC_UPGRADE="1"; irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/main/install.ps1 | iex
#   Local Install:  powershell -File .\install.ps1 [-TargetDir <path>] [-Upgrade] [-Force] [-DryRun] [-WithSidecar] [-ProjectId <id>]

param(
    [string]$TargetDir = (Get-Location).Path,
    [switch]$Upgrade = ($env:AAC_UPGRADE -eq "1"),
    [switch]$Force = ($env:AAC_FORCE -eq "1"),
    [switch]$DryRun = ($env:AAC_DRY_RUN -eq "1"),
    [switch]$WithSidecar = ($env:AAC_SIDECAR -eq "1"),
    [string]$ProjectId = $env:AAC_PROJECT_ID
)

$ErrorActionPreference = "Stop"
$runId = [guid]::NewGuid().ToString("N")
$tempZip = Join-Path ([System.IO.Path]::GetTempPath()) "aac-$runId.zip"
$tempExtract = Join-Path ([System.IO.Path]::GetTempPath()) "aac-$runId-extract"

try {
    if ($WithSidecar -and [string]::IsNullOrWhiteSpace($ProjectId)) {
        throw "--WithSidecar requires -ProjectId <id> (or `$env:AAC_PROJECT_ID)."
    }

    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { "" }
    if ($scriptDir -and (Test-Path (Join-Path $scriptDir ".agents"))) {
        $sourceRoot = $scriptDir
    } else {
        Write-Host "Downloading AAC v6.0.0..." -ForegroundColor Cyan
        $tagUrl = "https://github.com/rafaelghif/antigravity-agents-core/archive/refs/tags/v6.0.0.zip"
        $mainUrl = "https://github.com/rafaelghif/antigravity-agents-core/archive/refs/heads/main.zip"
        try {
            Invoke-WebRequest -Uri $tagUrl -OutFile $tempZip -UseBasicParsing
        } catch {
            Invoke-WebRequest -Uri $mainUrl -OutFile $tempZip -UseBasicParsing
        }
        Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        $sourceRoot = (Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1).FullName
    }

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $cliScript = Join-Path $sourceRoot "bin\cli.mjs"
    if ($nodeCmd -and (Test-Path $cliScript)) {
        $cliVerb = if ($Upgrade) { "upgrade" } else { "init" }
        $cliArgs = @($cliScript, $cliVerb, "--target", $TargetDir)
        if ($Force) { $cliArgs += "--force" }
        if ($DryRun) { $cliArgs += "--dry-run" }
        if ($WithSidecar) { $cliArgs += @("--with-sidecar", "--project-id", $ProjectId) }
        & node @cliArgs
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        return
    }

    if (-not $DryRun) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }

    if ((Resolve-Path $TargetDir).Path -ne (Resolve-Path $sourceRoot).Path) {
        if ($DryRun) {
            Write-Host "[dry-run] Would install AAC v6.0.0 in: $TargetDir" -ForegroundColor Cyan
            return
        }

        foreach ($sub in @("rules", "skills", "agents", "sidecars")) {
            $srcSub = Join-Path $sourceRoot ".agents\$sub"
            $dstSub = Join-Path $TargetDir ".agents\$sub"
            if (Test-Path $srcSub) {
                New-Item -ItemType Directory -Path $dstSub -Force | Out-Null
                Copy-Item -Path "$srcSub\*" -Destination $dstSub -Recurse -Force
            }
        }

        $srcHooks = Join-Path $sourceRoot ".agents\hooks.json"
        $dstHooks = Join-Path $TargetDir ".agents\hooks.json"
        if (Test-Path $dstHooks) {
            $srcObj = Get-Content $srcHooks -Raw | ConvertFrom-Json
            $dstObj = Get-Content $dstHooks -Raw | ConvertFrom-Json
            foreach ($prop in $srcObj.PSObject.Properties) {
                $existing = $dstObj.PSObject.Properties[$prop.Name]
                if ($existing -and ($null -ne $existing.Value.enabled)) {
                    $prop.Value.enabled = $existing.Value.enabled
                }
                $dstObj | Add-Member -NotePropertyName $prop.Name -NotePropertyValue $prop.Value -Force
            }
            $dstObj | ConvertTo-Json -Depth 10 | Set-Content -Path $dstHooks -Encoding UTF8
        } else {
            Copy-Item -Path $srcHooks -Destination $dstHooks -Force
        }

        $dstAgentsMd = Join-Path $TargetDir "AGENTS.md"
        if (-not (Test-Path $dstAgentsMd) -or $Force) {
            Copy-Item -Path (Join-Path $sourceRoot "AGENTS.md") -Destination $dstAgentsMd -Force
        } else {
            Copy-Item -Path (Join-Path $sourceRoot "AGENTS.md") -Destination "$dstAgentsMd.aac-new" -Force
        }

        $dstContextMd = Join-Path $TargetDir "CONTEXT.md"
        if (-not (Test-Path $dstContextMd)) {
            Copy-Item -Path (Join-Path $sourceRoot "CONTEXT.md") -Destination $dstContextMd -Force
        }

        $scratchDir = Join-Path $TargetDir ".scratch"
        New-Item -ItemType Directory -Path $scratchDir -Force | Out-Null
        $gitkeep = Join-Path $scratchDir ".gitkeep"
        if (-not (Test-Path $gitkeep)) {
            Set-Content -Path $gitkeep -Value "# Ephemeral scratchpad" -Force
        }

        $gitignore = Join-Path $TargetDir ".gitignore"
        $ignoreRules = "`n# Antigravity Ephemeral State & Secrets`n.scratch/*`n!.scratch/.gitkeep`n.agents/mcp_config.json`n"
        if (-not (Test-Path $gitignore) -or ((Get-Content $gitignore -Raw) -notmatch "\.scratch/\*")) {
            Add-Content -Path $gitignore -Value $ignoreRules
        }

        Write-Host "✅ AAC v6.0.0 ready." -ForegroundColor Green
    }
} finally {
    if (Test-Path $tempZip) { Remove-Item -Force $tempZip -ErrorAction SilentlyContinue }
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue }
}
