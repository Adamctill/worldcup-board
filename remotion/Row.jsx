import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';
import { T, BAR_GLOW, SPRING, F } from './tokens.js';
import { nameGradientStyle } from './flags.js';

// ROW_HEIGHT is the stride between row tops (content + gap).
export const ROW_HEIGHT = 130;

export function Row({
  name,
  valueA,   // stateA probability (0 if team absent in A)
  maxA,     // max value in stateA (for bar proportion)
  valueB,   // stateB probability
  maxB,     // max value in stateB
  rankDiff, // rankA - rankB: positive = team moved up (comes from below), negative = moved down
  enterFrame, // frame at which this row's entrance spring starts
  delta,    // change vs first snapshot (for chip display)
  isLead,   // whether this is the #1 team (breathe animation)
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Phase ───────────────────────────────────────────────────────────────
  const phase =
    frame < F.enterEnd   ? 'enter'    :
    frame < F.holdAEnd   ? 'hold-a'   :
    frame < F.transEnd   ? 'transition' : 'hold-b';

  // ─── Entrance ────────────────────────────────────────────────────────────
  // Let the spring run freely; it naturally settles to 1/0 so late-entering
  // rows (enterFrame near phase boundary) still animate smoothly into hold-a.
  const enterSpring  = spring({ frame: frame - enterFrame, fps, config: SPRING.bar });
  const enterOpacity = interpolate(enterSpring, [0, 0.08], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const enterY       = interpolate(enterSpring, [0, 1], [38, 0]);

  // ─── Row reorder (FLIP) ──────────────────────────────────────────────────
  // During transition, each row springs from its stateA visual slot to its stateB slot.
  const reorderSpring = spring({ frame: frame - F.holdAEnd, fps, config: SPRING.row });
  const reorderY = phase === 'transition' || phase === 'hold-b'
    ? interpolate(reorderSpring, [0, 1], [rankDiff * ROW_HEIGHT, 0])
    : 0;

  // Additive: enterY settles to ~0 well before transition starts, so no interference.
  const translateY = enterY + reorderY;
  const opacity    = enterOpacity;

  // ─── Bar width ───────────────────────────────────────────────────────────
  const barA = maxA > 0 ? (valueA / maxA) * 100 : 0;
  const barB = (valueB / maxB) * 100;

  const barEnterSpring = spring({ frame: frame - enterFrame, fps, config: SPRING.bar });
  const barTransSpring = spring({ frame: frame - F.holdAEnd, fps, config: SPRING.bar });

  const barWidth =
    phase === 'enter'
      ? interpolate(barEnterSpring, [0, 1], [0, barA])
      : phase === 'hold-a'
      ? barA
      : interpolate(barTransSpring, [0, 1], [barA, barB]);

  // Lead breathe: 2s sine wave, brightness 1 → 1.22 → 1
  const breathe = isLead
    ? 1 + 0.22 * Math.abs(Math.sin((frame * Math.PI) / (1.6 * fps)))
    : 1;

  // ─── Number counting ─────────────────────────────────────────────────────
  const countT = interpolate(
    frame,
    [F.holdAEnd, F.holdAEnd + 18],   // 600ms at 30fps ≈ 18 frames
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) },
  );
  const displayValue =
    phase === 'enter' || phase === 'hold-a'
      ? valueA
      : interpolate(countT, [0, 1], [valueA, valueB]);

  // Number flashes direction color while counting, then settles
  const isCounting = phase === 'transition' && frame < F.holdAEnd + 18;
  const numColor = isCounting
    ? (valueB > valueA ? T.steam : valueB < valueA ? T.fade : T.text)
    : T.text;
  const numGlow = isCounting
    ? (valueB > valueA
        ? '0 0 14px rgba(52,245,162,.6)'
        : valueB < valueA
        ? '0 0 14px rgba(255,77,61,.6)'
        : 'none')
    : 'none';

  // ─── Delta chip ──────────────────────────────────────────────────────────
  // Chips fade-and-rise in last, ~450ms after transition starts (≈13 frames)
  const CHIP_DELAY = F.holdAEnd + 13;
  const chipSpring = spring({ frame: frame - CHIP_DELAY, fps, config: { stiffness: 120, damping: 18 } });
  const chipShow = (phase === 'transition' || phase === 'hold-b') && delta !== null && Math.abs(delta) >= 0.05;
  const chipOpacity = chipShow ? interpolate(chipSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp' }) : 0;
  const chipY       = chipShow ? interpolate(chipSpring, [0, 1], [8, 0], { extrapolateLeft: 'clamp' }) : 0;
  const chipColor   = delta > 0 ? T.steam : T.fade;

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        position: 'absolute',
        left: 0,
        right: 0,
        willChange: 'transform, opacity',
      }}
    >
      {/* Row top: name · chip · value */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
        <span style={{
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          fontSize: 38,
          fontWeight: 700,
          ...nameGradientStyle(name),
        }}>
          {name}
        </span>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          {/* Delta chip */}
          <span style={{
            opacity: chipOpacity,
            transform: `translateY(${chipY}px)`,
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: chipColor,
          }}>
            {delta > 0 ? '▲ ' : '▼ '}{Math.abs(delta).toFixed(1)}
          </span>

          {/* Probability */}
          <span style={{
            fontFamily: '"Space Grotesk", system-ui, sans-serif',
            fontSize: 48,
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: numColor,
            textShadow: numGlow,
            transition: 'none',
          }}>
            {displayValue.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div style={{
        height: 32,
        background: T.track,
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${barWidth}%`,
          borderRadius: 16,
          background: `linear-gradient(90deg, ${T.goldDeep}, ${T.gold} 70%, ${T.goldHot})`,
          boxShadow: BAR_GLOW,
          filter: `brightness(${breathe})`,
        }} />
      </div>
    </div>
  );
}
