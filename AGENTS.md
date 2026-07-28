<!-- BEGIN:ni-context-protocol -->
## LOAD CONTEXT FIRST — before any work

You are working inside the NORTHSiDE Ventures Group (NVG) ecosystem, on the
**North-Stars Swim School** site — a program of the North-Stars Foundation (NFI),
the nonprofit arm. Before touching anything:

1. **Invoke the `ni-operator-core` skill and obey it as binding law.**
2. **Query NI-Brain** (Supabase `kxijunwgbrlfzvgkhklo`) through the one door:
   `select * from v_boot;` — active rules row, switches, open jobs, context, health.
3. **Read nv-vault** when the task needs detail: `_Command Center/BRAIN-MIRROR.md`
   → `_Command Center/CONTEXT-MAP.md` → `_meta/OPERATING-RULES.md` → today's
   `_AI/Session Logs/YYYY-MM-DD.md`.
4. Then read `CLAUDE.md` in this repo for the NSSS-specific rules.

**Newest timestamp always wins**, across every source. The vault is a mirror, not
the door — if a vault file and the live `nv_rules` row disagree, **the row wins**.

**There is no second memory.** Claude's built-in memory is disabled and is never a
source of truth. The only two brains are NI-Brain and nv-vault. Anything held
anywhere else — including this file — is a frozen snapshot and must be written into
both brains before the session ends.

**Write-back after work:** log every `[DECISION]` `[LEARNED]` `[CORRECTION]` to
NI-Brain *and* today's vault session log, in the same pass. Never ask JB to
re-explain anything already in a brain.

**Operator:** Jonny — **JB**, never Jonathan. Brand: `NORTHSiDE` — exact casing always.
<!-- END:ni-context-protocol -->

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
| Deploy | push to `main` — Vercel builds from the default branch |

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
