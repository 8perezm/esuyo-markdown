i18n Plan — Esuyo Markdown
1. Goals / non-goals
Goals: translate all app chrome (menus, dialogs, settings, tooltips, status/error text, About) into a configurable set of LTR locales; auto-detect the OS locale on first run; let the user override it in Settings.
Non-goals: RTL layouts, translating Markdown document content, translating Rust developer errors (v1), store-listing localization (separate track), locale-based font defaults (explicitly excluded — defaults stay Inter/Inter/JetBrains Mono at 16/32/14).
2. Scope — where text lives today
Location	Count	Examples
index.html	~40	Button labels, settings headings/hints, dialog copy, title/aria-label, About panel
src/main.js	~30	alert() messages, native dialog titles, dirty-changes dialog, tooltip variants, empty states
src-tauri/src/lib.rs	few	Technical format! error strings that surface in alerts
The About panel's license name (AGPL-3.0) stays untranslated; only surrounding labels do.
3. Architecture: custom dictionary, no dependency
A dictionary module is the right fit: ~70–100 keys, vanilla frontend, and it avoids the optimizeDeps.include churn noted in AGENTS.md.
src/i18n/
  index.js      # locale resolution, t(), applyTranslations(), plural helper
  en.js         # flat key → string
  es.js         # etc.
- Flat dotted keys (menu.save, dialog.delete.title) — no deep merge, easy to diff and lint.
- Fallback chain: requested → base language (pt-BR → pt) → en → key.
- t(key, params) does {name} interpolation. Plurals go through Intl.PluralRules with _one / _other (and _few / _many where the language needs them — Russian, Polish).
4. Static HTML
Annotate the shell:
- data-i18n="key" → sets textContent
- data-i18n-title="key" / data-i18n-aria-label="key" → sets attributes
applyTranslations() sweeps [data-i18n] and the attribute variants.
Word-order trap: the delete confirm is Are you sure you want to delete <strong>{file}</strong>?. Don't concatenate translated fragments around the filename — other languages reorder. Either split it into a translated question line plus a separate filename line, or render from a template string where {file} is inserted via document.createTextNode (never innerHTML, to avoid XSS from filenames). The simpler split layout is preferable.
5. Dynamic JS strings
Replace hardcoded literals with t():
- main.js:504–510 — dirty dialog title, button labels, and the singular/plural message (use Intl.PluralRules).
- main.js:505–506 — Save selected & ${verb} composes a translated verb into a sentence. Avoid this pattern; use distinct keys per action (dialog.dirty.saveSelectedClose, ...Switch) since grammar varies.
- main.js:554, 1542, 1585, 1623, 1670, 2357, 2392, 2441 — error alerts with {error} / {file} params.
- main.js:693 — editor placeholder.
- main.js:1042, 1142, 1181 — conditional tooltips (two keys each).
- main.js:1484, 1533, 1593, 1637, 2402 — "No recent folders" and native open/save dialog titles.
6. Re-render strategy
Tabs, file lists, tree nodes, and dirty rows are built at runtime, so a locale change would require re-rendering all of them. Simplest correct approach: on changing language in Settings, persist and call window.location.reload(). Desktop app, infrequent action — this avoids half-translated UI states entirely.
7. Settings & persistence
Frontend: load settings.locale (default undefined = system); resolve via navigator.language; set document.documentElement.lang and translated document.title at startup.
Settings UI (index.html): new "Language" section with <select id="language-select">, options System default + native names (Español, Deutsch, 简体中文…). On change → assign, persistSettings(), reload.
Rust (lib.rs:27): add #[serde(default)] pub locale: Option<String> to AppSettings — backward compatible by design. No other backend change.
8. Rust-side errors
Leave English in v1. Most are developer-facing (Parse settings:, Dialog error:) and rare. If you later want them localized, the clean route is returning error codes and mapping them in JS — not passing a locale into Rust.
9. Fonts interplay
The Sans-serif / Serif / Monospace <optgroup> labels and the settings labels (Body Font, Size) need keys. The CJK script hints (简体中文, 日本語…) are already in native script and should stay as-is. fontLabel() from the font patch is where a translated group label would compose.
10. Layout risks
German and Finnish run ~30% longer than English; CJK wraps differently. Check Open Folder, Save selected & …, and the settings field rows for overflow — likely need flex-wrap or min-width: 0. Test German first; it's the standard stress locale.
11. Phases
1. Scaffold src/i18n/, t(), applyTranslations(), extract en.
2. Add locale to frontend + Rust settings; detection; Settings selector; reload-on-change.
3. Convert index.html to data-i18n attributes.
4. Convert main.js literals to t().
5. Ship a second locale (Spanish) as proof, then grow.
6. Locale the settings/font labels; run German layout pass.
7. Store listing (separate).
12. Risks
- Missing keys — add a dev-mode console warning when a key resolves to itself.
- XSS via interpolation — filenames must go through textContent, never innerHTML.
- Plural complexity — Intl.PluralRules, not boolean singular/plural.
- Fragmented sentences — never translate pieces and concatenate.
- Accessibility drift — aria-label/title are part of the key set.
- No automated tests: manual checklist per locale (open folder, read, edit/save, delete, dirty dialog, settings, about).
