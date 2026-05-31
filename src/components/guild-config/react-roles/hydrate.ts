/**
 * Maps an API ``ReactRole`` (plus its associated ``Message`` row) into the
 * editor-friendly :class:`ExtendedReactRole`.
 *
 * Trigger type is inferred from the associated message components first.
 * Legacy rows without message component data fall back to the assignment key.
 */

import type { GuildData, GuildEmoji, GuildMessage, ReactRole } from '@/lib/sdk';
import { isMenuComponent } from './trigger-ids';
import type { ExtendedReactRole, TriggerType } from './types';

export function inferTriggerType(
  role: ReactRole,
  associatedMessage?: GuildMessage,
): TriggerType {
  const firstComponent = associatedMessage?.components?.[0];
  if (isMenuComponent(firstComponent)) return 'select';
  if (firstComponent) return 'button';

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
  const triggerType = inferTriggerType(role, associatedMessage);
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
