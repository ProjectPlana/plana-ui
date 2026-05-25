'use client';

import { forwardRef, memo, useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronDown, Image as ImageIcon, Plus, X } from 'lucide-react';
import { ImageUploadModal } from '@/components/plana-ui/image-upload-modal';
import type { MessageEmbed } from '@/lib/sdk';
import { AutocompletePopup } from './autocomplete-popup';
import { EmbedFieldEditor, type EmbedField } from './embed-field-editor';
import { useAutoResizeRef } from './hooks';
import type { AutocompleteOption, TextareaKey } from './types';
import { decimalToHex, hexToDecimal } from './utils';

interface PopupState {
  show: boolean;
  activeKey: TextareaKey | '';
  options: AutocompleteOption[];
  onSelect: (option: AutocompleteOption) => void;
}

interface EmbedEditorProps {
  embedIndex: number;
  embed: MessageEmbed;
  guildId: string;
  popup: PopupState;
  onChange: (embed: MessageEmbed) => void;
  onRemove: () => void;
  onAddField: () => void;
  onUpdateField: (fieldIndex: number, field: EmbedField) => void;
  onRemoveField: (fieldIndex: number) => void;
  registerRef: (key: TextareaKey) => (el: HTMLTextAreaElement | null) => void;
  onTextChange: (value: string, key: TextareaKey) => void;
}

const MAX_FIELDS = 25;

function EmbedEditorImpl({
  embedIndex,
  embed,
  guildId,
  popup,
  onChange,
  onRemove,
  onAddField,
  onUpdateField,
  onRemoveField,
  registerRef,
  onTextChange,
}: EmbedEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const descriptionKey: TextareaKey = `description-${embedIndex}`;

  const autoResizeDescRef = useAutoResizeRef(embed.description ?? '');
  const descRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      autoResizeDescRef(el);
      registerRef(descriptionKey)(el);
    },
    [autoResizeDescRef, registerRef, descriptionKey],
  );

  const descPopup =
    popup.show && popup.activeKey === descriptionKey
      ? { show: true, options: popup.options, onSelect: popup.onSelect }
      : { show: false, options: [] as AutocompleteOption[], onSelect: () => {} };

  const handleColorChange = useCallback(
    (hex: string) => onChange({ ...embed, color: hexToDecimal(hex) }),
    [embed, onChange],
  );

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="outline">Embed {embedIndex + 1}</Badge>
          {isCollapsed && embed.title && (
            <span className="text-sm text-muted-foreground truncate max-w-[180px]">
              — {embed.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed((c) => !c)}
            aria-label={isCollapsed ? 'Expand embed' : 'Collapse embed'}
          >
            <ChevronDown
              className={cn('h-4 w-4 transition-transform duration-150', !isCollapsed && 'rotate-180')}
            />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove embed">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <AuthorSection embed={embed} guildId={guildId} onChange={onChange} />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_112px] gap-4 items-start">
            <div className="space-y-4 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Embed title"
                    value={embed.title || ''}
                    onChange={(e) => onChange({ ...embed, title: e.target.value })}
                    maxLength={256}
                  />
                </div>
                <div>
                  <Label>URL (optional)</Label>
                  <Input
                    placeholder="https://example.com"
                    value={embed.url || ''}
                    onChange={(e) => onChange({ ...embed, url: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={decimalToHex(embed.color)}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-9 p-1"
                  />
                  <Input
                    value={decimalToHex(embed.color)}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Thumbnail</Label>
              <ImageUploadModal
                value={embed.thumbnail}
                onValueChange={(thumbnail) => onChange({ ...embed, thumbnail })}
                guildId={guildId}
                title="Thumbnail"
                trigger={<ThumbnailTrigger url={embed.thumbnail} />}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Description</Label>
              <span className="text-xs text-muted-foreground">
                {embed.description?.length ?? 0}/2048
              </span>
            </div>
            <div className="relative">
              <Textarea
                ref={descRef}
                placeholder="Embed description (supports @user, #channel, :emoji:)"
                value={embed.description || ''}
                onChange={(e) => onTextChange(e.target.value, descriptionKey)}
                className="min-h-16 resize-none overflow-hidden"
                maxLength={2048}
              />
              {descPopup.show && (
                <AutocompletePopup options={descPopup.options} onSelect={descPopup.onSelect} />
              )}
            </div>
          </div>

          <FieldsSection
            embedIndex={embedIndex}
            fields={embed.fields ?? []}
            popup={popup}
            onAdd={onAddField}
            onUpdate={onUpdateField}
            onRemove={onRemoveField}
            registerRef={registerRef}
            onTextChange={onTextChange}
          />

          <EmbedImageSection embed={embed} guildId={guildId} onChange={onChange} />

          <FooterSection embed={embed} guildId={guildId} onChange={onChange} />

          <div className="flex items-center space-x-2">
            <Switch
              checked={!!embed.timestamp}
              onCheckedChange={(checked) =>
                onChange({ ...embed, timestamp: checked ? new Date().toISOString() : undefined })
              }
            />
            <Label>Include timestamp</Label>
          </div>
        </>
      )}
    </div>
  );
}

export const EmbedEditor = memo(EmbedEditorImpl);

// ---- sub-components --------------------------------------------------------

const ThumbnailTrigger = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { url?: string }
>(function ThumbnailTrigger({ url, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={[
        'w-24 h-24 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
      ) : (
        <div className="text-center">
          <ImageIcon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Thumbnail</p>
        </div>
      )}
    </button>
  );
});

function AuthorSection({
  embed,
  guildId,
  onChange,
}: {
  embed: MessageEmbed;
  guildId: string;
  onChange: (embed: MessageEmbed) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Author</Label>
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <ImageUploadModal
          value={embed.author?.icon_url}
          onValueChange={(icon_url) =>
            onChange({
              ...embed,
              author: embed.author ? { ...embed.author, icon_url } : { name: '', icon_url },
            })
          }
          guildId={guildId}
          title="Author Icon"
          trigger={
            <div className="w-10 h-10 bg-muted border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
              {embed.author?.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={embed.author.icon_url}
                  alt="Author icon"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          }
        />
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Author name"
            value={embed.author?.name || ''}
            onChange={(e) =>
              onChange({ ...embed, author: { ...embed.author, name: e.target.value } })
            }
            maxLength={256}
          />
          <Input
            placeholder="Author URL (optional)"
            value={embed.author?.url || ''}
            onChange={(e) =>
              onChange({ ...embed, author: { ...embed.author, url: e.target.value } })
            }
          />
        </div>
      </div>
    </div>
  );
}

function FieldsSection({
  embedIndex,
  fields,
  popup,
  onAdd,
  onUpdate,
  onRemove,
  registerRef,
  onTextChange,
}: {
  embedIndex: number;
  fields: EmbedField[];
  popup: PopupState;
  onAdd: () => void;
  onUpdate: (fieldIndex: number, field: EmbedField) => void;
  onRemove: (fieldIndex: number) => void;
  registerRef: (key: TextareaKey) => (el: HTMLTextAreaElement | null) => void;
  onTextChange: (value: string, key: TextareaKey) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Fields</Label>
        <Button variant="outline" size="sm" onClick={onAdd} disabled={fields.length >= MAX_FIELDS}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      {fields.map((field, fieldIndex) => {
        const key: TextareaKey = `field-${embedIndex}-${fieldIndex}`;
        const showHere = popup.show && popup.activeKey === key;
        return (
          <EmbedFieldEditor
            key={fieldIndex}
            index={fieldIndex}
            field={field}
            onChange={(next) => onUpdate(fieldIndex, next)}
            onRemove={() => onRemove(fieldIndex)}
            registerValueRef={registerRef(key)}
            onValueChange={(value) => onTextChange(value, key)}
            popup={
              showHere
                ? { show: true, options: popup.options, onSelect: popup.onSelect }
                : { show: false, options: [], onSelect: () => {} }
            }
          />
        );
      })}
    </div>
  );
}

function EmbedImageSection({
  embed,
  guildId,
  onChange,
}: {
  embed: MessageEmbed;
  guildId: string;
  onChange: (embed: MessageEmbed) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Embed Image</Label>
      <ImageUploadModal
        value={embed.image}
        onValueChange={(image) => onChange({ ...embed, image })}
        guildId={guildId}
        title="Embed Image"
        trigger={
          embed.image ? (
            <div className="w-full cursor-pointer group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={embed.image}
                alt="Embed image"
                className="w-full rounded-lg object-contain border-2 border-transparent group-hover:border-primary/50 transition-colors"
                style={{ maxHeight: '300px' }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-3 py-1 rounded-md text-sm font-medium">
                  Click to change image
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-32 bg-muted border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
              <div className="text-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to add embed image</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 500x300px or similar ratio
                </p>
              </div>
            </div>
          )
        }
      />
    </div>
  );
}

function FooterSection({
  embed,
  guildId,
  onChange,
}: {
  embed: MessageEmbed;
  guildId: string;
  onChange: (embed: MessageEmbed) => void;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Footer</Label>
      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <ImageUploadModal
          value={embed.footer?.icon_url}
          onValueChange={(icon_url) =>
            onChange({
              ...embed,
              footer: embed.footer ? { ...embed.footer, icon_url } : { text: '', icon_url },
            })
          }
          guildId={guildId}
          title="Footer Icon"
          trigger={
            <div className="w-8 h-8 bg-muted border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
              {embed.footer?.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={embed.footer.icon_url}
                  alt="Footer icon"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          }
        />
        <div className="flex-1">
          <Input
            placeholder="Footer text"
            value={embed.footer?.text || ''}
            onChange={(e) =>
              onChange({ ...embed, footer: { ...embed.footer, text: e.target.value } })
            }
            maxLength={2048}
          />
        </div>
      </div>
    </div>
  );
}
