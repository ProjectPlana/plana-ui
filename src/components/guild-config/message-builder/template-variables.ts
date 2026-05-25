import type { TemplateVariable } from './types';

const USER_VARIABLES: TemplateVariable[] = [
  { name: 'user', description: 'Member display name' },
  { name: 'user.mention', description: 'Member mention' },
  { name: 'user.name', description: 'Discord username' },
  { name: 'user.display_name', description: 'Server display name' },
  { name: 'user.id', description: 'Member ID' },
  { name: 'user.avatar_url', description: 'Avatar URL' },
  { name: 'member.mention', description: 'Alias for user mention' },
  { name: 'member.name', description: 'Alias for username' },
];

const SERVER_VARIABLES: TemplateVariable[] = [
  { name: 'server', description: 'Server name' },
  { name: 'server.name', description: 'Server name' },
  { name: 'server.id', description: 'Server ID' },
  { name: 'server.member_count', description: 'Current member count' },
  { name: 'server.owner', description: 'Server owner display name' },
  { name: 'server.owner_id', description: 'Server owner ID' },
];

const CHANNEL_VARIABLES: TemplateVariable[] = [
  { name: 'channel', description: 'Channel name' },
  { name: 'channel.mention', description: 'Channel mention' },
  { name: 'channel.name', description: 'Channel name' },
  { name: 'channel.id', description: 'Channel ID' },
  { name: 'channel.type', description: 'Channel type' },
];

const MESSAGE_VARIABLES: TemplateVariable[] = [
  { name: 'message', description: 'Trigger message content' },
  { name: 'message.content', description: 'Trigger message content' },
  { name: 'message.id', description: 'Trigger message ID' },
  { name: 'message.jump_url', description: 'Link to trigger message' },
];

const COMMAND_VARIABLES: TemplateVariable[] = [
  { name: 'command', description: 'Custom command name' },
  { name: 'command.name', description: 'Custom command name' },
  { name: 'args', description: 'All arguments after the command name' },
  { name: 'arg.0', description: 'First argument' },
  { name: 'arg.1', description: 'Second argument' },
];

const EVENT_VARIABLES: TemplateVariable[] = [
  { name: 'event', description: 'Welcome event name' },
  { name: 'event.name', description: 'Welcome event name' },
];

export const WELCOME_PUBLIC_TEMPLATE_VARIABLES: TemplateVariable[] = [
  ...USER_VARIABLES,
  ...SERVER_VARIABLES,
  ...CHANNEL_VARIABLES,
  ...EVENT_VARIABLES,
];

export const WELCOME_DM_TEMPLATE_VARIABLES: TemplateVariable[] = [
  ...USER_VARIABLES,
  ...SERVER_VARIABLES,
  ...EVENT_VARIABLES,
];

export const CUSTOM_COMMAND_TEMPLATE_VARIABLES: TemplateVariable[] = [
  ...USER_VARIABLES,
  ...SERVER_VARIABLES,
  ...CHANNEL_VARIABLES,
  ...MESSAGE_VARIABLES,
  ...COMMAND_VARIABLES,
];

export const AI_INPUT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  ...USER_VARIABLES,
  ...SERVER_VARIABLES,
  ...CHANNEL_VARIABLES,
  ...MESSAGE_VARIABLES,
];

export const RSS_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'title', description: 'Article title' },
  { name: 'description', description: 'Article summary' },
  { name: 'link', description: 'Article URL' },
  { name: 'author', description: 'Article author' },
  { name: 'feedName', description: 'Configured feed name' },
  { name: 'feedUrl', description: 'Feed URL' },
  { name: 'categories', description: 'Article categories' },
  { name: 'pubDate', description: 'Published date and time' },
  { name: 'pubDateShort', description: 'Published date' },
  { name: 'pubDateTime', description: 'Published time' },
  { name: 'pubDateISO', description: 'ISO published timestamp' },
];

export const LEVEL_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'user', description: 'Member display name' },
  { name: 'user.mention', description: 'Member mention' },
  { name: 'user.name', description: 'Discord username' },
  { name: 'user.id', description: 'Member ID' },
  { name: 'level', description: 'New level' },
  { name: 'xp', description: 'Current XP' },
  { name: 'server', description: 'Server name' },
  { name: 'guild', description: 'Server name' },
  { name: 'channel', description: 'Trigger channel name' },
];

export const ECONOMY_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'user', description: 'Member display name' },
  { name: 'user.mention', description: 'Member mention' },
  { name: 'user.name', description: 'Discord username' },
  { name: 'user.id', description: 'Member ID' },
  { name: 'item.name', description: 'Purchased item name' },
  { name: 'item.price', description: 'Item price' },
  { name: 'item.type', description: 'Item type (role / xp_booster / cosmetic)' },
  { name: 'currency.name', description: 'Server currency name' },
  { name: 'currency.emoji', description: 'Currency emoji' },
  { name: 'wallet.balance', description: "Buyer's remaining balance after purchase" },
  { name: 'server', description: 'Server name' },
  { name: 'guild', description: 'Server name' },
];

export const ACHIEVEMENT_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: 'user', description: 'Member display name' },
  { name: 'user.mention', description: 'Member mention' },
  { name: 'user.name', description: 'Discord username' },
  { name: 'user.id', description: 'Member ID' },
  { name: 'achievement', description: 'Achievement name' },
  { name: 'achievement.name', description: 'Achievement name' },
  { name: 'achievement.criteria_type', description: 'Tracked criteria' },
  { name: 'achievement.criteria_value', description: 'Required value' },
  { name: 'server', description: 'Server name' },
  { name: 'guild', description: 'Server name' },
];
