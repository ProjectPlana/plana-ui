'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Code as Github, MessageSquare, Plus, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { getBotInviteUrl } from '@/lib/sdk';
import { OSWindow } from '@/components/plana-os/os-window';
import { Pip } from '@/components/plana-os/pip';

const DISCORD_INVITE = 'https://discord.gg/9845afkhWT';
const GITHUB_URL = 'https://github.com/ProjectPlana/project-plana';

const FEATURES = [
  { name: 'Automod',        desc: 'Spam, raids, slurs, and invite links — handled with rules you control.' },
  { name: 'Reaction Roles', desc: 'Self-serve identity via buttons, dropdowns, or reactions.' },
  { name: 'Leveling',       desc: 'Per-server XP curves, leaderboards, and role rewards on milestones.' },
  { name: 'Automation',     desc: 'Scheduled posts, RSS pipelines, and server-specific slash commands.' },
];

const STATS = [
  { value: '1,284',  label: 'servers' },
  { value: '927K',   label: 'sensei' },
  { value: '38.2M',  label: 'commands · 30d' },
  { value: '99.97%', label: 'uptime' },
];

const mono = { fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace' };
const jp   = { fontFamily: 'var(--font-noto-jp), sans-serif' };

export default function Home() {
  const { user, login } = useAuth();
  const senseiName = user ? `${user.username}.` : 'Sensei.';

  return (
    <>
      <section className="relative z-[2] mx-auto max-w-[1180px] px-8" style={{ padding: '88px 32px 96px' }}>
        <div className="grid items-center gap-14" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
          <div>
            <div
              className="mb-[22px] inline-flex items-center gap-2 text-[11px]"
              style={{ ...mono, color: 'var(--halo)', letterSpacing: '0.16em' }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--halo)', boxShadow: '0 0 8px var(--halo)' }}
              />
              SHITTIM_CHEST v0.13 · ONLINE
            </div>
            <h1
              className="m-0 font-semibold"
              style={{
                fontSize: 84,
                lineHeight: 0.96,
                letterSpacing: '-0.035em',
                textWrap: 'balance',
              }}
            >
              Welcome back,<br />
              <span className="inline-flex items-baseline gap-2">
                <span style={{ color: 'var(--halo)', fontStyle: 'italic' }}>{senseiName}</span>
                <span
                  className="inline-block"
                  style={{
                    width: 6,
                    height: 64,
                    background: 'var(--halo)',
                    transform: 'translateY(8px)',
                    animation: 'v6cursor 1.05s steps(2) infinite',
                  }}
                />
              </span>
            </h1>
            <div
              className="mt-3.5 text-[13px]"
              style={{ ...jp, color: 'var(--dim)', letterSpacing: '0.28em' }}
            >
              先生、おかえりなさい。
            </div>
            <p
              className="mt-6 max-w-[480px] text-[19px] leading-[1.55]"
              style={{ color: 'var(--muted-foreground)', textWrap: 'pretty' }}
            >
              Project Plana is a free, open-source Discord bot for moderation, roles, leveling,
              and automation — built with care, inspired by Blue Archive.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={getBotInviteUrl()} target="_blank" rel="noopener noreferrer">
                  <Plus className="mr-2 h-4 w-4" /> Invite to your server
                </a>
              </Button>
              {user ? (
                <Button asChild size="lg" variant="outline">
                  <Link href="/dashboard">
                    <Settings className="mr-2 h-4 w-4" /> Open dashboard
                  </Link>
                </Button>
              ) : (
                <Button onClick={login} size="lg" variant="outline">
                  <Shield className="mr-2 h-4 w-4" /> Login with Discord
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> View on GitHub
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> Join support server
                </a>
              </Button>
            </div>

            <div
              className="mt-9 flex gap-6 text-[11px] uppercase"
              style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.08em' }}
            >
              <span>· Free forever</span>
              <span>· MIT license</span>
              <span>· Self-hostable</span>
            </div>
          </div>

          <div className="relative">
            <OSWindow title="plana.png" subtitle="638 × 1200">
              <div className="relative overflow-hidden" style={{ height: 480, background: 'var(--background)' }}>
                <div
                  style={{
                    position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)',
                    width: 220, height: 220, borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--halo) 0%, transparent 60%)',
                    opacity: 0.35, filter: 'blur(18px)',
                  }}
                />
                <Image
                  src="/plana.png"
                  alt="Plana"
                  width={320}
                  height={500}
                  priority
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 8,
                    transform: 'translateX(-50%)',
                    objectFit: 'contain',
                  }}
                />
                <Pip style={{ position: 'absolute', top: 18, left: 18 }}>
                  <span className="h-[5px] w-[5px] rounded-full" style={{ background: 'var(--muted-foreground)' }} />
                  UNIT_001
                </Pip>
                <Pip accent="var(--halo)" style={{ position: 'absolute', top: 18, right: 18 }}>
                  <span
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ background: 'var(--halo)', boxShadow: '0 0 6px var(--halo)' }}
                  />
                  HALO · OK
                </Pip>
                <Pip accent="var(--lime)" style={{ position: 'absolute', bottom: 56, left: 18 }}>
                  <span className="h-[5px] w-[5px] rounded-full" style={{ background: 'var(--lime)' }} />
                  LINK · 99.97%
                </Pip>
                <div
                  className="absolute bottom-3.5 left-0 right-0 text-center text-[11px]"
                  style={{ ...jp, color: 'var(--dim)', letterSpacing: '0.42em' }}
                >
                  プラナ ／ PLN_001
                </div>
              </div>
            </OSWindow>
          </div>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1180px]" style={{ padding: '0 32px 96px' }}>
        <OSWindow title="status.live" subtitle="federation · last 30d">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '28px 32px',
                  borderRight: i < 3 ? '1px solid var(--os-line)' : 'none',
                }}
              >
                <div className="font-semibold" style={{ fontSize: 40, letterSpacing: '-0.025em', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div
                  className="mt-2.5 text-[11px] uppercase"
                  style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.1em' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </OSWindow>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1180px]" style={{ padding: '0 32px 100px' }}>
        <div className="mb-10 flex items-baseline justify-between">
          <div>
            <div
              className="text-[11px] uppercase"
              style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.16em' }}
            >
              {'// Features'}
            </div>
            <h2
              className="mt-2.5 font-semibold"
              style={{
                fontSize: 46,
                letterSpacing: '-0.025em',
                textWrap: 'balance',
                maxWidth: 720,
                lineHeight: 1.05,
              }}
            >
              Everything sensei needs, nothing they don&rsquo;t.
            </h2>
          </div>
          <Link
            href="/commands"
            className="text-[12px] uppercase"
            style={{ ...mono, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textDecoration: 'none' }}
          >
            All commands ↗
          </Link>
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.name}
              className="relative rounded-[14px]"
              style={{
                background: 'var(--os-pane)',
                border: '1px solid var(--os-line)',
                padding: '28px 28px 26px',
              }}
            >
              <div
                className="mb-[18px] flex h-10 w-10 items-center justify-center rounded-[10px] font-semibold"
                style={{
                  background: 'var(--os-raised)',
                  border: '1px solid var(--os-line)',
                  ...mono,
                  fontSize: 14,
                  color: 'var(--halo)',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="font-semibold" style={{ fontSize: 22, letterSpacing: '-0.015em' }}>
                {f.name}
              </div>
              <div
                className="mt-2 max-w-[480px] text-[15px] leading-[1.55]"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1180px]" style={{ padding: '0 32px 100px' }}>
        <div
          className="relative overflow-hidden rounded-[18px]"
          style={{
            background: 'var(--os-pane)',
            border: '1px solid var(--os-line)',
            padding: '64px 56px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -160,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 480,
              height: 480,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--halo) 0%, transparent 60%)',
              opacity: 0.12,
            }}
          />
          <div className="relative">
            <div
              className="text-[11px] uppercase"
              style={{ ...mono, color: 'var(--halo)', letterSpacing: '0.16em' }}
            >
              {'// Get started'}
            </div>
            <h2
              className="mx-auto mt-3.5 font-semibold"
              style={{
                fontSize: 52,
                letterSpacing: '-0.03em',
                textWrap: 'balance',
                maxWidth: 760,
                lineHeight: 1.05,
              }}
            >
              Boot Plana into your server in under a minute.
            </h2>
            <p
              className="mx-auto mt-[18px] max-w-[540px] text-[17px] leading-[1.55]"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Free forever, fully open source. Run on our hosted instance or self-host with Docker.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <a href={getBotInviteUrl()} target="_blank" rel="noopener noreferrer">
                  <Plus className="mr-2 h-4 w-4" /> Invite to your server
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" /> Join support server
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
