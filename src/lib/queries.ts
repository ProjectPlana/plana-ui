'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PlanaSDK,
  type AchievementsConfig,
  type AiConfig,
  type AutomodRule,
  type CustomCommand,
  type EconomyConfig,
  type GuildMessage,
  type LevelsConfig,
  type ReactRole,
  type RssFeed,
  type ScheduledMessage,
  type StatisticChannel,
  type WelcomeConfig,
} from '@/lib/sdk';

const DEFAULT_LIMIT = 100;

export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
    guilds: () => ['auth', 'guilds'] as const,
  },
  guild: {
    data: (guildId: string) => ['guild', guildId, 'data'] as const,
    preferences: (guildId: string) => ['guild', guildId, 'preferences'] as const,
    welcome: (guildId: string) => ['guild', guildId, 'welcome'] as const,
    levels: (guildId: string) => ['guild', guildId, 'levels'] as const,
    achievements: (guildId: string) => ['guild', guildId, 'achievements'] as const,
    rss: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'rss', limit, offset] as const,
    reactRoles: (guildId: string) => ['guild', guildId, 'react-roles'] as const,
    messages: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'messages', limit, offset] as const,
    ai: (guildId: string) => ['guild', guildId, 'ai'] as const,
    automod: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'automod', limit, offset] as const,
    customCommands: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'custom-commands', limit, offset] as const,
    scheduled: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'scheduled', limit, offset] as const,
    statistics: (guildId: string, limit = DEFAULT_LIMIT, offset = 0) =>
      ['guild', guildId, 'statistics', limit, offset] as const,
    managerRoles: (guildId: string) => ['guild', guildId, 'manager-roles'] as const,
    economy: (guildId: string) => ['guild', guildId, 'economy'] as const,
  },
};

export function defaultWelcomeConfig(guildId: string): WelcomeConfig {
  return {
    id: guildId,
    enabled: false,
    dm_new_users: false,
    welcome_message: {
      content: 'Welcome {user.mention} to the server!',
      embeds: [
        {
          title: 'Welcome!',
          description: 'Thanks for joining our server!',
          color: 7506394,
        },
      ],
    },
    goodbye_message: {
      content: 'Goodbye {user.mention}!',
    },
    dm_message: {
      content: 'Welcome to our Discord server!',
    },
    auto_roles: [],
  };
}

export function defaultLevelsConfig(guildId: string): LevelsConfig {
  return {
    id: guildId,
    enabled: false,
    announcement_type: 'current_channel',
    announcement_message: {
      content: 'Congratulations {user.mention}! You reached level {level}!',
      embeds: [
        {
          title: 'Level Up!',
          description: "You've reached level {level}!",
          color: 7506394,
        },
      ],
    },
    xp_per_message: 15,
    xp_cooldown: 5,
    base_xp: 100,
    xp_multiplier: 1.2,
    role_rewards: [],
    xp_boosters: [],
    target_xp_roles: [],
    target_xp_roles_mode: false,
    target_xp_channels: [],
    target_xp_channels_mode: false,
    stack_rewards: true,
    message_length_bonus: true,
    max_xp_per_message: 25,
  };
}

export function defaultAchievementsConfig(guildId: string): AchievementsConfig {
  return {
    id: guildId,
    enabled: false,
    achievement_channel_id: null,
    custom_achievements: [],
    achievement_message: {
      content: '{user.mention} unlocked **{achievement.name}**!',
      embeds: [
        {
          title: 'Achievement Unlocked',
          description: '{achievement.name}',
          color: 16766720,
        },
      ],
    },
  };
}

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => PlanaSDK.getCurrentUser(),
    refetchInterval: (query) => (query.state.data ? 5 * 60 * 1000 : false),
  });
}

export function useUserGuildsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.auth.guilds(),
    queryFn: () => PlanaSDK.getUserGuilds(),
    enabled,
  });
}

export function useGuildDataQuery(guildId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.guild.data(guildId),
    queryFn: () => PlanaSDK.getGuildData(guildId),
    enabled: enabled && Boolean(guildId),
  });
}

export function useGuildPreferencesQuery(guildId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.guild.preferences(guildId),
    queryFn: () => PlanaSDK.getGuildPreferences(guildId),
    enabled: enabled && Boolean(guildId),
  });
}

export function useWelcomeConfigQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.welcome(guildId),
    queryFn: async () => {
      try {
        return await PlanaSDK.getWelcomeConfig(guildId);
      } catch {
        return defaultWelcomeConfig(guildId);
      }
    },
    enabled: Boolean(guildId),
  });
}

export function useLevelsConfigQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.levels(guildId),
    queryFn: async () => {
      try {
        return await PlanaSDK.getLevelsConfig(guildId);
      } catch {
        return defaultLevelsConfig(guildId);
      }
    },
    enabled: Boolean(guildId),
  });
}

export function useAchievementsConfigQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.achievements(guildId),
    queryFn: async () => {
      try {
        return await PlanaSDK.getAchievementsConfig(guildId);
      } catch {
        return defaultAchievementsConfig(guildId);
      }
    },
    enabled: Boolean(guildId),
  });
}

export function useRssFeedsQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.rss(guildId, limit, offset),
    queryFn: () => PlanaSDK.getRssFeeds(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useReactRolesQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.reactRoles(guildId),
    queryFn: () => PlanaSDK.getReactRoles(guildId),
    enabled: Boolean(guildId),
  });
}

export function useGuildMessagesQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.messages(guildId, limit, offset),
    queryFn: () => PlanaSDK.getGuildMessages(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useAiConfigQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.ai(guildId),
    queryFn: () => PlanaSDK.getAiConfig(guildId),
    enabled: Boolean(guildId),
  });
}

export function useAutomodRulesQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.automod(guildId, limit, offset),
    queryFn: () => PlanaSDK.getAutomodRules(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useCustomCommandsQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.customCommands(guildId, limit, offset),
    queryFn: () => PlanaSDK.getCustomCommands(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useScheduledMessagesQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.scheduled(guildId, limit, offset),
    queryFn: () => PlanaSDK.getScheduledMessages(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useStatisticChannelsQuery(guildId: string, limit = DEFAULT_LIMIT, offset = 0) {
  return useQuery({
    queryKey: queryKeys.guild.statistics(guildId, limit, offset),
    queryFn: () => PlanaSDK.getStatisticChannels(guildId, limit, offset),
    enabled: Boolean(guildId),
  });
}

export function useUpdateGuildPreferencesMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: Parameters<typeof PlanaSDK.updateGuildPreferences>[1]) =>
      PlanaSDK.updateGuildPreferences(guildId, preferences),
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKeys.guild.preferences(guildId), preferences);
    },
  });
}

export function useResetGuildPreferencesMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => PlanaSDK.resetGuildPreferences(guildId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guild.preferences(guildId) });
    },
  });
}

function scheduleGuildDataRefresh(queryClient: ReturnType<typeof useQueryClient>, guildId: string) {
  queryClient.invalidateQueries({ queryKey: queryKeys.guild.data(guildId) });
  window.setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.guild.data(guildId) });
  }, 3000);
}

export function useCreateGuildEmojiMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, file }: { name: string; file: File }) =>
      PlanaSDK.createGuildEmoji(guildId, name, file),
    onSuccess: () => scheduleGuildDataRefresh(queryClient, guildId),
  });
}

export function useDeleteGuildEmojiMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emojiId: string) => PlanaSDK.deleteGuildEmoji(guildId, emojiId),
    onSuccess: () => scheduleGuildDataRefresh(queryClient, guildId),
  });
}

export function useCreateGuildStickerMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string; emoji: string; file: File }) =>
      PlanaSDK.createGuildSticker(guildId, data),
    onSuccess: () => scheduleGuildDataRefresh(queryClient, guildId),
  });
}

export function useDeleteGuildStickerMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stickerId: string) => PlanaSDK.deleteGuildSticker(guildId, stickerId),
    onSuccess: () => scheduleGuildDataRefresh(queryClient, guildId),
  });
}

export function useUpdateWelcomeConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<WelcomeConfig>) =>
      PlanaSDK.updateWelcomeConfig(guildId, config),
    onSuccess: (config) => {
      queryClient.setQueryData(queryKeys.guild.welcome(guildId), config);
    },
  });
}

export function useUpdateLevelsConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<LevelsConfig>) =>
      PlanaSDK.updateLevelsConfig(guildId, config),
    onSuccess: (config) => {
      queryClient.setQueryData(queryKeys.guild.levels(guildId), config);
    },
  });
}

export function useDeleteLevelsConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => PlanaSDK.deleteLevelsConfig(guildId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.guild.levels(guildId), defaultLevelsConfig(guildId));
    },
  });
}

export function useUpdateAchievementsConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<AchievementsConfig>) => {
      try {
        return await PlanaSDK.updateAchievementsConfig(guildId, config);
      } catch {
        return PlanaSDK.createAchievementsConfig(guildId, config);
      }
    },
    onSuccess: (config) => {
      queryClient.setQueryData(queryKeys.guild.achievements(guildId), config);
    },
  });
}

export function useDeleteAchievementsConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => PlanaSDK.deleteAchievementsConfig(guildId),
    onSuccess: () => {
      queryClient.setQueryData(
        queryKeys.guild.achievements(guildId),
        defaultAchievementsConfig(guildId),
      );
    },
  });
}

export function useCreateRssFeedMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feed: Omit<RssFeed, 'id' | 'last_updated'>) =>
      PlanaSDK.createRssFeed(guildId, feed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'rss'] });
    },
  });
}

export function useUpdateRssFeedMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ feedId, feed }: { feedId: string; feed: Partial<RssFeed> }) =>
      PlanaSDK.updateRssFeed(guildId, feedId, feed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'rss'] });
    },
  });
}

export function useDeleteRssFeedMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (feedId: string) => PlanaSDK.deleteRssFeed(guildId, feedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'rss'] });
    },
  });
}

export function useSaveGuildMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: GuildMessage) =>
      message.id
        ? PlanaSDK.updateGuildMessage(guildId, message.id, message)
        : PlanaSDK.createGuildMessage(guildId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'messages'] });
    },
  });
}

export function useDeleteGuildMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => PlanaSDK.deleteGuildMessage(guildId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'messages'] });
    },
  });
}

export function useUpdateAiConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<AiConfig>) => PlanaSDK.updateAiConfig(guildId, config),
    onSuccess: (config) => {
      queryClient.setQueryData(queryKeys.guild.ai(guildId), config);
    },
  });
}

export function useDeleteAiConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => PlanaSDK.deleteAiConfig(guildId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guild.ai(guildId) });
    },
  });
}

export function useCreateAutomodRuleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule: Omit<AutomodRule, 'id' | 'updated_at'>) =>
      PlanaSDK.createAutomodRule(guildId, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'automod'] });
    },
  });
}

export function useUpdateAutomodRuleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rule: AutomodRule) => {
      if (!rule.id) throw new Error('Automod rule is missing an id');
      return PlanaSDK.updateAutomodRule(guildId, rule.id, rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'automod'] });
    },
  });
}

export function useDeleteAutomodRuleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => PlanaSDK.deleteAutomodRule(guildId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'automod'] });
    },
  });
}

export function useCreateCustomCommandMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: Omit<CustomCommand, 'id' | 'updated_at' | 'use_count'>) =>
      PlanaSDK.createCustomCommand(guildId, command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'custom-commands'] });
    },
  });
}

export function useUpdateCustomCommandMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (command: CustomCommand) => {
      if (!command.id) throw new Error('Custom command is missing an id');
      return PlanaSDK.updateCustomCommand(guildId, command.id, command);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'custom-commands'] });
    },
  });
}

export function useDeleteCustomCommandMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commandId: string) => PlanaSDK.deleteCustomCommand(guildId, commandId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'custom-commands'] });
    },
  });
}

export function useCreateStatisticChannelMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      statistic: Omit<StatisticChannel, 'id' | 'updated_at' | 'last_value' | 'last_updated_at'>,
    ) => PlanaSDK.createStatisticChannel(guildId, statistic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'statistics'] });
    },
  });
}

export function useUpdateStatisticChannelMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statistic: StatisticChannel) => {
      if (!statistic.id) throw new Error('Statistic channel is missing an id');
      return PlanaSDK.updateStatisticChannel(guildId, statistic.id, statistic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'statistics'] });
    },
  });
}

export function useDeleteStatisticChannelMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (statisticId: string) => PlanaSDK.deleteStatisticChannel(guildId, statisticId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'statistics'] });
    },
  });
}

export function useCreateScheduledMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      schedule: Omit<
        ScheduledMessage,
        'id' | 'updated_at' | 'last_run_at' | 'next_run_at' | 'run_count'
      >,
    ) => PlanaSDK.createScheduledMessage(guildId, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'scheduled'] });
    },
  });
}

export function useUpdateScheduledMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (schedule: ScheduledMessage) => {
      if (!schedule.id) throw new Error('Scheduled message is missing an id');
      return PlanaSDK.updateScheduledMessage(guildId, schedule.id, schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'scheduled'] });
    },
  });
}

export function useDeleteScheduledMessageMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => PlanaSDK.deleteScheduledMessage(guildId, scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'scheduled'] });
    },
  });
}

export function useUploadGuildImageMutation(guildId: string) {
  return useMutation({
    mutationFn: (file: File) => PlanaSDK.uploadGuildImage(guildId, file),
  });
}

export function useImportGuildImageMutation(guildId: string) {
  return useMutation({
    mutationFn: (url: string) => PlanaSDK.importGuildImageFromUrl(guildId, url),
  });
}

export function useSaveReactRoleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reactRole: ReactRole) =>
      reactRole.id
        ? PlanaSDK.updateReactRole(guildId, reactRole.id, reactRole)
        : PlanaSDK.createReactRole(guildId, reactRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'react-roles'] });
    },
  });
}

export function useDeleteReactRoleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reactRoleId: string) => PlanaSDK.deleteReactRole(guildId, reactRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guild', guildId, 'react-roles'] });
    },
  });
}

export function useManagerRolesQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.managerRoles(guildId),
    queryFn: () => PlanaSDK.getManagerRoles(guildId),
    enabled: Boolean(guildId),
  });
}

export function useAddManagerRoleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => PlanaSDK.addManagerRole(guildId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guild.managerRoles(guildId) });
    },
  });
}

export function useRemoveManagerRoleMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => PlanaSDK.removeManagerRole(guildId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guild.managerRoles(guildId) });
    },
  });
}

// ---------- Economy ----------

export function defaultEconomyConfig(guildId: string): EconomyConfig {
  return {
    id: guildId,
    enabled: false,
    currency_name: 'coins',
    currency_emoji_id: null,
    currency_emoji_name: 'coin',
    starting_balance: 0,
    message_amount: 1,
    message_cooldown: 60,
    voice_amount_per_minute: 1,
    target_earn_channels: [],
    target_earn_channels_mode: false,
    target_earn_roles: [],
    target_earn_roles_mode: false,
    reaction_rules: [],
    daily_amount: 50,
    daily_streak_bonus: 10,
    weekly_amount: 300,
    weekly_streak_bonus: 50,
    level_up_amount: 0,
    transfer_enabled: true,
    transfer_tax_percent: 0,
    shop_items: [],
    purchase_channel_id: null,
    purchase_announcement: null,
  };
}

export function useEconomyConfigQuery(guildId: string) {
  return useQuery({
    queryKey: queryKeys.guild.economy(guildId),
    queryFn: () => PlanaSDK.getEconomyConfig(guildId),
    enabled: Boolean(guildId),
  });
}

export function useUpdateEconomyConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: EconomyConfig) => PlanaSDK.updateEconomyConfig(guildId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.guild.economy(guildId), data);
    },
  });
}

export function useCreateEconomyConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: EconomyConfig) => PlanaSDK.createEconomyConfig(guildId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.guild.economy(guildId), data);
    },
  });
}

export function useDeleteEconomyConfigMutation(guildId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => PlanaSDK.deleteEconomyConfig(guildId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.guild.economy(guildId) });
    },
  });
}
