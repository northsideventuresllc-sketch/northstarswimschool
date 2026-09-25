# AGENTS.md — northstarswimschool

## What this is

Landing page for North-Stars Swim School — a dependency-free static site (`index.html`,
`css/styles.css`, `js/main.js`, `assets/crest.svg`). No build step, no framework, no
`package.json`.

## Stack

- Static HTML/CSS/JS. `framework: null` in `vercel.json` (no build/install command).
- No backend, database, auth, or payment surface in this repo.

## Deploy

Push to `main` → Vercel git-integration auto-deploy. No CI workflow configured — review
`index.html` / `css` / `js` changes by eye before merging.

## Brand rules (org-wide, same as every other NV repo)

- Brand: Northside (title case). DEAD RULE, do not reinstate the old NORTHSiDE casing — JB
  2026-08-25, Decision #1389.
- Operator is **Jonny (JB)** — never "Jonathan".

---

<!-- Merged 2026-09-05: the context-protocol block that lived here pointed at the retired ni-operator-core skill; the boot contract in CLAUDE.md is the live one. Repo-specific sections kept. -->

---

## This repo is a plain static site

No framework, no build step, no package manager, no tests. `index.html` +
`css/styles.css` + `js/main.js` + `assets/`, served as-is by Vercel
(`vercel.json` sets `framework: null`, `cleanUrls: true`, `trailingSlash: false`).

**Consequences to work with, not around:**

- **No bundler means no safety net.** Nothing will catch a broken asset path, a
  dead anchor, or a JS syntax error at build time — the page just fails in the
  browser. Load it before claiming it works.
- **Vanilla ES5-style JS.** `js/main.js` is an IIFE using `var` and feature
  detection (`'IntersectionObserver' in window`). Match that style; do not
  introduce a framework, a build step or npm to add one interaction.
- **`cleanUrls: true`** — link to `/about`, not `/about.html`, when pages are added.
- **Verify by loading the page**, and say which URL you loaded.

| Task | Command |
|------|---------|
| Serve locally | `python3 -m http.server 8000` |
| Test (link/asset checker) | `node scripts/verify-live.mjs` |
| Deploy | push to `main` — Vercel builds from the default branch |

**CI (FRONTIER-05-TESTS-ALL-REPOS, 2026-09-25):** `.github/workflows/test.yml` runs
`node scripts/verify-live.mjs` on every `pull_request`. It is a dependency-free static
checker (no browser, no network) — it parses `index.html` and `js/main.js` and confirms
every local link/asset resolves on disk, every in-page anchor has a matching id, and the
waitlist `WAITLIST_ENDPOINT` still points at the real Supabase edge function rather than
a placeholder. It never actually POSTs to the waitlist endpoint.

## CODE-CHECK GATE

For NORTHSiDE product-code work, do not mark a task done, ready, merged or
deployed until the Code-Checking Agent Protocol passes
(`nv-vault/04 Workflows & SOPs/Code-Checking Agent Protocol`). Required for
runtime code, UI, forms, and anything on the deployment path. Docs-only changes
that do not alter agent behaviour or what ships can skip it. Dispatch `CODE-CHECK`
without asking JB; final summaries for product code must include `CODE-CHECK: PASS`.

## TOOL USE — PRE-APPROVED

Use any and all tools immediately. No asking, no pausing. Act, then report.
Merging to `main` and deploying to production are autonomous (NI-Brain Decision
#368). Only confirm before the standing hard stops: force-pushing `main`,
rewriting pushed history, wiping dirty WIP, financial or payment config, prod env
vars, deleting DB objects, and anything that reaches a real person.
