// Feed-mode design tokens (9:16, social)
export const T = {
  ink:       '#0B0908',
  gold:      '#FFB72B',
  goldHot:   '#FFD166',
  goldDeep:  '#C97E12',
  steam:     '#34F5A2',
  fade:      '#FF4D3D',
  text:      '#F7EFE2',
  muted:     '#9A8C76',
  track:     'rgba(255,183,43,.07)',
};

// Bar glow box-shadows (feed mode: tight 16px + wide 38px)
export const BAR_GLOW = `0 0 16px rgba(255,183,43,.45), 0 0 38px rgba(255,183,43,.18)`;

// Spring configs from CLAUDE.md
export const SPRING = {
  row:  { stiffness: 130, damping: 22 },
  bar:  { stiffness: 85,  damping: 20 },
};

// Frame boundaries (30fps, 12s = 360 frames)
export const F = {
  enterEnd:      90,   // entrance complete
  holdAEnd:     180,   // end of hold on stateA
  transEnd:     270,   // transition + spring settle
  total:        360,
  fps:           30,
};
