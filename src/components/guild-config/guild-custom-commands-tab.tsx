'use client';

import React, { useState } from 'react';
import { CustomCommand, CustomCommandAction, CustomCommandActionType, GuildData } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import {
  useCreateCustomCommandMutation,
  useCustomCommandsQuery,
  useDeleteCustomCommandMutation,
  useUpdateCustomCommandMutation,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ChannelMultiSelect } from '@/components/plana-ui/channel-multi-select';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { MessageBuilder } from '@/components/guild-config/message-builder';
import { CUSTOM_COMMAND_TEMPLATE_VARIABLES } from '@/components/guild-config/message-builder/template-variables';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Save, Trash2, Send, ShieldPlus, ShieldMinus, MessageSquareReply, Power } from 'lucide-react';
import { toast } from 'sonner';

interface GuildCustomCommandsTabProps {
  guildId: string;
}

type CustomCommandDraft = CustomCommand & { client_id?: string };

const NAME_RE = /^[a-z0-9_-]{1,32}$/;
const RESERVED_NAMES = new Set(['help', 'ping', 'info', 'cc', 'invite']);

function defaultCommand(guildId: string): Omit<CustomCommand, 'id' | 'updated_at' | 'use_count'> {
  return {
    guild_id: guildId,
    name: 'newcmd',
    enabled: true,
    response: null,
    embed: null,
    actions: [defaultMessageAction('reply')],
    delete_invocation: false,
    cooldown_seconds: 3,
    allowed_roles: [],
    allowed_channels: [],
  };
}

function defaultMessageAction(type: Extract<CustomCommandActionType, 'reply' | 'send_message'>): CustomCommandAction {
  return {
    type,
    message: {
      content: type === 'reply' ? 'Hello {user.mention}!' : 'Triggered by {user.mention}',
      embeds: [],
      components: [],
      reactions: [],
    },
    channel_id: null,
    role_id: null,
  };
}

function defaultRoleAction(type: Extract<CustomCommandActionType, 'add_role' | 'remove_role'>): CustomCommandAction {
  return { type, message: null, channel_id: null, role_id: null };
}

export function GuildCustomCommandsTab({ guildId }: GuildCustomCommandsTabProps) {
  const { guildData } = useGuild();
  const commandsQuery = useCustomCommandsQuery(guildId);
  const createCommand = useCreateCustomCommandMutation(guildId);
  const updateCommand = useUpdateCustomCommandMutation(guildId);
  const deleteCommand = useDeleteCustomCommandMutation(guildId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [pendingCommands, setPendingCommands] = useState<CustomCommandDraft[]>([]);
  const [editedCommands, setEditedCommands] = useState<Record<string, CustomCommandDraft>>({});
  const commands = commandsQuery.data?.data ?? [];
  const visibleCommands: CustomCommandDraft[] = [
    ...pendingCommands,
    ...commands.map((command) => (command.id && editedCommands[command.id] ? editedCommands[command.id] : command)),
  ];

  function commandKey(cmd: CustomCommandDraft) {
    return cmd.id ?? cmd.client_id ?? cmd.name;
  }

  function updateCommandDraft(cmd: CustomCommandDraft) {
    if (cmd.id) {
      setEditedCommands((current) => ({ ...current, [cmd.id!]: cmd }));
      return;
    }
    setPendingCommands((current) =>
      current.map((item) => (item.client_id === cmd.client_id ? cmd : item)),
    );
  }

  const commandItems: ItemListItem[] = visibleCommands.map((cmd) => ({
    id: commandKey(cmd),
    title: `!${cmd.name}`,
    subtitle: `Cooldown ${cmd.cooldown_seconds}s${cmd.delete_invocation ? ' - deletes invocation' : ''}`,
    status: cmd.id ? (cmd.enabled ? 'Active' : 'Disabled') : 'Draft',
    statusVariant: cmd.enabled ? 'default' : 'secondary',
    searchText: `${cmd.name} ${cmd.actions?.map((action) => action.type).join(' ') ?? ''}`,
    actions: [
      {
        label: 'Save',
        onClick: () => handleSave(cmd),
        variant: 'default',
        icon: Save,
        disabled: savingId === commandKey(cmd),
      },
      {
        label: cmd.enabled ? 'Disable' : 'Enable',
        onClick: () => {
          const next = { ...cmd, enabled: !cmd.enabled };
          updateCommandDraft(next);
          if (next.id) void handleSave(next);
        },
        variant: cmd.enabled ? 'outline' : 'default',
        icon: Power,
        disabled: savingId === commandKey(cmd),
      },
      {
        label: 'Delete',
        onClick: () => handleDelete(cmd),
        variant: 'destructive',
        icon: Trash2,
        disabled: savingId === commandKey(cmd),
      },
    ],
    content: (
      <CommandCard
        command={cmd}
        guildData={guildData}
        onChange={updateCommandDraft}
      />
    ),
  }));

  function handleAdd() {
    let candidate = defaultCommand(guildId);
    // If `newcmd` is taken, suffix with -2, -3, ...
    if (visibleCommands.some((c) => c.name === candidate.name)) {
      let n = 2;
      while (visibleCommands.some((c) => c.name === `${candidate.name}-${n}`)) n += 1;
      candidate = { ...candidate, name: `${candidate.name}-${n}` };
    }
    setPendingCommands((current) => [
      { ...candidate, use_count: 0, client_id: `command-${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ...current,
    ]);
  }

  async function handleSave(cmd: CustomCommandDraft) {
    const key = commandKey(cmd);
    const name = cmd.name.trim().toLowerCase();
    if (!NAME_RE.test(name)) {
      toast.error('Name must be 1-32 chars of [a-z 0-9 _ -]');
      return;
    }
    if (RESERVED_NAMES.has(name)) {
      toast.error('That name is reserved for a built-in command');
      return;
    }
    if (
      visibleCommands.some(
        (other) =>
          commandKey(other) !== key && other.name.trim().toLowerCase() === name,
      )
    ) {
      toast.error('Another custom command already uses that name');
      return;
    }
    if (cmd.cooldown_seconds < 0 || cmd.cooldown_seconds > 600) {
      toast.error('Cooldown must be between 0 and 600 seconds');
      return;
    }
    if (!cmd.actions?.length && !cmd.response && !cmd.embed) {
      toast.error('Add at least one action');
      return;
    }
    if (
      cmd.actions?.some((action) =>
        action.type === 'send_message' ? !action.channel_id : false,
      )
    ) {
      toast.error('Pick a target channel for send-message actions');
      return;
    }
    if (
      cmd.actions?.some((action) =>
        action.type === 'add_role' || action.type === 'remove_role' ? !action.role_id : false,
      )
    ) {
      toast.error('Pick a role for role actions');
      return;
    }
    setSavingId(key);
    try {
      const payload = { ...cmd, name };
      delete payload.client_id;
      const updated = cmd.id
        ? await updateCommand.mutateAsync(payload)
        : await createCommand.mutateAsync(payload);
      if (cmd.id) {
        setEditedCommands((current) => {
          const next = { ...current };
          delete next[cmd.id!];
          return next;
        });
      } else {
        setPendingCommands((current) => current.filter((item) => item.client_id !== cmd.client_id));
      }
      toast.success(`Saved \`${updated.name}\``);
    } catch (error) {
      console.error('Failed to save command:', error);
      toast.error('Failed to save command');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(cmd: CustomCommandDraft) {
    if (!cmd.id) {
      setPendingCommands((current) => current.filter((item) => item.client_id !== cmd.client_id));
      return;
    }
    if (!confirm(`Delete command \`${cmd.name}\`?`)) return;
    try {
      await deleteCommand.mutateAsync(cmd.id);
      toast.success('Command deleted');
    } catch (error) {
      console.error('Failed to delete command:', error);
      toast.error('Failed to delete command');
    }
  }

  return (
    <ItemList
      title="Custom commands"
      description="Define your own prefix commands with chained actions."
      icon={Terminal}
      items={commandItems}
      onAddItem={handleAdd}
      onRefresh={() => commandsQuery.refetch()}
      refreshing={commandsQuery.isFetching}
      addItemLabel="Add command"
      loading={commandsQuery.isLoading}
      emptyMessage="No custom commands"
      emptyDescription="Add a command to give members a quick way to invoke a response or action."
      searchPlaceholder="Search commands by name or action type"
      headerContent={<TemplateLegend />}
      stats={[
        { label: 'Total commands', value: visibleCommands.length },
        { label: 'Active', value: visibleCommands.filter((cmd) => cmd.enabled).length, tone: 'positive' },
        { label: 'Drafts', value: pendingCommands.length, tone: 'muted' },
      ]}
      showSaveAll={false}
    />
  );
}

function TemplateLegend() {
  const vars = [
    '{user}',
    '{user.mention}',
    '{user.name}',
    '{server}',
    '{channel}',
    '{message.content}',
    '{command.name}',
    '{args}',
    '{arg.0}',
  ];
  return (
    <div className="bg-muted/30 p-3 rounded-lg">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Template variables</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {vars.map((v) => (
          <code key={v} className="bg-background px-2 py-1 rounded text-primary">
            {v}
          </code>
        ))}
      </div>
    </div>
  );
}

interface CommandCardProps {
  command: CustomCommandDraft;
  guildData: GuildData | null;
  onChange: (cmd: CustomCommandDraft) => void;
}

function CommandCard({ command, guildData, onChange }: CommandCardProps) {
  function patch<K extends keyof CustomCommand>(key: K, value: CustomCommand[K]) {
    onChange({ ...command, [key]: value });
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Command name</Label>
            <Input
              value={command.name}
              onChange={(e) => patch('name', e.target.value.toLowerCase())}
              placeholder="my-command"
            />
            <p className="text-xs text-muted-foreground">
              1-32 chars, lowercase letters / digits / <code>_</code> / <code>-</code>.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Cooldown (seconds)</Label>
            <Input
              type="number"
              min={0}
              max={600}
              value={command.cooldown_seconds}
              onChange={(e) =>
                patch(
                  'cooldown_seconds',
                  Math.min(600, Math.max(0, Number(e.target.value) || 0)),
                )
              }
            />
          </div>
        </div>

        <CommandActionsEditor
          command={command}
          guildData={guildData}
          guildId={command.guild_id ?? ''}
          onChange={(actions) => patch('actions', actions)}
        />

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Allowed channels</Label>
            <ChannelMultiSelect
              channels={guildData?.channels ?? []}
              categories={guildData?.categories ?? []}
              value={command.allowed_channels}
              onValueChange={(v) => patch('allowed_channels', v)}
              placeholder="Empty = available everywhere"
            />
          </div>
          <div className="space-y-2">
            <Label>Allowed roles</Label>
            <RoleMultiSelect
              roles={guildData?.roles ?? []}
              value={command.allowed_roles}
              onValueChange={(v) => patch('allowed_roles', v)}
              placeholder="Empty = anyone can use"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Delete invocation message</Label>
            <p className="text-xs text-muted-foreground">
              When enabled, the bot deletes the user&apos;s message after responding.
            </p>
          </div>
          <Switch
            checked={command.delete_invocation}
            onCheckedChange={(v) => patch('delete_invocation', v)}
          />
        </div>
    </div>
  );
}

interface CommandActionsEditorProps {
  command: CustomCommand;
  guildData: GuildData | null;
  guildId: string;
  onChange: (actions: CustomCommandAction[]) => void;
}

const ACTION_OPTIONS: Array<{
  type: CustomCommandActionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { type: 'reply', label: 'Reply in current channel', icon: MessageSquareReply },
  { type: 'send_message', label: 'Send message to channel', icon: Send },
  { type: 'add_role', label: 'Add member role', icon: ShieldPlus },
  { type: 'remove_role', label: 'Remove member role', icon: ShieldMinus },
];

function createAction(type: CustomCommandActionType): CustomCommandAction {
  if (type === 'reply' || type === 'send_message') return defaultMessageAction(type);
  return defaultRoleAction(type);
}

function CommandActionsEditor({
  command,
  guildData,
  guildId,
  onChange,
}: CommandActionsEditorProps) {
  const actions = command.actions ?? [];

  function patchAction(index: number, next: CustomCommandAction) {
    onChange(actions.map((action, i) => (i === index ? next : action)));
  }

  function removeAction(index: number) {
    onChange(actions.filter((_, i) => i !== index));
  }

  function addAction(type: CustomCommandActionType) {
    onChange([...actions, createAction(type)]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>Actions</Label>
          <p className="text-xs text-muted-foreground">
            Actions run in order when the command is triggered.
          </p>
        </div>
        <Select onValueChange={(value) => addAction(value as CustomCommandActionType)}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Add action" />
          </SelectTrigger>
          <SelectContent>
            {ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.type} value={option.type}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No actions yet.
          </div>
        ) : (
          actions.map((action, index) => (
            <ActionEditor
              key={`${action.type}-${index}`}
              action={action}
              guildData={guildData}
              guildId={guildId}
              index={index}
              canRemove={actions.length > 1}
              onChange={(next) => patchAction(index, next)}
              onRemove={() => removeAction(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ActionEditorProps {
  action: CustomCommandAction;
  guildData: GuildData | null;
  guildId: string;
  index: number;
  canRemove: boolean;
  onChange: (action: CustomCommandAction) => void;
  onRemove: () => void;
}

function ActionEditor({
  action,
  guildData,
  guildId,
  index,
  canRemove,
  onChange,
  onRemove,
}: ActionEditorProps) {
  const option = ACTION_OPTIONS.find((item) => item.type === action.type);
  const Icon = option?.icon ?? Send;

  function patch<K extends keyof CustomCommandAction>(
    key: K,
    value: CustomCommandAction[K],
  ) {
    onChange({ ...action, [key]: value });
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {index + 1}. {option?.label ?? action.type}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={!canRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {action.type === 'send_message' && (
        <div className="space-y-2">
          <Label>Target channel</Label>
          <ChannelSelect
            channels={guildData?.channels ?? []}
            categories={guildData?.categories ?? []}
            value={action.channel_id ?? null}
            onValueChange={(value) => patch('channel_id', value)}
            placeholder="Select target channel"
          />
        </div>
      )}

      {(action.type === 'reply' || action.type === 'send_message') && (
        <MessageBuilder
          guildId={guildId}
          message={action.message ?? { content: '', embeds: [], components: [], reactions: [] }}
          onChange={(message) => patch('message', message)}
          placeholder="Message sent by this action."
          templateVariables={CUSTOM_COMMAND_TEMPLATE_VARIABLES}
        />
      )}

      {(action.type === 'add_role' || action.type === 'remove_role') && (
        <div className="space-y-2">
          <Label>Role</Label>
          <Select
            value={action.role_id ? String(action.role_id) : ''}
            onValueChange={(value) => patch('role_id', value || null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {(guildData?.roles ?? []).map((role) => (
                <SelectItem key={role.role_id} value={role.role_id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
