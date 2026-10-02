// Paint-splash shapes for tiles. Each tile id maps to its own deterministic wobbly blob
// with a few flicked-out droplets, so every tile looks hand-made but is stable between
// server and client (the path is computed on the server and passed down as a string).

export type Splash = { d: string; drops: { cx: number; cy: number; r: number }[] };

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => n.toFixed(1);

export function splash(seed: string): Splash {
  const rnd = mulberry32(hash(seed));
  const N = 16;
  const CX = 100;
  const CY = 100;
  const p1 = rnd() * Math.PI * 2;
  const p2 = rnd() * Math.PI * 2;
  const k1 = 2 + Math.floor(rnd() * 3); // 2-4 broad lobes
  const k2 = 5 + Math.floor(rnd() * 3); // 5-7 finer wobble

  const radii: number[] = [];
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let r = 76 + 9 * Math.sin(k1 * a + p1) + 5 * Math.sin(k2 * a + p2);
    if (rnd() < 0.2) r += 8 + rnd() * 8; // an occasional flicked-out point
    r = Math.max(64, Math.min(96, r));
    radii.push(r);
    pts.push([CX + r * Math.cos(a), CY + r * Math.sin(a)]);
  }

  // Closed Catmull-Rom spline -> cubic Beziers for a smooth organic outline.
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N];
    const p1_ = pts[i];
    const p2_ = pts[(i + 1) % N];
    const p3 = pts[(i + 2) % N];
    const c1 = [p1_[0] + (p2_[0] - p0[0]) / 6, p1_[1] + (p2_[1] - p0[1]) / 6];
    const c2 = [p2_[0] - (p3[0] - p1_[0]) / 6, p2_[1] - (p3[1] - p1_[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2_[0])} ${f(p2_[1])}`;
  }
  d += " Z";

  const drops = [];
  const count = 2 + Math.floor(rnd() * 2);
  for (let j = 0; j < count; j++) {
    const idx = Math.floor(rnd() * N);
    const a = (idx / N) * Math.PI * 2 + (rnd() - 0.5) * 0.3;
    const dist = radii[idx] + 9 + rnd() * 5;
    drops.push({
      cx: Number(f(CX + dist * Math.cos(a))),
      cy: Number(f(CY + dist * Math.sin(a))),
      r: Number(f(3 + rnd() * 3.5)),
    });
  }
  return { d, drops };
}

// Cheerful fills for tiles that have no colour of their own (numbers, letters, words).
export const SPLASH_FILLS = [
  "#FF8A3D", "#29B6F6", "#66BB6A", "#F06292", "#AB47BC", "#26C6DA", "#FFCA28", "#EF5350",
];
