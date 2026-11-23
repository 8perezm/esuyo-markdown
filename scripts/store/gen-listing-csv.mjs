// Generate a Partner Center "Import listings" CSV from scripts/store/listing/listings.json.
//
// The CSV schema (Field / ID / Type columns and language-locale columns) is owned
// by Partner Center, so we ALWAYS start from a real CSV exported from
// Partner Center > your app > Store listings > Export listing. This script only
// fills text cells; it never changes Field, ID or Type and never removes assets.
//
// Usage:
//   node scripts/store/gen-listing-csv.mjs --template <export.csv> [--out <file.csv>]
//   node scripts/store/gen-listing-csv.mjs --template <export.csv> --preview
//   node scripts/store/gen-listing-csv.mjs --template <export.csv> --experiment
//   node scripts/store/gen-listing-csv.mjs --template <export.csv> --wave 1
//   node scripts/store/gen-listing-csv.mjs --template <export.csv> --locales de,fr,es
import fs from "node:fs";
import path from "node:path";
import { LOCALES } from "../../src/i18n/index.js";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CONFIG_PATH = path.join(ROOT, "scripts/store/listing/listings.json");
const DEFAULT_OUT = path.join(ROOT, "scripts/store/out/listings.generated.csv");

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  console.log(`Usage: node scripts/store/gen-listing-csv.mjs [options]
  --template <file.csv>  CSV exported from Partner Center (required unless --preview)
  --out <file.csv>       output path (default: scripts/store/out/listings.generated.csv)
  --preview              print the copy that would be written, do not write a file
  --experiment           restrict to the 10 localization-experiment locales (wave 1 + wave 2)
  --wave <1|2>           restrict to one experiment wave (1 = treatment, 2 = control)
  --locales <a,b,c>      restrict to a comma-separated list of Store locale codes
  --help                 show this help`);
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
const fields = config.proposed.fields;
const translationFile = loadTranslations();
const translationsLoaded = translationFile !== null;
const reviewApproved = /approved/i.test(translationFile?.reviewStatus ?? "");
const translations = translationFile?.locales ?? {};
const overrides = mergeOverrides(config.localeOverrides ?? {}, translationOverrides(translations));
const localeMap = config.storeLocaleOverrides ?? {};
const experiment = config.localizationExperiment ?? {};
const allStoreLocales = [
  ...new Set(LOCALES.map(({ code }) => localeMap[code] ?? code.toLowerCase())),
].sort((a, b) => a.localeCompare(b));
const experimentLocales = [
  ...new Set([
    ...(experiment.waves?.wave1_treatment ?? []),
    ...(experiment.waves?.wave2_control ?? []),
  ].map((code) => localeMap[code] ?? code.toLowerCase())),
].sort((a, b) => a.localeCompare(b));
const waveLocales = (wave) => (experiment.waves?.[wave === "1" ? "wave1_treatment" : "wave2_control"] ?? [])
  .map((code) => localeMap[code] ?? code.toLowerCase());
const storeLocales = args.wave
  ? waveLocales(args.wave)
  : args.experiment
    ? experimentLocales
    : args.locales
      ? args.locales.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : allStoreLocales;

const LIMITS = {
  Title: 50,
  ShortDescription: 1000,
  Description: 10000,
  ShortTitle: 50,
};

checkLengths();

if (args.preview) {
  printPreview();
  process.exit(0);
}

if (!args.template) {
  fail("Missing --template. Export the listings CSV from Partner Center first (Store listings > Export listing).");
}
const templatePath = path.resolve(args.template);
if (!fs.existsSync(templatePath)) fail(`Template not found: ${templatePath}`);

const rows = parseCsv(fs.readFileSync(templatePath, "utf8"));
if (!rows.length) fail("Template is empty.");

const header = rows[0];
const idx = {
  field: header.indexOf("Field"),
  id: header.indexOf("ID"),
  // Real Partner Center exports label the third column "Type (Type)".
  type: header.findIndex((h) => h === "Type" || /^Type\s*\(/.test(String(h).trim())),
  default: header.indexOf("default"),
};
if (Object.values(idx).some((i) => i < 0)) {
  fail(`Template must have Field, ID, Type and default columns; got: ${header.join(", ")}`);
}

const knownFixed = new Set(["Field", "ID", "Type", "default"]);
let localeColumns = header
  .map((name, i) => ({ name, i }))
  .filter(({ name, i }) => i > idx.default && !knownFixed.has(name) && isLocaleCode(name));

const enUsIdx = header.findIndex((h) => /^en(-us)?$/i.test(String(h).trim()));
const existing = new Map(localeColumns.map((c) => [c.name.toLowerCase(), c.i]));
const missing = storeLocales.filter((loc) => !existing.has(loc.toLowerCase()));
if (missing.length) {
  console.log(`Adding ${missing.length} locale columns not present in the export: ${missing.join(", ")}`);
  // Microsoft allows new language columns in the next empty column of row 1.
  const start = Math.max(...header.map((_, i) => i)) + 1;
  missing.forEach((loc, n) => {
    const column = start + n;
    header[column] = loc;
    for (let r = 1; r < rows.length; r++) rows[r][column] = "";
    localeColumns.push({ name: loc, i: column });
    existing.set(loc.toLowerCase(), column);
  });
}

// A field is writable if it has an English default or any locale override
// (e.g. translated `Keywords` may exist only as an override).
const writableFields = new Set([
  ...Object.keys(fields),
  ...Object.values(overrides).flatMap((obj) => Object.keys(obj)),
]);
const writes = new Map();
for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const field = row[idx.field];
  // Reuse asset URLs (screenshots, logos, trailers) across language columns.
  for (const { i: column } of localeColumns) {
    if (!row[column] && enUsIdx >= 0 && /^https?:\/\//.test(String(row[enUsIdx] ?? ""))) {
      row[column] = row[enUsIdx];
    }
  }
  if (!writableFields.has(field)) continue;
  const oldDefault = row[idx.default];
  const value = fields[field];
  if (value !== undefined) row[idx.default] = value;
  writes.set(field, (writes.get(field) ?? 0) + 1);
  for (const { name, i: column } of localeColumns) {
    const override = overrides[name.toLowerCase()]?.[field];
    if (override !== undefined) {
      row[column] = override;
    } else if (value !== undefined && oldDefault && row[column] === oldDefault) {
      // Cell was a copy of the old English default, not a translation: refresh it.
      row[column] = value;
    }
    // Empty or genuinely different text is left alone: new columns inherit the
    // new default, and real translations are never overwritten.
  }
}

const absent = [...writableFields].filter((f) => !writes.has(f));
if (absent.length) {
  console.warn(`Warning: these fields were not found in the template and were NOT written: ${absent.join(", ")}`);
  console.warn("Check the Field names in your export and update scripts/store/listing/listings.json if Microsoft uses different ones.");
}

const outPath = path.resolve(args.out ?? DEFAULT_OUT);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, stringifyCsv(rows), "utf8");
console.log(`Wrote ${outPath}`);
console.log(`Filled ${writes.size} field row(s); locale columns: ${localeColumns.length}`);
if (translationsLoaded && !reviewApproved && (translationFile.aiDraft || translationFile.nativeReviewRequired)) {
  console.log("NOTE: localized copy is an AI DRAFT and requires native-speaker review before submission.");
} else if (translationsLoaded && reviewApproved) {
  console.log("NOTE: localized copy is AI-drafted but marked native-review approved, confirm with the reviewer before submitting.");
}
console.log("Review the file, then import it in Partner Center (Import listings > Import .csv). Do NOT change Field/ID/Type.");

function loadTranslations() {
  const file = config.localizationExperiment?.translationsFile;
  if (!file) return null;
  const p = path.join(path.dirname(CONFIG_PATH), file);
  if (!fs.existsSync(p)) {
    console.warn(`Warning: translations file not found: ${p}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function translationOverrides(locales) {
  const out = {};
  for (const [loc, obj] of Object.entries(locales)) {
    const copy = { ...obj };
    if (Array.isArray(copy.Keywords)) {
      copy.Keywords.forEach((kw, i) => { copy["SearchTerm" + (i + 1)] ??= kw; });
      delete copy.Keywords;
    }
    out[loc.toLowerCase()] = copy;
  }
  return out;
}

function mergeOverrides(base, extra) {
  const out = {};
  for (const [loc, obj] of Object.entries(base)) out[loc.toLowerCase()] = { ...obj };
  for (const [loc, obj] of Object.entries(extra)) out[loc] = { ...(out[loc] ?? {}), ...obj };
  return out;
}

function checkLengths() {
  for (const [name, max] of Object.entries(LIMITS)) {
    const len = (fields[name] ?? "").length;
    if (len > max) console.warn(`Warning: ${name} is ${len} chars (max ${max}).`);
  }
  for (const [name, value] of Object.entries(fields)) {
    if (/^Feature\d+$/.test(name) && value.length > 200) {
      console.warn(`Warning: ${name} is ${value.length} chars (max 200).`);
    }
  }
}

function printPreview() {
  console.log("PROPOSED STORE LISTING (default / all languages unless overridden)\n");
  for (const [name, value] of Object.entries(fields)) {
    console.log(`--- ${name} (${value.length} chars)`);
    console.log(value);
  }
  if (translationsLoaded && !reviewApproved && (translationFile.aiDraft || translationFile.nativeReviewRequired)) {
    console.log("\n*** LOCALIZED COPY IS AN AI DRAFT, native-speaker review required before submission ***");
  } else if (translationsLoaded && reviewApproved) {
    console.log("\n*** Localized copy marked native-review approved (AI-draft provenance retained) ***");
  }
  console.log("\n--- locale overrides");
  const entries = Object.entries(overrides);
  if (!entries.length) console.log("(none, all languages inherit default English)");
  for (const [loc, obj] of entries) console.log(`${loc}: ${Object.keys(obj).join(", ") || "(empty)"}`);
  console.log(`\n--- ${storeLocales.length} Store locale column(s) targeted by this run`);
  console.log(storeLocales.join(", "));
}

function isLocaleCode(s) {
  return /^[a-z]{2,3}([-_][a-z0-9]{2,4})*$/i.test(s.trim());
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const [key, inline] = argv[i].replace(/^--/, "").split("=", 2);
    if (key === "preview" || key === "help" || key === "experiment") out[key] = true;
    else if (["template", "out", "locales", "wave"].includes(key)) out[key] = inline ?? argv[++i];
  }
  return out;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

// Minimal RFC4180 reader/writer: handles quoted commas, quotes and newlines.
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function stringifyCsv(rows) {
  const cell = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
