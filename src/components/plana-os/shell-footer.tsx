import Link from 'next/link';
import { Code as Github, MessageSquare } from 'lucide-react';
import { Wordmark } from './wordmark';

const DISCORD_INVITE = 'https://discord.gg/9845afkhWT';
const GITHUB_URL = 'https://github.com/ProjectPlana/project-plana';

function FootCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <div
        className="mb-3.5 text-[11px] uppercase"
        style={{
          fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
          color: 'var(--dim)',
          letterSpacing: '0.16em',
        }}
      >
        {title}
      </div>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {links.map(([label, href]) => {
          const external = href.startsWith('http');
          return (
            <li key={label}>
              {external ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
                >
                  {label}
                </a>
              ) : (
                <Link
                  href={href}
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ShellFooter() {
  return (
    <footer
      className="relative z-[2]"
      style={{
        borderTop: '1px solid var(--os-line)',
        background: 'var(--os-footer)',
        padding: '56px 32px 28px',
      }}
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 grid gap-8" style={{ gridTemplateColumns: '1.4fr repeat(4, 1fr)' }}>
          <div>
            <Wordmark size={13} />
            <p
              className="mt-3.5 max-w-[280px] text-[13px] leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              A free, open-source Discord bot for moderation, roles, leveling, and automation. Inspired by Blue Archive.
            </p>
            <div
              className="mt-4 text-[11px] uppercase"
              style={{
                fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
                color: 'var(--dim)',
                letterSpacing: '0.1em',
              }}
            >
              v0.13 · MIT
            </div>
          </div>
          <FootCol
            title="Product"
            links={[
              ['Features', '/features'],
              ['Commands', '/commands'],
              ['Dashboard', '/dashboard'],
            ]}
          />
          <FootCol
            title="Docs"
            links={[
              ['Wiki', '/wiki'],
              ['Support', '/support'],
            ]}
          />
          <FootCol
            title="Community"
            links={[
              ['Discord', DISCORD_INVITE],
              ['GitHub', GITHUB_URL],
            ]}
          />
          <FootCol
            title="Legal"
            links={[
              ['Privacy', '/privacy'],
              ['Terms', '/terms'],
            ]}
          />
        </div>
        <div
          className="flex items-center justify-between pt-5 text-[11px]"
          style={{
            borderTop: '1px solid var(--os-line)',
            fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace',
            color: 'var(--dim)',
            letterSpacing: '0.08em',
          }}
        >
          <span>© 2026 PROJECT PLANA · BROADCAST FROM THE SHITTIM CHEST</span>
          <div className="flex items-center gap-3.5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
              style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
            >
              <Github size={14} /> github
            </a>
            <a
              href={DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5"
              style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}
            >
              <MessageSquare size={14} /> discord
            </a>
            <span className="inline-flex items-center gap-1.5">
              <span className="block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--lime)' }} />
              ALL SYSTEMS NORMAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
