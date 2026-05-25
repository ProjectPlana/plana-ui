'use client';

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Menu, MousePointer, Smile, X } from 'lucide-react';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import type {
  ButtonComponent,
  GuildData,
  MenuComponent,
  ReactRoleAssignment,
  SelectOption,
} from '@/lib/sdk';
import type { ExtendedReactRole, TriggerType } from './types';
import { TriggerButtonEditor } from './trigger-button-editor';
import { TriggerEmojiEditor } from './trigger-emoji-editor';
import { TriggerSelectEditor } from './trigger-select-editor';

interface RoleAssignmentCardProps {
  assignment: ReactRoleAssignment;
  index: number;
  triggerType: TriggerType;
  reactRole: ExtendedReactRole;
  guildData: GuildData | null;
  onUpdate: (assignment: ReactRoleAssignment) => void;
  onRemove: () => void;
  onChange: (reactRole: ExtendedReactRole) => void;
}

function RoleAssignmentCardImpl({
  assignment,
  index,
  triggerType,
  reactRole,
  guildData,
  onUpdate,
  onRemove,
  onChange,
}: RoleAssignmentCardProps) {
  const updateButtonProperty = useCallback(
    (property: keyof ButtonComponent, value: ButtonComponent[keyof ButtonComponent]) => {
      const components = reactRole.components ?? [];
      const buttonIndex = components.findIndex(
        (c) => c.custom_id === assignment.trigger_id,
      );
      if (buttonIndex === -1) return;
      const button = components[buttonIndex] as ButtonComponent;
      const updated = { ...button, [property]: value };
      const next = [...components];
      next[buttonIndex] = updated;
      onChange({ ...reactRole, components: next });
    },
    [assignment.trigger_id, onChange, reactRole],
  );

  const updateOptionProperty = useCallback(
    (property: keyof SelectOption, value: SelectOption[keyof SelectOption]) => {
      const menu = reactRole.components?.[0] as MenuComponent | undefined;
      if (!menu) return;
      const [, optionValue] = assignment.trigger_id.split('-');
      const optIndex = menu.options.findIndex((o) => o.value === optionValue);
      if (optIndex === -1) return;
      const options = [...menu.options];
      options[optIndex] = { ...options[optIndex], [property]: value };
      onChange({ ...reactRole, components: [{ ...menu, options }] });
    },
    [assignment.trigger_id, onChange, reactRole],
  );

  const updateMenu = useCallback(
    (menu: MenuComponent) => onChange({ ...reactRole, components: [menu] }),
    [onChange, reactRole],
  );

  const updateReactions = useCallback(
    (reactions: ExtendedReactRole['reactions']) =>
      onChange({ ...reactRole, reactions }),
    [onChange, reactRole],
  );

  const Icon =
    triggerType === 'emoji' ? Smile : triggerType === 'button' ? MousePointer : Menu;
  const triggerLabel =
    triggerType === 'emoji'
      ? 'Emoji'
      : triggerType === 'button'
      ? 'Button'
      : 'Menu Option';
  const headerLabel =
    triggerType === 'emoji'
      ? `Emoji ${index + 1}`
      : triggerType === 'button'
      ? `Button ${index + 1}`
      : `Option ${index + 1}`;

  return (
    <div className="group relative p-4 border border-muted-foreground/10 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
            <Icon className="h-3 w-3 text-primary" />
          </div>
          <span className="text-sm font-medium">{headerLabel}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
          aria-label="Remove assignment"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">{triggerLabel}</Label>
          {triggerType === 'emoji' && (
            <TriggerEmojiEditor
              index={index}
              guildEmojis={guildData?.emojis ?? []}
              reaction={reactRole.reactions?.[index] ?? null}
              reactions={reactRole.reactions ?? []}
              assignment={assignment}
              onUpdateAssignment={onUpdate}
              onUpdateReactions={updateReactions}
            />
          )}
          {triggerType === 'button' && (
            <TriggerButtonEditor
              button={
                reactRole.components?.find(
                  (c) => c.custom_id === assignment.trigger_id,
                ) as ButtonComponent | undefined
              }
              guildEmojis={guildData?.emojis ?? []}
              onChange={updateButtonProperty}
            />
          )}
          {triggerType === 'select' && (
            <TriggerSelectEditor
              index={index}
              menu={reactRole.components?.[0] as MenuComponent | undefined}
              option={(() => {
                const menu = reactRole.components?.[0] as MenuComponent | undefined;
                if (!menu) return undefined;
                const [, optionValue] = assignment.trigger_id.split('-');
                return menu.options.find((o) => o.value === optionValue);
              })()}
              assignment={assignment}
              guildEmojis={guildData?.emojis ?? []}
              onMenuChange={updateMenu}
              onOptionChange={updateOptionProperty}
              onUpdateAssignment={onUpdate}
            />
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Target Roles</Label>
          <RoleMultiSelect
            roles={guildData?.roles ?? []}
            value={assignment.role_ids}
            onValueChange={(value) => onUpdate({ ...assignment, role_ids: value })}
            placeholder="Select roles..."
          />
          {assignment.role_ids.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {assignment.role_ids.length} role
              {assignment.role_ids.length === 1 ? '' : 's'} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const RoleAssignmentCard = memo(RoleAssignmentCardImpl);
