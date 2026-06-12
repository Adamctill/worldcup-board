// Flag stripe colors keyed by lowercase team name.
// Values are 2–3 hex colors used as equal-width linear-gradient stops.
export const FLAG_COLORS = {
  spain:       ['#E8112D','#FFC400','#E8112D'],
  france:      ['#3D7DE4','#FFFFFF','#EF4135'],
  england:     ['#FFFFFF','#E8112D'],
  portugal:    ['#0E9347','#E8112D','#FFE900'],
  brazil:      ['#00A859','#FEDD00','#3E7BFA'],
  argentina:   ['#75AADB','#FFFFFF','#75AADB'],
  germany:     ['#E8112D','#FFCE00'],
  netherlands: ['#E8512D','#FFFFFF','#5B8DEF'],
  norway:      ['#E8112D','#FFFFFF','#5B8DEF'],
  belgium:     ['#FFCE00','#E8112D'],
  usa:         ['#E8112D','#FFFFFF','#5B8DEF'],
  mexico:      ['#0E9347','#FFFFFF','#E8112D'],
  japan:       ['#FFFFFF','#E8112D'],
  morocco:     ['#E8112D','#0E9347'],
  croatia:     ['#E8112D','#FFFFFF','#5B8DEF'],
  colombia:    ['#FFCE00','#5B8DEF','#E8112D'],
  uruguay:     ['#75AADB','#FFFFFF','#75AADB'],
  senegal:     ['#0E9347','#FFE900','#E8112D'],
  switzerland: ['#E8112D','#FFFFFF'],
  canada:      ['#E8112D','#FFFFFF','#E8112D'],
  ecuador:     ['#FFCE00','#5B8DEF','#E8112D'],
  denmark:     ['#E8112D','#FFFFFF'],
  italy:       ['#0E9347','#FFFFFF','#E8112D'],
  sweden:      ['#5B8DEF','#FFCE00'],
  'south korea': ['#FFFFFF','#E8112D','#5B8DEF'],
  'ivory coast': ['#FF8A3D','#FFFFFF','#0E9347'],
};

export function nameGradientStyle(name) {
  const cols = FLAG_COLORS[name.toLowerCase().trim()];
  if (!cols || cols.length < 2) return {};
  const n = cols.length;
  const stops = cols.flatMap((c, i) => [
    `${c} ${Math.round((i / n) * 100)}%`,
    `${c} ${Math.round(((i + 1) / n) * 100)}%`,
  ]);
  return {
    background: `linear-gradient(90deg, ${stops.join(', ')})`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block',
  };
}
