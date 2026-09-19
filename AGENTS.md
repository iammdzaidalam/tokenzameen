<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TokenZameen — engineering rules

Read `docs/ENGINEERING.md` and `docs/DESIGN-REFERENCES.md` before writing code.
Together they are the contract every contributor works to. The short version:

## Non-negotiables

1. **Never invent property facts.** Prices, areas, RERA numbers, possession dates,
   tenant names, yields, amenity lists and travel times come only from
   `docs/prd/*.txt` or from the database. Anything unknown is `null` in the data
   layer and renders as "On request" in the UI. There is a lint script for this:
   `pnpm check:data`.
2. **No AI-tell comments.** Do not write `// Fetch the user data` above a line that
   fetches user data. Comment only to explain a decision a reader could not infer
   — a workaround, a spec reference, a non-obvious constraint. Most files need
   zero comments.
3. **Type safety is not optional.** `pnpm typecheck` must pass. No `any`, no
   `@ts-expect-error`, no `as unknown as`.
4. **Nothing throws in a render path.** Data helpers return `null`/empty arrays and
   the UI handles that state. Route handlers catch and return typed JSON errors.
5. **The design follows the reference boards.** `docs/DESIGN-REFERENCES.md` turns the
   eight supplied boards into rules: a light editorial base on bone, carbon-black
   inversion sections, an inset rounded hero with a floating search card, chip
   rows, hairline stat grids with one inverted cell, `/01` index labels and
   circular arrow buttons on tiles. Where it disagrees with the PRD's "dark
   futuristic luxury" line, it wins on layout and surface; the PRD wins on
   palette, typography and tone.
6. **Stay inside your assigned files.** If you need something outside them, add it
   to your hand-off notes instead of editing another owner's file.

## Next.js 16 facts that differ from older training data

- Turbopack is the default for `next dev` and `next build`. No `--turbopack` flag.
- `params` and `searchParams` are Promises. So are `cookies()`, `headers()`,
  `draftMode()`. Always `await` them.
- Use the generated helpers: `PageProps<'/purchase/[slug]'>`, `LayoutProps<'/'>`,
  `RouteContext<'/api/leads'>`. Run `pnpm typegen` if a route is new.
- `middleware.ts` is now `proxy.ts`, exporting `proxy()`. Node.js runtime only.
- `next lint` is gone. Use `pnpm lint` (ESLint CLI, flat config).
- `images.qualities` defaults to `[75]`; `images.domains` is removed, use
  `images.remotePatterns`.
- `revalidateTag(tag)` now needs a cache-life profile: `revalidateTag(tag, 'max')`.
- Parallel-route slots require an explicit `default.tsx`.

## Commands

```
pnpm dev          # next dev
pnpm build        # next build
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm check:data   # fails if seed content contains placeholder-looking fabrications
pnpm verify       # typecheck + lint + check:data + build
```
