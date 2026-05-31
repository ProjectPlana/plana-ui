import { describe, expect, it } from 'vitest';
import { shellModeForPath } from './shell-mode';

describe('shellModeForPath', () => {
  it('uses the standard shell for the landing page', () => {
    expect(shellModeForPath('/')).toBe('standard');
  });

  it.each([
    '/features',
    '/features/automod',
    '/commands',
    '/wiki',
    '/wiki/getting-started',
    '/support',
    '/privacy',
    '/terms',
    '/dashboard',
  ])('uses the standard shell for content route %s', (path) => {
    expect(shellModeForPath(path)).toBe('standard');
  });

  it.each([
    '/dashboard/123456789012345678',
    '/dashboard/abc?tab=preferences',
    '/dashboard/abc/anything',
  ])('uses the app shell for guild-config route %s', (path) => {
    // `shellModeForPath` only sees the pathname, so strip query strings the
    // same way `usePathname()` does.
    const pathname = path.split('?')[0];
    expect(shellModeForPath(pathname)).toBe('app');
  });

  it.each(['/auth', '/auth/callback', '/auth/callback/anything'])(
    'uses the bare shell for auth route %s',
    (path) => {
      expect(shellModeForPath(path)).toBe('bare');
    },
  );

  it('does not confuse `/dashboard` itself with a guild route', () => {
    // The dashboard list page is `/dashboard`; only `/dashboard/<id>` is a
    // guild config page.
    expect(shellModeForPath('/dashboard')).toBe('standard');
    expect(shellModeForPath('/dashboard/')).toBe('standard');
  });
});
