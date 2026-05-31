'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GuildSidebar, type ActiveTab } from '@/components/guild-config/guild-sidebar';
import { GuildPreferencesTab } from '@/components/guild-config/guild-preferences-tab';
import { GuildWelcomeTab } from '@/components/guild-config/guild-welcome-tab';
import { GuildLevelsTab } from '@/components/guild-config/guild-levels-tab';
import { GuildAchievementsTab } from '@/components/guild-config/guild-achievements-tab';
import { GuildRssTab } from '@/components/guild-config/guild-rss-tab';
import { GuildReactRolesTab } from '@/components/guild-config/react-roles';
import { GuildMessagesTab } from '@/components/guild-config/guild-messages-tab';
import { GuildAiTab } from '@/components/guild-config/guild-ai-tab';
import { GuildEmojisTab } from '@/components/guild-config/guild-emojis-tab';
import { GuildStructureTab } from '@/components/guild-config/guild-structure-tab';
import { GuildAutomodTab } from '@/components/guild-config/guild-automod-tab';
import { GuildCustomCommandsTab } from '@/components/guild-config/guild-custom-commands-tab';
import { GuildScheduledTab } from '@/components/guild-config/guild-scheduled-tab';
import { GuildStatisticsTab } from '@/components/guild-config/guild-statistics-tab';
import { GuildEconomyTab } from '@/components/guild-config/guild-economy-tab';
import { GuildProvider } from '@/contexts/guild-context';
import { ShellHeader } from '@/components/plana-os/shell-header';
import { StatusBar } from '@/components/plana-os/status-bar';

const VALID_TABS: ReadonlyArray<ActiveTab> = [
  'preferences',
  'welcome',
  'levels',
  'achievements',
  'economy',
  'rss',
  'react-roles',
  'messages',
  'emojis',
  'structure',
  'ai',
  'automod',
  'custom-commands',
  'scheduled',
  'statistics',
];

const TAB_META: Record<ActiveTab, { title: string; subtitle: string }> = {
  preferences:      { title: 'General Settings',   subtitle: 'Basic bot configuration' },
  welcome:          { title: 'Welcome System',     subtitle: 'Greet new members and broadcast departures' },
  levels:           { title: 'Level System',       subtitle: 'XP curves, leaderboards, role rewards' },
  achievements:     { title: 'Achievements',       subtitle: 'Milestones and unlock rewards' },
  economy:          { title: 'Economy',            subtitle: 'Currency, shop, and rewards' },
  rss:              { title: 'RSS Feeds',          subtitle: 'External feeds piped into channels' },
  'react-roles':    { title: 'Reaction Roles',     subtitle: 'Self-serve identity via reactions and buttons' },
  messages:         { title: 'Custom Messages',    subtitle: 'Stored messages you can deploy on demand' },
  emojis:           { title: 'Emojis & Stickers',  subtitle: 'Manage your server’s decorative assets' },
  structure:        { title: 'Server Structure',   subtitle: 'Channels and categories at a glance' },
  ai:               { title: 'AI Intelligence',    subtitle: 'Configure how Plana thinks and responds' },
  automod:          { title: 'Automod',            subtitle: 'Spam, raids, slurs, and invite filtering' },
  'custom-commands':{ title: 'Custom Commands',    subtitle: 'User-defined prefix commands' },
  scheduled:        { title: 'Scheduled Messages', subtitle: 'Recurring posts on a cron schedule' },
  statistics:       { title: 'Statistic Channels', subtitle: 'Live server counters' },
};

const mono = { fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace' };

function ShellBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-space-grotesk), -apple-system, system-ui, sans-serif',
        backgroundImage: 'radial-gradient(var(--grid) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          top: -260,
          right: -160,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--halo) 0%, transparent 60%)',
          opacity: 0.08,
        }}
      />
      <StatusBar />
      <ShellHeader />
      {children}
    </div>
  );
}

export default function GuildConfig() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const guildId = params.guildId as string;
  const tabFromUrl = searchParams.get('tab') as ActiveTab | null;
  const activeTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'preferences';
  const meta = TAB_META[activeTab];

  const handleTabChange = (tab: ActiveTab) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, guildId, router]);

  if (authLoading) {
    return (
      <ShellBackground>
        <div className="flex flex-1">
          <div className="w-72" style={{ borderRight: '1px solid var(--os-line)', background: 'var(--sidebar)' }}>
            <div className="p-6">
              <Skeleton className="mb-4 h-8 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 p-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="mb-8 h-4 w-96" />
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </ShellBackground>
    );
  }

  if (!user) {
    return (
      <ShellBackground>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto max-w-md">
            <h1 className="mb-4 text-3xl font-bold">Authentication Required</h1>
            <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
              Please log in with Discord to access server settings.
            </p>
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </ShellBackground>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'preferences':      return <GuildPreferencesTab guildId={guildId} />;
      case 'welcome':          return <GuildWelcomeTab guildId={guildId} />;
      case 'levels':           return <GuildLevelsTab guildId={guildId} />;
      case 'achievements':     return <GuildAchievementsTab guildId={guildId} />;
      case 'economy':          return <GuildEconomyTab guildId={guildId} />;
      case 'rss':              return <GuildRssTab guildId={guildId} />;
      case 'react-roles':      return <GuildReactRolesTab guildId={guildId} />;
      case 'messages':         return <GuildMessagesTab guildId={guildId} />;
      case 'emojis':           return <GuildEmojisTab guildId={guildId} />;
      case 'structure':        return <GuildStructureTab guildId={guildId} />;
      case 'ai':               return <GuildAiTab guildId={guildId} />;
      case 'automod':          return <GuildAutomodTab guildId={guildId} />;
      case 'custom-commands':  return <GuildCustomCommandsTab guildId={guildId} />;
      case 'scheduled':        return <GuildScheduledTab guildId={guildId} />;
      case 'statistics':       return <GuildStatisticsTab guildId={guildId} />;
      default:                 return <GuildPreferencesTab guildId={guildId} />;
    }
  };

  return (
    <GuildProvider guildId={guildId}>
      <ShellBackground>
        <div className="flex flex-1 overflow-hidden">
          <GuildSidebar activeTab={activeTab} onTabChange={handleTabChange} guildId={guildId} />

          <div className="flex flex-1 flex-col overflow-hidden">
            <div
              className="flex items-center gap-5 px-8 py-5"
              style={{
                borderBottom: '1px solid var(--os-line)',
                background: 'var(--os-header)',
                backdropFilter: 'blur(14px)',
              }}
            >
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Roster
                </Link>
              </Button>
              <div className="min-w-0 flex-1">
                <div
                  className="text-[10px] uppercase"
                  style={{ ...mono, color: 'var(--halo)', letterSpacing: '0.16em' }}
                >
                  {`// ${activeTab}`}
                </div>
                <h1 className="truncate text-2xl font-semibold leading-tight">{meta.title}</h1>
                <p className="truncate text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {meta.subtitle}
                </p>
              </div>
              <div
                className="hidden text-right text-[11px] uppercase md:block"
                style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.12em' }}
              >
                <div>SHITTIM CHEST</div>
                <div style={{ color: 'var(--lime)' }}>● ONLINE</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-8">{renderActiveTab()}</div>
            </div>
          </div>
        </div>
      </ShellBackground>
    </GuildProvider>
  );
}
