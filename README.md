# World Cup motion kit

A starter kit for broadcast-grade, data-driven World Cup motion graphics.
The design taste lives in `CLAUDE.md` — Claude Code reads it automatically
every session, so everything it builds stays on-brand.

## What's here

- `demo.html` — open it in a browser right now. No install, no build.
  Watch the board re-rank itself between draw day and opening day.
- `CLAUDE.md` — the design system and motion language. This is the file
  that makes Claude Code's output look designed instead of generated.
- `data/snapshots.json` — the data layer. Game-by-game updates = append
  a snapshot. The animations are reactions to this file changing.
- `src/MarketBoard.jsx` — reference React + framer-motion component
  implementing the same motion language for your Vite app.

## Get going with Claude Code

```bash
npm create vite@latest worldcup-board -- --template react
cd worldcup-board
npm install framer-motion
# drop CLAUDE.md, data/, and src/MarketBoard.jsx into the project
claude
```

First prompts to try:

1. "Wire MarketBoard into App.jsx with the styles implied by CLAUDE.md,
   run the dev server, and verify the re-rank animation."
2. "Add a Golden Boot board using the same motion language."
3. "Write scripts/update-odds.mjs that appends a new snapshot to
   data/snapshots.json from values I paste in, validating the schema."
4. "After matchday 1 ends, here are the new odds: [...] — append the
   snapshot and add an 'After matchday 1' stop to the scrubber."

Prompt #4 is the whole loop: during the tournament you just hand Claude Code
new numbers, and the board animates the repricing automatically.
