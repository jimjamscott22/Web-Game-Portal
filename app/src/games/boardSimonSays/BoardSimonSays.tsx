import { useCallback, useEffect, useRef, useState } from 'react';
import { appendStep, compareInput, playbackAt, SIMON_CONFIG, type Difficulty, type SimonPhase } from './gameLogic';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSkinTokens } from '@/theme/tokens';

// Panels are ramp steps of the two accents; the flash state is one step
// lighter rather than white.
const PANEL_TOKENS = ['--t-p2', '--t-p5', '--t-p3', '--t-p6', '--t-p1', '--t-p4'] as const;
const FLASH_TOKENS = ['--t-p1', '--t-p4', '--t-p2', '--t-p5', '--t-accent-soft', '--t-second-soft'] as const;
const CANVAS_TOKENS = [...PANEL_TOKENS, ...FLASH_TOKENS, '--t-board', '--t-on-light', '--t-on-dark'] as const;

// One tone per panel (the classic Simon four, plus two for the six-panel
// board) and a low buzz for a wrong press.
const PANEL_HZ = [329.63, 277.18, 440, 164.81, 392, 220] as const;
const BUZZ_HZ = 92;

/** Lazily-created Web Audio beeper; the context is only made on first use. */
function useTones(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => { void ctxRef.current?.close(); }, []);
  return useCallback((hz: number, ms: number, type: OscillatorType = 'triangle') => {
    if (!enabled) return;
    const ctx = ctxRef.current ?? (ctxRef.current = new AudioContext());
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    const t = ctx.currentTime; const end = t + ms / 1000;
    osc.type = type; osc.frequency.value = hz;
    // Short attack/release ramps so the beep doesn't click.
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    gain.gain.setValueAtTime(0.18, Math.max(t + 0.01, end - 0.04));
    gain.gain.linearRampToValueAtTime(0, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(end);
  }, [enabled]);
}

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
  const [sound, setSound] = useLocalStorage('pixelplay-simon-says-sound', false); const tone = useTones(sound);
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
      // The lit panel sinks slightly, like a pressed button.
      const inset = isActive ? Math.min(w, h) * 0.04 : 0;
      const x = gap + (i % cols) * (w + gap) + inset, y = gap + Math.floor(i / cols) * (h + gap) + inset;
      const pw = w - inset * 2, ph = h - inset * 2;
      ctx.shadowColor = isActive ? color : 'transparent';
      ctx.shadowBlur = isActive ? 28 : 0;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 16); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = inkOn(color, tokens);
      ctx.font = `bold ${isActive ? 21 : 22}px 'Pixelify Sans', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), x + pw / 2, y + ph / 2);
    }
  }, [active, config.panels, tokens]);
  // Simon's own playback tones; player presses sound from `press` below.
  useEffect(() => { if (phase === 'playback' && active !== null) tone(PANEL_HZ[active], config.flashMs); }, [active, phase, tone, config.flashMs]);

  const press = useCallback((panel: number) => { if (phase === 'idle') return beginRound(appendStep([], config.panels)); if (phase !== 'input') return; setActive(panel); window.setTimeout(() => setActive(null), 140); input.current = [...input.current, panel]; const result = compareInput(sequence.current, input.current); if (result === 'wrong') tone(BUZZ_HZ, 420, 'sawtooth'); else tone(PANEL_HZ[panel], 160); if (result === 'wrong') { setPhase('gameover'); onGameOver(Math.max(0, sequence.current.length - 1)); } else if (result === 'correct') { const round = sequence.current.length; onRound(round); window.setTimeout(() => beginRound(appendStep(sequence.current, config.panels)), 500); } }, [beginRound, config.panels, onGameOver, onRound, phase, tone]);
  const keys: Record<string, () => void> = {}; for (let i = 0; i < config.panels; i++) keys[String(i + 1)] = () => press(i); keys.enter = () => press(0); useKeyboard(keys, [press, config.panels]);
  const pointer = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const cols = config.panels === 6 ? 3 : 2; const col = Math.floor((event.clientX - rect.left) / (rect.width / cols)); const rows = Math.ceil(config.panels / cols); const row = Math.floor((event.clientY - rect.top) / (rect.height / rows)); const panel = row * cols + col; if (panel < config.panels) press(panel); };
  return <div className="relative max-w-[500px] mx-auto"><canvas ref={canvasRef} onPointerDown={pointer} className="w-full aspect-square bg-board rounded-card touch-manipulation cursor-pointer" aria-label="Simon Says board" /><p className="mt-3 text-center font-body text-base text-muted-foreground">{phase === 'idle' ? 'Tap a panel or press Enter to start' : phase === 'playback' ? 'Watch the sequence…' : phase === 'input' ? 'Your turn' : 'Sequence missed'}</p><div className="mt-2 flex justify-center"><button type="button" onClick={() => setSound(on => !on)} aria-pressed={sound} className={`font-body text-[13px] px-4 py-2 rounded-pill transition-colors ${sound ? 'bg-accent text-accent-foreground font-semibold' : 'border border-line text-muted-foreground hover:bg-panel'}`}>Sound {sound ? 'on' : 'off'}</button></div></div>;
}
