export interface User {
  id: string;
  username: string;
  avatar: string;
}

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: number;
  bot_installed: boolean;
}

export interface GuildUser {
  user_id: string;
  username: string;
  avatar: string;
}

export interface GuildRole {
  role_id: string;
  name: string;
  color: number;
  permissions: number;
  position: number;
}

export interface TextChannel {
  channel_id: string;
  category_id?: string;
  name: string;
  position: number;
  topic?: string;
  nsfw: boolean;
}

export interface VoiceChannel {
  channel_id: string;
  category_id?: string;
  name: string;
  position: number;
  user_limit?: number | null;
}

export interface GuildCategory {
  category_id: string;
  name: string;
  type: number;
  position: number;
  topic?: string;
  nsfw: boolean;
}

export interface GuildEmoji {
  emoji_id?: string; // Only for custom Discord emojis, not needed for unicode
  name: string;
  url?: string; // Optional, for display purposes only
  animated?: boolean;
}

export interface GuildSticker {
  sticker_id: string;
  name: string;
  url: string;
  description: string;
  emoji: string;
  format: number;
  available: boolean;
}

export interface GuildData {
  id: string;
  name: string;
  icon: string;
  banner: string;
  owner_id: string;
  premium_tier: number;
  premium_subscription_count: number;
  users: GuildUser[];
  roles: GuildRole[];
  emojis: GuildEmoji[];
  stickers: GuildSticker[];
  channels: TextChannel[];
  voice_channels?: VoiceChannel[];
  categories: GuildCategory[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

function asId(value: string | number | null | undefined): string | undefined {
  return value == null ? undefined : String(value);
}

function normalizeWelcomeConfig(config: WelcomeConfig): WelcomeConfig {
  return {
    ...config,
    id: String(config.id),
    welcome_channel_id: asId(config.welcome_channel_id) ?? null,
    goodbye_channel_id: asId(config.goodbye_channel_id) ?? null,
    auto_roles: (config.auto_roles ?? []).map(String),
  };
}

function normalizeGuildData(guild: GuildData): GuildData {
  return {
    ...guild,
    id: String(guild.id),
    owner_id: String(guild.owner_id),
    users: (guild.users ?? []).map((user) => ({
      ...user,
      user_id: String(user.user_id),
    })),
    roles: (guild.roles ?? []).map((role) => ({
      ...role,
      role_id: String(role.role_id),
    })),
    channels: (guild.channels ?? []).map((channel) => ({
      ...channel,
      channel_id: String(channel.channel_id),
      category_id: asId(channel.category_id),
    })),
    voice_channels: guild.voice_channels?.map((channel) => ({
      ...channel,
      channel_id: String(channel.channel_id),
      category_id: asId(channel.category_id),
    })),
    categories: (guild.categories ?? []).map((category) => ({
      ...category,
      category_id: String(category.category_id),
    })),
  };
}

export interface GuildPreferences {
  id: string;
  command_prefix: string;
  language: string;
  timezone: string;
  embed_color: string;
  embed_footer: string;
  embed_footer_images: string[];
}

export interface MessageEmbed {
  title?: string;
  description?: string;
  color?: number;
  footer?: {
    text?: string;
    icon_url?: string;
  };
  author?: {
    name?: string;
    url?: string;
    icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
  image?: string;
  thumbnail?: string;
  timestamp?: string;
  url?: string;
}


export interface ButtonComponent {
  custom_id: string;
  label: string;
  style: 1 | 2 | 3 | 4 | 5 | 6;
  emoji?: GuildEmoji;
  url?: string;
  disabled?: boolean;
}


export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: GuildEmoji;
  default: boolean;
}

export interface MenuComponent {
  custom_id: string;
  placeholder: string;
  min_values: number;
  max_values: number;
  options: SelectOption[];
  disabled?: boolean;
}


export interface DiscordMessage {
  content?: string;
  embeds?: MessageEmbed[];
  components?: (ButtonComponent | MenuComponent)[];
  reactions?: GuildEmoji[];
}

export interface WelcomeConfig {
  id: string;
  enabled: boolean;
  welcome_channel_id?: string | null;
  goodbye_channel_id?: string | null;
  dm_new_users: boolean;
  welcome_message?: DiscordMessage;
  goodbye_message?: DiscordMessage;
  dm_message?: DiscordMessage;
  auto_roles: string[];
}

// ---------- Economy System ----------

// Mirror of plana_sdk.schemas.economy.MAX_* constants.
export const MAX_SHOP_ITEMS = 200;
export const MAX_REACTION_RULES = 20;

export type EarnSource =
  | 'message' | 'voice' | 'reaction' | 'daily' | 'weekly'
  | 'achievement' | 'level_up' | 'transfer' | 'admin_grant'
  | 'purchase' | 'purchase_refund';

export type ShopItemType = 'role' | 'xp_booster' | 'cosmetic';

export interface ReactionEarnRule {
  emoji: string | null;
  amount: number;
  daily_cap: number;
}

export interface RolePayload {
  type: 'role';
  role_id: string;
  duration_seconds: number | null;
}

export interface XPBoosterPayload {
  type: 'xp_booster';
  multiplier: number;
  duration_seconds: number;
}

export interface CosmeticPayload {
  type: 'cosmetic';
  tag: string | null;
}

export type ItemPayload = RolePayload | XPBoosterPayload | CosmeticPayload;

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  type: ShopItemType;
  price: number;
  stock: number | null;
  per_user_limit: number | null;
  required_role_ids: string[];
  purchasable: boolean;
  payload: ItemPayload;
}

export interface EconomyConfig {
  id: string;
  enabled: boolean;
  currency_name: string;
  currency_emoji_id: string | null;
  currency_emoji_name: string;
  starting_balance: number;
  message_amount: number;
  message_cooldown: number;
  voice_amount_per_minute: number;
  target_earn_channels: string[];
  target_earn_channels_mode: boolean;
  target_earn_roles: string[];
  target_earn_roles_mode: boolean;
  reaction_rules: ReactionEarnRule[];
  daily_amount: number;
  daily_streak_bonus: number;
  weekly_amount: number;
  weekly_streak_bonus: number;
  level_up_amount: number;
  transfer_enabled: boolean;
  transfer_tax_percent: number;
  shop_items: ShopItem[];
  purchase_channel_id: string | null;
  purchase_announcement: DiscordMessage | null;
  updated_at?: string;
}

// ---------- Levels ----------

export interface RoleReward {
  level: number;
  role_ids: string[];
}

export interface XPBooster {
  role_id: string;
  multiplier: number;
}

export interface LevelsConfig {
  id: string;
  enabled: boolean;
  announcement_type: 'current_channel' | 'custom_channel' | 'private_message' | 'disabled';
  announcement_channel_id?: string;
  announcement_message?: DiscordMessage;
  xp_per_message: number;
  xp_cooldown: number;
  base_xp: number;
  xp_multiplier: number;
  role_rewards: RoleReward[];
  xp_boosters: XPBooster[];
  target_xp_roles: string[];
  target_xp_roles_mode: boolean;
  target_xp_channels: string[];
  target_xp_channels_mode: boolean;
  stack_rewards: boolean;
  message_length_bonus: boolean;
  max_xp_per_message: number;
}

export type AchievementCriteriaType =
  | 'message_count'
  | 'character_count'
  | 'word_count'
  | 'attachment_count'
  | 'link_count'
  | 'mention_given'
  | 'mention_received'
  | 'reactions_given'
  | 'reactions_received'
  | 'voice_minutes'
  | 'mute_minutes'
  | 'deafen_minutes'
  | 'stream_minutes'
  | 'threads_created'
  | 'threads_participated'
  | 'slash_commands_used'
  | 'messages_deleted';

export interface CustomAchievement {
  name: string;
  icon_url?: string | null;
  criteria_type: AchievementCriteriaType;
  criteria_value: number;
  role_rewards: string[];
  xp_reward: number;
  coins_reward: number;
}

export interface AchievementsConfig {
  id: string;
  enabled: boolean;
  achievement_channel_id?: string | null;
  custom_achievements: CustomAchievement[];
  achievement_message?: DiscordMessage | null;
  updated_at?: string;
}

export interface RssFeed {
  id?: string;
  guild_id: string;
  channel_id: string | null;
  url: string;
  name: string | null;
  enabled: boolean;
  message: string | null;
  last_updated?: string;
}

export interface ReactRoleAssignment {
  role_ids: string[];
  trigger_id: string;
}

export type ReactRoleMode = 'toggle' | 'unique' | 'verify' | 'remove';

export interface ReactRole {
  id?: string;
  guild_id: string;
  message_id: string;
  name: string;
  role_assignments: ReactRoleAssignment[];
  mode: ReactRoleMode;
  enabled: boolean;
  updated_at?: string;
}

// Automod
export type AutomodRuleType =
  | 'spam'
  | 'invite_link'
  | 'mass_mention'
  | 'profanity'
  | 'link'
  | 'caps'
  | 'duplicate'
  | 'raid'
  | 'image_only'
  | 'video_only'
  | 'commands_only';

export type AutomodScopeType = 'server' | 'category' | 'channel';

export type AutomodActionType =
  | 'delete'
  | 'warn'
  | 'timeout'
  | 'kick'
  | 'ban'
  | 'log';

export interface AutomodAction {
  type: AutomodActionType;
  duration_seconds?: number;
  reason?: string;
}

export interface AutomodRule {
  id?: string;
  guild_id?: string;
  name: string;
  type: AutomodRuleType;
  enabled: boolean;
  scope_type: AutomodScopeType;
  scope_ids: string[];
  threshold: number;
  window_seconds: number;
  keywords: string[];
  exempt_channels: string[];
  exempt_categories: string[];
  exempt_roles: string[];
  log_channel_id?: string | null;
  actions: AutomodAction[];
  updated_at?: string;
}

// Custom commands
export type CustomCommandActionType = 'reply' | 'send_message' | 'add_role' | 'remove_role';

export interface CustomCommandAction {
  type: CustomCommandActionType;
  message?: DiscordMessage | null;
  channel_id?: string | null;
  role_id?: string | null;
}

export interface CustomCommand {
  id?: string;
  guild_id?: string;
  name: string;
  enabled: boolean;
  response?: string | null;
  embed?: MessageEmbed | null;
  actions: CustomCommandAction[];
  delete_invocation: boolean;
  cooldown_seconds: number;
  allowed_roles: string[];
  allowed_channels: string[];
  use_count: number;
  updated_at?: string;
}

// Statistic channels
export type StatisticChannelType =
  | 'members'
  | 'humans'
  | 'bots'
  | 'online'
  | 'boosts'
  | 'roles'
  | 'channels';

export interface StatisticChannel {
  id?: string;
  guild_id?: string;
  channel_id?: string | null;
  name: string;
  enabled: boolean;
  type: StatisticChannelType;
  template: string;
  update_interval_seconds: number;
  last_value?: number | null;
  last_updated_at?: string | null;
  updated_at?: string;
}

// Scheduled messages
export type ScheduledMessageType = 'recurring' | 'once';

export interface ScheduledMessage {
  id?: string;
  guild_id?: string;
  channel_id: string;
  name: string;
  enabled: boolean;
  schedule_type: ScheduledMessageType;
  cron?: string | null;
  run_at?: string | null;
  message: DiscordMessage;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  updated_at?: string;
}

export interface AiConfig {
  enabled: boolean;
  stream: boolean;
  engage_mode: boolean;
  engage_rate: number;
  memory_type: number;
  memory_limit: number;
  system_prompt: string;
  input_template: string;
  target_roles: string[];
  target_roles_mode: boolean;
  target_channels: string[];
  target_channels_mode: boolean;
  ai_moderation: boolean;
  reaction_responses: boolean;
}

export interface GuildMessage {
  id?: string;
  guild_id: string;
  channel_id: string;
  message_id?: string;
  name?: string;
  content?: string;
  embeds?: MessageEmbed[];
  components?: (ButtonComponent | MenuComponent)[];
  reactions?: GuildEmoji[];
  published: boolean;
  updated_at?: string;
}

import { getConfig } from './config';

// Use runtime config for API URLs (supports Docker runtime injection)
const getApiBaseUrl = () => getConfig().PLANA_API_URL;
const getFrontendUrl = () => getConfig().PLANA_SITE_URL;

/**
 * Cookie-based session — the API sets `plana_session` (httpOnly) and
 * `plana_csrf` (readable) on /auth/callback. The browser ships them on every
 * request automatically; for mutating requests we additionally send the CSRF
 * token in the X-CSRF-Token header (double-submit cookie pattern).
 *
 * When the UI and API are on different origins the `plana_csrf` cookie is not
 * readable via `document.cookie`.  In that case we obtain the token through
 * the postMessage payload sent by the OAuth popup and from the /auth/me
 * response, and store it in sessionStorage so it survives page refreshes.
 */
const CSRF_COOKIE = 'plana_csrf';
const CSRF_HEADER = 'X-CSRF-Token';
const CSRF_STORAGE_KEY = 'plana_csrf_token';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const target = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(target)) {
      return decodeURIComponent(trimmed.slice(target.length));
    }
  }
  return null;
}

function storeCsrfToken(token: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  }
}

function getStoredCsrfToken(): string | null {
  // Cookie is preferred (same-origin deployments); sessionStorage is the
  // fallback for cross-origin setups where document.cookie can't see the API.
  return readCookie(CSRF_COOKIE) ?? (
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(CSRF_STORAGE_KEY)
      : null
  );
}

export class PlanaSDK {
  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    const method = (options.method || 'GET').toUpperCase();
    if (MUTATING_METHODS.has(method)) {
      const csrf = getStoredCsrfToken();
      if (csrf) {
        headers.set(CSRF_HEADER, csrf);
      }
    }

    const response = await fetch(`${getApiBaseUrl()}/api${url}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Cookie expired — let the auth-context redirect to login.
        throw new Error('Authentication failed');
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response;
  }

  static async loginWithRedirect(): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/api/auth/url`);
    if (!response.ok) throw new Error('Failed to get auth URL');

    const { url } = await response.json();
    window.location.href = url;
  }

  /**
   * Open Discord OAuth in a popup. The API sets the session cookie on /callback
   * directly — the popup just signals completion via postMessage so we know
   * when to refresh the user. No token is exchanged in JS.
   */
  static async loginWithPopup(): Promise<User> {
    if (!window.open) {
      throw new Error('Popup authentication not supported');
    }

    const response = await fetch(`${getApiBaseUrl()}/api/auth/url`);
    if (!response.ok) throw new Error('Failed to get auth URL');

    const { url } = await response.json();
    const popupUrl = new URL(url);
    popupUrl.searchParams.set('popup', 'true');

    return new Promise((resolve, reject) => {
      const popup = window.open(
        popupUrl.toString(),
        'discord-oauth',
        'width=500,height=700,scrollbars=yes,resizable=yes',
      );

      if (!popup) {
        reject(new Error('Failed to open popup'));
        return;
      }

      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) popup.close();
      };

      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== getFrontendUrl() && event.origin !== getApiBaseUrl()) return;
        if (!event.data?.type) return;

        if (event.data.type === 'DISCORD_OAUTH_SUCCESS') {
          cleanup();
          if (event.data.csrfToken) {
            storeCsrfToken(event.data.csrfToken);
          }
          const user = await PlanaSDK.getCurrentUser();
          if (!user) {
            reject(new Error('Authentication completed but session is unreachable'));
            return;
          }
          resolve(user);
        } else if (event.data.type === 'DISCORD_OAUTH_ERROR') {
          cleanup();
          reject(new Error(event.data.error || 'Authentication failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          cleanup();
          reject(new Error('Popup closed'));
        }
      }, 1000);

      setTimeout(() => {
        clearInterval(checkClosed);
        cleanup();
        reject(new Error('Authentication timeout'));
      }, 300000);
    });
  }

  static async logout(): Promise<void> {
    try {
      await this.fetchWithAuth('/auth/logout', { method: 'POST' });
    } catch {
      // Even if the server rejects, the cookies will eventually expire.
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth('/auth/me');
      const data = await response.json();
      if (data.csrf_token) {
        storeCsrfToken(data.csrf_token);
      }
      return data.user;
    } catch {
      return null;
    }
  }

  static async getUserGuilds(): Promise<Guild[]> {
    const response = await this.fetchWithAuth('/auth/guilds');
    const data = await response.json();
    return data.guilds;
  }

  static async getGuildData(guildId: string): Promise<GuildData> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/data`);
    return normalizeGuildData(await response.json());
  }

  static async getGuildPreferences(guildId: string): Promise<GuildPreferences> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/preferences`);
    return response.json();
  }

  static async updateGuildPreferences(guildId: string, preferences: Partial<GuildPreferences>): Promise<GuildPreferences> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    return response.json();
  }

  static async resetGuildPreferences(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/preferences`, {
      method: 'DELETE'
    });
  }

  // Welcome System API
  static async getWelcomeConfig(guildId: string): Promise<WelcomeConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/welcome`);
    return normalizeWelcomeConfig(await response.json());
  }

  static async updateWelcomeConfig(guildId: string, config: Partial<WelcomeConfig>): Promise<WelcomeConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/welcome`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return normalizeWelcomeConfig(await response.json());
  }

  static async deleteWelcomeConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/welcome`, {
      method: 'DELETE'
    });
  }

  // Levels System API
  static async getLevelsConfig(guildId: string): Promise<LevelsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/levels`);
    return response.json();
  }

  static async updateLevelsConfig(guildId: string, config: Partial<LevelsConfig>): Promise<LevelsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/levels`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteLevelsConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/levels`, {
      method: 'DELETE'
    });
  }

  // Achievements System API
  static async getAchievementsConfig(guildId: string): Promise<AchievementsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/achievements`);
    return response.json();
  }

  static async createAchievementsConfig(guildId: string, config: Partial<AchievementsConfig>): Promise<AchievementsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/achievements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async updateAchievementsConfig(guildId: string, config: Partial<AchievementsConfig>): Promise<AchievementsConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/achievements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteAchievementsConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/achievements`, {
      method: 'DELETE'
    });
  }

  // RSS Feeds API
  static async getRssFeeds(guildId: string, limit: number = 50, offset: number = 0): Promise<{ data: RssFeed[], total_count: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss?limit=${limit}&offset=${offset}`);
    return response.json();
  }

  static async createRssFeed(guildId: string, feed: Omit<RssFeed, 'id' | 'last_updated'>): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed)
    });
    return response.json();
  }

  static async getRssFeed(guildId: string, feedId: string): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`);
    return response.json();
  }

  static async updateRssFeed(guildId: string, feedId: string, feed: Partial<RssFeed>): Promise<RssFeed> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feed)
    });
    return response.json();
  }

  static async deleteRssFeed(guildId: string, feedId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/rss/${feedId}`, {
      method: 'DELETE'
    });
  }

  // React Roles API
  static async getReactRoles(guildId: string): Promise<{ data: ReactRole[]; total_count: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles`);
    return response.json();
  }

  static async createReactRole(guildId: string, reactRole: Omit<ReactRole, 'id' | 'updated_at'>): Promise<ReactRole> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reactRole)
    });
    return response.json();
  }

  static async updateReactRole(guildId: string, reactRoleId: string, reactRole: Omit<ReactRole, 'id' | 'updated_at'>): Promise<ReactRole> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/react-roles/${reactRoleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reactRole)
    });
    return response.json();
  }

  static async deleteReactRole(guildId: string, reactRoleId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/react-roles/${reactRoleId}`, {
      method: 'DELETE'
    });
  }

  // Messages API
  static async getGuildMessages(guildId: string, limit = 50, offset = 0): Promise<{ data: GuildMessage[]; total: number }> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages?limit=${limit}&offset=${offset}`);
    return response.json();
  }

  static async createGuildMessage(guildId: string, message: Omit<GuildMessage, 'id' |  'updated_at'>): Promise<GuildMessage> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  static async updateGuildMessage(guildId: string, messageId: string, message: Partial<GuildMessage>): Promise<GuildMessage> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/messages/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    return response.json();
  }

  static async deleteGuildMessage(guildId: string, messageId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  // AI Configuration API
  static async getAiConfig(guildId: string): Promise<AiConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/ai`);
    return response.json();
  }

  static async updateAiConfig(guildId: string, config: Partial<AiConfig>): Promise<AiConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/ai`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  static async deleteAiConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/ai`, {
      method: 'DELETE'
    });
  }

  // Automod API
  static async getAutomodRules(
    guildId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ data: AutomodRule[]; total_count: number }> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/automod?limit=${limit}&offset=${offset}`,
    );
    return response.json();
  }

  static async createAutomodRule(
    guildId: string,
    rule: Omit<AutomodRule, 'id' | 'updated_at'>,
  ): Promise<AutomodRule> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/automod`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return response.json();
  }

  static async updateAutomodRule(
    guildId: string,
    ruleId: string,
    rule: AutomodRule,
  ): Promise<AutomodRule> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/automod/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return response.json();
  }

  static async deleteAutomodRule(guildId: string, ruleId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/automod/${ruleId}`, {
      method: 'DELETE',
    });
  }

  // Custom commands API
  static async getCustomCommands(
    guildId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ data: CustomCommand[]; total_count: number }> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/custom-commands?limit=${limit}&offset=${offset}`,
    );
    return response.json();
  }

  static async createCustomCommand(
    guildId: string,
    command: Omit<CustomCommand, 'id' | 'updated_at' | 'use_count'>,
  ): Promise<CustomCommand> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/custom-commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    return response.json();
  }

  static async updateCustomCommand(
    guildId: string,
    commandId: string,
    command: CustomCommand,
  ): Promise<CustomCommand> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/custom-commands/${commandId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      },
    );
    return response.json();
  }

  static async deleteCustomCommand(guildId: string, commandId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/custom-commands/${commandId}`, {
      method: 'DELETE',
    });
  }

  // Statistic channels API
  static async getStatisticChannels(
    guildId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ data: StatisticChannel[]; total_count: number }> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/statistics?limit=${limit}&offset=${offset}`,
    );
    return response.json();
  }

  static async createStatisticChannel(
    guildId: string,
    statistic: Omit<StatisticChannel, 'id' | 'updated_at' | 'last_value' | 'last_updated_at'>,
  ): Promise<StatisticChannel> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/statistics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statistic),
    });
    return response.json();
  }

  static async updateStatisticChannel(
    guildId: string,
    statisticId: string,
    statistic: StatisticChannel,
  ): Promise<StatisticChannel> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/statistics/${statisticId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statistic),
      },
    );
    return response.json();
  }

  static async deleteStatisticChannel(guildId: string, statisticId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/statistics/${statisticId}`, {
      method: 'DELETE',
    });
  }

  // Image upload API
  static async uploadGuildImage(guildId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new Headers();
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) {
      headers.set(CSRF_HEADER, csrf);
    }

    const response = await fetch(`${getApiBaseUrl()}/api/guilds/${guildId}/images`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url;
  }

  static async importGuildImageFromUrl(guildId: string, url: string): Promise<string> {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) headers.set(CSRF_HEADER, csrf);

    const response = await fetch(`${getApiBaseUrl()}/api/guilds/${guildId}/images/import`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication failed');
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Import failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url;
  }

  // Manager Roles API
  static async getManagerRoles(guildId: string): Promise<string[]> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/manager-roles`);
    const data = await response.json();
    return data.role_ids;
  }

  static async addManagerRole(guildId: string, roleId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/manager-roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: roleId }),
    });
  }

  static async removeManagerRole(guildId: string, roleId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/manager-roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  // Scheduled messages API
  static async getScheduledMessages(
    guildId: string,
    limit = 100,
    offset = 0,
  ): Promise<{ data: ScheduledMessage[]; total_count: number }> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/scheduled?limit=${limit}&offset=${offset}`,
    );
    return response.json();
  }

  static async createScheduledMessage(
    guildId: string,
    schedule: Omit<
      ScheduledMessage,
      'id' | 'updated_at' | 'last_run_at' | 'next_run_at' | 'run_count'
    >,
  ): Promise<ScheduledMessage> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/scheduled`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schedule),
    });
    return response.json();
  }

  static async updateScheduledMessage(
    guildId: string,
    scheduleId: string,
    schedule: ScheduledMessage,
  ): Promise<ScheduledMessage> {
    const response = await this.fetchWithAuth(
      `/guilds/${guildId}/scheduled/${scheduleId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      },
    );
    return response.json();
  }

  static async deleteScheduledMessage(
    guildId: string,
    scheduleId: string,
  ): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/scheduled/${scheduleId}`, {
      method: 'DELETE',
    });
  }

  // Economy System API
  static async getEconomyConfig(guildId: string): Promise<EconomyConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/economy`);
    return response.json();
  }

  static async createEconomyConfig(
    guildId: string,
    config: Partial<EconomyConfig>,
  ): Promise<EconomyConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/economy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return response.json();
  }

  static async updateEconomyConfig(
    guildId: string,
    config: Partial<EconomyConfig>,
  ): Promise<EconomyConfig> {
    const response = await this.fetchWithAuth(`/guilds/${guildId}/economy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return response.json();
  }

  static async deleteEconomyConfig(guildId: string): Promise<void> {
    await this.fetchWithAuth(`/guilds/${guildId}/economy`, { method: 'DELETE' });
  }
}

export function getDiscordAvatarUrl(user: User): string {
  if (!user.avatar) {
    const defaultAvatar = 0;
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

export function getDiscordGuildIconUrl(guild: Guild): string {
  return guild.icon 
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : '/default-guild-icon.png';
}

export function getDiscordGuildBannerUrl(guild: Guild): string | null {
  return guild.banner 
    ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.png`
    : null;
}

export function getBotInviteUrl(guildId?: string): string {
  const baseUrl = 'https://discord.com/api/oauth2/authorize';
  const params = new URLSearchParams({
    client_id: getConfig().DISCORD_BOT_ID,
    permissions: '8',
    scope: 'bot applications.commands'
  });
  
  if (guildId) {
    params.append('guild_id', guildId);
  }
  
  return `${baseUrl}?${params.toString()}`;
} 
