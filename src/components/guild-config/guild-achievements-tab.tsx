'use client';

import { useState } from 'react';
import { Award, RotateCcw, Save, Settings, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { MessageBuilder } from '@/components/guild-config/message-builder';
import { ACHIEVEMENT_TEMPLATE_VARIABLES } from '@/components/guild-config/message-builder/template-variables';
import { StickyActionBar } from '@/components/guild-config/sticky-action-bar';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useGuild } from '@/contexts/guild-context';
import {
  defaultAchievementsConfig,
  useAchievementsConfigQuery,
  useDeleteAchievementsConfigMutation,
  useEconomyConfigQuery,
  useUpdateAchievementsConfigMutation,
} from '@/lib/queries';
import type {
  AchievementCriteriaType,
  AchievementsConfig,
  CustomAchievement,
  GuildRole,
} from '@/lib/sdk';

interface GuildAchievementsTabProps {
  guildId: string;
}

const CRITERIA_OPTIONS: Array<{ value: AchievementCriteriaType; label: string }> = [
  { value: 'message_count', label: 'Messages sent' },
  { value: 'character_count', label: 'Characters typed' },
  { value: 'word_count', label: 'Words typed' },
  { value: 'attachment_count', label: 'Attachments sent' },
  { value: 'link_count', label: 'Links sent' },
  { value: 'mention_given', label: 'Mentions given' },
  { value: 'mention_received', label: 'Mentions received' },
  { value: 'reactions_given', label: 'Reactions given' },
  { value: 'reactions_received', label: 'Reactions received' },
  { value: 'voice_minutes', label: 'Voice minutes' },
  { value: 'mute_minutes', label: 'Muted minutes' },
  { value: 'deafen_minutes', label: 'Deafened minutes' },
  { value: 'stream_minutes', label: 'Streaming minutes' },
  { value: 'threads_created', label: 'Threads created' },
  { value: 'threads_participated', label: 'Threads joined' },
  { value: 'slash_commands_used', label: 'Slash commands used' },
  { value: 'messages_deleted', label: 'Messages moderated' },
];

function criteriaLabel(criteria: AchievementCriteriaType) {
  return CRITERIA_OPTIONS.find((item) => item.value === criteria)?.label ?? criteria;
}

function newAchievement(existingCount: number): CustomAchievement {
  return {
    name: `Achievement ${existingCount + 1}`,
    icon_url: null,
    criteria_type: 'message_count',
    criteria_value: 1,
    role_rewards: [],
    xp_reward: 0,
    coins_reward: 0,
  };
}

function normalizeConfig(config: AchievementsConfig): AchievementsConfig {
  return {
    ...config,
    achievement_channel_id: config.achievement_channel_id || null,
    custom_achievements: config.custom_achievements.map((achievement) => ({
      ...achievement,
      icon_url: achievement.icon_url?.trim() || null,
      criteria_value: Math.max(1, Number(achievement.criteria_value) || 1),
      xp_reward: Math.max(0, Number(achievement.xp_reward) || 0),
      coins_reward: Math.max(0, Number(achievement.coins_reward) || 0),
      role_rewards: achievement.role_rewards ?? [],
    })),
  };
}

export function GuildAchievementsTab({ guildId }: GuildAchievementsTabProps) {
  const { guildData } = useGuild();
  const achievementsQuery = useAchievementsConfigQuery(guildId);
  const economyQuery = useEconomyConfigQuery(guildId);
  const updateAchievements = useUpdateAchievementsConfigMutation(guildId);
  const deleteAchievements = useDeleteAchievementsConfigMutation(guildId);
  const [draftConfig, setDraftConfig] = useState<AchievementsConfig | null>(null);

  const economyEnabled = economyQuery.data?.enabled ?? false;

  const config = draftConfig ?? achievementsQuery.data ?? null;
  const saving = updateAchievements.isPending || deleteAchievements.isPending;

  function updateConfig(updates: Partial<AchievementsConfig>) {
    if (!config) return;
    setDraftConfig({ ...config, ...updates });
  }

  function addAchievement() {
    if (!config) return;
    if (config.custom_achievements.length >= 100) {
      toast.error('A server can have at most 100 custom achievements');
      return;
    }
    updateConfig({
      custom_achievements: [
        ...config.custom_achievements,
        newAchievement(config.custom_achievements.length),
      ],
    });
  }

  function updateAchievement(index: number, updates: Partial<CustomAchievement>) {
    if (!config) return;
    const achievements = [...config.custom_achievements];
    achievements[index] = { ...achievements[index], ...updates };
    updateConfig({ custom_achievements: achievements });
  }

  function removeAchievement(index: number) {
    if (!config) return;
    updateConfig({
      custom_achievements: config.custom_achievements.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  async function handleSave() {
    if (!config) return;

    const names = config.custom_achievements.map((achievement) => achievement.name.trim());
    if (names.some((name) => !name)) {
      toast.error('Achievement names cannot be empty');
      return;
    }
    if (new Set(names).size !== names.length) {
      toast.error('Achievement names must be unique');
      return;
    }
    if (
      config.custom_achievements.some(
        (achievement) =>
          achievement.icon_url && !achievement.icon_url.trim().startsWith('https://'),
      )
    ) {
      toast.error('Achievement icon URLs must start with https://');
      return;
    }

    try {
      const saved = await updateAchievements.mutateAsync(normalizeConfig(config));
      setDraftConfig(saved);
      toast.success('Achievement settings saved');
    } catch (error) {
      console.error('Failed to save achievements:', error);
      toast.error('Failed to save achievement settings');
    }
  }

  async function handleReset() {
    if (!confirm('Reset achievement settings for this server?')) return;
    try {
      await deleteAchievements.mutateAsync();
      setDraftConfig(defaultAchievementsConfig(guildId));
      toast.success('Achievement settings reset');
    } catch (error) {
      console.error('Failed to reset achievements:', error);
      toast.error('Failed to reset achievement settings');
    }
  }

  if (achievementsQuery.isLoading) {
    return <p className="py-8 text-center text-muted-foreground">Loading achievement settings...</p>;
  }

  if (!config) {
    return <p className="py-8 text-center text-muted-foreground">Failed to load achievement settings.</p>;
  }

  const achievementItems: ItemListItem[] = config.custom_achievements.map((achievement, index) => ({
    id: `${achievement.name}-${index}`,
    title: achievement.name || `Achievement ${index + 1}`,
    subtitle: `${criteriaLabel(achievement.criteria_type)}: ${achievement.criteria_value}`,
    status: achievement.xp_reward > 0 || achievement.coins_reward > 0 || achievement.role_rewards.length > 0 ? 'Rewarded' : 'Milestone',
    statusVariant: achievement.xp_reward > 0 || achievement.coins_reward > 0 || achievement.role_rewards.length > 0 ? 'default' : 'secondary',
    searchText: `${achievement.criteria_type} ${achievement.criteria_value} ${achievement.xp_reward} ${achievement.coins_reward}`,
    actions: [
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => removeAchievement(index),
      },
    ],
    content: (
      <AchievementForm
        achievement={achievement}
        guildRoles={guildData?.roles ?? []}
        economyEnabled={economyEnabled}
        onChange={(updates) => updateAchievement(index, updates)}
      />
    ),
  }));

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6" />
          Achievements
        </h2>
        <p className="text-muted-foreground">
          Configure milestone tracking, unlock announcements, and achievement rewards.
        </p>
      </div>

      <StickyActionBar>
        <Button variant="destructive" onClick={handleReset} disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Achievements
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Achievement Settings'}
        </Button>
      </StickyActionBar>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Enable achievement tracking and choose where unlocks are announced.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
              aria-label="Enable achievements"
            />
            <Badge variant={config.enabled ? 'default' : 'secondary'}>
              {config.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>Notification Channel</Label>
            <ChannelSelect
              channels={guildData?.channels ?? []}
              categories={guildData?.categories ?? []}
              value={config.achievement_channel_id ?? null}
              onValueChange={(value) => updateConfig({ achievement_channel_id: value })}
              placeholder="Select achievement channel"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unlock Message</CardTitle>
          <CardDescription>Customize the notification sent when a member unlocks an achievement.</CardDescription>
        </CardHeader>
        <CardContent>
          <MessageBuilder
            message={config.achievement_message ?? { content: '' }}
            onChange={(achievement_message) => updateConfig({ achievement_message })}
            placeholder="{user.mention} unlocked **{achievement.name}**!"
            guildId={guildId}
            templateVariables={ACHIEVEMENT_TEMPLATE_VARIABLES}
          />
        </CardContent>
      </Card>

      <ItemList
        title="Custom Achievements"
        description="Create milestones from tracked activity stats."
        icon={Award}
        items={achievementItems}
        onAddItem={addAchievement}
        onRefresh={() => achievementsQuery.refetch()}
        refreshing={achievementsQuery.isFetching}
        addItemLabel="Add achievement"
        showSaveAll={false}
        emptyMessage="No custom achievements"
        emptyDescription="Add a milestone, choose a tracked stat, then save the settings."
        searchPlaceholder="Search achievements by name, stat, or reward"
        stats={[
          { label: 'Total achievements', value: config.custom_achievements.length },
          {
            label: 'With rewards',
            value: config.custom_achievements.filter(
              (achievement) => achievement.xp_reward > 0 || achievement.coins_reward > 0 || achievement.role_rewards.length > 0,
            ).length,
            tone: 'positive',
          },
          { label: 'Limit', value: '100', tone: 'muted' },
        ]}
      />
    </div>
  );
}

interface AchievementFormProps {
  achievement: CustomAchievement;
  guildRoles: GuildRole[];
  economyEnabled: boolean;
  onChange: (updates: Partial<CustomAchievement>) => void;
}

function AchievementForm({ achievement, guildRoles, economyEnabled, onChange }: AchievementFormProps) {
  return (
    <div className="space-y-6 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={achievement.name}
            onChange={(event) => onChange({ name: event.target.value })}
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label>Icon URL</Label>
          <Input
            value={achievement.icon_url ?? ''}
            onChange={(event) => onChange({ icon_url: event.target.value || null })}
            placeholder="https://example.com/icon.png"
            maxLength={512}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tracked Stat</Label>
          <Select
            value={achievement.criteria_type}
            onValueChange={(value) => onChange({ criteria_type: value as AchievementCriteriaType })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRITERIA_OPTIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Threshold</Label>
          <Input
            type="number"
            min="1"
            value={achievement.criteria_value}
            onChange={(event) =>
              onChange({ criteria_value: Math.max(1, Number(event.target.value) || 1) })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>XP Reward</Label>
          <Input
            type="number"
            min="0"
            value={achievement.xp_reward}
            onChange={(event) =>
              onChange({ xp_reward: Math.max(0, Number(event.target.value) || 0) })
            }
          />
        </div>
        {economyEnabled && (
          <div className="space-y-2">
            <Label>Coins Reward</Label>
            <Input
              type="number"
              min="0"
              value={achievement.coins_reward}
              onChange={(event) =>
                onChange({ coins_reward: Math.max(0, Number(event.target.value) || 0) })
              }
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Role Rewards</Label>
          <RoleMultiSelect
            roles={guildRoles}
            value={achievement.role_rewards}
            onValueChange={(role_rewards) => onChange({ role_rewards })}
            placeholder="Select reward roles"
          />
        </div>
      </div>
    </div>
  );
}
