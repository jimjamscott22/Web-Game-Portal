import { Link } from 'react-router';
import { NAV_GAMES } from '@/types';

export default function Footer() {
  return (
    <footer className="bg-panel text-ink border-t border-line">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-full bg-accent flex items-center justify-center font-pixel text-sm text-accent-foreground">
                P
              </span>
              <span className="font-display text-xl text-ink">Pixelplay</span>
            </div>
            <p className="font-body text-sm text-muted-foreground">
              A casual gaming hub for everyone.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-ink mb-4">Games</h4>
            <ul className="space-y-2">
              {NAV_GAMES.map((game) => (
                <li key={game.id}>
                  <Link
                    to={game.route}
                    className="font-body text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {game.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-ink mb-4">How to play</h4>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              Select a game from above to start playing. Each game has its own rules — just dive in and have fun!
            </p>
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            &copy; 2025 PixelPlay. Built for fun.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent" />
            <span className="w-3 h-3 rounded-full bg-second" />
            <span className="w-3 h-3 rounded-full bg-accent-soft" />
          </div>
        </div>
      </div>
    </footer>
  );
}
