'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the user's local timezone abbreviation (e.g. "CST", "JST", "PDT").
 * Falls back to "UTC" if the runtime doesn't expose `timeZoneName: 'short'`.
 */
export function getTimezoneAbbreviation(date: Date, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'UTC';
}

/**
 * Formats a Date as `YYYY.MM.DD · HH:MM:SS TZ` in the user's local timezone.
 * Pure so it can be unit-tested with a fixed clock.
 */
export function formatStatusTime(date: Date, timeZone?: string): string {
  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const datePart = dateFmt.replace(/-/g, '.');

  const timePart = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  const tz = getTimezoneAbbreviation(date, timeZone);
  return `${datePart} · ${timePart} ${tz}`;
}

export function StatusBar() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="relative z-[6] flex h-[26px] items-center gap-3 px-4 text-[11px]"
      style={{
        background: 'var(--os-menubar)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--os-line)',
        fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
        letterSpacing: '0.08em',
        color: 'var(--dim)',
      }}
    >
      <div className="flex-1" />
      <span className="inline-flex items-center gap-1.5">
        <span
          className="inline-block h-[6px] w-[6px] rounded-full"
          style={{
            background: 'var(--lime)',
            boxShadow: '0 0 8px var(--lime)',
            animation: 'osStatusPulse 2s ease-in-out infinite',
          }}
        />
        <span>OPS NOMINAL</span>
      </span>
      <span aria-hidden style={{ color: 'var(--os-line)' }}>
        |
      </span>
      <span>SHITTIM_CHEST v0.13</span>
      <span aria-hidden style={{ color: 'var(--os-line)' }}>
        |
      </span>
      <span
        suppressHydrationWarning
        // Reserve width to avoid layout shift on first tick.
        style={{ minWidth: 168, textAlign: 'right' }}
      >
        {now ? formatStatusTime(now) : ' '}
      </span>
      <style>{`
        @keyframes osStatusPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
