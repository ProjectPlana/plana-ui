'use client';

import { memo } from 'react';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';
import type { GuildEmoji, ReactRoleAssignment } from '@/lib/sdk';

interface TriggerEmojiEditorProps {
  index: number;
  guildEmojis: GuildEmoji[];
  reaction: GuildEmoji | null;
  assignment: ReactRoleAssignment;
  onUpdateAssignment: (next: ReactRoleAssignment) => void;
  onUpdateReactions: (reactions: GuildEmoji[]) => void;
  reactions: GuildEmoji[];
}

function TriggerEmojiEditorImpl({
  index,
  guildEmojis,
  reaction,
  assignment,
  onUpdateAssignment,
  onUpdateReactions,
  reactions,
}: TriggerEmojiEditorProps) {
  return (
    <EmojiSelect
      value={reaction}
      onValueChange={(emoji) => {
        const next = [...reactions];
        if (emoji) {
          next[index] = emoji;
          onUpdateAssignment({
            ...assignment,
            trigger_id: emoji.emoji_id || emoji.name,
          });
        } else {
          next.splice(index, 1);
          onUpdateAssignment({ ...assignment, trigger_id: '' });
        }
        onUpdateReactions(next);
      }}
      guildEmojis={guildEmojis}
      placeholder="Choose emoji..."
    />
  );
}

export const TriggerEmojiEditor = memo(TriggerEmojiEditorImpl);
