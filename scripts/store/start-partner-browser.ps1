<#
.SYNOPSIS
  Launches a dedicated Chrome profile for Partner Center / Store work.

.DESCRIPTION
  The profile lives in .store-browser/ (gitignored) and exposes a CDP endpoint on
  localhost so an agent can drive the browser without touching your main profile.
  YOU sign in and complete MFA in the window that opens; no credentials are stored
  in this repo and the agent never needs your password.

  Approval gates: the agent may read pages, fill fields and save drafts. Only a
  human may click Submit for certification / Publish.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/store/start-partner-browser.ps1
  powershell -ExecutionPolicy Bypass -File scripts/store/start-partner-browser.ps1 -RankOnly -Headless
#>
param(
    [int]$Port = 9222,
    [string]$ProfileDir = ".store-browser",
    [switch]$Headless,
    [switch]$RankOnly
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$profile = if ([IO.Path]::IsPathRooted($ProfileDir)) { $ProfileDir } else { Join-Path $root $ProfileDir }
New-Item -ItemType Directory -Force -Path $profile | Out-Null

$chrome = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chrome) { throw "Chrome not found. Install Chrome or edit the path list in this script." }

$urls = if ($RankOnly) {
    @("https://apps.microsoft.com/search?query=markdown&hl=en-GB&gl=GB")
} else {
    @(
        "https://partner.microsoft.com/en-us/dashboard/home",
        "https://apps.microsoft.com/search?query=markdown&hl=en-GB&gl=GB"
    )
}

$args = @(
    "--user-data-dir=$profile",
    "--remote-debugging-port=$Port",
    "--remote-allow-origins=*",
    "--no-first-run",
    "--no-default-browser-check"
)
if ($Headless) { $args += "--headless=new" }
$args += $urls

Start-Process -FilePath $chrome -ArgumentList $args | Out-Null

Write-Host "Chrome started with dedicated profile: $profile"
Write-Host "CDP endpoint: http://127.0.0.1:$Port"
if (-not $RankOnly -and -not $Headless) {
    Write-Host "Sign in to Partner Center in the new window and complete MFA yourself."
    Write-Host "Then: node scripts/store/check-rank.mjs --cdp http://127.0.0.1:$Port"
}
Write-Host "Close this browser when finished; the profile keeps the session, so do not commit it."
