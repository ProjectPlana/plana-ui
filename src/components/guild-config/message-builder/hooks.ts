import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Returns a callback ref that auto-resizes a textarea to fit its content.
 * Applies on mount and whenever `value` changes.
 */
export function useAutoResizeRef(value: string): (el: HTMLTextAreaElement | null) => void {
  const elRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return useCallback((el: HTMLTextAreaElement | null) => {
    elRef.current = el;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, []);
}
