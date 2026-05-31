import { describe, expect, it } from 'vitest';
import { addAssignment, removeAssignment } from './trigger-mutations';
import type { ExtendedReactRole } from './types';

function selectRole(): ExtendedReactRole {
  return {
    guild_id: '1',
    message_id: '2',
    name: 'Roles',
    role_assignments: [],
    mode: 'toggle',
    enabled: true,
    triggerType: 'select',
    components: [],
  };
}

describe('reaction role trigger mutations', () => {
  it('removes select options whose value contains hyphens', () => {
    const withOption = addAssignment(selectRole());
    const menu = withOption.components?.[0];
    expect(menu && 'options' in menu).toBe(true);
    if (!menu || !('options' in menu)) throw new Error('expected menu component');

    const value = 'news-alerts-us-east';
    const role = {
      ...withOption,
      components: [
        {
          ...menu,
          options: [{ ...menu.options[0], value }],
        },
      ],
      role_assignments: [
        {
          ...withOption.role_assignments[0],
          trigger_id: `${menu.custom_id}-${value}`,
        },
      ],
    };

    const updated = removeAssignment(role, 0);

    expect(updated.role_assignments).toEqual([]);
    expect(updated.components).toEqual([]);
  });
});
