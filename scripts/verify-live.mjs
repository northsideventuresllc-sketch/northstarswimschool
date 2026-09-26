#!/usr/bin/env node
/**
 * FRONTIER-05-TESTS-ALL-REPOS — static link/asset checker for a
 * dependency-free static site. No build step here, so this is the smallest
 * real "test" this repo can run on every PR: it parses the shipped HTML/JS
 * without a browser, checks every internal link and asset actually resolves
 * on disk, checks every in-page anchor (#id) has a matching element, and
 * asserts the waitlist form still points at the real Supabase edge function
 * (never a placeholder). It performs NO network calls — it never actually
 * POSTs to the waitlist endpoint, per the "approve-only / no real sends in
 * CI" standing rule.
 *
 * Usage: node scripts/verify-live.mjs [--root <dir>]
 * Exits non-zero (and prints every failure) if anything is broken.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const argRootIdx = process.argv.indexOf("--root");
const root =
  argRootIdx !== -1 && process.argv[argRootIdx + 1]
    ? resolve(process.argv[argRootIdx + 1])
    : resolve(__dirname, "..");

const failures = [];
let checks = 0;

function fail(msg) {
  failures.push(msg);
}

function check(label, ok) {
  checks += 1;
  if (!ok) fail(label);
}

function readText(relPath) {
  const full = join(root, relPath);
  if (!existsSync(full)) return null;
  return readFileSync(full, "utf8");
}

const html = readText("index.html");
if (html === null) {
  fail("index.html does not exist at repo root");
} else {
  // Collect every href="" / src="" attribute value.
  const attrRe = /(?:href|src)="([^"]*)"/g;
  const refs = new Set();
  let m;
  while ((m = attrRe.exec(html))) refs.add(m[1]);

  const anchors = new Set();
  const idRe = /id="([^"]+)"/g;
  while ((m = idRe.exec(html))) anchors.add(m[1]);

  for (const ref of refs) {
    if (ref === "" || ref === "#") continue;
    if (ref.startsWith("http://") || ref.startsWith("https://")) continue; // external, not this checker's job
    if (ref.startsWith("mailto:") || ref.startsWith("tel:")) continue;
    if (ref.startsWith("#")) {
      const id = ref.slice(1);
      check(`in-page anchor "${ref}" has a matching id="${id}" in index.html`, anchors.has(id));
      continue;
    }
    // Local file/asset reference (relative path, strip any query/hash).
    const clean = ref.split(/[?#]/)[0];
    check(`local reference "${ref}" resolves to an existing file (${clean})`, existsSync(join(root, clean)));
  }

  check("index.html has a non-empty <title>", /<title>[^<]+<\/title>/.test(html));
}

const mainJs = readText("js/main.js");
if (mainJs === null) {
  fail("js/main.js does not exist");
} else {
  const endpointMatch = mainJs.match(/WAITLIST_ENDPOINT\s*=\s*'([^']+)'/);
  check("js/main.js defines WAITLIST_ENDPOINT", Boolean(endpointMatch));
  if (endpointMatch) {
    const endpoint = endpointMatch[1];
    check(
      "WAITLIST_ENDPOINT points at the real nsss-waitlist Supabase edge function (never a placeholder)",
      endpoint === "https://kxijunwgbrlfzvgkhklo.supabase.co/functions/v1/nsss-waitlist"
    );
  }
  check(
    "js/main.js respects prefers-reduced-motion",
    mainJs.includes("prefers-reduced-motion")
  );
}

const cssExists = existsSync(join(root, "css/styles.css"));
check("css/styles.css exists", cssExists);

console.log(`verify-live: ${checks} checks run, ${failures.length} failed.`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAIL: ${f}`);
  process.exit(1);
}
console.log("verify-live: all checks passed.");
