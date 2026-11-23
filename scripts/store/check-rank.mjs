// Track Esuyo Markdown's position in Microsoft Store search results.
// Requires a Chrome started with --remote-debugging-port (see start-partner-browser.ps1).
// Uses only Node built-ins (global fetch + WebSocket), no npm dependencies.
//
// Usage:
//   node scripts/store/check-rank.mjs [--cdp http://127.0.0.1:9222] [--query "markdown editor"]
//   node scripts/store/check-rank.mjs --market de
//   node scripts/store/check-rank.mjs --all-markets
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const CONFIG = path.join(ROOT, "scripts/store/listing/listings.json");
const HISTORY = path.join(ROOT, "scripts/store/out/rank-history.jsonl");

const argv = parseArgs(process.argv.slice(2));
if (argv.help) {
  console.log(`Usage: node scripts/store/check-rank.mjs [options]
  --cdp <url>       Chrome DevTools endpoint (default: http://127.0.0.1:9222)
  --query <text>    Check one query instead of the configured list
  --market <key>    Check one experiment market (e.g. de, pt-BR, en-GB)
  --all-markets     Check every market in localizationExperiment.rankMarkets
  --help            show this help`);
  process.exit(0);
}

const config = JSON.parse(fs.readFileSync(CONFIG, "utf8"));
const rankMarkets = config.localizationExperiment?.rankMarkets ?? {};
const runs = buildRuns();
const productId = String(config.productId).toLowerCase();
const cdpBase = (argv.cdp ?? process.env.STORE_CDP_URL ?? "http://127.0.0.1:9222").replace(/\/$/, "");

const targets = await fetch(`${cdpBase}/json`)
  .then((r) => r.json())
  .catch(() => fail(`Cannot reach Chrome DevTools at ${cdpBase}. Start scripts/store/start-partner-browser.ps1 first.`));
const target =
  targets.find((t) => t.type === "page" && /apps\.microsoft\.com/.test(t.url)) ??
  targets.find((t) => t.type === "page");
if (!target) fail("No browser page available to drive.");

const session = await connect(target.webSocketDebuggerUrl);
await session.send("Page.enable");
await session.send("Runtime.enable");

const records = [];
for (const run of runs) {
  console.log(`\n[${run.key}] hl=${run.hl} gl=${run.gl}`);
  for (const query of run.queries) {
    const url = `https://apps.microsoft.com/search?query=${encodeURIComponent(query)}&hl=${encodeURIComponent(run.hl)}&gl=${encodeURIComponent(run.gl)}`;
    await session.send("Page.navigate", { url });
    await sleep(1200);
    const result = await session.send("Runtime.evaluate", {
      expression: rankExpression(productId),
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      console.warn(`  ${query}: evaluation failed, ${result.exceptionDetails.text}`);
      continue;
    }
    const { rank, scanned } = result.result.value ?? {};
    const record = {
      date: new Date().toISOString(),
      productId: config.productId,
      query,
      market: run.key,
      hl: run.hl,
      gl: run.gl,
      rank,
      scanned,
      url,
    };
    records.push(record);
    console.log(`${String(rank ?? "-").padStart(4)}  ${query.padEnd(26)} (first ${scanned} results)`);
  }
}

fs.mkdirSync(path.dirname(HISTORY), { recursive: true });
fs.appendFileSync(HISTORY, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
console.log(`\nSaved ${records.length} record(s) to ${path.relative(ROOT, HISTORY)}`);
session.close();

function buildRuns() {
  if (argv.query) {
    const market = argv.market ?? "default";
    const m = rankMarkets[market] ?? config.tracking.market;
    return [{ key: market, hl: m.hl, gl: m.gl, queries: [argv.query] }];
  }
  if (argv.allMarkets) {
    const entries = Object.entries(rankMarkets);
    if (!entries.length) fail("No localizationExperiment.rankMarkets configured.");
    return entries.map(([key, m]) => ({ key, hl: m.hl, gl: m.gl, queries: m.queries }));
  }
  if (argv.market) {
    const m = rankMarkets[argv.market];
    if (!m) fail(`Unknown market '${argv.market}'. Available: ${Object.keys(rankMarkets).join(", ")}`);
    return [{ key: argv.market, hl: m.hl, gl: m.gl, queries: m.queries }];
  }
  return [{
    key: "default",
    hl: config.tracking.market.hl,
    gl: config.tracking.market.gl,
    queries: config.tracking.queries,
  }];
}

function rankExpression(id) {
  // The Store SPA renders results inside open shadow roots, so a plain
  // document.querySelectorAll finds nothing. Walk every shadow root.
  return `(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const target = ${JSON.stringify(id)};
    const allElements = () => {
      const out = [];
      const walk = (root) => {
        for (const el of root.querySelectorAll('*')) {
          out.push(el);
          if (el.shadowRoot) walk(el.shadowRoot);
        }
      };
      walk(document);
      return out;
    };
    const links = () => allElements().filter((el) =>
      el.tagName === 'A' && (el.getAttribute('href') || '').includes('/detail/'));
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      if (links().length) break;
    }
    const seen = [];
    for (let pass = 0; pass < 14; pass++) {
      for (const a of links()) {
        const href = a.getAttribute('href') || '';
        const key = (href.split('?')[0].split('/').filter(Boolean).pop() || '').toLowerCase();
        if (key && !seen.includes(key)) seen.push(key);
      }
      const rank = seen.indexOf(target) + 1;
      if (rank) return { rank, scanned: seen.length };
      for (const el of allElements()) {
        if (el.scrollHeight > el.clientHeight + 50) el.scrollTop += 6000;
      }
      window.scrollBy(0, 6000);
      await sleep(900);
    }
    return { rank: null, scanned: seen.length };
  })()`;
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  let nextId = 1;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  });
  return {
    send(method, params = {}) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close: () => ws.close(),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const [key, inline] = argv[i].replace(/^--/, "").split("=", 2);
    if (key === "help") out[key] = true;
    else if (key === "all-markets") out.allMarkets = true;
    else if (["cdp", "query", "market"].includes(key)) out[key] = inline ?? argv[++i];
  }
  return out;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}
