import { Composition } from 'remotion';
import { MarketBoard } from './MarketBoard.jsx';
import snapshots from '../data/snapshots.json';
import { F } from './tokens.js';

export function Root() {
  const states = snapshots.slice(-2);
  return (
    <Composition
      id="MarketBoard"
      component={MarketBoard}
      durationInFrames={F.total}
      fps={F.fps}
      width={1080}
      height={1920}
      defaultProps={{ states }}
    />
  );
}
