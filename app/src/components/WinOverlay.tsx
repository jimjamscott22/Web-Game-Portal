import ConfettiEffect from './ConfettiEffect';
import OverlayDialog from './OverlayDialog';

interface WinOverlayProps {
  title?: string;
  subtitle?: string;
  score?: number | string;
  best?: number | string;
  onKeepGoing?: () => void;
  onNewGame: () => void;
}

export default function WinOverlay({
  title = 'You win!',
  subtitle,
  score,
  best,
  onKeepGoing,
  onNewGame,
}: WinOverlayProps) {
  return (
    <>
      <ConfettiEffect active={true} />
      <OverlayDialog icon="★" title={title} subtitle={subtitle} score={score} best={best}>
        {onKeepGoing && (
          <button
            className="btn btn-primary justify-center px-6 py-3 text-base"
            onClick={onKeepGoing}
          >
            Keep going
          </button>
        )}
        <button
          className={`btn justify-center px-6 py-3 text-base ${onKeepGoing ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onNewGame}
        >
          New game
        </button>
      </OverlayDialog>
    </>
  );
}
