# Media — the generated artwork system

There is no project photography. Every image on the site is an original abstract
SVG drawn by `scripts/generate-media.mjs`. The files are committed; the script is
the source they come from.

```
node scripts/generate-media.mjs
```

Zero dependencies, `node:fs` only, seeded PRNG. Re-running is safe: it overwrites
the same 42 files with byte-identical content, so a second run leaves no diff.

## What it draws

Each image is a composed architectural scene, not noise. Six scene generators
cover the six categories; a project reuses the generator that matches its primary
category:

| Scene | Used by | What it composes |
| --- | --- | --- |
| `tower` | Apartments, ETH Infra — Haridwar One | Stacked slabs and balcony rhythm on a tower mass, service core, amenity deck, arrival podium, low horizon. Haridwar One adds a river band. |
| `villa` | Villas, Luxofy | A low-slung mass with a deep cantilever over a lit glazed recess, a stone volume, a reflecting water plane, palms, an apartment block, a landscaped approach. |
| `commercial` | Commercial Spaces, Omaxe Chowk | Three set-back masses carrying a dense grid of lit windows, a street-level arcade of arched bays, lamplit street, flanking district skyline. |
| `eco` | Sustainable Living, WE Communities | Rolling contour lines, two clusters of pitched roofs, overlapping tree canopies, a water court, a community walk. Sage-leaning. |
| `serene` | Spiritual Residences | A still reflecting pool, a colonnade repeated in one-point perspective, a distant mountain, a single low sun. Lotus-leaning, deliberately non-denominational — no religious iconography of any faith. |
| `plots` | Plots, Garden Court, Verdaant Court, Yugen | A plotted grid over open land in one-point perspective, a central spine road, boundary posts, corner markers, a hedge line, an entrance gate, a villa silhouette on the horizon. |

### The shared treatment

Every scene is drawn once in a world coordinate frame and then cropped by a
camera, so the five images of a project are the same place from different
positions rather than five unrelated pictures. Camera height, crop and
time-of-day tint are what change between them.

On top of that, every file gets the same finishing pass:

- Deep carbon background with a soft radial light source positioned on a
  world-space sun, so the glow moves with the camera.
- A horizon haze band in the category's accent colour.
- Three to four depth planes stepping through the carbon ramp
  (`#0a0a0c → #131418 → #191b20 → #212429`), each plane forward a shade lighter.
- A warm gold rim light on one edge of the primary mass. The key light stays warm
  across the whole system; a category leans its palette only through the haze and
  hairlines (`sage` for Sustainable Living and Plots, `lotus` for Spiritual
  Residences, `steel` for Commercial).
- A fine vertical grid at very low opacity.
- A vignette.
- Film grain from an inline `<feTurbulence>` — no raster, no external asset.

Palette tokens mirror `src/app/globals.css` exactly.

### Time of day

Five moods (`dusk`, `gold`, `blue`, `night`, `dawn`) set the sky ramp, the glow
strength, the haze, the lit-window brightness and the sun height. They change
only attribute values, never which shapes are drawn, so the same place stays
recognisable across a gallery.

## Output

42 files. Dimensions are fixed by where they are used:

| Path | Size | Count |
| --- | --- | --- |
| `public/media/categories/<category-slug>.svg` | 1200×1500 (portrait, tall cards) | 6 |
| `public/media/projects/<slug>/hero.svg` | 1920×1080 | 7 |
| `public/media/projects/<slug>/gallery-01…04.svg` | 1600×1100 | 28 |
| `public/media/projects/garden-court/masterplan.svg` | 1400×900 | 1 |

Slugs: `omaxe-chowk`, `luxofy`, `garden-court`, `we-communities`,
`eth-infra-haridwar-one`, `verdaant-court`, `yugen`.

Every file carries `viewBox`, `preserveAspectRatio="xMidYMid slice"`,
`role="img"` and a `<title>`/`<desc>` pair. Every gradient, pattern, clip path
and filter id is prefixed with the file's own key, so several of these can be
inlined on one page without colliding. No `<script>`, no embedded raster, no
external reference. The script refuses to write a file over 40 KB or one
containing a non-finite coordinate; the largest today is about 34 KB.

## The masterplan

`garden-court/masterplan.svg` is the backdrop for the interactive plot picker in
`src/components/property/detail/masterplan-picker.tsx`. That component draws the
18 plot rectangles itself, from `plan: {x, y, w, h}` percentages in
`src/content/projects.ts`, and renders the image at `aspect-[14/9]` with
`object-fill` — which is exactly 1400×900, so percentages map 1:1.

The drawing therefore contains only what sits *under* those rectangles: the site
boundary, the service road grid, two planted boulevards, the entrance court, the
amenity block and pool, the green edge with contour lines, a north arrow and a
scale bar. It does draw a subtle pad under each of the 18 plot positions so the
plan reads as plotted land, at the same percentages the content layer uses
(columns at x = 8, 20, 32, 44, 56, 68; rows at y = 12, 40, 68; each w = 9,
h = 11). It does **not** draw plot numbers or availability states — those belong
to the React layer.

The scale bar is deliberately labelled `SCALE — INDICATIVE` rather than carrying
a distance. No dimension for this site has been supplied, and the data honesty
rule in `docs/ENGINEERING.md` §1 applies to a drawing as much as to a number.

## Replacing the artwork with real photography

When a project supplies photography, nothing about the component layer changes —
only the content layer and the files.

1. **Drop the files in.** Put the photographs under `public/media/projects/<slug>/`.
   Keep or change the filenames; the content layer is what points at them.
   Match the aspect ratios above so the existing `sizes` and `aspect-*` classes
   still frame correctly: 16:9 for a hero, roughly 16:11 for gallery frames,
   4:5 for a category card, 14:9 for the masterplan.

2. **Edit `src/content/projects.ts`.** Each image is a `MediaAsset`
   (`src/types/catalog.ts`):

   ```ts
   hero: {
     src: "/media/projects/luxofy/hero.jpg",   // ← new path
     alt: "…",                                  // ← describe the photograph
     placeholder: false,                        // ← must flip to false
     caption: null,                             // ← optional credit or note
   },
   ```

   The fields to change per project are `hero`, `gallery` and — for Garden Court —
   `masterplan`. `gallery` is built by the local `gallery(slug, alts)` helper at
   the top of the file, which hard-codes `.svg` paths and `placeholder: true`.
   Once real images arrive for a project, replace that helper call with a literal
   array of `MediaAsset` objects for that project rather than editing the helper,
   so projects still on generated art keep working.

   For category art, the same applies to the `hero` field of each entry in
   `src/content/categories.ts`.

3. **`placeholder` must become `false`.** It is the flag the UI uses to tell a
   stand-in from a photograph. Leaving it `true` on a real photograph is a data
   honesty bug, not a cosmetic one.

4. **Remove the generated file** only once nothing points at it. The script
   regenerates whatever is listed in its job table, so if a path is no longer
   wanted, delete its entry from `CATEGORY_JOBS` / `PROJECT_JOBS` in
   `scripts/generate-media.mjs` at the same time — otherwise the next run puts the
   file back.

5. **Raster formats need no config change.** `next.config.ts` already sets
   `images.remotePatterns`, `qualities` and `formats`; `dangerouslyAllowSVG` is
   only there for this generated art and can stay.

## Changing the generated art

Everything lives in one file. The pieces worth knowing:

- `makeRng(seed)` — the seeded PRNG. Every scene is seeded from a stable `place`
  string, so the structure is identical across a project's five images. Never use
  `Math.random()`, and never let a mood or camera value decide whether a shape is
  drawn — that would desynchronise the gallery.
- `ground(X, z)` / `rise(H, z)` — the one-point perspective projection used by the
  `plots` and `serene` scenes.
- `focus` maps — each scene returns named camera positions (`wide`, `portrait`,
  `elevation`, `gate`, …). The job table picks one per output file. Reframing an
  image means changing `cx` / `cy` / `s` there, not changing the scene.
- `n()` throws on a non-finite coordinate rather than emitting `NaN`, and `write()`
  refuses any file with a forbidden token or over the size budget. Both are
  deliberate: a broken image should fail the build, not ship.
