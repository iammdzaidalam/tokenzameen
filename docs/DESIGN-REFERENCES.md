# Design references — the visual contract

Eight reference boards were supplied alongside the brief, plus squareyards.com and
nest-scout.com as functional comparators. This file translates them into rules.
**Where this file and the PRD's "dark futuristic luxury" line disagree, this file
wins for layout and surface; the PRD wins for palette, typography and tone.** The
resolution is a light editorial base with deliberate carbon-black inversions — six
of the eight boards are light-based, and two of them (Resido, Eastate) show exactly
that light-to-black alternation.

## The eight boards and what each contributes

**01 · Verve dashboard** — soft tinted stat cards (mint, powder blue) with a value,
a progress bar and a small percentage; a topographic line texture inside the card;
a "Listing Board" rail of property cards on the right with price, title, sub-line
and a spec row of icons. → Our tinted metric cards and the investment snapshot.

**02 · Agent's office** — oversized thin heading set at the very top left; filter
and "Sort by" pills; a grid/list view toggle; property cards with a heart, a price
badge, a location line with a pin, a spec row (`3 beds | 2 bath | 120 m²`), a star
rating, and two footer buttons ("Schedule a Tour", "Contact"); a calendar panel with
day cells, busy-date and day-off legend, time-slot pills, and a full-width black
pill button. → Our discovery toolbar, our property card footer, our site-visit
booking UI.

**03 · Stayli** — a bright full-width hero photo with centred headline and a black
pill CTA; below it a white editorial band with a small left label and a large right
paragraph; icon-and-text feature pairs; a grid of image cards. → Our editorial
intro band and the small-label/large-paragraph pairing.

**04 · R. dashboard** — a saturated field of colour with glass cards over a building
photo, very large numerals, an arc chart, and a gradient tinted card. → Our
Property Intelligence and ROI panels: glass over imagery, big numerals.

**05 · Arqum** — the whole page inset in a rounded container; hero image left with
the headline bottom-left; a floating white search card on the right with labelled
selects, chip rows (size, bedrooms, parking), a min/max price pair, a black pill
"Search" and a "+ More Filter" ghost button; below, a "Artistic Flair" card, a
success-rate stat card, and image tiles each carrying a circular ↗ button. → Our
hero search card, our chip rows, our ↗ tiles.

**06 · Resido.Inc** — enormous lowercase display line ("buy.sell.rent") over a warm
interior photo with rounded top corners; a small accent-dot label ("* Award-winning
studio"); a floating "Recent Work" card bottom-right; a trusted-by logo row; an
about band with a line drawing; three stat cells labelled `/01 /02 /03`; then a
full-black section with a large white heading and numbered icon columns. → Our
display-line hero treatment, our `/01` index labels, our black services section.

**07 · Eastate** — the closest board to what we are building. Rounded inset hero
image; centred white headline and two-line subline; a white search card overlapping
the hero with a Buy | Rent | Sell tab row, three labelled fields and a black pill
"Search"; a "Popular Search :" chip row on the image below the card; then a white
band with a two-line left heading and a right paragraph; a hairline **stat grid with
one inverted black cell**; a card combining paragraph + photo + a tan circular ↗
button; then a **black section** with a dotted map, accent pins and a floating
location card; then a "Latest Stories" image grid. → Our hero, our search card, our
stat grid, our locations section.

**08 · Blue Heritage footer** — a light footer: brand and tagline top left with
mail / phone / location rows, four link columns, a newsletter field with a square
arrow button, a wide illustrated landscape filling the lower half, socials bottom
left and legal links bottom right. → Our footer, exactly.

## Rules

### Surface rhythm

The page background is bone (`--color-bone-100`). Content sits on white cards.
Two or three sections per page invert to carbon. Use `<Section tone>`:

- `bone` — the default page band.
- `paper` — white, for bands that need to lift off the page.
- `dark` / `darker` — the inversions. Reserve them for: the hero overlay, the
  locations/network band, the advisory journey, and the footer's upper half.

Never ship more than two adjacent sections of the same tone.

### The hero (boards 05, 06, 07)

Not full-bleed. The hero image is an **inset rounded block**: horizontal margin at
the page gutter, `rounded-frame`, `overflow-hidden`, roughly `68–78vh`. Inside:
dark overlay, grain, centred display headline, two-line subline. The **search card
overlaps its lower third**, and a "Popular searches" chip row sits under the card,
still on the image. The site header sits *above* the hero on the bone background,
not over the image.

### The search card (boards 05, 07)

White, `rounded-card`, `shadow-lift`. A tab row on a bone track with the active tab
as a white pill. Three labelled fields — Property Type, Location, Budget — each a
small uppercase label over a control. A carbon pill "Search" button at the end of
the row. On mobile the fields stack and the button goes full width. Every field
writes into `FilterState` and submits to `/purchase/properties` with the query
string, so the card is real search, not decoration.

### Chips (boards 02, 05, 07)

Rounded-full, hairline border, bone background, carbon text. Used for popular
searches, applied filters, category switching and spec values. Active state is a
carbon fill with bone text.

### Stat grid (boards 06, 07)

`<StatGrid>` renders hairline cells with exactly one inverted carbon cell, chosen by
index. Values count up. Never invent a statistic — every number must be something
the site can actually count, such as projects in the collection, categories, or
cities covered.

### Index labels (board 06)

`<IndexLabel index="01">Section name</IndexLabel>` — an accent dot, a `/01` in the
accent colour, then the label in the eyebrow style. Use on section headers and
numbered lists.

### Tiles (boards 05, 07)

Image tiles carry a circular arrow button, `<TileArrow>`, top-right or bottom-right,
rotating 45° on hover. Use on category cards, editorial tiles and feature cards.

### Property card (boards 01, 02, 07)

Image with the price as a badge on the image, a heart top-right, then: category
eyebrow, name, location with a pin, a **spec row** of two or three values separated
by hairlines, and a footer with a primary "View Property" and a secondary
"Schedule a Visit". Spec values come from real data and read "On request" when the
field is null.

### The black band (boards 06, 07)

Every page gets one carbon inversion carrying its heaviest idea: on the landing
page it is the advisory journey, on a category page the storytelling block, on a
project page the investment snapshot. Large white display heading, numbered
columns, generous padding.

### Footer (board 08)

Light bone. Brand block left with tagline and contact rows. Four link columns.
Newsletter field with a square accent arrow button. A wide illustrated landscape
across the lower half at low contrast. Socials bottom left, legal links bottom
right, copyright and the full disclaimer above them.

### Typography

Display: Clash Display, self-hosted, standing in for PP Neue Machina. Subheads and
UI: Switzer, standing in for Neue Montreal. Body: Inter, as the brief specifies.
Headlines are large and tight — `display-2xl` only in a hero. Reference board 06
sets its display line enormous and lowercase; use that treatment once per page at
most.

### Accent

Gold replaces the references' orange and tan. On bone, the accent is `gold-600`;
on carbon it is `gold-400`. Never use gold for body text.
