# North-Stars Swim School — Landing Page

The home page for **North-Stars Swim School**, a community swim program of the North-Stars Foundation. Programming launches **August 2026**.

> Reach for the star. — community swim lessons, competitive team, and water safety for all.

## What's here

A fast, dependency-free static site built to grow into the full interactive club site.

```
index.html        # single-page home
css/styles.css    # brand styling (navy + red crest palette)
js/main.js        # interactions
assets/crest.svg  # scalable shield/star crest (logo + favicon)
```

## Interactive features

- **Live countdown** to the August 2026 launch
- **Animated hero** — floating crest, twinkling starfield, layered waves, mouse parallax
- **Scroll-reveal** sections and **count-up** stats
- **Waitlist signup** — posts to a live backend (see below); `localStorage` is only an offline retry queue
- Responsive nav with mobile menu; respects `prefers-reduced-motion`

## Run locally

It's static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Where a waitlist signup goes

```
index.html #notify form
  -> js/main.js  POST https://kxijunwgbrlfzvgkhklo.supabase.co/functions/v1/nsss-waitlist
       -> NI-Brain row in public.nsss_waitlist   (Supabase project kxijunwgbrlfzvgkhklo)
       -> Resend email to northside.ventures.llc@gmail.com, subject "NSSS waitlist: <email>"
```

Function source lives in `supabase/functions/nsss-waitlist/index.ts` and is deployed with
`verify_jwt = false` (it is a public form endpoint). It reads its Resend key from
`ni_platform_secrets`, so there are no secrets in this repo and none in the browser.

The success message is shown **only after the POST succeeds**. If the endpoint is
unreachable the address is queued in `localStorage` under `nsss_waitlist_pending`,
the visitor is told the truth, and the queue is replayed on the next page load.

Check the list any time:

```sql
select email, name, source, notify_status, created_at
from nsss_waitlist where status = 'active' order by created_at desc;
```

> **Historical note:** before 2026-08-04 the form only wrote to `localStorage` and nothing
> read it, so signups made on the live site never reached anyone. Those addresses exist only
> on each visitor's own device and are **not** recoverable as a list. `migrateLegacy()` in
> `js/main.js` rescues one only if that same visitor returns in that same browser.

## Next steps (turning it into a full site)

- Verify `northstarsswimschool.org` in Resend so alerts and parent-facing mail can send
  from the NSSS domain instead of `northsideintelligence.com`
- Add a parent-facing confirmation email + Kit sequence for the launch announcement
- Add routed pages: Programs, Team, Schedule, Register, About, Contact
- Drop in real photos, coaching bios, and location details as they're confirmed
- Hook registration/payments once program dates are set

## Brand

- Palette: deep navy `#0a1024` / `#12508a` with bold red `#e21b2c`
- Type: Barlow Condensed (display) + Inter (body)
- Crest: five-point star over water on a shield — rebuilt as inline SVG so it scales crisply everywhere
