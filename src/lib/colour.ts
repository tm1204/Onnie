// Picks readable text (light or dark) for any tile colour, so a black tile never gets black text.
// Accepts #rgb / #rrggbb / #rrggbbaa, rgb()/rgba(), and the common CSS colour names.

const NAMED: Record<string, string> = {
  black: "#000000", white: "#ffffff", red: "#ff0000", green: "#008000", blue: "#0000ff",
  yellow: "#ffff00", orange: "#ffa500", purple: "#800080", pink: "#ffc0cb", brown: "#a52a2a",
  gray: "#808080", grey: "#808080", gold: "#ffd700", silver: "#c0c0c0", cyan: "#00ffff",
  aqua: "#00ffff", magenta: "#ff00ff", fuchsia: "#ff00ff", lime: "#00ff00", navy: "#000080",
  teal: "#008080", maroon: "#800000", olive: "#808000", violet: "#ee82ee", indigo: "#4b0082",
  turquoise: "#40e0d0", beige: "#f5f5dc", tan: "#d2b48c", coral: "#ff7f50", salmon: "#fa8072",
  khaki: "#f0e68c", lavender: "#e6e6fa", crimson: "#dc143c", skyblue: "#87ceeb",
  lightblue: "#add8e6", lightgreen: "#90ee90", darkgreen: "#006400", darkblue: "#00008b",
  darkred: "#8b0000", lightgrey: "#d3d3d3", lightgray: "#d3d3d3", darkgrey: "#a9a9a9",
  darkgray: "#a9a9a9", hotpink: "#ff69b4", deeppink: "#ff1493", chocolate: "#d2691e",
  ivory: "#fffff0", peachpuff: "#ffdab9", plum: "#dda0dd", orchid: "#da70d6", royalblue: "#4169e1",
  steelblue: "#4682b4", forestgreen: "#228b22", limegreen: "#32cd32", tomato: "#ff6347",
  orangered: "#ff4500", goldenrod: "#daa520", sienna: "#a0522d", slategray: "#708090",
  slategrey: "#708090", dimgray: "#696969", dimgrey: "#696969", mintcream: "#f5fffa",
  aquamarine: "#7fffd4", chartreuse: "#7fff00", firebrick: "#b22222", midnightblue: "#191970",
};

function parseHex(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  if (![3, 4, 6, 8].includes(h.length) || /[^0-9a-f]/i.test(h)) return null;
  const full = h.length <= 4 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

export function parseColour(input: string | null | undefined): [number, number, number] | null {
  if (!input) return null;
  const v = input.trim().toLowerCase().replace(/\s+/g, "");
  if (v.startsWith("#")) return parseHex(v);
  if (NAMED[v]) return parseHex(NAMED[v]);
  const m = v.match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])].map((n) => Math.min(255, n)) as [number, number, number];
  return null;
}

const DARK = "#1c1917";
const LIGHT = "#ffffff";

// WCAG relative luminance; the switch point is nudged towards white text because
// white on saturated colours (red, green, blue) reads friendlier for children.
export function readableTextOn(colour: string | null | undefined): string {
  const rgb = parseColour(colour);
  if (!rgb) return DARK;
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.25 ? LIGHT : DARK;
}

// Best-effort "#rrggbb" for the admin colour picker; null when the value is not parseable.
export function toHex(colour: string | null | undefined): string | null {
  const rgb = parseColour(colour);
  return rgb ? "#" + rgb.map((n) => n.toString(16).padStart(2, "0")).join("") : null;
}
