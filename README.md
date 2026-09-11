# AntenaPLAY — home page prototype

React prototype of the current AntenaPLAY home page, built from the Figma file
[Antena, node `1:2`](https://www.figma.com/design/nHiiSSOrx2cSLFs704cBUg/Antena?node-id=1-2&m=dev)
("TV online in Romania", 1728 × 10267).

It is the baseline for the Smart TV / RN redesign pitch: the existing page,
rebuilt as components so redesign variants can be branched off it.

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Red Hat Display (Google Fonts).

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run figma:assets # re-pull the artwork from Figma — see below
```

## How the Figma file maps onto the code

| Figma node | Section | Component |
| --- | --- | --- |
| `1:3342` | Navigation | `components/TopNav.tsx` |
| `1:6` | Hero carousel, 10 slides | `components/HeroCarousel.tsx` |
| `1:305` | Canale TV · Canale Gratuite | `components/ChannelsSection.tsx` |
| `1:994`, `1:1147`, `1:1372`, `1:1567`, `1:2389`, `1:2739`, `1:3071` | Poster rails | `components/PosterRailSection.tsx` |
| `1:3157`, `1:3160`, `1:3162`, `1:3164` | Top 10 / Top filme / Top seriale / Top show-uri TV | `components/TopTenSection.tsx` |
| `1:3158` | Evenimente LIVE | `components/LiveEventsSection.tsx` |
| `1:2177` | Mai multă Insula Iubirii (franchise takeover) | `components/BrandedRailSection.tsx` |
| `1:3419` | Subscription strip | `components/SubscribeBar.tsx` |
| `1:3166` | Footer | `components/Footer.tsx` |

The brand lockup is `src/v2027/Wordmark.tsx` — typeset wordmark plus the compact
"a" mark (`src/assets/antena-mark.svg`, from the `Logo.svg` supplied at the repo
root) tight to its right, shared by the header and the footer so the two cannot
drift. The same file is the favicon.

Design tokens live in `src/index.css` (`@theme`): `#161616` page, `#333`
hairlines, `#ea1d25` brand red, a 69.117px page gutter. Card geometry is kept at
the Figma values — 258 × 437 posters on a 266px pitch, 258 × 152 channel tiles,
291 × 493 Top-10 posters on a 356.66px pitch, 270 × 456 takeover posters on a
278px pitch, 344 × 324 live-event cards on a 352px pitch.

Content sits in `src/data` as plain data, so a rail is a list, not markup.

## Artwork

Two sources, one lookup. A card carries either a Figma asset hash or an
AntenaPLAY show slug, and `src/lib/assets.ts` resolves both; anything unresolved
falls back to a designed placeholder, so the layout stays complete either way.

| Directory | What | How to re-pull |
| --- | --- | --- |
| `src/assets/img/` — 222 files, 57 MB | Exports from Figma: every channel logo, poster, title lockup, hero still, live-event frame grab and section backdrop, named by Figma's asset hash | `npm run figma:assets` |
| `src/assets/web/` — 82 files, 18 MB | Stills from AntenaPLAY's own site for cards the Figma capture left as placeholders, named by show slug | `node scripts/fetch-antena-art.mjs` |

The Figma pull needs the Antena file open **and frontmost** in the Figma desktop
app — the local asset server only serves the active tab.

Of the 116 cards the Figma capture left without artwork, 27 were filled from
artwork the same file already had under another rail (the same title appears in
several), and 88 from AntenaPLAY's own site — the covers exist there; the capture
simply caught the page mid-lazy-load. One Top-10 card has no title in the Figma
file at all and keeps its placeholder. Fetched stills are downscaled to 900px on
the long edge, which is already 2× the largest size any card displays.

Crop position depends on the source, because the two shapes keep their content
in different places (`CardArt`):

- **Figma exports are 537×906 (0.593)** — taller than any card box — and several
  carry a promo sticker burnt into the very top edge ("DIN OCTOMBRIE", "EPISOD
  NOU"). Cropping around the centre sliced those in half, so they anchor to the
  top (`object-top`) and give up the bottom of the photo instead.
- **AntenaPLAY stills are 16:9**, where the subject sits above the middle, so
  they bias slightly upward from centre (`object-[center_32%]`).

A 40-hex key means a Figma export and anything else is a slug, so the rule needs
no extra data.

### The hero trailer

AntenaPLAY plays a trailer behind its hero. That stream sits behind their
token/auth gate — the embed script serves a "watch on AntenaPlay.ro" placard to
anonymous callers and the player page carries no manifest — so this prototype
does not play the file. Instead the stage animates the video's own first frame
(`ken-burns`, a 22s push-in with drift, restarted per slide and disabled under
`prefers-reduced-motion`), and **Redă** links out to the real trailer on their
player using the ids in `src/data/hero.ts`. If the pitch needs the actual video
rolling, ask Antena for the files — that is a one-line change here.

### Extracting more from Figma

Two things get in the way, and both have a workaround:

- The **remote Figma MCP** has a hard per-seat call quota (this account is a
  View seat) and runs out fast.
- The **desktop Figma MCP** only ever sees the document in Figma's frontmost
  tab. Switch tabs and node lookups fail with "No node could be found" *and*
  `http://localhost:3845/assets/*` starts returning HTTP 500 for everything.

The desktop app serves that MCP over plain streamable HTTP on
`http://127.0.0.1:3845/mcp`, so `scripts/figma-mcp.mjs` talks to it directly —
useful when the editor's own MCP client is disconnected but the app is running:

```bash
node scripts/figma-mcp.mjs --tools
node scripts/figma-mcp.mjs get_design_context \
  '{"nodeId":"1:2394","excludeScreenshot":true}' out.jsx
```

Writing to a file keeps the large responses out of the conversation; parse them
locally.

## Three skins on one content model

The app ships three visual languages over the same data, switchable bottom-right
(or by URL), so a pitch can walk the same content through all of them:

- `?v=baseline` — the page as it is today, the faithful Figma rebuild above.
- `?v=2027` — the 2027 visual direction, in `src/v2027/`.
- `?v=ai` (default) — 2027 · AI, in `src/v3ai/`: the same palette and content,
  restructured around natural-language search.
- `?theme=light` — the 2027 skin's light theme (also on the header toggle).
- `?feed=off` — turns off colour feeding, if the wash is not wanted in the room.

Section inventory and content are unchanged between the two. The information
architecture is deliberately **not** reworked here: this is a visual-language
pass, so the same rows appear in a rhythm suited to the new density. The one
addition is "Momente nedifuzate la TV", built from the catalogue's genuine
companion content — interviews, travel diaries, "Extra", "Making Of" — matched
by title in `catalog.ts` rather than resliced from another rail, so it does not
repeat Trending's cards.

## 2027 · AI — the third skin

Keeps the brand palette of the other two and takes its structure from the
additional Figma mockups in the same file:

| From | What it contributes | Where |
| --- | --- | --- |
| `10:74`, `10:2`, `10:246` | Left icon rail instead of a top nav, which frees the whole top edge for search. It widens on hover to show labels, so it costs no width at rest and is not a guessing game either. The active item is marked in brand red, as in `10:2`. | `LeftRail` |
| `12:1531` | Floating header pill — inset from the edges, `rgba(0,0,0,0.5)` over a 25px blur, 24px radius — rather than a bar welded to the top. | `TopBar` |
| `10:246` | Two-tone condensed display title. Driven by AntenaPLAY's own naming convention: everything after the `\|` separator takes the accent, so "Asia Express \| **Drumul Mătăsii**" splits itself. | `Hero3` |
| `12:1530` | Score pills with inline fills, relabelled Public / Critici, and the pill action row. | `Hero3` |
| `12:1530`, `12:1866` | The search surface — see below. | `HeaderBar`, `SearchPanel` |

The rows use the card anatomy the second skin settled on — 232px on a 2:3 crop,
no borders, lift and shadow doing the separating, hover actions sliding up from
the card's bottom edge, a fixed-height caption so metadata sits on one baseline,
and scroll-linked reveal. Only what this layout requires differs: the track is
inset past the left rail and the pagers are placed against that inset rather
than the page edge. Both skins read the same derived content model from
`v2027/catalog.ts` — titles, badges, metadata, resume positions — so a change
there lands in both, while the visual layers stay independent.

**One colour is added.** Everything the assistant touches is violet `#a06bff`;
everything the viewer commands directly stays Antena red. Two capabilities, two
signals, rather than one red doing both jobs. Node `12:1866` uses cyan for this,
but on Antena's ground a cool blue reads as a foreign system — violet sits next
to the brand red as the same family, and the focused search field draws its ring
as a red→violet gradient so it belongs to both the platform and the feature.

**The header is one surface.** The bar and the search results share a single
rounded container, and opening the search grows that container rather than
dropping a card beneath it — so the thing you clicked is the thing that
expanded. The height animates on `grid-template-rows: 0fr → 1fr`, which tweens a
real height without measuring the content or hard-coding one; where a browser
cannot interpolate `fr`, both states still work and only the tween is lost.

**The hero plays.** AntenaPLAY's own trailer stream is behind their token gate,
so the hero autoplays the official upload from each show's own YouTube channel —
their publishing, their player, nothing worked around. Three slides have one
(`Asia Express | Drumul Mătăsii`, `Insula Iubirii | Sezonul 10`, `… | Spania |
Sezonul 10`); the rest keep the still rather than take a guessed id.

Four things about `HeroVideo` that are easy to get wrong and were:

- **`loop=1` needs `playlist=<id>`, and that makes it a playlist player**, which
  draws previous / pause / next buttons over the video. The loop is driven from
  the API instead: on ENDED, seek to 0 and play.
- **State does not arrive as `onStateChange`.** In practice the widget API
  reports it inside `infoDelivery.info.playerState`; read only the former and
  the frame never learns it is playing.
- **The frame is revealed only once the player says it is playing**, so the hero
  shows key art while the player boots — and if a browser refuses muted
  autoplay, the still simply stays rather than a paused player with an overlay.
- **It is scaled past the frame and takes no pointer events**, because the player
  letterboxes 16:9 inside a far wider box, and because neither YouTube's hover
  UI nor its click targets should ever be reachable.

One thing no parameter fixes: these are monetised uploads, so the embed can
serve a pre-roll — a live check of an earlier build opened with a car advert
behind the hero. Ambient autoplay with no such risk needs a file Antena hands
over; until then this is the trade.

### The hook: describe it, don't name it

The field in the header expands into a full-width panel — heading, example
phrases, live results with a one-line "vibe" descriptor each, and a total count.

It genuinely answers. `src/v3ai/search.ts` indexes the real catalogue (every
rail, every channel, every live event), derives tags from each title and from
the rail it sits in, and ranks a typed phrase against them. So "reality cu
cupluri" returns Mireasa and Insula Iubirii, "sport în direct" returns the F1
sessions and the national-team fixtures, and "canale gratuite" returns the free
channels. Three things it took a few passes to get right, all worth keeping in
mind if the vocabulary is extended:

- **Tag weights are inverse to frequency.** Without that, `reality` — which half
  the catalogue carries — counted as much as `turkish`, which two titles carry,
  and any broad phrase returned whatever sorted first.
- **Romanian inflects, so prefixes must match — but carefully.** An unguarded
  prefix rule had "cupluri" matching "cup" and pulling the whole World Cup shelf
  into a query about couples. Hence the length floors in `related()`.
- **Channels are down-weighted unless asked for**, or "film de acțiune" answers
  with the FilmBox channels, whose names contain the word.

It is a lexical matcher with a hand-built Romanian/English vocabulary, not a
language model — the honest shape for a prototype. The interaction, the latency
and the result surface are real; swapping in an embedding call later touches
that one file. The short thinking beat before results is deliberate: a result
set that lands on the same frame as the keystroke reads as a filter, and this is
meant to read as an assistant. `/` opens it from anywhere, Escape closes it.

### What changes in the 2027 skin, and why

| Change | Where |
| --- | --- |
| **Titles leave the artwork.** The old page burns names into key art, which is why ten typefaces fight on one screen. Titles and metadata now live in the UI layer, so one type system holds the grid. Top 10 is the deliberate exception: the Figma file ships a lockup for every card in that rail and uses it, because ranked promo art is a poster rather than a catalogue entry — so those cards carry the lockup and no caption. | `TitleCard` (`lockup`), `TopTen2027`, `Hero2027` |
| **One type hierarchy.** Red Hat Display finally behaves like a display face — hero up to `clamp(40px, 5.4vw, 88px)` — and metadata moves to mono, uppercase, open tracking, so it reads as data. Romanian typography drives three rules: the hero size steps down by title length (titles run to 46 characters) inside a copy block bounded below the header; leading never goes under `1.06` at display sizes, because `ă â î` carry marks above and `ș ț` below and a tighter line box shaves them; and headings use `text-wrap: balance` with the `\|` separator glued to the word before it, so a title never leaves one word stranded or starts a line on punctuation. | `tokens.css`, `Meta`, `Hero2027`, `title.ts` |
| **Four raised surfaces, not flat black**, with a cool tonal shift and 3.5% film grain. Pure `#000` is what dates the current page. | `tokens.css` (`--s0…--s3`, `grain`) |
| **Colour feeding.** The hovered card's dominant colour is sampled from its artwork and fed into a three-lobe wash behind the page. It crossfades over 900ms between two stacked layers — `background-image` is not an animatable property, so a transition on it snaps. The accent is resolved *before* anything changes (a cached sample resolves synchronously), the feed settles for 140ms so crossing a row is one transition rather than ten, and leaving a card does not revert the background. `?feed=off` disables it, as does `prefers-reduced-motion`. | `accent.ts`, `ColorFeed`, `mesh-layer` |
| **Red is an accent again** — CTA, LIVE, focus, resume progress. Nothing else. Top 10 no longer floods a whole section in brand red, and the franchise takeover is a defined band with hard edges and one even scrim rather than key art smeared into the page. | `Badge`, `TopTen2027`, `Takeover2027` |
| **One badge system**, four tokens (LIVE with a pulsing dot, NEW, FREE, SOON), one weight, one position. Only LIVE uses colour; the rest share a dark translucent base, because a badge lands on artwork nobody chose for it and a light surface disappears over a bright sky — the label carries the difference in meaning. | `Badge` |
| **Aspect ratio carries meaning** — but by what the frame stands for, not by genre. Every browsable row is 2:3, including the sport shelf and Continue watching, because the artwork is portrait and the row system is built around it. 16:9 is reserved for a schedule: "Live & Sport" and the channel tiles, where a frame stands for a moment in time rather than a title. So "Live & Sport" reads as a timetable while "AntenaPLAY Sport" reads as a shelf. | `catalog.ts` (`shape`) |
| **Channels show what is on air**, not a wall of logos — a logo only works for someone who already knows the brand, which is a dead shelf for a global audience. The logo drops to an overlay chip. | `ChannelTile` |
| **No tile borders.** Elevation and shadow separate cards; hover lifts the card, scales the art and slides the actions up. The rail's scroll container is padded (with the margin pulled back) so the lift and the shadow are not clipped — `overflow` clips at the padding box, so the room has to be padding, not margin. | `TitleCard`, `WideCard`, `Row` |
| **Rhythm and air.** Larger cards, `clamp(32px, 4.6vw, 96px)` gutters, fewer rows above the fold, rows bleeding off the right edge so a row reads as continuing rather than ending in a wall. Pagers float in on row hover instead of sitting there as permanent scrims. | `Row` |
| **Weight.** The page carries ~300 stills, so card artwork is `loading="lazy"` / `decoding="async"` and only the hero is eager — otherwise a shared link spends its first seconds fetching rows nobody has scrolled to. | `CardArt` |
| **Motion.** Scroll-linked row reveal, one shared spring curve, hero parallax, segmented hero progress instead of ten anonymous dots, resume bars on Continue watching. All of it collapses under `prefers-reduced-motion`. | `Row`, `Hero2027`, `tokens.css` |
| **Adaptive theme.** Light and dark. Artwork is dark whatever the theme is, so anything sitting on art pins the foreground tokens locally via `art-surface` while page chrome follows the theme — one set of components, two themes. The header is the same case: transparent over the hero it uses `art-surface`, and only follows the theme once it has lifted onto its own surface. `on-photo` raises the caption tokens another step for the takeover, whose key art is a daylight shot. | `tokens.css`, `Nav2027`, `Takeover2027` |
| **Graceful degradation.** A missing export gets a composed two-lobe wash in the title's own fed colour, not a grey rectangle with a logo. On some baseline rails half the row was holes. | `CardArt` |
| **Accessibility.** Visible focus ring on every interactive element (the same affordance the D-pad will need on TV), and metadata contrast raised to AA in both themes — the ratios are noted next to the tokens. | `tokens.css` |

Presentation metadata the old page never had — kind, badge, resume position,
now-playing line — is derived in `src/v2027/catalog.ts` from the real titles
where they say so ("Sezonul 10", "Formula 1") and is otherwise plausible mockup
copy. Titles, badges and artwork hashes all still come from the Figma content in
`src/data`.

## What is still open

- **Some source posters are genuinely placeholders.** The Figma file was
  captured from the live site mid-lazy-load, so a number of cards carry
  AntenaPLAY's own grey "a" tile instead of key art — 22 of the 24 cards in
  "Asia & America Express", for instance. The baseline renders that tile
  faithfully; the 2027 skin detects the hash and substitutes its designed wash.
- **Hero copy is truncated in the source**, ending in "…". That is what the site
  serves, so it is reproduced as-is.
- **Two Top-10 cards have no title** in the Figma file (the title lockup layer
  is empty). They render without a caption rather than with an invented name.
- **The Top-10 red wash in the baseline is sampled** from the Figma render
  rather than read from the file — the section fill did not come through the
  export. The 2027 skin does not use it at all.
- **Baseline Top-10 rank numerals** are drawn as outlines. They exist in the
  Figma file at the geometry used here but render invisible in its export, which
  is how the source page draws them (a text stroke the capture lost).
- The 2027 skin is a **web** visual language. The brief asks for the Smart TV
  home page, so if this goes in the deck it needs framing as "web as the system,
  TV as its application" — and the TV screen still needs its own pass: focus
  traversal, a 1280×720 baseline scaled to 4K, TV-safe area, and a per-row
  preview budget for 2018-2020 Tizen/webOS panels.

## Rights

This is a design proposal, not a product. The artwork under `src/assets/` is the
property of Antena TV Group and the respective rights holders of the titles it
depicts; it is included so the layout can be judged against real content, and
carries no licence from this repository. The prototype is not affiliated with or
endorsed by AntenaPLAY.
