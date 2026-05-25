'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

export function StickyActionBar({
  children,
  className,
  position = 'top',
}: StickyActionBarProps) {
  return (
    <div
      className={cn(
        'sticky z-20 -mx-6 border-y bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        position === 'top' ? 'top-0 mb-6' : 'bottom-0 mt-8',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {children}
      </div>
    </div>
  );
}
