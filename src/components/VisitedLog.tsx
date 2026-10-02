"use client";

import { useEffect } from "react";

const KEY = "onnie:visited";

// Visited-lessons log for phase 1: per device, browser-only, no server.
export default function VisitedLog({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    try {
      const log: Record<string, { firstOpenedAt: string; lastOpenedAt: string; openCount: number }> =
        JSON.parse(localStorage.getItem(KEY) ?? "{}");
      const now = new Date().toISOString();
      const prev = log[lessonId];
      log[lessonId] = {
        firstOpenedAt: prev?.firstOpenedAt ?? now,
        lastOpenedAt: now,
        openCount: (prev?.openCount ?? 0) + 1,
      };
      localStorage.setItem(KEY, JSON.stringify(log));
    } catch {
      // Storage unavailable (private mode etc.); progress just isn't recorded.
    }
  }, [lessonId]);
  return null;
}
