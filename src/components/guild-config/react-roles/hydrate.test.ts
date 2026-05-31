import { describe, expect, it } from 'vitest';
import { inferTriggerType } from './hydrate';
import type { GuildMessage, ReactRole } from '@/lib/sdk';

function reactRole(triggerId: string): ReactRole {
  return {
    guild_id: '1',
    message_id: '2',
    name: 'Roles',
    role_assignments: [{ role_ids: ['10'], trigger_id: triggerId }],
    mode: 'toggle',
    enabled: true,
  };
}

describe('reaction role hydration', () => {
  it('uses message components before legacy trigger-id inference', () => {
    const message: GuildMessage = {
      guild_id: '1',
      channel_id: '3',
      message_id: '2',
      published: true,
      components: [
        {
          custom_id: 'btn_one',
          label: 'Join',
          style: 1,
        },
      ],
    };

    expect(inferTriggerType(reactRole('menu-news-alerts'), message)).toBe('button');
  });

  it('identifies select menus from message components', () => {
    const message: GuildMessage = {
      guild_id: '1',
      channel_id: '3',
      message_id: '2',
      published: true,
      components: [
        {
          custom_id: 'menu_one',
          placeholder: 'Pick one',
          min_values: 1,
          max_values: 1,
          options: [{ label: 'News', value: 'news-alerts', default: false }],
        },
      ],
    };

    expect(inferTriggerType(reactRole('🔥'), message)).toBe('select');
  });
});
