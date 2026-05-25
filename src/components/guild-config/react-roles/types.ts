/**
 * Internal types for the reaction-role tab.
 *
 * `ExtendedReactRole` joins the raw API `ReactRole` (which only carries the
 * Discord message id + role assignments) with the matching guild Message row
 * so the editor can render and update everything on one screen.
 */

import type {
  ButtonComponent,
  GuildEmoji,
  MenuComponent,
  MessageEmbed,
  ReactRole,
} from '@/lib/sdk';

export type TriggerType = 'emoji' | 'button' | 'select';

export interface ExtendedReactRole extends ReactRole {
  content?: string;
  embeds?: MessageEmbed[];
  components?: (ButtonComponent | MenuComponent)[];
  reactions?: GuildEmoji[];
  channel_id?: string;
  /** Plana-internal id of the associated Message row (used to upsert/delete it). */
  guild_message_id?: string;
  triggerType: TriggerType;
}
