# TokenZameen — admin panel

The internal panel at `/admin`. It is single-tenant: one admin credential set in
the environment, verified server-side, and a signed session cookie. A multi-user
role model (advisors signing in to see only their own leads, an editor role for
content) is a later phase and will replace the credential, not extend it.

| Path | What it is |
| --- | --- |
| `src/proxy.ts` | Next.js 16 proxy (the file that used to be `middleware.ts`); gates `/admin/**` and `/api/admin/**` on the cookie alone |
| `src/lib/auth.ts` | Password verification, session signing, login rate limiting, cookie helpers |
| `src/app/admin/login` | The sign-in page and its Server Actions |
| `src/app/admin/(panel)/**` | The sections, one folder each, with their Server Actions in `actions.ts` |
| `src/app/api/admin/**` | The CSV export and the health endpoint |
| `src/components/admin/**` | Shell, navigation, tables, chips, metric cards, forms |

## Setup

Three variables. The panel refuses to sign anyone in until all three are present
and well-formed; the login page says which are missing and does not 500.

| Variable | What it is |
| --- | --- |
| `ADMIN_EMAIL` | The one email allowed to sign in. Compared case-insensitively. |
| `ADMIN_PASSWORD_HASH` | An scrypt hash of the password in the format below. The password itself is never stored. |
| `SESSION_SECRET` | At least 32 random characters. HMAC-signs the session cookie. Rotating it signs everyone out. |

### 1. Generate the password hash

Node's built-in `crypto.scrypt` with its default parameters (N=16384, r=8, p=1),
a 16-byte random salt and a 64-byte key. No dependency. Run this once, locally,
with the password as the argument:

```
node -e "const c=require('node:crypto');const s=c.randomBytes(16).toString('hex');console.log('scrypt$'+s+'$'+c.scryptSync(process.argv[1],s,64).toString('hex'))" 'the-password'
```

The output looks like `scrypt$<32 hex chars>$<128 hex chars>`. That whole string
is the value of `ADMIN_PASSWORD_HASH`. The single quotes keep the shell from
expanding anything in the password; do not paste the password anywhere else.

bcrypt hashes are not accepted: supporting them would mean adding a dependency,
and scrypt from the standard library is enough for one credential.

### 2. Generate the session secret

```
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

### 3. Add the variables

Locally, put them in `.env.local` (never committed). On Vercel:

```
vercel env add ADMIN_EMAIL production
vercel env add ADMIN_PASSWORD_HASH production
vercel env add SESSION_SECRET production
```

Repeat for `preview` if the panel should work on preview deployments, with a
different secret. When pasting the hash, paste the full `scrypt$…$…` string; the
`$` characters are part of the value.

`src/lib/env.ts` does not know these keys yet. `src/lib/auth.ts` reads them from
`process.env` with the same lazy, non-throwing discipline: an invalid value is
logged once under `[auth]` and treated as unset.

### 4. First login

Open `/admin`. With no cookie the proxy redirects to `/admin/login?next=/admin`.
Sign in with `ADMIN_EMAIL` and the password you hashed. On success the browser
receives `tz_admin_session`: HttpOnly, SameSite=Lax, Secure in production,
twelve hours long, and re-issued by the proxy on any request made more than
thirty minutes after it was last signed, so a working session does not expire
mid-afternoon.

Five failed attempts from one connection in fifteen minutes lock that connection
out for the rest of the window. The counter is keyed on a salted hash of the IP
(the same `hashIp` the lead forms use, so `LEAD_HASH_SALT` should be set) and
lives in memory per instance, with the caveats in `docs/DATA.md`. A successful
login clears it.

Sign out from the sidebar. It deletes the cookie and returns to the login page.

## How the gate works

The proxy verifies the cookie's HMAC signature and expiry and nothing else: no
database, no lookup. Unauthenticated page requests are redirected to the login
page with `next` set; unauthenticated `/api/admin/**` requests receive
`401 { ok: false, error: "unauthorized" }`. A signed-in user who opens
`/admin/login` is sent to `/admin`.

That is the optimistic check the Next.js authentication guide describes. The
real check happens next to the data: every page calls `requireAdmin()`, and every
Server Action and route handler calls `getSession()` before it touches a
repository. `next` is only honoured when it points inside `/admin`, so the login
form cannot be used as an open redirect.

The session payload is `{ v: 1, sub: "admin", iat, exp }`. It carries no email
and no personal data.

## Without a database

Every section handles `env.hasDatabase === false` with the same explicit
"no database connected" state that names `DATABASE_URL` and points at
`docs/DATA.md`. No page throws, no page shows demonstration rows. Server Actions
return a message saying nothing was saved. The CSV export answers 503.

## Sections

Every number in the panel is a count of rows. Nothing is projected.

**Dashboard** — tinted metric cards for leads this week, hot and purchase-ready
leads, site visits awaiting confirmation and all leads, each with its share of
an honest denominator; conversion figures from `getAnalyticsSummary` over the
last 30 days, labelled as computed from recorded events; enquiries by source;
the six newest leads.

**Leads** — the core screen. A table with every field from PRD 01 §30, filter
pills by status, stage and source, search by name, phone, email or reference,
a list/grid toggle, and pagination. Sorting other than newest-first is applied
to the current page and says so when there are more rows than fit. Open a lead
for the full record, its site visits, and the timeline from `lead_events` with
the score the rules engine gives after each event. From there: change status
(all eight), set the next follow-up date, assign an advisor, add a note, or
recalculate the stored score. "Export CSV" downloads every lead.

**Site visits** — requests by status with confirm, complete and cancel. Marking
a visit completed also writes a `site-visit-completed` event to the lead and
rescores it, because that is the rung of the PRD ladder the event represents.

**Inventory** — `inventory_units` grouped by project, with an inline status
change (available / reserved / sold), a remove action, and a form to add or
update a unit keyed on project and unit number. Rows flagged indicative are
demonstration data mirrored from the content file by `pnpm db:seed`; the
disclaimer is shown above the tables whenever any exist.

**Projects** — read-only. The catalogue from `src/lib/catalog.ts` with each
project's verified facets and its `pendingInformation` list, so the team can see
what is still missing per project. Content is edited in
`src/content/projects.ts` and gated by `pnpm check:data`; there is no editor.

**Advisors** — list, add, deactivate, reactivate. Deactivating keeps existing
assignments.

**Analytics** — event counts by type over the last 7 and 30 days, totals, the
three conversion ratios, and property views by project. Search terms and filter
usage are counted; their per-term breakdown waits for a repository function that
reads event payloads.

**Documents, Offers, Content** — later phases. Each page says what it will hold
and what it depends on, with no placeholder rows.

## API

Both endpoints sit behind the proxy and re-check the session themselves.

| Route | Behaviour |
| --- | --- |
| `GET /api/admin/leads/export` | Every lead as UTF-8 CSV with a BOM, one row per lead, advisor and project names resolved. Cells are quoted and formula-leading characters are neutralised. Capped at 5,000 rows, with `X-Truncated: true` if the cap was hit. 503 without a database. |
| `GET /api/admin/health` | `hasDatabase`, whether the admin credential is configured, and, with a database: reachability, which schema tables exist, the migration tags in the journal, and the count of applied migrations from `drizzle.__drizzle_migrations` (null when `db:push` was used). |

## Verification walk-through

- Unauthenticated `GET /admin/leads` → proxy finds no valid cookie → 302 to
  `/admin/login?next=%2Fadmin%2Fleads`.
- Wrong password five times → attempts one to five each return "That email and
  password do not match" and consume one slot; the sixth from the same
  connection returns the rate-limit message without checking the password.
- Valid login, then an expired cookie → `verifySessionToken` sees `exp <= now`,
  returns `null`, the proxy redirects to login and clears the stale cookie.
- No `DATABASE_URL` → every page renders its named empty state; every action
  returns "nothing was saved"; the export answers 503.
- Status change on a lead → the Server Action re-checks the session, validates
  with Zod, calls `updateLeadStatus` (which writes the `status-change` event),
  then revalidates `/admin`, `/admin/leads` and the lead's page.
