import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env for local runs (skip keys already set by the environment)
const envPath = resolve(ROOT, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k && !(k in process.env)) process.env[k] = v;
  }
}

const API_KEY = process.env.ODDS_API_KEY;
if (!API_KEY) {
  console.error('Error: ODDS_API_KEY is not set');
  process.exit(1);
}

// ── Fetch ────────────────────────────────────────────────────────────────────

const SPORT = 'soccer_fifa_world_cup_winner';
const url =
  `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/` +
  `?apiKey=${API_KEY}&regions=us&markets=outrights&oddsFormat=american`;

console.log(`Fetching ${SPORT} odds…`);
const res = await fetch(url);
if (!res.ok) {
  const body = await res.text().catch(() => '');
  console.error(`API error ${res.status}: ${body}`);
  process.exit(1);
}

const events = await res.json();
if (!Array.isArray(events) || !events.length) {
  console.log('No events returned — odds not yet available. Skipping update.');
  process.exit(0);
}

// ── Aggregate implied probabilities ──────────────────────────────────────────

const totals = {};
const counts = {};

for (const ev of events) {
  for (const bk of (ev.bookmakers ?? [])) {
    const mkt = bk.markets?.find(m => m.key === 'outrights');
    if (!mkt) continue;
    for (const { name, price } of (mkt.outcomes ?? [])) {
      // American odds → raw implied probability (includes vig)
      const raw =
        price > 0
          ? 100 / (price + 100)
          : Math.abs(price) / (Math.abs(price) + 100);
      totals[name] = (totals[name] ?? 0) + raw;
      counts[name] = (counts[name] ?? 0) + 1;
    }
  }
}

if (!Object.keys(totals).length) {
  console.log('No outright outcomes found in response. Skipping update.');
  process.exit(0);
}

// Average across bookmakers, then normalize to remove the vig
const raw = Object.entries(totals).map(([name, sum]) => ({
  name,
  prob: sum / counts[name],
}));
const vigSum = raw.reduce((s, t) => s + t.prob, 0);

const items = raw
  .map(t => ({
    name: t.name,
    value: Math.round((t.prob / vigSum) * 1000) / 10, // one decimal, sums to ~100
  }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 10);

// ── Build new snapshot ────────────────────────────────────────────────────────

const now = new Date();
const label = now.toLocaleString('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'America/New_York',
});

// ── Schema validation ─────────────────────────────────────────────────────────

function validateStates(arr) {
  if (!Array.isArray(arr)) throw new Error('snapshots.json must be an array');
  for (const [i, s] of arr.entries()) {
    if (typeof s.event !== 'string')
      throw new Error(`state[${i}]: missing event string`);
    if (!Array.isArray(s.items) || s.items.length < 2)
      throw new Error(`state[${i}]: items must have ≥ 2 entries`);
    for (const [j, it] of s.items.entries()) {
      if (typeof it.name !== 'string' || !it.name.trim())
        throw new Error(`state[${i}] item[${j}]: missing name`);
      if (
        typeof it.value !== 'number' ||
        !isFinite(it.value) ||
        it.value < 0
      )
        throw new Error(
          `state[${i}] item[${j}] "${it.name}": value must be a finite number ≥ 0`
        );
    }
  }
}

// ── Read, append, write ───────────────────────────────────────────────────────

const SNAPSHOTS = resolve(ROOT, 'data/snapshots.json');
let states;
try {
  states = JSON.parse(readFileSync(SNAPSHOTS, 'utf8'));
} catch (e) {
  console.error(`Failed to read ${SNAPSHOTS}:`, e.message);
  process.exit(1);
}

try {
  validateStates(states);
} catch (e) {
  console.error('Existing data failed validation:', e.message);
  process.exit(1);
}

states.push({ event: label, items });

try {
  validateStates(states);
} catch (e) {
  // Should never happen, but exit nonzero on schema drift
  console.error('New state failed schema validation:', e.message);
  process.exit(1);
}

writeFileSync(SNAPSHOTS, JSON.stringify(states, null, 2) + '\n');
console.log(`✓ Appended "${label}" — top ${items.length} teams:`);
console.log(items.map(t => `  ${t.name}: ${t.value}%`).join('\n'));
