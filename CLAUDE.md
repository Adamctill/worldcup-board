# World Cup Market Board — design system & conventions

You are building broadcast-grade motion graphics for live World Cup market data
(title odds, Golden Boot, group volatility). The bar is "premium trading terminal
meets editorial sports desk." Everything below is non-negotiable unless the user
overrides it explicitly.

## Stack

- React 18 + Vite
- framer-motion (Motion) for all animation — no CSS keyframe hacks for core motion
- Plain CSS modules or a single styles.css; no Tailwind, no UI kits
- Data is never hardcoded in components. Components render `data/snapshots.json`.

## Brand tokens

Palette (dark, warm, minimal, premium):

- `--ink`        #14110D   page background (warm near-black)
- `--surface`    #1C1814   cards, tracks
- `--line`       #2A241D   hairline borders
- `--text`       #EDE4D6   primary text (warm off-white)
- `--muted`      #8F8270   secondary text, rank numbers
- `--gold`       #E2A33C   the accent. Bars, active states, live indicator
- `--gold-deep`  #9C6F22   gold's darker stop, for fills meeting the track
- `--steam`      #5BBE8A   probability rising (market buying)
- `--fade`       #D86A4A   probability falling (market fading)

Rules: gold is the only decorative color. Steam/fade appear ONLY on delta
chips and movement lines — never on bars, never on text blocks. If a screen
has more than three colors doing work, remove one.

## Typography

- Display: "Fraunces" (Google Fonts), 500–600 weight, tight tracking. Headlines only.
- UI & labels: "Space Grotesk", 400/500. Eyebrows are 11–12px, letter-spacing 0.14em, uppercase.
- Numbers: Space Grotesk with `font-variant-numeric: tabular-nums` ALWAYS.
  Animated numbers in non-tabular figures jitter horizontally — this is a bug, not a style.

## Motion language

The animation system is data-driven: components animate because the data changed,
never because a timer fired. One choreographed moment beats scattered effects.

Springs (framer-motion `transition` values):

- Row reordering (`layout` prop): `{ type: "spring", stiffness: 130, damping: 22 }`
- Bar widths: `{ type: "spring", stiffness: 85, damping: 20 }`
- Chips/labels entering: `{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }`

Choreography — when a new snapshot loads, this exact order:

1. Rows re-rank. ONLY rows whose position changed may animate — risers climb
   from their current slot, fallers sink, unchanged rows hold perfectly still.
   No top-down cascade and no stagger on repricing; stagger belongs to the
   one-time entrance animation only. (FLIP: capture old positions, reorder DOM,
   animate only rows with a nonzero delta.)
2. Bars spring to new widths — but only bars whose value changed.
3. Numbers count up/down over 600ms, ease-out, tabular figures — changed values only.
4. Delta chips (+5.6 / −2.9) fade-and-rise in last, after bars settle (~450ms).

Restraint rules:

- Maximum one infinite animation on screen: the 2s "live" indicator pulse. Nothing else loops.
- Animate only `transform` and `opacity` (and bar `width` via Motion). Never animate
  layout properties with CSS transitions.
- Every animation wrapped in / gated by `prefers-reduced-motion` — reduced motion
  swaps springs for instant state changes, it never removes information.
- No glows, no gradients anywhere, no drop shadows. Bar fills are flat gold.
- If an animation doesn't encode a data change, delete it.

## Cleanliness rules (learned from v1 → v2)

- Whitespace structures the page, not lines. No hairline borders between rows;
  use 15px+ vertical row padding instead.
- No rank-number column. Position in the list IS the rank.
- Bars are 2px, flat gold, no end caps or dots. The bar is a quiet measure,
  not an illustration.
- Controls are text, not chrome: the scrubber is plain text tabs with a 1px
  gold underline on the active tab. No pills, no filled buttons.
- One container, max-width ~600px, generous page padding (96px top on desktop).
- Every element must justify itself: if removing it loses no information,
  remove it.

## Data conventions

- The primitive is implied probability (0–100, one decimal). American odds are a
  display format derived at render time, never stored as the source of truth.
- `data/snapshots.json` is a **bare JSON array** of snapshot objects — not the full
  board config. Shape: `[{ "event": "Jun 12", "items": [{ "name": "Spain", "value": 15.0 }, …] }, …]`.
  The board config (eyebrow, headline, theme) lives only in `template.html`.
- Game-by-game updates = append a snapshot, never mutate history. The timeline
  scrubber derives entirely from this array.
- Every snapshot carries `event` — copy shown to the user. Format: `"Jun 12"` (month
  abbrev + numeric day, no year, no time). e.g. `"Jun 12"`, `"After matchday 1"`.
- When adding a fetch/update script, write it to `scripts/update-odds.mjs`, have it
  validate against the schema, append a snapshot, and exit nonzero on schema drift.

## Odds pipeline (`scripts/update-odds.mjs`)

- Source: The Odds API, sport key `soccer_fifa_world_cup_winner`, market `outrights`,
  region `us`, format `american`. Endpoint:
  `GET /v4/sports/{sport}/odds/?apiKey=…&regions=us&markets=outrights&oddsFormat=american`
- Conversion pipeline (in order):
  1. American → raw implied prob: positive price → `100/(price+100)`;
     negative → `|price|/(|price|+100)`
  2. Average raw probs across all bookmakers per team (reduces line-shopping noise)
  3. Normalize: divide each average by the sum of all averages × 100 (removes the vig)
  4. Round to one decimal; sort descending; take top 10
- API key comes from env var `ODDS_API_KEY`. Script loads `.env` from repo root for
  local runs (skipping keys already in the environment). In CI the key is a GitHub
  Actions secret.
- Script exits 0 with a message (no append) when the API returns no events — odds
  may not be listed between tournaments.

## Live board (`template.html`)

- When served over HTTP, `template.html` fetches `./data/snapshots.json` on boot and
  replaces the embedded default states with the live array. Falls back silently to
  embedded defaults when opened as a local `file://` URL.
- Guard pattern: `if (location.protocol !== 'file:') { fetch('./data/snapshots.json') … }`
- User theme and label customizations (stored in localStorage) survive the fetch —
  only the `states` array is overwritten.
- Deployed at: `https://adamctill.github.io/worldcup-board/`

## CI / GitHub Actions

- `daily-odds.yml` — runs at 13:00 UTC daily (= 9 am EDT during the World Cup window).
  Commits `data/snapshots.json` only when odds changed. Uses `workflow_dispatch` for
  manual runs.
- `deploy-pages.yml` — deploys `template.html` (as `index.html`) + `data/snapshots.json`
  to GitHub Pages whenever either file changes on `main`. GitHub Pages source must be
  set to "GitHub Actions" in repo settings.

## Quality bar (check before finishing any task)

- Responsive to 360px. Rows compress gracefully; numbers never wrap.
- Keyboard: scrubber is focusable, arrow keys move between snapshots, visible focus ring (gold, 2px).
- `prefers-reduced-motion` verified.
- No layout shift on font load (`font-display: swap` + size-adjusted fallback or preload).
- Numbers rounded at display time: probabilities to 1 decimal, deltas signed with 1 decimal.
- Run the dev server and visually verify any animation change before declaring done.

## Copy voice

Plain, specific, lowercase confidence. "After matchday 1", "market buying France",
"since the draw". Never exclamation marks, never "🔥", never hype adjectives.
The data is the drama.

## Feed mode (reels / TikTok / Shorts)

A second visual register for social. Web mode and feed mode share the motion
language and choreography order; they differ in intensity. Never mix registers
in one screen.

Feed tokens:

- `--ink`      #0B0908   deeper black so saturated hues hit harder
- `--gold`     #FFB72B   electric gold, with `--gold-hot` #FFD166 at the bar tip
- `--steam`    #34F5A2   probability rising
- `--fade`     #FF4D3D   probability falling

Feed rules:

- Stage is 9:16, designed to be screen-recorded. Safe margins ≥30px so
  platform UI never covers data.
- Bars are 12px, rounded, gold gradient, glow via layered box-shadow
  (tight 16px + wide 38px, both gold at low alpha). Glow is allowed ONLY in
  feed mode and ONLY on gold and direction colors. Track is gold at 7% alpha,
  not gray — keeps the palette to one hue family plus directions.
- Still three hues max. Vibrancy = intensity, not variety.
- The hook lands inside 800ms: eyebrow → headline → bars sweep in, staggered.
  A feed viewer decides in about a second; nothing static may occupy that second.
- The leader's bar carries a slow 2s brightness "breathe" — the one ambient
  loop, marking who's on top.
- Numbers flash steam/fade (with matching text glow) while counting, then
  settle back to neutral. Direction is a moment, not a permanent state.
- Choreography may auto-loop between snapshots (~4s per state) for recording.
  Web mode never auto-loops.
- Type is bigger: 34px Fraunces headline, 19px bold tabular numbers.
- All motion still respects prefers-reduced-motion.

Psychology notes (why these choices): saturated color on near-black reads as
self-luminous (Helmholtz–Kohlrausch) — the "glow" perception costs nothing in
legibility; gold = stakes/money/winning, which is the literal subject;
green-up/red-down is pre-trained by finance UIs so direction parses with zero
reading; the rank-shuffle moment is the retention hook — schedule it ~2.5s in,
after the viewer has registered the initial order.
