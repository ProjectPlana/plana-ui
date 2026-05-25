'use client';

import { memo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { AutocompletePopup } from './autocomplete-popup';
import { useAutoResizeRef } from './hooks';
import type { AutocompleteOption } from './types';

export interface EmbedField {
  name: string;
  value: string;
  inline: boolean;
}

interface EmbedFieldEditorProps {
  index: number;
  field: EmbedField;
  onChange: (field: EmbedField) => void;
  onRemove: () => void;
  registerValueRef: (el: HTMLTextAreaElement | null) => void;
  onValueChange: (value: string) => void;
  popup: { show: boolean; options: AutocompleteOption[]; onSelect: (option: AutocompleteOption) => void };
}

function EmbedFieldEditorImpl({
  index,
  field,
  onChange,
  onRemove,
  registerValueRef,
  onValueChange,
  popup,
}: EmbedFieldEditorProps) {
  const autoResizeRef = useAutoResizeRef(field.value);
  const valueRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      autoResizeRef(el);
      registerValueRef(el);
    },
    [autoResizeRef, registerValueRef],
  );

  return (
    <div className="border rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Badge variant="outline">Field {index + 1}</Badge>
        <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove field">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <span className="text-xs text-muted-foreground">{field.name.length}/256</span>
          </div>
          <Input
            placeholder="Field name"
            value={field.name}
            onChange={(e) => onChange({ ...field, name: e.target.value })}
            maxLength={256}
          />
        </div>
        <div className="flex items-center space-x-2 pb-px">
          <Switch
            checked={field.inline}
            onCheckedChange={(inline) => onChange({ ...field, inline })}
          />
          <Label className="text-sm">Inline</Label>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <span className="text-xs text-muted-foreground">{field.value.length}/1024</span>
        </div>
        <div className="relative">
          <Textarea
            ref={valueRef}
            placeholder="Field value (supports @user, #channel, :emoji:)"
            value={field.value}
            onChange={(e) => onValueChange(e.target.value)}
            className="min-h-[60px] resize-none overflow-hidden"
            maxLength={1024}
          />
          {popup.show && (
            <AutocompletePopup options={popup.options} onSelect={popup.onSelect} />
          )}
        </div>
      </div>
    </div>
  );
}

export const EmbedFieldEditor = memo(EmbedFieldEditorImpl);
