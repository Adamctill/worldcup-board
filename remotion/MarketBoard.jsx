import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { loadFont as loadFraunces }     from '@remotion/google-fonts/Fraunces';
import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk';
import { T, F } from './tokens.js';
import { Row, ROW_HEIGHT } from './Row.jsx';

loadFraunces();
loadSpaceGrotesk();

// Layout constants (1080×1920)
const PAD_H    = 90;   // horizontal padding
const PAD_TOP  = 160;  // top padding
const EB_SIZE  = 26;   // eyebrow font size
const EB_GAP   = 20;
const HL_SIZE  = 72;   // headline font size
const HL_LH    = 1.05;
const HL_GAP   = 28;
const CAP_SIZE = 32;   // caption (event label) font size
const CAP_GAP  = 52;
const ROWS_TOP = PAD_TOP + EB_SIZE + EB_GAP + HL_SIZE * 2 * HL_LH + HL_GAP + CAP_SIZE + CAP_GAP;
//               160     + 26      + 20     + ~151                  + 28     + 32       + 52      = 469

export function MarketBoard({ states }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [stateA, stateB] = states;

  // Build lookup maps
  const mapA = Object.fromEntries(stateA.items.map(it => [it.name, it.value]));
  const mapB = Object.fromEntries(stateB.items.map(it => [it.name, it.value]));
  const rankA = Object.fromEntries(stateA.items.map((it, i) => [it.name, i]));
  const rankB = Object.fromEntries(stateB.items.map((it, i) => [it.name, i]));
  const maxA  = stateA.items[0].value;
  const maxB  = stateB.items[0].value;

  // First snapshot = baseline for delta chips
  // (passed in via props from Root; fall back to stateA)
  const baseline = states[0]; // stateA is already the second-to-last

  // ─── Phase ───────────────────────────────────────────────────────────────
  const phase =
    frame < F.enterEnd ? 'enter' :
    frame < F.holdAEnd ? 'hold-a' :
    frame < F.transEnd ? 'transition' : 'hold-b';

  // ─── Header: eyebrow ─────────────────────────────────────────────────────
  const ebSpring = spring({ frame: frame - 0, fps, config: { stiffness: 100, damping: 20 } });
  const ebOpacity = interpolate(ebSpring, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const ebY       = interpolate(ebSpring, [0, 1], [38, 0]);

  // ─── Header: headline ────────────────────────────────────────────────────
  const hlSpring  = spring({ frame: frame - 10, fps, config: { stiffness: 100, damping: 20 } });
  const hlOpacity = interpolate(hlSpring, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const hlY       = interpolate(hlSpring, [0, 1], [38, 0]);

  // ─── Caption (event label) ───────────────────────────────────────────────
  const capSpring    = spring({ frame: frame - 22, fps, config: { stiffness: 100, damping: 20 } });
  const capOpacity   = interpolate(capSpring, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const capY         = interpolate(capSpring, [0, 1], [20, 0]);

  // Caption text cross-fades from stateA event to stateB event during transition
  const captionTransProgress = interpolate(
    frame,
    [F.holdAEnd, F.holdAEnd + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const captionAOpacity = phase === 'transition' || phase === 'hold-b'
    ? 1 - captionTransProgress : 1;
  const captionBOpacity = phase === 'transition' || phase === 'hold-b'
    ? captionTransProgress : 0;

  // ─── Live dot pulse (one infinite loop, 1.6s period) ─────────────────────
  const dotOpacity = 0.675 + 0.325 * Math.cos((frame * 2 * Math.PI) / (1.6 * fps));

  // ─── Rows: stagger entrance frames ──────────────────────────────────────
  // Rows enter starting frame 45, staggered ~5 frames apart
  function enterFrameFor(rank) {
    return 45 + rank * 5;
  }

  return (
    <div style={{
      width: 1080,
      height: 1920,
      background: T.ink,
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      color: T.text,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Google Fonts preload (Remotion-loadFont handles this; style tag ensures fallback) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Space+Grotesk:wght@400;500;700&display=swap');
      `}</style>

      {/* ── Eyebrow ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: PAD_TOP,
        left: PAD_H,
        right: PAD_H,
        transform: `translateY(${ebY}px)`,
        opacity: ebOpacity,
        fontSize: EB_SIZE,
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: T.gold,
      }}>
        World Cup 2026
      </div>

      {/* ── Headline ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: PAD_TOP + EB_SIZE + EB_GAP,
        left: PAD_H,
        right: PAD_H,
        transform: `translateY(${hlY}px)`,
        opacity: hlOpacity,
        fontFamily: '"Fraunces", serif',
        fontSize: HL_SIZE,
        fontWeight: 600,
        lineHeight: HL_LH,
        letterSpacing: '-0.01em',
        whiteSpace: 'pre-line',
      }}>
        {'Who wins\nit all?'}
      </div>

      {/* ── Event caption ───────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: PAD_TOP + EB_SIZE + EB_GAP + HL_SIZE * 2 * HL_LH + HL_GAP,
        left: PAD_H,
        right: PAD_H,
        transform: `translateY(${capY}px)`,
        opacity: capOpacity,
        fontSize: CAP_SIZE,
        color: T.muted,
        height: CAP_SIZE * 1.3,
      }}>
        {/* stateA label */}
        <span style={{ position: 'absolute', opacity: captionAOpacity }}>
          {stateA.event}
        </span>
        {/* stateB label */}
        <span style={{ position: 'absolute', opacity: captionBOpacity }}>
          {stateB.event}
        </span>
      </div>

      {/* ── Rows container ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: ROWS_TOP,
        left: PAD_H,
        right: PAD_H,
        height: stateB.items.length * ROW_HEIGHT,
      }}>
        {stateB.items.map((itemB, rankBIdx) => {
          const name   = itemB.name;
          const valA   = mapA[name] ?? itemB.value;
          const rA     = rankA[name] ?? rankBIdx;
          const rankDiff = rA - rankBIdx;  // positive = was lower, rises up

          // Delta vs stateA (our baseline for the chip)
          const delta = itemB.value - valA;

          return (
            <div
              key={name}
              style={{
                position: 'absolute',
                top: rankBIdx * ROW_HEIGHT,
                left: 0,
                right: 0,
                height: ROW_HEIGHT,
              }}
            >
              <Row
                name={name}
                valueA={valA}
                maxA={maxA}
                valueB={itemB.value}
                maxB={maxB}
                rankDiff={rankDiff}
                enterFrame={enterFrameFor(rankBIdx)}
                delta={delta}
                isLead={rankBIdx === 0}
              />
            </div>
          );
        })}
      </div>

      {/* ── Footer: live label + "live odds" text ───────────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: PAD_H,
        right: PAD_H,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 22,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: T.muted,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: T.gold }}>
          {/* Live pulse dot */}
          <div style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: T.gold,
            boxShadow: `0 0 10px rgba(255,183,43,.45)`,
            opacity: dotOpacity,
          }} />
          live odds
        </div>
        <span>The Odds API</span>
      </div>
    </div>
  );
}
