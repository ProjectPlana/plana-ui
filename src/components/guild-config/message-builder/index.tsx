'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGuild } from '@/contexts/guild-context';
import type { DiscordMessage, MessageEmbed } from '@/lib/sdk';
import { FileText, Palette, Plus } from 'lucide-react';

import { Composer } from './composer';
import { EmbedEditor } from './embed-editor';
import type { EmbedField } from './embed-field-editor';
import { Preview } from './preview';
import type { TemplateVariable, TextareaKey } from './types';
import { useAutocomplete } from './use-autocomplete';
import {
  addEmbed,
  addEmbedField,
  removeEmbed,
  removeEmbedField,
  updateEmbedAt,
  updateEmbedField,
} from './utils';

const CONTENT_LIMIT = 2000;

interface MessageBuilderProps {
  message: DiscordMessage;
  onChange: (message: DiscordMessage) => void;
  placeholder?: string;
  showPreview?: boolean;
  guildId: string;
  templateVariables?: TemplateVariable[];
}

/**
 * `MessageBuilder` — the public API used by every message-editing tab.
 *
 * Renders a two-column compose-and-preview UI. State for autocomplete (popup
 * visibility, options, cursor position, active textarea) lives in the
 * `useAutocomplete` hook so the embed editor and field editor can be
 * `React.memo`'d without losing autocomplete behavior.
 */
export function MessageBuilder({
  message,
  onChange,
  placeholder,
  showPreview = true,
  guildId,
  templateVariables = [],
}: MessageBuilderProps) {
  const { guildData } = useGuild();
  const ac = useAutocomplete(message, onChange, guildData, templateVariables);

  const popup = {
    show: ac.show,
    activeKey: ac.activeKey,
    options: ac.options,
    onSelect: ac.insert,
  };

  // ---- embed CRUD wired into the public `onChange` ----------------------
  const handleAddEmbed = useCallback(() => onChange(addEmbed(message)), [message, onChange]);
  const handleRemoveEmbed = useCallback(
    (index: number) => onChange(removeEmbed(message, index)),
    [message, onChange],
  );
  const handleUpdateEmbed = useCallback(
    (index: number, embed: MessageEmbed) =>
      onChange(updateEmbedAt(message, index, () => embed)),
    [message, onChange],
  );
  const handleAddField = useCallback(
    (embedIndex: number) => onChange(addEmbedField(message, embedIndex)),
    [message, onChange],
  );
  const handleUpdateField = useCallback(
    (embedIndex: number, fieldIndex: number, field: EmbedField) =>
      onChange(updateEmbedField(message, embedIndex, fieldIndex, field)),
    [message, onChange],
  );
  const handleRemoveField = useCallback(
    (embedIndex: number, fieldIndex: number) =>
      onChange(removeEmbedField(message, embedIndex, fieldIndex)),
    [message, onChange],
  );

  const onMainChange = useCallback(
    (value: string) => ac.handleChange(value, 'main'),
    [ac],
  );
  const registerRef = useCallback(
    (key: TextareaKey) => ac.registerRef(key),
    [ac],
  );
  const onTextChange = useCallback(
    (value: string, key: TextareaKey) => ac.handleChange(value, key),
    [ac],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Compose</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {message.content?.length ?? 0}/{CONTENT_LIMIT} characters
          </div>
        </div>

        <Composer
          content={message.content ?? ''}
          placeholder={placeholder}
          charLimit={CONTENT_LIMIT}
          supportsTemplateVariables={templateVariables.length > 0}
          onChange={onMainChange}
          registerRef={ac.registerRef('main')}
          popup={
            popup.show && popup.activeKey === 'main'
              ? { show: true, options: popup.options, onSelect: popup.onSelect }
              : { show: false, options: [], onSelect: () => {} }
          }
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Embeds
                </CardTitle>
                <CardDescription>Add rich embeds to your message</CardDescription>
              </div>
              <Button onClick={handleAddEmbed} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Embed
              </Button>
            </div>
          </CardHeader>

          {message.embeds && message.embeds.length > 0 && (
            <CardContent className="space-y-6">
              {message.embeds.map((embed, embedIndex) => (
                <EmbedEditor
                  key={embedIndex}
                  embedIndex={embedIndex}
                  embed={embed}
                  guildId={guildId}
                  popup={popup}
                  onChange={(next) => handleUpdateEmbed(embedIndex, next)}
                  onRemove={() => handleRemoveEmbed(embedIndex)}
                  onAddField={() => handleAddField(embedIndex)}
                  onUpdateField={(fieldIndex, field) =>
                    handleUpdateField(embedIndex, fieldIndex, field)
                  }
                  onRemoveField={(fieldIndex) => handleRemoveField(embedIndex, fieldIndex)}
                  registerRef={registerRef}
                  onTextChange={onTextChange}
                />
              ))}
            </CardContent>
          )}
        </Card>
      </div>

      {showPreview && <Preview message={message} guildData={guildData} />}
    </div>
  );
}
