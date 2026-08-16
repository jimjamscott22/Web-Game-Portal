import { ArrowRight } from 'lucide-react';
import { GAMES } from '@/types';

interface GameCardProps {
  gameId: string;
  onNavigate: (route: string, color: string) => void;
}

export default function GameCard({ gameId, onNavigate }: GameCardProps) {
  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return null;

  return (
    <button
      onClick={() => onNavigate(game.route, game.color)}
      className="group w-full max-w-[352px] rounded-card border border-line bg-surface shadow-card hover:shadow-card-hover hover:-translate-y-1 active:shadow-card-active active:translate-y-0.5 card-bounce overflow-hidden flex flex-col text-left cursor-pointer"
    >
      <div
        className="h-[186px] flex items-center justify-center p-5 overflow-hidden"
        style={{ backgroundColor: game.bgColor }}
      >
        <img
          src={game.previewImage}
          alt={game.title}
          className="washed max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-[22px] pt-5 flex flex-col gap-2.5 flex-1">
        <h3 className="font-display text-[26px] text-ink leading-tight">{game.title}</h3>

        <p className="font-body text-sm leading-[1.55] text-muted-foreground flex-1 line-clamp-3">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {game.difficulties.map((diff) => {
            const isDefault = diff === game.defaultDifficulty;
            return (
              <span
                key={diff}
                className={`tag px-3 py-1.5 ${isDefault ? 'font-semibold text-ink' : 'tag-outline font-medium'}`}
                style={
                  isDefault
                    ? { background: `color-mix(in srgb, ${game.color} 26%, transparent)` }
                    : undefined
                }
              >
                {diff}
              </span>
            );
          })}
        </div>

        <div className="mt-1 flex items-center justify-between">
          <span className="btn btn-primary text-[15px] px-[22px] py-2.5">
            Play
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
