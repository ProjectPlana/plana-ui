'use client';

import { useAuth } from '@/contexts/auth-context';
import { Guild, getDiscordGuildIconUrl, getDiscordGuildBannerUrl, getBotInviteUrl } from '@/lib/sdk';
import { useUserGuildsQuery } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, ExternalLink, Plus, RefreshCw, Settings, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OSWindow } from '@/components/plana-os/os-window';
import { Pip } from '@/components/plana-os/pip';

const mono = { fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace' };

// On-brand, theme-aware header for servers without a banner: a soft halo glow that
// dissolves into the card surface, so it reads as part of the card in both themes.
const FALLBACK_BANNER =
  'radial-gradient(130% 130% at 14% -20%, color-mix(in oklab, var(--halo) 55%, transparent) 0%, transparent 62%), ' +
  'linear-gradient(150deg, color-mix(in oklab, var(--halo) 22%, var(--os-raised)) 0%, var(--os-raised) 82%)';

// Scrim over a real banner image: a light top darken keeps the status pip legible,
// and the bottom fades into the exact card surface so the banner blends seamlessly
// into the content row beneath it (where the icon overlaps).
const BANNER_SCRIM =
  'linear-gradient(to bottom, oklch(0 0 0 / 0.32) 0%, transparent 38%, transparent 60%, var(--os-raised) 100%)';

function PageHeading({ count }: { count?: number }) {
  return (
    <div className="mb-10">
      <div
        className="text-[11px] uppercase"
        style={{ ...mono, color: 'var(--halo)', letterSpacing: '0.16em' }}
      >
        {'// Sensei Control'}
      </div>
      <h1
        className="mt-2.5 font-semibold"
        style={{ fontSize: 52, letterSpacing: '-0.03em', lineHeight: 1.05 }}
      >
        Server roster
      </h1>
      <p
        className="mt-3.5 max-w-[640px] text-[16px] leading-[1.55]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Servers where you have admin permissions. Pick one to configure modules, or invite Plana into a server it hasn&rsquo;t joined yet.
        {typeof count === 'number' && (
          <>
            {' '}
            <span style={mono}>· {count} discovered</span>
          </>
        )}
      </p>
    </div>
  );
}

function GuildCard({ guild }: { guild: Guild }) {
  const banner = getDiscordGuildBannerUrl(guild);
  const installed = guild.bot_installed;

  return (
    <OSWindow
      title={`guild.${guild.id}`}
      subtitle={installed ? 'installed' : 'invite required'}
      className="transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1"
    >
      <div className="relative" style={{ background: 'var(--os-raised)' }}>
        <div
          className="relative h-24 overflow-hidden"
          style={{
            background: banner ? 'var(--os-raised)' : FALLBACK_BANNER,
            opacity: installed ? 1 : 0.55,
          }}
        >
          {banner && (
            <Image
              src={banner}
              alt={`${guild.name} banner`}
              fill
              unoptimized
              className="object-cover"
            />
          )}
          {banner && (
            <div aria-hidden className="absolute inset-0" style={{ background: BANNER_SCRIM }} />
          )}
          {!installed && (
            <Pip
              accent="var(--destructive)"
              style={{ position: 'absolute', top: 12, right: 12 }}
            >
              BOT · OFFLINE
            </Pip>
          )}
          {installed && (
            <Pip accent="var(--lime)" style={{ position: 'absolute', top: 12, right: 12 }}>
              <span
                className="h-[5px] w-[5px] rounded-full"
                style={{ background: 'var(--lime)' }}
              />
              LINK · OK
            </Pip>
          )}
        </div>
        <div className="flex items-center gap-3 px-5 pb-4 pt-4">
          <div className="relative -mt-12">
            <Image
              src={getDiscordGuildIconUrl(guild)}
              alt={guild.name}
              width={56}
              height={56}
              unoptimized
              className="rounded-2xl"
              style={{
                border: '3px solid var(--os-pane)',
                filter: installed ? undefined : 'grayscale(0.8)',
              }}
            />
            {guild.owner && (
              <div
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: 'var(--halo)' }}
              >
                <Crown className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold">{guild.name}</div>
            <div
              className="text-[11px] uppercase"
              style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.12em' }}
            >
              {guild.owner ? 'OWNER' : 'ADMIN'} · {guild.id.slice(0, 6)}…
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          {installed ? (
            <Button asChild className="w-full">
              <Link href={`/dashboard/${guild.id}`}>
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline" className="w-full">
              <a href={getBotInviteUrl(guild.id)} target="_blank" rel="noopener noreferrer">
                <Plus className="mr-2 h-4 w-4" />
                Invite Plana
              </a>
            </Button>
          )}
        </div>
      </div>
    </OSWindow>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <OSWindow key={i} title="guild.loading" subtitle="…">
          <div className="p-5" style={{ background: 'var(--os-raised)' }}>
            <Skeleton className="h-24 w-full" />
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="mt-4 h-9 w-full" />
          </div>
        </OSWindow>
      ))}
    </div>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <OSWindow title="status.empty" subtitle="no admin servers found">
      <div className="px-10 py-16 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--muted-foreground)' }} />
        <h2 className="text-2xl font-semibold">No servers detected</h2>
        <p
          className="mx-auto mt-3 max-w-md text-[15px] leading-[1.55]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          You don&rsquo;t have admin permissions in any servers Plana can see, or the bot hasn&rsquo;t been invited yet.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href={getBotInviteUrl()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Invite Plana
            </a>
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </OSWindow>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <OSWindow title="status.error" subtitle="federation unreachable">
      <div className="px-10 py-14 text-center">
        <h2 className="text-2xl font-semibold">Connection lost</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px]" style={{ color: 'var(--muted-foreground)' }}>
          {error}
        </p>
        <Button onClick={onRetry} className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    </OSWindow>
  );
}

function AuthGate() {
  return (
    <OSWindow title="auth.required" subtitle="login to continue">
      <div className="px-10 py-16 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--halo)' }} />
        <h2 className="text-2xl font-semibold">Authentication required</h2>
        <p
          className="mx-auto mt-3 max-w-md text-[15px] leading-[1.55]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Log in with Discord from the home page to access the dashboard.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </OSWindow>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const guildsQuery = useUserGuildsQuery(!authLoading && Boolean(user));
  const guilds = guildsQuery.data ?? [];
  const ready = !authLoading && !guildsQuery.isLoading;

  return (
    <section
      className="relative z-[2] mx-auto max-w-[1180px]"
      style={{ padding: '64px 32px 96px' }}
    >
        <PageHeading count={ready && user ? guilds.length : undefined} />

        {authLoading || guildsQuery.isLoading ? (
          <LoadingGrid />
        ) : !user ? (
          <AuthGate />
        ) : guildsQuery.error ? (
          <ErrorState
            error="Failed to load servers. Please try again."
            onRetry={() => guildsQuery.refetch()}
          />
        ) : guilds.length === 0 ? (
          <EmptyState onRefresh={() => guildsQuery.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} />
            ))}
          </div>
        )}
    </section>
  );
}
