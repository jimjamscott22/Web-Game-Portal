import { useCallback, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { isSkinId, SkinContext, type SkinContextValue, type SkinId } from './tokens';

const DEFAULT_SKIN: SkinId = 'harvest';
const STORAGE_KEY = 'pixelplay-skin:v1';

function applySkin(skin: SkinId) {
  document.documentElement.dataset.skin = skin;
}

export function SkinProvider({ children }: { children: ReactNode }) {
  const [storedSkin, setStoredSkin] = useLocalStorage<unknown>(STORAGE_KEY, DEFAULT_SKIN);
  const skin = isSkinId(storedSkin) ? storedSkin : DEFAULT_SKIN;

  useLayoutEffect(() => {
    applySkin(skin);
  }, [skin]);

  const setSkin = useCallback((nextSkin: SkinId) => {
    applySkin(nextSkin);
    setStoredSkin(nextSkin);
  }, [setStoredSkin]);

  const value = useMemo<SkinContextValue>(() => ({ skin, setSkin }), [skin, setSkin]);

  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}
