// Friendly colour + icon per card, so menus are not a wall of identical buttons.
// Tailwind needs full class names as literals, hence the fixed list.
const PALETTE = [
  "from-amber-400 to-orange-500",
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-green-600",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-600",
  "from-teal-400 to-cyan-600",
];

export function gradient(index: number): string {
  return PALETTE[index % PALETTE.length];
}

const ICONS: Record<string, string> = {
  nommers: "🔢",
  kleure: "🎨",
  klanke: "🔤",
  sigwoorde: "📖",
};

export function categoryIcon(name: string): string {
  return ICONS[name.trim().toLowerCase()] ?? "⭐";
}
