'use client';

import React, { useEffect, useState } from 'react';
import { GuildData, StatisticChannel, StatisticChannelType } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import {
  useCreateStatisticChannelMutation,
  useDeleteStatisticChannelMutation,
  useStatisticChannelsQuery,
  useUpdateStatisticChannelMutation,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { Activity, RotateCcw, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GuildStatisticsTabProps {
  guildId: string;
}

type StatisticDraft = StatisticChannel & { client_id?: string };

const STAT_TYPES: Array<{ value: StatisticChannelType; label: string; template: string }> = [
  { value: 'members', label: 'Members', template: 'Members: {count}' },
  { value: 'humans', label: 'Humans', template: 'Humans: {count}' },
  { value: 'bots', label: 'Bots', template: 'Bots: {count}' },
  { value: 'online', label: 'Online', template: 'Online: {count}' },
  { value: 'boosts', label: 'Boosts', template: 'Boosts: {count}' },
  { value: 'roles', label: 'Roles', template: 'Roles: {count}' },
  { value: 'channels', label: 'Channels', template: 'Channels: {count}' },
];

function defaultStatistic(
  guildId: string,
): Omit<StatisticChannel, 'id' | 'updated_at' | 'last_value' | 'last_updated_at'> {
  return {
    guild_id: guildId,
    channel_id: null,
    name: 'Member counter',
    enabled: true,
    type: 'members',
    template: 'Members: {count}',
    update_interval_seconds: 600,
  };
}

export function GuildStatisticsTab({ guildId }: GuildStatisticsTabProps) {
  const { guildData } = useGuild();
  const statsQuery = useStatisticChannelsQuery(guildId);
  const createStatistic = useCreateStatisticChannelMutation(guildId);
  const updateStatistic = useUpdateStatisticChannelMutation(guildId);
  const deleteStatistic = useDeleteStatisticChannelMutation(guildId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingStatistics, setPendingStatistics] = useState<StatisticDraft[]>([]);
  const statistics = statsQuery.data?.data ?? [];
  const visibleStatistics: StatisticDraft[] = [...pendingStatistics, ...statistics];
  const statisticItems: ItemListItem[] = visibleStatistics.map((statistic) => ({
    id: statistic.id ?? statistic.client_id ?? statistic.name,
    title: statistic.name || 'Statistic channel',
    subtitle: statistic.last_updated_at
      ? `Last updated: ${new Date(statistic.last_updated_at).toLocaleString()}`
      : 'Last updated: never',
    status: statistic.id ? (statistic.enabled ? 'Active' : 'Disabled') : 'Draft',
    statusVariant: statistic.enabled ? 'default' : 'secondary',
    searchText: `${statistic.type} ${statistic.template} ${statistic.last_value ?? ''}`,
    content: (
      <StatisticCard
        statistic={statistic}
        guildData={guildData}
        saving={savingId === (statistic.id ?? statistic.client_id)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    ),
  }));

  function handleAdd() {
    setPendingStatistics((current) => [
      {
        ...defaultStatistic(guildId),
        client_id: `stat-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      ...current,
    ]);
  }

  async function handleSave(statistic: StatisticDraft) {
    if (!statistic.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (!statistic.template.trim()) {
      toast.error('Template cannot be empty');
      return;
    }
    if (!statistic.template.includes('{count}')) {
      toast.error('Template must include {count}');
      return;
    }
    const saveKey = statistic.id ?? statistic.client_id ?? null;
    setSavingId(saveKey);
    try {
      const payload = { ...statistic };
      delete payload.client_id;
      payload.name = payload.name.trim();
      payload.template = payload.template.trim();
      if (statistic.id) {
        await updateStatistic.mutateAsync(payload);
      } else {
        const created = await createStatistic.mutateAsync(payload);
        if (statistic.client_id) {
          setPendingStatistics((current) =>
            current.filter((item) => item.client_id !== statistic.client_id),
          );
        }
        toast.success(`Statistic channel "${created.name}" saved`);
        return;
      }
      toast.success('Statistic channel saved');
    } catch (error) {
      console.error('Failed to save statistic channel:', error);
      toast.error('Failed to save statistic channel');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(statistic: StatisticDraft) {
    if (!statistic.id) {
      setPendingStatistics((current) =>
        current.filter((item) => item.client_id !== statistic.client_id),
      );
      return;
    }
    if (!confirm(`Delete statistic channel "${statistic.name}"?`)) return;
    try {
      await deleteStatistic.mutateAsync(statistic.id);
      toast.success('Statistic channel deleted');
    } catch (error) {
      console.error('Failed to delete statistic channel:', error);
      toast.error('Failed to delete statistic channel');
    }
  }

  return (
    <ItemList
      title="Statistic channels"
      description="Keep channel names updated with live server counters."
      icon={Activity}
      items={statisticItems}
      onAddItem={handleAdd}
      onRefresh={() => statsQuery.refetch()}
      refreshing={statsQuery.isFetching}
      addItemLabel="Add counter"
      loading={statsQuery.isLoading}
      emptyMessage="No statistic channels"
      emptyDescription="Add a draft counter, configure it, then save to create the Discord channel."
      searchPlaceholder="Search counters by name, type, template, or last value"
      stats={[
        { label: 'Total counters', value: visibleStatistics.length },
        { label: 'Active', value: visibleStatistics.filter((item) => item.enabled).length, tone: 'positive' },
        { label: 'Drafts', value: pendingStatistics.length, tone: 'muted' },
      ]}
      showSaveAll={false}
    />
  );
}

interface StatisticCardProps {
  statistic: StatisticDraft;
  guildData: GuildData | null;
  saving: boolean;
  onSave: (statistic: StatisticDraft) => void;
  onDelete: (statistic: StatisticDraft) => void;
}

function StatisticCard({
  statistic,
  guildData,
  saving,
  onSave,
  onDelete,
}: StatisticCardProps) {
  const [draft, setDraft] = useState<StatisticDraft>(statistic);
  const dirty = JSON.stringify(draft) !== JSON.stringify(statistic);
  useEffect(() => {
    setDraft(statistic);
  }, [statistic]);

  function patch<K extends keyof StatisticChannel>(key: K, value: StatisticChannel[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(type: StatisticChannelType) {
    const preset = STAT_TYPES.find((item) => item.value === type);
    setDraft((prev) => ({
      ...prev,
      type,
      template: preset?.template ?? prev.template,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.enabled}
            onCheckedChange={(value) => patch('enabled', value)}
            aria-label="Enable statistic channel"
          />
          <Badge variant={draft.enabled ? 'default' : 'secondary'}>
            {draft.enabled ? 'Active' : 'Disabled'}
          </Badge>
          {draft.last_value !== null && draft.last_value !== undefined && (
            <Badge variant="outline">{draft.last_value}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!dirty || saving}
            onClick={() => setDraft(statistic)}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" disabled={!dirty || saving} onClick={() => onSave(draft)}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(statistic)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(event) => patch('name', event.target.value)}
              placeholder="Member counter"
            />
          </div>
          <div className="space-y-2">
            <Label>Discord channel</Label>
            <Input
              value={
                draft.channel_id
                  ? (guildData?.voice_channels ?? []).find(
                      (channel) => channel.channel_id === draft.channel_id,
                    )?.name ?? draft.channel_id
                  : 'Created by bot after save'
              }
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Counter</Label>
            <Select value={draft.type} onValueChange={(value) => handleTypeChange(value as StatisticChannelType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAT_TYPES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Channel name template</Label>
            <Input
              value={draft.template}
              onChange={(event) => patch('template', event.target.value)}
              placeholder="Members: {count}"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Supports <code>{'{count}'}</code>, <code>{'{label}'}</code>, and <code>{'{name}'}</code>.
            </p>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Update interval (seconds)</Label>
          <Input
            type="number"
            min={300}
            max={86400}
            value={draft.update_interval_seconds}
            onChange={(event) =>
              patch('update_interval_seconds', Math.max(300, Number(event.target.value) || 300))
            }
          />
        </div>
    </div>
  );
}
