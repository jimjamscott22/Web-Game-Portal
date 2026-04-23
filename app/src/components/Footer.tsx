import { Link } from 'react-router';
import { NAV_GAMES } from '@/types';

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-20 pt-16 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-0 mb-3">
              <span className="font-pixel text-xl font-bold text-white">PIXEL</span>
              <span className="font-pixel text-xl font-bold text-accent">PLAY</span>
            </div>
            <p className="font-body text-sm text-[#888888]">
              A casual gaming hub for everyone.
            </p>
          </div>

          <div>
            <h4 className="font-pixel text-base text-white mb-4">Games</h4>
            <ul className="space-y-2">
              {NAV_GAMES.map((game) => (
                <li key={game.id}>
                  <Link
                    to={game.route}
                    className="font-body text-sm text-[#888888] hover:text-white transition-colors duration-200"
                  >
                    {game.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-pixel text-base text-white mb-4">How to Play</h4>
            <p className="font-body text-sm text-[#888888] leading-relaxed">
              Select a game from above to start playing. Each game has its own rules — just dive in and have fun!
            </p>
          </div>
        </div>

        <div className="border-t border-[#333333] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-[#666666]">
            &copy; 2025 PixelPlay. Built for fun.
          </p>
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#555555] flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full border border-[#555555]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
