import { useCallback, useEffect, useRef, useState } from 'react';
import { appendStep, compareInput, playbackAt, SIMON_CONFIG, type Difficulty, type SimonPhase } from './gameLogic';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSkinTokens } from '@/theme/tokens';

// Panels are ramp steps of the two accents; the flash state is one step
// lighter rather than white.
const PANEL_TOKENS = ['--t-p2', '--t-p5', '--t-p3', '--t-p6', '--t-p1', '--t-p4'] as const;
const FLASH_TOKENS = ['--t-p1', '--t-p4', '--t-p2', '--t-p5', '--t-accent-soft', '--t-second-soft'] as const;
const CANVAS_TOKENS = [...PANEL_TOKENS, ...FLASH_TOKENS, '--t-board', '--t-on-light', '--t-on-dark'] as const;

/** Pick the readable neutral for a panel fill. */
function inkOn(color: string, tokens: Record<string, string>): string {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return tokens['--t-on-light'];
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? tokens['--t-on-light'] : tokens['--t-on-dark'];
}

export default function BoardSimonSays({ difficulty, resetKey, onRound, onGameOver }: { difficulty: Difficulty; resetKey: number; onRound: (round: number) => void; onGameOver: (round: number) => void }) {
  const tokens = useSkinTokens(CANVAS_TOKENS);
  const canvasRef = useRef<HTMLCanvasElement>(null); const elapsed = useRef(0); const sequence = useRef<number[]>([]); const input = useRef<number[]>([]); const [phase, setPhase] = useState<SimonPhase>('idle'); const [active, setActive] = useState<number | null>(null); const config = SIMON_CONFIG[difficulty];
  const beginRound = useCallback((next: number[]) => { sequence.current = next; input.current = []; elapsed.current = 0; setPhase('playback'); }, []);
  void resetKey;
  useGameLoop(delta => { if (phase !== 'playback') return; elapsed.current += delta; const status = playbackAt(sequence.current, elapsed.current, config.flashMs, config.pauseMs); setActive(status.active); if (status.complete) { setActive(null); setPhase('input'); } }, phase === 'playback');
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const ratio = devicePixelRatio || 1; const size = canvas.clientWidth;
    canvas.width = size * ratio; canvas.height = size * ratio; ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, size, size);
    const cols = config.panels === 6 ? 3 : 2;
    const rows = Math.ceil(config.panels / cols);
    const gap = 12;
    const w = (size - gap * (cols + 1)) / cols;
    const h = (size - gap * (rows + 1)) / rows;
    for (let i = 0; i < config.panels; i++) {
      const isActive = active === i;
      const color = tokens[isActive ? FLASH_TOKENS[i] : PANEL_TOKENS[i]];
      const x = gap + (i % cols) * (w + gap), y = gap + Math.floor(i / cols) * (h + gap);
      ctx.shadowColor = isActive ? color : 'transparent';
      ctx.shadowBlur = isActive ? 28 : 0;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = inkOn(color, tokens);
      ctx.font = "bold 22px 'Pixelify Sans', monospace";
      ctx.fillText(String(i + 1), x + 14, y + 32);
    }
  }, [active, config.panels, tokens]);

  const press = useCallback((panel: number) => { if (phase === 'idle') return beginRound(appendStep([], config.panels)); if (phase !== 'input') return; setActive(panel); window.setTimeout(() => setActive(null), 140); input.current = [...input.current, panel]; const result = compareInput(sequence.current, input.current); if (result === 'wrong') { setPhase('gameover'); onGameOver(Math.max(0, sequence.current.length - 1)); } else if (result === 'correct') { const round = sequence.current.length; onRound(round); window.setTimeout(() => beginRound(appendStep(sequence.current, config.panels)), 500); } }, [beginRound, config.panels, onGameOver, onRound, phase]);
  const keys: Record<string, () => void> = {}; for (let i = 0; i < config.panels; i++) keys[String(i + 1)] = () => press(i); keys.enter = () => press(0); useKeyboard(keys, [press, config.panels]);
  const pointer = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const cols = config.panels === 6 ? 3 : 2; const col = Math.floor((event.clientX - rect.left) / (rect.width / cols)); const rows = Math.ceil(config.panels / cols); const row = Math.floor((event.clientY - rect.top) / (rect.height / rows)); const panel = row * cols + col; if (panel < config.panels) press(panel); };
  return <div className="relative max-w-[500px] mx-auto"><canvas ref={canvasRef} onPointerDown={pointer} className="w-full aspect-square bg-board rounded-card touch-manipulation cursor-pointer" aria-label="Simon Says board" /><p className="mt-3 text-center font-body text-base text-muted-foreground">{phase === 'idle' ? 'Tap a panel or press Enter to start' : phase === 'playback' ? 'Watch the sequence…' : phase === 'input' ? 'Your turn' : 'Sequence missed'}</p></div>;
}
