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

## Two skins on one content model

The app ships both visual languages over the same data, switchable bottom-right
(or by URL) so a pitch can show before/after on identical content:

- `?v=baseline` — the page as it is today, the faithful Figma rebuild above.
- `?v=2027` (default) — the 2027 visual direction, in `src/v2027/`.
- `?theme=light` — the 2027 skin's light theme (also on the header toggle).
- `?feed=off` — turns off colour feeding, if the wash is not wanted in the room.

Section inventory and content are unchanged between the two. The information
architecture is deliberately **not** reworked here: this is a visual-language
pass, so the same rows appear in a rhythm suited to the new density. The one
addition is "Momente nedifuzate la TV", built from the catalogue's genuine
companion content — interviews, travel diaries, "Extra", "Making Of" — matched
by title in `catalog.ts` rather than resliced from another rail, so it does not
repeat Trending's cards.

### What changes in the 2027 skin, and why

| Change | Where |
| --- | --- |
| **Titles leave the artwork.** The old page burns names into key art, which is why ten typefaces fight on one screen. Titles and metadata now live in the UI layer, so one type system holds the grid. | `TitleCard`, `WideCard`, `Hero2027` |
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
