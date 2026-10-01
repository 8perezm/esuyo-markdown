<#
.SYNOPSIS
  Stages the Tauri release exe + manifest + Assets and packs an UNSIGNED .msix
  with the Windows SDK makeappx.exe for Microsoft Store submission.

.DESCRIPTION
  1. Resolves the 4-part MSIX version from a 3-part semver (appends .0).
  2. Finds the built exe in src-tauri/target/release.
  3. Copies exe + required logos into a staging dir.
  4. Expands src-tauri/msix/AppxManifest.template.xml tokens.
  5. Runs makeappx.exe pack (unsigned — the Store signs on submission).

.PARAMETER Version
  3-part semver, e.g. 0.1.9. Converted to 0.1.9.0 automatically.
  4-part versions are passed through unchanged.

.PARAMETER IdentityName
  Partner Center Package Name. Defaults to Esuyo.EsuyoMarkdown.
  Override via GitHub variable MSIX_IDENTITY_NAME.

.PARAMETER Publisher
  Partner Center Publisher, e.g. CN=8AC4B328-845D-4C1C-B1FC-CE52C08F4693.
  Defaults to CN=Esuyo (dev only — replace before Store upload).
  Override via GitHub variable MSIX_PUBLISHER.

.PARAMETER DisplayName
  Defaults to "Esuyo Markdown".

.PARAMETER PublisherDisplayName
  Defaults to "Esuyo".

.PARAMETER Architecture
  Defaults to x64.

.EXAMPLE
  ./scripts/build-msix.ps1 -Version 0.1.9
.EXAMPLE
  ./scripts/build-msix.ps1 -Version 0.1.9 -IdentityName "Esuyo.EsuyoMarkdown" -Publisher "CN=..."
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Version,

  [string]$IdentityName = $env:MSIX_IDENTITY_NAME,
  [string]$Publisher = $env:MSIX_PUBLISHER,
  [string]$DisplayName = $env:MSIX_DISPLAY_NAME,
  [string]$PublisherDisplayName = $env:MSIX_PUBLISHER_DISPLAY_NAME,
  [string]$Description = $env:MSIX_DESCRIPTION,
  [ValidateSet("x64", "arm64")]
  [string]$Architecture = "x64"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($IdentityName)) { $IdentityName = "Esuyo.EsuyoMarkdown" }
if ([string]::IsNullOrWhiteSpace($Publisher)) { $Publisher = "CN=Esuyo" }
if ([string]::IsNullOrWhiteSpace($DisplayName)) { $DisplayName = "Esuyo Markdown" }
if ([string]::IsNullOrWhiteSpace($PublisherDisplayName)) { $PublisherDisplayName = "Esuyo" }
if ([string]::IsNullOrWhiteSpace($Description)) { $Description = "A desktop markdown reader" }

# ── 1. Normalise version to 4 parts (MSIX requires X.Y.Z.W, each 0-65535) ──
$Version = $Version.Trim() -replace '^v', ''
$parts = $Version.Split('.')
if ($parts.Count -eq 3) {
  $quadVersion = "$Version.0"
} elseif ($parts.Count -eq 4) {
  $quadVersion = $Version
} else {
  throw "Version '$Version' must be 3-part (1.2.3) or 4-part (1.2.3.0) for MSIX."
}
foreach ($p in $quadVersion.Split('.')) {
  $n = 0
  if (-not [int]::TryParse($p, [ref]$n) -or $n -lt 0 -or $n -gt 65535) {
    throw "MSIX version part '$p' out of range 0-65535 in '$quadVersion'."
  }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $repoRoot "src-tauri/target/release"
$templatePath = Join-Path $repoRoot "src-tauri/msix/AppxManifest.template.xml"
$iconsDir = Join-Path $repoRoot "src-tauri/icons"
$stagingDir = Join-Path $repoRoot "src-tauri/target/msix/staging"
$outDir = Join-Path $repoRoot "src-tauri/target/msix"

if (-not (Test-Path -LiteralPath $templatePath)) { throw "Manifest template not found: $templatePath" }
if (-not (Test-Path -LiteralPath $releaseDir)) { throw "Release dir not found: $releaseDir. Run 'npx tauri build --no-bundle' first." }

# ── 2. Find the built exe (package name esuyo-markdown, fallback to product name) ──
$candidates = @("esuyo-markdown.exe", "Esuyo Markdown.exe", "EsuyoMarkdown.exe")
$exePath = $null
foreach ($name in $candidates) {
  $p = Join-Path $releaseDir $name
  if (Test-Path -LiteralPath $p) { $exePath = $p; break }
}
if (-not $exePath) {
  $exePath = Get-ChildItem -LiteralPath $releaseDir -Filter "*.exe" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notlike "*,*" } |
    Select-Object -First 1 -ExpandProperty FullName
}
if (-not $exePath -or -not (Test-Path -LiteralPath $exePath)) {
  throw "No built exe found in $releaseDir. Run 'npx tauri build --no-bundle' first."
}
$exeName = Split-Path -Leaf $exePath
Write-Host "Using exe: $exeName"

# ── 3. Stage files ──
if (Test-Path -LiteralPath $stagingDir) { Remove-Item -Recurse -Force -LiteralPath $stagingDir }
$assetsDir = Join-Path $stagingDir "Assets"
New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null

Copy-Item -LiteralPath $exePath -Destination (Join-Path $stagingDir $exeName) -Force

$requiredLogos = @(
  "StoreLogo.png",
  "Square44x44Logo.png",
  "Square150x150Logo.png",
  "Square71x71Logo.png"
)
foreach ($logo in $requiredLogos) {
  $src = Join-Path $iconsDir $logo
  if (-not (Test-Path -LiteralPath $src)) { throw "Required logo missing: $src" }
  Copy-Item -LiteralPath $src -Destination (Join-Path $assetsDir $logo) -Force
}

# ── 4. Expand manifest template ──
$manifest = Get-Content -LiteralPath $templatePath -Raw
$manifest = $manifest.Replace("__IDENTITY_NAME__", $IdentityName)
$manifest = $manifest.Replace("__PUBLISHER__", $Publisher)
$manifest = $manifest.Replace("__VERSION_QUAD__", $quadVersion)
$manifest = $manifest.Replace("__EXE_NAME__", $exeName)
$manifest = $manifest.Replace("__DISPLAY_NAME__", $DisplayName)
$manifest = $manifest.Replace("__PUBLISHER_DISPLAY_NAME__", $PublisherDisplayName)
$manifest = $manifest.Replace("__DESCRIPTION__", $Description)
if ($manifest -match "__[A-Z_]+__") { throw "Unreplaced token remains in manifest." }
$manifest | Set-Content -LiteralPath (Join-Path $stagingDir "AppxManifest.xml") -Encoding utf8NoBOM

# ── 5. Locate makeappx.exe (Windows SDK, preinstalled on windows-latest) ──
$makeappx = Get-ChildItem -Path "C:\Program Files (x86)\Windows Kits\10\bin" -Filter "makeappx.exe" -Recurse -ErrorAction SilentlyContinue |
  Sort-Object FullName -Descending |
  Select-Object -First 1 -ExpandProperty FullName
if (-not $makeappx) { throw "makeappx.exe not found. Install the Windows 10/11 SDK." }
Write-Host "Using makeappx: $makeappx"

if (-not (Test-Path -LiteralPath $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
$msixName = "$($IdentityName)_${quadVersion}_${Architecture}.msix"
$msixPath = Join-Path $outDir $msixName

& $makeappx pack /d $stagingDir /p $msixPath /nv
if ($LASTEXITCODE -ne 0) { throw "makeappx pack failed with exit code $LASTEXITCODE." }

Write-Host "MSIX created (UNSIGNED, ready for Store upload): $msixPath"
Write-Host "NOTE: For local install testing, self-sign with signtool. For Store, upload as-is."
$msixPath
