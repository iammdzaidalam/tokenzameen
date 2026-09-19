# TokenZameen Purchase — engineering contract

Source of truth for the product is `docs/prd/01-purchase-marketplace-prd.txt` and
`docs/prd/02-purchase-experience-prd.txt`. Where the two disagree, document 02 is
newer and wins — it adds the sixth category, Spiritual Residences.

## 1. The data honesty rule

This is a real-estate site. Inventing a price, an area, a RERA number, a travel
time, a possession date, a tenant or a yield is not a cosmetic bug — it is a
statement a buyer could act on.

- Every factual value in `src/content/projects.ts` traces to the brief. Nothing
  else may be added there without a source.
- Unknown numeric values are `null`. `formatMoney`, `formatArea`, `formatPercent`
  and `formatPriceFrom` already render `null` as "On request" / "Price on request".
- Unknown lists are `[]`. UI must handle the empty case with an honest state, not
  by hiding the section silently and not by filling it with invented entries.
- `project.pendingInformation` is the brief's own list of fields the project owner
  has not supplied. Render it as an explicit "information being compiled" block.
- `project.intelligence` is `null` for every project today. The Property
  Intelligence section must render its "awaiting assessment" state, which explains
  the factors TokenZameen weighs and offers to send the assessment. Do not derive
  scores from other fields.
- Inventory rows carrying `sample: true` are indicative layout data used to show
  how selection works. Anywhere they appear, `DISCLAIMERS.sampleInventory` must
  appear with them, visibly, not in a tooltip.
- Financial output (EMI, ROI, yield) always ships with `DISCLAIMERS.financial` or
  `DISCLAIMERS.calculator` next to it.

`pnpm check:data` enforces the mechanical parts of this.

## 2. Code standards

- TypeScript strict. No `any`, no `@ts-expect-error`, no double assertions.
- Server Components by default. `"use client"` only where state, effects, or
  browser APIs are genuinely needed, and as far down the tree as possible.
- Comments explain decisions, not mechanics. `// map over the projects` above a
  `.map()` is noise and will be removed in review. Most files need no comments.
- No dead code, no commented-out blocks, no `console.log` outside a deliberate
  server-side error log.
- Nothing throws during render. Data helpers return `null` or `[]`.
- Route handlers validate input with Zod and return typed JSON. They never leak
  an internal error message to the client.
- Every interactive element is reachable by keyboard and labelled. Images have
  real alt text. Colour is never the only signal.
- Animation respects `prefers-reduced-motion`; the shared motion components
  already do.

## 3. Design system

**Read `docs/DESIGN-REFERENCES.md` first.** It translates the eight supplied
reference boards into binding layout rules. This section covers the mechanics.

A light editorial base on bone, with deliberate carbon-black inversion sections.

**Surfaces** — wrap page sections in `<Section tone="bone" | "paper" | "dark" | "darker">`.
`bone` is the default page band, `paper` is white, and the two dark tones set
`data-surface="dark"`, which flips the semantic CSS variables
(`--surface`, `--text-primary`, `--text-secondary`, `--hairline`, `--accent`).
Inside a section, prefer the semantic variables over hard-coded palette classes so
a section works in either tone:

```
text-[color:var(--text-primary)]   text-[color:var(--text-secondary)]
border-[color:var(--hairline)]     bg-[color:var(--surface-raised)]
text-[color:var(--accent)]
```

Hard palette classes (`text-bone-100`, `bg-carbon-900`, `text-gold-400`) are fine
inside a component that is only ever used on one tone, such as the hero.

**Type scale** — `text-display-2xl` (hero only), `display-xl`, `display-lg`,
`display-md`, `display-sm`. Body copy is plain `text-sm` / `text-base` /
`text-lg`. Use the `.eyebrow` utility for the uppercase label above a heading.
Headings use `--font-display` automatically. `.tabular` for aligned numbers.

**Colour** — carbon (surfaces), bone (text on dark), steel (secondary text), gold
(the single accent). `sage` belongs to Sustainable Living, `lotus` to Spiritual
Residences; use them only in those categories' sections.

**Shape and depth** — `rounded-card` for cards, `rounded-panel` for large panels,
`rounded-full` for controls. `.glass` for glassmorphism over imagery. `.grain`
adds the film grain overlay to a `relative` element. `shadow-lift`, `shadow-panel`.

**Motion** — `ease-[var(--ease-luxe)]`, 300–900ms. Hero text rises, cards scale
their image on hover, numbers count up, sections reveal on scroll, filters slide.
Nothing bounces, nothing loops, nothing blocks interaction.

## 4. Shared components you must reuse

| Import | What it is |
| --- | --- |
| `@/components/ui/container` | `<Container width="narrow"\|"default"\|"wide"\|"full">` |
| `@/components/ui/section` | `<Section tone space id aria-label>` |
| `@/components/ui/eyebrow` | `<Eyebrow withRule>` |
| `@/components/ui/button` | `<Button variant="primary"\|"secondary"\|"solid"\|"glass"\|"ghost"\|"link" size="sm"\|"md"\|"lg"\|"icon" href? full?>` |
| `@/components/ui/badge` | `<Badge tone="neutral"\|"gold"\|"sage"\|"lotus"\|"success"\|"warning"\|"danger"\|"outline">` |
| `@/components/ui/overlay` | `<Overlay open onClose title placement tone="light"\|"dark">` — focus-trapped dialog; the portal sets its own surface, so use semantic variables inside it |
| `@/components/ui/accordion` | `<Accordion items={[{id,title,content}]}>` |
| `@/components/ui/tabs` | `<Tabs items={[{id,label,content}]}>` |
| `@/components/ui/field` | `Field`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `RadioPill` |
| `@/components/ui/range-slider` | `<RangeSlider min max step value onChange formatValue minLabel maxLabel>` |
| `@/components/ui/score-bar` | `<ScoreBar label value max accent>` |
| `@/components/ui/stat-grid` | `<StatGrid stats invertIndex columns>` — hairline cells, one inverted |
| `@/components/ui/index-label` | `<IndexLabel index="01">Label</IndexLabel>` |
| `@/components/ui/tile-arrow` | `<TileArrow tone="solid"\|"glass"\|"accent">` — rotates on group hover |
| `@/components/motion/reveal` | `Reveal`, `RevealGroup`, `RevealItem`, `RevealLines` |
| `@/components/motion/count-up` | `<CountUp to from format prefix suffix>` |
| `@/components/property/property-card` | `<PropertyCard project variant="default"\|"feature"\|"compact" priority>` |
| `@/components/property/save-button` | `<SaveButton slug name>` |
| `@/components/property/compare-button` | `<CompareButton slug name withLabel>` |
| `@/components/providers/shortlist-provider` | `useShortlist()` — saved, compare, recently viewed |

Do not build a second version of any of these. If one is missing a prop you need,
add the prop rather than forking the component — and say so in your hand-off.

## 5. Data layer

```ts
import {
  getAllProjects, getProject, getCategory, getIntent, isCategorySlug,
  getProjectsInCategory, getProjectsForIntent, getFeaturedProjects,
  getRelatedProjects, getAllCities, getCategoryCounts,
  BUDGET_FLOOR, BUDGET_CEILING, categories, intents,
} from "@/lib/catalog";

import {
  parseFilters, serializeFilters, filterProjects, sortProjects,
  parseSearchQuery, countActiveFilters, EMPTY_FILTERS, SORT_KEYS, SORT_LABEL,
  type FilterState, type SortKey,
} from "@/lib/filters";

import {
  formatMoney, formatMoneyExact, formatAmount, formatPriceFrom,
  formatArea, formatBedrooms, formatPercent, formatDate, parseBudgetInput,
} from "@/lib/format";

import {
  CATEGORY_LABEL, PROPERTY_TYPE_LABEL, AVAILABILITY_LABEL,
  PURPOSE_LABEL, SPECIAL_TAG_LABEL, UNIT_STATUS_LABEL, DOCUMENT_KIND_LABEL,
} from "@/lib/labels";

import { SITE, DISCLAIMERS, SHOW_SAMPLE_INVENTORY } from "@/content/config";
import type { Project, Category, Intent /* … */ } from "@/types/catalog";
```

`parseSearchQuery("3 BHK under ₹2 crore in Delhi", getAllCities())` turns natural
language into filter values without calling a model. Search and the AI advisor
both go through it.

## 6. Routes

```
/                                  brand landing → Purchase
/purchase                          the Purchase landing (editorial)
/purchase/properties               the discovery engine
/purchase/[slug]                   category page OR project page (one dispatcher)
/purchase/compare                  comparison table
/purchase/shortlist                saved properties
/discover                          intent index
/discover/[intent]                 intent-filtered collection
/verified                          TokenZameen Verified
/advisory                          advisor enquiry
/admin/*                           internal CMS, session-protected
/api/*                             route handlers
```

`/purchase/[slug]` resolves a category first, then a project, then 404s. It is
already written. Category pages render `CategoryExperience`, project pages render
`ProjectDetail`; fill those components, do not change the dispatcher.

## 7. Media

Artwork lives at fixed paths and is generated, not photographed:

```
/media/categories/<category-slug>.svg
/media/projects/<project-slug>/hero.svg
/media/projects/<project-slug>/gallery-01.svg … gallery-04.svg
/media/projects/garden-court/masterplan.svg
```

Every `MediaAsset` carries `placeholder: true` while stand-in art is in use. Use
`next/image` with real `sizes`; set `priority` only on a hero above the fold.

## 8. Hand-off

Finish by reporting: files you created, anything you had to stub, anything you
needed from a file you do not own, and what you could not verify. Do not claim a
check passed unless you ran it.
