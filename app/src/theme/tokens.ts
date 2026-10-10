import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

export const SKIN_OPTIONS = [
  {
    id: 'harvest',
    name: 'Harvest',
    note: 'Cream, terracotta, and sage',
    swatches: ['#c67139', '#7a8a5e', '#ffe1d0'],
  },
  {
    id: 'meadow',
    name: 'Meadow',
    note: 'Sage leads, terracotta answers',
    swatches: ['#728157', '#c67139', '#e1eecc'],
  },
  {
    id: 'dusk',
    name: 'Dusk',
    note: 'Ember on dark bark',
    swatches: ['#f6a06b', '#aebf92', '#474238'],
  },
  {
    id: 'clay',
    name: 'Clay',
    note: 'Kiln reds and warm earth',
    swatches: ['#b2622d', '#728157', '#ffc6a5'],
  },
] as const;

export type SkinId = (typeof SKIN_OPTIONS)[number]['id'];

export interface SkinContextValue {
  skin: SkinId;
  setSkin: (skin: SkinId) => void;
}

export const SkinContext = createContext<SkinContextValue | null>(null);

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && SKIN_OPTIONS.some(({ id }) => id === value);
}

export function useSkin(): SkinContextValue {
  const context = useContext(SkinContext);

  if (!context) {
    throw new Error('useSkin must be used inside SkinProvider');
  }

  return context;
}

function readTokens<const Names extends readonly string[]>(names: Names): Record<Names[number], string> {
  if (typeof document === 'undefined') {
    return Object.fromEntries(names.map((name) => [name, ''])) as Record<Names[number], string>;
  }

  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    names.map((name) => [name, styles.getPropertyValue(name).trim()]),
  ) as Record<Names[number], string>;
}

function subscribeToSkin(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });
  return () => observer.disconnect();
}

function getSkinSnapshot() {
  return document.documentElement.dataset.skin ?? 'harvest';
}

function getServerSkinSnapshot() {
  return 'harvest';
}

export function useSkinTokens<const Names extends readonly string[]>(
  names: Names,
): Record<Names[number], string> {
  const skinVersion = useSyncExternalStore(
    subscribeToSkin,
    getSkinSnapshot,
    getServerSkinSnapshot,
  );

  return useMemo(() => {
    // The root attribute is the external version for the computed CSS values.
    void skinVersion;
    return readTokens(names);
  }, [names, skinVersion]);
}

function relativeLuminance(hex: string): number | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const digits = m[1].length === 3 ? [...m[1]].map((d) => d + d).join('') : m[1];
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(digits.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Which half of the fixed `--t-on-light` / `--t-on-dark` pair reads best on a
 * resolved token colour, for surfaces whose fill is picked at runtime (e.g. a
 * per-symbol palette). Pass a value from `useSkinTokens`.
 */
export function inkOn(color: string): '--t-on-light' | '--t-on-dark' {
  const lum = relativeLuminance(color);
  if (lum === null) return '--t-on-light';
  // Contrast against #201e1d (L≈0.013) vs #f9f4ed (L≈0.90).
  return (lum + 0.05) / 0.063 >= 0.95 / (lum + 0.05) ? '--t-on-light' : '--t-on-dark';
}
