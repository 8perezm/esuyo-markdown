<#
.SYNOPSIS
  Captures the running Esuyo Markdown app window. Optionally clicks a UI element first.
.EXAMPLE
  .\capture-window.ps1 -ClickName 'paris.md' -Out 'C:\temp\paris.png'
.EXAMPLE
  .\capture-window.ps1 -Dark -ClickName 'tokyo.md' -Out 'C:\temp\tokyo-dark.png'
.EXAMPLE
  .\capture-window.ps1 -Tree -ClickName 'welcome.md' -Out 'C:\temp\welcome.png'
.NOTES
  Requires the app to be running (see docs/store-imagery.md).
  Element names come from UI Automation (aria-label / title): 'Toggle theme',
  'Tree view', 'Flat list', 'Source', 'Cancel', 'Toggle edit mode', file names, etc.
#>
param(
  [string]$ClickName = '',
  [string]$Out = "$PSScriptRoot\..\screenshots\_capture.png",
  [switch]$Dark,
  [switch]$Tree,
  [switch]$List,
  [int]$DelayMs = 800
)

Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Shot {
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint data, IntPtr extra);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

# Discover the Tauri window from the running process (handles change every launch).
$proc = Get-Process -Name esuyo-markdown -ErrorAction Stop | Select-Object -First 1
$h = $proc.MainWindowHandle
if ($h -eq [IntPtr]::Zero) { throw 'App has no main window.' }
$root = [System.Windows.Automation.AutomationElement]::FromHandle($h)

function Find-Element([string]$name) {
  $all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants,
                       [System.Windows.Automation.Condition]::TrueCondition)
  foreach ($e in $all) { if ($e.Current.Name -eq $name) { return $e } }
  return $null
}

function Click-Element($e) {
  try { $e.GetCurrentPattern([System.Windows.Automation.ScrollItemPattern]::Pattern).ScrollIntoView() } catch {}
  $r = $e.Current.BoundingRectangle
  [void][Shot]::SetCursorPos([int]($r.X + $r.Width / 2), [int]($r.Y + $r.Height / 2))
  [Shot]::mouse_event(0x0002,0,0,0,[IntPtr]::Zero)
  [Shot]::mouse_event(0x0004,0,0,0,[IntPtr]::Zero)
}

# Topmost avoids capturing an occluding window (CopyFromScreen grabs the screen, not the window).
[void][Shot]::SetWindowPos($h, [IntPtr](-1), 0,0,0,0, 0x0003)
Start-Sleep -Milliseconds 350

if ($Dark) { $e = Find-Element 'Toggle theme'; if ($e) { Click-Element $e; Start-Sleep -Milliseconds 500 } }
if ($Tree) { $e = Find-Element 'Tree view';    if ($e) { Click-Element $e; Start-Sleep -Milliseconds 400 } }
if ($List) { $e = Find-Element 'Flat list';    if ($e) { Click-Element $e; Start-Sleep -Milliseconds 400 } }
if ($ClickName) {
  $e = Find-Element $ClickName
  if ($e) { Click-Element $e } else { Write-Warning "Element not found: $ClickName" }
}

Start-Sleep -Milliseconds $DelayMs
[void][Shot]::SetCursorPos(1200, 850)   # hide tooltips
Start-Sleep -Milliseconds 350

$r = New-Object Shot+RECT
[void][Shot]::GetWindowRect($h, [ref]$r)
$bmp = New-Object System.Drawing.Bitmap ($r.Right - $r.Left), ($r.Bottom - $r.Top)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.Left, $r.Top, 0, 0, $bmp.Size)
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
[void][Shot]::SetWindowPos($h, [IntPtr](-2), 0,0,0,0, 0x0003)
Write-Output "saved $Out ($($r.Right - $r.Left)x$($r.Bottom - $r.Top))"
