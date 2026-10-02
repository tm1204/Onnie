// Admin "Preview" links open the student app and remember which admin page to return to.
// PreviewSession (client) picks the `preview` param up and keeps it for the browser tab.
// This file is server-safe (no React); the client hook lives in usePreview.ts.
export const PREVIEW_PARAM = "preview";
export const PREVIEW_KEY = "onnie:preview";
export const PREVIEW_EVENT = "onnie:preview-change";

export function previewHref(studentPath: string, adminReturnPath: string): string {
  const sep = studentPath.includes("?") ? "&" : "?";
  return `${studentPath}${sep}${PREVIEW_PARAM}=${encodeURIComponent(adminReturnPath)}`;
}

// The current student URL without the preview param, used to spot the first previewed page.
export function entryKey(pathname: string, search: string): string {
  const q = new URLSearchParams(search);
  q.delete(PREVIEW_PARAM);
  const rest = q.toString();
  return rest ? `${pathname}?${rest}` : pathname;
}

export type PreviewState = { returnTo: string; entry: string };
