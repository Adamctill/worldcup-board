# The inch-by-inch guide: from kit to automated daily videos

Every task below is about one minute of YOUR active time. Some tasks kick off
work that runs longer (installs, Claude Code building) — those are marked
[wait], meaning you start it, then go do something else. Do one phase per
sitting, or one task per study break. Check them off as you go.

Where you'll be working: Terminal (Mac: Cmd+Space, type "Terminal", Enter).

---

## Phase 0 — Install Claude Code (7 tasks, do tonight)

- [ ] 0.1  Open Terminal.
- [ ] 0.2  Check Node is installed: run `node -v`. Any v18+ number = good.
           (No number? Install from nodejs.org first — that's the one [wait] here.)
- [ ] 0.3  Run: `npm install -g @anthropic-ai/claude-code`  [wait ~1 min]
- [ ] 0.4  Run: `claude --version` — seeing a version number = installed.
- [ ] 0.5  Run: `claude` from any folder. It will walk you through login.
- [ ] 0.6  Choose "log in with Claude account" and finish in the browser.
- [ ] 0.7  Type a hello to confirm it responds, then type `/exit`.

Milestone: Claude Code lives on your machine.

---

## Phase 1 — Create the project (8 tasks)

- [ ] 1.1  In Terminal: `cd ~/Documents` (or wherever you keep projects).
- [ ] 1.2  Run: `npm create vite@latest worldcup-board -- --template react`
           (accept defaults).
- [ ] 1.3  Run: `cd worldcup-board && npm install`  [wait ~1 min]
- [ ] 1.4  In Finder, open the worldcup-board folder side by side with the
           downloaded worldcup-motion-kit folder.
- [ ] 1.5  Copy CLAUDE.md from the kit into the project root.
- [ ] 1.6  Copy template.html into the project root.
- [ ] 1.7  Copy the kit's data/ folder into the project root.
- [ ] 1.8  Copy the kit's src/MarketBoard.jsx into the project's src/ folder
           (alongside Vite's files — overwriting nothing).

Milestone: a real project containing the design system.

---

## Phase 2 — Put it on GitHub (7 tasks)

- [ ] 2.1  Create a free account at github.com if you don't have one.
- [ ] 2.2  On github.com: New repository → name it worldcup-board → Private →
           Create. Keep this page open.
- [ ] 2.3  In Terminal (inside the project folder): `git init && git add -A`
- [ ] 2.4  Run: `git commit -m "kit + scaffold"`
           (If git asks who you are, run the two `git config` lines it suggests,
            then re-run the commit — that's your one extra minute.)
- [ ] 2.5  Copy the two "push an existing repository" lines from the GitHub
           page and paste them into Terminal.
- [ ] 2.6  It may ask you to authenticate in the browser — approve it.
- [ ] 2.7  Refresh the GitHub page. Seeing your files = done.

Milestone: the project has a home that automation can run from.

---

## Phase 3 — Get the odds feed (5 tasks)

- [ ] 3.1  Go to the-odds-api.com → Get API key (free tier).
- [ ] 3.2  Confirm the email, copy the key somewhere safe (Notes is fine).
- [ ] 3.3  On your GitHub repo page: Settings → Secrets and variables →
           Actions → New repository secret.
- [ ] 3.4  Name: ODDS_API_KEY  ·  Value: paste the key → Add secret.
- [ ] 3.5  In Terminal: `echo 'ODDS_API_KEY=paste-key-here' > .env` and
           `echo '.env' >> .gitignore` — so the script also works locally,
           and the key never gets committed.

Milestone: a live data source, stored the safe way.

---

## Phase 4 — The pipeline session (9 tasks — your first real build)

- [ ] 4.1  In Terminal, inside the project: `claude`
- [ ] 4.2  Paste this prompt:

      Build the daily odds pipeline. 1) Write scripts/update-odds.mjs: fetch
      FIFA World Cup outright winner odds from The Odds API (key from env var
      ODDS_API_KEY, also load .env locally), convert American odds to implied
      probability with one decimal, normalize out the vig, take the top 10
      teams, and append a dated state (event label like "Jun 12") to
      data/snapshots.json — validate the schema, never mutate existing states.
      2) Modify template.html so that when served over http it fetches
      data/snapshots.json for its states, falling back to embedded defaults
      when opened as a local file. 3) Add .github/workflows/daily-odds.yml
      that runs the script daily at 9am ET and commits the JSON. 4) Set up
      GitHub Pages deployment so the board is live at a URL. Follow CLAUDE.md.

- [ ] 4.3  [wait] Let it build. Answer questions when it asks (each answer
           is your one minute; "yes" is usually right).
- [ ] 4.4  When it finishes, tell it: "Run the update script once now and
           show me the new state it appended."
- [ ] 4.5  Sanity-check the numbers it shows against ESPN's odds page.
           Spain and France should be up top.
- [ ] 4.6  Tell it: "Commit and push everything."
- [ ] 4.7  On GitHub → Actions tab: confirm the workflow exists. Run it once
           manually (Run workflow button) to prove it works end to end. [wait]
- [ ] 4.8  Open your GitHub Pages URL (Claude Code will have told you;
           it's also in repo Settings → Pages). The board should be live.
- [ ] 4.9  Tell Claude Code: "Update CLAUDE.md with the conventions we just
           established." Then `/exit`.

Milestone: THE BIG ONE. The board now updates itself every morning, forever.

---

## Phase 5 — The daily routine (3 tasks, repeats each morning, ~3 min total)

- [ ] 5.1  Open your Pages URL. Today's state is already on the scrubber.
- [ ] 5.2  Pick theme colors for today's mood, press Pause → Next state to
           cue it up.
- [ ] 5.3  Screen-record the reprice moment on your phone or with
           QuickTime, post it.

Milestone: daily content with zero data work. Run this routine for a few
days BEFORE building Phase 6 — knowing what you wish the recording looked
like is exactly the spec you'll hand Remotion.

---

## Phase 6 — Remotion: rendered video instead of screen recording (6 tasks)

- [ ] 6.1  In the project: `claude`
- [ ] 6.2  Paste:

      Add Remotion to this repo. Create a 1080x1920 30fps composition porting
      the market board's design and motion language from template.html and
      CLAUDE.md: entrance choreography, then animate through the LAST TWO
      states in data/snapshots.json with riser/faller movement, ~3s hold per
      state, ~12s total. Use Remotion's spring() and interpolate(), not CSS
      transitions. Add an npm script "render:daily" that outputs
      out/market-update.mp4.

- [ ] 6.3  [wait] Let it build, answer its questions.
- [ ] 6.4  Run: `npm run render:daily`  [wait — first render takes a few min]
- [ ] 6.5  Watch out/market-update.mp4. Give Claude Code ONE note per minute
           you have ("hold the final state longer", "bars enter faster") —
           iterate until it feels right.
- [ ] 6.6  "Update CLAUDE.md, commit and push." `/exit`

Milestone: pixel-perfect video without recording anything.

---

## Phase 7 — Full auto (3 tasks)

- [ ] 7.1  In `claude`, paste: "Extend the daily GitHub Action: after
           updating odds, render the Remotion video and upload
           market-update.mp4 as a workflow artifact."
- [ ] 7.2  [wait] Next morning, open GitHub → Actions → today's run →
           download the MP4.
- [ ] 7.3  Post it. That's the whole job now.

Final state: wake up, download today's finished video, post. The market does
the storytelling, the pipeline does the work.

---

## When something breaks (it will, once or twice)

Paste the exact error into Claude Code and say "fix this." That's the move,
every time. If a session goes sideways, `/exit`, run `claude` fresh, and
describe where things stand — CLAUDE.md plus the repo IS the memory.
