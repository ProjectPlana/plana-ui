/**
 * Pure helpers that transform an :class:`ExtendedReactRole` when assignments
 * are added, removed, or the trigger type changes.
 */

import type {
  ButtonComponent,
  GuildEmoji,
  MenuComponent,
  ReactRoleAssignment,
} from '@/lib/sdk';
import { selectOptionValueFromTrigger, selectTriggerId } from './trigger-ids';
import type { ExtendedReactRole, TriggerType } from './types';

function uniqueToken(): string {
  const randomId = globalThis.crypto?.randomUUID?.().replaceAll('-', '');
  return randomId ?? `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export function changeTriggerType(
  role: ExtendedReactRole,
  next: TriggerType,
): ExtendedReactRole {
  return {
    ...role,
    triggerType: next,
    components: [],
    reactions: [],
    role_assignments: [],
  };
}

export function addAssignment(role: ExtendedReactRole): ExtendedReactRole {
  switch (role.triggerType) {
    case 'emoji':
      return addEmojiAssignment(role);
    case 'button':
      return addButtonAssignment(role);
    case 'select':
      return addSelectAssignment(role);
  }
}

function addEmojiAssignment(role: ExtendedReactRole): ExtendedReactRole {
  const defaultEmoji: GuildEmoji = { name: '🎮', animated: false };
  const assignment: ReactRoleAssignment = { role_ids: [], trigger_id: '🎮' };
  return {
    ...role,
    reactions: [...(role.reactions ?? []), defaultEmoji],
    role_assignments: [...role.role_assignments, assignment],
  };
}

function addButtonAssignment(role: ExtendedReactRole): ExtendedReactRole {
  const buttonIndex = role.role_assignments.length + 1;
  const buttonId = `btn_${uniqueToken()}`;
  const button: ButtonComponent = {
    custom_id: buttonId,
    label: `Button ${buttonIndex}`,
    style: 1,
  };
  return {
    ...role,
    components: [...(role.components ?? []), button],
    role_assignments: [
      ...role.role_assignments,
      { role_ids: [], trigger_id: buttonId },
    ],
  };
}

function addSelectAssignment(role: ExtendedReactRole): ExtendedReactRole {
  const existingMenu = role.components?.[0] as MenuComponent | undefined;

  if (!existingMenu) {
    const menuId = `menu_${uniqueToken()}`;
    const optionValue = `option_${uniqueToken()}`;
    const menu: MenuComponent = {
      custom_id: menuId,
      placeholder: 'Select your roles...',
      min_values: 1,
      max_values: 1,
      options: [{ label: 'Option 1', value: optionValue, default: false }],
    };
    return {
      ...role,
      components: [menu],
      role_assignments: [
        ...role.role_assignments,
        { role_ids: [], trigger_id: selectTriggerId(menuId, optionValue) },
      ],
    };
  }

  const optionIndex = existingMenu.options.length + 1;
  const optionValue = `option_${uniqueToken()}`;
  const updatedMenu: MenuComponent = {
    ...existingMenu,
    options: [
      ...existingMenu.options,
      { label: `Option ${optionIndex}`, value: optionValue, default: false },
    ],
  };
  return {
    ...role,
    components: [updatedMenu],
    role_assignments: [
      ...role.role_assignments,
      { role_ids: [], trigger_id: selectTriggerId(existingMenu.custom_id, optionValue) },
    ],
  };
}

export function removeAssignment(
  role: ExtendedReactRole,
  index: number,
): ExtendedReactRole {
  const assignment = role.role_assignments[index];
  if (!assignment) return role;
  const newAssignments = role.role_assignments.filter((_, i) => i !== index);

  if (role.triggerType === 'emoji') {
    return {
      ...role,
      reactions: (role.reactions ?? []).filter((_, i) => i !== index),
      role_assignments: newAssignments,
    };
  }

  if (role.triggerType === 'select') {
    const menu = role.components?.[0] as MenuComponent | undefined;
    if (menu) {
      const optionValue = selectOptionValueFromTrigger(
        assignment.trigger_id,
        menu.custom_id,
      );
      if (optionValue === null) {
        return { ...role, role_assignments: newAssignments };
      }
      const remaining = menu.options.filter((opt) => opt.value !== optionValue);
      return {
        ...role,
        components: remaining.length > 0 ? [{ ...menu, options: remaining }] : [],
        role_assignments: newAssignments,
      };
    }
  }

  if (role.triggerType === 'button') {
    return {
      ...role,
      components:
        role.components?.filter((c) => c.custom_id !== assignment.trigger_id) ?? [],
      role_assignments: newAssignments,
    };
  }

  return { ...role, role_assignments: newAssignments };
}

export function updateAssignment(
  role: ExtendedReactRole,
  index: number,
  assignment: ReactRoleAssignment,
): ExtendedReactRole {
  const newAssignments = [...role.role_assignments];
  newAssignments[index] = assignment;
  return { ...role, role_assignments: newAssignments };
}
