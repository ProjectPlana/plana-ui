'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  MessageSquare,
  Users,
  TrendingUp,
  Trophy,
  Rss,
  Gamepad2,
  Bot,
  Smile,
  Folder,
  Brain,
  ShieldAlert,
  Terminal,
  Clock,
  Activity,
  Coins,
} from 'lucide-react';

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
  {
    id: 'preferences' as const,
    label: 'General Settings',
    icon: Settings,
    description: 'Basic bot configuration'
  },
  {
    id: 'welcome' as const,
    label: 'Welcome System',
    icon: Users,
    description: 'Welcome & goodbye messages'
  },
  {
    id: 'levels' as const,
    label: 'Level System',
    icon: TrendingUp,
    description: 'XP and role rewards'
  },
  {
    id: 'achievements' as const,
    label: 'Achievements',
    icon: Trophy,
    description: 'Milestones and unlock rewards'
  },
  {
    id: 'economy' as const,
    label: 'Economy',
    icon: Coins,
    description: 'Currency, shop, and rewards'
  },
  {
    id: 'react-roles' as const,
    label: 'Reaction Roles',
    icon: Gamepad2,
    description: 'Role assignment via reactions'
  },
  {
    id: 'messages' as const,
    label: 'Custom Messages',
    icon: MessageSquare,
    description: 'Create and manage messages'
  },
  {
    id: 'rss' as const,
    label: 'RSS Feeds',
    icon: Rss,
    description: 'News and content feeds'
  },
  {
    id: 'automod' as const,
    label: 'Automod',
    icon: ShieldAlert,
    description: 'Spam, invites, profanity, raids'
  },
  {
    id: 'custom-commands' as const,
    label: 'Custom Commands',
    icon: Terminal,
    description: 'User-defined prefix commands'
  },
  {
    id: 'scheduled' as const,
    label: 'Scheduled Messages',
    icon: Clock,
    description: 'Recurring posts on a cron schedule'
  },
  {
    id: 'statistics' as const,
    label: 'Statistic Channels',
    icon: Activity,
    description: 'Live server counters'
  },
  {
    id: 'emojis' as const,
    label: 'Emojis & Stickers',
    icon: Smile,
    description: 'Manage server emojis and stickers'
  },
  {
    id: 'structure' as const,
    label: 'Server Structure',
    icon: Folder,
    description: 'View channels and categories'
  },
  {
    id: 'ai' as const,
    label: 'AI Intelligence',
    icon: Brain,
    description: 'Configure Plana AI behavior'
  },
];

export function GuildSidebar({ activeTab, onTabChange, guildId }: GuildSidebarProps) {
  return (
    <div className="w-64 border-r bg-muted/20 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Project Plana</h2>
            <p className="text-xs text-muted-foreground">Server Configuration</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-auto p-3',
                  isActive && 'bg-secondary/80 shadow-sm'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground text-center">
          Guild ID: <span className="font-mono">{guildId}</span>
        </div>
      </div>
    </div>
  );
} 
