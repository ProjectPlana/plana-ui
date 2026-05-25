'use client';

import React, { useState } from 'react';
import { GuildData, ScheduledMessage, ScheduledMessageType } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import {
  useCreateScheduledMessageMutation,
  useDeleteScheduledMessageMutation,
  useScheduledMessagesQuery,
  useUpdateScheduledMessageMutation,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { MessageBuilder } from '@/components/guild-config/message-builder';
import { Clock, Save, Trash2, Power } from 'lucide-react';
import { toast } from 'sonner';

interface GuildScheduledTabProps {
  guildId: string;
}

type ScheduledDraft = ScheduledMessage & { client_id?: string };

const CRON_PRESETS: Array<{ label: string; value: string; hint: string }> = [
  { label: 'Every hour', value: '0 * * * *', hint: 'On the hour' },
  { label: 'Daily at 09:00 UTC', value: '0 9 * * *', hint: '9 AM every day' },
  { label: 'Weekdays 12:00 UTC', value: '0 12 * * 1-5', hint: 'Mon–Fri at noon' },
  { label: 'Weekly Mon 09:00', value: '0 9 * * 1', hint: 'Every Monday' },
];

const CRON_RE = /^\S+\s+\S+\s+\S+\s+\S+\s+\S+$/;

function defaultSchedule(
  guildId: string,
  channelId: string,
): Omit<
  ScheduledMessage,
  'id' | 'updated_at' | 'last_run_at' | 'next_run_at' | 'run_count'
> {
  return {
    guild_id: guildId,
    channel_id: channelId,
    name: 'Daily reminder',
    enabled: true,
    schedule_type: 'recurring',
    cron: '0 9 * * *',
    run_at: null,
    message: {
      content: 'Good morning, {server}!',
      embeds: [],
      components: [],
      reactions: [],
    },
  };
}

export function GuildScheduledTab({ guildId }: GuildScheduledTabProps) {
  const { guildData } = useGuild();
  const schedulesQuery = useScheduledMessagesQuery(guildId);
  const createSchedule = useCreateScheduledMessageMutation(guildId);
  const updateSchedule = useUpdateScheduledMessageMutation(guildId);
  const deleteSchedule = useDeleteScheduledMessageMutation(guildId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingSchedules, setPendingSchedules] = useState<ScheduledDraft[]>([]);
  const [editedSchedules, setEditedSchedules] = useState<Record<string, ScheduledDraft>>({});
  const schedules = schedulesQuery.data?.data ?? [];
  const visibleSchedules: ScheduledDraft[] = [
    ...pendingSchedules,
    ...schedules.map((schedule) =>
      schedule.id && editedSchedules[schedule.id] ? editedSchedules[schedule.id] : schedule,
    ),
  ];

  function scheduleKey(item: ScheduledDraft) {
    return item.id ?? item.client_id ?? item.name;
  }

  function updateScheduleDraft(item: ScheduledDraft) {
    if (item.id) {
      setEditedSchedules((current) => ({ ...current, [item.id!]: item }));
      return;
    }
    setPendingSchedules((current) =>
      current.map((draft) => (draft.client_id === item.client_id ? item : draft)),
    );
  }

  function handleAdd() {
    const firstChannel = guildData?.channels?.[0]?.channel_id;
    if (!firstChannel) {
      toast.error('No channels available — invite the bot to a channel first.');
      return;
    }
    setPendingSchedules((current) => [
      {
        ...defaultSchedule(guildId, firstChannel),
        run_count: 0,
        client_id: `schedule-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
      ...current,
    ]);
  }

  async function handleSave(item: ScheduledDraft) {
    if (item.schedule_type === 'recurring' && !CRON_RE.test((item.cron ?? '').trim())) {
      toast.error('Cron must be five space-separated fields');
      return;
    }
    if (item.schedule_type === 'once' && !item.run_at) {
      toast.error('Pick the date and time for this one-time message');
      return;
    }
    if (!item.channel_id) {
      toast.error('Pick a channel for this schedule');
      return;
    }
    const key = scheduleKey(item);
    setSavingId(key);
    try {
      const payload = { ...item };
      delete payload.client_id;
      const updated = item.id
        ? await updateSchedule.mutateAsync(payload)
        : await createSchedule.mutateAsync(payload);
      if (item.id) {
        setEditedSchedules((current) => {
          const next = { ...current };
          delete next[item.id!];
          return next;
        });
      } else {
        setPendingSchedules((current) => current.filter((draft) => draft.client_id !== item.client_id));
      }
      toast.success(`Saved "${updated.name}"`);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      toast.error('Failed to save scheduled message');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(item: ScheduledDraft) {
    if (!item.id) {
      setPendingSchedules((current) => current.filter((draft) => draft.client_id !== item.client_id));
      return;
    }
    if (!confirm(`Delete schedule "${item.name}"?`)) return;
    try {
      await deleteSchedule.mutateAsync(item.id);
      toast.success('Schedule deleted');
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast.error('Failed to delete scheduled message');
    }
  }

  const scheduleItems: ItemListItem[] = visibleSchedules.map((item) => {
    const lastRun = item.last_run_at ? new Date(item.last_run_at).toLocaleString() : 'never';
    const nextRun = item.next_run_at ? new Date(item.next_run_at).toLocaleString() : 'calculating';
    const scheduleLabel =
      item.schedule_type === 'once'
        ? `Once at ${item.run_at ? new Date(item.run_at).toLocaleString() : 'not set'}`
        : item.cron ?? 'No cron';
    return {
      id: scheduleKey(item),
      title: item.name || 'Untitled schedule',
      subtitle: `Fired ${item.run_count}x - last: ${lastRun} - next: ${nextRun}`,
      status: item.id ? (item.enabled ? 'Active' : 'Disabled') : 'Draft',
      statusVariant: item.enabled ? 'default' : 'secondary',
      searchText: `${scheduleLabel} ${item.message?.content ?? ''}`,
      actions: [
        {
          label: 'Save',
          onClick: () => handleSave(item),
          variant: 'default',
          icon: Save,
          disabled: savingId === scheduleKey(item),
        },
        {
          label: item.enabled ? 'Disable' : 'Enable',
          onClick: () => {
            const next = { ...item, enabled: !item.enabled };
            updateScheduleDraft(next);
            if (next.id) void handleSave(next);
          },
          variant: item.enabled ? 'outline' : 'default',
          icon: Power,
          disabled: savingId === scheduleKey(item),
        },
        {
          label: 'Delete',
          onClick: () => handleDelete(item),
          variant: 'destructive',
          icon: Trash2,
          disabled: savingId === scheduleKey(item),
        },
      ],
      content: (
        <ScheduleCard
          schedule={item}
          guildData={guildData}
          onChange={updateScheduleDraft}
        />
      ),
    };
  });

  return (
    <ItemList
      title="Scheduled messages"
      description="Post messages once or on a recurring cron schedule. Times use the guild timezone, or UTC if unset."
      icon={Clock}
      items={scheduleItems}
      onAddItem={handleAdd}
      onRefresh={() => schedulesQuery.refetch()}
      refreshing={schedulesQuery.isFetching}
      addItemLabel="Add schedule"
      loading={schedulesQuery.isLoading}
      emptyMessage="No scheduled messages"
      emptyDescription="Add a schedule to have the bot post a one-time or recurring message."
      searchPlaceholder="Search schedules by name, cadence, or message content"
      stats={[
        { label: 'Total schedules', value: visibleSchedules.length },
        { label: 'Active', value: visibleSchedules.filter((item) => item.enabled).length, tone: 'positive' },
        { label: 'Drafts', value: pendingSchedules.length, tone: 'muted' },
      ]}
      showSaveAll={false}
    />
  );
}

interface ScheduleCardProps {
  schedule: ScheduledDraft;
  guildData: GuildData | null;
  onChange: (item: ScheduledDraft) => void;
}

function ScheduleCard({
  schedule,
  guildData,
  onChange,
}: ScheduleCardProps) {
  function patch<K extends keyof ScheduledMessage>(key: K, value: ScheduledMessage[K]) {
    onChange({ ...schedule, [key]: value });
  }

  function patchType(type: ScheduledMessageType) {
    onChange({
      ...schedule,
      schedule_type: type,
      cron: type === 'recurring' ? schedule.cron ?? '0 9 * * *' : null,
      run_at: type === 'once' ? schedule.run_at ?? new Date(Date.now() + 3600000).toISOString() : null,
    });
  }

  function toDateTimeInput(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={schedule.name}
              onChange={(e) => patch('name', e.target.value)}
              placeholder="e.g. Daily standup reminder"
            />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <ChannelSelect
              channels={guildData?.channels ?? []}
              categories={guildData?.categories ?? []}
              value={schedule.channel_id}
              onValueChange={(v) => patch('channel_id', v ?? '')}
              placeholder="Select channel"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Schedule type</Label>
            <Select value={schedule.schedule_type} onValueChange={(value: ScheduledMessageType) => patchType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring</SelectItem>
                <SelectItem value="once">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {schedule.schedule_type === 'once' ? (
            <div className="space-y-2 md:col-span-2">
              <Label>Send at</Label>
              <Input
                type="datetime-local"
                value={toDateTimeInput(schedule.run_at)}
                onChange={(e) =>
                  patch('run_at', e.target.value ? new Date(e.target.value).toISOString() : null)
                }
              />
              <p className="text-xs text-muted-foreground">
                Saved as an absolute timestamp and disabled after it fires once.
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:col-span-2">
              <Label>Cron expression (5 fields)</Label>
              <Input
                value={schedule.cron ?? ''}
                onChange={(e) => patch('cron', e.target.value)}
                placeholder="m h dom mon dow - e.g. 0 9 * * 1-5"
                className="font-mono"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {CRON_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => patch('cron', preset.value)}
                    title={preset.hint}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Cron is evaluated in the guild timezone; UTC if none configured.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Message</Label>
          <MessageBuilder
            guildId={schedule.guild_id ?? ''}
            message={schedule.message}
            onChange={(message) => patch('message', message)}
            placeholder="The message the bot posts on every fire."
          />
        </div>
    </div>
  );
}
