# AntenaPLAY 2027 — Concept Review
**Speaker script · 10 slides · ~12 minutes**

Each slide has three parts: what the audience is looking at, what you say out loud, and facts to hold in reserve for questions. The *Say* blocks are written to be spoken, not read silently — you can deliver them close to verbatim.

---

## Slide 1 · What we're looking at

**On screen:** Live homepage on the left, concept on the right.

**Say:**
"Today I'm comparing two things: the AntenaPLAY homepage as it is live right now, and a redesign concept for the same page on desktop.

One thing about the prototype before we start. It has a switch in the bottom right corner with three positions — NOW, 2027, and 2027 AI. NOW is a faithful copy of what we have today, so we can compare in a single window. 2027 is the visual redesign on its own. 2027 AI adds the smart search and a different row order on top.

That split isn't decoration — it's the most useful decision in the whole prototype. It means the redesign and the AI features are two separate decisions. We can approve the redesign today and start building it, and take the AI layer through a longer conversation, without one holding up the other."

**If asked:** The prototype opens in 2027 AI by default. That matters later — see slide 7.

---

## Slide 2 · What's wrong with the homepage we have

**On screen:** Current homepage, full height, with the problem areas marked.

**Say:**
"Let me start with the diagnosis, because every change downstream answers something here.

First, the top menu. The logo sits in the middle and splits the navigation into two halves — four items to the left, two to the right. There's no single path for the eye. You scan left, hit the logo, and have to start again on the other side.

Second, the cover art. I measured the aspect ratios row by row: they run from perfectly square to almost five-to-one. Every row makes the eye re-calibrate, so the page reads as a stack of unrelated widgets rather than one catalogue.

Third — and this is the one that costs us the most quietly — the titles are painted into the images. The name of the show is part of the JPEG. That means it can't be translated, it can't be found by search, a screen reader can't announce it, and it breaks apart at small sizes.

Fourth, the order. The page opens with TV channels. Top 10 is the seventh row down. And there is no 'continue watching' row anywhere — a subscriber who stopped a series halfway has no way back into it from the homepage.

And finally, the first impression itself. On a cold visit, the consent banner covers the lower half of the hero, and there's a sticky subscription bar pinned to the bottom of every screen. The hero we paid to produce is partly hidden at the exact moment it matters most."

**If asked:** Measured ratios — 1.00 for channels, then 1.18, 1.57, 1.58, 1.78, 2.00 and 4.88 across the content rows. Card width today is about 150 pixels.

---

## Slide 3 · Navigation — one bar doing two different jobs

**On screen:** Before / after of the header, with the rail highlighted.

**Say:**
"The concept splits the navigation into two, according to what each thing actually is.

On the left there's now a permanent vertical rail of icons: home, search, live, sport, my list, my account. Think of that as *where I am and what's mine* — it doesn't change with the content.

Across the top we keep the catalogue: shows, series, films, and a new one — genres. Genre browsing gets a front door for the first time; right now there's no way into the catalogue by genre from the homepage at all.

Login changes from a text link to a filled red button, because for a visitor who isn't signed in, that's the single most valuable thing they can do on the page.

There's a side effect worth pointing out, because it's easy to miss. Once the menu moves to the side, the hero starts at the very top edge of the screen. Today a solid dark bar cuts about fifty pixels off the top of the artwork on every single page load."

**If asked:** Rail items in the AI variant are home, search, live, sport, my list, account. In the 2027 variant the rail carries the catalogue instead — that inconsistency is worth resolving.

---

## Slide 4 · Cards — one grid, and clean artwork

**On screen:** Row of old cards above, row of new cards below.

**Say:**
"Two changes here, and they're worth defending separately because one is obvious and one isn't.

The obvious one: every card is now the same vertical poster, two by three, at 232 by 422 pixels. One shape, one height, one rhythm. The eye scans straight down the page instead of resetting at every row. The cards are also about fifty percent wider than today, which means fewer items per screen — but more artwork, and a much bigger target for the cursor.

The change that isn't obvious is the one I'd actually lead with. The title has moved out of the picture and into the interface. The poster is now just a picture, and the name of the show is text underneath it, along with a metadata line — season, genre, year.

Here's why that's the bigger win. Text inside an image is frozen. You can't translate it, you can't index it for search, a screen reader can't read it, and it fights with the photograph for attention. The moment the title becomes real text, one piece of artwork works everywhere — every language, every screen size, every device, and search can find it.

Now the honest part. This doubles what we need from production. We don't just need vertical artwork, we need *clean* vertical artwork, for the entire catalogue. The fact that today's ratios are all over the place tells us the pipeline currently delivers finished banners, not clean key art. So we should design the transition state now — a gradient at the bottom of the old image with the title set in text over it — otherwise the launch date will be decided by the artwork queue, not by us."

**If asked:** The designer's own framing: "titles moved out of the posters into the interface." He lists it as a UI change; the localisation and accessibility value is the part worth adding to his argument.

---

## Slide 5 · Hero — from a poster to a shop window

**On screen:** The new hero, ideally live with the video playing.

**Say:**
"The hero today tells you one thing: this exists. There's a title, a description that gets cut off mid-sentence, and a play button. You decide blind.

The new hero answers the questions people actually have before they commit. There's an age rating, the year, and whether the full season is available. There are two scores — audience and critics. There's a trailer button, so you can check a title without leaving the page, and a plus button, so you can save it for later instead of losing it.

The video also plays automatically. That's a real shift in what the hero is: the viewer is already watching something rather than deciding whether to start.

One small detail I like: the carousel indicator is now a segmented bar instead of dots. Dots tell you nothing. The bar tells you how many slides there are and how much time you have before it moves on — which takes away that irritation of the carousel sliding out from under your hand.

Two things to be clear-eyed about. Autoplaying video in the hero is the most expensive element on the page — it starts streaming before the user has chosen anything, and it lands on our load metrics and on mobile data. So we need explicit rules: pause when it scrolls out of view, no autoplay on data saver or reduced motion, and a still frame as the fallback.

And second, in the prototype the trailer only plays in the AI variant — even though it has nothing to do with AI. That should move into the base redesign, or a good feature ends up hostage to a much bigger decision."

**If asked:** Hero height is 600–860px depending on viewport. Scores shown in the mock are 72% audience, 61% critics.

---

## Slide 6 · Search — the main product bet

**On screen:** The expanded search panel with suggested phrases.

**Say:**
"This is the biggest idea in the concept, and it deserves the most scrutiny.

Search today answers one question: *I know the title, where is it.* That's a real need and it isn't going away. But there's a second need that's far more common on any streaming service, and right now we serve it with nothing at all — *I don't know what I want, give me something for tonight.* The only tool we offer that person is scrolling through fifteen rows.

The concept turns search into a sentence. You type something like 'something short and funny' or 'reality with couples', and it finds titles by description rather than by name.

Two UI decisions inside that. The field sits in the header and expands into a panel rather than taking you to a separate page — so the homepage stays underneath and you can close the search and carry on browsing. And there are suggested phrases on display. Those aren't decoration. Nobody will guess that they're allowed to type a whole sentence into a search box until they see an example of one.

Now, what's missing. In the prototype the search is a mock — you can type, but nothing comes back. The results screen doesn't exist yet, and that screen is the entire feature. How is the result set laid out, how is it grouped, do we explain *why* something matched, what happens when nothing matches, and what does the waiting state look like — because semantic search doesn't answer instantly, and that second has to be designed.

There's also a question we need to answer before any of that: do a phrase and an exact title live in the same field, or in two modes? Most searches will still be someone typing a show name. The current placeholder only invites the second behaviour."

**If asked:** The five suggested phrases in the mock are in Romanian — "something short and funny", "reality with couples", "live sport", "Turkish drama", "adventure on the road".

---

## Slide 7 · Row order — giving the front page back to the editors

**On screen:** Three columns showing row order in NOW / 2027 / 2027 AI.

**Say:**
"The rows have been re-ordered on a stated principle: first what we're recommending, then trending and Top 10.

I want to spend a moment on why that's the right instinct, because it's easy to wave through. Trending and Top 10 are a mirror. They show what people are already watching. If the homepage opens with them, we're amplifying our own history, and over time the catalogue narrows to the same dozen titles. More importantly, we give away the front page — the editorial team loses its only real lever to push something new. Putting recommendations first puts that lever back in their hands, and leaves the rankings where they belong: as confirmation of a choice, not as the choice itself.

The first row is 'continue watching', with a progress bar and the minutes remaining. That's the most direct retention lever on the page — someone who stopped an episode sixteen minutes from the end gets back into it in one click.

Now the thing I'd rather we say ourselves than hear from the room. That principle holds in the 2027 variant. In 2027 AI — the one that opens by default when you follow the link — the recommendation rows are gone entirely, and trending and Top 10 land second and third. So the version we're demonstrating is the one where the stated logic doesn't apply. We either fix the order there, or we demo the 2027 variant.

Related, and this one is a business decision rather than a design one: the rows that disappear in the AI variant are exactly the linear TV rows — channels, free channels, live and sport. For a broadcaster whose real differentiator is live television, that can't be left to an algorithm. We need a rule: the live row always holds a position in the top three."

**If asked:** Row counts — 15 today, 16 in the 2027 variant, 12 in 2027 AI.

---

## Slide 8 · Colour — red means action

**On screen:** Palette comparison, with red usage marked on both versions.

**Say:**
"Right now our red is everywhere — it's in the background glow, in the row markers, on badges, and on buttons. When a colour is used for everything, it stops meaning anything, and the eye stops noticing it.

In the concept, red is reserved for things you can press. Play. Log in. That's it. The background goes to a deeper, more neutral dark, which also lets the poster artwork keep its own colours instead of sitting under a red haze.

The result is that you find the play button without reading anything.

I did audit this against the prototype, and I'd rather report it accurately: red also appears on the NEW badge, on the active carousel segment, and on the progress bars in 'continue watching'. Those last three aren't actions. They're sensible exceptions and every competitor does the same — but they need to be written into the guideline explicitly. Something like: red equals an action, or the user's own progress. If we don't write it down, promo banners will be red again within two sprints."

**If asked:** Brand red in the prototype is #EA1D25; the background is #08080B.

---

## Slide 9 · What isn't designed yet

**On screen:** Plain list.

**Say:**
"To be useful, let me be explicit about the gaps. None of these are criticisms of the concept — they're the work that's left.

The search results screen. That's the top of the list, and without it we can't estimate the feature or judge whether it works.

Cold start — what a brand new user sees, when 'continue watching' is empty and we know nothing about them. The whole first screen is currently built on data that person doesn't have.

Where the audience and critic scores come from. Our own votes, an external source, an aggregator? For Romanian reality shows there may be no external rating at all, so we need a version of the card without that line.

A guaranteed position for live TV, as I mentioned.

A path to subscribe. This one is easy to miss: the concept removed the sticky bar at the bottom, and with it the only place an anonymous visitor could see pricing. Right now they can log in, and that's all. We need that CTA back in some form.

The legal links in the footer. The footer went from around twenty links to six, and several of the ones that were removed are legally required in Romania — ANPC, SAL and SOL, CNA, the cookie settings. Those aren't an aesthetic choice.

And finally, mobile, TV, and the consent banner. The prototype is desktop only. A left rail and 232-pixel posters need their own answers on a phone and on a remote control. And the consent banner should be in the mock, because on a real first visit it *is* the first impression."

---

## Slide 10 · What I'm asking for

**On screen:** Three numbered items.

**Say:**
"Three things.

One. Approve the redesign layer now. Navigation, the card grid, the hero, the colour rules — none of it depends on AI, and it can start immediately.

Two. Scope the artwork pipeline before we commit to any launch date. Clean vertical key art for the full catalogue is the critical path, and it's the thing most likely to slip.

Three. Fund one more design round, with a specific scope: the search results screen, the cold start state, and mobile. That's what turns this from a strong concept into something we can build."

---

## If they only remember three things

- **The redesign and the AI layer are separable.** Don't let one block the other.
- **Moving titles out of the artwork** is the quiet change with the largest downstream value — localisation, search, accessibility, and one asset that works everywhere.
- **Search is the bet**, and the screen that decides whether it works doesn't exist yet.

---

## Likely questions

**"Why vertical posters? Netflix uses landscape."**
Both work. What doesn't work is seven different shapes on one page. Vertical also fits more items across a screen at a readable size, and it's the format that pairs best with a title set in text below the card.

**"Can't we keep the titles in the artwork?"**
We can, but then every title needs a new image for every language, the poster can't be reused across sizes, and search and screen readers can't see the name. The cost shows up every time, not once.

**"How much of this depends on the AI search working well?"**
Very little. Everything in slides 3, 4, 5 and 8 is independent. That's the reason the prototype has the three-way switch.

**"What if we ship only the redesign?"**
That's a legitimate outcome and the concept is built to allow it. We'd still fix navigation, the grid, the hero and the colour system — and keep the current search.
