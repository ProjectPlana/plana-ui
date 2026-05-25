'use client';

/**
 * Renders a Discord message string into highlighted JSX:
 *  - <@id>     → @username
 *  - <@&id>    → @rolename (colored)
 *  - <#id>     → #channel
 *  - <a?:n:id> → emoji image
 *
 * Falls back to plain text otherwise.
 */

import { Fragment, memo } from 'react';
import type { GuildData } from '@/lib/sdk';
import { decimalToHex } from './utils';

interface DiscordContentProps {
  content: string | null | undefined;
  guildData: GuildData | null;
}

const TOKEN_RE = /(<@!?\d+>|<@&\d+>|<#\d+>|<a?:\w+:\d+>)/g;

function DiscordContentImpl({ content, guildData }: DiscordContentProps) {
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => (
        <Fragment key={lineIdx}>
          <Line line={line} guildData={guildData} />
          {lineIdx < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

function Line({ line, guildData }: { line: string; guildData: GuildData | null }) {
  const parts = line.split(TOKEN_RE);
  return (
    <div>
      {parts.map((part, idx) => (
        <Token key={idx} part={part} guildData={guildData} />
      ))}
    </div>
  );
}

function Token({ part, guildData }: { part: string; guildData: GuildData | null }) {
  // User mention: <@id> or <@!id>
  const userMatch = part.match(/^<@!?(\d+)>$/);
  if (userMatch) {
    const username =
      guildData?.users.find((u) => u.user_id === userMatch[1])?.username ?? 'Unknown User';
    return (
      <span className="bg-blue-500/20 text-blue-400 px-1 rounded text-sm">
        @{username}
      </span>
    );
  }

  // Role mention: <@&id>
  const roleMatch = part.match(/^<@&(\d+)>$/);
  if (roleMatch) {
    const role = guildData?.roles.find((r) => r.role_id === roleMatch[1]);
    const tint = role?.color ? decimalToHex(role.color) : '#7289DA';
    return (
      <span
        className="px-1 rounded text-sm"
        style={{ backgroundColor: `${tint}20`, color: tint }}
      >
        @{role?.name ?? 'Unknown Role'}
      </span>
    );
  }

  // Channel mention: <#id>
  const channelMatch = part.match(/^<#(\d+)>$/);
  if (channelMatch) {
    const name =
      guildData?.channels.find((c) => c.channel_id === channelMatch[1])?.name ??
      'Unknown Channel';
    return (
      <span className="bg-muted text-muted-foreground px-1 rounded text-sm">
        #{name}
      </span>
    );
  }

  // Custom emoji: <a?:name:id>
  const emojiMatch = part.match(/^<(a?):(\w+):(\d+)>$/);
  if (emojiMatch) {
    const [, animated, name, id] = emojiMatch;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`}
        alt={`:${name}:`}
        className="inline w-5 h-5 mx-1"
      />
    );
  }

  return <>{part}</>;
}

export const DiscordContent = memo(DiscordContentImpl);
