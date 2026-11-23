# Reference (Tauri Commands + Settings)

Purpose: exact IPC contracts between `src/main.js` and `src-tauri/src/lib.rs`.

All commands are registered in `src-tauri/src/lib.rs:300-309`. Errors are returned as `Result<_, String>` and surface as rejected `invoke()` promises in JS.

## Commands

### `pick_folder() → Option<String>`

Opens the native folder picker (`src-tauri/src/lib.rs:67-83`). Returns the absolute path or `null` when cancelled.

### `scan_md_files(folder_path: string, use_gitignore: boolean) → MarkdownFile[]`

Recursively lists Markdown files (`src-tauri/src/lib.rs:177-243`).

```ts
type MarkdownFile = {
  name: string;          // file stem, e.g. "welcome"
  path: string;          // absolute path
  relative_path: string; // relative to folder_path, e.g. "docs/intro.md"
};
```

- Matches extensions case-insensitively: `.md`, `.markdown`.
- Follows symlinks; sorts by lowercased `relative_path`.
- When `use_gitignore` is `true`: prunes directories matching the built-in blocklist (`node_modules .git .svn .hg dist build out target .next .nuxt .svelte-kit .cache .parcel-cache .turbo .vercel .netlify coverage .vscode .idea __pycache__ .pytest_cache .mypy_cache venv .venv env vendor Pods .gradle .terraform .expo`) plus root `.gitignore` patterns. When `false`: returns every Markdown file.

### `read_file(file_path: string) → string`

Reads a file as UTF-8 (`src-tauri/src/lib.rs:247-254`). Errors when missing/not-a-file or unreadable.

### `write_file(file_path: string, content: string) → void`

Overwrites/creates a file (`src-tauri/src/lib.rs:258-261`). Used for Save, Save As, and New File.

### `delete_file(file_path: string) → void`

Moves the file to the OS Recycle Bin/Trash via the `trash` crate (`src-tauri/src/lib.rs:265-272`). Not permanent until Trash is emptied.

### `pick_save_file() → Option<String>`

Save dialog titled `Save As` with default name `untitled.md` (`src-tauri/src/lib.rs:276-294`). Returns the chosen path or `null`.

### `get_settings() → AppSettings`

Returns persisted settings, or `{ theme: "dark", …defaults }` when `settings.json` is absent (`src-tauri/src/lib.rs:87-97`).

### `save_settings(settings: AppSettings) → void`

Normalizes (`\` → `/`), dedupes, caps `recent_folders` at 10, then pretty-writes `settings.json` (`src-tauri/src/lib.rs:101-115`).

## Settings schema (`AppSettings`, `src-tauri/src/lib.rs:16-40`)

| Field | Type | Notes |
|-------|------|-------|
| `recent_folders` | `string[]` | Newest first, max 10 |
| `theme` | `"light" \| "dark"` | Fresh installs default `dark` |
| `default_font` | `string \| null` | Body font; JS fallback `Inter` |
| `header_font` | `string \| null` | Heading font; JS fallback `Inter` |
| `code_font` | `string \| null` | Code font; JS fallback `JetBrains Mono` |
| `default_font_size` | `number \| null` | px; fallback `16` |
| `header_font_size` | `number \| null` | px base for h1; fallback `32` |
| `code_font_size` | `number \| null` | px; fallback `14` |
| `zoom_level` | `number` | Percentage multiplier on the font sizes above: `50 \| 67 \| 75 \| 80 \| 90 \| 100 \| 110 \| 125 \| 150 \| 175 \| 200 \| 250 \| 300`. `#[serde(default = "default_zoom_level")]` — old files without the key load as `100` |
| `use_gitignore` | `boolean` | `#[serde(default = "default_true")]` — old files without the key load as `true` |
| `folder_tabs` | `object` | `#[serde(default)]` — per-folder tab state: normalized folder path → `{ tabs: string[], active: string \| null }`. Paths normalized to `/`, max 30 tabs per folder, entries pruned when the folder leaves `recent_folders` |

JS-side defaults are applied in `src/main.js:356-361`. Storage path is `<app_data_dir>/settings.json` (`src-tauri/src/lib.rs:56-63`).

## Frontend keyboard shortcuts (`src/main.js:1054-1075`)

| Keys | Action | Condition |
|------|--------|-----------|
| `ArrowDown` / `ArrowUp` | Next / previous file (opens/focuses its tab) | Read mode only (not while editing) |
| `Ctrl/⌘ + N` | New file | Always |
| `Ctrl/⌘ + S` | Save active tab | Edit mode only |
| `Ctrl/⌘ + W` | Close active tab (offers to save if dirty) | Always |
| `Ctrl/⌘ + Tab` / `Ctrl/⌘ + PageDown` | Next tab | Always |
| `Ctrl/⌘ + PageUp` | Previous tab | Always |
| `Ctrl/⌘ + +` (or `=`) | Zoom in one step | Always |
| `Ctrl/⌘ + -` | Zoom out one step | Always |
| `Ctrl/⌘ + 0` | Reset zoom to `100%` | Always |
| `Ctrl/⌘ + mouse wheel` | Zoom in / out (up / down), throttled; works anywhere in the app | Always |

Zoom is applied by scaling `--md-font-size`, `--md-heading-base-size` and `--md-code-font-size` on `:root`, so it affects both the rendered Markdown view and the WYSIWYG/source editors. It also scales `--content-max-width` (from an 800px base) so the reading column widens with the text, capped at `100%` of the available window width via `min()`. The `100%` indicator in the editor bar is clickable to reset.

Arrow keys are deliberately not intercepted in edit mode so Quill/the textarea keeps them. Middle-clicking a tab also closes it.

## Capabilities (`src-tauri/capabilities/default.json`)

Window `main` is granted `core:default`, `core:window:allow-destroy` (required so the close-requested handler can quit after resolving unsaved tabs), `dialog:allow-open`, `dialog:allow-save`, `dialog:default`. No other plugins (shell, http, fs-extra) are enabled — file access goes only through the 8 commands above.
