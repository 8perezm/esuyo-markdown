# Microsoft Store listing assets

## Upload these five images

All files in `upload/` are **1920 × 1080 PNG**, ~0.6–0.7 MB each (well under the 50 MB limit, and comfortably above the recommended 1366 × 768 minimum). Upload in this order:

| File | Focus | App screenshots |
|------|-------|-----------------|
| `upload/01-hero.png` | Product name + overall pitch | 1 — welcome/library view |
| `upload/02-reading.png` | Reading experience | 2 — light + dark themes |
| `upload/03-browsing.png` | Folder navigation | 2 — nested tree + flat list |
| `upload/04-editing.png` | Editing | 2 — rich text + raw source |
| `upload/05-private.png` | Privacy / offline positioning | 1 — reading view |

Every image has a single focus and at most two app screenshots, so each stays readable at Store thumbnail size. The screenshots embedded in them are real captures of the running app from `screenshots/`.

## Supporting folders (not for upload)

- `screenshots/` — seven clean, unbranded 1366 × 768 app captures. Useful as spare uploads or as inputs when rebuilding the five images.
- `promotional/source/slides.html` — editable HTML source for all five upload images. Change copy/colors here, then re-render (see [`docs/store-imagery.md`](../docs/store-imagery.md)).
- `promotional/hero-bg.png` — optional AI-generated background artwork kept as a source asset; the current five images use CSS backgrounds instead.
- `logos/` — `StoreLogo-50x50.png` (required) plus 44/150/310 px tiles, copied from `src-tauri/icons/`.
- `scripts/` — `capture-window.ps1` and `normalize-screenshots.ps1` for regenerating the raw captures.

## Partner Center notes

- Applies to your listing rules: landscape or portrait, PNG only, max 30 files, under 50 MB each, 1366 × 768 or larger.
- 1920 × 1080 is used here for extra sharpness; 4K (3840 × 2160) is supported but unnecessary at this file count.
- App name must be exactly **Esuyo Markdown** (see `docs/store-listing.md`).
- Keep wording in the images consistent with `docs/store-listing.md`: reader **and** editor, flat **and** tree, light **and** dark, private/offline, no account.

## Regenerating

See [`docs/store-imagery.md`](../docs/store-imagery.md) for the full step-by-step workflow.
