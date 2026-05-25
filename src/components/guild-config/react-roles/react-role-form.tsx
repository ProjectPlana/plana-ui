'use client';

import { memo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Hash, Lock, Menu, MousePointer, Plus, Settings, Smile } from 'lucide-react';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import type {
  DiscordMessage,
  GuildData,
  ReactRoleAssignment,
  ReactRoleMode,
} from '@/lib/sdk';
import { MessageBuilder } from '../message-builder';
import { RoleAssignmentCard } from './role-assignment-card';
import {
  addAssignment,
  changeTriggerType as applyTriggerTypeChange,
  removeAssignment,
  updateAssignment,
} from './trigger-mutations';
import { TriggerTypeSelector } from './trigger-type-selector';
import type { ExtendedReactRole, TriggerType } from './types';

interface ReactRoleFormProps {
  reactRole: ExtendedReactRole;
  onChange: (reactRole: ExtendedReactRole) => void;
  onToggleEnabled: (next: boolean) => void;
  guildData: GuildData | null;
  guildId: string;
  isNew: boolean;
  isSaving: boolean;
}

function ReactRoleFormImpl({
  reactRole,
  onChange,
  onToggleEnabled,
  guildData,
  guildId,
  isNew,
  isSaving,
}: ReactRoleFormProps) {
  const channelIsLocked = !isNew && Boolean(reactRole.channel_id);

  const handleNameChange = useCallback(
    (name: string) => onChange({ ...reactRole, name }),
    [onChange, reactRole],
  );

  const handleChannelChange = useCallback(
    (channel_id: string | null) =>
      onChange({ ...reactRole, channel_id: channel_id ?? '' }),
    [onChange, reactRole],
  );

  const handleEnabledToggle = useCallback(
    (enabled: boolean) => {
      if (reactRole.id) onToggleEnabled(enabled);
      else onChange({ ...reactRole, enabled });
    },
    [onChange, onToggleEnabled, reactRole],
  );

  const handleModeChange = useCallback(
    (mode: ReactRoleMode) => onChange({ ...reactRole, mode }),
    [onChange, reactRole],
  );

  const handleMessageChange = useCallback(
    (message: DiscordMessage) =>
      onChange({
        ...reactRole,
        content: message.content,
        embeds: message.embeds,
      }),
    [onChange, reactRole],
  );

  const handleTriggerTypeChange = useCallback(
    (next: TriggerType) => {
      if (
        reactRole.role_assignments.length > 0 &&
        reactRole.triggerType !== next &&
        !confirm(
          'Changing trigger type will clear all existing configurations. Continue?',
        )
      ) {
        return;
      }
      onChange(applyTriggerTypeChange(reactRole, next));
    },
    [onChange, reactRole],
  );

  const handleAddAssignment = useCallback(() => {
    onChange(addAssignment(reactRole));
  }, [onChange, reactRole]);

  const handleUpdateAssignment = useCallback(
    (index: number, assignment: ReactRoleAssignment) =>
      onChange(updateAssignment(reactRole, index, assignment)),
    [onChange, reactRole],
  );

  const handleRemoveAssignment = useCallback(
    (index: number) => onChange(removeAssignment(reactRole, index)),
    [onChange, reactRole],
  );

  const triggerNoun =
    reactRole.triggerType === 'emoji'
      ? 'Emoji'
      : reactRole.triggerType === 'button'
      ? 'Button'
      : 'Option';
  const modeHelp: Record<ReactRoleMode, string> = {
    toggle: 'Add on trigger, remove when the trigger is undone.',
    unique: 'Grant one choice and remove other roles from this configuration.',
    verify: 'Add roles only; removing the trigger does not remove them.',
    remove: 'Remove roles when the trigger is used.',
  };

  return (
    <div className="space-y-6">
      {/* Basic details */}
      <div className="space-y-4 p-4 bg-muted/20 rounded-lg border">
        <div className="space-y-2">
          <Label className="text-foreground">Reaction Role Name</Label>
          <Input
            value={reactRole.name || ''}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter a name for this reaction role system"
            disabled={isSaving}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            A friendly name to identify this reaction role system in the list.
          </p>
        </div>
      </div>

      {/* Channel + status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg border">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Hash className="h-4 w-4" />
            Target Channel
            {channelIsLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </Label>
          <ChannelSelect
            channels={guildData?.channels ?? []}
            categories={guildData?.categories ?? []}
            value={reactRole.channel_id || null}
            onValueChange={handleChannelChange}
            placeholder={channelIsLocked ? 'Channel cannot be changed' : 'Select channel'}
            disabled={channelIsLocked || isSaving}
          />
          <p className="text-xs text-muted-foreground">
            {channelIsLocked
              ? 'Channel cannot be changed once saved.'
              : 'The channel where this reaction role message will be sent.'}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Settings className="h-4 w-4" />
            Assignment Mode
          </Label>
          <Select
            value={reactRole.mode ?? 'toggle'}
            onValueChange={(value) => handleModeChange(value as ReactRoleMode)}
            disabled={isSaving}
          >
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toggle">Toggle</SelectItem>
              <SelectItem value="unique">Unique</SelectItem>
              <SelectItem value="verify">Verify</SelectItem>
              <SelectItem value="remove">Remove</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {modeHelp[reactRole.mode ?? 'toggle']}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Settings className="h-4 w-4" />
            System Status
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={reactRole.enabled}
              onCheckedChange={handleEnabledToggle}
              disabled={isSaving}
            />
            <Label className="text-sm text-muted-foreground">
              {reactRole.enabled ? 'Active' : 'Disabled'}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {reactRole.enabled
              ? 'Reaction role system is active and functioning.'
              : 'Reaction role system is disabled.'}
          </p>
        </div>
      </div>

      {!isNew && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Saved
          </span>
          {reactRole.message_id && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Message ID: {reactRole.message_id}
            </span>
          )}
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <Label className="text-base font-medium text-foreground">Message Content</Label>
        <MessageBuilder
          message={{ content: reactRole.content, embeds: reactRole.embeds }}
          onChange={handleMessageChange}
          placeholder="Enter your reaction role message content..."
          guildId={guildId}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Role Assignment Triggers</Label>
          <p className="text-sm text-muted-foreground">
            Choose how users will trigger role assignments (only one type allowed per
            configuration).
          </p>
        </div>

        <TriggerTypeSelector
          value={reactRole.triggerType}
          onChange={handleTriggerTypeChange}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {reactRole.triggerType === 'emoji' && 'Emoji Assignments'}
                {reactRole.triggerType === 'button' && 'Button Assignments'}
                {reactRole.triggerType === 'select' && 'Menu Options'}
              </Label>
              <p className="text-sm text-muted-foreground">
                Configure triggers and their assigned roles.
              </p>
            </div>
            {reactRole.role_assignments.length > 0 && (
              <Button onClick={handleAddAssignment} size="sm" className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Add {triggerNoun}
              </Button>
            )}
          </div>

          {reactRole.role_assignments.length > 0 ? (
            <div className="space-y-3">
              {reactRole.role_assignments.map((assignment, index) => (
                <RoleAssignmentCard
                  key={index}
                  assignment={assignment}
                  index={index}
                  triggerType={reactRole.triggerType}
                  reactRole={reactRole}
                  guildData={guildData}
                  onUpdate={(next) => handleUpdateAssignment(index, next)}
                  onRemove={() => handleRemoveAssignment(index)}
                  onChange={onChange}
                />
              ))}
            </div>
          ) : (
            <EmptyAssignments
              triggerType={reactRole.triggerType}
              onAdd={handleAddAssignment}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyAssignments({
  triggerType,
  onAdd,
}: {
  triggerType: TriggerType;
  onAdd: () => void;
}) {
  const Icon =
    triggerType === 'emoji' ? Smile : triggerType === 'button' ? MousePointer : Menu;
  const ctaLabel =
    triggerType === 'emoji'
      ? 'Emoji Assignment'
      : triggerType === 'button'
      ? 'Button'
      : 'Menu Option';
  return (
    <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
      <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg mb-2">Ready to create assignments?</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Add {triggerType} triggers that assign roles to users.
      </p>
      <Button onClick={onAdd} size="lg" className="shadow-sm">
        <Plus className="h-5 w-5 mr-2" />
        Create First {ctaLabel}
      </Button>
    </div>
  );
}

export const ReactRoleForm = memo(ReactRoleFormImpl);
