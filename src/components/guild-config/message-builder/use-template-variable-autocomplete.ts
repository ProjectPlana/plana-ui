import { useCallback, useMemo, useState } from 'react';
import type { AutocompleteOption, TemplateVariable } from './types';

const MAX_TEMPLATE_VARIABLES = 10;

interface TemplateAutocompleteState {
  show: boolean;
  options: AutocompleteOption[];
  cursorPos: number;
}

const INITIAL: TemplateAutocompleteState = {
  show: false,
  options: [],
  cursorPos: 0,
};

type TemplateInput = HTMLInputElement | HTMLTextAreaElement;

export function useTemplateVariableAutocomplete(
  value: string,
  onChange: (next: string) => void,
  variables: TemplateVariable[],
) {
  const [state, setState] = useState<TemplateAutocompleteState>(INITIAL);
  const [input, setInput] = useState<TemplateInput | null>(null);

  const registerRef = useCallback((el: TemplateInput | null) => {
    setInput(el);
  }, []);

  const close = useCallback(() => setState((current) => ({ ...current, show: false })), []);

  const buildOptions = useCallback(
    (query: string): AutocompleteOption[] => {
      const q = query.toLowerCase();
      return variables
        .filter((variable) => variable.name.toLowerCase().includes(q))
        .slice(0, MAX_TEMPLATE_VARIABLES)
        .map((variable) => ({
          type: 'template',
          id: variable.name,
          name: variable.name,
          display: `{${variable.name}}`,
          description: variable.description,
        }));
    },
    [variables],
  );

  const handleChange = useCallback(
    (next: string) => {
      onChange(next);

      if (!input) return;

      const cursorPos = input.selectionStart ?? next.length;
      const match = next.slice(0, cursorPos).match(/\{([a-zA-Z0-9_.]*)$/);
      if (!match) {
        if (state.show) close();
        return;
      }

      const options = buildOptions(match[1]);
      if (options.length === 0) {
        if (state.show) close();
        return;
      }

      setState({ show: true, options, cursorPos });
    },
    [buildOptions, close, input, onChange, state.show],
  );

  const insert = useCallback(
    (option: AutocompleteOption) => {
      if (!input) return;

      const before = value.slice(0, state.cursorPos);
      const after = value.slice(state.cursorPos);
      const match = before.match(/\{([a-zA-Z0-9_.]*)$/);
      if (!match) return;

      const start = before.length - match[0].length;
      const replacement = `{${option.name}}`;
      const next = value.slice(0, start) + replacement + after;

      onChange(next);
      setState(INITIAL);

      requestAnimationFrame(() => {
        input.focus();
        const caret = start + replacement.length;
        input.setSelectionRange(caret, caret);
      });
    },
    [input, onChange, state.cursorPos, value],
  );

  return useMemo(
    () => ({
      ...state,
      registerRef,
      handleChange,
      insert,
      close,
    }),
    [state, registerRef, handleChange, insert, close],
  );
}
