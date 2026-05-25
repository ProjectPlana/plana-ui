'use client';

import React, { useEffect, useState } from 'react';
import {
  AutomodAction,
  AutomodActionType,
  AutomodRule,
  AutomodRuleType,
  AutomodScopeType,
  GuildCategory,
  GuildData,
} from '@/lib/sdk';
import { cn } from '@/lib/utils';
import { useGuild } from '@/contexts/guild-context';
import {
  useAutomodRulesQuery,
  useCreateAutomodRuleMutation,
  useDeleteAutomodRuleMutation,
  useUpdateAutomodRuleMutation,
} from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { ChannelMultiSelect } from '@/components/plana-ui/channel-multi-select';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Folder,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface GuildAutomodTabProps {
  guildId: string;
}

type AutomodDraft = AutomodRule & { client_id?: string };

const RULE_TYPE_LABELS: Record<AutomodRuleType, string> = {
  spam: 'Spam (rapid messages)',
  invite_link: 'Invite link block',
  mass_mention: 'Mass mention',
  profanity: 'Profanity (keyword list)',
  link: 'Any URL',
  caps: 'Excessive caps',
  duplicate: 'Repeated message',
  raid: 'Member-join surge (raid)',
  image_only: 'Image-only channel',
  video_only: 'Video-only channel',
  commands_only: 'Commands-only channel',
};

const ACTION_TYPE_LABELS: Record<AutomodActionType, string> = {
  delete: 'Delete the message',
  warn: 'Warn the user',
  timeout: 'Timeout the user',
  kick: 'Kick the user',
  ban: 'Ban the user',
  log: 'Log only (no action)',
};

const RULE_TYPE_HINTS: Record<AutomodRuleType, string> = {
  spam: 'Trigger when threshold messages are sent within window seconds.',
  invite_link: 'Match discord.gg / discord.com/invite links.',
  mass_mention: 'Trigger when one message contains ≥ threshold mentions.',
  profanity: 'Match any keyword from the list (case-insensitive).',
  link: 'Match any http/https URL.',
  caps: 'Trigger when ≥ threshold% of letters are uppercase (min 8 chars).',
  duplicate: 'Trigger when the same message is sent twice within window seconds.',
  raid: 'Trigger when ≥ threshold members join within window seconds.',
  image_only: 'Delete messages without an image attachment or image embed.',
  video_only: 'Delete messages without a video attachment or video embed.',
  commands_only: 'Delete regular messages and allow only valid bot commands.',
};

const SCOPE_LABELS: Record<AutomodScopeType, string> = {
  server: 'Server-wide',
  category: 'Selected categories',
  channel: 'Selected channels',
};

function defaultRule(guildId: string): AutomodRule {
  return {
    guild_id: guildId,
    name: 'New rule',
    type: 'invite_link',
    enabled: true,
    scope_type: 'server',
    scope_ids: [],
    threshold: 5,
    window_seconds: 10,
    keywords: [],
    exempt_channels: [],
    exempt_categories: [],
    exempt_roles: [],
    log_channel_id: null,
    actions: [{ type: 'delete' }],
  };
}

export function GuildAutomodTab({ guildId }: GuildAutomodTabProps) {
  const { guildData } = useGuild();
  const rulesQuery = useAutomodRulesQuery(guildId);
  const createRule = useCreateAutomodRuleMutation(guildId);
  const updateRule = useUpdateAutomodRuleMutation(guildId);
  const deleteRule = useDeleteAutomodRuleMutation(guildId);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});
  const [pendingRules, setPendingRules] = useState<AutomodDraft[]>([]);
  const rules = rulesQuery.data?.data ?? [];
  const visibleRules: AutomodDraft[] = [...pendingRules, ...rules];
  const filteredRules = visibleRules.filter((rule) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [
      rule.name,
      rule.type,
      RULE_TYPE_LABELS[rule.type],
      rule.scope_type ?? 'server',
      ...(rule.actions ?? []).map((action) => action.type),
    ]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });

  function handleAdd() {
    const clientId = `automod-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPendingRules((current) => [{ ...defaultRule(guildId), client_id: clientId }, ...current]);
    setExpandedRules((prev) => ({ ...prev, [clientId]: true }));
  }

  function ruleKey(rule: AutomodDraft, index: number) {
    return rule.id ?? rule.client_id ?? `${rule.name}-${index}`;
  }

  function setRuleExpanded(key: string, value: boolean) {
    setExpandedRules((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(rule: AutomodDraft) {
    const trimmedName = rule.name.trim();
    if (!trimmedName) {
      toast.error('Rule name is required');
      return;
    }

    const key = rule.id ?? rule.client_id ?? null;
    setSavingId(key);
    try {
      const payload = { ...rule, name: trimmedName };
      delete payload.client_id;
      const updated = rule.id
        ? await updateRule.mutateAsync(payload)
        : await createRule.mutateAsync(payload);
      if (!rule.id) {
        setPendingRules((current) => current.filter((item) => item.client_id !== rule.client_id));
      }
      toast.success(`Saved "${updated.name}"`);
    } catch (error) {
      console.error('Failed to save automod rule:', error);
      toast.error('Failed to save rule');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(rule: AutomodDraft) {
    if (!rule.id) {
      setPendingRules((current) => current.filter((item) => item.client_id !== rule.client_id));
      return;
    }
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await deleteRule.mutateAsync(rule.id);
      toast.success('Rule deleted');
    } catch (error) {
      console.error('Failed to delete automod rule:', error);
      toast.error('Failed to delete rule');
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Automod</h2>
              <p className="text-sm text-muted-foreground">
                Auto-detect and act on spam, invites, mass mentions, profanity, raids, and more.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => rulesQuery.refetch()} variant="outline" disabled={rulesQuery.isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${rulesQuery.isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add rule
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Total rules" value={visibleRules.length} />
          <Stat
            label="Enabled"
            value={visibleRules.filter((r) => r.enabled).length}
            tone="positive"
          />
          <Stat
            label="Disabled"
            value={visibleRules.filter((r) => !r.enabled).length}
            tone="muted"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search by name, rule type, scope, or action"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setExpandedRules(
                  Object.fromEntries(visibleRules.map((rule, index) => [ruleKey(rule, index), true])),
                )
              }
            >
              Expand all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setExpandedRules(
                  Object.fromEntries(visibleRules.map((rule, index) => [ruleKey(rule, index), false])),
                )
              }
            >
              Collapse all
            </Button>
          </div>
        </div>
      </div>

      {/* List */}
      {rulesQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent>
        </Card>
      ) : visibleRules.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="font-medium mb-1">No rules configured</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first automod rule to start protecting the server.
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRules.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No automod rules match this search.
              </CardContent>
            </Card>
          ) : (
            filteredRules.map((rule, index) => {
              const key = ruleKey(rule, index);
              return (
                <RuleCard
                  key={key}
                  rule={rule}
                  guildData={guildData}
                  saving={savingId === (rule.id ?? rule.client_id)}
                  expanded={expandedRules[key] ?? index === 0}
                  onExpandedChange={(value) => setRuleExpanded(key, value)}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'positive' | 'muted';
}) {
  const colour =
    tone === 'positive'
      ? 'text-green-600'
      : tone === 'muted'
      ? 'text-muted-foreground'
      : 'text-foreground';
  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <div className="text-sm font-medium mb-1">{label}</div>
      <p className={`text-2xl font-bold ${colour}`}>{value}</p>
    </div>
  );
}

interface RuleCardProps {
  rule: AutomodDraft;
  guildData: GuildData | null;
  saving: boolean;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onSave: (rule: AutomodDraft) => void;
  onDelete: (rule: AutomodDraft) => void;
}

function normalizeRule(rule: AutomodDraft): AutomodDraft {
  return {
    ...rule,
    scope_type: rule.scope_type ?? 'server',
    scope_ids: rule.scope_ids ?? [],
    keywords: rule.keywords ?? [],
    exempt_channels: rule.exempt_channels ?? [],
    exempt_categories: rule.exempt_categories ?? [],
    exempt_roles: rule.exempt_roles ?? [],
    actions: rule.actions ?? [],
  };
}

function isRestrictedRule(type: AutomodRuleType) {
  return type === 'image_only' || type === 'video_only' || type === 'commands_only';
}

function isRestrictedAction(type: AutomodActionType) {
  return type === 'kick' || type === 'ban';
}

function RuleCard({
  rule,
  guildData,
  saving,
  expanded,
  onExpandedChange,
  onSave,
  onDelete,
}: RuleCardProps) {
  const normalizedRule = normalizeRule(rule);
  const [draft, setDraft] = useState<AutomodDraft>(normalizedRule);
  const dirty = JSON.stringify(draft) !== JSON.stringify(normalizedRule);

  useEffect(() => {
    setDraft(normalizeRule(rule));
  }, [rule]);

  function patch<K extends keyof AutomodRule>(key: K, value: AutomodRule[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function patchScope(scopeType: AutomodScopeType) {
    setDraft((prev) => ({ ...prev, scope_type: scopeType, scope_ids: [] }));
  }

  function patchRuleType(type: AutomodRuleType) {
    setDraft((prev) => {
      const actions = isRestrictedRule(type)
        ? prev.actions.filter((action) => !isRestrictedAction(action.type))
        : prev.actions;
      return { ...prev, type, actions: actions.length > 0 ? actions : [{ type: 'delete' }] };
    });
  }

  const scopeSummary =
    draft.scope_type === 'server'
      ? SCOPE_LABELS.server
      : `${draft.scope_ids.length} ${draft.scope_type === 'category' ? 'categories' : 'channels'}`;
  const showTuning = !isRestrictedRule(draft.type);

  return (
    <Collapsible open={expanded} onOpenChange={onExpandedChange}>
      <Card>
        <CardHeader className="border-b bg-card/95">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  {expanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <div className="min-w-0 space-y-1">
                <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                  <span className="truncate">
                    {draft.name || <span className="text-muted-foreground italic">Untitled rule</span>}
                  </span>
                  <Badge variant={draft.enabled ? 'default' : 'secondary'}>
                    {draft.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                  <Badge variant="outline">{RULE_TYPE_LABELS[draft.type]}</Badge>
                  <Badge variant="secondary">{scopeSummary}</Badge>
                  {dirty && <Badge variant="outline">Unsaved</Badge>}
                </CardTitle>
                <CardDescription>{RULE_TYPE_HINTS[draft.type]}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={draft.enabled}
                onCheckedChange={(v) => patch('enabled', v)}
                aria-label="Enable rule"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!dirty || saving}
                onClick={() => setDraft(normalizedRule)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" disabled={!dirty || saving} onClick={() => onSave(draft)}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(rule)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-5">
                <Label>Rule name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) => patch('name', e.target.value)}
                  placeholder="e.g. Block invite spam"
                />
              </div>
              <div className="space-y-2 lg:col-span-4">
                <Label>Rule type</Label>
                <Select
                  value={draft.type}
                  onValueChange={patchRuleType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(RULE_TYPE_LABELS) as AutomodRuleType[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {RULE_TYPE_LABELS[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showTuning && (
                <>
                  <div className="space-y-2 lg:col-span-1">
                    <Label>Threshold</Label>
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={draft.threshold}
                      onChange={(e) =>
                        patch('threshold', Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <Label>Window</Label>
                    <Input
                      type="number"
                      min={1}
                      max={600}
                      value={draft.window_seconds}
                      onChange={(e) =>
                        patch('window_seconds', Math.max(1, Number(e.target.value) || 1))
                      }
                    />
                  </div>
                </>
              )}
            </div>

            {draft.type === 'profanity' && (
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={draft.keywords.join(', ')}
                  onChange={(e) =>
                    patch(
                      'keywords',
                      e.target.value
                        .split(',')
                        .map((k) => k.trim().toLowerCase())
                        .filter(Boolean),
                    )
                  }
                  placeholder="badword, slur, ..."
                />
                <p className="text-xs text-muted-foreground">
                  Up to 500 keywords. Matched anywhere in the message body.
                </p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-3">
                <Label>Scope</Label>
                <Select
                  value={draft.scope_type}
                  onValueChange={(value: AutomodScopeType) => patchScope(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SCOPE_LABELS) as AutomodScopeType[]).map((scope) => (
                      <SelectItem key={scope} value={scope}>
                        {SCOPE_LABELS[scope]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 lg:col-span-9">
                <Label>Scope targets</Label>
                {draft.scope_type === 'server' ? (
                  <div className="flex min-h-10 items-center rounded-md border px-3 text-sm text-muted-foreground">
                    Applies across the whole server unless an exemption matches.
                  </div>
                ) : draft.scope_type === 'category' ? (
                  <CategoryMultiSelect
                    categories={guildData?.categories ?? []}
                    value={draft.scope_ids}
                    onValueChange={(v) => patch('scope_ids', v)}
                    placeholder="Select categories covered by this rule"
                  />
                ) : (
                  <ChannelMultiSelect
                    channels={guildData?.channels ?? []}
                    categories={guildData?.categories ?? []}
                    value={draft.scope_ids}
                    onValueChange={(v) => patch('scope_ids', v)}
                    placeholder="Select channels covered by this rule"
                  />
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="space-y-2 lg:col-span-4">
                <Label>Exempt channels</Label>
                <ChannelMultiSelect
                  channels={guildData?.channels ?? []}
                  categories={guildData?.categories ?? []}
                  value={draft.exempt_channels}
                  onValueChange={(v) => patch('exempt_channels', v)}
                  placeholder="Channels never matched"
                />
              </div>
              <div className="space-y-2 lg:col-span-4">
                <Label>Exempt categories</Label>
                <CategoryMultiSelect
                  categories={guildData?.categories ?? []}
                  value={draft.exempt_categories}
                  onValueChange={(v) => patch('exempt_categories', v)}
                  placeholder="Categories never matched"
                />
              </div>
              <div className="space-y-2 lg:col-span-4">
                <Label>Exempt roles</Label>
                <RoleMultiSelect
                  roles={guildData?.roles ?? []}
                  value={draft.exempt_roles}
                  onValueChange={(v) => patch('exempt_roles', v)}
                  placeholder="Roles that bypass this rule"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Log channel</Label>
              <ChannelSelect
                channels={guildData?.channels ?? []}
                categories={guildData?.categories ?? []}
                value={draft.log_channel_id ?? null}
                onValueChange={(v) => patch('log_channel_id', v || null)}
                placeholder="Optional - log every triggered action here"
              />
            </div>

            <Separator />

            <ActionsEditor
              ruleType={draft.type}
              actions={draft.actions}
              onChange={(actions) => patch('actions', actions)}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface CategoryMultiSelectProps {
  categories: GuildCategory[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
}

function CategoryMultiSelect({
  categories,
  value = [],
  onValueChange,
  placeholder = 'Select categories',
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
  const selectedCategories = value
    .map((categoryId) => categories.find((category) => category.category_id === categoryId))
    .filter(Boolean) as GuildCategory[];

  function toggle(categoryId: string) {
    onValueChange(
      value.includes(categoryId)
        ? value.filter((id) => id !== categoryId)
        : [...value, categoryId],
    );
  }

  function remove(categoryId: string, event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(value.filter((id) => id !== categoryId));
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-h-10 w-full justify-between"
          >
            {selectedCategories.length > 0 ? (
              <span className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4 text-muted-foreground" />
                {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'} selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search categories..." />
            <CommandList>
              <CommandEmpty>No categories found.</CommandEmpty>
              {value.length > 0 && (
                <CommandGroup>
                  <CommandItem
                    value="__clear__"
                    onSelect={() => {
                      onValueChange([]);
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear all selections
                  </CommandItem>
                </CommandGroup>
              )}
              <CommandGroup>
                {sortedCategories.map((category) => {
                  const selected = value.includes(category.category_id);
                  return (
                    <CommandItem
                      key={category.category_id}
                      value={category.name}
                      onSelect={() => toggle(category.category_id)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{category.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCategories.length > 0 && (
        <div className="flex min-h-10 flex-wrap gap-1 rounded-md bg-muted/20 p-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category.category_id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <Folder className="h-3 w-3" />
              <span className="max-w-[140px] truncate text-xs">{category.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-black/10"
                onClick={(event) => remove(category.category_id, event)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

interface ActionsEditorProps {
  ruleType: AutomodRuleType;
  actions: AutomodAction[];
  onChange: (actions: AutomodAction[]) => void;
}

function ActionsEditor({ ruleType, actions, onChange }: ActionsEditorProps) {
  const actionTypes = (Object.keys(ACTION_TYPE_LABELS) as AutomodActionType[]).filter(
    (type) => !isRestrictedRule(ruleType) || !isRestrictedAction(type),
  );

  function update(idx: number, patch: Partial<AutomodAction>) {
    onChange(actions.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  }

  function remove(idx: number) {
    onChange(actions.filter((_, i) => i !== idx));
  }

  function add() {
    onChange([...actions, { type: 'log' }]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Actions</Label>
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" />
          Add action
        </Button>
      </div>
      {actions.length === 0 && (
        <p className="text-sm text-red-500">
          A rule must have at least one action.
        </p>
      )}
      <div className="space-y-2">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 border rounded-lg"
          >
            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs">Type</Label>
              <Select
                value={action.type}
                onValueChange={(v: AutomodActionType) => update(idx, { type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((k) => (
                    <SelectItem key={k} value={k}>
                      {ACTION_TYPE_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <Label className="text-xs">
                {action.type === 'timeout' ? 'Duration (s)' : 'Duration (s, ignored)'}
              </Label>
              <Input
                type="number"
                min={0}
                max={2419200}
                value={action.duration_seconds ?? 0}
                onChange={(e) =>
                  update(idx, {
                    duration_seconds: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                disabled={action.type !== 'timeout'}
              />
            </div>
            <div className="md:col-span-5 space-y-1">
              <Label className="text-xs">Audit log reason</Label>
              <Input
                value={action.reason ?? ''}
                onChange={(e) => update(idx, { reason: e.target.value || undefined })}
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                aria-label="Remove action"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
