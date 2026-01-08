# Usage: Run this script in PowerShell to deploy Hosting
# It will ensure we use the root firebase.json regardless of current directory

param(
    [string]$ProjectId = ""
)

# Resolve repo root (script directory)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Using project root: $Root"

# Ensure Firebase CLI is available
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Error "Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
}

# Optional project selection
if ($ProjectId -and $ProjectId.Trim() -ne "") {
    Write-Host "Selecting Firebase project: $ProjectId"
    firebase use $ProjectId --config "$Root\firebase.json"
} else {
    Write-Host "If you need to select a project, run: firebase use --add"
}

# Deploy hosting with PowerShell-safe quoting
firebase deploy --only "hosting" --config "$Root\firebase.json"
