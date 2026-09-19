# TokenZameen — data layer

Everything that turns a click on a CTA into a row a human can act on: the
schema, the repository, the validated routes, the forms, and lead scoring.

| Path | What it is |
| --- | --- |
| `src/db/schema.ts` | Drizzle pgTable definitions and the enums |
| `src/db/client.ts` | Lazy, memoised postgres.js pool; `getDb()` returns `null` when unconfigured |
| `src/db/repositories.ts` | Typed functions returning `{ ok, data } \| { ok: false, error }` |
| `src/db/migrations/` | Generated SQL, committed |
| `src/lib/env.ts` | Zod-parsed environment; never throws at import |
| `src/lib/validation.ts` | The Zod schemas the forms and the routes both use |
| `src/lib/leads.ts` | Lead scoring, reference codes, unrecorded-lead logging |
| `src/lib/rate-limit.ts` | In-memory fixed-window limiter and IP hashing |
| `src/app/api/**` | Route handlers |
| `src/components/forms/**` | The forms, built on the shared `Field` primitives |
| `scripts/seed-db.ts` | Idempotent seed for advisors and sample inventory |

## Finishing provisioning

The Postgres instance is not attached yet. It is blocked on a one-click terms
acceptance in the Vercel dashboard that only the repository owner can complete.
In order:

1. Accept the Neon marketplace terms in the Vercel dashboard.
2. `vercel integration add neon --plan free_v3 -m region=sin1 -m auth=true -n tokenzameen-db --no-claim`
3. `vercel env pull`
4. `pnpm db:push`
5. `pnpm db:seed`

`pnpm db:generate` works without any of this — it reads the schema file and
writes SQL. `db:push`, `db:studio` and `db:seed` need a live `DATABASE_URL`.

## What happens without a database

This is the part that matters most, so it is spelled out.

- `env.hasDatabase` is `false` and `getDb()` returns `null`.
- Every repository function returns `{ ok: false, error: { code: "no-database" } }`.
  Nothing throws, so a page render or a build is never taken down by it.
- `POST /api/leads`, `/api/site-visits` and `/api/documents/request` log the
  entire submitted payload through `logUnrecordedLead()` at **error** level,
  prefixed `[lead:UNRECORDED]`, so it is recoverable from the platform logs.
- Those routes then return **HTTP 503** with `{ ok: false, error: "unavailable" }`.
  They never return a reference code.
- `useLeadSubmit` only enters its `success` state when the response carries a
  reference, so `FormShell` cannot render the success panel. It renders
  `AdvisorFallback` instead: the advisor's phone, WhatsApp and email from
  `SITE`, plus the message the buyer can send, with a copy button.
- `POST /api/analytics` still answers 202 and drops the event. Analytics is
  never allowed to be the reason a page feels broken.

A buyer is never told their enquiry was received unless a row exists.

For the fallback to be useful, `NEXT_PUBLIC_ADVISOR_PHONE`,
`NEXT_PUBLIC_ADVISOR_WHATSAPP` and `NEXT_PUBLIC_ADVISOR_EMAIL` must be set.
Blank values mean a failed enquiry has nowhere to go.

## Money

**Money is stored as a whole number of Indian rupees, in `bigint` columns read
as JavaScript numbers.** No paise, no floats, no decimals. `₹1 crore` is
`10000000`.

This matches `src/content/projects.ts`, where `Money.amount` is already whole
rupees, and `formatAmount()` in `src/lib/format.ts`, which renders a rupee
figure. `bigint` rather than `integer` because `int4` tops out around ₹214
crore, which a commercial asset can exceed.

Areas are `numeric(12,2)` — not money, and fractional for acres.

## Schema

**`leads`** — one row per enquiry, whatever CTA produced it.
`reference` is the short human code (`TZ-7F3K2A`, unique). Contact and
requirement fields, `source` (PRD 01 §30), `score`/`stage` (§32),
`status` (§30), `advisorId`, `lastContactAt`, `nextFollowUpAt`, `consent`,
five UTM columns, `ipHash`, `userAgent`. Indexed on `createdAt`, `status`,
`stage`, `projectSlug`, `advisorId`, `phone`.

**`site_visits`** — `leadId` FK (cascade), `projectSlug`, `preferredDate`
(a `date`, compared in IST), `preferredTime`, `visitors`, `status`
(requested / confirmed / completed / cancelled), `notes`.

**`lead_events`** — the audit trail scoring reads. `leadId` FK (cascade),
`type`, `payload` jsonb, `createdAt`. `location` and `timeline` from the
advisory form have no column on `leads` and are carried here instead, so
nothing a buyer typed is discarded.

**`advisors`** — `name`, `email` (unique), `phone`, `active`.

**`inventory_units`** — where admin-managed inventory will live, replacing the
`sample: true` rows in `src/content/projects.ts`. Unique on
`(projectSlug, unitNumber)`, which is what makes the seed idempotent. `isSample`
carries the content file's `sample` flag through, so the UI keeps showing
`DISCLAIMERS.sampleInventory` next to those rows. Villas map their built-up area
to `areaMin`/`areaMax`, falling back to plot area when built-up is unknown.

**`analytics_events`** — `type` (PRD 01 §41), `projectSlug`, `categorySlug`,
`payload` jsonb, `sessionHash`. Indexed on `(type, createdAt)` and `projectSlug`.

**`subscribers`** — newsletter signups from the footer. `email` (unique, stored
lowercased), `source` (defaults to `footer`), `consent`, `ipHash`, `userAgent`,
`createdAt`, `unsubscribedAt`. Deliberately not a lead: no phone, no score, no
reference, never joined to `leads`. `subscribe()` treats a duplicate as success
and clears `unsubscribedAt`; `POST /api/newsletter` takes `{ email, consent }`
and returns the same 503 shape as the lead routes when the database is absent.

Unknown values are `null` throughout. Nothing is defaulted to a made-up number.

## Lead scoring

PRD 01 §32 as a transparent rules engine in `src/lib/leads.ts`. It is not
machine learning and should not be described as such. `scoreLead()` is pure:
event history plus lead fields in, a number and a stage out, with `now` as an
argument so recency is testable.

Each event type scores `first` on its first occurrence and `repeat` on each one
after, and its total contribution is capped at `cap`.

| Event | First | Repeat | Cap |
| --- | ---: | ---: | ---: |
| `created` | 2 | 0 | 2 |
| `property-view` | 4 | 1 | 8 |
| `compare` | 6 | 1 | 8 |
| `whatsapp` | 6 | 1 | 8 |
| `save` | 8 | 2 | 12 |
| `callback` | 8 | 2 | 12 |
| `call` | 8 | 2 | 12 |
| `brochure-download` | 10 | 2 | 14 |
| `document-request` | 10 | 2 | 14 |
| `advisory` | 10 | 2 | 14 |
| `enquiry` | 12 | 3 | 18 |
| `request-price` | 14 | 3 | 20 |
| `site-visit-request` | 20 | 4 | 28 |
| `site-visit-completed` | 26 | 4 | 34 |
| `purchase-intent` | 30 | 0 | 30 |

`status-change`, `advisor-assigned` and `note` score nothing; they are audit
entries.

Profile completeness: email `+4`, budget `+6`, purpose `+4`, a named property
`+4`, consent `+2`.

Recency decay, by event age: ≤14 days ×1, ≤45 days ×0.75, ≤90 days ×0.5, older
×0.25.

The total is clamped to 0–100 and mapped to a stage:

| Stage | Score |
| --- | --- |
| `cold` | 0 – 24 |
| `warm` | 25 – 49 |
| `hot` | 50 – 74 |
| `purchase-ready` | 75 – 100 |

**Stage floors** override the arithmetic, because the PRD's ladder is a promise
to the sales team: someone who asked for a site visit is never displayed as
cold. A `purchase-intent` or `site-visit-completed` event forces at least
`purchase-ready`; `site-visit-request` or `request-price` forces at least `hot`;
`save`, `enquiry`, `advisory`, `brochure-download` or `document-request` forces
at least `warm`.

A new lead's `source` is mapped to its first rung by `SOURCE_EVENT`, so a lead
that arrives already at purchase intent is scored as such on the insert rather
than starting cold.

`rescoreLead(leadId)` re-runs the engine over the whole event history and
persists the result, so the stored score is always explainable by the audit
trail rather than by the order calls happened to arrive in.

## Validation

`src/lib/validation.ts` holds one definition per shape, used by the client form
and by the route handler. Type-only imports of `@/db/schema` keep drizzle out of
the client bundle while `satisfies` still fails the build if a tuple drifts from
the database enum it mirrors.

- **Phone** — accepts `+91`, `91`, a leading `0` or a bare 10 digits, strips
  spaces, dashes, dots and brackets, requires a leading 6–9, and normalises to
  E.164 (`+919876543210`). Landlines are rejected: callback and WhatsApp both
  assume a mobile.
- **Email** — `z.email()`. Optional on most forms, required for document
  requests because that is how documents are sent.
- **Budget** — a band, not a free number. `BUDGET_BANDS` maps each band to
  `min`/`max` in whole rupees; `resolveBudgetBand()` is what the route stores.
- **Site visit dates** — ISO dates compared against today **in Asia/Kolkata**,
  because the server runs in UTC and a same-day evening request from India must
  not be rejected as past-dated. Capped at 180 days ahead.
- **Message** — 1000 characters.
- **Consent** — an explicit boolean that must be `true`.
- **Honeypot** — a `website` field, positioned off-screen and `tabIndex={-1}`.
  Anything in it is a bot.
- **Timing** — the form records when it mounted; `looksAutomated()` rejects a
  submission completed in under 1.2 seconds or claiming to have taken more than
  six hours. This runs **server-side only**. A human who somehow trips it gets
  the ordinary failure path with advisor contacts, not an error about a field
  they cannot see.

## Rate limiting — read this before trusting it

`src/lib/rate-limit.ts` is an **in-memory fixed-window limiter, per instance**.
Every Fluid Compute instance keeps its own counters, so the real ceiling is
`max × instances`, and it resets whenever an instance is recycled.

That is deliberate for now: it costs nothing, works with no database, and stops
the obvious floods. **The production upgrade is a shared store** — Upstash Redis
via the Vercel Marketplace, or a `rate_limits` table — keyed the same way, so
only the inside of `rateLimit()` changes. Vercel's WAF rate-limiting rules are
the other option and need no application change at all.

Defaults: 8 requests per 60 seconds for lead submissions, 20/min for reference
lookups, 120/min for analytics. Override with `RATE_LIMIT_WINDOW_MS` and
`RATE_LIMIT_MAX`.

### IP handling

Raw IP addresses are never stored or logged. `hashIp()` takes a salted SHA-256
digest, and only the digest reaches `leads.ipHash` or a limiter key. The salt
comes from `LEAD_HASH_SALT`. If that is unset, each instance generates a random
salt at startup and logs a warning — rate limiting still works (it is
per-instance anyway), but stored hashes stop correlating across instances.
Set the variable.

## API

Every handler validates with Zod, catches everything, returns typed JSON, leaks
no internal error text, and sets `Cache-Control: no-store`.

| Route | Behaviour |
| --- | --- |
| `POST /api/leads` | Validate → rate-limit → bot checks → create lead, append `created` + source event, score → `{ ok: true, reference }` (201) |
| `POST /api/site-visits` | Reuses an existing lead matched on the normalised phone, otherwise creates one, then writes the visit row |
| `POST /api/documents/request` | Lead with source `document-access`, plus a `document-request` event carrying `projectSlug` and `documentId` |
| `POST /api/analytics` | Fire-and-forget ingestion. **Always 202**, whatever happens |
| `POST /api/newsletter` | `{ email, consent }` → subscriber row, `{ ok: true }` (201). Not a lead; 503 without a database |
| `GET /api/leads/[reference]` | A buyer checking their own enquiry. Returns reference, status, status label, project slug and the three timestamps — never the score, stage, advisor, message or contact details |

Failure shape, shared with the client as `ApiFailure`:

```json
{ "ok": false, "error": "unavailable", "message": "…", "fields": { "phone": "…" } }
```

`error` is one of `invalid` (400), `rejected` (422), `rate-limited` (429),
`not-found` (404), `unavailable` (503), `unknown` (500).

## Forms

Built with react-hook-form and the shared `Field` / `TextInput` / `Select` /
`TextArea` / `Checkbox` / `RadioPill` primitives. No second form kit.

`EnquiryForm`, `SiteVisitForm`, `AdvisoryForm`, `DocumentRequestForm` and
`CallbackForm` all render through `<FormShell>`, which owns pending, success
(showing the reference) and the failure fallback. Errors are tied to their input
with `aria-describedby` through the local `FormField` wrapper, the submit button
is disabled while pending, and `useLeadSubmit` holds an in-flight ref so a
double click cannot double-submit.

`<EnquiryDialog>` wraps `EnquiryForm` in the shared `<Overlay>`:

```tsx
import { EnquiryDialog, EnquiryCta } from "@/components/forms";

const [open, setOpen] = useState(false);
<EnquiryDialog
  open={open}
  onClose={() => setOpen(false)}
  projectSlug={project.slug}
  projectName={project.name}
  source="property-enquiry"
/>;

// Or, for a button that owns its own state:
<EnquiryCta projectSlug={project.slug} projectName={project.name} label="Express Interest" />;
```

The forms never import the catalog. A property picker is rendered only when a
Server Component passes `properties={[{ slug, name }]}`; with a `projectSlug`
the property is fixed and shown as a read-only row.

## Seeding

`pnpm db:seed` refuses to run without `DATABASE_URL`. It upserts one advisor
record (skipped entirely unless `SEED_ADVISOR_EMAIL` or
`NEXT_PUBLIC_ADVISOR_EMAIL` is set — an advisor is not invented) and mirrors
every `sample: true` unit from `src/content/projects.ts` into `inventory_units`
with `isSample` true. Upserts are keyed on `(projectSlug, unitNumber)`, so
running it repeatedly is safe.
