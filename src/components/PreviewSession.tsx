"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { PREVIEW_PARAM, entryKey } from "@/lib/preview";
import { setPreview, usePreview } from "@/lib/usePreview";

// Starts preview mode when a page is opened with ?preview=<admin path>, and shows a
// bar on every student page until the admin exits. Per tab (sessionStorage), so
// real students are never affected.
export default function PreviewSession() {
  const state = usePreview();
  // The root layout stays mounted across soft navigations (admin Link -> student page),
  // so the param must be picked up whenever the path changes, not only on first load.
  const pathname = usePathname();

  useEffect(() => {
    const url = new URL(window.location.href);
    const returnTo = url.searchParams.get(PREVIEW_PARAM);
    // Only ever return to an admin page (never an arbitrary URL).
    if (returnTo && returnTo.startsWith("/admin") && !returnTo.startsWith("//")) {
      setPreview({ returnTo, entry: entryKey(url.pathname, url.search) });
      url.searchParams.delete(PREVIEW_PARAM);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }, [pathname]);

  if (!state) return null;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 bg-stone-800 px-4 py-2 text-sm font-semibold text-white">
      <span>Preview mode</span>
      <span className="flex items-center gap-2">
        <Link href={state.returnTo} className="rounded-lg bg-amber-500 px-3 py-1 hover:bg-amber-600">
          ← Back to admin
        </Link>
        <button
          onClick={() => setPreview(null)}
          className="rounded-lg px-3 py-1 ring-1 ring-white/40 hover:bg-white/10"
        >
          Exit preview
        </button>
      </span>
    </div>
  );
}
