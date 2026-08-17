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
