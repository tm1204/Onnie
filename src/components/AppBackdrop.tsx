"use client";

import { usePathname } from "next/navigation";

// Soft paint-splash shapes in the corners of every student screen (not the admin),
// so the menus share the same playful look as the tiles.
export default function AppBackdrop() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 400 700"
    >
      <path
        d="M-40 60 C-30 -10 60 -40 110 10 C160 55 130 120 80 150 C30 180 -50 140 -40 60 Z"
        fill="#FDBA74"
        opacity="0.35"
      />
      <path
        d="M330 120 C370 90 440 110 445 170 C450 230 400 260 355 245 C310 230 290 150 330 120 Z"
        fill="#7DD3FC"
        opacity="0.35"
      />
      <path
        d="M-30 520 C10 470 90 480 110 540 C130 600 80 660 20 660 C-40 660 -70 570 -30 520 Z"
        fill="#F9A8D4"
        opacity="0.3"
      />
      <path
        d="M300 560 C350 520 430 560 425 630 C420 690 350 730 300 700 C250 670 260 600 300 560 Z"
        fill="#86EFAC"
        opacity="0.35"
      />
      <circle cx="205" cy="40" r="7" fill="#FCD34D" opacity="0.6" />
      <circle cx="46" cy="330" r="5" fill="#C4B5FD" opacity="0.6" />
      <circle cx="362" cy="400" r="6" fill="#FDA4AF" opacity="0.6" />
    </svg>
  );
}
