import type { ReactNode } from 'react';
import { getDocRouteByHref, type DocRouteMeta } from './navigation';

interface CommandRow {
  command: string;
  description: string;
  permission: string;
}

interface DocPageContent {
  meta: DocRouteMeta;
  content: ReactNode;
}

function FeatureGrid({
  items,
}: {
  items: Array<{ title: string; body: string; href?: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="rounded-lg border bg-background p-4">
          <h3>{item.title}</h3>
          <p>{item.body}</p>
          {item.href ? (
            <a href={item.href} className="doc-link">
              Open guide
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return <div className="doc-callout">{children}</div>;
}

function CommandTable({ rows }: { rows: CommandRow[] }) {
  return (
    <div className="doc-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What it does</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.command}>
              <td>
                <code>{row.command}</code>
              </td>
              <td>{row.description}</td>
              <td>{row.permission}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const contentByHref: Record<string, ReactNode> = {
  '/features': (
    <>
      <section id="overview">
        <h2>Overview</h2>
        <p>
          Project Plana is a MEE6-like Discord bot for server setup, moderation,
          community engagement, and routine automation. The dashboard is organized by
          guild, so each server can enable only the systems it needs.
        </p>
        <p>
          The interface covers preferences, welcome messages, levels, achievements,
          economy, reaction roles, custom messages, RSS feeds, automod, custom
          commands, scheduled messages, statistic channels, emoji management, server
          structure, and AI behavior.
        </p>
      </section>

      <section id="feature-map">
        <h2>Feature Map</h2>
        <FeatureGrid
          items={[
            {
              title: 'Community Systems',
              body: 'Welcome flows, level progression, achievements, reaction roles, and server economy for member engagement.',
              href: '/features/community',
            },
            {
              title: 'Content And Automation',
              body: 'Reusable messages, scheduled posts, RSS feeds, and custom commands for repeatable server workflows.',
              href: '/features/automation',
            },
            {
              title: 'Moderation And Safety',
              body: 'Automod, moderation commands, warning records, and targeted message cleanup for staff teams.',
              href: '/features/moderation',
            },
            {
              title: 'Operations And Intelligence',
              body: 'Statistic channels, server structure, emoji views, AI settings, and utility commands for day-to-day operations.',
              href: '/features/operations',
            },
          ]}
        />
      </section>

      <section id="setup-order">
        <h2>Setup Order</h2>
        <ol>
          <li>Invite Project Plana and confirm the bot role is above roles it must manage.</li>
          <li>Set guild language, timezone, and shared message assets in General Settings.</li>
          <li>Configure member-facing basics: welcome messages, roles, and key information panels.</li>
          <li>Add engagement systems such as levels, achievements, and economy once the basics are stable.</li>
          <li>Enable automod conservatively, test with staff, and then tighten rules over time.</li>
          <li>Add scheduled messages, RSS feeds, statistic channels, and custom commands after the core setup works.</li>
        </ol>
        <Callout>
          <p>
            For a new server, start with the features members see every day. Add
            automation and strict moderation after you have verified permissions and
            channel targets.
          </p>
        </Callout>
      </section>
    </>
  ),

  '/features/community': (
    <>
      <section id="welcome">
        <h2>Welcome</h2>
        <p>
          The Welcome System controls join messages, leave messages, and direct
          messages for new members. Use it to point people toward rules, role menus,
          introductions, or first-step channels.
        </p>
        <ul>
          <li>Choose the target channel for public welcome and goodbye messages.</li>
          <li>Use direct messages only for concise onboarding, since users can block bot DMs.</li>
          <li>Preview rich messages before publishing so embeds stay readable on mobile.</li>
        </ul>
      </section>

      <section id="levels">
        <h2>Levels</h2>
        <p>
          Levels track XP and member activity. Servers can show rank cards, publish
          level-up messages, and assign reward roles at milestones.
        </p>
        <ul>
          <li>Use <code>/levels rank</code> for member progress and <code>/levels leaderboard</code> for server standings.</li>
          <li>Keep role rewards meaningful but avoid granting powerful roles too early.</li>
          <li>Administrators can toggle the system and grant XP when manual correction is needed.</li>
        </ul>
      </section>

      <section id="achievements">
        <h2>Achievements</h2>
        <p>
          Achievements extend progression with custom milestones. They can track
          message counts, words, attachments, links, mentions, reactions, voice time,
          threads, slash command usage, and moderation activity.
        </p>
        <ul>
          <li>Create achievements around behavior the server wants to encourage.</li>
          <li>Attach optional reward roles when milestones should have visible status.</li>
          <li>Customize unlock messages so achievements feel intentional rather than automated noise.</li>
        </ul>
      </section>

      <section id="reaction-roles">
        <h2>Reaction Roles</h2>
        <p>
          Reaction Roles let members assign roles to themselves through reactions,
          buttons, or dropdown menus. They are useful for notification roles,
          interests, regions, pronouns, event pings, and access gates.
        </p>
        <ul>
          <li>Use dropdown menus when a panel has many options.</li>
          <li>Use buttons for short, high-frequency choices.</li>
          <li>Keep the bot role above every role it needs to assign or remove.</li>
        </ul>
      </section>

      <section id="economy">
        <h2>Economy</h2>
        <p>
          Economy features create a server currency loop with balances, daily and
          weekly rewards, transfers, leaderboards, and a configurable shop.
        </p>
        <ul>
          <li>Enable transfers only when your staff is ready to handle abuse reports.</li>
          <li>Use shop items for role rewards, boosters, and cosmetics.</li>
          <li>Check the economy leaderboard to understand whether rewards are balanced.</li>
        </ul>
      </section>
    </>
  ),

  '/features/automation': (
    <>
      <section id="custom-messages">
        <h2>Custom Messages</h2>
        <p>
          Custom Messages are reusable Discord posts that can be drafted, previewed,
          and published to selected channels. They work well for rules, information
          panels, announcements, and onboarding checklists.
        </p>
      </section>

      <section id="scheduled-messages">
        <h2>Scheduled Messages</h2>
        <p>
          Scheduled Messages post once or on a recurring cron schedule. Times use the
          guild timezone when configured, otherwise UTC.
        </p>
        <ul>
          <li>Use staff-only test channels before posting recurring public reminders.</li>
          <li>Keep recurring messages short and update stale event links quickly.</li>
          <li>Review schedules after changing the guild timezone.</li>
        </ul>
      </section>

      <section id="rss-feeds">
        <h2>RSS Feeds</h2>
        <p>
          RSS Feeds post new entries into Discord channels. Each feed can be enabled
          or disabled and supports a message template with feed placeholders such as
          <code>title</code>, <code>description</code>, and <code>link</code>.
        </p>
      </section>

      <section id="custom-commands">
        <h2>Custom Commands</h2>
        <p>
          Custom Commands define server-specific prefix commands with chained actions.
          A command can reply in the current channel, send a message elsewhere, add a
          role, or remove a role.
        </p>
        <ul>
          <li>Use command names that are short and unambiguous.</li>
          <li>Add cooldowns for commands that can mention roles or create channel noise.</li>
          <li>Use the <code>/cc list</code> and <code>/cc delete</code> management commands for quick cleanup.</li>
        </ul>
      </section>

      <section id="message-builder">
        <h2>Message Builder</h2>
        <p>
          The shared message builder powers welcome messages, achievements, custom
          messages, scheduled posts, and command responses. It supports plain content,
          embeds, fields, author blocks, thumbnails, images, and footers.
        </p>
        <Callout>
          <p>
            Put the most important text in the message body or embed description.
            Fields are useful for structured details, but long field text becomes hard
            to scan on phones.
          </p>
        </Callout>
      </section>
    </>
  ),

  '/features/moderation': (
    <>
      <section id="automod">
        <h2>Automod</h2>
        <p>
          Automod provides configurable rules for spam, invite links, profanity, and
          raid behavior. It works best as a policy layer over Discord permissions,
          not as a replacement for staff judgment.
        </p>
        <ul>
          <li>Start with conservative rules and review false positives before tightening actions.</li>
          <li>Document what each rule does so moderators understand the enforcement path.</li>
          <li>Keep staff and announcement channels exempt when needed.</li>
        </ul>
      </section>

      <section id="moderation-actions">
        <h2>Moderation Actions</h2>
        <p>
          Moderator commands cover bans, unbans, kicks, timeouts, warning records,
          mute role workflows, and role hierarchy checks.
        </p>
        <ul>
          <li>Commands validate common unsafe cases such as acting on yourself or the server owner.</li>
          <li>Temporary actions accept duration strings like <code>1d</code>, <code>2h</code>, or <code>30m</code>.</li>
          <li>Reasons are included in logs and member notifications where supported.</li>
        </ul>
      </section>

      <section id="message-cleanup">
        <h2>Message Cleanup</h2>
        <p>
          The prune command group removes messages by type, author, content match,
          regular expression, invite links, URLs, bots, users, pins, reactions, and
          self-cleanup.
        </p>
        <p>
          Most cleanup commands require Manage Messages. Member self-cleanup is more
          limited and has its own cooldown.
        </p>
      </section>

      <section id="permissions">
        <h2>Permissions</h2>
        <p>
          Project Plana can only perform actions allowed by Discord. Put the bot role
          above roles it should assign, mute, or remove, and grant channel access only
          where the bot should read or post.
        </p>
        <Callout>
          <p>
            If a moderation command fails, check Discord role hierarchy before changing
            dashboard settings. Hierarchy issues are the most common cause of role and
            punishment failures.
          </p>
        </Callout>
      </section>
    </>
  ),

  '/features/operations': (
    <>
      <section id="statistics">
        <h2>Statistics</h2>
        <p>
          Statistic Channels keep channel names updated with counters for members,
          humans, bots, online users, boosts, roles, and channels.
        </p>
        <ul>
          <li>Use clear channel name templates so counters remain understandable.</li>
          <li>Avoid creating more counters than staff actually use.</li>
          <li>Confirm the bot can manage the statistic channels it updates.</li>
        </ul>
      </section>

      <section id="server-structure">
        <h2>Server Structure</h2>
        <p>
          Server Structure gives staff a read-only operational view of channels,
          categories, members, and roles. It is useful before changing permissions,
          moving configuration, or diagnosing missing targets.
        </p>
      </section>

      <section id="emojis">
        <h2>Emojis</h2>
        <p>
          Emojis and stickers can be reviewed from the dashboard, which helps servers
          with large asset libraries keep track of custom assets.
        </p>
      </section>

      <section id="ai">
        <h2>AI</h2>
        <p>
          AI Intelligence configures Project Plana AI behavior at guild, category, and
          channel levels. Administrators can toggle AI and clear memory from Discord
          when needed.
        </p>
        <ul>
          <li>Use channel-level settings for areas that need stricter behavior.</li>
          <li>Clear memory after test sessions or policy changes.</li>
          <li>Keep AI enabled only in channels where members expect bot responses.</li>
        </ul>
      </section>

      <section id="music">
        <h2>Music</h2>
        <p>
          Music commands provide queue-based playback, skip votes, forced skips,
          looping, volume, pause, resume, stop, disconnect, shuffle, now playing, and
          queue clearing.
        </p>
        <p>
          Voice commands depend on voice channel access and should be tested with the
          same permissions regular members will have.
        </p>
      </section>
    </>
  ),

  '/wiki': (
    <>
      <section id="requirements">
        <h2>Requirements</h2>
        <p>
          You need a Discord account, permission to add bots to the target server, and
          enough server permissions to configure channels, roles, and bot access.
        </p>
        <ul>
          <li>Administrator access is easiest during setup, but narrower permissions can work after setup.</li>
          <li>The bot role must be high enough for role assignment and moderation features.</li>
          <li>Channel permissions must allow Project Plana to read, send, and manage content where required.</li>
        </ul>
      </section>

      <section id="invite">
        <h2>Invite</h2>
        <ol>
          <li>Open the Project Plana site and use the invite action.</li>
          <li>Select the Discord server where you have Manage Server permission.</li>
          <li>Review requested permissions and complete the Discord authorization flow.</li>
          <li>Move the Project Plana role into the correct place in the role list.</li>
        </ol>
      </section>

      <section id="dashboard">
        <h2>Dashboard</h2>
        <p>
          Sign in with Discord, open the dashboard, and select the guild you want to
          configure. The dashboard shows only servers available to your account.
        </p>
        <p>
          If a server is missing, confirm that you have the required Discord permission
          and that the bot has been invited to that server.
        </p>
      </section>

      <section id="first-save">
        <h2>First Save</h2>
        <p>
          Start in General Settings. Set language, timezone, and shared message assets
          before configuring features that depend on local time or reusable branding.
        </p>
        <Callout>
          <p>
            Save and test one feature at a time. When channel, permission, trigger, and
            message changes are mixed together, failures take longer to diagnose.
          </p>
        </Callout>
      </section>
    </>
  ),

  '/wiki/dashboard': (
    <>
      <section id="workspace">
        <h2>Workspace</h2>
        <p>
          Each guild opens into a configuration workspace with feature tabs in the
          sidebar and the selected editor in the main panel. The current tab is stored
          in the URL, so staff can share a direct link to the relevant area.
        </p>
      </section>

      <section id="feature-tabs">
        <h2>Feature Tabs</h2>
        <FeatureGrid
          items={[
            { title: 'General Settings', body: 'Language, timezone, and shared bot preferences.' },
            { title: 'Member Experience', body: 'Welcome System, Levels, Achievements, Economy, and Reaction Roles.' },
            { title: 'Automation', body: 'Custom Messages, RSS Feeds, Scheduled Messages, and Custom Commands.' },
            { title: 'Operations', body: 'Automod, Statistics, Emojis, Server Structure, and AI Intelligence.' },
          ]}
        />
      </section>

      <section id="drafts-and-saving">
        <h2>Drafts And Saving</h2>
        <p>
          Many feature pages show total, active, and draft counts. Drafts let staff
          prepare content or configuration without publishing it immediately.
        </p>
        <ul>
          <li>Use drafts for large role menus, announcement panels, and scheduled content.</li>
          <li>Review previews before enabling member-facing messages.</li>
          <li>Keep inactive items named clearly so staff understand why they exist.</li>
        </ul>
      </section>

      <section id="testing">
        <h2>Testing</h2>
        <p>
          Test new features in private channels or with staff roles first. Confirm the
          bot can see the channel, send messages, embed links, manage roles, and perform
          the exact action you expect.
        </p>
      </section>
    </>
  ),

  '/wiki/message-builder': (
    <>
      <section id="where-it-appears">
        <h2>Where It Appears</h2>
        <p>
          The message builder appears in welcome, goodbye, join-DM, level-up,
          achievement, custom message, scheduled message, and custom command workflows.
        </p>
      </section>

      <section id="embeds">
        <h2>Embeds</h2>
        <p>
          Embeds can include titles, descriptions, fields, authors, images, thumbnails,
          and footers. Use them for structured information, but keep the main message
          understandable without relying on a large image.
        </p>
        <ul>
          <li>Use one primary idea per embed.</li>
          <li>Keep field names short and field values scannable.</li>
          <li>Preview messages in dark and light themes when color contrast matters.</li>
        </ul>
      </section>

      <section id="variables">
        <h2>Variables</h2>
        <p>
          Template variables use <code>{'{name}'}</code> syntax. Unknown or unavailable
          variables are left unchanged, which makes missing context visible during
          testing.
        </p>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Context</th>
                <th>Variables</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>User or member</td>
                <td><code>{'{user}'}</code>, <code>{'{user.mention}'}</code>, <code>{'{user.name}'}</code>, <code>{'{member.mention}'}</code></td>
              </tr>
              <tr>
                <td>Server</td>
                <td><code>{'{server.name}'}</code>, <code>{'{server.id}'}</code>, <code>{'{server.member_count}'}</code>, <code>{'{server.owner}'}</code></td>
              </tr>
              <tr>
                <td>Channel</td>
                <td><code>{'{channel.name}'}</code>, <code>{'{channel.mention}'}</code>, <code>{'{channel.id}'}</code>, <code>{'{channel.type}'}</code></td>
              </tr>
              <tr>
                <td>Trigger message</td>
                <td><code>{'{message.content}'}</code>, <code>{'{message.id}'}</code>, <code>{'{message.jump_url}'}</code></td>
              </tr>
              <tr>
                <td>Custom commands</td>
                <td><code>{'{args}'}</code>, <code>{'{arg.0}'}</code>, <code>{'{command.name}'}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="mobile-readability">
        <h2>Mobile Readability</h2>
        <p>
          Discord messages are often read on phones. Keep lines short, avoid dense
          field grids, and put critical instructions near the top of the message.
        </p>
      </section>
    </>
  ),

  '/wiki/permissions': (
    <>
      <section id="role-hierarchy">
        <h2>Role Hierarchy</h2>
        <p>
          Discord prevents bots from managing roles and members above their highest
          role. Place the Project Plana role above assignable roles, muted roles, and
          roles involved in moderation actions.
        </p>
      </section>

      <section id="channel-access">
        <h2>Channel Access</h2>
        <p>
          For posting features, the bot needs channel visibility and send permission.
          For embeds and links, it also needs embed/link permissions. For cleanup, it
          needs Manage Messages.
        </p>
      </section>

      <section id="troubleshooting">
        <h2>Troubleshooting</h2>
        <div className="doc-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Most likely check</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Bot does not post</td><td>Channel visibility, Send Messages, disabled feature, or wrong target channel.</td></tr>
              <tr><td>Role is not assigned</td><td>Bot role hierarchy and Manage Roles permission.</td></tr>
              <tr><td>Schedule fires at the wrong time</td><td>Guild timezone in General Settings.</td></tr>
              <tr><td>RSS feed stays quiet</td><td>Feed URL, enabled state, channel selection, and whether the feed has new entries.</td></tr>
              <tr><td>Automod misses content</td><td>Rule enabled state, trigger settings, exemptions, and Discord permissions.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="safe-rollout">
        <h2>Safe Rollout</h2>
        <ol>
          <li>Configure the feature in a staff-only channel first.</li>
          <li>Verify bot permissions using a real test action.</li>
          <li>Enable the feature for a limited public area.</li>
          <li>Review logs and member feedback before expanding scope.</li>
        </ol>
      </section>
    </>
  ),

  '/commands': (
    <>
      <section id="usage">
        <h2>Usage</h2>
        <p>
          Project Plana uses Discord slash and hybrid commands. In most servers,
          commands are available as slash commands such as <code>/ping</code> or grouped
          commands such as <code>/levels rank</code>.
        </p>
        <Callout>
          <p>
            Discord permissions still apply. If a command is visible but fails, check
            the invoking member permissions, the bot permissions, and role hierarchy.
          </p>
        </Callout>
      </section>

      <section id="moderation">
        <h2>Moderation</h2>
        <CommandTable
          rows={[
            { command: '/ban', description: 'Ban a member, optionally with a duration and message deletion window.', permission: 'Ban Members' },
            { command: '/unban', description: 'Remove a user from the server ban list.', permission: 'Ban Members' },
            { command: '/kick', description: 'Kick a member from the server.', permission: 'Kick Members' },
            { command: '/timeout', description: 'Apply a Discord timeout to a member.', permission: 'Moderate Members' },
            { command: '/untimeout', description: 'Remove an active Discord timeout.', permission: 'Moderate Members' },
            { command: '/warn', description: 'Issue a warning record for a member.', permission: 'Manage Messages' },
            { command: '/warnings', description: 'View warning records for a member.', permission: 'Manage Messages' },
            { command: '/clearwarns', description: 'Clear warning records for a member.', permission: 'Manage Messages' },
            { command: '/mute', description: 'Assign the configured muted role.', permission: 'Manage Roles' },
            { command: '/unmute', description: 'Remove the configured muted role.', permission: 'Manage Roles' },
          ]}
        />
      </section>

      <section id="messages">
        <h2>Messages</h2>
        <CommandTable
          rows={[
            { command: '/prune all', description: 'Delete all messages in the checked range.', permission: 'Manage Messages' },
            { command: '/prune user', description: 'Delete messages from a specific member.', permission: 'Manage Messages' },
            { command: '/prune bots', description: 'Delete bot messages or prefixed command messages.', permission: 'Manage Messages' },
            { command: '/prune users', description: 'Delete user messages while leaving bot messages.', permission: 'Manage Messages' },
            { command: '/prune embeds', description: 'Delete messages containing embeds.', permission: 'Manage Messages' },
            { command: '/prune files', description: 'Delete messages with file attachments.', permission: 'Manage Messages' },
            { command: '/prune images', description: 'Delete messages with embeds or attachments.', permission: 'Manage Messages' },
            { command: '/prune mentions', description: 'Delete messages mentioning users or roles.', permission: 'Manage Messages' },
            { command: '/prune contains', description: 'Delete messages containing a specific substring.', permission: 'Manage Messages' },
            { command: '/prune regex', description: 'Delete messages matching a regular expression.', permission: 'Manage Messages' },
            { command: '/prune invites', description: 'Delete Discord invite links.', permission: 'Manage Messages' },
            { command: '/prune urls', description: 'Delete external URLs.', permission: 'Manage Messages' },
            { command: '/prune reactions', description: 'Clear reactions on recent messages.', permission: 'Manage Messages' },
            { command: '/prune pinned', description: 'Delete pinned messages in the checked range.', permission: 'Manage Messages' },
            { command: '/prune self', description: 'Delete your own recent messages.', permission: 'Member command' },
          ]}
        />
      </section>

      <section id="community">
        <h2>Community</h2>
        <CommandTable
          rows={[
            { command: '/levels rank', description: 'Show level information for yourself or another member.', permission: 'Member command' },
            { command: '/levels leaderboard', description: 'Show the server level leaderboard.', permission: 'Member command' },
            { command: '/levels give-xp', description: 'Give XP to a member.', permission: 'Administrator' },
            { command: '/levels toggle', description: 'Enable or disable the level system.', permission: 'Administrator' },
            { command: '/economy balance', description: 'Check your wallet or another member wallet.', permission: 'Member command' },
            { command: '/economy daily', description: 'Claim the daily reward.', permission: 'Member command' },
            { command: '/economy weekly', description: 'Claim the weekly reward.', permission: 'Member command' },
            { command: '/economy pay', description: 'Transfer currency to another member.', permission: 'Member command' },
            { command: '/economy leaderboard', description: 'Show the economy leaderboard.', permission: 'Member command' },
            { command: '/economy give', description: 'Grant currency to a member.', permission: 'Administrator' },
            { command: '/shop list', description: 'Browse the server shop.', permission: 'Member command' },
            { command: '/shop buy', description: 'Purchase a shop item.', permission: 'Member command' },
            { command: '/shop inventory', description: 'View your inventory or another member inventory.', permission: 'Member command' },
          ]}
        />
      </section>

      <section id="automation">
        <h2>Automation</h2>
        <CommandTable
          rows={[
            { command: '/rss fetch', description: 'Manually check configured RSS feeds for updates.', permission: 'Member command' },
            { command: '/rss latest', description: 'Show the latest entry for a configured feed.', permission: 'Member command' },
            { command: '/cc list', description: 'List custom commands configured for the server.', permission: 'Slash command' },
            { command: '/cc delete', description: 'Delete a custom command by name.', permission: 'Slash command' },
            { command: '/ai toggle', description: 'Toggle AI features for the server.', permission: 'Administrator' },
            { command: '/ai clear', description: 'Clear AI memory for the current server or channel context.', permission: 'Administrator' },
            { command: '/setting refresh', description: 'Refresh Project Plana configuration for the server.', permission: 'Administrator' },
            { command: '/setting reset', description: 'Reset server settings to defaults.', permission: 'Administrator' },
          ]}
        />
      </section>

      <section id="utility">
        <h2>Utility</h2>
        <CommandTable
          rows={[
            { command: '/ping', description: 'Check bot latency and connection quality.', permission: 'Member command' },
            { command: '/invite', description: 'Get an invite link for Project Plana.', permission: 'Member command' },
            { command: '/info about', description: 'Show bot information and loaded command summary.', permission: 'Member command' },
            { command: '/info system', description: 'Show process and system metrics.', permission: 'Member command' },
            { command: '/info analytics', description: 'Show guild analytics and member distribution.', permission: 'Member command' },
            { command: '/info bot-stats', description: 'Show bot CPU and memory usage.', permission: 'Member command' },
            { command: '/music play', description: 'Play a song or add it to the queue.', permission: 'Member command' },
            { command: '/music queue', description: 'Display the current music queue.', permission: 'Member command' },
            { command: '/music skip', description: 'Vote to skip the current song.', permission: 'Member command' },
            { command: '/music forceskip', description: 'Force skip the current song.', permission: 'Manage Channels' },
            { command: '/music volume', description: 'Set or display playback volume.', permission: 'Member command' },
            { command: '/music loop', description: 'Set loop mode to off, song, or queue.', permission: 'Member command' },
            { command: '/music pause', description: 'Pause the current song.', permission: 'Member command' },
            { command: '/music resume', description: 'Resume playback.', permission: 'Member command' },
            { command: '/music stop', description: 'Stop music and clear the queue.', permission: 'Member command' },
            { command: '/music disconnect', description: 'Disconnect from voice and clear player data.', permission: 'Member command' },
            { command: '/music shuffle', description: 'Shuffle the current queue.', permission: 'Member command' },
            { command: '/music nowplaying', description: 'Show the current song.', permission: 'Member command' },
            { command: '/music clear', description: 'Clear queued songs.', permission: 'Member command' },
          ]}
        />
      </section>
    </>
  ),

  '/support': (
    <>
      <section id="before-asking">
        <h2>Before Asking</h2>
        <p>
          Most support cases are caused by Discord permissions, role hierarchy, disabled
          feature toggles, or stale dashboard data. Check those first so the report can
          focus on the part that still fails.
        </p>
        <ol>
          <li>Confirm the feature is enabled and saved.</li>
          <li>Confirm the selected channel, role, feed, or schedule still exists.</li>
          <li>Confirm Project Plana can see the channel and perform the action.</li>
          <li>Refresh the dashboard after making Discord-side changes.</li>
        </ol>
      </section>

      <section id="where-to-go">
        <h2>Where To Go</h2>
        <p>
          Use the community Discord for setup questions and operational help. Use the
          project issue tracker for reproducible bugs, broken dashboard behavior, or
          clear API/bot regressions.
        </p>
        <ul>
          <li><a href="https://discord.gg/9845afkhWT">Join the Discord support server</a></li>
          <li><a href="https://github.com/ProjectPlana/project-plana">Open the GitHub project</a></li>
          <li><a href="/commands">Check the command reference</a></li>
        </ul>
      </section>

      <section id="report-template">
        <h2>Report Template</h2>
        <p>Include the details below when asking for help.</p>
        <pre>{`Feature:
Server context:
What you expected:
What happened:
Steps to reproduce:
Relevant channel/role permissions:
Screenshot or error message:`}</pre>
      </section>

      <section id="maintenance">
        <h2>Maintenance</h2>
        <p>
          Project Plana is open source and community-driven. Features may change as the
          dashboard, API, core bot, and SDK evolve. Keep reports factual and scoped so
          maintainers can reproduce the issue.
        </p>
      </section>
    </>
  ),

  '/privacy': (
    <>
      <section id="summary">
        <h2>Summary</h2>
        <p>
          Project Plana stores the information needed to provide Discord bot features,
          dashboard configuration, moderation records, and automation. It does not need
          payment data and should not be used to store secrets in message templates,
          commands, or public configuration.
        </p>
        <p>
          This policy is informational for the Project Plana service. Server
          administrators are responsible for telling their communities how they use bot
          features in their own Discord servers.
        </p>
      </section>

      <section id="data-collected">
        <h2>Data Collected</h2>
        <ul>
          <li>Discord account identifiers needed for login, dashboard access, and command context.</li>
          <li>Guild identifiers, channel identifiers, role identifiers, and configuration choices.</li>
          <li>Feature data such as welcome messages, custom commands, schedules, RSS feed configuration, economy state, levels, achievements, and reaction role mappings.</li>
          <li>Moderation records such as warnings and logged actions when those features are used.</li>
          <li>Operational logs and errors used to maintain reliability and diagnose failures.</li>
        </ul>
      </section>

      <section id="how-data-is-used">
        <h2>How Data Is Used</h2>
        <p>
          Data is used to authenticate dashboard users, apply server configuration,
          execute bot features, render previews, keep member progression state, run
          automations, and troubleshoot service problems.
        </p>
      </section>

      <section id="retention">
        <h2>Retention</h2>
        <p>
          Configuration and feature data is retained while Project Plana remains in a
          server or while the data is required for the feature to work. Server
          administrators can remove or overwrite configuration from the dashboard where
          supported.
        </p>
      </section>

      <section id="your-choices">
        <h2>Your Choices</h2>
        <ul>
          <li>Server administrators can disable features that collect feature-specific state.</li>
          <li>Members can leave a server or ask server staff about local moderation and community records.</li>
          <li>For project-level data questions, use the support channels listed on the Support page.</li>
        </ul>
      </section>
    </>
  ),

  '/terms': (
    <>
      <section id="acceptance">
        <h2>Acceptance</h2>
        <p>
          By inviting Project Plana to a Discord server, signing in to the dashboard,
          or using bot commands, you agree to use the service responsibly and in line
          with Discord rules and applicable law.
        </p>
      </section>

      <section id="acceptable-use">
        <h2>Acceptable Use</h2>
        <ul>
          <li>Do not use Project Plana to harass, spam, dox, impersonate, or coordinate abuse.</li>
          <li>Do not attempt to bypass Discord permissions, service limits, or security controls.</li>
          <li>Do not store secrets, tokens, passwords, or private keys in bot messages, commands, or configuration.</li>
          <li>Do not use automation features to publish illegal, malicious, or deceptive content.</li>
        </ul>
      </section>

      <section id="availability">
        <h2>Availability</h2>
        <p>
          Project Plana is provided as an open-source, community-driven service.
          Features may be changed, paused, limited, or removed as the project evolves.
          No uptime, data durability, or feature availability guarantee is provided.
        </p>
      </section>

      <section id="administrator-responsibility">
        <h2>Administrator Responsibility</h2>
        <p>
          Server administrators are responsible for bot permissions, configured
          messages, moderation policy, member notices, and compliance with the rules of
          their own communities. Review configuration before enabling member-facing
          automation.
        </p>
      </section>

      <section id="changes">
        <h2>Changes</h2>
        <p>
          These terms may be updated as Project Plana changes. Continued use after a
          change means you accept the updated terms.
        </p>
      </section>
    </>
  ),
};

export function getDocPage(href: string): DocPageContent | undefined {
  const meta = getDocRouteByHref(href);
  const content = contentByHref[href];

  if (!meta || !content) {
    return undefined;
  }

  return { meta, content };
}
