"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { entryKey } from "@/lib/preview";
import { usePreview } from "@/lib/usePreview";

// Home + back chrome carried over from the source deck; present on every content screen.
// While an admin is previewing, "back" on the first previewed page returns to the admin.
export default function NavBar({ backHref, title }: { backHref: string; title?: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const preview = usePreview();
  const adminBack = preview && preview.entry === entryKey(pathname, search) ? preview.returnTo : null;

  const btn =
    "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-md ring-2 ring-amber-200 transition active:scale-90";
  return (
    <nav className="sticky top-0 z-10 flex items-center gap-3 bg-amber-50/90 p-4 backdrop-blur">
      <Link href={adminBack ?? backHref} className={btn} aria-label={adminBack ? "Terug na admin" : "Terug"}>
        ←
      </Link>
      {title ? (
        <h1 className="flex-1 truncate text-center text-2xl font-extrabold text-stone-800 sm:text-3xl">
          {title}
        </h1>
      ) : (
        <span className="flex-1" />
      )}
      <Link href="/" className={btn} aria-label="Tuis">
        🏠
      </Link>
    </nav>
  );
}
