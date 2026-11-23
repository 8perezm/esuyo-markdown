import fs from "node:fs";

const entries = fs
  .readFileSync("scripts/i18n/microsoft-language-list.txt", "utf8")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter(Boolean);

// Base Microsoft language name → app locale code. `null` means the app has
// no dictionary for that language (or it is an excluded RTL script).
const base = {
  Afrikaans: "af", Albanian: "sq", Amharic: "am", Arabic: null, Armenian: "hy",
  Assamese: null, Bangla: "bn", Basque: "eu", Belarusian: "be", Bulgarian: "bg",
  "Cajun French": null, Catalan: "ca", Cherokee: null, Croatian: "hr", Czech: "cs",
  Danish: "da", Dari: null, Dutch: "nl", English: "en", Estonian: "et",
  Filipino: "fil", Finnish: "fi", "Franco-Provençal": null, French: "fr",
  Galician: "gl", Georgian: "ka", German: "de", Greek: "el", Gujarati: "gu",
  Hausa: null, Hebrew: null, Hindi: "hi", Hungarian: "hu", Icelandic: "is",
  Igbo: null, Indonesian: "id", Inuktitut: null, Irish: "ga", isiXhosa: null,
  isiZulu: "zu", Italian: "it", Japanese: "ja", Kannada: "kn", Khmer: "km",
  "K'iche'": null, Kinyarwanda: null, Kiswahili: "sw", Konkani: null, Korean: "ko",
  Kurdish: null, Lao: "lo", Latvian: "lv", Lithuanian: "lt", Luxembourgish: "lb",
  Macedonian: "mk", Malay: "ms", Malayalam: "ml", Maltese: "mt", Maori: null,
  Marathi: "mr", Nepali: "ne", "North Macedonia": "mk", Odia: null,
  "Persian/Farsi": null, Polish: "pl", Quechua: null, Romanian: "ro", Russian: "ru",
  "Scottish Gaelic": null, "Sesotho sa Leboa": null, Setswana: null, Sindhi: null,
  Sinhala: "si", Slovak: "sk", Slovenian: "sl", Spanish: "es", Swedish: "sv",
  Tajik: null, Tamil: "ta", Tatar: null, Telugu: "te", Thai: "th", Tigrinya: null,
  Turkish: "tr", Turkmen: null, Ukrainian: "uk", Urdu: null, Uyghur: null,
  Valencian: "ca", Vietnamese: "vi", Welsh: "cy", Wolof: null, Yoruba: null,
};

function resolve(entry) {
  // Azure-style entries are "<Language> (<Variant>)..." — the first word(s)
  // before the first " (" identify the language.
  const language = entry.split(" (")[0];
  const special = {
    Azerbaijani: () => (entry.includes("(Latin)") ? "az" : null),
    Bosnian: () => (entry.includes("(Cyrillic)") ? null : "bs"),
    Chinese: () => {
      if (entry.includes("(Traditional)")) return "zh-TW";
      if (entry.includes("(Simplified)")) return "zh-CN";
      if (/Hong Kong|Macao|Taiwan/.test(entry)) return "zh-TW";
      return "zh-CN";
    },
    Kazakh: () => (entry.includes("(Arabic)") ? null : "kk"),
    Kyrgyz: () => (entry.includes("(Cyrillic)") || language === "Kyrgyz" ? "ky" : null),
    Mongolian: () =>
      entry.includes("(Cyrillic)") || entry === "Mongolian" || entry === "Mongolian (Mongolia)"
        ? "mn"
        : null,
    Norwegian: () => (entry.includes("(Nynorsk)") ? null : "nb"),
    Portuguese: () => (entry.includes("(Brazil)") ? "pt-BR" : "pt"),
    Punjabi: () =>
      entry.includes("(Arabic)") || entry.includes("(Devanagari)") ? null : "pa",
    Serbian: () => (entry.includes("(Cyrillic)") ? null : "sr"),
    Uzbek: () => (entry.includes("(Cyrillic)") ? null : "uz"),
  };
  if (special[language]) return special[language]();
  return language in base ? base[language] : null;
}

const rows = entries.map((entry) => ({ entry, locale: resolve(entry) }));
const supported = rows.filter((r) => r.locale);
const byLocale = new Map();
for (const r of supported) {
  if (!byLocale.has(r.locale)) byLocale.set(r.locale, []);
  byLocale.get(r.locale).push(r.entry);
}

const lines = [];
lines.push("# Microsoft Store language checklist");
lines.push("");
lines.push(
  "Map of the **partner.microsoft.com** language checkboxes to the locales shipped in this app."
);
lines.push("Tick the boxes marked ☑ — those resolve to a dictionary in `src/i18n/`. Leave ☐ unticked.");
lines.push("");
lines.push(
  `**${supported.length} of ${rows.length} entries are supported**, covering **${byLocale.size} app locales**.`
);
lines.push("");
lines.push(
  "> Regional variants of the same language (e.g. every `English (…)` row) all resolve to one dictionary, so all of them are ticked. If the portal allows, ticking the plain base-language entry is sufficient — the app does not distinguish regions beyond the variants listed under “App locale” below."
);
lines.push("");
lines.push(
  "> **RTL languages are intentionally excluded** (Arabic, Hebrew, Persian/Farsi, Urdu, Uyghur, Dari, and Arabic-script variants such as Punjabi (Arabic)). Only LTR locales are shipped."
);
lines.push("");
lines.push("## Fastest way to do this");
lines.push("");
lines.push(
  "Paste `docs/microsoft-store-languages-autotick.js` into the DevTools Console on the partner-site language picker, then run `__esuyoTick.preview()` and `__esuyoTick.tick()`. It ticks every supported box in one pass and reports anything it could not find. Scroll the whole list into view first if the page virtualizes rows. `__esuyoTick.untick()` reverses it."
);
lines.push("");
lines.push(
  "If you would rather do it manually, tick the entries below. Plain language names cover their regional variants; the four script/region-specific entries at the end are needed because they map to a different (or the only supported) dictionary."
);
lines.push("");
const extras = ["Azerbaijani (Latin)", "Chinese (Traditional)", "Portuguese (Brazil)", "Valencian"];
const baseEntries = [...new Set([
  ...supported.map((r) => r.entry).filter((e) => !e.includes(" (")),
  ...extras.filter((e) => supported.some((r) => r.entry === e)),
])].sort((a, b) => a.localeCompare(b));
lines.push(baseEntries.map((e) => `- [ ] ${e}`).join("\n"));
lines.push("");
lines.push("## Checklist");
lines.push("");
lines.push("| Select | Microsoft Partner Center entry | App locale |");
lines.push("| :---: | --- | --- |");
for (const { entry, locale } of rows) {
  lines.push(`| ${locale ? "☑" : "☐"} | ${entry} | ${locale ? `\`${locale}\`` : "—"} |`);
}
lines.push("");
lines.push("## Ticked entries grouped by app locale");
lines.push("");
lines.push("| App locale | Microsoft entries to tick | Count |");
lines.push("| --- | --- | ---: |");
for (const [locale, list] of [...byLocale].sort((a, b) => a[0].localeCompare(b[0]))) {
  lines.push(`| \`${locale}\` | ${list.map((e) => escapeCell(e)).join("; ")} | ${list.length} |`);
}
lines.push("");
lines.push("## Notes");
lines.push("");
lines.push(
  "- The app resolves the OS locale with exact match → base language → `en`, plus aliases (`zh-Hans` → `zh-CN`, `no` → `nb`). A regional Windows locale such as `en-GB` or `fr-BE` therefore already works without a separate dictionary."
);
lines.push(
  "- Script variants are only supported where a matching dictionary exists: Serbian (Latin), Bosnian (Latin), Azerbaijani (Latin), Uzbek (Latin), Mongolian (Cyrillic), Kyrgyz (Cyrillic), and Chinese Simplified/Traditional. Other script variants are left unticked."
);
lines.push(
  "- If you add a locale later, update `src/i18n/index.js` and re-check the corresponding boxes."
);

function escapeCell(s) {
  return s.replace(/\|/g, "\\|");
}

fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/microsoft-store-languages.md", lines.join("\n") + "\n", "utf8");

// Browser helper: paste into the DevTools console on the partner site to
// tick every supported checkbox in one go. The supported labels come from the
// same mapping as the checklist above, so the two cannot drift.
const labels = supported.map((r) => JSON.stringify(r.entry)).join(",\n    ");
const autotick = `// Partner Center language auto-tick helper.
// Usage: paste this whole file into DevTools Console on the language-picker
// page, then run: __esuyoTick.preview()  and  __esuyoTick.tick()
// Scrolling the list first matters if the site virtualizes rows.
(() => {
  const SUPPORTED = new Set([
    ${labels}
  ]);
  const norm = (s) => String(s || "").replace(/\\s+/g, " ").trim();

  function labelFor(el) {
    if (el.id) {
      const lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]');
      if (lab) return norm(lab.textContent);
    }
    const wrap = el.closest("label");
    if (wrap) return norm(wrap.textContent);
    if (el.getAttribute("aria-label")) return norm(el.getAttribute("aria-label"));
    const byId = el.getAttribute("aria-labelledby");
    if (byId) {
      return norm(byId.split(/\\s+/).map((id) => (document.getElementById(id) || {}).textContent).join(" "));
    }
    if (el.title) return norm(el.title);
    const parent = el.parentElement;
    return parent ? norm(parent.textContent) : "";
  }

  function boxes() {
    return Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"]'));
  }

  function scan() {
    return boxes().map((el) => ({ el, label: labelFor(el), checked: el.checked === true || el.getAttribute("aria-checked") === "true" }));
  }

  const clicked = [];

  window.__esuyoTick = {
    preview() {
      const all = scan();
      const matched = all.filter((x) => SUPPORTED.has(x.label));
      const todo = matched.filter((x) => !x.checked);
      const missing = Array.from(SUPPORTED).filter((s) => !all.some((x) => x.label === s));
      console.table(todo.slice(0, 40).map((x) => ({ label: x.label, action: "tick" })));
      console.log("checkboxes on page:", all.length, "| supported matched:", matched.length,
        "| to tick:", todo.length, "| supported labels not found:", missing.length);
      if (missing.length) console.log("Not found (may be virtualized):", missing.slice(0, 20));
      return { total: all.length, matched: matched.length, toTick: todo.length, missing: missing.length };
    },
    tick() {
      clicked.length = 0;
      const todo = scan().filter((x) => SUPPORTED.has(x.label) && !x.checked);
      for (const x of todo) { x.el.click(); clicked.push(x.el); }
      console.log("Ticked " + clicked.length + " checkboxes. Review, then Save/Publish in the portal.");
      return clicked.length;
    },
    untick() {
      let n = 0;
      for (const el of clicked) {
        const checked = el.checked === true || el.getAttribute("aria-checked") === "true";
        if (checked) { el.click(); n++; }
      }
      clicked.length = 0;
      console.log("Unticked " + n + " checkboxes.");
      return n;
    },
  };
  console.log("Ready. Run __esuyoTick.preview() then __esuyoTick.tick()");
})();
`;
fs.writeFileSync("docs/microsoft-store-languages-autotick.js", autotick, "utf8");
console.log(`wrote docs/microsoft-store-languages.md: ${supported.length}/${rows.length} ticked, ${byLocale.size} locales`);
console.log(`wrote docs/microsoft-store-languages-autotick.js with ${supported.length} labels`);
