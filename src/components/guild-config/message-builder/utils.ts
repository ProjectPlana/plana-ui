/**
 * Pure helpers for the message-builder UI: color conversion, date formatting,
 * and immutable updates to the nested message structure.
 */

import type { DiscordMessage, MessageEmbed } from '@/lib/sdk';

export const DEFAULT_EMBED_COLOR = 0x7289da;

export function hexToDecimal(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function decimalToHex(decimal: number | undefined): string {
  return '#' + (decimal ?? DEFAULT_EMBED_COLOR).toString(16).padStart(6, '0');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString();
}

// ---- immutable mutation helpers --------------------------------------------

export function setContent(message: DiscordMessage, content: string): DiscordMessage {
  return { ...message, content };
}

export function withEmbeds(
  message: DiscordMessage,
  embeds: MessageEmbed[],
): DiscordMessage {
  return { ...message, embeds };
}

export function updateEmbedAt(
  message: DiscordMessage,
  index: number,
  patch: (embed: MessageEmbed) => MessageEmbed,
): DiscordMessage {
  const embeds = [...(message.embeds ?? [])];
  if (!embeds[index]) return message;
  embeds[index] = patch(embeds[index]);
  return withEmbeds(message, embeds);
}

export function addEmbed(message: DiscordMessage): DiscordMessage {
  const newEmbed: MessageEmbed = {
    title: '',
    description: '',
    color: DEFAULT_EMBED_COLOR,
    fields: [],
  };
  return withEmbeds(message, [...(message.embeds ?? []), newEmbed]);
}

export function removeEmbed(message: DiscordMessage, index: number): DiscordMessage {
  const embeds = [...(message.embeds ?? [])];
  embeds.splice(index, 1);
  return withEmbeds(message, embeds);
}

export function addEmbedField(
  message: DiscordMessage,
  embedIndex: number,
): DiscordMessage {
  return updateEmbedAt(message, embedIndex, (embed) => ({
    ...embed,
    fields: [...(embed.fields ?? []), { name: '', value: '', inline: false }],
  }));
}

export function updateEmbedField(
  message: DiscordMessage,
  embedIndex: number,
  fieldIndex: number,
  field: { name: string; value: string; inline: boolean },
): DiscordMessage {
  return updateEmbedAt(message, embedIndex, (embed) => {
    const fields = [...(embed.fields ?? [])];
    fields[fieldIndex] = field;
    return { ...embed, fields };
  });
}

export function removeEmbedField(
  message: DiscordMessage,
  embedIndex: number,
  fieldIndex: number,
): DiscordMessage {
  return updateEmbedAt(message, embedIndex, (embed) => {
    const fields = [...(embed.fields ?? [])];
    fields.splice(fieldIndex, 1);
    return { ...embed, fields };
  });
}
