import PixelButton from './PixelButton';
import ConfettiEffect from './ConfettiEffect';

interface WinOverlayProps {
  title?: string;
  color?: string;
  onKeepGoing: () => void;
  onNewGame: () => void;
}

export default function WinOverlay({
  title = 'You Win!',
  color = '#FCB630',
  onKeepGoing,
  onNewGame,
}: WinOverlayProps) {
  return (
    <>
      <ConfettiEffect active={true} />
      <div className="absolute inset-0 bg-dark/60 flex items-center justify-center z-[100] rounded-2xl">
        <div className="bg-white rounded-card border-[4px] border-dark p-8 text-center shadow-card max-w-xs mx-4">
          <h3 className="font-pixel text-4xl font-bold mb-4" style={{ color }}>
            {title}
          </h3>
          <div className="flex flex-col gap-3 mt-6">
            <PixelButton variant="secondary" size="sm" onClick={onKeepGoing}>
              Keep Going
            </PixelButton>
            <PixelButton variant="primary" size="sm" onClick={onNewGame}>
              New Game
            </PixelButton>
          </div>
        </div>
      </div>
    </>
  );
}
