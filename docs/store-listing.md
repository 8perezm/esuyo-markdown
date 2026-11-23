# Microsoft Store Listing

Source of truth for the Microsoft Store listing copy. Keep this in sync with the
product name and feature set before each submission.

- App name (must match Partner Center exactly): **Esuyo Markdown**
- Product ID: `9NFR3W513LVR`
- Short description limit: 256 characters
- Full description limit: 4000 characters

## Short description

```
Read and edit Markdown files from any folder. Tree or flat browse, tabs, rich text and source editing, syntax highlighting, light/dark themes. Private and offline — no account or telemetry.
```

## Full description

```
Esuyo Markdown is a fast, private desktop reader and editor for your Markdown files. Point it at any folder and browse every .md and .markdown file inside — as a flat list or a collapsible folder tree — then read with clean, syntax-highlighted formatting or edit in rich text and raw source, saving straight back to disk.

Everything stays on your device. No account, no cloud sync, no telemetry, no ads — the only network use is optional Google Fonts loading.

Built for docs, notes, and repos:
• Recursive browsing with .gitignore support and a built-in skip list for node_modules, .git, and friends
• Flat file list or collapsible folder tree
• Clean reading view with syntax-highlighted code blocks and GFM tables
• Tabs with independent drafts — switch freely, and your open tabs are restored per folder
• Rich-text (WYSIWYG) editing plus a raw Markdown source mode
• New File, Save As, and safe delete to the Recycle Bin
• Light and dark themes, customizable body/heading/code fonts and sizes, plus quick zoom
• Keyboard-first: ↑/↓ to move between files, Ctrl+N/S/W for new/save/close, Ctrl+Tab to switch tabs, Ctrl+ +/-/0 or Ctrl+wheel to zoom
• Recent folders and settings that persist locally between sessions

Open source and offline by design.
```

## Notes on accuracy (why the old copy was revised)

- Brand is **Esuyo Markdown** (with a space), per `tauri.conf.json` `productName` and the `DisplayName` in `src-tauri/msix/AppxManifest.template.xml`. Partner Center requires an exact match.
- It is both a reader and an editor; calling it only a "reader" undersells the main feature.
- Browsing supports both a flat list and a collapsible tree (not just a tree), and matches `.markdown` as well as `.md` (`docs/reference.md`).
- The app is cross-platform (Windows, macOS, Linux), though this listing is for the Windows Store build. The Store MSIX bundles WebView2 as an offline installer, so no separate WebView2 download is needed (`docs/build-and-deployment.md`).
- Tabs, per-tab drafts, per-folder tab restoration, and file management (New File incl. folder context menu, Save As, reload) were omitted from the old copy (`README.md`, `docs/reference.md`).
- Keyboard shortcuts and zoom are documented in `docs/reference.md`.
- Privacy claim verified: no accounts, telemetry, or analytics; the only network request is optional Google Fonts loading (`README.md`, `PRIVACY.md`).
- "Open source" is accurate: AGPL-3.0 (`README.md`, `LICENSE`). Drop the word if the Store listing should not emphasize licensing.
