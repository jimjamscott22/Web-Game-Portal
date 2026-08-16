import OverlayDialog from './OverlayDialog';

interface GameOverOverlayProps {
  title?: string;
  subtitle?: string;
  score?: number | string;
  best?: number | string;
  onTryAgain: () => void;
}

export default function GameOverOverlay({
  title = 'Out of moves',
  subtitle,
  score,
  best,
  onTryAgain,
}: GameOverOverlayProps) {
  return (
    <OverlayDialog
      icon="×"
      title={title}
      subtitle={subtitle}
      score={score}
      best={best}
      className="animate-shake"
    >
      <button className="btn btn-primary justify-center px-6 py-3 text-base" onClick={onTryAgain}>
        Try again
      </button>
    </OverlayDialog>
  );
}
