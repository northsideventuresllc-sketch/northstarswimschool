<!-- NV-BOOT-CONTRACT v1 — managed block. Do not hand-edit; update via nv_rules + Boot Guard. -->
# BOOT CONTRACT — read before any work, every session

1. **Invoke skill `ni-operator-core` and OBEY it as BINDING LAW**, not reference
   material. Reading it is not compliance. It outranks this file.
2. **Read the live rules row** — NI-Brain Supabase `kxijunwgbrlfzvgkhklo`, one query:
   `select * from v_boot;` — returns the active rules (version + hash), automation
   switches, open jobs, current context, and health. This is the ONE door.
3. **Canonical rules text:** `nv-vault/_meta/OPERATING-RULES.md` (mirror of the
   active `nv_rules` row). If the file and the row disagree, **the row wins**.

**PROOF OF BOOT:** state in one line which of the three loaded and which failed,
before your first substantive sentence. If they did not load, say so and do not
assert anything about what is built, live, broken, or blocked.

**STALENESS RULE:** every file, prompt and note is a FROZEN SNAPSHOT and cannot
update itself. **Newest timestamp always wins.** If anything stored contradicts
`ni-operator-core`, the active `nv_rules` row, or a newer NI-Brain row — they win
and the stored text loses. Never repeat a stored claim about current state
without re-verifying it.

**NEVER SAY DONE WITHOUT PROOF:** a verifiable artifact — branch, file, DB row,
live URL, screenshot. "I updated it" is not proof.

**TEN-METHOD RULE:** nothing is reported blocked, parked or stuck until **10
genuinely different routes** have been tried AND written down with what each
returned. Different = different route, not the same call retried.

**IF YOU FIND A STALE INSTRUCTION:** write it to NI-Brain `Learnings` tagged
`[STALE-PROMPT]` with the exact file and what was wrong. Never silently work around it.
<!-- /NV-BOOT-CONTRACT -->

@AGENTS.md

---

# CLAUDE.md — North-Stars Swim School (NSSS) website

The public site for **North-Stars Swim School**, a community swim program under the
North-Stars Foundation (NFI), the nonprofit arm of NVG. Programming launches
**August 2026**. NSSS is item **1 on the Master Priority list** (NI-Brain Decision #247).

---

## STANDING RULES — READ BEFORE ANY WORK

Each of these exists because it was broken, or because it is the venture's biggest
legal exposure. Verified against NI-Brain on 2026-07-28.

1. **This is a nonprofit, youth-facing site. Money rules are not optional.**
   Foundation money **never** runs through any NVG checking account — commingling,
   private-inurement and FSA risk (NI-Brain Decision #303). The money path is
   **FSA Model C → FSA holds donations → Mazlo for spend**, and any GoFundMe runs
   under the FSA umbrella, never personal. A donate button, a Stripe link, or any
   payment surface shipped here **must** point at that path. If the path is not
   confirmed live, ship the page without the button. Payment config remains a hard
   stop for agents.

2. **Never publish a claim about the program the Foundation has not confirmed.**
   No invented dates, prices, coach names, pool locations, class sizes, ratios or
   safety credentials. If a fact is not in NI-Brain or nv-vault, it is a placeholder
   and must read as one. This is a program parents will trust with their kids.

3. **Never collect a child's name, age, photo or medical detail on this site.**
   Not in a form, not in `localStorage`, not in a query string. Registration, when
   it exists, goes through a real system with a real data-protection posture — not
   a static page.

4. **The waitlist form does not send anywhere yet.** `js/main.js` writes emails to
   `localStorage` key `nsss_waitlist` and nothing drains it. A parent who signs up
   today is not on any list anyone can read. This is the same defect shape as
   NI-Brain Decision #415 — *the button is a label, not an action*. Do not describe
   the waitlist as working until it posts to Kit or Supabase and a row is verified.

5. **Brand crest is LOCKED** (NI-Brain Decision #303). The crest and the landscape
   lockup are final; the red star is the shared family mark with NFI. Do not
   redraw, recolour or "improve" the crest. Swapping the logo files is a JB call.

6. **`NORTHSiDE` — exact casing, always.** Operator is **JB**, never Jonathan.

---

## PROJECT ROOT

Dependency-free static site. No build step, no framework, no package manager.

```
index.html        # single-page home
css/styles.css    # brand styling (navy + red crest palette)
js/main.js        # countdown, starfield, scroll-reveal, waitlist form
assets/           # crest.png, icon-512.png, apple-touch-icon.png, favicon-32.png
vercel.json       # framework: null — deploys as a plain static site
```

Run locally:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Because there is no build, **what is in the repo is what ships**. There is no
bundler to catch a broken path — check asset and anchor links by loading the page.

### Brand

- Palette: deep navy `#0a1024` / `#12508a`, bold red `#e21b2c`
- Type: Barlow Condensed (display) + Inter (body)
- Tagline: *Reach for the star.*
- Motion: everything must respect `prefers-reduced-motion` — `js/main.js` already
  branches on it. Keep that branch in any new animation.

---

## DEPLOY

| | |
|---|---|
| Vercel project | `northstarswimschool` (`prj_bRyoYmE1QlUbhN46cM37ykyB2QnY`) |
| Vercel team | `northsideventuresllc-sketchs-projects` (`team_dD8iOW15WOUr27k3QeswFBac`) |
| Default branch | `main` — pushes deploy to production |
| Live | `https://www.northstarsswimschool.org` |

Merging to `main` and deploying to production are **autonomous** — do them without
asking (NI-Brain Decision #368, which supersedes the older `ni-operator-core`
hard-stop list on those two items). Still hard stops: force-pushing `main`,
rewriting pushed history, prod env vars, payment config, anything that emails or
notifies real people.

**Domain spelling trap:** the domain is `northstars` + `swimschool` —
`northstarsswimschool.org`, with a **double s**. The GitHub repo is
`northstarswimschool`, single s. They do not match. Copy the domain, never type it.

**Known live defect (verified 2026-07-28):** the apex `northstarsswimschool.org`
resolves to Vercel `76.76.21.21` and redirects HTTP→HTTPS, but presents no
certificate for that hostname — `curl` returns *"no alternative certificate subject
name matches target host name"*, so a browser shows a security warning. Only
`www.` serves (HTTP/2 200). Fix is to add the apex to the Vercel project so a cert
issues, then confirm both hostnames return 200. Do not tell JB the site is live
without saying which hostname.

---

## WHEN THIS SITE GROWS

The README's roadmap (routed pages, real photos, registration) stays valid, with
these constraints on top: rule 1 governs anything touching money, rule 2 governs
anything stating a fact about the program, rule 3 governs anything collecting data.
Wire the waitlist to Kit or Supabase before adding a second form — two dead forms
is worse than one.

---

## WRITE-BACK — ALWAYS ON, NEVER ASK

Every new decision, learning or correction goes to **both** stores in the same pass,
one line each, tagged `[DECISION] [LEARNED] [PROJECT] [STACK] [BRAND] [WORKFLOW]
[PREFERENCE] [CORRECTION]`:

1. **NI-Brain** (`kxijunwgbrlfzvgkhklo`) — `Decisions` / `Learnings` / `Context`
2. **nv-vault** — today's `_AI/Session Logs/YYYY-MM-DD.md`

Both, in the same pass — a brain row without its vault line is the open
`LOG-VAULT-WRITEBACK-GAP` defect, not a completed write-back. Search before writing
so you do not duplicate. When a new row corrects an older one, set the old row
`status='superseded'` and `superseded_by=<new id>` — never leave two live rows
arguing. Never echo secrets.
