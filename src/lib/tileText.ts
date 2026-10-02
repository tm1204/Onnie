// One text size for every tile on a screen, sized so the longest word still fits inside
// a splash. Mixed sizes on the same screen look untidy, so this is per screen, not per tile.
// The splash's readable middle is roughly 116px wide on the smallest tile, and bold type
// runs about 0.72em per character.
const USABLE_PX = 116;

export function tileFontSize(values: string[]): number {
  const longest = Math.max(1, ...values.map((v) => v.trim().length));
  return Math.round(Math.min(56, Math.max(16, USABLE_PX / (longest * 0.72))));
}
