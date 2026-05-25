/**
 * `@user`/`#channel`/`:emoji:`/`{template}` autocomplete shared by the main
 * composer and every embed description / field-value textarea.
 *
 * The hook owns:
 *   - the popup visibility + selected option list
 *   - the cursor position at the time of the trigger
 *   - which textarea key is currently active
 *
 * Components register their textarea via `registerRef(key)` and call
 * `handleChange(value, key)` on every keystroke. When the user picks an option
 * we walk back to the trigger character and replace it with the proper Discord
 * mention/emoji syntax.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { DiscordMessage, GuildData } from '@/lib/sdk';
import type {
  AutocompleteOption,
  AutocompleteTrigger,
  TemplateVariable,
  TextareaKey,
} from './types';
import { setContent, updateEmbedAt, updateEmbedField } from './utils';

interface AutocompleteState {
  show: boolean;
  options: AutocompleteOption[];
  cursorPos: number;
  activeKey: TextareaKey | '';
}

const INITIAL: AutocompleteState = {
  show: false,
  options: [],
  cursorPos: 0,
  activeKey: '',
};

const MAX_SUGGESTIONS_PER_GROUP = 5;
const MAX_CHANNELS = 8;
const MAX_EMOJIS = 8;
const MAX_TEMPLATE_VARIABLES = 10;

interface ActiveMatch {
  trigger: AutocompleteTrigger;
  query: string;
  start: number;
}

function readSlice(message: DiscordMessage, key: TextareaKey): string {
  if (key === 'main') return message.content ?? '';
  if (key.startsWith('description-')) {
    const idx = Number(key.slice('description-'.length));
    return message.embeds?.[idx]?.description ?? '';
  }
  const { embedIdx, fieldIdx } = parseFieldKey(key);
  return message.embeds?.[embedIdx]?.fields?.[fieldIdx]?.value ?? '';
}

function writeSlice(
  message: DiscordMessage,
  key: TextareaKey,
  next: string,
): DiscordMessage {
  if (key === 'main') return setContent(message, next);
  if (key.startsWith('description-')) {
    const idx = Number(key.slice('description-'.length));
    return updateEmbedAt(message, idx, (embed) => ({ ...embed, description: next }));
  }
  const { embedIdx, fieldIdx } = parseFieldKey(key);
  const field = message.embeds?.[embedIdx]?.fields?.[fieldIdx];
  if (!field) return message;
  return updateEmbedField(message, embedIdx, fieldIdx, { ...field, value: next });
}

function parseFieldKey(key: TextareaKey): { embedIdx: number; fieldIdx: number } {
  const parts = key.split('-');
  return {
    embedIdx: Number(parts[1]),
    fieldIdx: Number(parts[2]),
  };
}

export function useAutocomplete(
  message: DiscordMessage,
  onChange: (next: DiscordMessage) => void,
  guildData: GuildData | null,
  templateVariables: TemplateVariable[] = [],
) {
  const [state, setState] = useState<AutocompleteState>(INITIAL);
  const refs = useRef<Map<TextareaKey, HTMLTextAreaElement | null>>(new Map());

  const registerRef = useCallback(
    (key: TextareaKey) => (el: HTMLTextAreaElement | null) => {
      refs.current.set(key, el);
    },
    [],
  );

  const close = useCallback(() => setState((s) => ({ ...s, show: false })), []);

  const buildOptions = useCallback(
    (query: string, trigger: AutocompleteTrigger): AutocompleteOption[] => {
      const q = query.toLowerCase();

      switch (trigger) {
        case '{':
          return templateVariables
            .filter((variable) => variable.name.toLowerCase().includes(q))
            .slice(0, MAX_TEMPLATE_VARIABLES)
            .map<AutocompleteOption>((variable) => ({
              type: 'template',
              id: variable.name,
              name: variable.name,
              display: `{${variable.name}}`,
              description: variable.description,
            }));
        case '@': {
          if (!guildData) return [];
          const users = guildData.users
            .filter((u) => u.username.toLowerCase().includes(q))
            .slice(0, MAX_SUGGESTIONS_PER_GROUP)
            .map<AutocompleteOption>((u) => ({
              type: 'user',
              id: u.user_id,
              name: u.username,
              display: `@${u.username}`,
              avatar: u.avatar,
            }));
          const roles = guildData.roles
            .filter((r) => r.name.toLowerCase().includes(q))
            .slice(0, MAX_SUGGESTIONS_PER_GROUP)
            .map<AutocompleteOption>((r) => ({
              type: 'role',
              id: r.role_id,
              name: r.name,
              display: `@${r.name}`,
              color: r.color,
            }));
          return [...users, ...roles];
        }
        case '#':
          if (!guildData) return [];
          return guildData.channels
            .filter((c) => c.name.toLowerCase().includes(q))
            .slice(0, MAX_CHANNELS)
            .map<AutocompleteOption>((c) => ({
              type: 'channel',
              id: c.channel_id,
              name: c.name,
              display: `#${c.name}`,
            }));
        case ':':
          if (!guildData) return [];
          return guildData.emojis
            .filter((e) => e.name.toLowerCase().includes(q))
            .slice(0, MAX_EMOJIS)
            .map<AutocompleteOption>((e) => ({
              type: 'emoji',
              id: e.emoji_id ?? e.name,
              name: e.name,
              display: `:${e.name}:`,
              animated: e.animated,
            }));
      }
    },
    [guildData, templateVariables],
  );

  const handleChange = useCallback(
    (value: string, key: TextareaKey) => {
      onChange(writeSlice(message, key, value));

      const textarea = refs.current.get(key);
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;
      const before = value.slice(0, cursorPos);
      const match = findActiveMatch(before);
      if (!match) {
        if (state.show) close();
        return;
      }

      const options = buildOptions(match.query, match.trigger);
      if (options.length === 0) {
        if (state.show) close();
        return;
      }

      setState({ show: true, options, cursorPos, activeKey: key });
    },
    [message, onChange, buildOptions, state.show, close],
  );

  const insert = useCallback(
    (option: AutocompleteOption) => {
      const key = state.activeKey;
      if (!key) return;
      const textarea = refs.current.get(key as TextareaKey);
      if (!textarea) return;

      const content = readSlice(message, key as TextareaKey);
      const before = content.slice(0, state.cursorPos);
      const after = content.slice(state.cursorPos);
      const match = findActiveMatch(before);
      if (!match) return;

      const replacement = renderReplacement(option);
      const next = content.slice(0, match.start) + replacement + after;

      onChange(writeSlice(message, key as TextareaKey, next));
      setState(INITIAL);

      // Restore cursor *after* the inserted token. requestAnimationFrame so
      // the textarea has the new value first.
      requestAnimationFrame(() => {
        textarea.focus();
        const caret = match.start + replacement.length;
        textarea.setSelectionRange(caret, caret);
      });
    },
    [message, onChange, state.activeKey, state.cursorPos],
  );

  return useMemo(
    () => ({
      ...state,
      registerRef,
      handleChange,
      insert,
      close,
    }),
    [state, registerRef, handleChange, insert, close],
  );
}

function findActiveMatch(before: string): ActiveMatch | null {
  const mention = before.match(/[@#:](\w*)$/);
  const template = before.match(/\{([a-zA-Z0-9_.]*)$/);
  const match = template ?? mention;
  if (!match) return null;

  return {
    trigger: match[0][0] as AutocompleteTrigger,
    query: match[1],
    start: before.length - match[0].length,
  };
}

function renderReplacement(option: AutocompleteOption): string {
  switch (option.type) {
    case 'template':
      return `{${option.name}}`;
    case 'user':
      return `<@${option.id}>`;
    case 'role':
      return `<@&${option.id}>`;
    case 'channel':
      return `<#${option.id}>`;
    case 'emoji':
      return option.animated
        ? `<a:${option.name}:${option.id}>`
        : `<:${option.name}:${option.id}>`;
  }
}
