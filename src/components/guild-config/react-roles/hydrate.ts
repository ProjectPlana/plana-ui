/**
 * Maps an API ``ReactRole`` (plus its associated ``Message`` row) into the
 * editor-friendly :class:`ExtendedReactRole`.
 *
 * Trigger type is inferred from the first assignment's ``trigger_id``:
 *   - contains ``-`` → ``select`` (formatted as ``<menuId>-<optionValue>``)
 *   - starts with ``btn_`` → ``button``
 *   - otherwise → ``emoji``
 */

import type { GuildData, GuildEmoji, GuildMessage, ReactRole } from '@/lib/sdk';
import type { ExtendedReactRole, TriggerType } from './types';

export function inferTriggerType(role: ReactRole): TriggerType {
  const first = role.role_assignments[0];
  if (!first) return 'emoji';
  if (first.trigger_id.includes('-')) return 'select';
  if (first.trigger_id.startsWith('btn_')) return 'button';
  return 'emoji';
}

export function reactionsFromAssignments(
  role: ReactRole,
  triggerType: TriggerType,
  guildData: GuildData | null,
): GuildEmoji[] {
  if (triggerType !== 'emoji') return [];
  return role.role_assignments.map((assignment) => {
    const triggerId = assignment.trigger_id;
    const custom = guildData?.emojis?.find((e) => e.emoji_id === triggerId);
    if (custom) {
      return {
        emoji_id: custom.emoji_id,
        name: custom.name,
        animated: custom.animated,
      };
    }
    return { name: triggerId, animated: false };
  });
}

export function hydrateReactRole(
  role: ReactRole,
  associatedMessage: GuildMessage | undefined,
  guildData: GuildData | null,
): ExtendedReactRole {
  const triggerType = inferTriggerType(role);
  return {
    ...role,
    mode: role.mode ?? 'toggle',
    content: associatedMessage?.content ?? '',
    embeds: associatedMessage?.embeds ?? [],
    components: associatedMessage?.components ?? [],
    reactions: reactionsFromAssignments(role, triggerType, guildData),
    triggerType,
    channel_id: associatedMessage?.channel_id ?? '',
    guild_message_id: associatedMessage?.id ?? '',
  };
}
