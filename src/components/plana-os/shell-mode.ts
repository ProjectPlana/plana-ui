export type ShellMode = 'standard' | 'app' | 'bare';

/**
 * Decides which chrome a route should get.
 * - 'app'      → guild config / future in-app tooling: page renders its own sidebar shell, layout adds nothing.
 * - 'bare'     → auth redirects: no chrome at all.
 * - 'standard' → marketing + content + dashboard list: full OSShell (header + dock + footer).
 *
 * Kept as a pure function so it can be unit-tested without React.
 */
export function shellModeForPath(pathname: string): ShellMode {
  // Guild configuration uses its own sidebar layout.
  if (/^\/dashboard\/[^/]+(?:\/|$)/.test(pathname)) {
    return 'app';
  }
  // Auth pages are transient redirects — no chrome.
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    return 'bare';
  }
  return 'standard';
}
