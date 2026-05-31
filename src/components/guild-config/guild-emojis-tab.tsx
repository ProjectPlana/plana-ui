'use client';
/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/no-unescaped-entities */

import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type AssetQueueResponse, type GuildEmoji, type GuildSticker } from '@/lib/sdk';
import { EmojiSelect } from '@/components/plana-ui/emoji-select';
import {
  useCreateGuildEmojiMutation,
  useCreateGuildStickerMutation,
  useDeleteGuildEmojiMutation,
  useDeleteGuildStickerMutation,
  useGuildDataQuery,
} from '@/lib/queries';
import { Smile, Image, Search, Copy, ExternalLink, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GuildEmojisTabProps {
  guildId: string;
}

function showQueuedToast(action: string, result: AssetQueueResponse) {
  const message = `${action} queued (${result.request_id})`;
  if (result.subscribers === 0) {
    toast.warning(`${message}, but no bot subscriber was reported by Redis`);
    return;
  }
  toast.success(message);
}

function AssetUploadDialog({
  type,
  guildEmojis,
  disabled,
  onSubmit,
}: {
  type: 'emoji' | 'sticker';
  guildEmojis?: GuildEmoji[];
  disabled?: boolean;
  onSubmit: (data: {
    name: string;
    description: string;
    emoji: string;
    file: File;
  }) => Promise<AssetQueueResponse>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState<GuildEmoji | null>({ name: '🙂', animated: false });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isSticker = type === 'sticker';

  const reset = () => {
    setName('');
    setDescription('');
    setEmoji({ name: '🙂', animated: false });
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!file) {
      toast.error('Image file is required');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }
    if (file.size > 512 * 1024) {
      toast.error('File must be 512KB or smaller');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onSubmit({
        name: name.trim(),
        description: description.trim(),
        emoji: emoji?.emoji_id || emoji?.name || '🙂',
        file,
      });
      showQueuedToast(`${isSticker ? 'Sticker' : 'Emoji'} upload`, result);
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Upload className="h-4 w-4 mr-2" />
          Upload {isSticker ? 'Sticker' : 'Emoji'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {isSticker ? 'Sticker' : 'Emoji'}</DialogTitle>
          <DialogDescription>
            The bot will add it in Discord and the list will refresh shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${type}-name`}>Name</Label>
            <Input
              id={`${type}-name`}
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={32}
              placeholder={isSticker ? 'welcome' : 'party_plana'}
            />
          </div>
          {isSticker && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sticker-description">Description</Label>
                <Input
                  id="sticker-description"
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  maxLength={100}
                  placeholder="A short sticker description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sticker-emoji">Related Emoji</Label>
                <EmojiSelect
                  value={emoji}
                  onValueChange={setEmoji}
                  guildEmojis={guildEmojis ?? []}
                  customEmojisEnabled
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Unicode emojis work best; custom emojis are sent as their Discord ID.
                </p>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor={`${type}-file`}>Image File</Label>
            <Input
              ref={fileInputRef}
              id={`${type}-file`}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={event => setFile(event.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Maximum file size is 512KB.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GuildEmojisTab({ guildId }: GuildEmojisTabProps) {
  const guildDataQuery = useGuildDataQuery(guildId);
  const createEmoji = useCreateGuildEmojiMutation(guildId);
  const deleteEmoji = useDeleteGuildEmojiMutation(guildId);
  const createSticker = useCreateGuildStickerMutation(guildId);
  const deleteSticker = useDeleteGuildStickerMutation(guildId);
  const guildData = guildDataQuery.data ?? null;
  const [searchTerm, setSearchTerm] = useState('');

  const copyEmojiId = (emoji: GuildEmoji) => {
    const emojiString = emoji.animated ? `<a:${emoji.name}:${emoji.emoji_id}>` : `<:${emoji.name}:${emoji.emoji_id}>`;
    navigator.clipboard.writeText(emojiString);
    toast.success(`Copied emoji: ${emojiString}`);
  };

  const copyEmojiUrl = (emoji: GuildEmoji) => {
    if (!emoji.url) return;
    navigator.clipboard.writeText(emoji.url);
    toast.success('Emoji URL copied to clipboard');
  };

  const deleteEmojiById = async (emoji: GuildEmoji) => {
    if (!emoji.emoji_id) return;
    if (!confirm(`Delete emoji :${emoji.name}:?`)) return;
    try {
      const result = await deleteEmoji.mutateAsync(emoji.emoji_id);
      showQueuedToast('Emoji delete', result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete emoji');
    }
  };

  const deleteStickerById = async (sticker: GuildSticker) => {
    if (!confirm(`Delete sticker ${sticker.name}?`)) return;
    try {
      const result = await deleteSticker.mutateAsync(sticker.sticker_id);
      showQueuedToast('Sticker delete', result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete sticker');
    }
  };

  const filteredEmojis = guildData?.emojis.filter(emoji =>
    emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredStickers = guildData?.stickers.filter(sticker =>
    sticker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sticker.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (guildDataQuery.isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading emojis and stickers...</p>
      </div>
    );
  }

  if (!guildData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load guild data.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Smile className="h-6 w-6" />
          Emojis & Stickers
        </h2>
        <p className="text-muted-foreground">
          View and manage your server's custom emojis and stickers
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emojis and stickers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="emojis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="emojis" className="flex items-center gap-2">
            <Smile className="h-4 w-4" />
            Emojis ({filteredEmojis.length})
          </TabsTrigger>
          <TabsTrigger value="stickers" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Stickers ({filteredStickers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emojis">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smile className="h-5 w-5" />
                    Custom Emojis
                  </CardTitle>
                  <CardDescription>
                    All custom emojis available in this server
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {guildData.emojis.length} total emojis
                </div>
                <AssetUploadDialog
                  type="emoji"
                  guildEmojis={guildData.emojis}
                  disabled={createEmoji.isPending}
                  onSubmit={({ name, file }) => createEmoji.mutateAsync({ name, file })}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredEmojis.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmojis.map((emoji) => (
                    <div key={emoji.emoji_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={emoji.url}
                          alt={`${emoji.name} emoji`}
                          className="w-8 h-8"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{emoji.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {emoji.emoji_id}
                          </div>
                        </div>
                        {emoji.animated && (
                          <Badge variant="secondary" className="text-xs">
                            Animated
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyEmojiId(emoji)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy ID
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyEmojiUrl(emoji)}
                          className="flex-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEmojiById(emoji)}
                          disabled={deleteEmoji.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <Smile className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No emojis found</h3>
                      <p className="text-sm text-muted-foreground">
                                                 No emojis match your search term &quot;{searchTerm}&quot;
                      </p>
                    </>
                  ) : (
                    <>
                      <Smile className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No custom emojis</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This server doesn&apos;t have any custom emojis yet
                      </p>
                      <AssetUploadDialog
                        type="emoji"
                        guildEmojis={guildData.emojis}
                        disabled={createEmoji.isPending}
                        onSubmit={({ name, file }) => createEmoji.mutateAsync({ name, file })}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stickers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Custom Stickers
                  </CardTitle>
                  <CardDescription>
                    All custom stickers available in this server
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {guildData.stickers.length} total stickers
                </div>
                <AssetUploadDialog
                  type="sticker"
                  guildEmojis={guildData.emojis}
                  disabled={createSticker.isPending}
                  onSubmit={data => createSticker.mutateAsync(data)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredStickers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStickers.map((sticker) => (
                    <div key={sticker.sticker_id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={sticker.url}
                          alt={`${sticker.name} sticker`}
                          className="w-12 h-12 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{sticker.name}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {sticker.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {sticker.sticker_id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {sticker.emoji}
                          </Badge>
                          <Badge 
                            variant={sticker.available ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {sticker.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(sticker.url);
                              toast.success('Sticker URL copied to clipboard');
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy URL
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteStickerById(sticker)}
                            disabled={deleteSticker.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {searchTerm ? (
                    <>
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No stickers found</h3>
                      <p className="text-sm text-muted-foreground">
                                                 No stickers match your search term &quot;{searchTerm}&quot;
                      </p>
                    </>
                  ) : (
                    <>
                      <Image className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No custom stickers</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This server doesn&apos;t have any custom stickers yet
                      </p>
                      <AssetUploadDialog
                        type="sticker"
                        guildEmojis={guildData.emojis}
                        disabled={createSticker.isPending}
                        onSubmit={data => createSticker.mutateAsync(data)}
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
