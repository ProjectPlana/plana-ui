'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';
import type { ButtonComponent, GuildEmoji } from '@/lib/sdk';

interface TriggerButtonEditorProps {
  button: ButtonComponent | undefined;
  guildEmojis: GuildEmoji[];
  onChange: (property: keyof ButtonComponent, value: ButtonComponent[keyof ButtonComponent]) => void;
}

function TriggerButtonEditorImpl({
  button,
  guildEmojis,
  onChange,
}: TriggerButtonEditorProps) {
  return (
    <div className="space-y-3">
      <Input
        value={button?.label || ''}
        onChange={(e) => onChange('label', e.target.value)}
        placeholder="Button text"
      />
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={button?.style?.toString() || '1'}
          onValueChange={(value) => onChange('style', Number(value) as ButtonComponent['style'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Primary</SelectItem>
            <SelectItem value="2">Secondary</SelectItem>
            <SelectItem value="3">Success</SelectItem>
            <SelectItem value="4">Danger</SelectItem>
          </SelectContent>
        </Select>
        <EmojiSelect
          value={button?.emoji || null}
          onValueChange={(emoji) => onChange('emoji', emoji || undefined)}
          guildEmojis={guildEmojis}
          placeholder="Emoji (optional)"
        />
      </div>
    </div>
  );
}

export const TriggerButtonEditor = memo(TriggerButtonEditorImpl);
