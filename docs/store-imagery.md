# Store imagery — regeneration guide

How to recreate or update the images in `store-assets/`. Everything was generated from the
running app on **2026-11-23**; this document records the exact steps so it can be reproduced.

## What to upload

Upload the five files in `store-assets/upload/` — all **1920 × 1080 PNG**, ~0.6–0.7 MB:

| File | Focus | App screenshots |
|------|-------|-----------------|
| `01-hero.png` | Product name + overall pitch | 1 — welcome/library |
| `02-reading.png` | Reading experience | 2 — light + dark |
| `03-browsing.png` | Folder navigation | 2 — tree + flat list |
| `04-editing.png` | Editing | 2 — rich text + source |
| `05-private.png` | Privacy / offline | 1 — reading view |

Each image has one focus and at most two app screenshots. Your listing supports up to 30
landscape or portrait PNG files under 50 MB each, with 1366 × 768 or larger recommended and
4K supported — these five sit comfortably within those limits.

## Asset map

| Path | Purpose |
|------|---------|
| `store-assets/upload/01…05-*.png` | **Final five images to upload** |
| `store-assets/screenshots/01…07-*.png` | Raw 1366 × 768 app captures (inputs + spares) |
| `store-assets/promotional/source/slides.html` | Editable source for the five upload images |
| `store-assets/promotional/hero-bg.png` | Optional generated artwork (not used by current five) |
| `store-assets/logos/*.png` | Store logo (50 px) + tile sizes, from `src-tauri/icons/` |
| `store-assets/scripts/*.ps1` | Capture + normalize helpers |

Listing copy lives in [`store-listing.md`](store-listing.md) — keep it in sync with image wording.

## Prerequisites

- Node/npm dependencies installed (`npm ci`).
- Rust **GNU** toolchain on Windows plus `w64devkit` for `dlltool.exe`.
- A Chromium browser driven by the Playwright MCP (`browser_run_code_unsafe`) for the promo images.
- PowerShell 5.1 with `System.Drawing` and `UIAutomationClient` (built into Windows).
- An interactive desktop session — captures are screen grabs, not headless renders.

## Part 1 — Raw screenshots

### 1. Launch the app

From the repo root:

```powershell
$env:RUSTUP_TOOLCHAIN = "stable-x86_64-pc-windows-gnu"
$env:Path = "C:\tools\w64devkit\w64devkit\bin;$env:USERPROFILE\.cargo\bin;$env:Path"
npx tauri dev
```

The default MSVC toolchain fails with `linker rust-lld-link not found` / `link.exe not found`.
Vite serves the frontend on port **1420**; the Rust binary is
`C:\Users\<user>\.cargo\target\debug\esuyo-markdown.exe`.

### 2. Open the `sample` folder

The app starts with no folder selected. Click **Open Folder** and pick:

```
C:\SERVER\REPOS\Esuyo\esuyo-markdown\sample
```

UI Automation is more reliable than synthetic mouse clicks. The folder dialog
("Select a folder with markdown files") is a Win32 common dialog: the folder entry is `Edit`
control ID **1152**, and **Select Folder** is button ID **1**. Use `EnumChildWindows` +
`GetDlgCtrlID` to locate them (handles change each time), set the path with `WM_SETTEXT`
(`0x000C`) and click with `BM_CLICK` (`0x00F5`).

### 3. Capture states

Use `store-assets/scripts/capture-window.ps1`. It finds the Tauri window from the running
process, toggles theme/tree/list, clicks a UI element by accessible name, forces the window
topmost (so an occluding terminal isn't captured), and hides the cursor.

```powershell
$s = '.\store-assets\scripts\capture-window.ps1'
& $s -ClickName 'welcome.md'     -Out "$env:TEMP\opencode\shot-welcome2.png"
& $s -ClickName 'paris.md'       -Out "$env:TEMP\opencode\shot-paris.png"
& $s -ClickName 'singapore.md'   -Out "$env:TEMP\opencode\shot-singapore.png"
& $s -Dark -ClickName 'tokyo.md' -Out "$env:TEMP\opencode\shot-dark-tokyo.png"
& $s -ClickName 'Toggle edit mode' -Out "$env:TEMP\opencode\shot-edit-rich.png"
& $s -ClickName 'Source'           -Out "$env:TEMP\opencode\shot-edit-source.png"
& $s -ClickName 'Cancel'           # discard draft before continuing
& $s -List -ClickName 'tokyo.md'   -Out "$env:TEMP\opencode\shot-flatlist.png"
& $s -Tree                         # restore tree view
```

Accessible names come from `title`/`aria-label` in `index.html`, not visible text —
for example the button labelled "Edit" is exposed as **Toggle edit mode**.
Other useful names: `Toggle theme`, `Tree view`, `Flat list`, `Source`, `Cancel`, `Save`.

### 4. Normalize to 1366 × 768

```powershell
.\store-assets\scripts\normalize-screenshots.ps1 -SourceDir "$env:TEMP\opencode"
```

It crops the largest top-left 16:9 region (keeps the title bar, drops the thin bottom border)
and resamples with bicubic interpolation. Edit the `$map` hashtable in the script if you add
or rename captures.

**Capture conventions:** light theme for library/reading/editor, dark only for the dark shot;
keep several tabs open to show tabbing and the file-path breadcrumb; no unsaved edits
(click **Cancel**) so no dirty-draft bar appears; leave `sample/` expanded in tree view.

## Part 2 — The five upload images

All five are produced from one HTML file: `store-assets/promotional/source/slides.html`.
It contains five `<section class="slide" id="slide-1">…</section>` blocks, each exactly
1920 × 1080, sharing the same CSS. Images are referenced relatively from that folder:

```
../../screenshots/<name>.png
```

### Edit the source

- Change headlines, taglines, pills, or colors directly in `slides.html`.
- The accent color is emerald `#4ade9b` (bright) with `#218a56` as the deep icon green;
  backgrounds are dark green-tinted CSS gradients with a faint grid overlay. Practice by
  sampling `src-tauri/icons/icon.png` if the icon palette ever changes.
- `.shot` cards are the screenshot frames. Keep **at most two** per slide — the current
  layout is one large screenshot for slides 1/5 and a two-up pair for slides 2/3/4.
- Keep every `.shot` card at a **16:9 aspect ratio** (e.g. the two-up cards are 840 × 473).
  A taller card with `object-fit: cover` will crop the left and right edges of the screenshots;
  the CSS uses `object-fit: contain` as a safeguard, but matching the ratio is what keeps the
  whole window visible.
- If you rename a raw screenshot, update its `src` in the HTML.
- Slide 5's tagline is manually line-broken so it doesn't run under the screenshot.

### Re-render at 1920 × 1080

With the Playwright MCP:

```js
async (page) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('file:///C:/SERVER/REPOS/Esuyo/esuyo-markdown/store-assets/promotional/source/slides.html');
  await page.waitForTimeout(1200);
  const slides = [
    ['slide-1', '01-hero.png'],
    ['slide-2', '02-reading.png'],
    ['slide-3', '03-browsing.png'],
    ['slide-4', '04-editing.png'],
    ['slide-5', '05-private.png'],
  ];
  for (const [id, name] of slides) {
    await page.locator('#' + id).screenshot({
      path: 'C:/SERVER/REPOS/Esuyo/esuyo-markdown/store-assets/upload/' + name
    });
  }
}
```

If local file URLs are blocked, serve the repo with `npm run dev` and load
`http://localhost:1420/store-assets/promotional/source/slides.html` instead.
Verify all outputs are exactly 1920 × 1080 before uploading.

### Optional artwork

`promotional/hero-bg.png` is AI-generated background art kept as a source asset. It is not
used by the current five images. If you want a textured hero, set it as the background of
`#slide-1` with `background-size: cover` and keep the left half dark enough for the headline.

## Part 3 — Logos

Copied from `src-tauri/icons/`:

```powershell
Copy-Item src-tauri\icons\StoreLogo.png          store-assets\logos\StoreLogo-50x50.png -Force
Copy-Item src-tauri\icons\Square44x44Logo.png    store-assets\logos\Square44x44Logo.png -Force
Copy-Item src-tauri\icons\Square150x150Logo.png  store-assets\logos\Square150x150Logo.png -Force
Copy-Item src-tauri\icons\Square310x310Logo.png  store-assets\logos\Square310x310Logo.png -Force
```

If the app icon changes, regenerate the icon set with `npx tauri icon path/to/source.png`,
then re-copy. The 50 × 50 Store logo is mandatory.

## Part 4 — Pre-upload checklist

1. App name is exactly **Esuyo Markdown**.
2. Five PNGs in `store-assets/upload/`, each 1920 × 1080 and < 50 MB.
3. At most two app screenshots per image; no misleading or contradictory text.
4. Wording agrees with `docs/store-listing.md` (reader **and** editor, flat **and** tree,
   light **and** dark, private/offline, no account).
5. Store logo 50 × 50 present in `logos/`.
6. Upload order: `01-hero`, `02-reading`, `03-browsing`, `04-editing`, `05-private`.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `linker rust-lld-link not found` | Set `RUSTUP_TOOLCHAIN=stable-x86_64-pc-windows-gnu` and put `w64devkit\bin` on `PATH`. |
| Capture shows a terminal / VS Code | Window wasn't topmost. The helper uses `SetWindowPos(HWND_TOPMOST)`; `CopyFromScreen` grabs the screen at the window rect, so occlusion matters. |
| "Element not found" from helper | Accessible names come from `title`/`aria-label`; inspect with UI Automation and use the exact name. |
| Window handle changes between runs | Expected — the helper resolves it from the `esuyo-markdown` process each time. |
| Tooltip or cursor in a shot | The helper moves the cursor to `(1200, 850)` and waits before capturing. |
| Screenshots not 1366 × 768 | Run `normalize-screenshots.ps1`; raw captures are window-sized and DPI-scaled. |
| Upload image not 1920 × 1080 | Check the Playwright viewport and that `#slide-N` is exactly 1080 px tall. |
| `[!TIP]` appears as literal text in a screenshot | The reader has no GitHub alert callout support. Convert those sample lines to plain `>` blockquotes or add rendering support before recapturing. |
| Vite warns about a missing source map for `quilljs-markdown` | Harmless dev-only dependency warning. |
