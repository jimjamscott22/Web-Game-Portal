import { useEffect, useEffectEvent } from 'react';

export type UseKeyboardOptions = {
  /** Keys that should fire once per physical press (ignore `keydown` auto-repeat). */
  noRepeat?: string[];
  /**
   * Keys left to the browser when focus is on a button, link or form field,
   * so Enter/Space still activate the focused control.
   */
  passThroughOnControls?: string[];
};

const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, [role="button"]';

function targetIsControl(e: KeyboardEvent): boolean {
  return e.target instanceof Element && e.target.closest(CONTROL_SELECTOR) !== null;
}

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

    const passThrough = options?.passThroughOnControls ?? [];
    if (passThrough.some(k => k.toLowerCase() === key) && targetIsControl(e)) return;

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
