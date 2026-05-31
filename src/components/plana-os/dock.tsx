'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const DISCORD_INVITE = 'https://discord.gg/9845afkhWT';

const DOCK_ITEMS: Array<{
  g: string;
  label: string;
  href: string;
  external?: boolean;
  match?: string;
}> = [
  { g: '▷', label: 'plana', href: '/', match: '/' },
  { g: '⌘', label: 'modules', href: '/features', match: '/features' },
  { g: '⚙', label: 'settings', href: '/dashboard', match: '/dashboard' },
  { g: '≡', label: 'logs', href: '/commands', match: '/commands' },
  { g: '⤢', label: 'docs', href: '/wiki', match: '/wiki' },
  { g: '✿', label: 'discord', href: DISCORD_INVITE, external: true },
];

export function Dock() {
  const pathname = usePathname();

  return (
    <div className="relative z-[4] flex justify-center pb-14">
      <div
        className="flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
        style={{
          background: 'var(--os-header)',
          border: '1px solid var(--os-line)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px -18px oklch(0 0 0 / 0.45)',
        }}
      >
        {DOCK_ITEMS.map((d, i) => {
          const active =
            d.match && (d.match === '/' ? pathname === '/' : pathname === d.match || pathname.startsWith(`${d.match}/`));
          const inner = (
            <div
              title={d.label}
              className="relative flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] text-lg"
              style={{
                background: active
                  ? `linear-gradient(135deg, var(--halo), oklch(0.6 0.16 320))`
                  : 'var(--os-raised)',
                color: active ? '#fff' : 'var(--foreground)',
                border: `1px solid ${active ? 'var(--halo)' : 'var(--os-line)'}`,
              }}
            >
              {d.g}
              {active && (
                <span
                  className="absolute left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ bottom: -7, background: 'var(--halo)' }}
                />
              )}
            </div>
          );
          return d.external ? (
            <a key={i} href={d.href} target="_blank" rel="noopener noreferrer">
              {inner}
            </a>
          ) : (
            <Link key={i} href={d.href}>
              {inner}
            </Link>
          );
        })}
        <div className="mx-1.5 h-7 w-px" style={{ background: 'var(--os-line)' }} />
        <div
          className="px-2 py-0 pr-1 text-[10px]"
          style={{
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            color: 'var(--dim)',
            letterSpacing: '0.12em',
          }}
        >
          <div>SHITTIM CHEST</div>
          <div style={{ color: 'var(--lime)' }}>● v0.13 · ONLINE</div>
        </div>
      </div>
    </div>
  );
}
