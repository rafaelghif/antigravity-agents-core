# AAC (Antigravity Agent Core V6) — installer for Windows PowerShell.
#
# Requires Node.js >= 22: bin\cli.mjs is the only component that writes managed files, and
# .agents\hooks.json runs `node -e` guards at runtime. Without Node the hooks cannot execute,
# so there is no supported "no-Node" install path.
#
# Recommended (download, inspect, then run in its own process):
#   Invoke-WebRequest -Uri https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.ps1 -OutFile install.ps1
#   notepad install.ps1
#   powershell -NoProfile -File .\install.ps1 [-TargetDir <path>] [-Upgrade] [-Force] [-DryRun] [-WithSidecar] [-ProjectId <id>]
#
# Optional one-liner (same pinned tag; never a mutable branch):
#   irm https://raw.githubusercontent.com/rafaelghif/antigravity-agents-core/v6.1.0/install.ps1 | iex
#
# Pin a different ref explicitly: $env:AAC_REF="main"

param(
    [string]$TargetDir = (Get-Location).Path,
    [switch]$Upgrade = ($env:AAC_UPGRADE -eq "1"),
    [switch]$Force = ($env:AAC_FORCE -eq "1"),
    [switch]$DryRun = ($env:AAC_DRY_RUN -eq "1"),
    [switch]$WithSidecar = ($env:AAC_SIDECAR -eq "1"),
    [string]$ProjectId = $env:AAC_PROJECT_ID
)

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Stop"

$repo = "rafaelghif/antigravity-agents-core"
$ref = if ([string]::IsNullOrWhiteSpace($env:AAC_REF)) { "v6.1.0" } else { $env:AAC_REF }

$runId = [guid]::NewGuid().ToString("N")
$tempZip = Join-Path ([System.IO.Path]::GetTempPath()) "aac-$runId.zip"
$tempExtract = Join-Path ([System.IO.Path]::GetTempPath()) "aac-$runId-extract"

try {
    if ($ref -notmatch '^[A-Za-z0-9._/-]+$' -or $ref.Contains("..")) {
        throw "Invalid AAC_REF '$ref' (allowed: letters, digits, dot, underscore, dash, slash)."
    }

    if ($WithSidecar -and [string]::IsNullOrWhiteSpace($ProjectId)) {
        throw "--WithSidecar requires -ProjectId <id> (or `$env:AAC_PROJECT_ID)."
    }

    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCmd) {
        throw "Node.js >= 22 is required (the AAC CLI and lifecycle hooks are Node programs). Install it from https://nodejs.org, then re-run this installer."
    }
    # Windows PowerShell 5.1 strips embedded double quotes from native-exe arguments, so the version is
    # read as plain text and parsed here instead of being evaluated by a `node -e '...'` expression.
    $nodeVersion = (& node -p process.versions.node 2>$null | Out-String).Trim()
    $nodeMajor = 0
    if ($nodeVersion -match '^(\d+)\.') { $nodeMajor = [int]$Matches[1] }
    if ($nodeMajor -lt 22) {
        throw "Node.js >= 22 is required; found '$nodeVersion'."
    }

    $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { "" }
    if ($scriptDir -and (Test-Path (Join-Path $scriptDir "bin\cli.mjs"))) {
        $sourceRoot = $scriptDir
    } else {
        Write-Host "Downloading AAC $ref..." -ForegroundColor Cyan
        $archiveUrl = "https://github.com/$repo/archive/$ref.zip"
        try {
            Invoke-WebRequest -Uri $archiveUrl -OutFile $tempZip -UseBasicParsing
            Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        } catch {
            throw "Download or extraction failed for $archiveUrl. Check the ref (AAC_REF=$ref) and your network, or clone the repo and run '.\install.ps1' from it. $($_.Exception.Message)"
        }
        $sourceRoot = (Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1).FullName
    }

    if ([string]::IsNullOrWhiteSpace($sourceRoot) -or -not (Test-Path (Join-Path $sourceRoot "bin\cli.mjs"))) {
        throw "AAC $ref does not contain bin\cli.mjs; refusing to continue."
    }

    $cliVerb = if ($Upgrade) { "upgrade" } else { "init" }
    $cliArgs = @((Join-Path $sourceRoot "bin\cli.mjs"), $cliVerb, "--target", $TargetDir)
    if ($Force) { $cliArgs += "--force" }
    if ($DryRun) { $cliArgs += "--dry-run" }
    if ($WithSidecar) { $cliArgs += @("--with-sidecar", "--project-id", $ProjectId) }

    & node @cliArgs
    if ($LASTEXITCODE -ne 0) {
        throw "aac CLI exited with code $LASTEXITCODE."
    }
} finally {
    if (Test-Path $tempZip) { Remove-Item -Force $tempZip -ErrorAction SilentlyContinue }
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract -ErrorAction SilentlyContinue }
    $ErrorActionPreference = $previousErrorActionPreference
}
