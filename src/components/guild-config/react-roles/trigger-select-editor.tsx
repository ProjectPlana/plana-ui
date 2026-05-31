'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';
import type {
  GuildEmoji,
  MenuComponent,
  ReactRoleAssignment,
  SelectOption,
} from '@/lib/sdk';
import { selectTriggerId } from './trigger-ids';

interface TriggerSelectEditorProps {
  index: number;
  menu: MenuComponent | undefined;
  option: SelectOption | undefined;
  assignment: ReactRoleAssignment;
  guildEmojis: GuildEmoji[];
  onMenuChange: (menu: MenuComponent) => void;
  onOptionChange: (
    property: keyof SelectOption,
    value: SelectOption[keyof SelectOption],
  ) => void;
  onUpdateAssignment: (assignment: ReactRoleAssignment) => void;
}

function TriggerSelectEditorImpl({
  index,
  menu,
  option,
  assignment,
  guildEmojis,
  onMenuChange,
  onOptionChange,
  onUpdateAssignment,
}: TriggerSelectEditorProps) {
  if (!menu) return null;
  return (
    <div className="space-y-3">
      {index === 0 && (
        <Input
          value={menu.placeholder || ''}
          onChange={(e) => onMenuChange({ ...menu, placeholder: e.target.value })}
          placeholder="Menu placeholder text..."
        />
      )}
      <Input
        value={option?.label || ''}
        onChange={(e) => onOptionChange('label', e.target.value)}
        placeholder="Option label"
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={option?.value || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            onOptionChange('value', newValue);
            // The trigger_id has to track the option value so the bot can
            // resolve "user picked option X" back to a role assignment.
            onUpdateAssignment({
              ...assignment,
              trigger_id: selectTriggerId(menu.custom_id, newValue),
            });
          }}
          placeholder="option_value"
        />
        <EmojiSelect
          value={option?.emoji || null}
          onValueChange={(emoji) => onOptionChange('emoji', emoji || undefined)}
          guildEmojis={guildEmojis}
          placeholder="Emoji (optional)"
        />
      </div>
    </div>
  );
}

export const TriggerSelectEditor = memo(TriggerSelectEditorImpl);
