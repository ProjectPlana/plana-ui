'use client';

import { Badge } from '@/components/ui/badge';
import { Braces, Hash, User } from 'lucide-react';
import type { AutocompleteOption } from './types';
import { decimalToHex } from './utils';

interface AutocompletePopupProps {
  options: AutocompleteOption[];
  onSelect: (option: AutocompleteOption) => void;
}

export function AutocompletePopup({ options, onSelect }: AutocompletePopupProps) {
  if (options.length === 0) return null;
  return (
    <div className="absolute z-50 mt-1 w-72 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
      {options.map((option) => (
        <button
          key={`${option.type}-${option.id}`}
          type="button"
          className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
          onClick={() => onSelect(option)}
        >
          <OptionVisual option={option} />
        </button>
      ))}
    </div>
  );
}

function OptionVisual({ option }: { option: AutocompleteOption }) {
  switch (option.type) {
    case 'user':
      return (
        <>
          {option.avatar ? (
            // Discord CDN — Next/Image is not yet allow-listed for arbitrary user
            // avatars and the popup is short-lived, so keep the raw <img>.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://cdn.discordapp.com/avatars/${option.id}/${option.avatar}.png`}
              alt=""
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
              <User className="h-3 w-3" />
            </div>
          )}
          <span className="font-medium">{option.display}</span>
        </>
      );
    case 'role':
      return (
        <>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: decimalToHex(option.color) }}
          />
          <span className="font-medium">{option.display}</span>
        </>
      );
    case 'channel':
      return (
        <>
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{option.display}</span>
        </>
      );
    case 'emoji':
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.discordapp.com/emojis/${option.id}.${option.animated ? 'gif' : 'png'}`}
            alt={option.name}
            className="w-5 h-5"
          />
          <div>
            <div className="font-medium">{option.display}</div>
            {option.animated && (
              <Badge variant="secondary" className="text-xs">
                Animated
              </Badge>
            )}
          </div>
        </>
      );
    case 'template':
      return (
        <>
          <Braces className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className="font-medium">{option.display}</div>
            {option.description && (
              <div className="truncate text-xs text-muted-foreground">
                {option.description}
              </div>
            )}
          </div>
        </>
      );
  }
}
