import { useEffect, useRef } from 'react';

/**
 * Live set of the listed keys (lower-cased `e.key`) that are currently held
 * down, for continuous movement that `useKeyboard`'s one-shot keydown can't
 * express. Read it from a game loop. Listed keys have their default action
 * suppressed, and the set clears on blur so a key released outside the
 * window doesn't stick.
 */
export function useHeldKeys(keys: readonly string[]) {
  const held = useRef(new Set<string>());
  const signature = keys.map(k => k.toLowerCase()).join('|');

  useEffect(() => {
    const watched = new Set(signature.split('|'));
    const current = held.current;
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!watched.has(key)) return;
      e.preventDefault();
      current.add(key);
    };
    const up = (e: KeyboardEvent) => { current.delete(e.key.toLowerCase()); };
    const clear = () => current.clear();

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      current.clear();
    };
  }, [signature]);

  return held;
}
