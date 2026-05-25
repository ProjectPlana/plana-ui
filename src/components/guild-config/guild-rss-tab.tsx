'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { GuildData, RssFeed } from '@/lib/sdk';
import { useGuild } from '@/contexts/guild-context';
import {
  useCreateRssFeedMutation,
  useDeleteRssFeedMutation,
  useRssFeedsQuery,
  useUpdateRssFeedMutation,
} from '@/lib/queries';
import { Rss, Save, X, Globe, Hash, Settings, Calendar, Power } from 'lucide-react';
import { toast } from 'sonner';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { AutocompletePopup } from './message-builder/autocomplete-popup';
import { RSS_TEMPLATE_VARIABLES } from './message-builder/template-variables';
import { useTemplateVariableAutocomplete } from './message-builder/use-template-variable-autocomplete';

interface GuildRssTabProps {
  guildId: string;
}

type RssDraft = RssFeed & { client_id?: string };

export function GuildRssTab({ guildId }: GuildRssTabProps) {
  const { guildData } = useGuild();
  const rssQuery = useRssFeedsQuery(guildId);
  const createFeed = useCreateRssFeedMutation(guildId);
  const updateRssFeed = useUpdateRssFeedMutation(guildId);
  const deleteRssFeed = useDeleteRssFeedMutation(guildId);
  const [saving, setSaving] = useState<string | null>(null);
  const [draftFeeds, setDraftFeeds] = useState<RssDraft[]>([]);
  const [editedFeeds, setEditedFeeds] = useState<Record<string, RssDraft>>({});
  const feeds = rssQuery.data?.data ?? [];
  const visibleFeeds: RssDraft[] = [
    ...draftFeeds,
    ...feeds.map((feed) => (feed.id && editedFeeds[feed.id] ? editedFeeds[feed.id] : feed)),
  ];
  const totalCount = rssQuery.data?.total_count ?? 0;

  const addFeed = () => {
    const newFeed = {
      client_id: `rss-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      channel_id: null,
      guild_id: guildId,
      url: '',
      name: 'New RSS Feed',
      enabled: false,
      message: 'New article: {title}'
    };
    setDraftFeeds((current) => [newFeed, ...current]);
  };

  function feedKey(feed: RssDraft) {
    return feed.id ?? feed.client_id ?? feed.name ?? feed.url;
  }

  function updateFeedDraft(feed: RssDraft) {
    if (feed.id) {
      setEditedFeeds((current) => ({ ...current, [feed.id!]: feed }));
      return;
    }
    setDraftFeeds((current) =>
      current.map((item) => (item.client_id === feed.client_id ? feed : item)),
    );
  }

  const saveFeed = async (feed: RssDraft) => {
    const feedId = feed.id;
    const trimmedUrl = feed.url.trim();
    
    // Validate that feed cannot be enabled without a channel
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
        throw new Error('invalid RSS URL');
      }
    } catch {
      toast.error('RSS URL must be a valid http:// or https:// URL');
      return;
    }
    if (feed.enabled && !feed.channel_id) {
      toast.error('Cannot enable feed without selecting a channel');
      return;
    }
    
    const saveKey = feedId ?? feed.client_id ?? null;
    try {
      setSaving(saveKey);
      const payload: Partial<RssFeed> & { client_id?: string } = {
        ...feed,
        url: trimmedUrl,
        name: feed.name?.trim() || null,
        message: feed.message?.trim() || null,
      };
      delete payload.client_id;
      delete payload.id;
      delete payload.last_updated;
      if (feedId) {
        await updateRssFeed.mutateAsync({ feedId, feed: payload });
        setEditedFeeds((current) => {
          const next = { ...current };
          delete next[feedId];
          return next;
        });
      } else {
        await createFeed.mutateAsync(payload as Omit<RssFeed, 'id' | 'last_updated'>);
        setDraftFeeds((current) => current.filter((item) => item.client_id !== feed.client_id));
      }
      toast.success('RSS feed updated successfully!');
    } catch (error) {
      console.error('Failed to update RSS feed:', error);
      toast.error('Failed to update RSS feed');
    } finally {
      setSaving(null);
    }
  };

  const removeFeed = async (feed: RssDraft) => {
    if (!feed.id) {
      setDraftFeeds((current) => current.filter((item) => item.client_id !== feed.client_id));
      return;
    }
    if (!confirm('Are you sure you want to delete this RSS feed?')) return;
    
    try {
      await deleteRssFeed.mutateAsync(feed.id);
      toast.success('RSS feed deleted successfully!');
    } catch (error) {
      console.error('Failed to delete RSS feed:', error);
      toast.error('Failed to delete RSS feed');
    }
  };

  const toggleFeedStatus = async (feedId: string, enabled: boolean) => {
    const feed = visibleFeeds.find(f => f.id === feedId);
    if (!feed) return;
    
    // Prevent enabling feed without channel
    if (enabled && !feed.channel_id) {
      toast.error('Cannot enable feed without selecting a channel');
      return;
    }
    
    const next = { ...feed, enabled };
    updateFeedDraft(next);
    await saveFeed(next);
  };

  const feedItems: ItemListItem[] = visibleFeeds.map((feed, index) => ({
    id: feed.id || feed.client_id || `temp-${index}`,
    title: feed.name || 'Unnamed RSS Feed',
    searchText: `${feed.name ?? ''} ${feed.url} ${feed.message ?? ''}`,
    subtitle: (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{feed.url || 'URL not set'}</span>
        {feed.last_updated && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last updated: {new Date(feed.last_updated).toLocaleString()}</span>
          </div>
        )}
      </div>
    ),
    status: feed.id ? (feed.enabled ? 'Active' : 'Disabled') : 'Draft',
    statusVariant: feed.enabled ? 'default' : 'secondary',
    actions: [
      {
        label: 'Save',
        onClick: () => saveFeed(feed),
        variant: 'default' as const,
        icon: Save,
        disabled: saving === feedKey(feed),
      },
      {
        label: feed.enabled ? 'Disable' : 'Enable',
        onClick: () => toggleFeedStatus(feed.id!, !feed.enabled),
        variant: feed.enabled ? 'outline' as const : (!feed.channel_id ? 'secondary' as const : 'default' as const),
        icon: Power,
        disabled: !feed.id || (!feed.enabled && !feed.channel_id) || saving === feedKey(feed)
      },
      {
        label: 'Delete',
        onClick: () => removeFeed(feed),
        variant: 'destructive' as const,
        icon: X
      }
    ],
    content: (
      <FeedForm
        feed={feed}
        onChange={updateFeedDraft}
        guildData={guildData}
      />
    )
  }));

  return (
    <ItemList
      title="RSS Feeds"
      description="Manage RSS feeds to automatically post new articles to your server channels"
      icon={Rss}
      items={feedItems}
      onAddItem={addFeed}
      onRefresh={() => rssQuery.refetch()}
      refreshing={rssQuery.isFetching}
      addItemLabel="Add RSS Feed"
      loading={rssQuery.isLoading}
      emptyMessage="No RSS feeds configured yet"
      emptyDescription="Get started by adding your first RSS feed to begin receiving automatic updates"
      searchPlaceholder="Search feeds by name, URL, channel, or template"
      stats={[
        { label: 'Total feeds', value: totalCount + draftFeeds.length },
        { label: 'Active', value: feeds.filter((feed) => feed.enabled).length, tone: 'positive' },
        { label: 'Drafts', value: draftFeeds.length, tone: 'muted' },
      ]}
      showSaveAll={false}
    />
  );
}

interface FeedFormProps {
  feed: RssDraft;
  onChange: (feed: RssDraft) => void;
  guildData: GuildData | null;
}

function FeedForm({ feed, onChange, guildData }: FeedFormProps) {
  const updateField = <K extends keyof RssDraft>(field: K, value: RssDraft[K]) => {
    const updated = { ...feed, [field]: value };
    if (field === 'channel_id' && !value && updated.enabled) {
      updated.enabled = false;
      toast.info('Feed automatically disabled - no channel selected');
    }
    onChange(updated);
  };
  const templateAutocomplete = useTemplateVariableAutocomplete(
    feed.message ?? '',
    (message) => updateField('message', message),
    RSS_TEMPLATE_VARIABLES,
  );
  const {
    handleChange: handleTemplateChange,
    insert: insertTemplateVariable,
    options: templateOptions,
    registerRef: registerTemplateRef,
    show: showTemplateOptions,
  } = templateAutocomplete;

  return (
    <div className="space-y-6">
      {/* Feed Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-medium">Feed Configuration</h4>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Feed Name</Label>
            <Input
              value={feed.name ?? ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Tech News, Company Blog"
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              A friendly name to identify this feed
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Hash className="h-4 w-4" />
              Target Channel
              {feed.enabled && !feed.channel_id && (
                <span className="text-xs text-red-500">(Required for enabled feeds)</span>
              )}
            </Label>
            <ChannelSelect
              channels={guildData?.channels || []}
              categories={guildData?.categories || []}
              value={feed.channel_id}
              onValueChange={(value) => updateField('channel_id', value || null)}
              placeholder="Select channel"
            />
            <p className="text-xs text-muted-foreground">
              Channel where new articles will be posted
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" />
            RSS Feed URL
          </Label>
          <Input
            value={feed.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://example.com/feed.xml"
            type="url"
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            The URL of the RSS/Atom feed to monitor
          </p>
        </div>

        {/* Feed Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Feed Status</Label>
            <p className="text-xs text-muted-foreground">
              {feed.enabled 
                ? 'This feed is active and will post new articles'
                : 'This feed is disabled and will not post articles'
              }
            </p>
            {!feed.channel_id && (
              <p className="text-xs text-red-500 mt-1">
                A channel must be selected to enable this feed
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={feed.enabled}
              onCheckedChange={(enabled) => {
                if (enabled && !feed.channel_id) {
                  toast.error('Please select a channel first');
                  return;
                }
                updateField('enabled', enabled);
              }}
              disabled={!feed.channel_id}
            />
            <Label className="text-sm">
              {feed.enabled ? 'Active' : 'Disabled'}
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Message Template */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Rss className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium">Message Template</h4>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <textarea
              ref={registerTemplateRef}
              className="w-full min-h-[120px] p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              value={feed.message ?? ''}
              onChange={(e) => handleTemplateChange(e.target.value)}
              placeholder="New article: {title}&#10;{description}&#10;&#10;Read more: {link}"
            />
            {showTemplateOptions && (
              <AutocompletePopup
                options={templateOptions}
                onSelect={insertTemplateVariable}
              />
            )}
          </div>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Available Variables:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {RSS_TEMPLATE_VARIABLES.map((variable) => (
                <code
                  key={variable.name}
                  className="bg-background px-2 py-1 rounded text-primary"
                >
                  {`{${variable.name}}`}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
