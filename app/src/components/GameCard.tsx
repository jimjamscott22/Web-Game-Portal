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
      className="group w-full max-w-[360px] h-[420px] rounded-card border-[4px] border-dark overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-2 active:shadow-card-active active:translate-y-1 card-bounce text-left cursor-pointer"
    >
      <div
        className="h-[55%] flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundColor: game.bgColor }}
      >
        <img
          src={game.previewImage}
          alt={game.title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="h-[45%] bg-white p-5 flex flex-col">
        <h3
          className="font-pixel text-[28px] font-semibold leading-tight"
          style={{ color: game.id === 'sudoku' ? '#FFFFFF' : game.color }}
        >
          <span style={{ color: game.color }}>{game.title}</span>
        </h3>

        <p className="font-body text-sm text-[#666666] mt-1 line-clamp-2 flex-1">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {game.difficulties.map((diff) => (
            <span
              key={diff}
              className={`text-[11px] font-body font-medium px-3 py-1 rounded-pill border-[2px] ${
                diff === game.defaultDifficulty
                  ? 'text-white border-dark'
                  : 'text-[#888888] border-[#E5E5E5]'
              }`}
              style={
                diff === game.defaultDifficulty
                  ? { backgroundColor: game.color }
                  : {}
              }
            >
              {diff}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-pixel text-sm font-semibold text-dark bg-dark text-white px-5 py-2 rounded-pill inline-flex items-center gap-2">
            Play
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
