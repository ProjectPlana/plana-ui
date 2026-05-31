'use client';

import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  MessageSquare,
  Users,
  TrendingUp,
  Trophy,
  Rss,
  Gamepad2,
  Smile,
  Folder,
  Brain,
  ShieldAlert,
  Terminal,
  Clock,
  Activity,
  Coins,
} from 'lucide-react';
import { Wordmark } from '@/components/plana-os/wordmark';

type ActiveTab =
  | 'preferences'
  | 'welcome'
  | 'levels'
  | 'achievements'
  | 'economy'
  | 'rss'
  | 'react-roles'
  | 'messages'
  | 'emojis'
  | 'structure'
  | 'ai'
  | 'automod'
  | 'custom-commands'
  | 'scheduled'
  | 'statistics';

export type { ActiveTab };

interface GuildSidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  guildId: string;
}

const sidebarItems = [
  { id: 'preferences' as const,    label: 'General Settings',   icon: Settings,    description: 'Basic bot configuration' },
  { id: 'welcome' as const,        label: 'Welcome System',     icon: Users,       description: 'Welcome & goodbye messages' },
  { id: 'levels' as const,         label: 'Level System',       icon: TrendingUp,  description: 'XP and role rewards' },
  { id: 'achievements' as const,   label: 'Achievements',       icon: Trophy,      description: 'Milestones and unlock rewards' },
  { id: 'economy' as const,        label: 'Economy',            icon: Coins,       description: 'Currency, shop, and rewards' },
  { id: 'react-roles' as const,    label: 'Reaction Roles',     icon: Gamepad2,    description: 'Role assignment via reactions' },
  { id: 'messages' as const,       label: 'Custom Messages',    icon: MessageSquare, description: 'Create and manage messages' },
  { id: 'rss' as const,            label: 'RSS Feeds',          icon: Rss,         description: 'News and content feeds' },
  { id: 'automod' as const,        label: 'Automod',            icon: ShieldAlert, description: 'Spam, invites, profanity, raids' },
  { id: 'custom-commands' as const,label: 'Custom Commands',    icon: Terminal,    description: 'User-defined prefix commands' },
  { id: 'scheduled' as const,      label: 'Scheduled Messages', icon: Clock,       description: 'Recurring posts on a cron schedule' },
  { id: 'statistics' as const,     label: 'Statistic Channels', icon: Activity,    description: 'Live server counters' },
  { id: 'emojis' as const,         label: 'Emojis & Stickers',  icon: Smile,       description: 'Manage server emojis and stickers' },
  { id: 'structure' as const,      label: 'Server Structure',   icon: Folder,      description: 'View channels and categories' },
  { id: 'ai' as const,             label: 'AI Intelligence',    icon: Brain,       description: 'Configure Plana AI behavior' },
];

const mono = { fontFamily: 'var(--font-jetbrains-mono), ui-monospace, monospace' };

export function GuildSidebar({ activeTab, onTabChange, guildId }: GuildSidebarProps) {
  return (
    <div
      className="flex w-72 flex-col"
      style={{
        borderRight: '1px solid var(--os-line)',
        background: 'var(--sidebar)',
      }}
    >
      <div className="p-5" style={{ borderBottom: '1px solid var(--os-line)' }}>
        <Wordmark size={13} />
        <div
          className="mt-2 text-[10px] uppercase"
          style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.16em' }}
        >
          {'// Server Modules'}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors',
                  'hover:bg-[var(--accent)]',
                )}
                style={{
                  background: isActive ? 'var(--os-raised)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--halo)' : 'transparent'}`,
                  boxShadow: isActive ? '0 0 0 0 var(--halo), 0 8px 18px -10px oklch(0 0 0 / 0.4)' : undefined,
                }}
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px]"
                  style={{
                    background: isActive ? 'var(--halo)' : 'var(--os-raised)',
                    color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    border: `1px solid ${isActive ? 'var(--halo)' : 'var(--os-line)'}`,
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[13px] font-medium"
                    style={{ color: isActive ? 'var(--foreground)' : 'var(--foreground)' }}
                  >
                    {item.label}
                  </div>
                  <div
                    className="truncate text-[11px]"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--halo)', boxShadow: '0 0 6px var(--halo)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-4" style={{ borderTop: '1px solid var(--os-line)' }}>
        <div
          className="text-[10px] uppercase"
          style={{ ...mono, color: 'var(--dim)', letterSpacing: '0.14em' }}
        >
          Guild ID
        </div>
        <div
          className="mt-1 truncate text-[11px]"
          style={{ ...mono, color: 'var(--muted-foreground)' }}
        >
          {guildId}
        </div>
      </div>
    </div>
  );
}
