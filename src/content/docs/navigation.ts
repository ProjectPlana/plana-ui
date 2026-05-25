export interface DocSection {
  id: string;
  label: string;
}

export type DocGroupId = 'features' | 'wiki' | 'resources' | 'legal';

export interface DocRouteMeta {
  href: string;
  group: DocGroupId;
  slug?: string;
  eyebrow: string;
  title: string;
  navTitle: string;
  navDescription: string;
  description: string;
  sections: DocSection[];
}

export interface DocNavigationGroup {
  id: DocGroupId;
  title: string;
  items: DocRouteMeta[];
}

export const docsNavigationGroups: DocNavigationGroup[] = [
  {
    id: 'features',
    title: 'Features',
    items: [
      {
        href: '/features',
        group: 'features',
        eyebrow: 'Feature Docs',
        title: 'Project Plana Features',
        navTitle: 'Feature Overview',
        navDescription: 'What Project Plana can handle for a Discord server.',
        description:
          'A practical guide to the systems available in the Project Plana dashboard.',
        sections: [
          { id: 'overview', label: 'Overview' },
          { id: 'feature-map', label: 'Feature Map' },
          { id: 'setup-order', label: 'Setup Order' },
        ],
      },
      {
        href: '/features/community',
        group: 'features',
        slug: 'community',
        eyebrow: 'Feature Docs',
        title: 'Community Systems',
        navTitle: 'Community',
        navDescription: 'Welcome flows, levels, achievements, roles, and economy.',
        description:
          'Member-facing systems for onboarding, progression, self-serve roles, and server participation.',
        sections: [
          { id: 'welcome', label: 'Welcome' },
          { id: 'levels', label: 'Levels' },
          { id: 'achievements', label: 'Achievements' },
          { id: 'reaction-roles', label: 'Reaction Roles' },
          { id: 'economy', label: 'Economy' },
        ],
      },
      {
        href: '/features/automation',
        group: 'features',
        slug: 'automation',
        eyebrow: 'Feature Docs',
        title: 'Content And Automation',
        navTitle: 'Automation',
        navDescription: 'Messages, schedules, RSS, and custom commands.',
        description:
          'Tools for publishing repeatable content, automating announcements, and building server-specific shortcuts.',
        sections: [
          { id: 'custom-messages', label: 'Custom Messages' },
          { id: 'scheduled-messages', label: 'Scheduled Messages' },
          { id: 'rss-feeds', label: 'RSS Feeds' },
          { id: 'custom-commands', label: 'Custom Commands' },
          { id: 'message-builder', label: 'Message Builder' },
        ],
      },
      {
        href: '/features/moderation',
        group: 'features',
        slug: 'moderation',
        eyebrow: 'Feature Docs',
        title: 'Moderation And Safety',
        navTitle: 'Moderation',
        navDescription: 'Automod, prune tools, punishments, and audit flow.',
        description:
          'Safety features for reducing spam, enforcing server rules, and giving moderators clear action paths.',
        sections: [
          { id: 'automod', label: 'Automod' },
          { id: 'moderation-actions', label: 'Moderation Actions' },
          { id: 'message-cleanup', label: 'Message Cleanup' },
          { id: 'permissions', label: 'Permissions' },
        ],
      },
      {
        href: '/features/operations',
        group: 'features',
        slug: 'operations',
        eyebrow: 'Feature Docs',
        title: 'Operations And Intelligence',
        navTitle: 'Operations',
        navDescription: 'Statistics, server structure, emoji tools, AI, and music.',
        description:
          'Operational tools for checking server health, managing assets, and extending the bot with AI and utility features.',
        sections: [
          { id: 'statistics', label: 'Statistics' },
          { id: 'server-structure', label: 'Server Structure' },
          { id: 'emojis', label: 'Emojis' },
          { id: 'ai', label: 'AI' },
          { id: 'music', label: 'Music' },
        ],
      },
    ],
  },
  {
    id: 'wiki',
    title: 'Wiki',
    items: [
      {
        href: '/wiki',
        group: 'wiki',
        eyebrow: 'Wiki',
        title: 'Getting Started',
        navTitle: 'Getting Started',
        navDescription: 'Invite the bot and connect the dashboard.',
        description:
          'The shortest reliable path from a fresh Discord server to a working Project Plana setup.',
        sections: [
          { id: 'requirements', label: 'Requirements' },
          { id: 'invite', label: 'Invite' },
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'first-save', label: 'First Save' },
        ],
      },
      {
        href: '/wiki/dashboard',
        group: 'wiki',
        slug: 'dashboard',
        eyebrow: 'Wiki',
        title: 'Dashboard Guide',
        navTitle: 'Dashboard',
        navDescription: 'How the configuration workspace is organized.',
        description:
          'A tour of the guild dashboard, feature tabs, save behavior, and safe testing workflow.',
        sections: [
          { id: 'workspace', label: 'Workspace' },
          { id: 'feature-tabs', label: 'Feature Tabs' },
          { id: 'drafts-and-saving', label: 'Drafts & Saving' },
          { id: 'testing', label: 'Testing' },
        ],
      },
      {
        href: '/wiki/message-builder',
        group: 'wiki',
        slug: 'message-builder',
        eyebrow: 'Wiki',
        title: 'Message Builder',
        navTitle: 'Message Builder',
        navDescription: 'Reusable content, embeds, previews, and variables.',
        description:
          'How to build Discord messages that stay readable across welcome flows, scheduled posts, commands, and announcements.',
        sections: [
          { id: 'where-it-appears', label: 'Where It Appears' },
          { id: 'embeds', label: 'Embeds' },
          { id: 'variables', label: 'Variables' },
          { id: 'mobile-readability', label: 'Mobile Readability' },
        ],
      },
      {
        href: '/wiki/permissions',
        group: 'wiki',
        slug: 'permissions',
        eyebrow: 'Wiki',
        title: 'Permissions And Troubleshooting',
        navTitle: 'Permissions',
        navDescription: 'Discord role hierarchy, channel access, and common fixes.',
        description:
          'Operational checks for the most common reasons bot features do not fire, post, or assign roles.',
        sections: [
          { id: 'role-hierarchy', label: 'Role Hierarchy' },
          { id: 'channel-access', label: 'Channel Access' },
          { id: 'troubleshooting', label: 'Troubleshooting' },
          { id: 'safe-rollout', label: 'Safe Rollout' },
        ],
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    items: [
      {
        href: '/commands',
        group: 'resources',
        eyebrow: 'Commands',
        title: 'Command Reference',
        navTitle: 'Commands',
        navDescription: 'Slash and hybrid commands available in the bot.',
        description:
          'A categorized reference for member commands, moderator actions, automation commands, and administrator-only tools.',
        sections: [
          { id: 'usage', label: 'Usage' },
          { id: 'moderation', label: 'Moderation' },
          { id: 'messages', label: 'Messages' },
          { id: 'community', label: 'Community' },
          { id: 'automation', label: 'Automation' },
          { id: 'utility', label: 'Utility' },
        ],
      },
      {
        href: '/support',
        group: 'resources',
        eyebrow: 'Support',
        title: 'Support',
        navTitle: 'Support',
        navDescription: 'How to get help and report useful details.',
        description:
          'Support paths, issue-reporting guidance, and the information maintainers need to diagnose a server problem quickly.',
        sections: [
          { id: 'before-asking', label: 'Before Asking' },
          { id: 'where-to-go', label: 'Where To Go' },
          { id: 'report-template', label: 'Report Template' },
          { id: 'maintenance', label: 'Maintenance' },
        ],
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal',
    items: [
      {
        href: '/privacy',
        group: 'legal',
        eyebrow: 'Legal',
        title: 'Privacy Policy',
        navTitle: 'Privacy Policy',
        navDescription: 'What the bot and dashboard collect and why.',
        description:
          'A plain-language privacy policy for Project Plana users and server administrators.',
        sections: [
          { id: 'summary', label: 'Summary' },
          { id: 'data-collected', label: 'Data Collected' },
          { id: 'how-data-is-used', label: 'How Data Is Used' },
          { id: 'retention', label: 'Retention' },
          { id: 'your-choices', label: 'Your Choices' },
        ],
      },
      {
        href: '/terms',
        group: 'legal',
        eyebrow: 'Legal',
        title: 'Terms Of Service',
        navTitle: 'Terms Of Service',
        navDescription: 'Rules for using Project Plana.',
        description:
          'The baseline terms for inviting, configuring, and using Project Plana in a Discord server.',
        sections: [
          { id: 'acceptance', label: 'Acceptance' },
          { id: 'acceptable-use', label: 'Acceptable Use' },
          { id: 'availability', label: 'Availability' },
          { id: 'administrator-responsibility', label: 'Admin Responsibility' },
          { id: 'changes', label: 'Changes' },
        ],
      },
    ],
  },
];

export const docsRoutes = docsNavigationGroups.flatMap((group) => group.items);

export function getDocRouteByHref(href: string): DocRouteMeta | undefined {
  return docsRoutes.find((route) => route.href === href);
}

export function getDocRouteBySlug(group: DocGroupId, slug?: string): DocRouteMeta | undefined {
  return docsRoutes.find((route) => route.group === group && route.slug === slug);
}

export function getAdjacentDocRoutes(href: string) {
  const index = docsRoutes.findIndex((route) => route.href === href);

  return {
    previous: index > 0 ? docsRoutes[index - 1] : undefined,
    next: index >= 0 && index < docsRoutes.length - 1 ? docsRoutes[index + 1] : undefined,
  };
}
