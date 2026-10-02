"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PREVIEW_EVENT, PREVIEW_KEY, type PreviewState } from "./preview";

function subscribe(callback: () => void) {
  window.addEventListener(PREVIEW_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PREVIEW_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getRaw(): string | null {
  try {
    return sessionStorage.getItem(PREVIEW_KEY);
  } catch {
    return null;
  }
}

export function setPreview(state: PreviewState | null) {
  try {
    if (state) sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(state));
    else sessionStorage.removeItem(PREVIEW_KEY);
  } catch {
    // Storage unavailable: preview just behaves like the normal student app.
  }
  window.dispatchEvent(new Event(PREVIEW_EVENT));
}

// null on the server and on first client render, so hydration always matches.
export function usePreview(): PreviewState | null {
  const raw = useSyncExternalStore(subscribe, getRaw, () => null);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as PreviewState) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
