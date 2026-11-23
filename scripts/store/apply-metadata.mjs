// Prepare (and optionally commit) a Store listing metadata update via msstore CLI.
//
// SAFETY: dry-run by default. Nothing is sent unless BOTH --commit and
// --approved-by "<your name>" are supplied. This script never publishes and
// never uploads a package, commit/publish stays a separate human decision.
//
// Usage:
//   node scripts/store/apply-metadata.mjs
//   node scripts/store/apply-metadata.mjs --commit --approved-by "Miguel"
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CONFIG = path.join(ROOT, "scripts/store/listing/listings.json");
const OUT = path.join(ROOT, "scripts/store/out/submission.next.json");

const argv = parseArgs(process.argv.slice(2));
if (argv.help) {
  console.log(`Usage: node scripts/store/apply-metadata.mjs [options]
  --commit              send the prepared JSON to msstore submission updateMetadata
  --approved-by <name>  REQUIRED with --commit; records who approved the change
  --out <file>          where to write the prepared JSON (default: scripts/store/out/submission.next.json)
  --help                show this help`);
  process.exit(0);
}
if (argv.commit && !argv["approved-by"]) {
  fail("--commit requires --approved-by \"<your name>\". Dry runs need no approval flag.");
}
if (!hasMsstore()) {
  fail("msstore CLI not found on PATH. Install it with: winget install \"Microsoft Store Developer CLI\" (plus .NET 9 Desktop Runtime), then run `msstore` once to configure Entra ID credentials.");
}

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const productId = config.productId;
const fields = config.proposed.fields;
const overrides = config.localeOverrides ?? {};

const raw = runMsstore(["submission", "get", productId], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});
const submission = parseJson(raw);
const listings = submission.Listings;
if (!listings || typeof listings !== "object") fail("No Listings object in `msstore submission get` output.");

const diffs = [];
const skipped = [];
const targets = new Map();
targets.set("en-gb", fields);
for (const [locale, values] of Object.entries(overrides)) {
  targets.set(locale.toLowerCase(), { ...fields, ...values });
}

for (const [locale, values] of targets) {
  const key = Object.keys(listings).find((k) => k.toLowerCase() === locale);
  if (!key) {
    skipped.push(`listing locale ${locale} (available: ${Object.keys(listings).join(", ")})`);
    continue;
  }
  const base = listings[key].BaseListing;
  if (!base || typeof base !== "object") {
    skipped.push(`BaseListing for ${key}`);
    continue;
  }
  for (const [name, value] of Object.entries(values)) {
    if (/^Feature\d+$/.test(name)) {
      const index = Number(name.slice(7)) - 1;
      if (Array.isArray(base.Features)) {
        recordDiff(base.Features[index], value, `${key}.Features[${index}]`);
        base.Features[index] = value;
      } else skipped.push(`${key}.Features[${index}] (Features is not an array)`);
      continue;
    }
    if (!(name in base)) {
      skipped.push(`${key}.${name} (field absent from submission JSON)`);
      continue;
    }
    recordDiff(base[name], value, `${key}.${name}`);
    base[name] = value;
  }
}

const json = JSON.stringify(submission);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(argv.out ? path.resolve(argv.out) : OUT, JSON.stringify(submission, null, 2) + "\n", "utf8");

console.log(`Product ${productId}`);
console.log(`Changed ${diffs.length} field(s):`);
for (const d of diffs) console.log(`  ${d.path}\n    - ${d.before}\n    + ${d.after}`);
if (skipped.length) {
  console.log(`\nSkipped ${skipped.length} field(s), inspect before committing:`);
  for (const s of skipped) console.log(`  ${s}`);
}
console.log(`\nPrepared JSON: ${path.relative(ROOT, argv.out ? path.resolve(argv.out) : OUT)}`);

if (!argv.commit) {
  console.log("\nDRY RUN, nothing was sent. Review the prepared JSON, then re-run with --commit --approved-by \"<name>\".");
  process.exit(0);
}

console.log(`\nCommitting as approved by ${argv["approved-by"]} ...`);
const response = runMsstore(["submission", "updateMetadata", productId, json], {
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
});
console.log(response.trim());
console.log("\nDraft metadata updated. Do NOT publish yet, certify/publish is a separate human step (`msstore submission publish <id>` or Partner Center).");

function recordDiff(before, after, fieldPath) {
  if (before === after) return;
  diffs.push({
    path: fieldPath,
    before: shorten(before),
    after: shorten(after),
  });
}
function shorten(v) {
  const s = v == null ? "(empty)" : String(v).replace(/\s+/g, " ").trim();
  return s.length > 140 ? `${s.slice(0, 137)}...` : s;
}
function parseJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) fail("Could not find JSON in msstore output:\n" + text.slice(0, 500));
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    fail(`msstore output was not valid JSON: ${e.message}\n${text.slice(0, 500)}`);
  }
}
function hasMsstore() {
  try {
    resolveMsstore();
    return true;
  } catch {
    return false;
  }
}

function resolveMsstore() {
  const locator = process.platform === "win32" ? "where" : "which";
  const found = execFileSync(locator, ["msstore"], { encoding: "utf8" })
    .split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (!found.length) throw new Error("msstore not on PATH");
  return found[0];
}

// On Windows the CLI can be an App Execution Alias (.cmd), which Node cannot
// execFile directly and whose JSON arguments break cmd's quote parsing. Use a
// generated wrapper with delayed expansion in that case; native .exe is direct.
function runMsstore(args, options) {
  const exe = resolveMsstore();
  // Native msstore.exe: Node builds a correctly quoted Windows command line.
  if (process.platform !== "win32" || /\.exe$/i.test(exe)) {
    return execFileSync(exe, args, options);
  }

  const jsonIndex = args.findIndex((a) => typeof a === "string" && a.trimStart().startsWith("{"));
  const outDir = path.join(ROOT, "scripts/store/out");
  fs.mkdirSync(outDir, { recursive: true });
  const cmd = (v) => `"${String(v).replace(/"/g, '""').replace(/%/g, "%%")}"`;

  if (jsonIndex >= 0) {
    // Delayed expansion keeps the JSON's quotes and & from being re-parsed by cmd.
    const simple = args.map((a, i) => (i === jsonIndex ? '"!JSON!"' : cmd(a))).join(" ");
    const wrapper = path.join(outDir, "msstore-call.cmd");
    const json = String(args[jsonIndex]).replace(/"/g, '""').replace(/%/g, "%%").replace(/!/g, "^^^!");
    fs.writeFileSync(wrapper, `@echo off\r\nsetlocal EnableDelayedExpansion\r\nset "JSON=${json}"\r\ncall msstore ${simple}\r\n`, "utf8");
    return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", wrapper], options);
  }
  return execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", `msstore ${args.map(cmd).join(" ")}`], options);
}
function parseArgs(array) {
  const out = {};
  for (let i = 0; i < array.length; i++) {
    const [key, inline] = array[i].replace(/^--/, "").split("=", 2);
    if (key === "commit" || key === "help") out[key] = true;
    else if (["approved-by", "out"].includes(key)) out[key] = inline ?? array[++i];
  }
  return out;
}
function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
