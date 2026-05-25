'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Coins,
  RotateCcw,
  Save,
  Settings,
  ShoppingBag,
  TrendingUp,
  Trash2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { MessageBuilder } from '@/components/guild-config/message-builder';
import { ECONOMY_TEMPLATE_VARIABLES } from '@/components/guild-config/message-builder/template-variables';
import { StickyActionBar } from '@/components/guild-config/sticky-action-bar';
import { ChannelMultiSelect } from '@/components/plana-ui/channel-multi-select';
import { ChannelSelect } from '@/components/plana-ui/channel-select';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';
import { ItemList, ItemListItem } from '@/components/plana-ui/item-list';
import { RoleMultiSelect } from '@/components/plana-ui/role-multi-select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGuild } from '@/contexts/guild-context';
import {
  defaultEconomyConfig,
  useCreateEconomyConfigMutation,
  useDeleteEconomyConfigMutation,
  useEconomyConfigQuery,
  useUpdateEconomyConfigMutation,
} from '@/lib/queries';
import {
  MAX_REACTION_RULES,
  MAX_SHOP_ITEMS,
  type CosmeticPayload,
  type EconomyConfig,
  type GuildEmoji,
  type ItemPayload,
  type ReactionEarnRule,
  type RolePayload,
  type ShopItem,
  type ShopItemType,
  type XPBoosterPayload,
} from '@/lib/sdk';

interface GuildEconomyTabProps {
  guildId: string;
}

function newShopItem(): ShopItem {
  return {
    id: uuidv4(),
    name: 'New Item',
    description: '',
    icon_url: null,
    type: 'cosmetic',
    price: 100,
    stock: null,
    per_user_limit: null,
    required_role_ids: [],
    purchasable: true,
    payload: { type: 'cosmetic', tag: null } satisfies CosmeticPayload,
  };
}

function newReactionRule(): ReactionEarnRule {
  return { emoji: null, amount: 1, daily_cap: 50 };
}

function normalizeConfig(config: EconomyConfig): EconomyConfig {
  return {
    ...config,
    currency_name: config.currency_name.trim() || 'coins',
    currency_emoji_name: config.currency_emoji_name.trim() || 'coin',
    message_amount: Math.max(0, Math.floor(Number(config.message_amount) || 0)),
    message_cooldown: Math.max(0, Math.floor(Number(config.message_cooldown) || 0)),
    voice_amount_per_minute: Math.max(0, Math.floor(Number(config.voice_amount_per_minute) || 0)),
    daily_amount: Math.max(0, Math.floor(Number(config.daily_amount) || 0)),
    daily_streak_bonus: Math.max(0, Math.floor(Number(config.daily_streak_bonus) || 0)),
    weekly_amount: Math.max(0, Math.floor(Number(config.weekly_amount) || 0)),
    weekly_streak_bonus: Math.max(0, Math.floor(Number(config.weekly_streak_bonus) || 0)),
    level_up_amount: Math.max(0, Math.floor(Number(config.level_up_amount) || 0)),
    starting_balance: Math.max(0, Math.floor(Number(config.starting_balance) || 0)),
    transfer_tax_percent: Math.min(50, Math.max(0, Math.floor(Number(config.transfer_tax_percent) || 0))),
    reaction_rules: config.reaction_rules.map((r) => ({
      ...r,
      amount: Math.max(1, Math.floor(Number(r.amount) || 1)),
      daily_cap: Math.max(1, Math.floor(Number(r.daily_cap) || 1)),
    })),
    shop_items: config.shop_items
      .filter((item) => item.name.trim())
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        price: Math.max(0, Math.floor(Number(item.price) || 0)),
        stock: item.stock !== null ? Math.max(1, Math.floor(Number(item.stock) || 1)) : null,
        per_user_limit:
          item.per_user_limit !== null
            ? Math.max(1, Math.floor(Number(item.per_user_limit) || 1))
            : null,
      })),
    purchase_channel_id: config.purchase_channel_id || null,
  };
}

export function GuildEconomyTab({ guildId }: GuildEconomyTabProps) {
  const { guildData } = useGuild();
  const economyQuery = useEconomyConfigQuery(guildId);
  const updateEconomy = useUpdateEconomyConfigMutation(guildId);
  const createEconomy = useCreateEconomyConfigMutation(guildId);
  const deleteEconomy = useDeleteEconomyConfigMutation(guildId);
  const [draftConfig, setDraftConfig] = useState<EconomyConfig | null>(null);

  const config = draftConfig ?? economyQuery.data ?? null;
  const saving = updateEconomy.isPending || createEconomy.isPending || deleteEconomy.isPending;
  const effectiveConfig = config ?? defaultEconomyConfig(guildId);

  function updateConfig(updates: Partial<EconomyConfig>) {
    setDraftConfig({ ...effectiveConfig, ...updates });
  }

  function addShopItem() {
    if (effectiveConfig.shop_items.length >= MAX_SHOP_ITEMS) {
      toast.error(`A server can have at most ${MAX_SHOP_ITEMS} shop items`);
      return;
    }
    updateConfig({ shop_items: [...effectiveConfig.shop_items, newShopItem()] });
  }

  function updateShopItem(index: number, updates: Partial<ShopItem>) {
    const items = [...effectiveConfig.shop_items];
    items[index] = { ...items[index], ...updates };
    updateConfig({ shop_items: items });
  }

  function removeShopItem(index: number) {
    updateConfig({ shop_items: effectiveConfig.shop_items.filter((_, i) => i !== index) });
  }

  function addReactionRule() {
    if (effectiveConfig.reaction_rules.length >= MAX_REACTION_RULES) {
      toast.error(`A server can have at most ${MAX_REACTION_RULES} reaction earn rules`);
      return;
    }
    updateConfig({ reaction_rules: [...effectiveConfig.reaction_rules, newReactionRule()] });
  }

  function updateReactionRule(index: number, updates: Partial<ReactionEarnRule>) {
    const rules = [...effectiveConfig.reaction_rules];
    rules[index] = { ...rules[index], ...updates };
    updateConfig({ reaction_rules: rules });
  }

  function removeReactionRule(index: number) {
    updateConfig({ reaction_rules: effectiveConfig.reaction_rules.filter((_, i) => i !== index) });
  }

  async function handleSave() {
    const normalized = normalizeConfig(effectiveConfig);
    const names = normalized.shop_items.map((i) => i.name);
    if (new Set(names).size !== names.length) {
      toast.error('Shop item names must be unique');
      return;
    }
    try {
      const saved = economyQuery.data
        ? await updateEconomy.mutateAsync(normalized)
        : await createEconomy.mutateAsync(normalized);
      setDraftConfig(saved);
      toast.success('Economy settings saved');
    } catch (error) {
      console.error('Failed to save economy:', error);
      toast.error('Failed to save economy settings');
    }
  }

  async function handleReset() {
    if (!confirm('Reset economy settings for this server? This will not affect member balances.')) return;
    try {
      await deleteEconomy.mutateAsync();
      setDraftConfig(defaultEconomyConfig(guildId));
      toast.success('Economy settings reset');
    } catch (error) {
      console.error('Failed to reset economy:', error);
      toast.error('Failed to reset economy settings');
    }
  }

  if (economyQuery.isLoading) {
    return <p className="py-8 text-center text-muted-foreground">Loading economy settings...</p>;
  }

  const shopItems: ItemListItem[] = effectiveConfig.shop_items.map((item, index) => ({
    id: item.id,
    title: item.name || `Item ${index + 1}`,
    subtitle: `${item.type} · ${item.price} ${effectiveConfig.currency_name}${item.stock !== null ? ` · ${item.stock} left` : ''}`,
    status: item.purchasable ? 'Listed' : 'Hidden',
    statusVariant: item.purchasable ? 'default' : 'secondary',
    searchText: `${item.name} ${item.type} ${item.description}`,
    actions: [
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => removeShopItem(index),
      },
    ],
    content: (
      <ShopItemForm
        item={item}
        guildRoles={guildData?.roles ?? []}
        currencyName={effectiveConfig.currency_name}
        onChange={(updates) => updateShopItem(index, updates)}
      />
    ),
  }));

  const reactionItems: ItemListItem[] = effectiveConfig.reaction_rules.map((rule, index) => ({
    id: `reaction-${index}`,
    title: rule.emoji ? `Reaction: ${rule.emoji}` : 'Any reaction',
    subtitle: `+${rule.amount} · cap ${rule.daily_cap}/day`,
    content: (
      <ReactionRuleForm
        rule={rule}
        guildEmojis={guildData?.emojis ?? []}
        onChange={(updates) => updateReactionRule(index, updates)}
      />
    ),
    actions: [
      {
        label: 'Delete',
        icon: Trash2,
        variant: 'destructive',
        onClick: () => removeReactionRule(index),
      },
    ],
  }));

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6" />
            Economy
          </h2>
          <p className="text-muted-foreground">
            Configure your server currency, earn sources, and shop.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <Badge variant={effectiveConfig.enabled ? 'default' : 'secondary'}>
            {effectiveConfig.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
          {effectiveConfig.currency_name && (
            <Badge variant="outline">{effectiveConfig.currency_emoji_name} {effectiveConfig.currency_name}</Badge>
          )}
        </div>
      </div>

      <StickyActionBar>
        <Button variant="destructive" onClick={handleReset} disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Economy
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </StickyActionBar>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="setup" className="gap-1.5">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="earn" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            Earn
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-1.5">
            <ShoppingBag className="h-4 w-4" />
            Shop
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- Setup */}
        <TabsContent value="setup" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Currency</CardTitle>
              <CardDescription>
                Define the identity of your server currency. Members will see this name and emoji in balances, the shop, and all economy commands.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={effectiveConfig.enabled}
                  onCheckedChange={(enabled) => updateConfig({ enabled })}
                  aria-label="Enable economy"
                />
                <span className="text-sm font-medium">
                  {effectiveConfig.enabled ? 'Economy is active' : 'Economy is disabled'}
                </span>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Currency Name</Label>
                  <Input
                    value={effectiveConfig.currency_name}
                    onChange={(e) => updateConfig({ currency_name: e.target.value })}
                    placeholder="coins"
                    maxLength={32}
                  />
                  <p className="text-xs text-muted-foreground">Shown anywhere a balance or price is displayed.</p>
                </div>
                <div className="space-y-2">
                  <Label>Currency Emoji</Label>
                  <EmojiSelect
                    value={
                      effectiveConfig.currency_emoji_id
                        ? { emoji_id: effectiveConfig.currency_emoji_id, name: effectiveConfig.currency_emoji_name }
                        : null
                    }
                    onValueChange={(emoji: GuildEmoji | null) =>
                      updateConfig({
                        currency_emoji_id: emoji?.emoji_id ?? null,
                        currency_emoji_name: emoji?.name ?? 'coin',
                      })
                    }
                    guildEmojis={guildData?.emojis ?? []}
                    placeholder="Pick a server emoji"
                  />
                  <p className="text-xs text-muted-foreground">Must be a custom server emoji — unicode emojis are not supported.</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Starting Balance</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={effectiveConfig.starting_balance}
                    onChange={(e) => updateConfig({ starting_balance: parseInt(e.target.value) || 0 })}
                    className="w-36"
                  />
                  <span className="text-sm text-muted-foreground">{effectiveConfig.currency_name}</span>
                </div>
                <p className="text-xs text-muted-foreground">Granted to new members on their first economy interaction.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------------- Earn */}
        <TabsContent value="earn" className="space-y-6 mt-6">
          {!effectiveConfig.enabled && <DisabledBanner />}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Activity Rewards
              </CardTitle>
              <CardDescription>Passive earn rates from server activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Per Message</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={effectiveConfig.message_amount}
                      onChange={(e) => updateConfig({ message_amount: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">{effectiveConfig.currency_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Message Cooldown</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={3600}
                      value={effectiveConfig.message_cooldown}
                      onChange={(e) => updateConfig({ message_cooldown: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">sec</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Per Voice Minute</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={effectiveConfig.voice_amount_per_minute}
                      onChange={(e) => updateConfig({ voice_amount_per_minute: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">{effectiveConfig.currency_name}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Level-Up Bonus</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={effectiveConfig.level_up_amount}
                    onChange={(e) => updateConfig({ level_up_amount: parseInt(e.target.value) || 0 })}
                    className="w-36"
                  />
                  <span className="text-sm text-muted-foreground">{effectiveConfig.currency_name} per level</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="text-sm font-medium">Earn Targeting</p>
                <p className="text-xs text-muted-foreground">
                  Restrict which channels and roles earn message and voice currency. Toggle to switch between whitelist and blacklist mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Channels</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {effectiveConfig.target_earn_channels_mode ? 'Whitelist' : 'Blacklist'}
                      </span>
                      <Switch
                        checked={effectiveConfig.target_earn_channels_mode}
                        onCheckedChange={(v) => updateConfig({ target_earn_channels_mode: v })}
                      />
                    </div>
                  </div>
                  <ChannelMultiSelect
                    channels={guildData?.channels ?? []}
                    categories={guildData?.categories ?? []}
                    value={effectiveConfig.target_earn_channels}
                    onValueChange={(v) => updateConfig({ target_earn_channels: v })}
                    placeholder="All channels"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Roles</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {effectiveConfig.target_earn_roles_mode ? 'Whitelist' : 'Blacklist'}
                      </span>
                      <Switch
                        checked={effectiveConfig.target_earn_roles_mode}
                        onCheckedChange={(v) => updateConfig({ target_earn_roles_mode: v })}
                      />
                    </div>
                  </div>
                  <RoleMultiSelect
                    roles={guildData?.roles ?? []}
                    value={effectiveConfig.target_earn_roles}
                    onValueChange={(v) => updateConfig({ target_earn_roles: v })}
                    placeholder="All roles"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Daily &amp; Weekly Claims</CardTitle>
              <CardDescription>
                Scheduled bonuses members can claim. Streak bonuses add up per consecutive claim.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                <div className="space-y-4 pb-6 md:pb-0 md:pr-6">
                  <p className="text-sm font-medium">Daily</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Base amount</Label>
                      <Input
                        type="number"
                        min={0}
                        value={effectiveConfig.daily_amount}
                        onChange={(e) => updateConfig({ daily_amount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Streak bonus / day</Label>
                      <Input
                        type="number"
                        min={0}
                        value={effectiveConfig.daily_streak_bonus}
                        onChange={(e) => updateConfig({ daily_streak_bonus: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  {effectiveConfig.daily_streak_bonus > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Day 7 payout: {effectiveConfig.daily_amount + effectiveConfig.daily_streak_bonus * 6}{' '}
                      {effectiveConfig.currency_name}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-6 md:pt-0 md:pl-6">
                  <p className="text-sm font-medium">Weekly</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Base amount</Label>
                      <Input
                        type="number"
                        min={0}
                        value={effectiveConfig.weekly_amount}
                        onChange={(e) => updateConfig({ weekly_amount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Streak bonus / week</Label>
                      <Input
                        type="number"
                        min={0}
                        value={effectiveConfig.weekly_streak_bonus}
                        onChange={(e) => updateConfig({ weekly_streak_bonus: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  {effectiveConfig.weekly_streak_bonus > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Week 4 payout: {effectiveConfig.weekly_amount + effectiveConfig.weekly_streak_bonus * 3}{' '}
                      {effectiveConfig.currency_name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <ItemList
            title="Reaction Earn Rules"
            description="Currency is credited to the message author when a member reacts. Empty list = reactions don't earn."
            icon={Coins}
            items={reactionItems}
            onAddItem={addReactionRule}
            addItemLabel="Add rule"
            showSaveAll={false}
            emptyMessage="No reaction rules"
            emptyDescription="Add a rule to let members earn currency by reacting to messages."
            stats={[
              { label: 'Rules', value: effectiveConfig.reaction_rules.length },
              { label: 'Limit', value: String(MAX_REACTION_RULES), tone: 'muted' },
            ]}
          />
        </TabsContent>

        {/* ---------------------------------------------------------------- Shop */}
        <TabsContent value="shop" className="space-y-6 mt-6">
          {!effectiveConfig.enabled && <DisabledBanner />}

          <Card>
            <CardHeader>
              <CardTitle>Transfers</CardTitle>
              <CardDescription>Allow members to send currency directly to each other.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={effectiveConfig.transfer_enabled}
                  onCheckedChange={(v) => updateConfig({ transfer_enabled: v })}
                />
                <span className="text-sm">
                  {effectiveConfig.transfer_enabled ? 'Transfers enabled' : 'Transfers disabled'}
                </span>
              </div>

              {effectiveConfig.transfer_enabled && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Transfer Tax</Label>
                      <span className="text-sm font-mono tabular-nums">{effectiveConfig.transfer_tax_percent}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={50}
                      step={1}
                      value={[effectiveConfig.transfer_tax_percent]}
                      onValueChange={([v]) => updateConfig({ transfer_tax_percent: v })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {effectiveConfig.transfer_tax_percent > 0
                        ? `${effectiveConfig.transfer_tax_percent}% of each transfer is burned — receiver gets ${100 - effectiveConfig.transfer_tax_percent}%`
                        : 'No tax — full amount is received'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <ItemList
            title="Shop Items"
            description="Create items members can buy with their currency."
            icon={ShoppingBag}
            items={shopItems}
            onAddItem={addShopItem}
            onRefresh={() => economyQuery.refetch()}
            refreshing={economyQuery.isFetching}
            addItemLabel="Add item"
            showSaveAll={false}
            emptyMessage="No shop items"
            emptyDescription="Add role rewards, XP boosters, or cosmetic items for members to purchase."
            searchPlaceholder="Search items"
            stats={[
              { label: 'Items', value: effectiveConfig.shop_items.length },
              { label: 'Listed', value: effectiveConfig.shop_items.filter((i) => i.purchasable).length, tone: 'positive' },
              { label: 'Limit', value: String(MAX_SHOP_ITEMS), tone: 'muted' },
            ]}
          />

          <Card>
            <CardHeader>
              <CardTitle>Purchase Announcement</CardTitle>
              <CardDescription>
                Sent to a channel when a member buys a shop item. Leave the message content empty to disable announcements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Announcement Channel</Label>
                <ChannelSelect
                  channels={guildData?.channels ?? []}
                  categories={guildData?.categories ?? []}
                  value={effectiveConfig.purchase_channel_id ?? null}
                  onValueChange={(v) => updateConfig({ purchase_channel_id: v })}
                  placeholder="Select channel (optional)"
                />
              </div>
              <MessageBuilder
                message={effectiveConfig.purchase_announcement ?? { content: '' }}
                onChange={(purchase_announcement) => updateConfig({ purchase_announcement })}
                placeholder="{user.mention} purchased **{item.name}**!"
                guildId={guildId}
                templateVariables={ECONOMY_TEMPLATE_VARIABLES}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DisabledBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
      <AlertCircle className="h-4 w-4 shrink-0" />
      Economy is currently disabled. Enable it in the Setup tab for these settings to take effect.
    </div>
  );
}

// --------------------------------------------------------------------------- ShopItemForm

interface ShopItemFormProps {
  item: ShopItem;
  guildRoles: import('@/lib/sdk').GuildRole[];
  currencyName: string;
  onChange: (updates: Partial<ShopItem>) => void;
}

function ShopItemForm({ item, guildRoles, currencyName, onChange }: ShopItemFormProps) {
  function handleTypeChange(type: ShopItemType) {
    let payload: ItemPayload;
    if (type === 'role') payload = { type: 'role', role_id: '', duration_seconds: null } satisfies RolePayload;
    else if (type === 'xp_booster') payload = { type: 'xp_booster', multiplier: 1.5, duration_seconds: 3600 } satisfies XPBoosterPayload;
    else payload = { type: 'cosmetic', tag: null } satisfies CosmeticPayload;
    onChange({ type, payload });
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={item.name} onChange={(e) => onChange({ name: e.target.value })} maxLength={64} />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={item.type} onValueChange={(v) => handleTypeChange(v as ShopItemType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="role">Role</SelectItem>
              <SelectItem value="xp_booster">XP Booster</SelectItem>
              <SelectItem value="cosmetic">Cosmetic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={item.description} onChange={(e) => onChange({ description: e.target.value })} maxLength={256} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Price</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={item.price}
              onChange={(e) => onChange({ price: parseInt(e.target.value) || 0 })}
            />
            <span className="text-xs text-muted-foreground shrink-0">{currencyName}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Stock</Label>
          <Input
            type="number"
            min={1}
            value={item.stock ?? ''}
            onChange={(e) => onChange({ stock: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-2">
          <Label>Per-user limit</Label>
          <Input
            type="number"
            min={1}
            value={item.per_user_limit ?? ''}
            onChange={(e) => onChange({ per_user_limit: e.target.value ? parseInt(e.target.value) : null })}
            placeholder="None"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label>Required Role</Label>
          <RoleMultiSelect
            roles={guildRoles}
            value={item.required_role_ids}
            onValueChange={(v) => onChange({ required_role_ids: v })}
            placeholder="No requirement"
          />
        </div>
        <div className="flex items-center gap-3 pb-0.5">
          <Switch
            checked={item.purchasable}
            onCheckedChange={(v) => onChange({ purchasable: v })}
          />
          <span className="text-sm">{item.purchasable ? 'Listed in shop' : 'Hidden from shop'}</span>
        </div>
      </div>

      {item.type === 'role' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-2">
            <Label>Role to Grant</Label>
            <Select
              value={(item.payload as RolePayload).role_id || ''}
              onValueChange={(v) => onChange({ payload: { ...(item.payload as RolePayload), role_id: v } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {guildRoles.map((role) => (
                  <SelectItem key={role.role_id} value={role.role_id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={(item.payload as RolePayload).duration_seconds ?? ''}
                onChange={(e) =>
                  onChange({
                    payload: {
                      ...(item.payload as RolePayload),
                      duration_seconds: e.target.value ? parseInt(e.target.value) : null,
                    },
                  })
                }
                placeholder="Permanent"
              />
              <span className="text-xs text-muted-foreground shrink-0">sec</span>
            </div>
          </div>
        </div>
      )}

      {item.type === 'xp_booster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-2">
            <Label>XP Multiplier</Label>
            <Input
              type="number"
              min={1.01}
              max={10}
              step={0.1}
              value={(item.payload as XPBoosterPayload).multiplier}
              onChange={(e) =>
                onChange({
                  payload: {
                    ...(item.payload as XPBoosterPayload),
                    multiplier: parseFloat(e.target.value) || 1.5,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={60}
                value={(item.payload as XPBoosterPayload).duration_seconds}
                onChange={(e) =>
                  onChange({
                    payload: {
                      ...(item.payload as XPBoosterPayload),
                      duration_seconds: parseInt(e.target.value) || 3600,
                    },
                  })
                }
              />
              <span className="text-xs text-muted-foreground shrink-0">sec</span>
            </div>
          </div>
        </div>
      )}

      {item.type === 'cosmetic' && (
        <div className="pt-3 border-t space-y-2">
          <Label>Tag</Label>
          <Input
            value={(item.payload as CosmeticPayload).tag ?? ''}
            onChange={(e) =>
              onChange({
                payload: { ...(item.payload as CosmeticPayload), tag: e.target.value || null },
              })
            }
            maxLength={100}
            placeholder="e.g. VIP · Supporter"
          />
          <p className="text-xs text-muted-foreground">Optional label shown in the member's inventory.</p>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------- ReactionRuleForm

interface ReactionRuleFormProps {
  rule: ReactionEarnRule;
  guildEmojis: import('@/lib/sdk').GuildEmoji[];
  onChange: (updates: Partial<ReactionEarnRule>) => void;
}

function ReactionRuleForm({ rule, guildEmojis, onChange }: ReactionRuleFormProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Emoji</Label>
          <EmojiSelect
            value={rule.emoji ? { name: rule.emoji } : null}
            onValueChange={(emoji) =>
              onChange({
                emoji: emoji
                  ? emoji.emoji_id
                    ? `<:${emoji.name}:${emoji.emoji_id}>`
                    : emoji.name
                  : null,
              })
            }
            guildEmojis={guildEmojis}
            placeholder="Any reaction"
          />
          <p className="text-xs text-muted-foreground">Leave blank to match any reaction.</p>
        </div>
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            min={1}
            value={rule.amount}
            onChange={(e) => onChange({ amount: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Daily Cap</Label>
          <Input
            type="number"
            min={1}
            value={rule.daily_cap}
            onChange={(e) => onChange({ daily_cap: parseInt(e.target.value) || 1 })}
          />
          <p className="text-xs text-muted-foreground">Max earned per message author per day.</p>
        </div>
      </div>
    </div>
  );
}
