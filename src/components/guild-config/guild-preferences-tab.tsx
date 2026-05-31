'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGuildPreferencesQuery,
  useResetGuildPreferencesMutation,
  useUpdateGuildPreferencesMutation,
  useManagerRolesQuery,
  useAddManagerRoleMutation,
  useRemoveManagerRoleMutation,
  useUserGuildsQuery,
} from '@/lib/queries';
import { type GuildPreferences, type GuildRole, type DiscordMessage } from '@/lib/sdk';
import {
  Save, RotateCcw, Settings, Palette, Globe,
  Plus, X, Image, Eye, Copy, ShieldCheck, Trash2, Info, UserRound, Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { ImageUploadModal } from '@/components/plana-ui/image-upload-modal';
import { StickyActionBar } from './sticky-action-bar';
import { useGuild } from '@/contexts/guild-context';
import { Preview } from './message-builder/preview';

interface FormData {
  command_prefix: string;
  prefix_commands_enabled: boolean;
  language: string;
  timezone: string;
  embed_color: string;
  embed_footer: string;
  embed_footer_images: string[];
  bot_nickname: string;
  bot_avatar_url: string;
  bot_banner_url: string;
  bot_bio: string;
}

const languages = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
];

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

interface GuildPreferencesTabProps {
  guildId: string;
}

const defaultFormData: FormData = {
  command_prefix: '!',
  prefix_commands_enabled: true,
  language: 'en-US',
  timezone: 'UTC',
  embed_color: '#7289DA',
  embed_footer: 'Project Plana, Powered by S.C.H.A.L.E.',
  embed_footer_images: [],
  bot_nickname: '',
  bot_avatar_url: '',
  bot_banner_url: '',
  bot_bio: '',
};

function preferencesToFormData(preferences: GuildPreferences | null): FormData {
  if (!preferences) return defaultFormData;
  return {
    command_prefix: preferences.command_prefix || defaultFormData.command_prefix,
    prefix_commands_enabled:
      preferences.prefix_commands_enabled ?? defaultFormData.prefix_commands_enabled,
    language: preferences.language || defaultFormData.language,
    timezone: preferences.timezone || defaultFormData.timezone,
    embed_color: preferences.embed_color || defaultFormData.embed_color,
    embed_footer: preferences.embed_footer || defaultFormData.embed_footer,
    embed_footer_images: preferences.embed_footer_images || [],
    bot_nickname: preferences.bot_nickname || '',
    bot_avatar_url: preferences.bot_avatar_url || '',
    bot_banner_url: preferences.bot_banner_url || '',
    bot_bio: preferences.bot_bio || '',
  };
}

function nullableText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function roleColor(color: number): string {
  return color ? `#${color.toString(16).padStart(6, '0')}` : '#99aab5';
}

function hexToDecimal(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  return isNaN(n) ? 0x7289da : n;
}

function buildPreviewMessage(formData: FormData): DiscordMessage {
  return {
    embeds: [
      {
        title: 'Sample Embed',
        description:
          'This is a live preview of how your embeds will look with the current color and footer settings.',
        color: hexToDecimal(formData.embed_color),
        image: formData.embed_footer_images[0] || undefined,
        footer: {
          text: formData.embed_footer || undefined,
        },
        fields: [
          { name: 'Example Field', value: 'Some example content', inline: true },
          { name: 'Another Field', value: 'More content here', inline: true },
        ],
      },
    ],
  };
}

export function GuildPreferencesTab({ guildId }: GuildPreferencesTabProps) {
  const preferencesQuery = useGuildPreferencesQuery(guildId);
  const updatePreferences = useUpdateGuildPreferencesMutation(guildId);
  const resetPreferences = useResetGuildPreferencesMutation(guildId);
  const { guildData } = useGuild();

  // Manager roles
  const { data: managerRoleIds, isLoading: managerRolesLoading } = useManagerRolesQuery(guildId);
  const { data: guilds } = useUserGuildsQuery(true);
  const addManagerRole = useAddManagerRoleMutation(guildId);
  const removeManagerRole = useRemoveManagerRoleMutation(guildId);
  const [selectedManagerRoleId, setSelectedManagerRoleId] = useState('');

  const isAdmin = guilds?.some(g => g.id === guildId) ?? false;
  const managerRoles = (managerRoleIds ?? [])
    .map(id => guildData?.roles.find(r => r.role_id === id))
    .filter((r): r is GuildRole => r !== undefined);
  const availableRoles = (guildData?.roles ?? []).filter(
    r => !(managerRoleIds ?? []).includes(r.role_id),
  );

  // Preferences form
  const preferences = preferencesQuery.data ?? null;
  const [draftFormData, setDraftFormData] = useState<FormData | null>(null);
  const formData = draftFormData ?? preferencesToFormData(preferences);

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
    setDraftFormData(prev => ({ ...(prev ?? formData), [field]: value }));
  };

  const addFooterImage = (url: string) => {
    setDraftFormData(prev => ({
      ...(prev ?? formData),
      embed_footer_images: [...(prev ?? formData).embed_footer_images, url],
    }));
  };

  const removeFooterImage = (index: number) => {
    setDraftFormData(prev => ({
      ...(prev ?? formData),
      embed_footer_images: (prev ?? formData).embed_footer_images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!preferences) return;
    try {
      const payload: Partial<GuildPreferences> = {
        command_prefix: formData.command_prefix,
        prefix_commands_enabled: formData.prefix_commands_enabled,
        language: formData.language,
        timezone: formData.timezone,
        embed_color: formData.embed_color,
        embed_footer: formData.embed_footer,
        embed_footer_images: formData.embed_footer_images,
        bot_nickname: nullableText(formData.bot_nickname),
        bot_avatar_url: nullableText(formData.bot_avatar_url),
        bot_banner_url: nullableText(formData.bot_banner_url),
        bot_bio: nullableText(formData.bot_bio),
      };

      const updated = await updatePreferences.mutateAsync(payload);
      setDraftFormData(preferencesToFormData(updated));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings. Please try again.');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      return;
    }
    try {
      await resetPreferences.mutateAsync();
      setDraftFormData(null);
      toast.success('Settings reset to defaults successfully!');
    } catch {
      toast.error('Failed to reset settings. Please try again.');
    }
  };

  const saving = updatePreferences.isPending || resetPreferences.isPending;

  if (!preferences) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          General Settings
        </h2>
        <p className="text-muted-foreground">
          Configure basic bot behavior and appearance settings
        </p>
      </div>

      <StickyActionBar>
        <Button variant="destructive" onClick={handleReset} disabled={saving}>
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </StickyActionBar>

      {/* ── Top row: Bot Config · Manager Roles · Language & Region ── */}
      <div className="grid gap-6 md:grid-cols-3">

        {/* Bot Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Bot Configuration
            </CardTitle>
            <CardDescription>Basic bot behavior settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="command_prefix">Command Prefix</Label>
              <Input
                id="command_prefix"
                value={formData.command_prefix}
                onChange={e => handleInputChange('command_prefix', e.target.value)}
                placeholder="!"
                maxLength={5}
                disabled={!formData.prefix_commands_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Prefix used before bot commands (e.g., !help)
              </p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded border p-3">
              <div className="space-y-1">
                <Label htmlFor="prefix_commands_enabled">Prefix Commands</Label>
                <p className="text-xs text-muted-foreground">
                  Disable text commands when you only want slash commands.
                </p>
              </div>
              <Switch
                id="prefix_commands_enabled"
                checked={formData.prefix_commands_enabled}
                onCheckedChange={checked =>
                  handleInputChange('prefix_commands_enabled', checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Manager Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Manager Roles
            </CardTitle>
            <CardDescription>Roles with full dashboard access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isAdmin && (
              <div className="flex items-start gap-2 p-2 rounded border bg-muted/40">
                <Info className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  View only — admins can add or remove roles.
                </p>
              </div>
            )}

            {managerRolesLoading ? (
              <div className="space-y-1.5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : managerRoles.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {managerRoles.map(role => (
                  <div
                    key={role.role_id}
                    className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border bg-card text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: roleColor(role.color) }}
                      />
                      <span className="truncate font-medium">{role.name}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          try {
                            await removeManagerRole.mutateAsync(role.role_id);
                            toast.success('Manager role removed');
                          } catch {
                            toast.error('Failed to remove manager role');
                          }
                        }}
                        disabled={removeManagerRole.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-1">
                No manager roles — only admins have access.
              </p>
            )}

            {isAdmin && availableRoles.length > 0 && (
              <div className="flex gap-2">
                <Select value={selectedManagerRoleId} onValueChange={setSelectedManagerRoleId}>
                  <SelectTrigger className="flex-1 h-8 text-sm">
                    <SelectValue placeholder="Add a role…" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: roleColor(role.color) }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 shrink-0"
                  onClick={async () => {
                    if (!selectedManagerRoleId) return;
                    try {
                      await addManagerRole.mutateAsync(selectedManagerRoleId);
                      setSelectedManagerRoleId('');
                      toast.success('Manager role added');
                    } catch {
                      toast.error('Failed to add manager role');
                    }
                  }}
                  disabled={!selectedManagerRoleId || addManagerRole.isPending}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Language & Region
            </CardTitle>
            <CardDescription>Language and timezone preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={formData.language} onValueChange={v => handleInputChange('language', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={formData.timezone} onValueChange={v => handleInputChange('timezone', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4" />
            Bot Identity
          </CardTitle>
          <CardDescription>
            Customize Plana&apos;s server-specific nickname, avatar, banner, and bio.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bot_nickname">Server Nickname</Label>
              <Input
                id="bot_nickname"
                value={formData.bot_nickname}
                onChange={e => handleInputChange('bot_nickname', e.target.value)}
                placeholder="Project Plana"
                maxLength={32}
              />
            </div>

            <div className="space-y-2 md:row-span-2">
              <Label htmlFor="bot_bio">Server Bio</Label>
              <Textarea
                id="bot_bio"
                value={formData.bot_bio}
                onChange={e => handleInputChange('bot_bio', e.target.value)}
                placeholder="A short server-specific profile bio"
                maxLength={190}
                className="min-h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bot_bio.length}/190
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full border bg-muted">
                    {formData.bot_avatar_url ? (
                      <img
                        src={formData.bot_avatar_url}
                        alt="Bot avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserRound className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <ImageUploadModal
                    value={formData.bot_avatar_url}
                    onValueChange={url => handleInputChange('bot_avatar_url', url ?? '')}
                    guildId={guildId}
                    title="Set Bot Avatar"
                    trigger={
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose
                      </Button>
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Banner</Label>
                <div className="space-y-2">
                  <div className="aspect-[3/1] overflow-hidden rounded border bg-muted">
                    {formData.bot_banner_url ? (
                      <img
                        src={formData.bot_banner_url}
                        alt="Bot banner preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Image className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <ImageUploadModal
                    value={formData.bot_banner_url}
                    onValueChange={url => handleInputChange('bot_banner_url', url ?? '')}
                    guildId={guildId}
                    title="Set Bot Banner"
                    trigger={
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit overflow-hidden rounded border bg-muted/30">
            <div className="aspect-[3/1] bg-muted">
              {formData.bot_banner_url ? (
                <img
                  src={formData.bot_banner_url}
                  alt="Bot profile banner preview"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="px-4 pb-4">
              <div className="-mt-8 h-16 w-16 overflow-hidden rounded-full border-4 border-background bg-muted">
                {formData.bot_avatar_url ? (
                  <img
                    src={formData.bot_avatar_url}
                    alt="Bot profile avatar preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>
              <p className="mt-2 truncate font-semibold">
                {formData.bot_nickname || 'Project Plana'}
              </p>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                {formData.bot_bio || 'No server-specific bio set.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom row: Embed settings (left) · Preview (right) ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Left column: Embed Appearance + Footer Images */}
        <div className="space-y-6">

          {/* Embed Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Embed Appearance
              </CardTitle>
              <CardDescription>Customize how bot embeds look</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Embed Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.embed_color}
                    onChange={e => handleInputChange('embed_color', e.target.value)}
                    className="w-14 h-9 p-1 shrink-0"
                  />
                  <Input
                    placeholder="#7289DA"
                    value={formData.embed_color}
                    onChange={e => handleInputChange('embed_color', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Embed Footer Text</Label>
                <Input
                  value={formData.embed_footer}
                  onChange={e => handleInputChange('embed_footer', e.target.value)}
                  placeholder="Project Plana, Powered by S.C.H.A.L.E."
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Text displayed at the bottom of bot embeds
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4" />
                Footer Images
              </CardTitle>
              <CardDescription>
                Images randomly displayed in embed footers.{' '}
                {formData.embed_footer_images.length > 0 && (
                  <span className="font-medium">
                    {formData.embed_footer_images.length} uploaded
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.embed_footer_images.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {formData.embed_footer_images.map((imageUrl, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-square bg-muted rounded-lg border overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Footer image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDMuNUgzQzIuNzIgMy41IDIuNSAzLjcyIDIuNSA0VjIwQzIuNSAyMC4yOCAyLjcyIDIwLjUgMyAyMC41SDIxQzIxLjI4IDIwLjUgMjEuNSAyMC4yOCAyMS41IDIwVjRDMjEuNSAzLjcyIDIxLjI4IDMuNSAyMSAzLjVaTTIwIDEzLjVMMTYuNSAxMEwxMy4wMSAxMy40OUw5LjUgOS45OUw0IDEzVjVIMjBWMTMuNVoiIGZpbGw9IiM5ZjlmOWYiLz4KPC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1.5">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => window.open(imageUrl, '_blank')}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => {
                                if (confirm('Remove this footer image?')) {
                                  removeFooterImage(index);
                                }
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {/* Add more tile */}
                    <ImageUploadModal
                      value=""
                      onValueChange={url => { if (url) addFooterImage(url); }}
                      guildId={guildId}
                      title="Add Footer Image"
                      trigger={
                        <div className="aspect-square bg-muted border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors group">
                          <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                          <p className="text-[10px] text-muted-foreground group-hover:text-primary mt-0.5">Add</p>
                        </div>
                      }
                    />
                  </div>

                  {/* URL list */}
                  <div className="space-y-1">
                    {formData.embed_footer_images.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded text-xs">
                        <span className="font-mono text-muted-foreground min-w-0 flex-1 truncate">
                          {index + 1}. {url}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(url);
                            toast.success('Copied');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive w-full"
                    onClick={() => {
                      if (confirm('Remove all footer images?')) {
                        setDraftFormData(prev => ({
                          ...(prev ?? formData),
                          embed_footer_images: [],
                        }));
                      }
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Images
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <Image className="h-10 w-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">No footer images</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Add images to randomly display in embed footers
                  </p>
                  <ImageUploadModal
                    value=""
                    onValueChange={url => { if (url) addFooterImage(url); }}
                    guildId={guildId}
                    title="Add Footer Image"
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Image
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: live embed preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Preview message={buildPreviewMessage(formData)} guildData={guildData} />
        </div>
      </div>
    </div>
  );
}
