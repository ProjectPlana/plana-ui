'use client';

import { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Menu, MousePointer, Smile } from 'lucide-react';
import type { TriggerType } from './types';

interface TriggerTypeSelectorProps {
  value: TriggerType;
  onChange: (next: TriggerType) => void;
}

interface Option {
  type: TriggerType;
  title: string;
  hint: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const OPTIONS: Option[] = [
  {
    type: 'emoji',
    title: 'Emoji Reactions',
    hint: 'Users react with emojis',
    Icon: Smile,
  },
  {
    type: 'button',
    title: 'Interactive Buttons',
    hint: 'Users click Discord buttons',
    Icon: MousePointer,
  },
  {
    type: 'select',
    title: 'Dropdown Menu',
    hint: 'Users pick from dropdown',
    Icon: Menu,
  },
];

function TriggerTypeSelectorImpl({ value, onChange }: TriggerTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">How will users get roles?</Label>
        <p className="text-sm text-muted-foreground">Choose interaction method</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {OPTIONS.map(({ type, title, hint, Icon }) => {
          const active = value === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all text-left ${
                active
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40'
              }`}
              aria-pressed={active}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div
                  className={`p-2 rounded-full ${active ? 'bg-primary/10' : 'bg-muted'}`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`}
                  />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">{hint}</p>
                </div>
              </div>
              {active && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const TriggerTypeSelector = memo(TriggerTypeSelectorImpl);
