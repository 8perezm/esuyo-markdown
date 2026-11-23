# AGENTS.md

## What this is

Esuyo Markdown — a local-only desktop Markdown reader/editor. Tauri v2 app: Rust backend (`src-tauri/`) + vanilla JS/Vite frontend (`src/`). No framework, no test runner.

## Layout

- `index.html` — app shell (sidebar, viewer, editor, settings, dialogs)
- `src/main.js` — all frontend logic (~2000 lines, single file)
- `src/style.css` — app chrome; `src/markdown-theme.css` — rendered Markdown typography
- `src-tauri/src/lib.rs` — all Tauri commands, settings, scan/ignore logic (`main.rs` is a thin entry point)
- `src-tauri/tauri.conf.json` — product name/version, `devUrl` port 1420, bundle config
- `docs/` — architecture, dev, build, reference docs; `*-plan.md` files are proposals, not implemented behavior
- `dist/`, `src-tauri/target/`, `src-tauri/gen/`, `Cargo.lock` are generated/ignored

## Commands

```powershell
npm ci                 # install frontend deps
npm run dev            # Vite only (port 1420); native invoke() calls fail in browser
npx tauri dev          # full app with hot reload
npm run build          # frontend -> dist/
npx tauri build        # bundled desktop app
cd src-tauri; cargo check
```

On Windows use the GNU Rust target (`stable-x86_64-pc-windows-gnu`) with `w64devkit` on `PATH` for `dlltool.exe`; run from an Administrator terminal (Defender can block Cargo build scripts). Path setup:

```powershell
$env:Path += ";C:\tools\w64devkit\w64devkit\bin;$env:USERPROFILE\.cargo\bin"
```

Full docs: `docs/development.md`, `docs/build-and-deployment.md`.

## Conventions & gotchas

- Frontend↔backend boundary is `invoke()` in `main.js` ↔ `#[tauri::command]` fns in `lib.rs`. Register new commands in `generate_handler!`. Rust errors surface as rejected promises in DevTools.
- `vite.config.js` port is strict (1420) and must match `tauri.conf.json` `devUrl`. New frontend deps that get optimized should be added to `optimizeDeps.include` to avoid stale "Outdated Optimize Dep" 504s.
- Keep settings schema changes backward-compatible: use `#[serde(default)]` on new `AppSettings` fields. Settings live in OS app-data `settings.json`; paths are normalized to forward slashes; recent folders capped at 10, tab lists at 30.
- File discovery uses `.gitignore` + a built-in ignore list (`BUILTIN_IGNORE_DIRS` in `lib.rs`); flat list and tree view share `should_visit` so they stay consistent.
- Table round-trips are fragile: relevant code is `parseMarkdownForEditor`, `getEditorMarkdown`, `cleanHtmlForTurndown`/`stripTableTemporaryArtifacts` in `main.js`.
- Version `0.1.11` is duplicated in `package.json`, `Cargo.toml`, and `tauri.conf.json` — bump all three together.

## Testing

No automated tests. Verify manually: `cargo check`, `npm run build`, then `npx tauri dev` and exercise `sample/` (open folder, read/edit/source mode, save, new file, delete to Recycle Bin, theme/fonts, `.gitignore` toggle). HTML fixtures: `test/test-table-better.html`, `test-editor-view.html`.
