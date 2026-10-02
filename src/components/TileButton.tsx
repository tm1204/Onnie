"use client";

import { useRouter } from "next/navigation";
import type { Splash } from "@/lib/splash";

export type TileView = {
  id: string;
  displayValue: string;
  caption: string | null; // small text under the main value
  imageUrl: string | null; // picture tiles
  audioUrl: string | null;
  hasChildren: boolean;
  fill: string; // splash colour
  ink: string; // text colour chosen for contrast against `fill`
  shape: Splash; // computed on the server so it never differs between server and browser
};


// `fontSize` is shared by every tile on the screen (see lib/tileText.ts) so sizes are consistent.
export default function TileButton({
  tile,
  basePath,
  fontSize,
}: {
  tile: TileView;
  basePath: string;
  fontSize: number;
}) {
  const router = useRouter();

  function onClick() {
    if (tile.audioUrl) {
      // Fire and forget; a failed play (e.g. missing file) must not block navigation.
      new Audio(tile.audioUrl).play().catch(() => {});
    }
    if (tile.hasChildren) router.push(`${basePath}?tile=${tile.id}`);
  }

  return (
    <button
      onClick={onClick}
      style={{ color: tile.ink }}
      className="group relative block aspect-square w-full transition duration-150 active:scale-90 sm:hover:-rotate-2 sm:hover:scale-105"
    >
      <svg
        viewBox="-12 -12 224 224"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_8px_6px_rgba(0,0,0,0.2)]"
        aria-hidden
      >
        <path d={tile.shape.d} fill={tile.fill} />
        {tile.shape.drops.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={tile.fill} />
        ))}
        <ellipse cx="70" cy="56" rx="28" ry="12" fill="#fff" opacity="0.25" transform="rotate(-28 70 56)" />
      </svg>
      <span className="relative z-10 flex h-full flex-col items-center justify-center gap-1 px-[17%] py-[15%] text-center">
        {tile.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tile.imageUrl} alt={tile.displayValue} className="max-h-[55%] max-w-full object-contain" />
        ) : null}
        <span
          style={{ fontSize }}
          className="max-w-full whitespace-nowrap font-black leading-none"
        >
          {tile.displayValue}
        </span>
        {tile.caption ? (
          <span className="max-w-full truncate text-base font-bold leading-tight opacity-90">{tile.caption}</span>
        ) : null}
      </span>
      {tile.audioUrl ? (
        <span
          className="absolute right-1 top-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base shadow"
          aria-hidden
        >
          🔊
        </span>
      ) : null}
      {tile.hasChildren ? (
        <span
          className="absolute bottom-1 right-1 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-base text-stone-700 shadow"
          aria-hidden
        >
          ▸
        </span>
      ) : null}
    </button>
  );
}
