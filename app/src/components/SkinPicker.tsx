import { useEffect, useId, useRef, useState } from 'react';
import { SKIN_OPTIONS, useSkin, type SkinId } from '@/theme/tokens';

export default function SkinPicker() {
  const { skin, setSkin } = useSkin();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const chooseSkin = (nextSkin: SkinId) => {
    setSkin(nextSkin);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-transparent transition-colors hover:bg-panel"
        aria-label="Choose color skin"
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          <span className="h-2.5 w-2.5 rounded-full bg-second" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-soft" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-deep" />
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Color skins"
          className="absolute right-0 top-12 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-line bg-surface p-5 shadow-lift"
        >
          <h2 className="font-display text-xl leading-tight text-ink">Pick a skin</h2>
          <p className="mb-3 mt-1 font-body text-[13px] leading-relaxed text-muted-foreground">
            Changes every game board and page.
          </p>

          <div className="flex flex-col gap-2">
            {SKIN_OPTIONS.map((option) => {
              const selected = option.id === skin;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={`flex w-full items-center gap-3 rounded-pill border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-transparent hover:bg-panel'
                  }`}
                  onClick={() => chooseSkin(option.id)}
                >
                  <span className="flex shrink-0" aria-hidden="true">
                    {option.swatches.map((color, index) => (
                      <span
                        key={color}
                        className={`h-[22px] w-[22px] rounded-full ${index === 0 ? '' : '-ml-[7px]'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[15px] leading-tight text-ink">
                      {option.name}
                    </span>
                    <span className="block truncate font-body text-xs text-muted-foreground">
                      {option.note}
                    </span>
                  </span>
                  <span className="w-4 shrink-0 text-center text-accent" aria-hidden="true">
                    {selected ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
