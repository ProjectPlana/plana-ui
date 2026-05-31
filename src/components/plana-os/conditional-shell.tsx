'use client';

import { usePathname } from 'next/navigation';
import { OSShell } from './os-shell';
import { shellModeForPath } from './shell-mode';

export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const mode = shellModeForPath(pathname);

  if (mode === 'standard') {
    return <OSShell>{children}</OSShell>;
  }
  // 'app' and 'bare' both let the underlying page provide (or skip) its own chrome.
  return <>{children}</>;
}
