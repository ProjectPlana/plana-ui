/**
 * Internal types shared across the message-builder module.
 *
 * Public types like `DiscordMessage` and `MessageEmbed` come from `@/lib/sdk` —
 * we never re-export them here to avoid a parallel source of truth.
 */

export type AutocompleteTrigger = '@' | '#' | ':' | '{';

export interface TemplateVariable {
  name: string;
  description?: string;
}

export interface AutocompleteOption {
  type: 'user' | 'role' | 'channel' | 'emoji' | 'template';
  id: string;
  name: string;
  display: string;
  description?: string;
  avatar?: string;
  color?: number;
  animated?: boolean;
}

/**
 * Identifies which textarea is being edited. The autocomplete hook reads/writes
 * the right slice of the message based on the prefix:
 *
 * - `main`                       — top-level message.content
 * - `description-<embedIdx>`     — embed.description
 * - `field-<embedIdx>-<fieldIdx>` — embed.fields[i].value
 */
export type TextareaKey = 'main' | `description-${number}` | `field-${number}-${number}`;
