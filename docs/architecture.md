# Architecture

Purpose: tech stack, process model, and request/data flow for Esuyo Markdown.

## Stack

- **Desktop shell:** Tauri v2 (`src-tauri/Cargo.toml:16` — `tauri = "2"`). Frontend dist (`../dist`) is embedded into the binary (`src-tauri/tauri.conf.json:7`).
- **Frontend:** Vite 5 (`package.json:25`) + vanilla JavaScript ES modules. No framework.
- **Markdown read path:** `marked@18` + `marked-highlight@2` + `highlight.js@11` (`package.json:14-17`, `src/main.js:3-5`, `src/main.js:22-30`).
- **WYSIWYG edit path:** `quill@2` + `quill-table-better@1` + `quilljs-markdown@1` (`package.json:18-20`, `src/main.js:6-18`).
- **HTML → Markdown save path:** `turndown@7` + `turndown-plugin-gfm@1` with GFM tables (`src/main.js:12-13`, `src/main.js:1081-1092`).
- **Backend crates:** `walkdir` (recursive scan), `trash` (Recycle Bin delete), `serde`/`serde_json` (settings) — `src-tauri/Cargo.toml:18-21`.
- **Native dialogs:** `tauri-plugin-dialog@2` (`src-tauri/Cargo.toml:17`, `package.json:13`).

## Process model

```text
+---------------------+     Tauri invoke (IPC)     +------------------+
|  Webview (frontend) | --------------------------> |  Rust backend    |
|  index.html +       | <-------------------------- |  src-tauri/src/  |
|  src/main.js        |   JSON results / errors    |  lib.rs + main.rs|
+---------------------+                            +------------------+
        |                                                    |
        | Google Fonts CSS (only network use)                | OS filesystem
        v                                                    v
 fonts.googleapis.com                              picked folders + settings.json
```

- Dev: Vite serves on `http://localhost:1420` (`vite.config.js:24`, `src-tauri/tauri.conf.json:8`) and the Tauri window points at `devUrl`.
- Prod: `npm run build` outputs `dist/`, which is compiled into the binary and served locally — no dev server.
- Security: `app.security.csp` is `null` (`src-tauri/tauri.conf.json:23-25`); capabilities are allow-listed in `src-tauri/capabilities/default.json:8-13` (`core:default`, `dialog:allow-open`, `dialog:allow-save`, `dialog:default`).

## Request / data flow

### 1. Open folder → list files

1. User clicks **Open Folder** (`index.html:66-73`).
2. Frontend calls `pick_folder` (Rust opens native dialog via `tauri-plugin-dialog`, `src-tauri/src/lib.rs:67-83`).
3. Frontend calls `scan_md_files({ folderPath, use_gitignore })` (`src/main.js:759` `openFolderByPath`).
4. Rust walks the tree with `WalkDir::follow_links(true)` (`src-tauri/src/lib.rs:192-194`), filters to `.md` / `.markdown` (`src-tauri/src/lib.rs:218`), sorts case-insensitively by `relative_path` (`src-tauri/src/lib.rs:240`), returns `Vec<MarkdownFile>` (`src-tauri/src/lib.rs:9-13`).
5. Frontend renders the sidebar list and calls `read_file` for the selected file.

Ignore rules (only when `use_gitignore == true`):
- Built-in directory blocklist (`src-tauri/src/lib.rs:48-54`): `node_modules`, `.git`, `dist`, `target`, `venv`, etc.
- `.gitignore` at the folder root (`src-tauri/src/lib.rs:118-132`) matched by a naïve matcher supporting `name`, `name/`, `**/name`, leading `/` (`src-tauri/src/lib.rs:135-170`).

### 2. Read view

- `read_file({ filePath })` returns UTF-8 text (`src-tauri/src/lib.rs:247-254`).
- `marked.parse(md)` with `markedHighlight` renders HTML (`src/main.js:22-30`); code blocks get `hljs language-*` classes and `highlight.js` coloring.
- Output is injected into `#rendered-content-inner` (`index.html:200-202`).

### 3. Edit → save

Two edit modes share one save path:

- **WYSIWYG:** Quill Snow with `table-better` module and `quilljs-markdown` shortcuts (`src/main.js:1268`, `src/main.js:1406-1412`). Markdown is pre-converted to Quill-safe HTML first (`src/main.js:53-130` `parseMarkdownForEditor` — flattens `<thead>` into `<tbody>`, lifts code language to `data-language`).
- **Source:** raw Markdown textarea toggled by `#source-checkbox` (`index.html:161-164`, `src/main.js:1166-1172`).
- On save, live editor HTML is cleaned (`src/main.js:215-280` strips `table-temporary` blots, unwraps `<p>` in cells) then `turndown.turndown(html)` produces GFM Markdown (`src/main.js:207-213`).
- `write_file({ filePath, content })` writes bytes (`src-tauri/src/lib.rs:258-261`). **Save As** uses `pick_save_file` (default name `untitled.md`, `src-tauri/src/lib.rs:276-294`) then `write_file`.

### 4. Other mutations

- **New file:** `createNewFile` (`src/main.js:786`) prompts / saves `untitled.md`-style content via `write_file`, then re-scans the parent folder.
- **Delete:** `delete_file` moves to OS Recycle Bin via the `trash` crate (`src-tauri/src/lib.rs:265-272`); confirmation overlay is `index.html:209-223`.

### 5. Settings persistence

- `get_settings` / `save_settings` (`src-tauri/src/lib.rs:87-115`) read/write `settings.json` under the OS app-data dir (`src-tauri/src/lib.rs:56-63`).
- Shape: `AppSettings` (`src-tauri/src/lib.rs:16-40`) — `recent_folders` (capped at 10, deduped, slash-normalized), `theme`, three font families + three sizes, `use_gitignore` (defaults `true` via `default_true` for backward compat).
- Frontend defaults when fields are missing: `Inter` / `Inter` / `JetBrains Mono`, sizes `16 / 32 / 14` (`src/main.js:356-361`). Default theme for fresh installs is `"dark"` (`src-tauri/src/lib.rs:90-93`).

## Key modules

| Area | File | Role |
|------|------|------|
| App entry | `index.html:289` | Loads `/src/main.js` as module; defines sidebar, viewer, editor, settings, confirm overlays |
| Frontend logic | `src/main.js` (~1596 lines) | Folder open/scan, render, Quill setup, Turndown save, settings UI, keyboard nav |
| App chrome | `src/style.css` | Sidebar, layout, menu, settings, dialogs |
| Markdown presentation | `src/markdown-theme.css` | User-facing rendered Markdown typography (separate from app chrome) |
| Rust commands | `src-tauri/src/lib.rs:300-309` | `invoke_handler` registers all 8 commands |
| Rust entry | `src-tauri/src/main.rs:4-6` | Calls `esuyo_markdown_lib::run()`; hides console on Windows release |
| Dev server | `vite.config.js` | Port `1420` strict, HMR `1421` on mobile, ignores `src-tauri/**`, pre-bundles Quill/marked/turndown |
| Bundle config | `src-tauri/tauri.conf.json` | `productName`, `identifier com.esuyo.markdown`, window `1200×800`, `targets: all` |
