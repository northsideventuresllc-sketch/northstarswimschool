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
- **Waitlist signup** — validates and stores emails in `localStorage` (ready to wire to a backend)
- Responsive nav with mobile menu; respects `prefers-reduced-motion`

## Run locally

It's static — open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

## Next steps (turning it into a full site)

- Wire the waitlist form to **Kit** (ConvertKit) or **Supabase** instead of `localStorage`
- Add routed pages: Programs, Team, Schedule, Register, About, Contact
- Drop in real photos, coaching bios, and location details as they're confirmed
- Hook registration/payments once program dates are set

## Brand

- Palette: deep navy `#0a1024` / `#12508a` with bold red `#e21b2c`
- Type: Barlow Condensed (display) + Inter (body)
- Crest: five-point star over water on a shield — rebuilt as inline SVG so it scales crisply everywhere
