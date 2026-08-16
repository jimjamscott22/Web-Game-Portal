import { useMemo } from 'react';

// Organic ground: soft drifting discs, no hard-edged squares or plus signs.
const TOKENS = ['--t-accent', '--t-second', '--t-accent-soft', '--t-second-soft', '--t-accent-deep'];
const COLORS = TOKENS.map((token) => `color-mix(in srgb, var(${token}) 12%, transparent)`);

export default function FloatingBackground() {
  const elements = useMemo(() => {
    return Array.from({ length: 9 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      size: 90 + Math.random() * 190,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
      rotateDuration: 10 + Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-float-drift"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            width: el.size,
            height: el.size,
            animationDuration: `${el.duration}s`,
            animationDelay: `${el.delay}s`,
          }}
        >
          <div className="w-full h-full rounded-full" style={{ backgroundColor: el.color }} />
        </div>
      ))}
    </div>
  );
}
