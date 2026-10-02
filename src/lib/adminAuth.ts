// Phase 1 admin gate: HTTP Basic auth with one shared password (ADMIN_PASSWORD).
// Fails closed: if the env var is unset, nobody gets in.

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isAuthorised(authorization: string | null): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !authorization?.startsWith("Basic ")) return false;
  try {
    const decoded = atob(authorization.slice(6));
    const supplied = decoded.slice(decoded.indexOf(":") + 1);
    return safeEqual(supplied, password);
  } catch {
    return false;
  }
}
