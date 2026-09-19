# TokenZameen — Purchase Marketplace

A premium property discovery and acquisition platform. Buyers browse a curated
collection across six categories, compare properties, read the investment case,
and move into an advisor-led purchase journey.

Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4,
TypeScript and Drizzle ORM on Postgres. Deploys to Vercel.

## Getting started

```bash
pnpm install
pnpm dev
```

The site runs without a database. Every page of the public catalogue is static
content, so discovery, category pages and project pages work immediately. Only
lead capture and the admin panel need Postgres.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm check:data` | Verifies every property fact against the brief |
| `pnpm verify` | typecheck + lint + check:data + build |
| `pnpm db:push` | Applies the schema to Postgres |
| `pnpm db:seed` | Seeds advisors and indicative inventory |

## The data honesty rule

This is the most important thing to understand before changing anything.

Property facts — prices, areas, RERA numbers, possession dates, tenants, yields,
amenity lists, travel times — appear only where the brief in `docs/prd/` supplies
them. Everything else is `null` in `src/content/projects.ts` and renders as "On
request" or an explicit "information being compiled" block.

That is deliberate, not unfinished work. A fabricated price on a property site is
something a buyer can act on. `pnpm check:data` fails the build if a fact appears
without a source, if a RERA number is invented, if Property Intelligence scores
are set without a recorded assessment, or if indicative inventory quotes money.

When real data arrives, add it to `src/content/projects.ts` and register the
figure's source in `scripts/check-content.ts`.

Indicative inventory (the Garden Court plot layout and the Omaxe Chowk unit rows)
exists to demonstrate the selection interface. Every row carries `sample: true`,
renders with a visible disclaimer, and is switched off by setting
`SHOW_SAMPLE_INVENTORY` to `false` in `src/content/config.ts`.

## Structure

```
src/
  app/                  routes — see docs/ENGINEERING.md section 6
  components/
    ui/                 design-system primitives
    motion/             scroll reveal, count-up
    layout/             header, footer, logo
    purchase/           Purchase landing sections
    discovery/          filters, grid, compare, shortlist
    category/           the six category experiences
    property/           cards, detail page sections
    forms/              enquiry, site visit, advisory, document access
    admin/              internal CMS
  content/              the catalogue — the source of truth for facts
  lib/                  catalogue queries, filters, formatting, SEO
  db/                   Drizzle schema and repositories
  types/                domain model
docs/
  prd/                  the original brief, extracted
  ENGINEERING.md        the contract every contributor works to
  DATA.md               schema, lead scoring, provisioning steps
  MEDIA.md              generated artwork, and how to replace it
```

## Typography

The brief specifies PP Neue Machina for headings and Neue Montreal for
subheadings. Both are commercially licensed and cannot be fetched at build time,
so Space Grotesk and Manrope stand in for them; Inter is used for body copy as
specified. To swap in the licensed files, drop the woff2 into `src/fonts/` and
replace the two calls in `src/lib/fonts.ts` with `next/font/local`, keeping the
same CSS variable names. Nothing else changes.

## Imagery

There is no project photography yet. `scripts/generate-media.mjs` generates an
original abstract SVG artwork system — one visual language across all seven
projects and six categories. See `docs/MEDIA.md` for how to replace it.

## Environment

Copy `.env.example` to `.env.local`. Nothing is required for the public site.

## Deployment

The project is linked to Vercel. `vercel` for a preview, `vercel --prod` for
production. Set `NEXT_PUBLIC_SITE_URL` on the project so canonicals and
structured data resolve to the real domain.
