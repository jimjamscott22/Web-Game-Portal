import { useEffect, useRef } from 'react';

export type UseKeyboardOptions = {
  /** Keys that should fire once per physical press (ignore `keydown` auto-repeat). */
  noRepeat?: string[];
};

function keyIgnoresRepeat(e: KeyboardEvent, noRepeat: string[]): boolean {
  const lower = e.key.toLowerCase();
  return noRepeat.some(k => k.toLowerCase() === lower || k === e.key);
}

export function useKeyboard(
  keyMap: Record<string, () => void>,
  deps: React.DependencyList = [],
  options?: UseKeyboardOptions
) {
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;
  const noRepeatRef = useRef(options?.noRepeat ?? []);
  noRepeatRef.current = options?.noRepeat ?? [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = keyMapRef.current[key] || keyMapRef.current[e.key];
      if (!action) return;

      if (e.repeat && keyIgnoresRepeat(e, noRepeatRef.current)) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      action();
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, deps);
}
