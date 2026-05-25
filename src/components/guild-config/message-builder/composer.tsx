'use client';

import { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AutocompletePopup } from './autocomplete-popup';
import { useAutoResizeRef } from './hooks';
import type { AutocompleteOption } from './types';

interface ComposerProps {
  content: string;
  placeholder?: string;
  charLimit: number;
  supportsTemplateVariables?: boolean;
  onChange: (value: string) => void;
  registerRef: (el: HTMLTextAreaElement | null) => void;
  popup: { show: boolean; options: AutocompleteOption[]; onSelect: (option: AutocompleteOption) => void };
}

export function Composer({
  content,
  placeholder = 'Type your message...',
  charLimit,
  supportsTemplateVariables = false,
  onChange,
  registerRef,
  popup,
}: ComposerProps) {
  const autoResizeRef = useAutoResizeRef(content);
  const ref = useCallback(
    (el: HTMLTextAreaElement | null) => {
      autoResizeRef(el);
      registerRef(el);
    },
    [autoResizeRef, registerRef],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Message Content</CardTitle>
        <CardDescription>
          Use <code>@username</code>, <code>#channel</code>, or <code>:emoji:</code>
          {supportsTemplateVariables ? (
            <>
              {' '}
              and <code>{'{variable}'}</code>
            </>
          ) : null}{' '}
          for autocomplete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Textarea
            ref={ref}
            placeholder={placeholder}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px] resize-none overflow-hidden"
            maxLength={charLimit}
          />
          {popup.show && (
            <AutocompletePopup options={popup.options} onSelect={popup.onSelect} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
