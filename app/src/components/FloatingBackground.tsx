import { useMemo } from 'react';

const SHAPES = ['square', 'circle', 'plus'] as const;
const COLORS = [
  'rgba(252,182,48,0.06)',
  'rgba(140,194,152,0.06)',
  'rgba(138,186,197,0.06)',
  'rgba(247,108,165,0.06)',
  'rgba(230,106,44,0.06)',
];

export default function FloatingBackground() {
  const elements = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      shape: SHAPES[i % SHAPES.length],
      color: COLORS[i % COLORS.length],
      size: 16 + Math.random() * 32,
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
          {el.shape === 'square' && (
            <div
              className="w-full h-full rounded-sm"
              style={{ backgroundColor: el.color }}
            />
          )}
          {el.shape === 'circle' && (
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: el.color }}
            />
          )}
          {el.shape === 'plus' && (
            <div className="w-full h-full relative" style={{ color: el.color }}>
              <div
                className="absolute top-1/2 left-0 right-0 h-[20%] -translate-y-1/2"
                style={{ backgroundColor: el.color }}
              />
              <div
                className="absolute left-1/2 top-0 bottom-0 w-[20%] -translate-x-1/2"
                style={{ backgroundColor: el.color }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
