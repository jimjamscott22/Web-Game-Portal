import PixelButton from './PixelButton';

interface GameOverOverlayProps {
  title?: string;
  subtitle?: string;
  color?: string;
  onTryAgain: () => void;
}

export default function GameOverOverlay({
  title = 'Game Over!',
  subtitle,
  color = '#E66A2C',
  onTryAgain,
}: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 bg-dark/60 flex items-center justify-center z-[100] rounded-2xl">
      <div className="bg-white rounded-card border-[4px] border-dark p-8 text-center shadow-card max-w-xs mx-4 animate-shake">
        <h3 className="font-pixel text-4xl font-bold mb-2" style={{ color }}>
          {title}
        </h3>
        {subtitle && (
          <p className="font-pixel text-xl text-dark mt-2">{subtitle}</p>
        )}
        <div className="mt-6">
          <PixelButton variant="primary" size="sm" onClick={onTryAgain}>
            Try Again
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
