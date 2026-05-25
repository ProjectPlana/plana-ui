'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemList, type ItemListItem } from '@/components/plana-ui/item-list';
import { useGuild } from '@/contexts/guild-context';
import { Eye, Gamepad2, Pencil, Save, Send, X } from 'lucide-react';
import { ReactRoleForm } from './react-role-form';
import { rowKey, useReactRoles } from './use-react-roles';
import type { ExtendedReactRole } from './types';

interface GuildReactRolesTabProps {
  guildId: string;
}

export function GuildReactRolesTab({ guildId }: GuildReactRolesTabProps) {
  const { guildData } = useGuild();
  const {
    reactRoles,
    loading,
    refreshing,
    savingStates,
    editingTitle,
    setEditingTitle,
    updateAt,
    renameRow,
    addRow,
    save,
    remove,
    toggleEnabled,
    refetch,
  } = useReactRoles(guildId, guildData);

  const items = useMemo<ItemListItem[]>(
    () =>
      reactRoles.map((role, index) =>
        toItemListItem({
          role,
          index,
          guildData,
          isSaving: savingStates[rowKey(role, index)] ?? false,
          isEditingTitle: editingTitle === rowKey(role, index),
          onStartEditTitle: () => setEditingTitle(rowKey(role, index)),
          onStopEditTitle: () => setEditingTitle(null),
          onRename: (name) => renameRow(index, name),
          onSave: () => save(index, role),
          onToggle: () => toggleEnabled(index, role, !role.enabled),
          onDelete: () => remove(index),
          onChange: (next) => updateAt(index, next),
          onToggleEnabledAfterSave: (next) => toggleEnabled(index, role, next),
          guildId,
        }),
      ),
    [
      reactRoles,
      guildData,
      savingStates,
      editingTitle,
      setEditingTitle,
      renameRow,
      save,
      toggleEnabled,
      remove,
      updateAt,
      guildId,
    ],
  );

  return (
    <ItemList
      title="Reaction Roles"
      description="Create reaction role systems where users can assign themselves roles by reacting to messages"
      icon={Gamepad2}
      items={items}
      onAddItem={addRow}
      onRefresh={refetch}
      refreshing={refreshing}
      addItemLabel="Create Reaction Role"
      showSaveAll={false}
      loading={loading}
      searchPlaceholder="Search reaction roles by name, channel, content, or message ID"
      stats={[
        { label: 'Total systems', value: reactRoles.length },
        { label: 'Active', value: reactRoles.filter((role) => role.enabled).length, tone: 'positive' },
        { label: 'Drafts', value: reactRoles.filter((role) => !role.id).length, tone: 'muted' },
      ]}
      emptyMessage="No reaction roles configured"
      emptyDescription="Create your first reaction role system to get started"
    />
  );
}

interface ItemArgs {
  role: ExtendedReactRole;
  index: number;
  guildData: ReturnType<typeof useGuild>['guildData'];
  isSaving: boolean;
  isEditingTitle: boolean;
  onStartEditTitle: () => void;
  onStopEditTitle: () => void;
  onRename: (name: string) => void;
  onSave: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onChange: (next: ExtendedReactRole) => void;
  onToggleEnabledAfterSave: (next: boolean) => void;
  guildId: string;
}

function toItemListItem(args: ItemArgs): ItemListItem {
  const {
    role,
    index,
    guildData,
    isSaving,
    isEditingTitle,
    onStartEditTitle,
    onStopEditTitle,
    onRename,
    onSave,
    onToggle,
    onDelete,
    onChange,
    onToggleEnabledAfterSave,
    guildId,
  } = args;
  const id = rowKey(role, index);
  const canSave = Boolean(
    role.channel_id &&
      (role.content || (role.embeds && role.embeds.length > 0)) &&
      role.role_assignments.length > 0,
  );
  const canToggle = Boolean(role.id);
  const channelName = role.channel_id
    ? guildData?.channels.find((c) => c.channel_id === role.channel_id)?.name ??
      'Unknown Channel'
    : null;

  return {
    id,
    title: role.name || 'Untitled Reaction Role',
    subtitle: channelName
      ? `#${channelName} • ${role.role_assignments.length} assignment(s)`
      : 'No channel selected',
    status: role.enabled ? 'Active' : 'Disabled',
    statusVariant: role.enabled ? 'default' : 'secondary',
    searchText: `${role.content ?? ''} ${role.message_id ?? ''} ${role.triggerType}`,
    titleAction: isEditingTitle ? (
      <TitleEditor
        defaultValue={role.name || 'Untitled Reaction Role'}
        onCommit={onRename}
        onCancel={onStopEditTitle}
      />
    ) : (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onStartEditTitle}
        aria-label="Rename"
      >
        <Pencil className="h-3 w-3" />
      </Button>
    ),
    actions: [
      {
        label: 'Save',
        onClick: onSave,
        variant: 'default',
        icon: Save,
        disabled: !canSave || isSaving,
      },
      {
        label: role.enabled ? 'Disable' : 'Enable',
        onClick: onToggle,
        variant: role.enabled ? 'outline' : 'default',
        icon: role.enabled ? Eye : Send,
        disabled: !canToggle || isSaving,
      },
      {
        label: 'Delete',
        onClick: onDelete,
        variant: 'destructive',
        icon: X,
        disabled: isSaving,
      },
    ],
    content: (
      <ReactRoleForm
        reactRole={role}
        onChange={onChange}
        onToggleEnabled={onToggleEnabledAfterSave}
        guildData={guildData}
        guildId={guildId}
        isNew={!role.id}
        isSaving={isSaving}
      />
    ),
  } satisfies ItemListItem;
}

function TitleEditor({
  defaultValue,
  onCommit,
  onCancel,
}: {
  defaultValue: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') onCommit(e.currentTarget.value);
      else if (e.key === 'Escape') onCancel();
    },
    [onCommit, onCancel],
  );
  return (
    <Input
      defaultValue={defaultValue}
      className="h-8 text-sm"
      onKeyDown={handleKeyDown}
      onBlur={(e) => onCommit(e.target.value)}
      autoFocus
    />
  );
}
