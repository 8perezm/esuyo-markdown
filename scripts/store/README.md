# Microsoft Store listing tooling

Three tracks: (1) draft copy for approval, (2) browser-driven Partner Center edits, (3) CLI/API + CSV automation. See `docs/microsoft-store-listing.md` for the proposed copy and the reasons behind it.

**Nothing in this folder submits anything by default.** Every write path has an explicit approval gate.

## 1. Copy (source of truth)

- `listing/listings.json`, source of truth for English copy, keywords, rank-tracking markets, locale overrides, and the **top-10 localization experiment** config (waves, name candidates, per-market queries).
- `listing/translations.json`, AI-draft localized listings for the 10 experiment languages. Every string is flagged `aiDraft` / `nativeReviewRequired`; **a native speaker must review before submission**.
- `node scripts/store/gen-listing-csv.mjs --preview`, review the copy without touching Partner Center.

To change copy, edit `listings.json` (or the translation drafts), then re-run the preview. Keep descriptions natural; Microsoft warns that irrelevant keywords can hurt ranking.

## 2. Browser workflow (agent + human)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/store/start-partner-browser.ps1
```

This starts Chrome with a dedicated profile in `.store-browser/` (gitignored) and CDP on `http://127.0.0.1:9222`. The agent can attach with Playwright (`chromium.connectOverCDP`) or a Chrome DevTools MCP tool pointed at that endpoint.

Rules for the agent:

1. **You sign in and complete MFA.** Never ask for, store, or type a password/one-time code into the repo or chat.
2. Read pages, navigate, fill fields, save drafts, upload approved assets, read reports, all fine.
3. Before any irreversible action (Submit for certification, Publish, delete, remove a listing), stop and ask for explicit human approval. Show a diff/screenshot of what will change.
4. Prefer the built-in language helper: paste `docs/microsoft-store-languages-autotick.js` in the language-picker console, run `__esuyoTick.preview()` then `__esuyoTick.tick()`, and review before saving. Scroll the list first if rows are virtualised.
5. Partner Center is an SPA: re-check the screen after every save, and assume selectors break. Take a snapshot/screenshot before clicking anything that says Save/Submit.
6. Close the browser when done. The profile holds session cookies, keep it out of git.

Rank tracking uses the same endpoint but needs no sign-in:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/store/start-partner-browser.ps1 -RankOnly -Headless
node scripts/store/check-rank.mjs
```

Results append to `scripts/store/out/rank-history.jsonl` (gitignored). Check again 7 and 14 days after a listing change.

For the top-10 experiment, each market's `hl`/`gl` and local-language queries are configured in `listings.json → localizationExperiment.rankMarkets`:

```powershell
node scripts/store/check-rank.mjs --market en-GB   # baseline only
node scripts/store/check-rank.mjs --market de      # one treatment market
node scripts/store/check-rank.mjs --all-markets    # all 10 languages + en-GB
```

Each JSONL record now includes `market`, `hl` and `gl` so the wave/control comparison can be sliced by market.

## 3. CLI / API + CSV automation

The repo already auto-submits MSIX packages in `.github/workflows/publish.yml` using `msstore` and four GitHub secrets plus `STORE_PRODUCT_ID`. The new scripts add **metadata-only** updates with a diff and approval gate.

### One-time setup (if not already done)

1. First publication must have been done manually in Partner Center.
2. Partner Center → Account settings → Tenants: associate a Microsoft Entra tenant (needed even for individual accounts).
3. Partner Center → Account settings → Users: add an Entra app, or Azure Portal → App registrations, then assign it to your Seller account with Submissions role.
4. Local machine: install .NET 9 Desktop Runtime and the CLI:
   ```powershell
   winget install Microsoft.DotNet.DesktopRuntime.9
   winget install "Microsoft Store Developer CLI"
   msstore            # first run guides you through reconfigure
   ```
   Use **Entra ID** credentials, not your personal Microsoft account. Never put a client secret in this repo, CI uses GitHub secrets; locally use `msstore reconfigure` and let the CLI store the credential.
5. CI secrets/variables are documented in `publish.yml:303-316`.

### Metadata updates (with approval gate)

```powershell
node scripts/store/apply-metadata.mjs                              # dry run: prints field-by-field diff
node scripts/store/apply-metadata.mjs --commit --approved-by "Miguel" # writes the draft via updateMetadata
```

Dry run calls `msstore submission get`, patches only fields that already exist in the submission JSON, writes `out/submission.next.json`, and prints every old → new value. `--commit` requires a named approver and sends `submission updateMetadata`. **Publishing is not part of this script**, do that in Partner Center or with a separate, explicitly approved `msstore submission publish`.

### Localised listings via CSV

Microsoft's CSV export owns the schema (Field / ID / Type plus one column per language-locale). Never hand-edit those three columns.

1. Partner Center → your app → Store listings → **Export listing**. Save the CSV anywhere.
2. `node scripts/store/gen-listing-csv.mjs --template <export.csv>` writes `out/listings.generated.csv`.
3. Add `--experiment` for all 10 wave locales, `--wave 1` for the 5 treatment locales or `--wave 2` for the 5 control locales. The AI drafts from `translations.json` are merged automatically. Without a restricting flag you get all 75 app locales with only the `localeOverrides` entries filled. A language column is overwritten only when an override exists, or when its current text is an exact copy of the old English `default` (stale copy, not a translation). Real translations and empty cells are left alone; empty cells inherit the new `default` on import.
4. Missing language columns are appended to the header. Schema verified against a real export on 2026-11-23: the third column is `Type (Type)`, short title is `ShortTitle` (not `SortTitle`), and keywords are `SearchTerm1` to `SearchTerm7` (no `Keywords` field). Screenshot and other asset URLs are copied from `en-us` into every new language column. The generator refuses templates without Field, ID, Type and default columns.
5. Review, then Partner Center → **Import listings** → **Import .csv**. Check "View errors" if any field is rejected; nothing is saved until the whole file validates.

The app ships 75 i18n locales but the experiment deliberately uses only 10. The generator prints a **native-review warning** whenever translation drafts are merged, do not import until a native speaker has reviewed every field.

## File map

| Path | Purpose |
| --- | --- |
| `listing/listings.json` | Source of truth for English copy, keywords, rank markets, experiment config, locale overrides |
| `listing/translations.json` | AI-draft localized listings for the 10 experiment languages (native review required) |
| `gen-listing-csv.mjs` | Export-template-driven CSV generator (`--preview`, `--experiment`, `--wave`, `--locales`) |
| `apply-metadata.mjs` | `msstore submission get` → diff → optional `updateMetadata` (no publish) |
| `check-rank.mjs` | CDP rank tracker (`--market`, `--all-markets`) |
| `start-partner-browser.ps1` | Dedicated Chrome profile + CDP endpoint |
| `out/` | Generated CSV/JSON/rank history, gitignored |

## Policy reminders

Automate only your own account. No fake installs, no incentivised or fake reviews, no keyword stuffing. Microsoft's ranking has no published weights; the levers you control are relevance, click-through, genuine installs/engagement, ratings, freshness and app quality.
