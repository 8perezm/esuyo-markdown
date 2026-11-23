<#
.SYNOPSIS
  Crops raw window captures to 16:9 and resizes them to the 1366x768 Store screenshot size.
.EXAMPLE
  .\normalize-screenshots.ps1 -SourceDir C:\temp\captures
.NOTES
  The raw capture is the whole window (title bar + a thin bottom border).
  This script keeps the top-left 16:9 region and discards the excess at the bottom.
#>
param([string]$SourceDir = "$env:TEMP\opencode",
      [string]$OutDir = "$PSScriptRoot\..\screenshots")

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force $OutDir | Out-Null

$map = [ordered]@{
  'shot-welcome2.png'   = '01-welcome-library.png'
  'shot-paris.png'      = '02-reading-view.png'
  'shot-singapore.png'  = '03-nested-folder-tree.png'
  'shot-dark-tokyo.png' = '04-dark-theme.png'
  'shot-edit-source.png'= '05-source-editing.png'
  'shot-edit-rich.png'  = '06-rich-text-editing.png'
  'shot-flatlist.png'   = '07-flat-file-list.png'
}

foreach ($name in $map.Keys) {
  $in = Join-Path $SourceDir $name
  if (-not (Test-Path $in)) { Write-Warning "missing $in"; continue }
  $src = [System.Drawing.Image]::FromFile($in)

  # Largest 16:9 region anchored at top-left, then scaled to exactly 1366x768.
  $cropH = [int][Math]::Round($src.Width * 768.0 / 1366.0)
  if ($cropH -gt $src.Height) {
    $cropW = [int][Math]::Round($src.Height * 1366.0 / 768.0)
    $cropH = $src.Height
  } else { $cropW = $src.Width }

  $crop = New-Object System.Drawing.Bitmap $cropW, $cropH
  $g = [System.Drawing.Graphics]::FromImage($crop)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src,
    (New-Object System.Drawing.Rectangle 0,0,$cropW,$cropH),
    (New-Object System.Drawing.Rectangle 0,0,$cropW,$cropH),
    [System.Drawing.GraphicsUnit]::Pixel)

  $final = New-Object System.Drawing.Bitmap 1366, 768
  $g2 = [System.Drawing.Graphics]::FromImage($final)
  $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g2.DrawImage($crop, 0, 0, 1366, 768)

  $out = Join-Path $OutDir $map[$name]
  $final.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $g2.Dispose(); $crop.Dispose(); $final.Dispose(); $src.Dispose()
  Write-Output "wrote $out"
}
