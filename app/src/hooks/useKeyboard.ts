import { useEffect, useRef } from 'react';

export function useKeyboard(
  keyMap: Record<string, () => void>,
  deps: React.DependencyList = []
) {
  const keyMapRef = useRef(keyMap);
  keyMapRef.current = keyMap;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const action = keyMapRef.current[key] || keyMapRef.current[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, deps);
}
