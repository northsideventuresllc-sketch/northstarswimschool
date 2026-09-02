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
