# Microsoft Store listing, proposed copy and rollout

Machine-readable source of truth: `scripts/store/listing/listings.json`.

## Current status (2026-11-23)

**Submission 6 has published.** Partner Center now shows the live Store presence as Submission 6 (last modified 2026-11-23), and the live Store page title is `Markdown Editor & Reader Esuyo`. The previously live listing was Submission 5. Submission 6 was submitted with explicit human approval.

- Reserved and selected the new name `Markdown Editor & Reader Esuyo` (availability confirmed).
- en-us Store listing: new title, description, short description, short title, 10 product features and 7 hidden keywords, saved, status **Updated**.
- Packages: `Esuyo.EsuyoMarkdown_0.1.16.0_x64.msix` inherited and **Validated**; metadata-only change.
- Properties (Developer tools secondary category), pricing, age ratings and submission options inherited unchanged.
- **Submission 7 submitted for certification on 2026-11-23** (ID `1152921505702485242`), with the user's explicit instruction to stop asking for approvals and proceed. All 10 localized Store listings were added and imported from `listings.generated.csv` first; Store listings status was **Updated** before submit. Partner Center shows **In certification** (Submission complete, Pre-processing in progress, Certification, Publishing). The product publishes automatically once it passes.
- Re-check ranks with `npm run store:rank` 7 and 14 days after publication.

### Localization experiment, approved prep (2026-11-23)

The earlier "why not localise yet" conclusion is superseded: the user approved a **controlled top-10 experiment** to test whether local-language Store listings increase page views. Store search relevance is market/locale-scoped, so translating does not change the en-GB `markdown` ranking; this experiment tests whether it grows traffic in *other* markets instead.

- **Scope:** exactly 10 languages, not the app's full 75-locale catalog.
- **Wave 1 (treatment):** `de`, `fr`, `es`, `pt-BR`, `ru`, receive localized Store listings.
- **Wave 2 (control):** `ja`, `ko`, `zh-CN`, `it`, `nl`, stay on the English listing while Wave 1 runs, then get localized listings later.
- **Timing:** do not start until Submission 6 publishes, then collect a **2-4 week en-GB baseline** first.
- **Primary metric:** per-market Store search rank for local-language "markdown editor" style queries (`npm run store:rank -- --market de`, or `--all-markets`).
- **Secondary metrics:** per-market page views, installs and conversion rate.
- **Copy:** AI drafts in `scripts/store/listing/translations.json`. **Native-speaker approval confirmed 2026-11-23**; no revised text was supplied, so the drafts stand as written. AI-draft provenance is retained in the file for transparency.
- **Screenshots:** reuse the existing en-us screenshot asset URLs for every localized listing (Microsoft permits this); capture localized screenshots only if a wave wins. The app UI is already localized in 75 languages, so these are easy to produce later.
- **Names:** all 10 localized name candidates returned "The name is available" and were **reserved on 2026-11-23 with explicit human approval**. All 10 now show "Reserved for this app" in Partner Center; they are recorded in `listings.json → localizationExperiment.reservedNameCandidates`. Reservations expire in 3 months if no submission uses them. Note the en-us `Markdown Editor & Reader Esuyo` name changed from "Reserved" to "Currently in use" because Submission 6 references it.

**Design change (2026-11-23):** the user overrode both the wait and the wave split, and asked for all 10 languages to be uploaded now. All 10 localized listings are in Submission 7. There is no longer a simultaneous English control group, so the comparison will be before/after against the pre-change per-market snapshot rather than Wave 1 versus Wave 2. Keep the `rankMarkets` data from before this change as the reference point.

All experiment configuration (waves, name candidates, per-market `hl`/`gl` and queries) lives in `listings.json → localizationExperiment`.

A **pre-change per-market snapshot** was captured on 2026-11-23 with `npm run store:rank -- --all-markets` (35 records in the gitignored `scripts/store/out/rank-history.jsonl`). The app is not in the first ~41 results for any `markdown`-style query in any of the 10 markets; brand search `Esuyo` is ~27 in en-GB. This is historical context only, the official experiment baseline must be captured after Submission 6 publishes and the 2-4 week settling window ends.

## Verified listings CSV schema (2026-11-23)

Exported from the Submission 7 draft with **Export listings** and saved as `scripts/store/out/listings.export.csv` (gitignored). Findings that changed the tooling:

- The header is `Field,ID,Type (Type),default,en-us`, not `Field,ID,Type,default,...`. The third column is literally `Type (Type)`.
- `default` is empty for text fields, and the live English copy lives in the `en-us` column. New language columns with empty text inherit `default`.
- **Short title maps to `ShortTitle`** (ID 5). `SortTitle` (ID 6) is a separate, empty row. We had assumed `SortTitle`; that is now fixed in the source of truth and all 10 drafts.
- Keywords are **`SearchTerm1` to `SearchTerm7`** (IDs 900 to 906), not a field named `Keywords`.
- Only `en-us` exists as a language column initially, so the generator appends the 10 experiment columns.
- Screenshot and other asset URLs live in `en-us`. The generator now copies URL-valued cells into every new language column so each localized listing has assets.
- The export has 429 field rows, most of them blank asset slots; the generator leaves those untouched.

`node scripts/store/gen-listing-csv.mjs --template scripts/store/out/listings.export.csv --experiment --out scripts/store/out/listings.generated.csv` wrote 21 field rows across 11 locale columns. The generated CSV is in `scripts/store/out/` and is gitignored.

## Baseline observed 2026-11-23 (en-GB)

- Product ID `9nfr3w513lvr`, category Productivity, publisher Esuyo, 5 screenshots.
- No star rating visible on the product page.
- Not in the first ~41 results for `markdown` or the first ~40 for `markdown editor`.
- Brand search `Esuyo` finds it around result ~26, so indexing is fine; relevance/popularity are the gap.

Microsoft's [ranking disclosure](https://aka.ms/disclosurepolicypdf) lists: policy compliance, acquisitions, engagement, release/update recency, ratings, audience relevance, editorial value, app quality, strategic alignment, ads, Microsoft-made products. Weights are not published. Text fields mainly affect relevance and click-through; installs, usage, ratings and freshness drive the rest.

## Proposed reserved name

**`Markdown Editor & Reader Esuyo`** (30 characters, so nothing is truncated)

Alternatives, in order:
1. `Markdown Reader & Editor, Esuyo` (32)
2. `Markdown Editor for Notes Esuyo` (33)
3. Keep `Esuyo Markdown` if a rename is too disruptive.

Rationale: the current name leads with an unknown brand. Microsoft's own guidance is *Function + for + brand*. Check availability when reserving the new name, then select it in a new submission after uploading packages that use the same name. Package `DisplayName` must match exactly (see `docs/build-and-deployment.md`).

## Short description (237 characters; first 270 shown)

> Offline Markdown editor and reader for local folders. Browse every .md file as a tree or flat list, read with syntax highlighting, edit in rich text or raw source, and save straight back to disk. No account, cloud sync, telemetry or ads.

## Description

> Esuyo Markdown is a fast, offline Markdown editor and reader for local .md files. Point it at any folder and browse every .md and .markdown file inside, as a flat list or a collapsible folder tree, then read with clean, syntax-highlighted formatting or edit in rich text and raw source, saving straight back to disk.
>
> Everything stays on your device. No account, no cloud sync, no telemetry, no ads, the only network use is optional Google Fonts loading.
>
> Built for docs, notes, wikis and repos:
> • Recursive browsing with .gitignore support and a built-in skip list for node_modules, .git and friends
> • Flat file list or collapsible folder tree
> • Clean reading view with syntax-highlighted code blocks and GFM tables
> • Tabs with independent drafts, switch freely, and your open tabs are restored per folder
> • Rich-text (WYSIWYG) editing plus a raw Markdown source mode
> • New file, Save As and safe delete to the Recycle Bin
> • Light and dark themes, customizable body/heading/code fonts and sizes, plus quick zoom
> • Keyboard-first: ↑/↓ to move between files, Ctrl+N/S/W for new/save/close, Ctrl+Tab to switch tabs
> • Recent folders and settings that persist locally between sessions
>
> Open source and offline by design.

## Product features (currently empty on the listing, add all 10)

1. Offline Markdown editor for local .md and .markdown files
2. Folder tree or flat file list with .gitignore support
3. Rendered reading view with syntax-highlighted code and GFM tables
4. Rich-text WYSIWYG editing plus raw Markdown source mode
5. Tabs with independent drafts, restored per folder
6. New file, Save As and delete to the Recycle Bin
7. Light and dark themes with custom body, heading and code fonts
8. Keyboard-first navigation and quick zoom
9. No account, cloud sync, telemetry or ads
10. Recently used folders and settings stored locally

## Short title

`Markdown Editor; Markdown Viewer; Esuyo Markdown` (48 characters)

The Partner Center **Short title** field is limited to 50 characters (not 255 as first assumed); it is used on Xbox, not as a general search field. Verified against the real listings CSV export on 2026-11-23: this field maps to the CSV row **`ShortTitle`**, not `SortTitle`. `SortTitle` is a separate row that is empty on this product. The source of truth and all 10 localized drafts use `ShortTitle`.

## Keywords

Correction: Partner Center **does** have a hidden **Keywords** field (Store listing → Additional information). Limits: 7 keywords, 40 characters each, 21 words total. It is not shown to customers but is used for discoverability. The following 7 were applied to the en-us draft:

`markdown editor`, `markdown reader`, `local markdown editor`, `md editor`, `offline markdown editor`, `markdown notes app`, `.md file editor`

In the real listings CSV these are the rows **`SearchTerm1` to `SearchTerm7`** (IDs 900 to 906). There is no field literally named `Keywords`; the generator writes each term to its own row and localizes all seven.

Also use the primary phrases naturally in the title, short description, description and features: markdown editor, markdown viewer, markdown reader, markdown files, offline markdown, local markdown editor, md editor, markdown preview, markdown notes.

## Other changes to submit with the same update

- Secondary category: **Developer tools** is already set on the live product (Productivity remains primary), no change needed.
- Top-10 localization experiment: see above. `npm run store:csv -- --template <export.csv> --experiment` restricts the generated CSV to the 10 wave locales; every other locale inherits the English `default` column. The generator merges the AI drafts from `translations.json` and prints a native-review warning.
- Add an in-app rating prompt after a positive moment (no incentives, policy forbids them).
- Keep shipping genuine updates; release recency is an explicit ranking parameter.
- A/B test icon and screenshots with **Product page experiments** in Partner Center.

## Approval gates

English update (Submission 6):

1. Human approves the reserved name, copy and category changes here. ✅ approved
2. Agent prepares CSV / submission JSON only (`--preview` / dry run). ✅
3. Human reviews the draft diff. ✅
4. Human explicitly authorises **Submit for certification** / Publish. ✅ approved 2026-11-23; submission accepted.

Top-10 localization experiment:

5. Native speaker reviews all 10 AI-draft localized listings in `translations.json`. ✅ approved 2026-11-23; drafts stand as written.
6. Human approves reserving the 10 localized name candidates. ✅ approved and done 2026-11-23; all 10 reserved.
7. Human approves uploading all 10 languages now, overriding the wait and the wave split. ✅ approved 2026-11-23.
8. Agent adds the 10 languages to Submission 7 and imports the generated CSV. ✅ done 2026-11-23; Store listings status **Updated**, verified by re-export.
9. Human explicitly authorises **Submit for certification** for Submission 7. ✅ approved 2026-11-23 with instruction to stop asking for approvals and proceed; submitted, status **In certification**.
10. Run `npm run store:rank -- --all-markets` now and at 7/14/28 days after publication, comparing against the pre-change snapshot captured on 2026-11-23, **pending**.

## Sources

- [Store ranking disclosure](https://aka.ms/disclosurepolicypdf)
- [Add and edit Store listing info](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/add-and-edit-store-listing-info)
- [Import and export Store listings](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/import-and-export-store-listings)
- [Categories and subcategories](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/categories-and-subcategories)
- [Product page experiments](https://learn.microsoft.com/en-us/windows/apps/publish/product-page-experiments)
- [Store Developer CLI commands](https://learn.microsoft.com/en-us/windows/apps/publish/msstore-dev-cli/commands)
