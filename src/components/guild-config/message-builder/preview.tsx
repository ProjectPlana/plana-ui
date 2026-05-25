'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileText } from 'lucide-react';
import type { DiscordMessage, GuildData, MessageEmbed } from '@/lib/sdk';
import { DiscordContent } from './discord-content';
import { decimalToHex, formatDate } from './utils';
import { getConfig } from '@/lib/config';

interface PreviewProps {
  message: DiscordMessage;
  guildData: GuildData | null;
}

export function Preview({ message, guildData }: PreviewProps) {
  const { DISCORD_BOT_AVATAR_URL } = getConfig();
  const botAvatarUrl = DISCORD_BOT_AVATAR_URL || '/avatar.png';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 sticky top-0 bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/60 z-10 py-2">
        <Eye className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Live Preview</h3>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base">Discord Preview</CardTitle>
          <CardDescription>How your message will appear in Discord</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#313338] text-[#dbdee1] border border-[#1e1f22] rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#5865f2] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={botAvatarUrl}
                  alt="Project Plana bot avatar"
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = '/avatar.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">Project Plana</span>
                  <Badge className="text-[10px] h-4 px-1.5 bg-[#5865f2] text-white border-0">
                    APP
                  </Badge>
                  <span className="text-xs text-[#949ba4]">
                    Today at {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <PreviewBody message={message} guildData={guildData} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewBody({ message, guildData }: PreviewProps) {
  const empty = !message.content && (!message.embeds || message.embeds.length === 0);
  if (empty) {
    return (
        <div className="text-center py-8 text-[#949ba4]">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Your message preview will appear here</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {message.content && (
        <div className="text-sm leading-relaxed">
          <DiscordContent content={message.content} guildData={guildData} />
        </div>
      )}
      {message.embeds?.map((embed, idx) => (
        <EmbedPreview key={idx} embed={embed} guildData={guildData} />
      ))}
    </div>
  );
}

function EmbedPreview({
  embed,
  guildData,
}: {
  embed: MessageEmbed;
  guildData: GuildData | null;
}) {
  const inlineFields = embed.fields?.some((f) => f.inline);
  const embedUrl = safeUrl(embed.url);
  const authorUrl = safeUrl(embed.author?.url);

  return (
    <div
      className="border-l-4 pl-3 py-2 bg-[#2b2d31] rounded-r relative max-w-[520px]"
      style={{ borderLeftColor: decimalToHex(embed.color) }}
    >
      <div className="space-y-2">
        {embed.thumbnail && (
          <div className="absolute top-2 right-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={embed.thumbnail}
              alt=""
              className="max-w-20 max-h-20 rounded object-cover"
            />
          </div>
        )}

        {embed.author && (
          <div className="flex items-center gap-2 mb-2">
            {embed.author.icon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={embed.author.icon_url}
                alt=""
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="text-sm font-medium">
              {authorUrl ? (
                <a href={authorUrl} className="text-blue-500 hover:underline">
                  <DiscordContent content={embed.author.name} guildData={guildData} />
                </a>
              ) : (
                <DiscordContent content={embed.author.name} guildData={guildData} />
              )}
            </span>
          </div>
        )}

        {embed.title && (
          <div className="font-semibold text-[#00a8fc] mb-1 pr-24">
            {embedUrl ? (
              <a href={embedUrl} className="hover:underline">
                <DiscordContent content={embed.title} guildData={guildData} />
              </a>
            ) : (
              <DiscordContent content={embed.title} guildData={guildData} />
            )}
          </div>
        )}

        {embed.description && (
          <div className="text-sm mb-3 leading-relaxed pr-24 text-[#dbdee1]">
            <DiscordContent content={embed.description} guildData={guildData} />
          </div>
        )}

        {embed.fields && embed.fields.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${
              inlineFields ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'
            }`}
          >
            {embed.fields.map((field, fieldIdx) => (
              <div
                key={fieldIdx}
                className={field.inline ? 'md:col-span-1' : 'md:col-span-3'}
              >
                <div className="font-semibold text-sm mb-1 text-white">
                  <DiscordContent content={field.name} guildData={guildData} />
                </div>
                <div className="text-sm leading-relaxed text-[#dbdee1]">
                  <DiscordContent content={field.value} guildData={guildData} />
                </div>
              </div>
            ))}
          </div>
        )}

        {embed.image && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={embed.image}
              alt=""
              className="max-w-full h-auto rounded"
              style={{ maxHeight: '400px', maxWidth: '500px' }}
            />
          </div>
        )}

        {(embed.footer || embed.timestamp) && (
          <div className="flex items-center gap-2 text-xs text-[#949ba4] mt-2">
            {embed.footer?.icon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={embed.footer.icon_url}
                alt=""
                className="w-4 h-4 rounded-full"
              />
            )}
            {embed.footer?.text && (
              <span>
                <DiscordContent content={embed.footer.text} guildData={guildData} />
              </span>
            )}
            {embed.footer?.text && embed.timestamp && <span>•</span>}
            {embed.timestamp && <span>{formatDate(embed.timestamp)}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function safeUrl(url?: string): string | undefined {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}
