# Development Guide

Purpose: local setup and day-to-day workflows for contributors.

## Prerequisites

- **Node.js 18+** and npm (CI uses Node 22 — `.github/workflows/publish.yml:115`).
- **Rust stable** toolchain. On Windows the project uses the GNU target:
  `stable-x86_64-pc-windows-gnu` (see `README` history and `.github/workflows/publish.yml:119-125`).
- **Windows only — linker:** `w64devkit` providing `dlltool.exe` (required when MSVC tools are absent). CI installs it from `skeeto/w64devkit v2.8.0` to `C:\tools\w64devkit` (`.github/workflows/publish.yml:101-109`). Local installs should put it at `C:\tools\w64devkit\w64devkit\bin` and add it to `PATH`.
- **Linux builders:** `libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev rpm` (`.github/workflows/publish.yml:87-98`).

## Install

```powershell
npm ci
```

## Run

### Full desktop app (Vite + Tauri, hot reload)

```powershell
$env:Path += ";C:\tools\w64devkit\w64devkit\bin"; $env:Path += ";$env:USERPROFILE\.cargo\bin"; npx tauri dev
```

This starts Vite on `http://localhost:1420` (`vite.config.js:24`) and opens the Tauri window against `devUrl` (`src-tauri/tauri.conf.json:8`). Editing `src/main.js`, `src/*.css`, or `index.html` hot-reloads.

> Windows note (from prior README, still valid): run from an **Administrator terminal** — Windows Defender Application Control can block Cargo build scripts (error `4551`) without elevation.

### Frontend only (no Tauri shell)

```powershell
npm run dev
```

Then open `http://localhost:1420` in a browser. Native calls (`pick_folder`, `scan_md_files`, `read_file`, …) will fail — use this only for CSS/layout work.

### Rust-only check

```powershell
$env:Path += ";C:\tools\w64devkit\w64devkit\bin"; $env:Path += ";$env:USERPROFILE\.cargo\bin"; cd src-tauri; cargo check
```

## Scripts (`package.json:6-11`)

| Script | What it does |
|--------|--------------|
| `npm run dev` | `vite` — dev server on port `1420` strict |
| `npm run build` | `vite build` — minified frontend into `dist/` |
| `npm run preview` | `vite preview` — serve the built `dist/` |
| `npx tauri dev` / `npx tauri build` | Tauri CLI (via `@tauri-apps/cli`) — run / bundle the desktop app |

## Vite specifics (`vite.config.js`)

- `server.port: 1420`, `strictPort: true` — the Tauri `devUrl` must match exactly.
- Mobile HMR uses `TAURI_DEV_HOST` with WS port `1421`.
- `watch.ignored: ["**/src-tauri/**"]` — Rust edits don't restart Vite.
- `optimizeDeps.include` pre-bundles `quill`, `quill-table-better`, `quilljs-markdown`, `marked`, `marked-highlight`, `highlight.js`, `turndown`, `turndown-plugin-gfm` to avoid stale `Outdated Optimize Dep` 504s after dependency swaps.

## Manual testing (no automated runner)

There is no unit/e2e framework in `package.json`. Verify by hand:

1. `cargo check` in `src-tauri/` — backend compiles.
2. `npm run build` — frontend builds to `dist/`.
3. `npx tauri dev` — open `sample/` via **Open Folder**, check read view, toggle **Edit**, toggle **Source**, save, create new file, delete (goes to Recycle Bin), toggle theme, change fonts, toggle `Use .gitignore`.
4. Manual fixtures: open `test/test-table-better.html` or `test-editor-view.html` in a browser for table/editor edge cases.

## Clearing stale caches

```powershell
cd src-tauri; cargo clean
```

Or nuke Rust + Vite caches:

```powershell
Remove-Item -Recurse -Force src-tauri\target, node_modules\.vite -ErrorAction SilentlyContinue
```

## Debugging tips

- Rust errors surface as rejected `invoke()` promises — check DevTools console (`Failed to …` strings originate in `src-tauri/src/lib.rs`).
- Table round-trip issues: start at `parseMarkdownForEditor` (`src/main.js:53`) and `getEditorMarkdown` / `cleanHtmlForTurndown` (`src/main.js:189-280`).
- Sidebar empty unexpectedly? Check `use_gitignore` + `.gitignore` + built-in blocklist (`src-tauri/src/lib.rs:48-54`).
- Settings file location: OS app-data dir + `settings.json` (`src-tauri/src/lib.rs:56-63`). Delete it to reset to defaults (theme `dark`).
