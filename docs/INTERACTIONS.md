# Signature interactions

Four interaction patterns from the Osmo Supply library were requested by name.
Their source is members-only, so each is reimplemented here from its documented
behaviour, in React with the `motion` library already in the project, rather than
copied. Each component lives in `src/components/interactions/` and is used exactly
where the pattern fits the product honestly.

## 1. Interactive Globe (Mapbox) — `interactive-globe.tsx`

Where: the "Where TokenZameen is looking" band on the home page.

Behaviour, per the resource description:
- Mapbox GL JS v3 with `projection: "globe"`, a minimal custom style (flat land
  colour, hairline country borders, no labels), fog matched to the carbon band.
- **Auto-rotate** slowly until the user interacts (drag, wheel, marker click); it
  never resumes on its own.
- **Markers** for every real project location, driven by the catalogue, never a
  hard-coded list. Clicking a marker or its card **flies** to that location and
  activates the card.
- **Keyboard**: left/right arrows move between locations; the list is a proper
  `listbox` with roving focus.
- **Side panel** lists the locations as cards; `globeOffsetX` shifts the globe's
  visual centre so the panel does not cover it. Below 992px the panel drops under
  the globe and the offset goes to zero.
- Requires `NEXT_PUBLIC_MAPBOX_TOKEN`. Without it the band renders the pins over
  the contour illustration and says the live globe is enabled by adding the token
  — no blank box, no crash, no third-party call.

Coordinates: `LocationInfo.coordinates` is `null` for every project today, and the
brief forbids invented survey coordinates. The globe therefore plots **city-level
centroids** from a small, sourced table in `src/lib/geo.ts` (Goa, Delhi, Haridwar,
Bangalore, Gurgaon, and the Goa–Maharashtra border corridor), labelled as the
city, never as the project's exact site.

## 2. Line Reveal — `line-reveal.tsx`

Where: the brand statements band on the home and about pages, and the closing
philosophy line on the Purchase landing.

The Osmo resource is a testimonial slider. TokenZameen has no client testimonials
on file and will not invent any, so the same mechanic carries the brief's own
positioning statements — real copy, cycled the same way.

Behaviour:
- Text is split into lines by measuring the rendered layout, then each line is
  wrapped in an overflow-hidden mask and rises from below with a stagger
  (`0.08s` per line, `0.9s`, the site's luxe ease).
- Previous / next controls and dot indicators; autoplay every 6s, paused on
  hover, focus, or `prefers-reduced-motion`; swipe on touch.
- Outgoing lines drop downward while the incoming rise, so the change reads as
  one continuous motion.

## 3. Layout Grid Flip — `layout-flip.tsx`

Where: the discovery engine's grid / list toggle, and the category tile layout on
the Purchase landing.

Behaviour:
- A FLIP transition: when the layout class changes, every tile animates from its
  old box to its new box — position and size — instead of snapping.
- Implemented with `motion`'s shared `layout` animation, which is the FLIP
  technique. Tiles keep a stable `layoutId` so reordering also animates.
- Duration `0.6s`, luxe ease, `0.02s` stagger; disabled under
  `prefers-reduced-motion`.

## 4. Logo Wall Cycle — `logo-wall.tsx`

Where: the "In the collection" band on the home page.

The Osmo resource cycles partner logos. TokenZameen has two sourced developer
names and no logo files, so the wall cycles **typographic tiles** of the real
project names, categories and cities from the catalogue — every tile is a fact.

Behaviour:
- A fixed grid of cells (4×2 on desktop, 2×3 on mobile). Every 2.4s one random
  cell — never the one that just changed — swaps its item for one not currently
  visible anywhere in the grid.
- The outgoing item slides up and fades, the incoming slides in from below, both
  masked to the cell. Hovering pauses the cycle. Reduced motion shows a static
  grid.

## What is deliberately not done

- No trial or unlicensed font files ship. Neue Montreal requires a Pangram
  Pangram web licence per domain; see README.
- No invented testimonials, logos, or coordinates.
