/**
 * State + CRUD hook for the reaction-role tab.
 *
 * Encapsulates: list state, per-row "saving" flags, the "edit title inline"
 * mode, and every API call (load / save / delete / toggle). The tab component
 * stays presentational and delegates everything here.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  type GuildData,
  type GuildMessage,
  type ReactRole,
} from '@/lib/sdk';
import {
  useDeleteGuildMessageMutation,
  useDeleteReactRoleMutation,
  useGuildMessagesQuery,
  useReactRolesQuery,
  useSaveGuildMessageMutation,
  useSaveReactRoleMutation,
} from '@/lib/queries';
import { hydrateReactRole } from './hydrate';
import type { ExtendedReactRole, TriggerType } from './types';

export function rowKey(role: ExtendedReactRole, index: number): string {
  return role.id || `temp-${index}`;
}

export function useReactRoles(guildId: string, guildData: GuildData | null) {
  const reactRolesQuery = useReactRolesQuery(guildId);
  const messagesQuery = useGuildMessagesQuery(guildId, 100, 0);
  const saveGuildMessage = useSaveGuildMessageMutation(guildId);
  const deleteGuildMessage = useDeleteGuildMessageMutation(guildId);
  const saveReactRole = useSaveReactRoleMutation(guildId);
  const deleteReactRole = useDeleteReactRoleMutation(guildId);
  const [reactRoles, setReactRoles] = useState<ExtendedReactRole[]>([]);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [editingTitle, setEditingTitle] = useState<string | null>(null);

  const setSaving = useCallback((key: string, saving: boolean) => {
    setSavingStates((prev) => ({ ...prev, [key]: saving }));
  }, []);

  const updateAt = useCallback((index: number, next: ExtendedReactRole) => {
    setReactRoles((prev) => {
      const out = [...prev];
      out[index] = next;
      return out;
    });
  }, []);

  const removeAt = useCallback((index: number) => {
    setReactRoles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ---- initial load ----------------------------------------------------
  useEffect(() => {
    if (!guildData || !reactRolesQuery.data || !messagesQuery.data) return;
    const messageById = new Map<string, GuildMessage>(
      messagesQuery.data.data
        .filter((m): m is GuildMessage & { message_id: string } => Boolean(m.message_id))
        .map((m) => [m.message_id, m]),
    );
    const rows = reactRolesQuery.data.data.map((role: ReactRole) =>
      hydrateReactRole(role, messageById.get(role.message_id), guildData),
    );
    setReactRoles(rows);
  }, [guildData, messagesQuery.data, reactRolesQuery.data]);

  // ---- mutations -------------------------------------------------------
  const addRow = useCallback(() => {
    const blank: ExtendedReactRole = {
      guild_id: guildId,
      message_id: '',
      name: 'Untitled Reaction Role',
      content: '',
      embeds: [],
      components: [],
      reactions: [],
      channel_id: '',
      guild_message_id: '',
      role_assignments: [],
      mode: 'toggle',
      enabled: true,
      triggerType: 'emoji',
    };
    setReactRoles((prev) => [...prev, blank]);
  }, [guildId]);

  const renameRow = useCallback(
    (index: number, name: string) => {
      const row = reactRoles[index];
      if (!row) return;
      updateAt(index, { ...row, name });
      setEditingTitle(null);
    },
    [reactRoles, updateAt],
  );

  const save = useCallback(
    async (index: number, role: ExtendedReactRole) => {
      if (
        !role.channel_id ||
        (!role.content && !role.embeds?.length) ||
        role.role_assignments.length === 0
      ) {
        toast.error('Please complete all required fields');
        return;
      }
      if (
        role.role_assignments.some(
          (assignment) =>
            !assignment.trigger_id.trim() || assignment.role_ids.length === 0,
        )
      ) {
        toast.error('Each assignment needs a trigger and at least one role');
        return;
      }
      if (
        role.triggerType === 'emoji' &&
        (role.reactions?.length ?? 0) !== role.role_assignments.length
      ) {
        toast.error('Emoji assignments are out of sync. Please recreate the assignment');
        return;
      }
      const triggerIds = role.role_assignments.map((assignment) => assignment.trigger_id);
      if (triggerIds.length !== new Set(triggerIds).size) {
        toast.error('Each assignment trigger must be unique');
        return;
      }
      const key = rowKey(role, index);
      setSaving(key, true);
      try {
        const messageData: GuildMessage = {
          id: role.guild_message_id || undefined,
          guild_id: guildId,
          channel_id: role.channel_id,
          message_id: role.message_id || undefined,
          name: `${role.name} - Reaction Role Message`,
          content: role.content || '',
          embeds: role.embeds || [],
          components:
            role.triggerType !== 'emoji' ? role.components || [] : [],
          reactions:
            role.triggerType === 'emoji' ? role.reactions || [] : [],
          published: role.enabled,
        };

        const savedMessage = await saveGuildMessage.mutateAsync(messageData);

        const roleAssignments = role.role_assignments.map((a, idx) => ({
          role_ids: a.role_ids,
          trigger_id:
            role.triggerType === 'emoji' && role.reactions?.[idx]
              ? role.reactions[idx].emoji_id || role.reactions[idx].name
              : a.trigger_id,
        }));

        const roleData: ReactRole = {
          id: role.id,
          guild_id: guildId,
          message_id: savedMessage.message_id || '',
          name: role.name || 'Untitled Reaction Role',
          role_assignments: roleAssignments,
          mode: role.mode ?? 'toggle',
          enabled: role.enabled,
        };

        const savedRole = await saveReactRole.mutateAsync(roleData);

        updateAt(index, {
          ...savedRole,
          content: savedMessage.content,
          embeds: savedMessage.embeds,
          components: savedMessage.components,
          reactions: savedMessage.reactions,
          channel_id: savedMessage.channel_id,
          guild_message_id: savedMessage.id,
          triggerType: role.triggerType,
        });
        toast.success('Reaction role saved');
      } catch (error) {
        console.error('Failed to save reaction role:', error);
        toast.error('Failed to save reaction role');
      } finally {
        setSaving(key, false);
      }
    },
    [guildId, saveGuildMessage, saveReactRole, setSaving, updateAt],
  );

  const remove = useCallback(
    async (index: number) => {
      const role = reactRoles[index];
      if (!role) return;
      if (!confirm('Are you sure you want to delete this reaction role?')) return;
      const key = rowKey(role, index);
      setSaving(key, true);
      try {
        if (role.id) {
          await deleteReactRole.mutateAsync(role.id);
          if (role.guild_message_id) {
            await deleteGuildMessage.mutateAsync(role.guild_message_id).catch(console.warn);
          }
        }
        removeAt(index);
        toast.success('Reaction role deleted');
      } catch (error) {
        console.error('Failed to delete reaction role:', error);
        toast.error('Failed to delete reaction role');
      } finally {
        setSaving(key, false);
      }
    },
    [deleteGuildMessage, deleteReactRole, reactRoles, removeAt, setSaving],
  );

  const toggleEnabled = useCallback(
    async (index: number, role: ExtendedReactRole, next: boolean) => {
      if (!role.id) {
        toast.error('Please save the reaction role first');
        return;
      }
      setSaving(role.id, true);
      try {
        const updated = await saveReactRole.mutateAsync({
          id: role.id,
          guild_id: guildId,
          message_id: role.message_id,
          name: role.name || 'Untitled Reaction Role',
          role_assignments: role.role_assignments,
          mode: role.mode ?? 'toggle',
          enabled: next,
        });
        updateAt(index, { ...role, enabled: updated.enabled });
        toast.success(`Reaction role ${next ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Failed to toggle reaction role:', error);
        toast.error('Failed to update reaction role status');
      } finally {
        setSaving(role.id!, false);
      }
    },
    [guildId, saveReactRole, setSaving, updateAt],
  );

  return {
    reactRoles,
    loading: !guildData || reactRolesQuery.isLoading || messagesQuery.isLoading,
    refreshing: reactRolesQuery.isFetching || messagesQuery.isFetching,
    savingStates,
    editingTitle,
    setEditingTitle,
    updateAt,
    renameRow,
    addRow,
    save,
    remove,
    toggleEnabled,
    refetch: () => {
      reactRolesQuery.refetch();
      messagesQuery.refetch();
    },
  } as const;
}

export type UseReactRoles = ReturnType<typeof useReactRoles>;
export type { TriggerType };
