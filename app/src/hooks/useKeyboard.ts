import { useEffect, useEffectEvent } from 'react';

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
  // Retained for existing callers; Effect Events always read the latest key map.
  _deps: React.DependencyList = [],
  options?: UseKeyboardOptions
) {
  void _deps;
  const handler = useEffectEvent((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const action = keyMap[key] || keyMap[e.key];
    if (!action) return;

    if (e.repeat && keyIgnoresRepeat(e, options?.noRepeat ?? [])) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    action();
  });

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
